"use client";

import { useState, type ReactNode } from "react";

const VERSO = "/images/cartas/carta-verso.webp";

/**
 * A carta com as duas faces: a frente (a carta montada) e o verso, a mesma
 * pintura para todas as cartas. Quem segura é o `verso`; a janela da carta e
 * as páginas decidem onde fica o botão de virar.
 *
 * A carta inclina sob o ponteiro (ver Ampliador). A face que está de costas
 * sai da leitura de tela, para o texto não ser lido duas vezes.
 */
export function GiroDaCarta({ verso, children }: { verso: boolean; children: ReactNode }) {
  return (
    <div data-inclinar className="rounded-[4%]">
      <div className="carta-giro" data-verso={verso ? "" : undefined}>
        <div className="carta-face" aria-hidden={verso || undefined}>
          {children}
        </div>
        <div className="carta-face carta-face-verso" aria-hidden={!verso || undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VERSO} alt="O verso da carta" className="size-full object-fill" draggable={false} />
        </div>
      </div>
    </div>
  );
}

/** O texto do botão de virar. */
export const rotuloDoGiro = (verso: boolean) => (verso ? "Ver a frente" : "Ver o verso");

/** A carta numa página, com o botão de virar logo embaixo. */
export function CartaComVerso({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [verso, setVerso] = useState(false);
  return (
    <div className={className}>
      <GiroDaCarta verso={verso}>{children}</GiroDaCarta>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setVerso((v) => !v)}
          aria-pressed={verso}
          className="border-dourado-600/60 text-tinta-900 hover:bg-dourado-400/20 font-titulo inline-flex min-h-11 items-center justify-center rounded-sm border px-5 text-sm font-semibold tracking-wide transition-colors"
        >
          {rotuloDoGiro(verso)}
        </button>
      </div>
    </div>
  );
}
