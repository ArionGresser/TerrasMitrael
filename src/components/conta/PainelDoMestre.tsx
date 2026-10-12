"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { iniciarConta, listarContas, redefinirSenha, vincularPersonagem, type Perfil } from "@/lib/conta";
import { BOTAO, CAMPO, type PersonagemDaLista } from "./MinhaConta";
import { criarFicha, listarPedidos, resolverPedido, type Pedido } from "@/lib/ficha-viva";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import { LinhaDoPedido } from "@/components/ficha-viva/PainelDaFicha";

/** Na lista do Mestre, quem tem ficha de 2024 traz a base da ficha viva. */
export type PersonagemDoMestre = PersonagemDaLista & { base?: BaseDaFicha };
import { useConta } from "./useConta";

/**
 * O painel do Mestre: todas as contas, o personagem de cada uma e a troca
 * de senha para quem esqueceu. Quem não é Mestre vê só um aviso: o banco
 * também não entregaria as contas dos outros (ver supabase/0001-contas.sql).
 */
export function PainelDoMestre({ personagens }: { personagens: PersonagemDoMestre[] }) {
  const conta = useConta();
  const [lista, setLista] = useState<{ contas: Perfil[]; conquistas: Record<string, number> } | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";

  useEffect(() => {
    void iniciarConta();
  }, []);

  const recarregar = useCallback(async () => {
    try {
      const [contas, todos] = await Promise.all([listarContas(), listarPedidos()]);
      setLista(contas);
      setPedidos(todos.filter((p) => p.estado === "pendente"));
    } catch {
      setErro("Não deu para buscar as contas. Confira a internet e recarregue a página.");
    }
  }, []);

  useEffect(() => {
    if (ehMestre) void recarregar();
  }, [ehMestre, recarregar]);

  if (conta.fase === "carregando") {
    return <p className="text-tinta-700 py-10 text-center italic">Abrindo o livro de registros…</p>;
  }
  if (!ehMestre) {
    return (
      <p className="text-tinta-700 py-10 text-center">
        Este painel é só do Mestre.{" "}
        <Link href="/conta/" className="text-heraldico-vermelho underline">
          {conta.fase === "fora" ? "Entrar na conta" : "Voltar para a sua conta"}
        </Link>
      </p>
    );
  }

  if (erro) return <p role="alert" className="text-heraldico-vermelho text-center">{erro}</p>;
  if (!lista) return <p className="text-tinta-700 py-10 text-center italic">Buscando as contas…</p>;

  return (
    <div>
      <PedidosPendentes pedidos={pedidos} personagens={personagens} aoMudar={recarregar} />

      <p className="text-tinta-700 mt-8 text-center text-sm">
        {lista.contas.length === 1 ? "1 conta" : `${lista.contas.length} contas`} no livro.
      </p>
      <ul className="mt-6 space-y-4">
        {lista.contas.map((c) => (
          <LinhaDaConta
            key={c.id}
            conta={c}
            conquistas={lista.conquistas[c.id] ?? 0}
            personagens={personagens}
            ocupados={new Set(lista.contas.filter((o) => o.id !== c.id && o.personagem).map((o) => o.personagem!))}
            aoMudar={recarregar}
          />
        ))}
      </ul>
    </div>
  );
}

function LinhaDaConta({
  conta,
  conquistas,
  personagens,
  ocupados,
  aoMudar,
}: {
  conta: Perfil;
  conquistas: number;
  personagens: PersonagemDoMestre[];
  ocupados: Set<string>;
  aoMudar: () => Promise<void>;
}) {
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [senha, setSenha] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const id = useId();

  async function ligar(slug: string) {
    setOcupado(true);
    const problema = await vincularPersonagem(conta.id, slug);
    setOcupado(false);
    if (problema) {
      setAviso({ erro: true, texto: problema });
      return;
    }
    const escolhido = personagens.find((p) => p.slug === slug);
    // A ficha viva abre junto (se já existia, fica como estava)
    const semFicha = escolhido?.base ? await criarFicha(slug, escolhido.base) : null;
    setAviso(
      semFicha
        ? { erro: true, texto: `Ligada a ${escolhido!.nome}, mas a ficha viva não abriu: ${semFicha}` }
        : { erro: false, texto: escolhido ? `Ligada a ${escolhido.nome}.` : "Personagem desligado." }
    );
    await aoMudar();
  }

  async function novaSenha(e: FormEvent) {
    e.preventDefault();
    setOcupado(true);
    const problema = await redefinirSenha(conta.id, senha);
    setOcupado(false);
    setAviso(
      problema
        ? { erro: true, texto: problema }
        : { erro: false, texto: `Senha nova salva. Passe para ${conta.nome}: ela vale a partir de agora.` }
    );
    if (!problema) setSenha("");
  }

  return (
    <li className="border-dourado-600/30 rounded-sm border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-titulo text-tinta-900 text-lg font-bold">
          {conta.nome}
          {conta.papel === "mestre" ? <span className="text-dourado-600 ml-2 text-xs tracking-widest uppercase">Mestre</span> : null}
        </p>
        <p className="text-tinta-500 text-xs">
          usuário {conta.usuario} · {conquistas} {conquistas === 1 ? "conquista" : "conquistas"} · desde{" "}
          {new Date(conta.criado_em).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-personagem`} className="text-tinta-700 text-xs">
            Personagem
          </label>
          <select
            id={`${id}-personagem`}
            value={conta.personagem ?? ""}
            disabled={ocupado}
            onChange={(e) => void ligar(e.target.value)}
            className={`${CAMPO} mt-1`}
          >
            <option value="">Nenhum</option>
            {personagens.map((p) => (
              <option key={p.slug} value={p.slug} disabled={ocupados.has(p.slug)}>
                {p.nome}
                {ocupados.has(p.slug) ? " (já tem conta)" : ""}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={novaSenha} className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={`${id}-senha`} className="text-tinta-700 text-xs">
              Senha nova (para quem esqueceu)
            </label>
            <input
              id={`${id}-senha`}
              type="text"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={`${CAMPO} mt-1`}
            />
          </div>
          <button type="submit" disabled={ocupado || !senha} className={BOTAO}>
            Salvar
          </button>
        </form>
      </div>

      {aviso ? (
        <p role="status" className={`mt-3 text-sm ${aviso.erro ? "text-heraldico-vermelho" : "text-tinta-700"}`}>
          {aviso.texto}
        </p>
      ) : null}
    </li>
  );
}

function PedidosPendentes({
  pedidos,
  personagens,
  aoMudar,
}: {
  pedidos: Pedido[];
  personagens: PersonagemDoMestre[];
  aoMudar: () => Promise<void>;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function fazer(acao: () => Promise<string | null>, sucesso?: string) {
    setOcupado(true);
    const erro = await acao();
    setOcupado(false);
    setAviso(erro ?? sucesso ?? null);
    if (!erro) await aoMudar();
    return !erro;
  }

  const sem = async () => null;
  return (
    <section aria-labelledby="titulo-pedidos">
      <h2 id="titulo-pedidos" className="font-titulo text-tinta-900 text-center text-lg font-bold">
        Pedidos esperando você
      </h2>
      <p aria-live="polite" className="text-tinta-700 min-h-5 text-center text-sm">
        {aviso}
      </p>
      {pedidos.length ? (
        <ul className="mt-2 space-y-2">
          {pedidos.map((p) => (
            <LinhaDoPedido
              key={p.id}
              pedido={p}
              quem={personagens.find((x) => x.slug === p.personagem)?.nome ?? p.personagem}
              mestre
              ocupado={ocupado}
              fazer={fazer}
              acoes={{
                mudar: sem,
                tirar: sem,
                gastar: sem,
                pedirItem: sem,
                pedirMoedas: sem,
                desistir: sem,
                resolver: resolverPedido,
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="text-tinta-500 text-center text-sm italic">Nenhum pedido esperando.</p>
      )}
    </section>
  );
}
