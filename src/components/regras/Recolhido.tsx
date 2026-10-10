"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dobra } from "@/components/ui/Dobra";
import {
  ArteDoCartao,
  CARTAO_COM_ARTE,
  QuadroDeArte,
} from "@/components/ui/QuadroDeArte";
import { tocar } from "@/lib/som";

/**
 * As peças de um documento de regra comprido, como o Equipamento: as
 * regras enroladas em pergaminhos, e os objetos em cartões com busca.
 *
 * O texto continua todo no HTML, vindo do servidor; aqui só se decide o que
 * aparece. A busca fica no endereço (?busca=corda), como no Grimório.
 */

const Busca = createContext("");

/** Sem acento nem maiúscula: "pe de cabra" acha "Pé de Cabra". */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function bate(nomes: string[], busca: string): boolean {
  return nomes.some((n) => normalizar(n).includes(busca));
}

export function BuscaNoDocumento({
  itens,
  rotulo,
  dica,
  children,
}: {
  /** Os nomes de cada item, para contar quantos a busca achou. */
  itens: string[][];
  rotulo: string;
  dica: string;
  children: ReactNode;
}) {
  const [texto, setTexto] = useState("");
  const busca = normalizar(texto.trim());

  useEffect(() => {
    setTexto(new URLSearchParams(window.location.search).get("busca") ?? "");
  }, []);

  // Escreve a busca no endereço sem perder o # de quem chegou por um link
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (texto) p.set("busca", texto);
    else p.delete("busca");
    const consulta = p.toString();
    window.history.replaceState(
      null,
      "",
      `${consulta ? `?${consulta}` : window.location.pathname}${window.location.hash}`,
    );
  }, [texto]);

  const achados = useMemo(
    () => (busca ? itens.filter((nomes) => bate(nomes, busca)).length : 0),
    [itens, busca],
  );

  const campo =
    "border-dourado-600/40 bg-pergaminho-50 text-tinta-900 focus-visible:outline-dourado-600 min-h-11 w-full rounded-sm border px-3 text-sm";

  return (
    <Busca.Provider value={busca}>
      <div className="painel-ficha relative mt-6 px-3 pt-6 pb-4 [color-scheme:light] sm:px-5">
        <h2 className="placa-painel font-titulo text-tinta-900 absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[0.66rem] leading-none font-bold tracking-[0.2em] whitespace-nowrap uppercase">
          Procurar
        </h2>
        <div className="flex gap-2">
          <label className="block flex-1">
            <span className="sr-only">{rotulo}</span>
            <input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={dica}
              className={campo}
            />
          </label>
          {texto ? (
            <button
              type="button"
              onClick={() => setTexto("")}
              className="text-tinta-500 hover:text-heraldico-vermelho min-h-11 shrink-0 px-1 text-xs underline underline-offset-4"
            >
              Limpar
            </button>
          ) : null}
        </div>
      </div>

      <p aria-live="polite" className="text-tinta-500 mt-3 text-center text-xs">
        {busca
          ? achados === 1
            ? "1 item encontrado"
            : `${achados} itens encontrados`
          : ""}
      </p>

      {busca && achados === 0 ? (
        <p className="text-tinta-700 mt-6 text-center text-sm italic">
          Nada com esse nome por aqui. Tente outra palavra.
        </p>
      ) : null}

      {children}
    </Busca.Provider>
  );
}

/**
 * Um pedaço da lista que some quando a busca não acha nada nele.
 */
export function Filtravel({
  nomes,
  children,
  as: Tag = "div",
  className = "",
}: {
  nomes: string[];
  children: ReactNode;
  as?: "div" | "li";
  className?: string;
}) {
  const busca = useContext(Busca);
  const visivel = !busca || bate(nomes, busca);
  return (
    <Tag hidden={!visivel} className={className}>
      {children}
    </Tag>
  );
}

/** Uma regra ou uma tabela num pergaminho enrolado. */
export function TopicoRecolhido({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <Dobra titulo={titulo} ancora={id}>
        {children}
      </Dobra>
    </div>
  );
}

/**
 * Um objeto do equipamento de aventura num cartão, com a arte grande e o
 * nome. Ao tocar, abre uma janela com a pintura maior, o preço e a regra.
 * Um link para o item (#corda) já chega com a janela aberta.
 */
export function ItemComArte({
  id,
  titulo,
  detalhe,
  arte,
  children,
}: {
  id: string;
  titulo: string;
  /** O preço e o peso, como "25 PO · 0,5 kg". */
  detalhe?: string;
  arte?: string;
  children: ReactNode;
}) {
  const janela = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const conferir = () => {
      const d = janela.current;
      if (!d) return;
      if (window.location.hash === `#${id}`) {
        if (!d.open) d.showModal();
      } else if (d.open) d.close();
    };
    conferir();
    window.addEventListener("hashchange", conferir);
    return () => window.removeEventListener("hashchange", conferir);
  }, [id]);

  function abrir() {
    tocar("abrirMenu");
    janela.current?.showModal();
  }

  function fechar() {
    janela.current?.close();
  }

  // Ao fechar, o # sai do endereço, para o mesmo link poder abrir de novo
  function aoFechar() {
    tocar("fecharMenu");
    if (window.location.hash === `#${id}`) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  return (
    <div id={id} className="h-full scroll-mt-24">
      <button
        type="button"
        onClick={abrir}
        aria-haspopup="dialog"
        className={CARTAO_COM_ARTE}
      >
        <ArteDoCartao src={arte} />
        <span className="min-w-0 flex-1">
          <span className="text-tinta-900 block leading-snug font-semibold group-hover:underline">
            {titulo}
          </span>
          {detalhe ? (
            <span className="text-tinta-500 mt-0.5 block text-xs italic">
              {detalhe}
            </span>
          ) : null}
        </span>
      </button>

      <dialog
        ref={janela}
        onClose={aoFechar}
        // Tocar fora do papel fecha a janela
        onClick={(e) => {
          if (e.target === e.currentTarget) fechar();
        }}
        aria-labelledby={`${id}-titulo`}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100%-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-black/70"
      >
        <div className="textura-pergaminho borda-envelhecida pergaminho-borda-1 text-tinta-900 relative max-h-[calc(100dvh-2rem)] overflow-y-auto px-5 pt-12 pb-7 sm:px-8">
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="text-tinta-700 hover:text-heraldico-vermelho absolute top-2 right-2 grid size-11 place-items-center text-xl"
          >
            <span aria-hidden>✕</span>
          </button>
          <QuadroDeArte
            src={arte}
            alt={`Ilustração: ${titulo}`}
            formato="quadrado"
          />
          <h3
            id={`${id}-titulo`}
            className="font-titulo text-tinta-900 mt-5 text-center text-2xl font-bold"
          >
            {titulo}
          </h3>
          {detalhe ? (
            <p className="text-tinta-500 mt-1 text-center text-sm italic">
              {detalhe}
            </p>
          ) : null}
          <div className="mt-5 [&>*:first-child]:mt-0">{children}</div>
        </div>
      </dialog>
    </div>
  );
}
