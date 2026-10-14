-- Terras de Mitrael · A arena viva
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Pode rodar de novo sem estragar nada. Precisa do 0004 e do 0005.
--
-- Duas tabelas:
-- - combate_acoes: o que o jogador faz na vez dele (atacar, tentar sair de
--   uma condição, ajudar um aliado, terminar o turno). Vale na hora: a tela
--   do Mestre aplica e marca como feita.
-- - combate_eventos: cada momento do combate, gravado para ser assistido
--   depois, rodada por rodada. Só leva o que os jogadores podiam ver (sem os
--   PV das criaturas), e qualquer pessoa pode assistir, com conta ou sem.
--
-- Espaço: um combate inteiro dá uns 50 a 150 KB. O plano grátis tem 500 MB.

-- ---------- As ações dos jogadores ----------

create table if not exists public.combate_acoes (
  id bigint generated always as identity primary key,
  combate bigint not null references public.combates (id) on delete cascade,
  personagem text not null,
  conta uuid not null default auth.uid(),
  dados jsonb not null check (jsonb_typeof(dados) = 'object' and pg_column_size(dados) < 4000),
  feita boolean not null default false,
  criada_em timestamptz not null default now()
);

create index if not exists combate_acoes_pendentes on public.combate_acoes (combate) where not feita;

alter table public.combate_acoes enable row level security;

drop policy if exists "o dono e o Mestre veem as ações" on public.combate_acoes;
create policy "o dono e o Mestre veem as ações"
  on public.combate_acoes for select to authenticated
  using ((select public.pode_mexer(personagem)));

-- O jogador só age com o próprio personagem e só no combate que está ativo
drop policy if exists "o jogador age com o próprio personagem" on public.combate_acoes;
create policy "o jogador age com o próprio personagem"
  on public.combate_acoes for insert to authenticated
  with check (
    conta = (select auth.uid())
    and personagem = (select p.personagem from public.perfis p where p.id = (select auth.uid()))
    and exists (select 1 from public.combates c where c.id = combate and c.ativo)
  );

drop policy if exists "o Mestre marca como feita" on public.combate_acoes;
create policy "o Mestre marca como feita"
  on public.combate_acoes for update to authenticated
  using ((select public.eh_mestre()))
  with check ((select public.eh_mestre()));

drop policy if exists "o Mestre apaga ações" on public.combate_acoes;
create policy "o Mestre apaga ações"
  on public.combate_acoes for delete to authenticated
  using ((select public.eh_mestre()));

revoke all on public.combate_acoes from anon, authenticated;
grant select, delete on public.combate_acoes to authenticated;
grant insert (combate, personagem, dados) on public.combate_acoes to authenticated;
grant update (feita) on public.combate_acoes to authenticated;

-- ---------- A gravação ----------

create table if not exists public.combate_eventos (
  combate bigint not null references public.combates (id) on delete cascade,
  seq integer not null check (seq > 0),
  rodada integer not null default 0,
  dados jsonb not null check (jsonb_typeof(dados) = 'object' and pg_column_size(dados) < 20000),
  criado_em timestamptz not null default now(),
  primary key (combate, seq)
);

alter table public.combate_eventos enable row level security;

drop policy if exists "qualquer um assiste" on public.combate_eventos;
create policy "qualquer um assiste"
  on public.combate_eventos for select to anon, authenticated
  using (true);

drop policy if exists "o Mestre grava" on public.combate_eventos;
create policy "o Mestre grava"
  on public.combate_eventos for insert to authenticated
  with check ((select public.eh_mestre()));

drop policy if exists "o Mestre apaga a gravação" on public.combate_eventos;
create policy "o Mestre apaga a gravação"
  on public.combate_eventos for delete to authenticated
  using ((select public.eh_mestre()));

revoke all on public.combate_eventos from anon, authenticated;
grant select on public.combate_eventos to anon, authenticated;
grant insert, delete on public.combate_eventos to authenticated;

-- ---------- Na hora ----------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'combate_acoes'
  ) then
    alter publication supabase_realtime add table public.combate_acoes;
  end if;
end;
$$;
