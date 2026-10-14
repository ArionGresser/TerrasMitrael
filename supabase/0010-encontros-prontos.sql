-- Terras de Mitrael · Encontros prontos
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Pode rodar de novo sem estragar nada.
--
-- Os encontros que o Mestre prepara antes da sessão: as criaturas, o loot
-- (sorteado na hora ou já fixo), como a luta começa e as notas dele. Na
-- sessão é só apertar para começar. Só o Mestre vê e mexe.

create table if not exists public.encontros_prontos (
  id bigint generated always as identity primary key,
  nome text not null check (char_length(nome) between 1 and 80),
  notas text not null default '' check (char_length(notas) <= 4000),
  dados jsonb not null check (jsonb_typeof(dados) = 'object' and pg_column_size(dados) < 60000),
  criado_em timestamptz not null default now(),
  usado_em timestamptz
);

alter table public.encontros_prontos enable row level security;

drop policy if exists "só o Mestre" on public.encontros_prontos;
create policy "só o Mestre"
  on public.encontros_prontos for all to authenticated
  using ((select public.eh_mestre()))
  with check ((select public.eh_mestre()));

revoke all on public.encontros_prontos from anon, authenticated;
grant select, insert, update, delete on public.encontros_prontos to authenticated;
