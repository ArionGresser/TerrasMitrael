"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { tocar } from "@/lib/som";

export type ItemDaVitrine = {
  chave: string;
  nome: string;
  desenho: ReactNode;
  liberado: boolean;
  /** Para os trancados: o que fazer para liberar. */
  comoLiberar?: string;
};

/**
 * Um botão redondo da barra do canto que abre a vitrine de uma coleção: as
 * mãos do cursor ou os dados da mesa.
 *
 * O que já foi conquistado se escolhe com um toque, e o painel continua
 * aberto para ir comparando. O que ainda está trancado aparece apagado,
 * com cadeado, e ao tocar diz qual conquista libera. Fecha ao tocar fora,
 * no próprio botão ou com Esc.
 */
export function Vitrine({
  titulo,
  rotulo,
  icone,
  itens,
  atual,
  aoEscolher,
}: {
  titulo: string;
  /** O nome do botão para leitor de tela, como "Escolher o cursor". */
  rotulo: string;
  icone: ReactNode;
  itens: ItemDaVitrine[];
  atual: string | null;
  aoEscolher(chave: string): void;
}) {
  const [aberto, setAberto] = useState(false);
  const [dica, setDica] = useState<string | null>(null);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoTocarFora(e: PointerEvent) {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("pointerdown", aoTocarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoTocarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const livres = itens.filter((i) => i.liberado).length;

  return (
    <div ref={raiz} className="relative">
      {aberto ? (
        <div
          role="group"
          aria-label={titulo}
          className="border-madeira-600/70 bg-madeira-900/95 fixed right-4 bottom-20 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border p-2 shadow-2xl backdrop-blur-sm sm:right-6 sm:bottom-24"
        >
          <p className="font-titulo text-dourado-400/90 flex items-baseline justify-between px-2 pt-1 pb-2 text-[0.62rem] tracking-[0.25em] uppercase">
            <span>{titulo}</span>
            <span className="text-pergaminho-300/60 tracking-normal normal-case">
              {livres} de {itens.length}
            </span>
          </p>
          <ul className="grid grid-cols-3 gap-1.5">
            {itens.map((item) => {
              const escolhido = item.chave === atual;
              return (
                <li key={item.chave}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.liberado) {
                        setDica(`${item.nome}: ${item.comoLiberar ?? "ainda trancado"}`);
                        tocar("trinco");
                        return;
                      }
                      setDica(null);
                      aoEscolher(item.chave);
                    }}
                    aria-pressed={item.liberado ? escolhido : undefined}
                    aria-disabled={!item.liberado || undefined}
                    title={item.liberado ? item.nome : `Trancado. ${item.comoLiberar ?? ""}`}
                    className={`relative flex w-full flex-col items-center gap-1 rounded-md border px-1 pt-2 pb-1.5 transition-colors ${
                      escolhido
                        ? "border-dourado-400/80 bg-dourado-400/15"
                        : "hover:border-madeira-500 border-transparent hover:bg-white/5"
                    }`}
                  >
                    <span className={`grid size-11 place-items-center ${item.liberado ? "" : "opacity-35 grayscale"}`}>
                      {item.desenho}
                    </span>
                    {item.liberado ? null : (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden
                        className="text-dourado-400 absolute top-1.5 right-1.5 size-3.5"
                        fill="currentColor"
                      >
                        <path d="M7 10V7.5a5 5 0 0 1 10 0V10h1.2c.7 0 1.3.6 1.3 1.3v8.4c0 .7-.6 1.3-1.3 1.3H5.8c-.7 0-1.3-.6-1.3-1.3v-8.4c0-.7.6-1.3 1.3-1.3H7Zm2.4 0h5.2V7.5a2.6 2.6 0 0 0-5.2 0V10Z" />
                      </svg>
                    )}
                    <span
                      className={`text-center text-[0.68rem] leading-tight ${
                        escolhido ? "text-dourado-300" : item.liberado ? "text-pergaminho-200" : "text-pergaminho-300/50"
                      }`}
                    >
                      {item.nome}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p aria-live="polite" className="text-pergaminho-300 min-h-4 px-2 pt-2 pb-1 text-[0.7rem] leading-snug italic">
            {dica ?? "As peças trancadas se liberam nas Conquistas."}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setAberto(!aberto);
          setDica(null);
          tocar("marcador");
        }}
        aria-expanded={aberto}
        aria-label={rotulo}
        title={rotulo}
        className={`border-madeira-600/70 grid size-10 shrink-0 place-items-center rounded-full border shadow-lg backdrop-blur-sm transition-colors ${
          aberto ? "bg-dourado-600/40 text-pergaminho-50" : "bg-madeira-900/85 text-pergaminho-300 hover:text-pergaminho-50"
        }`}
      >
        {icone}
      </button>
    </div>
  );
}
