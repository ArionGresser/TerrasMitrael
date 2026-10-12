/**
 * A conta de quem joga: entrar, criar conta, sair e guardar as conquistas.
 *
 * O banco é o Supabase (as tabelas e as regras estão em
 * supabase/0001-contas.sql). A chave daqui é a publicável, feita para ficar
 * no site: quem decide o que cada um lê e muda são as regras do banco.
 *
 * O login é por nome e senha, sem e-mail. Por baixo o Supabase precisa de um
 * e-mail, então o nome vira um endereço interno que ninguém recebe (ver
 * `emailDe`). Senha esquecida, o Mestre redefine pelo painel dele.
 *
 * A biblioteca do Supabase só é baixada por quem tem conta aberta neste
 * navegador ou abre a tela da conta. Para os outros visitantes o site
 * continua do mesmo tamanho.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { EVENTO, EVENTO_PROGRESSO, conquistar, juntar, retrato, type Retrato } from "@/lib/conquistas";

const PROJETO = "isqlrgrorstevvumwicd";
const URL_DO_BANCO = `https://${PROJETO}.supabase.co`;
const CHAVE_PUBLICAVEL = "sb_publishable_4IgLEjDaU-V5ClLAYOESfQ_58mgScyQ";
/** Onde a biblioteca guarda a sessão, neste navegador. */
const CHAVE_DA_SESSAO = "mitrael:sessao";

export type Papel = "jogador" | "mestre";

export type Perfil = {
  id: string;
  usuario: string;
  nome: string;
  papel: Papel;
  personagem: string | null;
  progresso: Partial<Pick<Retrato, "contadores" | "marcas">>;
  criado_em: string;
};

export type EstadoDaConta =
  | { fase: "carregando" }
  | { fase: "fora" }
  | { fase: "dentro"; perfil: Perfil };

// ---------- O cliente, baixado só quando precisa ----------

let promessaDoCliente: Promise<SupabaseClient> | null = null;

export function cliente(): Promise<SupabaseClient> {
  promessaDoCliente ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(URL_DO_BANCO, CHAVE_PUBLICAVEL, {
      auth: { storageKey: CHAVE_DA_SESSAO, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  );
  return promessaDoCliente;
}

function temSessaoGuardada(): boolean {
  try {
    return Boolean(localStorage.getItem(CHAVE_DA_SESSAO));
  } catch {
    return false;
  }
}

// ---------- O nome ----------

/** "Lily Bouvardia" → "lily-bouvardia": minúsculas, sem acento, hífen no espaço. */
export function usuarioDe(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emailDe(usuario: string): string {
  return `${usuario}@${PROJETO}.supabase.co`;
}

/** O que está errado no nome, ou null se está bom. Igual à regra do banco. */
export function problemaNoNome(nome: string): string | null {
  const limpo = nome.trim();
  if (limpo.length < 2) return "O nome precisa de pelo menos 2 letras.";
  if (limpo.length > 40) return "O nome pode ter no máximo 40 letras.";
  const usuario = usuarioDe(limpo);
  if (usuario.length < 3) return "Use pelo menos 3 letras ou números no nome.";
  if (usuario.length > 24) return "Encurte um pouco o nome: no máximo 24 letras, sem contar acentos e espaços.";
  return null;
}

export function problemaNaSenha(senha: string): string | null {
  return senha.length < 6 ? "A senha precisa de pelo menos 6 caracteres." : null;
}

/** As mensagens do Supabase, em inglês, viram explicação em português. */
function traduzir(erro: { message?: string; code?: string } | null | undefined): string {
  const texto = `${erro?.code ?? ""} ${erro?.message ?? ""}`.toLowerCase();
  if (texto.includes("invalid login credentials") || texto.includes("invalid_credentials"))
    return "Nome ou senha não conferem.";
  if (texto.includes("already registered") || texto.includes("user_already_exists"))
    return "Esse nome já tem conta. Se a conta é sua, entre com ela; se esqueceu a senha, peça ao Mestre.";
  if (texto.includes("email not confirmed"))
    return "A conta existe, mas o Supabase está pedindo confirmação de e-mail. O Mestre precisa desligar \"Confirm email\" no painel do Supabase.";
  if (texto.includes("weak_password") || texto.includes("password should"))
    return "Essa senha é fraca demais. Tente uma mais longa.";
  if (texto.includes("rate limit") || texto.includes("over_request_rate_limit"))
    return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
  if (texto.includes("failed to fetch") || texto.includes("network"))
    return "Não deu para falar com o servidor. Confira a internet e tente de novo.";
  if (texto.includes("database error saving new user"))
    return "O banco recusou a conta nova. Confira se o nome tem pelo menos 3 letras ou números.";
  return erro?.message ? `Algo deu errado: ${erro.message}` : "Algo deu errado. Tente de novo.";
}

// ---------- O estado, para as telas ----------

let estado: EstadoDaConta = { fase: "carregando" };
const ouvintes = new Set<() => void>();

function mudar(novo: EstadoDaConta) {
  estado = novo;
  for (const ouvir of ouvintes) ouvir();
}

export function estadoDaConta(): EstadoDaConta {
  return estado;
}

export function ouvirConta(ouvir: () => void): () => void {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}

async function carregarPerfil(sb: SupabaseClient, id: string): Promise<Perfil | null> {
  const { data } = await sb.from("perfis").select("*").eq("id", id).maybeSingle();
  return (data as Perfil | null) ?? null;
}

let iniciada = false;

/**
 * Descobre se há conta aberta neste navegador. Sem sessão guardada, nem
 * baixa a biblioteca: responde "fora" na hora.
 */
export async function iniciarConta(): Promise<void> {
  if (iniciada) return;
  iniciada = true;
  if (!temSessaoGuardada()) {
    mudar({ fase: "fora" });
    return;
  }
  try {
    const sb = await cliente();
    const { data } = await sb.auth.getSession();
    const perfil = data.session ? await carregarPerfil(sb, data.session.user.id) : null;
    if (!perfil) {
      mudar({ fase: "fora" });
      return;
    }
    mudar({ fase: "dentro", perfil });
    await sincronizar(perfil);
  } catch {
    mudar({ fase: "fora" });
  }
}

/** Depois de entrar ou de criar a conta: carrega o perfil e junta as conquistas. */
async function abrir(sb: SupabaseClient, id: string): Promise<string | null> {
  const perfil = await carregarPerfil(sb, id);
  if (!perfil) return "A conta abriu, mas o perfil não apareceu. O banco ainda não foi preparado (o arquivo SQL da fase 1).";
  mudar({ fase: "dentro", perfil });
  await sincronizar(perfil);
  return null;
}

/** Devolve a mensagem de erro, ou null se entrou. */
export async function entrar(nome: string, senha: string): Promise<string | null> {
  const usuario = usuarioDe(nome);
  if (!usuario) return "Escreva o seu nome.";
  if (!senha) return "Escreva a sua senha.";
  try {
    const sb = await cliente();
    const { data, error } = await sb.auth.signInWithPassword({ email: emailDe(usuario), password: senha });
    if (error || !data.user) return traduzir(error);
    return await abrir(sb, data.user.id);
  } catch (e) {
    return traduzir(e as Error);
  }
}

export async function criarConta(nome: string, senha: string): Promise<string | null> {
  const problema = problemaNoNome(nome) ?? problemaNaSenha(senha);
  if (problema) return problema;
  const usuario = usuarioDe(nome);
  try {
    const sb = await cliente();
    const { data, error } = await sb.auth.signUp({
      email: emailDe(usuario),
      password: senha,
      options: { data: { usuario, nome: nome.trim() } },
    });
    if (error) return traduzir(error);
    // Com "Confirm email" ligado, a conta nasce sem sessão
    if (!data.session || !data.user)
      return "A conta foi criada, mas o Supabase está pedindo confirmação de e-mail. O Mestre precisa desligar \"Confirm email\" no painel do Supabase.";
    return await abrir(sb, data.user.id);
  } catch (e) {
    return traduzir(e as Error);
  }
}

export async function sair(): Promise<void> {
  const sb = await cliente();
  await sb.auth.signOut();
  mudar({ fase: "fora" });
}

export async function trocarSenha(nova: string): Promise<string | null> {
  const problema = problemaNaSenha(nova);
  if (problema) return problema;
  const sb = await cliente();
  const { error } = await sb.auth.updateUser({ password: nova });
  return error ? traduzir(error) : null;
}

export async function trocarNome(nome: string): Promise<string | null> {
  const limpo = nome.trim();
  if (limpo.length < 2 || limpo.length > 40) return "O nome precisa ter de 2 a 40 letras.";
  if (estado.fase !== "dentro") return "Entre na conta primeiro.";
  const sb = await cliente();
  const { error } = await sb.from("perfis").update({ nome: limpo }).eq("id", estado.perfil.id);
  if (error) return traduzir(error);
  mudar({ fase: "dentro", perfil: { ...estado.perfil, nome: limpo } });
  return null;
}

// ---------- As conquistas na conta ----------

/**
 * Junta as conquistas do navegador com as da conta, nos dois sentidos, e
 * dá a conquista de entrar com a conta (que libera o dado de âmbar).
 */
async function sincronizar(perfil: Perfil): Promise<void> {
  const sb = await cliente();
  const { data: linhas } = await sb.from("conquistas").select("chave, feita_em").eq("conta", perfil.id);
  const naConta = Object.fromEntries((linhas ?? []).map((l) => [l.chave as string, l.feita_em as string]));

  const juntas = juntar({
    feitas: naConta,
    contadores: perfil.progresso?.contadores,
    marcas: perfil.progresso?.marcas,
  });

  const faltando = Object.entries(juntas.feitas)
    .filter(([chave]) => !naConta[chave])
    .map(([chave, feita_em]) => ({ conta: perfil.id, chave, feita_em }));
  if (faltando.length) await sb.from("conquistas").upsert(faltando, { ignoreDuplicates: true });
  await guardarProgresso();

  // Esta dispara o aviso na tela e sobe sozinha, pelo ouvinte abaixo
  conquistar("conta");
}

async function guardarProgresso() {
  if (estado.fase !== "dentro") return;
  const { contadores, marcas } = retrato();
  const sb = await cliente();
  await sb.from("perfis").update({ progresso: { contadores, marcas } }).eq("id", estado.perfil.id);
}

let progressoAgendado: ReturnType<typeof setTimeout> | undefined;

/**
 * Com a conta aberta, cada feito novo sobe na hora e os contadores sobem
 * alguns segundos depois da última mudança (rolar 30 vezes seguidas vira
 * uma gravação só). Devolve a função que para de ouvir.
 */
export function ouvirConquistas(): () => void {
  const aoConquistar = async (e: Event) => {
    if (estado.fase !== "dentro") return;
    const chave = (e as CustomEvent<{ chave: string }>).detail?.chave;
    if (!chave) return;
    const sb = await cliente();
    await sb
      .from("conquistas")
      .upsert({ conta: estado.perfil.id, chave, feita_em: new Date().toISOString() }, { ignoreDuplicates: true });
  };
  const aoAndar = () => {
    if (estado.fase !== "dentro") return;
    clearTimeout(progressoAgendado);
    progressoAgendado = setTimeout(() => void guardarProgresso(), 4000);
  };
  window.addEventListener(EVENTO, aoConquistar);
  window.addEventListener(EVENTO_PROGRESSO, aoAndar);
  return () => {
    window.removeEventListener(EVENTO, aoConquistar);
    window.removeEventListener(EVENTO_PROGRESSO, aoAndar);
  };
}

// ---------- O painel do Mestre ----------

export async function listarContas(): Promise<{ contas: Perfil[]; conquistas: Record<string, number> }> {
  const sb = await cliente();
  const [{ data: perfis }, { data: feitas }] = await Promise.all([
    sb.from("perfis").select("*").order("criado_em"),
    sb.from("conquistas").select("conta"),
  ]);
  const conquistas: Record<string, number> = {};
  for (const l of feitas ?? []) conquistas[l.conta as string] = (conquistas[l.conta as string] ?? 0) + 1;
  return { contas: (perfis as Perfil[] | null) ?? [], conquistas };
}

export async function vincularPersonagem(conta: string, personagem: string): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.rpc("vincular_personagem", { conta, personagem });
  if (!error) return null;
  if (error.code === "23505") return "Esse personagem já está ligado a outra conta.";
  return traduzir(error);
}

export async function redefinirSenha(conta: string, senha: string): Promise<string | null> {
  const problema = problemaNaSenha(senha);
  if (problema) return problema;
  const sb = await cliente();
  const { error } = await sb.rpc("redefinir_senha", { conta, senha });
  return error ? traduzir(error) : null;
}
