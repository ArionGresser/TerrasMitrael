-- Terras de Mitrael · O mapa da mesa
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Pode rodar de novo sem estragar nada. Depois do 0005-arena.sql.
--
-- As marcas que o Mestre põe no mapa de Mitrael: onde o grupo está (cada
-- posição fica guardada, e a sequência vira a trilha de por onde eles
-- andaram), os objetivos, o caminho planejado e notas. Todos com conta veem;
-- só o Mestre mexe. As posições são frações do mapa (0 a 1).

create table if not exists public.marcas_do_mapa (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('grupo', 'objetivo', 'caminho', 'nota')),
  x numeric not null check (x between 0 and 1),
  y numeric not null check (y between 0 and 1),
  texto text check (char_length(texto) <= 120),
  criado_em timestamptz not null default now()
);

alter table public.marcas_do_mapa enable row level security;

drop policy if exists "todos com conta veem o mapa" on public.marcas_do_mapa;
create policy "todos com conta veem o mapa"
  on public.marcas_do_mapa for select to authenticated
  using (true);

drop policy if exists "o Mestre marca" on public.marcas_do_mapa;
create policy "o Mestre marca"
  on public.marcas_do_mapa for insert to authenticated
  with check ((select public.eh_mestre()));

drop policy if exists "o Mestre muda" on public.marcas_do_mapa;
create policy "o Mestre muda"
  on public.marcas_do_mapa for update to authenticated
  using ((select public.eh_mestre()))
  with check ((select public.eh_mestre()));

drop policy if exists "o Mestre apaga" on public.marcas_do_mapa;
create policy "o Mestre apaga"
  on public.marcas_do_mapa for delete to authenticated
  using ((select public.eh_mestre()));

revoke all on public.marcas_do_mapa from anon, authenticated;
grant select, insert, update, delete on public.marcas_do_mapa to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'marcas_do_mapa'
  ) then
    alter publication supabase_realtime add table public.marcas_do_mapa;
  end if;
end;
$$;
