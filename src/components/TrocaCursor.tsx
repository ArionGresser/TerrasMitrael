"use client";

import { useEffect, useRef, useState } from "react";
import { CURSORES, aplicarCursor, cursorSalvo } from "@/lib/cursor";
import { tocar } from "@/lib/som";

/**
 * O botão que troca o cursor de mão, ao lado do controle de som.
 *
 * Cada toque passa para a próxima variante e mostra o nome dela num balão,
 * para comparar as mãos navegando pelo site de verdade.
 */
export function TrocaCursor() {
  const [atual, setAtual] = useState<string | null>(null);
  const [balao, setBalao] = useState(false);
  const relogio = useRef<number | null>(null);

  useEffect(() => {
    const salvo = cursorSalvo();
    aplicarCursor(salvo, false);
    setAtual(salvo);
  }, []);

  function trocar() {
    const i = CURSORES.findIndex((c) => c.chave === atual);
    const proximo = CURSORES[(i + 1) % CURSORES.length].chave;
    aplicarCursor(proximo);
    setAtual(proximo);
    tocar("aba");
    setBalao(true);
    if (relogio.current) window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(() => setBalao(false), 1800);
  }

  const cursor = CURSORES.find((c) => c.chave === atual);

  return (
    <div className="relative">
      <span
        role="status"
        className={`bg-madeira-900/95 text-pergaminho-100 border-madeira-600/70 pointer-events-none absolute right-0 bottom-full mb-2 rounded-md border px-2.5 py-1 text-xs whitespace-nowrap shadow-lg transition-opacity duration-200 motion-reduce:transition-none ${
          balao ? "opacity-100" : "opacity-0"
        }`}
      >
        {balao && cursor ? cursor.nome : ""}
      </span>
      <button
        type="button"
        onClick={trocar}
        aria-label={`Trocar o cursor${cursor ? ` (agora: ${cursor.nome})` : ""}`}
        title="Trocar o cursor"
        className="border-madeira-600/70 bg-madeira-900/85 text-pergaminho-300 hover:text-pergaminho-50 grid size-10 shrink-0 place-items-center rounded-full border shadow-lg backdrop-blur-sm transition-colors"
      >
        {atual && atual !== "sistema" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/cursores/${atual}-mao.svg`} alt="" width={26} height={26} />
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M5 2.5v17l4.6-4.4 2.9 6.4 2.8-1.3-2.9-6.2H19L5 2.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
