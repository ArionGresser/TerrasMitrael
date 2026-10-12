-- Terras de Mitrael · Fase 2: a ficha viva e os pedidos ao Mestre
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Rodar uma vez só, depois do 0001-contas.sql.
--
-- A ficha do site (o arquivo do personagem) continua sendo a base: classe,
-- atributos, PV máximo, espaços de magia por círculo. Aqui mora só o que
-- muda durante o jogo: os PV de agora, o que foi gasto, o que está na
-- mochila e na bolsa.
--
-- O jogador mexe nos PV, nos espaços de magia, nos Dados de Vida e gasta a
-- Inspiração Heroica. Tirar item e gastar moeda ele também pode. Pôr item
-- ou moeda, não: isso só acontece pelo pedido que o Mestre aprova.


-- ---------- Quem pode mexer numa ficha ----------

-- O Mestre, ou a conta ligada àquele personagem.
create function public.pode_mexer(p_personagem text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.eh_mestre() or exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and personagem = p_personagem
  );
$$;


-- ---------- A ficha viva ----------

create table public.fichas (
  personagem text primary key check (personagem ~ '^[a-z0-9-]{2,60}$'),
  pv integer not null check (pv >= 0),
  pv_temporarios integer not null default 0 check (pv_temporarios >= 0),
  dados_de_vida_gastos integer not null default 0 check (dados_de_vida_gastos >= 0),
  -- Quantos espaços de cada círculo já foram gastos: {"1": 1, "2": 0}
  espacos_gastos jsonb not null default '{}'::jsonb,
  inspiracao boolean not null default false,
  -- [{"id": "...", "nome": "Corda de cânhamo, 15 m", "quantidade": 1}]
  inventario jsonb not null default '[]'::jsonb check (jsonb_typeof(inventario) = 'array'),
  -- {"pc": 0, "pp": 15, "ce": 0, "po": 3, "pl": 0}
  moedas jsonb not null default '{}'::jsonb check (jsonb_typeof(moedas) = 'object'),
  atualizada_em timestamptz not null default now()
);

alter table public.fichas enable row level security;

create policy "o dono e o Mestre veem a ficha"
  on public.fichas for select to authenticated
  using ((select public.pode_mexer(personagem)));

create policy "o dono e o Mestre mudam a ficha"
  on public.fichas for update to authenticated
  using ((select public.pode_mexer(personagem)))
  with check ((select public.pode_mexer(personagem)));

revoke all on public.fichas from anon, authenticated;
grant select on public.fichas to authenticated;
-- Mochila e bolsa ficam de fora: só pelas funções abaixo
grant update (pv, pv_temporarios, dados_de_vida_gastos, espacos_gastos, inspiracao, atualizada_em)
  on public.fichas to authenticated;

-- A Inspiração Heroica o jogador só gasta. Quem dá é o Mestre.
create function public.conferir_inspiracao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.inspiracao and not old.inspiracao and not public.eh_mestre() then
    raise exception 'Só o Mestre dá Inspiração Heroica.';
  end if;
  new.atualizada_em := now();
  return new;
end;
$$;

create trigger antes_de_mudar_a_ficha
  before update on public.fichas
  for each row execute function public.conferir_inspiracao();

-- O Mestre abre a ficha viva de um personagem, com os valores do site.
create function public.criar_ficha(
  p_personagem text,
  p_pv integer,
  p_pv_temporarios integer,
  p_inventario jsonb,
  p_moedas jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then
    raise exception 'Só o Mestre abre fichas.';
  end if;
  insert into public.fichas (personagem, pv, pv_temporarios, inventario, moedas)
  values (p_personagem, p_pv, p_pv_temporarios, p_inventario, p_moedas)
  on conflict (personagem) do nothing;
end;
$$;

-- Tira um item da mochila (ou só parte da pilha, como 1 de 3 rações).
create function public.tirar_item(p_personagem text, p_item text, p_quantidade integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.pode_mexer(p_personagem) then
    raise exception 'Essa ficha não é sua.';
  end if;
  if p_quantidade < 1 then
    raise exception 'Quantidade inválida.';
  end if;
  update public.fichas
    set inventario = coalesce((
      select jsonb_agg(
        case when elem ->> 'id' = p_item
          then jsonb_set(elem, '{quantidade}', to_jsonb((elem ->> 'quantidade')::integer - p_quantidade))
          else elem
        end
      )
      from jsonb_array_elements(inventario) as elem
      where not (elem ->> 'id' = p_item and (elem ->> 'quantidade')::integer <= p_quantidade)
    ), '[]'::jsonb)
    where personagem = p_personagem;
end;
$$;

-- Gasta moedas da bolsa: {"po": 2}. Não deixa ficar negativo.
create function public.gastar_moedas(p_personagem text, p_moedas jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  atual jsonb;
  tipo text;
  resto integer;
begin
  if not public.pode_mexer(p_personagem) then
    raise exception 'Essa ficha não é sua.';
  end if;
  select moedas into atual from public.fichas where personagem = p_personagem for update;
  for tipo in select jsonb_object_keys(p_moedas) loop
    if tipo not in ('pc', 'pp', 'ce', 'po', 'pl') or (p_moedas ->> tipo)::integer < 0 then
      raise exception 'Moeda inválida.';
    end if;
    resto := coalesce((atual ->> tipo)::integer, 0) - (p_moedas ->> tipo)::integer;
    if resto < 0 then
      raise exception 'Não há moedas suficientes.';
    end if;
    atual := jsonb_set(atual, array[tipo], to_jsonb(resto));
  end loop;
  update public.fichas set moedas = atual where personagem = p_personagem;
end;
$$;


-- ---------- Os pedidos ao Mestre ----------

create table public.pedidos (
  id bigint generated always as identity primary key,
  personagem text not null references public.fichas (personagem) on delete cascade,
  conta uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  tipo text not null check (tipo in ('item', 'moedas')),
  item text check (char_length(item) between 1 and 80),
  quantidade integer check (quantidade between 1 and 999),
  moedas jsonb check (moedas is null or jsonb_typeof(moedas) = 'object'),
  motivo text check (char_length(motivo) <= 300),
  estado text not null default 'pendente' check (estado in ('pendente', 'aprovado', 'recusado')),
  resposta text check (char_length(resposta) <= 300),
  criado_em timestamptz not null default now(),
  resolvido_em timestamptz,
  check ((tipo = 'item' and item is not null and quantidade is not null) or (tipo = 'moedas' and moedas is not null))
);

alter table public.pedidos enable row level security;

create policy "o dono e o Mestre veem os pedidos"
  on public.pedidos for select to authenticated
  using ((select public.pode_mexer(personagem)));

create policy "o dono faz pedidos para a própria ficha"
  on public.pedidos for insert to authenticated
  with check (conta = (select auth.uid()) and estado = 'pendente' and (select public.pode_mexer(personagem)));

create policy "o dono desiste de um pedido que ainda espera"
  on public.pedidos for delete to authenticated
  using (conta = (select auth.uid()) and estado = 'pendente');

revoke all on public.pedidos from anon, authenticated;
grant select, delete on public.pedidos to authenticated;
grant insert (personagem, tipo, item, quantidade, moedas, motivo) on public.pedidos to authenticated;

-- O Mestre aprova (e o item ou a moeda entra na ficha) ou recusa.
create function public.resolver_pedido(p_id bigint, p_aprovar boolean, p_resposta text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.pedidos;
  atual jsonb;
  tipo text;
begin
  if not public.eh_mestre() then
    raise exception 'Só o Mestre resolve pedidos.';
  end if;
  select * into p from public.pedidos where id = p_id and estado = 'pendente' for update;
  if not found then
    raise exception 'Esse pedido já foi resolvido.';
  end if;

  if p_aprovar and p.tipo = 'item' then
    update public.fichas
      set inventario = inventario || jsonb_build_array(jsonb_build_object(
        'id', gen_random_uuid()::text, 'nome', p.item, 'quantidade', p.quantidade))
      where personagem = p.personagem;
  elsif p_aprovar and p.tipo = 'moedas' then
    select moedas into atual from public.fichas where personagem = p.personagem for update;
    for tipo in select jsonb_object_keys(p.moedas) loop
      if tipo in ('pc', 'pp', 'ce', 'po', 'pl') then
        atual := jsonb_set(atual, array[tipo],
          to_jsonb(coalesce((atual ->> tipo)::integer, 0) + greatest((p.moedas ->> tipo)::integer, 0)));
      end if;
    end loop;
    update public.fichas set moedas = atual where personagem = p.personagem;
  end if;

  update public.pedidos
    set estado = case when p_aprovar then 'aprovado' else 'recusado' end,
        resposta = nullif(trim(p_resposta), ''),
        resolvido_em = now()
    where id = p_id;
end;
$$;

revoke execute on function public.pode_mexer(text) from public, anon;
revoke execute on function public.conferir_inspiracao() from public, anon, authenticated;
revoke execute on function public.criar_ficha(text, integer, integer, jsonb, jsonb) from public, anon;
revoke execute on function public.tirar_item(text, text, integer) from public, anon;
revoke execute on function public.gastar_moedas(text, jsonb) from public, anon;
revoke execute on function public.resolver_pedido(bigint, boolean, text) from public, anon;
grant execute on function public.pode_mexer(text) to authenticated;
grant execute on function public.criar_ficha(text, integer, integer, jsonb, jsonb) to authenticated;
grant execute on function public.tirar_item(text, text, integer) to authenticated;
grant execute on function public.gastar_moedas(text, jsonb) to authenticated;
grant execute on function public.resolver_pedido(bigint, boolean, text) to authenticated;
