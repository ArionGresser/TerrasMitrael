-- Terras de Mitrael · Fase 5 e 6: o combate na mesa
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Rodar uma vez só, depois do 0003-mesa-ao-vivo.sql.
--
-- Um combate tem duas partes:
-- - a da mesa (combates.mesa), que todo jogador com conta vê na hora: a
--   ordem de iniciativa, de quem é a vez e como cada criatura está (Ileso,
--   Ferido, Muito ferido, Caído), sem os números;
-- - a do Mestre (combates_do_mestre), com os PV de verdade das criaturas,
--   que só o Mestre lê.
-- Só existe um combate ativo por vez.

create table public.combates (
  id bigint generated always as identity primary key,
  ativo boolean not null default true,
  mesa jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index um_combate_ativo on public.combates (ativo) where ativo;

alter table public.combates enable row level security;

create policy "todos com conta veem o combate ativo, o Mestre vê todos"
  on public.combates for select to authenticated
  using (ativo or (select public.eh_mestre()));

create policy "o Mestre começa combates"
  on public.combates for insert to authenticated
  with check ((select public.eh_mestre()));

create policy "o Mestre conduz o combate"
  on public.combates for update to authenticated
  using ((select public.eh_mestre()))
  with check ((select public.eh_mestre()));

create policy "o Mestre apaga combates"
  on public.combates for delete to authenticated
  using ((select public.eh_mestre()));

revoke all on public.combates from anon, authenticated;
grant select, insert, update, delete on public.combates to authenticated;


create table public.combates_do_mestre (
  combate bigint primary key references public.combates (id) on delete cascade,
  dados jsonb not null default '{}'::jsonb
);

alter table public.combates_do_mestre enable row level security;

create policy "só o Mestre"
  on public.combates_do_mestre for all to authenticated
  using ((select public.eh_mestre()))
  with check ((select public.eh_mestre()));

revoke all on public.combates_do_mestre from anon, authenticated;
grant select, insert, update, delete on public.combates_do_mestre to authenticated;


alter publication supabase_realtime add table public.combates;
