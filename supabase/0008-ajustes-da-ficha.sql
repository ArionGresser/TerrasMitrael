-- Terras de Mitrael · Ajustes da ficha viva
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Pode rodar de novo sem estragar nada.
--
-- O PV máximo e os valores de atributo mudados na mesa (subida de nível,
-- item mágico, maldição), por cima do que a ficha do site diz:
-- {"pv_maximo": 22, "atributos": {"Força": 17}}. O dono e o Mestre mudam.

alter table public.fichas
  add column if not exists ajustes jsonb not null default '{}'::jsonb;

alter table public.fichas drop constraint if exists ajustes_e_objeto;
alter table public.fichas
  add constraint ajustes_e_objeto check (jsonb_typeof(ajustes) = 'object');

grant update (ajustes) on public.fichas to authenticated;
