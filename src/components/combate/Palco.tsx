"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import type { GolpeNaTela, Lutador } from "@/lib/combate";
import { tocar } from "@/lib/som";

/** Um lutador do jeito que cada um pode ver. */
export type Cartao = {
  id: string;
  tipo: Lutador["tipo"];
  slug: string;
  nome: string;
  iniciativa: number | null;
  condicoes: string[];
  imagem?: string;
  estado: string;
  pv?: number;
  pvMaximo?: number;
  ca?: number;
  concentrando?: string;
};

export const COR_DO_ESTADO: Record<string, string> = {
  Ileso: "text-[#7fd17a]",
  Ferido: "text-[#f0c060]",
  "Muito ferido": "text-[#ff8f7a]",
  Caído: "text-[#b9aa96]",
  Fugiu: "text-[#b9aa96]",
};

/**
 * O palco da arena: a muralha, a areia, os inimigos de um lado e os
 * aventureiros do outro. Quem olha decide o lado: o jogador vê os inimigos
 * em cima; o Mestre, as próprias criaturas embaixo.
 *
 * Embaixo de cada fileira cabe uma sanfona: a ficha de quem foi tocado abre
 * ali mesmo, sem cobrir a arena.
 *
 * Quando chega um golpe novo, o cartão de quem ataca se levanta, avança
 * até o alvo e volta; o alvo treme, brilha e solta o número. Todas as telas
 * veem o mesmo golpe ao mesmo tempo.
 */
export function Palco({
  cartoes,
  inimigosEmCima,
  meu,
  vez,
  aberto,
  mirando,
  escondido,
  golpe,
  animarSempre = false,
  tocarCartao,
  sanfonaDosInimigos,
  sanfonaDosAliados,
}: {
  cartoes: Cartao[];
  inimigosEmCima: boolean;
  /** O slug do personagem de quem olha: fica no meio, maior. */
  meu?: string | null;
  vez: string | null;
  /** O id de quem está com a ficha aberta. */
  aberto?: string | null;
  /** Escolhendo um alvo: todos pulsam. */
  mirando?: boolean;
  /** Os números das criaturas ficam "???". */
  escondido: boolean;
  golpe?: GolpeNaTela;
  /** No replay o golpe anima mesmo sendo antigo. */
  animarSempre?: boolean;
  tocarCartao?: (c: Cartao) => void;
  sanfonaDosInimigos?: ReactNode;
  sanfonaDosAliados?: ReactNode;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  useGolpe(raiz, golpe, animarSempre);

  const aliados = cartoes.filter((c) => c.tipo === "personagem");
  const inimigos = cartoes.filter((c) => c.tipo === "criatura");
  const meuCartao = meu ? aliados.find((c) => c.slug === meu) : undefined;
  const outros = meuCartao ? aliados.filter((a) => a.id !== meuCartao.id) : aliados;
  const metade = Math.ceil(outros.length / 2);
  const ordemDosAliados = meuCartao ? [...outros.slice(0, metade), meuCartao, ...outros.slice(metade)] : aliados;

  const faixaDeInimigos = (
    <Faixa titulo="Inimigos" lado="inimigos" sanfona={sanfonaDosInimigos}>
      {inimigos.map((c) => (
        <CartaoDeInimigo
          key={c.id}
          c={c}
          vez={c.id === vez}
          aberto={c.id === aberto}
          mirando={Boolean(mirando)}
          escondido={escondido}
          tocar={tocarCartao ? () => tocarCartao(c) : undefined}
        />
      ))}
      {!inimigos.length ? <li className="text-sm text-[#e9dcc6] italic">Nenhum inimigo.</li> : null}
    </Faixa>
  );

  const faixaDeAliados = (
    <Faixa titulo="Aventureiros" lado="aliados" sanfona={sanfonaDosAliados}>
      {ordemDosAliados.map((c) => (
        <Medalhao
          key={c.id}
          c={c}
          vez={c.id === vez}
          meu={c.id === meuCartao?.id}
          aberto={c.id === aberto}
          mirando={Boolean(mirando)}
          tocar={tocarCartao ? () => tocarCartao(c) : undefined}
        />
      ))}
    </Faixa>
  );

  return (
    <div ref={raiz} className="arena-muralha relative rounded-[1.75rem] p-2.5 sm:p-3.5">
      <Tocha lado="esquerda" />
      <Tocha lado="direita" />
      <div className="arena-areia relative space-y-4 rounded-[1.25rem] px-2 py-4 sm:px-4">
        {inimigosEmCima ? faixaDeInimigos : faixaDeAliados}
        <div aria-hidden className="arena-risco mx-auto h-px w-3/4" />
        {inimigosEmCima ? faixaDeAliados : faixaDeInimigos}
      </div>
    </div>
  );
}

/** Anima o golpe: quem ataca avança até o alvo, o alvo treme e solta o número. */
function useGolpe(raiz: React.RefObject<HTMLDivElement | null>, golpe: GolpeNaTela | undefined, sempre: boolean) {
  const visto = useRef<number | null>(null);
  useEffect(() => {
    if (!golpe || !raiz.current) return;
    const primeiro = visto.current === null;
    if (visto.current === golpe.id) return;
    visto.current = golpe.id;
    // Ao abrir a página, o golpe antigo que está salvo não anima de novo
    if (!sempre && (primeiro || Date.now() - golpe.id > 20000)) return;

    const achar = (id: string) => raiz.current?.querySelector<HTMLElement>(`[data-lutador="${CSS.escape(id)}"]`);
    const de = achar(golpe.de);
    const para = achar(golpe.para);
    if (!para) return;
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tipo = golpe.cura ? "cura" : !golpe.acertou ? "erro" : golpe.critico ? "critico" : "acerto";

    const impacto = () => {
      const alvo = para.querySelector<HTMLElement>("[data-retrato]") ?? para;
      const clarao = document.createElement("span");
      clarao.className = "golpe-impacto";
      clarao.dataset.tipo = tipo;
      const rotulo = document.createElement("span");
      rotulo.className = "golpe-rotulo";
      rotulo.dataset.tipo = tipo;
      rotulo.textContent = golpe.rotulo;
      alvo.append(clarao, rotulo);
      setTimeout(() => clarao.remove(), 600);
      setTimeout(() => rotulo.remove(), 2100);
      if (!calmo && golpe.acertou && !golpe.cura) {
        para.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-7px) rotate(-2deg)" },
            { transform: "translateX(6px) rotate(2deg)" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 380, easing: "ease-out" }
        );
      }
      tocar(golpe.cura ? "feitico" : golpe.acertou ? "lamina" : "metal");
    };

    if (calmo || !de || de === para) {
      impacto();
      return;
    }

    const a = de.getBoundingClientRect();
    const b = para.getBoundingClientRect();
    const dx = (b.left + b.width / 2 - (a.left + a.width / 2)) * 0.72;
    const dy = (b.top + b.height / 2 - (a.top + a.height / 2)) * 0.72;
    de.style.zIndex = "30";
    const ida = de.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: "translate(0, -14px) scale(1.12) rotate(-3deg)", offset: 0.3 },
        { transform: `translate(${dx}px, ${dy}px) scale(1.14)`, offset: 0.55 },
        { transform: "translate(0, 0) scale(1)" },
      ],
      { duration: 950, easing: "cubic-bezier(.3,.7,.4,1)" }
    );
    const quando = setTimeout(impacto, 520);
    ida.onfinish = () => {
      de.style.zIndex = "";
    };
    return () => clearTimeout(quando);
  }, [golpe, raiz, sempre]);
}

function Faixa({ titulo, lado, sanfona, children }: { titulo: string; lado: "inimigos" | "aliados"; sanfona?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={titulo}>
      <h2
        className={`font-titulo mb-2 text-center text-[0.7rem] font-bold tracking-[0.25em] uppercase ${
          lado === "aliados" ? "text-[#a8cbe6]" : "text-[#ff9d8a]"
        }`}
      >
        {titulo}
      </h2>
      <ul className="flex flex-wrap items-end justify-center gap-x-3 gap-y-3">{children}</ul>
      <div className="arena-sanfona" data-aberta={Boolean(sanfona)}>
        <div>{sanfona ? <div className="pt-3">{sanfona}</div> : null}</div>
      </div>
    </section>
  );
}

function Tocha({ lado }: { lado: "esquerda" | "direita" }) {
  return (
    <span aria-hidden className={`arena-tocha pointer-events-none absolute top-4 ${lado === "esquerda" ? "-left-1.5" : "-right-1.5"}`}>
      <span className="arena-chama" />
    </span>
  );
}

export function Barra({ pv, max }: { pv: number; max: number }) {
  const f = max ? Math.min(1, pv / max) : 0;
  return (
    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-black/40" aria-hidden>
      <span className={`block h-full rounded-full ${f > 0.5 ? "bg-[#5cb85c]" : f > 0.25 ? "bg-[#e0a030]" : "bg-[#e0533f]"}`} style={{ width: `${f * 100}%` }} />
    </span>
  );
}

function Condicoes({ lista }: { lista: string[] }) {
  if (!lista.length) return null;
  return (
    <span className="mt-0.5 flex flex-wrap justify-center gap-0.5">
      {lista.map((c) => (
        <span key={c} className="rounded-full bg-[#5a1a12]/90 px-1.5 text-[0.58rem] leading-relaxed font-semibold text-[#ffd2c8]">
          {c}
        </span>
      ))}
    </span>
  );
}

/** Um aliado: o retrato num medalhão redondo. O do próprio jogador é maior e dourado. */
function Medalhao({
  c,
  vez,
  meu,
  aberto,
  mirando,
  tocar,
}: {
  c: Cartao;
  vez: boolean;
  meu: boolean;
  aberto: boolean;
  mirando: boolean;
  tocar?: () => void;
}) {
  const caido = c.estado === "Caído";
  return (
    <li data-lutador={c.id} className={`relative flex flex-col items-center ${meu ? "w-28 sm:w-32" : "w-[4.75rem] sm:w-24"}`}>
      <button
        type="button"
        onClick={tocar}
        disabled={!tocar}
        aria-expanded={aberto}
        aria-label={mirando ? `Mirar em ${c.nome}` : `${aberto ? "Fechar" : "Abrir"} a ficha de ${c.nome}`}
        data-retrato
        className={`relative block aspect-square w-full rounded-full border-4 bg-[#2a1e14] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform enabled:hover:scale-105 ${
          vez ? "border-[#ffcf6b] ring-4 ring-[#c0392b]/80" : meu ? "border-[#e6b94c]" : "border-[#8b6a43]"
        } ${aberto ? "ring-4 ring-[#7fd0ff]" : ""} ${mirando ? "arena-mira" : ""}`}
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          {c.imagem ? <Image src={c.imagem} alt="" fill sizes="128px" className={`object-cover object-top ${caido ? "grayscale" : ""}`} /> : null}
        </span>
      </button>
      <span className="bg-madeira-900 text-pergaminho-50 absolute top-0 left-0 rounded-full px-1.5 text-[0.65rem] font-bold tabular-nums shadow">
        {c.iniciativa ?? "–"}
      </span>
      <span className={`font-titulo mt-1 w-full truncate text-center leading-tight font-bold text-[#f3e6cf] ${meu ? "text-sm" : "text-xs"}`}>
        {vez ? <span className="text-[#ffcf6b]">▶ </span> : null}
        {meu ? "Você" : c.nome.split(" ")[0]}
      </span>
      {c.pv !== undefined && c.pvMaximo ? (
        <>
          <span className="text-[0.7rem] text-[#e9dcc6] tabular-nums">
            {c.pv}/{c.pvMaximo} PV
          </span>
          <Barra pv={c.pv} max={c.pvMaximo} />
        </>
      ) : (
        <span className={`text-[0.7rem] font-semibold ${COR_DO_ESTADO[c.estado] ?? "text-[#e9dcc6]"}`}>{c.estado}</span>
      )}
      <Condicoes lista={c.condicoes} />
    </li>
  );
}

/** Um inimigo: a arte num cartão. Para os jogadores, os números são "???". */
function CartaoDeInimigo({
  c,
  vez,
  aberto,
  mirando,
  escondido,
  tocar,
}: {
  c: Cartao;
  vez: boolean;
  aberto: boolean;
  mirando: boolean;
  escondido: boolean;
  tocar?: () => void;
}) {
  const fora = c.estado === "Caído" || c.estado === "Fugiu";
  return (
    <li data-lutador={c.id} className={`relative w-[6.5rem] sm:w-32 ${fora ? "opacity-60" : ""}`}>
      <button
        type="button"
        onClick={tocar}
        disabled={!tocar}
        aria-expanded={aberto}
        aria-label={mirando ? `Mirar em ${c.nome}` : `${aberto ? "Fechar" : "Abrir"} a ficha de ${c.nome}`}
        className={`block w-full rounded-lg border-2 bg-[#3a2a1c]/90 p-1.5 text-left shadow-[0_4px_10px_rgba(0,0,0,0.45)] transition-transform enabled:hover:-translate-y-0.5 ${
          aberto ? "border-[#7fd0ff]" : vez ? "border-[#ffcf6b]" : "border-[#7a2b22]"
        } ${mirando && !fora ? "arena-mira" : ""}`}
      >
        <span data-retrato className="relative block aspect-square w-full rounded-md bg-[#2a1e14]">
          <span className="absolute inset-0 overflow-hidden rounded-md">
            {c.imagem ? <Image src={c.imagem} alt="" fill sizes="140px" className={`object-cover ${fora ? "grayscale" : ""}`} /> : null}
          </span>
          <span className="bg-madeira-900/90 text-pergaminho-50 absolute top-1 left-1 rounded-sm px-1.5 text-[0.65rem] font-bold tabular-nums">
            {c.iniciativa ?? "–"}
          </span>
        </span>
        <span className="font-titulo mt-1 block truncate text-xs leading-tight font-bold text-[#f3e6cf]">
          {vez ? <span className="text-[#ffcf6b]">▶ </span> : null}
          {c.nome}
        </span>
        <span className="block text-[0.68rem] text-[#e9dcc6] tabular-nums">
          CA {escondido ? "???" : (c.ca ?? "–")} · PV {escondido ? "???" : `${c.pv}/${c.pvMaximo}`}
        </span>
        {!escondido && c.pv !== undefined && c.pvMaximo ? <Barra pv={c.pv} max={c.pvMaximo} /> : null}
        <span className={`block text-[0.68rem] font-semibold ${COR_DO_ESTADO[c.estado] ?? "text-[#e9dcc6]"}`}>{c.estado}</span>
        <Condicoes lista={c.condicoes} />
      </button>
    </li>
  );
}
