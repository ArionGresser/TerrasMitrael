-- Terras de Mitrael · A arena do combate
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Rodar uma vez só, depois do 0004-combate.sql.
--
-- O jogador rola a própria iniciativa na arena, e o número chega na hora
-- para o Mestre, que conduz o combate.

create table public.combate_iniciativas (
  combate bigint not null references public.combates (id) on delete cascade,
  personagem text not null,
  valor integer not null check (valor between -10 and 60),
  rolado_em timestamptz not null default now(),
  primary key (combate, personagem)
);

alter table public.combate_iniciativas enable row level security;

create policy "o dono e o Mestre veem a iniciativa"
  on public.combate_iniciativas for select to authenticated
  using ((select public.pode_mexer(personagem)));

revoke all on public.combate_iniciativas from anon, authenticated;
grant select on public.combate_iniciativas to authenticated;

-- O jogador manda a iniciativa do personagem dele, no combate que está ativo.
create function public.rolar_minha_iniciativa(p_valor integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  meu text;
  combate_ativo bigint;
begin
  select personagem into meu from public.perfis where id = (select auth.uid());
  if meu is null then
    raise exception 'A sua conta ainda não está ligada a um personagem.';
  end if;
  select c.id into combate_ativo from public.combates c where c.ativo;
  if combate_ativo is null then
    raise exception 'Não há combate agora.';
  end if;
  insert into public.combate_iniciativas (combate, personagem, valor)
    values (combate_ativo, meu, p_valor)
    on conflict (combate, personagem) do update set valor = excluded.valor, rolado_em = now();
end;
$$;

revoke execute on function public.rolar_minha_iniciativa(integer) from public, anon;
grant execute on function public.rolar_minha_iniciativa(integer) to authenticated;

alter publication supabase_realtime add table public.combate_iniciativas;
