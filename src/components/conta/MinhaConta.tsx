"use client";

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { criarConta, entrar, iniciarConta, problemaNoNome, sair, trocarNome, trocarSenha, usuarioDe } from "@/lib/conta";
import { CONQUISTAS, EVENTO_JUNTADAS, conquistadas } from "@/lib/conquistas";
import { mandarSugestao } from "@/lib/ficha-viva";
import { useConta } from "./useConta";

export type PersonagemDaLista = { slug: string; nome: string };

export const CAMPO =
  "border-dourado-600/40 bg-pergaminho-50 text-tinta-900 focus-visible:outline-dourado-600 min-h-11 w-full rounded-sm border px-3 text-base";
export const BOTAO =
  "font-titulo border-dourado-600/60 text-tinta-900 hover:bg-dourado-400/20 inline-flex min-h-11 items-center justify-center rounded-sm border px-5 text-sm font-semibold tracking-wide transition-colors disabled:opacity-50";
export const BOTAO_CHEIO =
  "font-titulo bg-heraldico-vermelho hover:bg-heraldico-vermelho/90 text-pergaminho-50 inline-flex min-h-11 items-center justify-center rounded-sm px-6 text-sm font-semibold tracking-wide shadow-sm transition-colors disabled:opacity-50";

/**
 * A tela da conta: sem conta aberta, o formulário de entrar ou de criar;
 * com ela, o nome, o personagem ligado, as conquistas e as trocas de nome
 * e senha. O Mestre ganha o atalho para o painel dele.
 */
export function MinhaConta({ personagens }: { personagens: PersonagemDaLista[] }) {
  const conta = useConta();

  // Nesta tela a biblioteca já pode vir: quem abriu vai entrar
  useEffect(() => {
    void iniciarConta();
  }, []);

  if (conta.fase === "carregando") {
    return <p className="text-tinta-700 py-10 text-center italic">Abrindo o livro de registros…</p>;
  }
  if (conta.fase === "fora") return <Formulario />;

  const { perfil } = conta;
  const personagem = personagens.find((p) => p.slug === perfil.personagem);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-tinta-700 text-sm">Conta aberta como</p>
        <p className="font-titulo text-tinta-900 mt-1 text-2xl font-bold">{perfil.nome}</p>
        <p className="text-tinta-500 mt-1 text-sm">
          usuário <span className="font-semibold">{perfil.usuario}</span>
          {perfil.papel === "mestre" ? " · Mestre" : null}
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Quadro titulo="Personagem">
          {personagem ? (
            <>
              <Link href={`/personagens/${personagem.slug}/`} className="text-heraldico-vermelho font-semibold underline">
                {personagem.nome}
              </Link>
              <span className="text-tinta-700 block text-xs">A ficha viva fica na aba Ficha.</span>
            </>
          ) : (
            <span className="text-tinta-700">
              Nenhum ainda. O Mestre liga a sua ficha à sua conta pelo painel dele.
            </span>
          )}
        </Quadro>
        <Quadro titulo="Conquistas">
          <ContagemDeConquistas />{" "}
          <Link href="/conquistas/" className="text-heraldico-vermelho underline">
            ver todas
          </Link>
        </Quadro>
      </dl>

      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/combate/" className={BOTAO}>
          A arena do combate
        </Link>
        <Link href="/mapa-da-mesa/" className={BOTAO}>
          Mapa da mesa
        </Link>
      </div>

      {perfil.papel === "mestre" ? (
        <div className="text-center">
          <Link href="/mestre/" className={BOTAO_CHEIO}>
            Abrir o painel do Mestre
          </Link>
        </div>
      ) : null}

      <div className="space-y-3">
        <Troca titulo="Trocar o nome que aparece" rotulo="Nome novo" valorInicial={perfil.nome} enviar={trocarNome} ok="Nome trocado." />
        <Troca titulo="Trocar a senha" rotulo="Senha nova" tipo="password" enviar={trocarSenha} ok="Senha trocada." />
        {perfil.papel !== "mestre" ? <Sugestao /> : null}
      </div>

      <div className="text-center">
        <button type="button" onClick={() => void sair()} className={BOTAO}>
          Sair da conta
        </button>
        <p className="text-tinta-500 mt-2 text-xs">As conquistas continuam neste navegador e na conta.</p>
      </div>
    </div>
  );
}

function Quadro({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="border-dourado-600/30 rounded-sm border p-4">
      <dt className="font-titulo text-tinta-500 text-xs tracking-[0.14em] uppercase">{titulo}</dt>
      <dd className="text-tinta-900 mt-1 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

function ContagemDeConquistas() {
  const [quantas, setQuantas] = useState<number | null>(null);
  useEffect(() => {
    const contar = () => setQuantas(CONQUISTAS.filter((c) => conquistadas()[c.chave]).length);
    contar();
    window.addEventListener(EVENTO_JUNTADAS, contar);
    return () => window.removeEventListener(EVENTO_JUNTADAS, contar);
  }, []);
  return (
    <span>
      {quantas ?? "…"} de {CONQUISTAS.length}.
    </span>
  );
}

function Formulario() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [repetida, setRepetida] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const id = useId();
  const criando = modo === "criar";
  const usuario = usuarioDe(nome);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (criando && senha !== repetida) {
      setErro("As duas senhas não são iguais.");
      return;
    }
    setEnviando(true);
    const problema = criando ? await criarConta(nome, senha) : await entrar(nome, senha);
    setEnviando(false);
    if (problema) setErro(problema);
  }

  function trocarModo(novo: "entrar" | "criar") {
    setModo(novo);
    setErro(null);
  }

  const aba = (qual: "entrar" | "criar", texto: string) => (
    <button
      type="button"
      aria-pressed={modo === qual}
      onClick={() => trocarModo(qual)}
      className={`font-titulo min-h-11 flex-1 rounded-sm px-4 text-sm font-semibold tracking-wide transition-colors ${
        modo === qual ? "bg-madeira-800 text-pergaminho-50" : "text-tinta-700 hover:bg-dourado-400/15"
      }`}
    >
      {texto}
    </button>
  );

  return (
    <div className="mx-auto max-w-sm">
      <div className="border-dourado-600/40 flex gap-1 rounded-sm border p-1" role="group" aria-label="Entrar ou criar conta">
        {aba("entrar", "Entrar")}
        {aba("criar", "Criar conta")}
      </div>

      <form onSubmit={enviar} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor={`${id}-nome`} className="font-titulo text-tinta-900 text-sm font-semibold">
            Nome
          </label>
          <input
            id={`${id}-nome`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="username"
            autoCapitalize="words"
            spellCheck={false}
            required
            aria-describedby={`${id}-dica-nome`}
            className={`${CAMPO} mt-1`}
          />
          <p id={`${id}-dica-nome`} className="text-tinta-500 mt-1 text-xs leading-relaxed">
            {criando
              ? usuario && !problemaNoNome(nome)
                ? `Você vai entrar como "${usuario}". Acento, maiúscula e espaço não fazem diferença.`
                : "O nome do seu personagem, ou um apelido se ainda não tem um."
              : "O mesmo nome com que você criou a conta."}
          </p>
        </div>

        <div>
          <label htmlFor={`${id}-senha`} className="font-titulo text-tinta-900 text-sm font-semibold">
            Senha
          </label>
          <input
            id={`${id}-senha`}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={criando ? "new-password" : "current-password"}
            required
            minLength={6}
            className={`${CAMPO} mt-1`}
          />
        </div>

        {criando ? (
          <div>
            <label htmlFor={`${id}-repetida`} className="font-titulo text-tinta-900 text-sm font-semibold">
              Repita a senha
            </label>
            <input
              id={`${id}-repetida`}
              type="password"
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
              autoComplete="new-password"
              required
              className={`${CAMPO} mt-1`}
            />
          </div>
        ) : null}

        {erro ? (
          <p role="alert" className="border-heraldico-vermelho/40 bg-heraldico-vermelho/10 text-heraldico-vermelho rounded-sm border p-3 text-sm">
            {erro}
          </p>
        ) : null}

        <button type="submit" disabled={enviando} className={`${BOTAO_CHEIO} w-full`}>
          {enviando ? "Um instante…" : criando ? "Criar a conta" : "Entrar"}
        </button>
      </form>

      <p className="text-tinta-500 mt-6 text-center text-xs leading-relaxed">
        Sem e-mail: só nome e senha. Esqueceu a senha? Peça ao Mestre, ele cria uma nova para você.
      </p>
    </div>
  );
}

/** Um formulário pequeno que abre num clique, para trocar uma coisa só. */
function Troca({
  titulo,
  rotulo,
  tipo = "text",
  valorInicial = "",
  enviar,
  ok,
}: {
  titulo: string;
  rotulo: string;
  tipo?: "text" | "password";
  valorInicial?: string;
  enviar: (valor: string) => Promise<string | null>;
  ok: string;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const id = useId();

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const problema = await enviar(valor);
    setEnviando(false);
    setAviso(problema ? { erro: true, texto: problema } : { erro: false, texto: ok });
    if (!problema && tipo === "password") setValor("");
  }

  return (
    <details className="border-dourado-600/30 rounded-sm border">
      <summary className="font-titulo text-tinta-900 min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold">{titulo}</summary>
      <form onSubmit={aoEnviar} className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={id} className="text-tinta-700 text-xs">
            {rotulo}
          </label>
          <input
            id={id}
            type={tipo}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            autoComplete={tipo === "password" ? "new-password" : "nickname"}
            className={`${CAMPO} mt-1`}
          />
        </div>
        <button type="submit" disabled={enviando} className={BOTAO}>
          Salvar
        </button>
      </form>
      {aviso ? (
        <p role="status" className={`px-4 pb-4 text-sm ${aviso.erro ? "text-heraldico-vermelho" : "text-tinta-700"}`}>
          {aviso.texto}
        </p>
      ) : null}
    </details>
  );
}

/** A caixa de sugestões: uma ideia, um pedido de regra, um elogio ao Mestre. */
function Sugestao() {
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const id = useId();

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const problema = await mandarSugestao(texto);
    setEnviando(false);
    setAviso(problema ? { erro: true, texto: problema } : { erro: false, texto: "Sugestão entregue ao Mestre. Valeu!" });
    if (!problema) setTexto("");
  }

  return (
    <details className="border-dourado-600/30 rounded-sm border">
      <summary className="font-titulo text-tinta-900 min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold">
        Caixa de sugestões
      </summary>
      <form onSubmit={enviar} className="px-4 pb-4">
        <label htmlFor={id} className="text-tinta-700 text-xs">
          Uma ideia para o site ou para a mesa. Só o Mestre lê.
        </label>
        <textarea
          id={id}
          value={texto}
          maxLength={1000}
          rows={4}
          onChange={(e) => setTexto(e.target.value)}
          className={`${CAMPO} mt-1 py-2`}
        />
        <button type="submit" disabled={enviando || !texto.trim()} className={`${BOTAO} mt-2`}>
          Enviar
        </button>
        {aviso ? (
          <p role="status" className={`mt-2 text-sm ${aviso.erro ? "text-heraldico-vermelho" : "text-tinta-700"}`}>
            {aviso.texto}
          </p>
        ) : null}
      </form>
    </details>
  );
}
