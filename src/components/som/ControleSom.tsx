"use client";

import { useEffect, useState } from "react";
import { somLigado, definirSom, prepararEfeitos, tocar } from "@/lib/som";
import { pausarMusica, retomarMusica } from "@/lib/musica";

/**
 * Botão de som, sempre visível, no canto oposto ao selo de navegação.
 * O site abre em silêncio e só toca depois que a pessoa liga.
 */
export function ControleSom() {
  const [ligado, setLigado] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setLigado(somLigado());
    setMontado(true);
    prepararEfeitos();
  }, []);

  // Som de página virando ao seguir qualquer link interno.
  // Fica aqui, num único ouvinte, em vez de espalhado por cada botão
  // do site: assim nenhum link novo precisa lembrar de tocar som.
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      const alvo = (evento.target as HTMLElement | null)?.closest("a");
      if (!alvo) return;

      const href = alvo.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (alvo.getAttribute("target") === "_blank") return;

      tocar("virarPagina");
    }

    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  function alternar() {
    const novo = !ligado;
    setLigado(novo);
    definirSom(novo);

    if (novo) {
      prepararEfeitos();
      // Um retorno audível de que o som foi ligado
      tocar("marcador");
      // Continua de onde a música parou, em vez de recomeçar a faixa
      retomarMusica();
    } else {
      pausarMusica();
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      // aria-pressed só depois de montar, para o servidor e o navegador
      // renderizarem a mesma coisa e não haver aviso de hidratação
      aria-pressed={montado ? ligado : undefined}
      aria-label={ligado ? "Desligar os sons do site" : "Ligar os sons do site"}
      title={ligado ? "Desligar os sons" : "Ligar os sons"}
      className={`border-madeira-600/70 fixed right-4 bottom-4 z-50 grid size-12 place-items-center rounded-full border shadow-lg backdrop-blur-sm transition-colors sm:right-6 sm:bottom-6 ${
        ligado
          ? "bg-heraldico-verde/90 text-pergaminho-50"
          : "bg-madeira-900/85 text-pergaminho-300"
      }`}
    >
      {ligado ? (
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.47 4.47 0 0 0 16.5 12Zm-2.5-9v2.06a7 7 0 0 1 0 13.88V21a9 9 0 0 0 0-18Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M3 9v6h4l5 5V4L7 9H3Zm18.5-1.09L20.09 6.5 17.5 9.09 14.91 6.5 13.5 7.91 16.09 10.5 13.5 13.09l1.41 1.41 2.59-2.59 2.59 2.59 1.41-1.41-2.59-2.59 2.59-2.59Z" />
        </svg>
      )}
    </button>
  );
}
