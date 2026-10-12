-- Terras de Mitrael · Fase 3: a mesa ao vivo
--
-- Como usar: no SQL Editor do Supabase, cole este arquivo inteiro e clique
-- em Run. Rodar uma vez só, depois do 0002-fichas.sql.
--
-- O que entra:
-- - o Mestre põe e tira itens, mexe nas moedas, dá XP, PV e Inspiração;
-- - cada coisa que o Mestre faz vira um aviso na tela do jogador;
-- - fichas, pedidos e avisos chegam na hora (Realtime), sem recarregar;
-- - a caixa de sugestões.


-- ---------- XP ganho na mesa ----------
-- O XP da ficha do site é a base; aqui soma o que foi ganho jogando.

alter table public.fichas
  add column experiencia_ganha integer not null default 0 check (experiencia_ganha >= 0);


-- ---------- Avisos para o jogador ----------

create table public.avisos (
  id bigint generated always as identity primary key,
  personagem text not null references public.fichas (personagem) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 300),
  criado_em timestamptz not null default now()
);

alter table public.avisos enable row level security;

create policy "o dono e o Mestre veem os avisos"
  on public.avisos for select to authenticated
  using ((select public.pode_mexer(personagem)));

revoke all on public.avisos from anon, authenticated;
grant select on public.avisos to authenticated;

-- Só as funções daqui escrevem aviso (não é liberada para ninguém chamar)
create function public.avisar(p_personagem text, p_texto text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.avisos (personagem, texto) values (p_personagem, left(p_texto, 300));
$$;


-- ---------- Mochila e bolsa, por dentro ----------

-- Põe um item; se já houver um com o mesmo nome, soma na pilha.
create function public.acrescentar_item(p_personagem text, p_nome text, p_quantidade integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(trim(p_nome)) not between 1 and 80 or p_quantidade not between 1 and 999 then
    raise exception 'Item ou quantidade inválidos.';
  end if;
  update public.fichas f
    set inventario = case
      when exists (
        select 1 from jsonb_array_elements(f.inventario) e where lower(e ->> 'nome') = lower(trim(p_nome))
      ) then (
        select jsonb_agg(
          case when lower(e ->> 'nome') = lower(trim(p_nome))
            then jsonb_set(e, '{quantidade}', to_jsonb((e ->> 'quantidade')::integer + p_quantidade))
            else e
          end
        )
        from jsonb_array_elements(f.inventario) e
      )
      else f.inventario || jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'nome', trim(p_nome), 'quantidade', p_quantidade))
    end
    where f.personagem = p_personagem;
end;
$$;

-- Soma (ou tira, com número negativo) moedas. Não deixa ficar negativo.
create function public.somar_moedas(p_personagem text, p_moedas jsonb)
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
  select moedas into atual from public.fichas where personagem = p_personagem for update;
  for tipo in select jsonb_object_keys(p_moedas) loop
    if tipo not in ('pc', 'pp', 'ce', 'po', 'pl') then
      raise exception 'Moeda inválida.';
    end if;
    resto := coalesce((atual ->> tipo)::integer, 0) + (p_moedas ->> tipo)::integer;
    if resto < 0 then
      raise exception 'Não há moedas suficientes para tirar.';
    end if;
    atual := jsonb_set(atual, array[tipo], to_jsonb(resto));
  end loop;
  update public.fichas set moedas = atual where personagem = p_personagem;
end;
$$;

-- "+50 PO, -2 PP", para os avisos
create function public.moedas_em_texto(p_moedas jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(string_agg(
    case when (valor)::integer > 0 then '+' else '' end || valor || ' ' || upper(chave), ', '
    order by array_position(array['pc', 'pp', 'ce', 'po', 'pl'], chave)), '')
  from jsonb_each_text(p_moedas) as m(chave, valor)
  where (valor)::integer <> 0;
$$;


-- ---------- As mãos do Mestre ----------

create function public.mestre_dar_item(p_personagem text, p_nome text, p_quantidade integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then raise exception 'Só o Mestre.'; end if;
  perform public.acrescentar_item(p_personagem, p_nome, p_quantidade);
  perform public.avisar(p_personagem,
    'O Mestre pôs na sua mochila: ' || p_quantidade || '× ' || trim(p_nome) || '.');
end;
$$;

create function public.mestre_moedas(p_personagem text, p_moedas jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then raise exception 'Só o Mestre.'; end if;
  perform public.somar_moedas(p_personagem, p_moedas);
  perform public.avisar(p_personagem, 'O Mestre mexeu na sua bolsa: ' || public.moedas_em_texto(p_moedas) || '.');
end;
$$;

create function public.mestre_xp(p_personagem text, p_xp integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then raise exception 'Só o Mestre.'; end if;
  update public.fichas
    set experiencia_ganha = greatest(0, experiencia_ganha + p_xp)
    where personagem = p_personagem;
  perform public.avisar(p_personagem,
    case when p_xp >= 0 then 'Você ganhou ' || p_xp || ' XP.' else 'O Mestre tirou ' || abs(p_xp) || ' XP.' end);
end;
$$;

-- Dano (número negativo) ou cura (positivo). O dano tira antes dos PV
-- temporários. O máximo vem da ficha do site, então o painel manda junto.
create function public.mestre_pv(p_personagem text, p_delta integer, p_pv_maximo integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  f public.fichas;
  dos_temporarios integer;
begin
  if not public.eh_mestre() then raise exception 'Só o Mestre.'; end if;
  select * into f from public.fichas where personagem = p_personagem for update;
  if p_delta < 0 then
    dos_temporarios := least(f.pv_temporarios, -p_delta);
    update public.fichas
      set pv_temporarios = f.pv_temporarios - dos_temporarios,
          pv = greatest(0, f.pv - (-p_delta - dos_temporarios))
      where personagem = p_personagem;
    perform public.avisar(p_personagem, 'Você levou ' || -p_delta || ' de dano.');
  elsif p_delta > 0 then
    update public.fichas set pv = least(p_pv_maximo, f.pv + p_delta) where personagem = p_personagem;
    perform public.avisar(p_personagem, 'Você recuperou ' || least(p_delta, greatest(0, p_pv_maximo - f.pv)) || ' PV.');
  end if;
end;
$$;

create function public.mestre_inspiracao(p_personagem text, p_tem boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then raise exception 'Só o Mestre.'; end if;
  update public.fichas set inspiracao = p_tem where personagem = p_personagem;
  perform public.avisar(p_personagem,
    case when p_tem then 'O Mestre te deu Inspiração Heroica.' else 'O Mestre tirou a sua Inspiração Heroica.' end);
end;
$$;

create function public.mestre_recado(p_personagem text, p_texto text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then raise exception 'Só o Mestre.'; end if;
  if char_length(trim(p_texto)) = 0 then raise exception 'O recado está vazio.'; end if;
  perform public.avisar(p_personagem, 'Recado do Mestre: ' || trim(p_texto));
end;
$$;

-- Tirar item: o mesmo de antes, mas quando é o Mestre quem tira, avisa.
create or replace function public.tirar_item(p_personagem text, p_item text, p_quantidade integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  nome text;
begin
  if not public.pode_mexer(p_personagem) then
    raise exception 'Essa ficha não é sua.';
  end if;
  if p_quantidade < 1 then
    raise exception 'Quantidade inválida.';
  end if;
  select e ->> 'nome' into nome
    from public.fichas, jsonb_array_elements(inventario) e
    where personagem = p_personagem and e ->> 'id' = p_item;
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
  if nome is not null and public.eh_mestre() and not exists (
    select 1 from public.perfis where id = (select auth.uid()) and personagem = p_personagem
  ) then
    perform public.avisar(p_personagem, 'O Mestre tirou da sua mochila: ' || p_quantidade || '× ' || nome || '.');
  end if;
end;
$$;

-- Os pedidos aprovados agora somam na pilha e avisam o jogador.
create or replace function public.resolver_pedido(p_id bigint, p_aprovar boolean, p_resposta text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.pedidos;
  o_que text;
begin
  if not public.eh_mestre() then
    raise exception 'Só o Mestre resolve pedidos.';
  end if;
  select * into p from public.pedidos where id = p_id and estado = 'pendente' for update;
  if not found then
    raise exception 'Esse pedido já foi resolvido.';
  end if;

  if p.tipo = 'item' then
    o_que := p.quantidade || '× ' || p.item;
  else
    o_que := public.moedas_em_texto(p.moedas);
  end if;

  if p_aprovar and p.tipo = 'item' then
    perform public.acrescentar_item(p.personagem, p.item, p.quantidade);
  elsif p_aprovar and p.tipo = 'moedas' then
    perform public.somar_moedas(p.personagem, (
      select coalesce(jsonb_object_agg(chave, greatest((valor)::integer, 0)), '{}'::jsonb)
      from jsonb_each_text(p.moedas) as m(chave, valor)
    ));
  end if;

  update public.pedidos
    set estado = case when p_aprovar then 'aprovado' else 'recusado' end,
        resposta = nullif(trim(p_resposta), ''),
        resolvido_em = now()
    where id = p_id;

  perform public.avisar(p.personagem,
    case when p_aprovar then 'O Mestre aprovou o seu pedido: ' else 'O Mestre recusou o seu pedido: ' end
    || o_que || coalesce('. "' || nullif(trim(p_resposta), '') || '"', '.'));
end;
$$;


-- ---------- Caixa de sugestões ----------

create table public.sugestoes (
  id bigint generated always as identity primary key,
  conta uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 1000),
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

alter table public.sugestoes enable row level security;

create policy "cada um vê as suas sugestões, o Mestre vê todas"
  on public.sugestoes for select to authenticated
  using (conta = (select auth.uid()) or (select public.eh_mestre()));

create policy "cada um deixa sugestões em nome próprio"
  on public.sugestoes for insert to authenticated
  with check (conta = (select auth.uid()));

create policy "o Mestre marca como lida"
  on public.sugestoes for update to authenticated
  using ((select public.eh_mestre()));

create policy "o Mestre apaga"
  on public.sugestoes for delete to authenticated
  using ((select public.eh_mestre()));

revoke all on public.sugestoes from anon, authenticated;
grant select, delete on public.sugestoes to authenticated;
grant insert (texto) on public.sugestoes to authenticated;
grant update (lida) on public.sugestoes to authenticated;


-- ---------- Permissões das funções ----------

revoke execute on function public.avisar(text, text) from public, anon, authenticated;
revoke execute on function public.acrescentar_item(text, text, integer) from public, anon, authenticated;
revoke execute on function public.somar_moedas(text, jsonb) from public, anon, authenticated;
revoke execute on function public.moedas_em_texto(jsonb) from public, anon;
revoke execute on function public.mestre_dar_item(text, text, integer) from public, anon;
revoke execute on function public.mestre_moedas(text, jsonb) from public, anon;
revoke execute on function public.mestre_xp(text, integer) from public, anon;
revoke execute on function public.mestre_pv(text, integer, integer) from public, anon;
revoke execute on function public.mestre_inspiracao(text, boolean) from public, anon;
revoke execute on function public.mestre_recado(text, text) from public, anon;
grant execute on function public.mestre_dar_item(text, text, integer) to authenticated;
grant execute on function public.mestre_moedas(text, jsonb) to authenticated;
grant execute on function public.mestre_xp(text, integer) to authenticated;
grant execute on function public.mestre_pv(text, integer, integer) to authenticated;
grant execute on function public.mestre_inspiracao(text, boolean) to authenticated;
grant execute on function public.mestre_recado(text, text) to authenticated;


-- ---------- Na hora (Realtime) ----------
-- As mudanças nestas tabelas chegam sozinhas a quem pode vê-las.

alter publication supabase_realtime add table public.fichas, public.pedidos, public.avisos;
