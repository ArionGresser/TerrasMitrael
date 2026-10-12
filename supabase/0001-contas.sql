-- Terras de Mitrael · Fase 1: contas, papel do Mestre e conquistas na conta
--
-- Como usar: no painel do Supabase, abra SQL Editor, cole este arquivo
-- inteiro e clique em Run. Rodar uma vez só.
--
-- O login é por nome de usuário e senha. Por baixo, o Supabase precisa de
-- um e-mail, então o site monta um interno a partir do nome, no endereço
-- do próprio projeto (lily@isqlrgrorstevvumwicd.supabase.co, por exemplo).
-- Ninguém recebe nada nesse endereço, e por isso "Confirm email" precisa
-- estar desligado em
-- Authentication > Sign In / Providers > Email.
--
-- Quem pode o quê fica preso aqui no banco (RLS), não no site: mesmo
-- mexendo no navegador, um jogador só lê e muda o que é dele.


-- ---------- Perfis ----------
-- Um por conta, criado sozinho quando a conta nasce (ver o gatilho abaixo).

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  -- O nome de entrar: minúsculas, sem acento, com hífen no lugar do espaço
  usuario text not null unique
    check (usuario ~ '^[a-z0-9][a-z0-9-]{1,22}[a-z0-9]$'),
  -- O nome como a pessoa escreveu, com acento e maiúscula
  nome text not null check (char_length(nome) between 2 and 40),
  papel text not null default 'jogador' check (papel in ('jogador', 'mestre')),
  -- O slug da ficha do personagem (lily-bouvardia...). Só o Mestre vincula.
  personagem text unique,
  -- Os contadores das conquistas (rolagens, moedas, lugares do mapa...)
  progresso jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Se quem pergunta é o Mestre. "security definer" para poder ler os perfis
-- sem cair na própria regra de leitura (que usa esta função).
create function public.eh_mestre()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and papel = 'mestre'
  );
$$;

create policy "cada um vê o seu perfil, o Mestre vê todos"
  on public.perfis for select to authenticated
  using (id = (select auth.uid()) or (select public.eh_mestre()));

create policy "cada um muda o seu perfil"
  on public.perfis for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Do perfil, o jogador só muda o nome de exibição e o progresso. Papel e
-- personagem ficam de fora: só pelas funções do Mestre, mais abaixo.
revoke all on public.perfis from anon, authenticated;
grant select on public.perfis to authenticated;
grant update (nome, progresso) on public.perfis to authenticated;

-- A conta nasce, o perfil nasce junto, sempre como jogador.
create function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, usuario, nome)
  values (
    new.id,
    new.raw_user_meta_data ->> 'usuario',
    coalesce(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'usuario')
  );
  return new;
end;
$$;

create trigger ao_criar_conta
  after insert on auth.users
  for each row execute function public.criar_perfil();


-- ---------- Conquistas ----------

create table public.conquistas (
  conta uuid not null references public.perfis (id) on delete cascade,
  chave text not null check (char_length(chave) between 1 and 60),
  feita_em timestamptz not null default now(),
  primary key (conta, chave)
);

alter table public.conquistas enable row level security;

create policy "cada um vê as suas conquistas, o Mestre vê todas"
  on public.conquistas for select to authenticated
  using (conta = (select auth.uid()) or (select public.eh_mestre()));

create policy "cada um guarda as suas conquistas"
  on public.conquistas for insert to authenticated
  with check (conta = (select auth.uid()));

revoke all on public.conquistas from anon, authenticated;
grant select, insert on public.conquistas to authenticated;


-- ---------- Ferramentas do Mestre ----------

-- Liga (ou desliga, com personagem vazio) uma conta a uma ficha.
create function public.vincular_personagem(conta uuid, personagem text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then
    raise exception 'Só o Mestre pode vincular personagens.';
  end if;
  update public.perfis
    set personagem = nullif(trim(vincular_personagem.personagem), '')
    where id = vincular_personagem.conta;
end;
$$;

-- Senha esquecida: o Mestre escolhe uma nova e passa para o jogador.
create function public.redefinir_senha(conta uuid, senha text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_mestre() then
    raise exception 'Só o Mestre pode redefinir senhas.';
  end if;
  if char_length(senha) < 6 then
    raise exception 'A senha precisa de pelo menos 6 caracteres.';
  end if;
  update auth.users
    set encrypted_password = extensions.crypt(senha, extensions.gen_salt('bf')),
        updated_at = now()
    where id = redefinir_senha.conta;
end;
$$;

revoke execute on function public.eh_mestre() from public, anon;
revoke execute on function public.vincular_personagem(uuid, text) from public, anon;
revoke execute on function public.redefinir_senha(uuid, text) from public, anon;
revoke execute on function public.criar_perfil() from public, anon, authenticated;
grant execute on function public.eh_mestre() to authenticated;
grant execute on function public.vincular_personagem(uuid, text) to authenticated;
grant execute on function public.redefinir_senha(uuid, text) to authenticated;


-- ---------- Depois de rodar ----------
-- 1. Crie a sua conta no site, em Minha conta > Criar conta.
-- 2. Volte aqui e rode a linha abaixo, trocando "seu-usuario" pelo usuário
--    que o site mostrou (minúsculas, sem acento):
--
--    update public.perfis set papel = 'mestre' where usuario = 'seu-usuario';
