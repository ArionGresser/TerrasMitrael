"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { tocar } from "@/lib/som";

/**
 * Uma folha de pergaminho que abre por cima da página (um <dialog> de
 * verdade: prende o foco, fecha no Esc e no clique fora).
 */
export function Janela({
  aberta,
  aoFechar,
  titulo,
  larga = false,
  children,
}: {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  /** Para caber uma ficha inteira. */
  larga?: boolean;
  children: ReactNode;
}) {
  const janela = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = janela.current;
    if (!d) return;
    if (aberta && !d.open) {
      d.showModal();
      tocar("abrirMenu");
    }
    if (!aberta && d.open) d.close();
  }, [aberta]);

  return (
    <dialog
      ref={janela}
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) janela.current?.close();
      }}
      aria-label={titulo}
      className={`m-auto ${larga ? "w-[min(96vw,46rem)]" : "w-[min(92vw,30rem)]"} max-w-none bg-transparent p-0 backdrop:bg-black/70`}
    >
      <div className="textura-pergaminho borda-envelhecida pergaminho-borda-2 max-h-[85dvh] overflow-y-auto px-5 py-6 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-titulo text-tinta-900 text-lg font-bold">{titulo}</h2>
          <button
            type="button"
            onClick={() => janela.current?.close()}
            aria-label="Fechar"
            className="text-tinta-500 hover:text-tinta-900 -mt-2 -mr-2 grid size-11 shrink-0 place-items-center text-xl"
          >
            ×
          </button>
        </div>
        <div className="mt-3">{aberta ? children : null}</div>
      </div>
    </dialog>
  );
}

/**
 * O "?" ao lado de cada parte da ficha: abre a regra do glossário numa
 * janela, com o link para ler no Livro do Aventureiro.
 */
export function BotaoDeRegra({ titulo, regra, ancora }: { titulo: string; regra?: ReactNode; ancora: string }) {
  const [aberta, setAberta] = useState(false);
  if (!regra) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        aria-label={`A regra: ${titulo}`}
        title={`A regra: ${titulo}`}
        className="border-dourado-600/50 text-dourado-600 hover:bg-dourado-400/20 font-titulo grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold"
      >
        ?
      </button>
      <Janela aberta={aberta} aoFechar={() => setAberta(false)} titulo={titulo}>
        <div className="text-tinta-900">{regra}</div>
        <Link
          href={`/regras/glossario/#${ancora}`}
          className="text-heraldico-vermelho mt-4 inline-block text-sm underline"
        >
          Ler no glossário
        </Link>
      </Janela>
    </>
  );
}

