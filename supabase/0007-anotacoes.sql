-- Terras de Mitrael · As anotações
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Pode rodar de novo sem estragar nada.
--
-- O caderno de cada um: anotações com título e texto. Por padrão só o dono
-- lê. Marcando "da mesa", todos com conta leem (mas só o dono muda ou
-- apaga). O Mestre não lê as anotações particulares de ninguém.

create table if not exists public.anotacoes (
  id bigint generated always as identity primary key,
  dono uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  autor text not null default '',
  titulo text not null default '' check (char_length(titulo) <= 120),
  texto text not null default '' check (char_length(texto) <= 20000),
  da_mesa boolean not null default false,
  criada_em timestamptz not null default now(),
  mudada_em timestamptz not null default now()
);

create index if not exists anotacoes_dono on public.anotacoes (dono);

alter table public.anotacoes enable row level security;

drop policy if exists "cada um lê as suas, todos leem as da mesa" on public.anotacoes;
create policy "cada um lê as suas, todos leem as da mesa"
  on public.anotacoes for select to authenticated
  using (dono = (select auth.uid()) or da_mesa);

drop policy if exists "cada um escreve as suas" on public.anotacoes;
create policy "cada um escreve as suas"
  on public.anotacoes for insert to authenticated
  with check (dono = (select auth.uid()));

drop policy if exists "cada um muda as suas" on public.anotacoes;
create policy "cada um muda as suas"
  on public.anotacoes for update to authenticated
  using (dono = (select auth.uid()))
  with check (dono = (select auth.uid()));

drop policy if exists "cada um apaga as suas" on public.anotacoes;
create policy "cada um apaga as suas"
  on public.anotacoes for delete to authenticated
  using (dono = (select auth.uid()));

revoke all on public.anotacoes from anon, authenticated;
grant select, delete on public.anotacoes to authenticated;
grant insert (titulo, texto, da_mesa) on public.anotacoes to authenticated;
grant update (titulo, texto, da_mesa) on public.anotacoes to authenticated;

-- O dono e o nome do autor vêm da conta, nunca do navegador; a data da
-- última mudança se acerta sozinha.
create or replace function public.carimbar_anotacao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.dono := (select auth.uid());
    new.autor := coalesce((select p.nome from public.perfis p where p.id = new.dono), '');
    new.criada_em := now();
  else
    new.dono := old.dono;
    new.autor := old.autor;
    new.criada_em := old.criada_em;
  end if;
  new.mudada_em := now();
  return new;
end;
$$;

drop trigger if exists carimbar_anotacao on public.anotacoes;
create trigger carimbar_anotacao
  before insert or update on public.anotacoes
  for each row execute function public.carimbar_anotacao();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'anotacoes'
  ) then
    alter publication supabase_realtime add table public.anotacoes;
  end if;
end;
$$;
