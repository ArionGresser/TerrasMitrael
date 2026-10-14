-- Terras de Mitrael · As sessões
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Pode rodar de novo sem estragar nada.
--
-- Uma linha por dia de jogo: quem veio, um título e as anotações do Mestre
-- sobre o que aconteceu (para escrever as Crônicas depois). Os combates do
-- dia saem da tabela de combates, pela data. Só o Mestre vê e mexe.

create table if not exists public.sessoes (
  id bigint generated always as identity primary key,
  dia date not null unique,
  titulo text not null default '' check (char_length(titulo) <= 120),
  presentes text[] not null default '{}',
  notas text not null default '' check (char_length(notas) <= 40000),
  criada_em timestamptz not null default now(),
  mudada_em timestamptz not null default now()
);

alter table public.sessoes enable row level security;

drop policy if exists "só o Mestre" on public.sessoes;
create policy "só o Mestre"
  on public.sessoes for all to authenticated
  using ((select public.eh_mestre()))
  with check ((select public.eh_mestre()));

revoke all on public.sessoes from anon, authenticated;
grant select, insert, update, delete on public.sessoes to authenticated;
