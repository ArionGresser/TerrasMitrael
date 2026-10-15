"use client";

import { useEffect, useRef, useState } from "react";
import { Selo } from "@/components/ui/Selo";
import { tocar } from "@/lib/som";

type Arte = { src: string; alt: string; legenda?: string };

/** O quanto a arte inclina, em graus, com o ponteiro na borda. */
const INCLINACAO = 7;

/**
 * Duas coisas para o site inteiro, montadas uma vez só na Mesa:
 *
 * 1. A arte ampliada. Qualquer lupa do site (BotaoAmpliar) abre a arte por
 *    cima da tela, ocupando quase tudo, com a página ainda à vista atrás,
 *    escurecida e desfocada. O selo de voltar, o Esc ou um toque fora fecham.
 *
 * 2. A inspeção. Tudo o que tem [data-inclinar] (a arte ampliada e as
 *    cartas) acompanha o dedo ou o mouse: inclina para o lado do ponteiro e
 *    um brilho corre por cima, como quem vira uma carta contra a luz. Quem
 *    pediu menos movimento ao sistema não vê a inclinação.
 */
export function Ampliador() {
  const [arte, setArte] = useState<Arte | null>(null);
  const janela = useRef<HTMLDialogElement>(null);

  // A lupa: ouvida no documento inteiro, para servir a toda arte do site
  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      const botao = (e.target as Element | null)?.closest?.<HTMLElement>("[data-ampliar]");
      if (!botao?.dataset.ampliar) return;
      e.preventDefault();
      e.stopPropagation();
      setArte({ src: botao.dataset.ampliar, alt: botao.dataset.alt ?? "", legenda: botao.dataset.legenda });
    }
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  useEffect(() => {
    const d = janela.current;
    if (!d) return;
    if (arte && !d.open) {
      d.showModal();
      tocar("abrirMenu");
    }
  }, [arte]);

  // A inspeção: um só ouvinte para todas as artes e cartas inclináveis
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ativo: HTMLElement | null = null;
    let quadro = 0;
    let ultimo: PointerEvent | null = null;

    const soltar = () => {
      if (!ativo) return;
      ativo.style.removeProperty("--rx");
      ativo.style.removeProperty("--ry");
      ativo.removeAttribute("data-inclinando");
      ativo = null;
    };

    const aplicar = () => {
      quadro = 0;
      const e = ultimo;
      if (!e) return;
      const alvo = (e.target as Element | null)?.closest?.<HTMLElement>("[data-inclinar]") ?? null;
      if (alvo !== ativo) soltar();
      if (!alvo) return;
      ativo = alvo;
      const r = alvo.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      alvo.style.setProperty("--ry", `${((x - 0.5) * 2 * INCLINACAO).toFixed(2)}deg`);
      alvo.style.setProperty("--rx", `${((0.5 - y) * 2 * INCLINACAO).toFixed(2)}deg`);
      alvo.style.setProperty("--bx", `${(x * 100).toFixed(1)}%`);
      alvo.style.setProperty("--by", `${(y * 100).toFixed(1)}%`);
      alvo.setAttribute("data-inclinando", "");
    };

    const mover = (e: PointerEvent) => {
      ultimo = e;
      if (!quadro) quadro = requestAnimationFrame(aplicar);
    };
    const sair = (e: PointerEvent) => {
      if (!ativo) return;
      const para = e.relatedTarget as Node | null;
      if (!para || !ativo.contains(para)) soltar();
    };

    document.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerout", sair, { passive: true });
    document.addEventListener("pointerup", soltar, { passive: true });
    document.addEventListener("pointercancel", soltar, { passive: true });
    return () => {
      document.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerout", sair);
      document.removeEventListener("pointerup", soltar);
      document.removeEventListener("pointercancel", soltar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, []);

  const fechar = () => janela.current?.close();

  return (
    <dialog
      ref={janela}
      aria-label={arte?.alt || "Arte ampliada"}
      onClose={() => {
        tocar("fecharMenu");
        setArte(null);
      }}
      onClick={(e) => {
        // Tocar fora da arte fecha
        if (!(e.target as Element).closest("[data-inclinar], [data-voltar]")) fechar();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-md"
    >
      {arte ? (
        <>
          <button
            type="button"
            data-voltar
            onClick={fechar}
            autoFocus
            className="group focus-visible:outline-dourado-400 fixed top-3 left-3 z-10 inline-flex items-start gap-2.5 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 sm:top-5 sm:left-5"
          >
            <span className="relative block size-12 shrink-0 drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out motion-safe:group-hover:-rotate-[10deg] motion-safe:group-hover:scale-105 motion-safe:group-active:scale-95">
              <Selo emblema="voltar" id="selo-volta-ampliada" className="size-full" />
            </span>
            <span className="font-titulo text-dourado-400/90 pt-1 text-[0.58rem] tracking-[0.28em] uppercase">
              Voltar
            </span>
          </button>

          <figure className="flex h-full flex-col items-center justify-center gap-3 px-3 py-16 sm:px-10">
            <div
              data-inclinar
              className="overflow-hidden rounded-sm border border-black/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]"
              style={{ touchAction: "none" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={arte.src}
                alt={arte.alt}
                className="block max-h-[78dvh] w-auto max-w-[94vw] object-contain select-none"
                draggable={false}
              />
            </div>
            {arte.legenda ? (
              <figcaption className="text-pergaminho-100/90 max-w-xl text-center text-sm italic [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">
                {arte.legenda}
              </figcaption>
            ) : null}
          </figure>
        </>
      ) : null}
    </dialog>
  );
}
