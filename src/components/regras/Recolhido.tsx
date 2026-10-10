"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Dobra } from "@/components/ui/Dobra";
import { ArteDoCartao, CARTAO_COM_ARTE } from "@/components/ui/QuadroDeArte";
import { Carta } from "@/components/cartas/Carta";
import { JanelaDaCarta } from "@/components/cartas/JanelaDaCarta";

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
 * nome. Ao tocar, abre a carta do equipamento, que também se imprime.
 * Um link para o item (#corda) já chega com a carta aberta.
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
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    const conferir = () => setAberta(window.location.hash === `#${id}`);
    conferir();
    window.addEventListener("hashchange", conferir);
    return () => window.removeEventListener("hashchange", conferir);
  }, [id]);

  // Ao fechar, o # sai do endereço, para o mesmo link poder abrir de novo
  function aoFechar() {
    setAberta(false);
    if (window.location.hash === `#${id}`) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  return (
    <div id={id} className="h-full scroll-mt-24">
      <button
        type="button"
        onClick={() => setAberta(true)}
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

      <JanelaDaCarta aberta={aberta} tipo="equipamento" aoFechar={aoFechar}>
        <Carta
          tipo="equipamento"
          nome={titulo}
          arte={arte}
          linhaDeTipo="Equipamento de aventura"
          rodape={detalhe}
        >
          {children}
        </Carta>
      </JanelaDaCarta>
    </div>
  );
}
