"use client";

import { useEffect, useRef, useState } from "react";
import { somLigado, definirSom, prepararEfeitos, tocar } from "@/lib/som";
import {
  pausarMusica,
  retomarMusica,
  fracaoDoVolume,
  definirVolumeDaMusica,
  VOLUME_PADRAO,
} from "@/lib/musica";

/**
 * O controle da música de fundo, sempre visível, no canto oposto ao selo.
 *
 * Manda na trilha, não nos efeitos: o roçar do pergaminho responde ao toque
 * de quem está ali e continua valendo com a música desligada.
 *
 * O botão redondo abre uma régua de volume ao lado, com o mudo na ponta.
 * Quem chega pela primeira vez entra com a régua em pouco mais de um terço,
 * que é altura de fundo: dá para ler por cima sem ter que abaixar nada.
 *
 * O site abre com música. Como todo navegador proíbe áudio antes de alguém
 * interagir com a página, ela não começa no carregamento: entra no primeiro
 * toque ou tecla.
 */
export function ControleSom() {
  const [ligado, setLigado] = useState(false);
  const [volume, setVolume] = useState(VOLUME_PADRAO);
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLigado(somLigado());
    setVolume(fracaoDoVolume());
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

  // A régua se recolhe ao tocar fora ou apertar Esc, como todo painel que
  // abre por cima do conteúdo.
  useEffect(() => {
    if (!aberto) return;

    function aoTocarFora(evento: PointerEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }

    document.addEventListener("pointerdown", aoTocarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoTocarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  function alternarMudo() {
    const novo = !ligado;
    setLigado(novo);
    definirSom(novo);

    // Retorno audível dos dois lados: o efeito não obedece a este botão
    tocar("marcador");

    if (novo) {
      // Continua de onde a música parou, em vez de recomeçar a faixa
      retomarMusica();
    } else {
      pausarMusica();
    }
  }

  function mudarVolume(fracao: number) {
    setVolume(fracao);
    definirVolumeDaMusica(fracao);

    // Puxar a régua até o fim é a maneira mais direta de pedir silêncio, e
    // sair do zero é a maneira mais direta de pedir a música de volta.
    if (fracao === 0 && ligado) {
      setLigado(false);
      definirSom(false);
      pausarMusica();
      return;
    }
    if (fracao > 0 && !ligado) {
      setLigado(true);
      definirSom(true);
      retomarMusica();
    }
  }

  return (
    <div
      ref={raiz}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 sm:right-6 sm:bottom-6"
    >
      {/* A régua, que sai de dentro do botão para a esquerda */}
      <div
        className={`border-madeira-600/70 bg-madeira-900/90 flex items-center gap-2 overflow-hidden rounded-full border py-2 shadow-lg backdrop-blur-sm transition-all duration-300 ${
          aberto
            ? "max-w-56 pr-3 pl-2 opacity-100"
            : "pointer-events-none max-w-0 border-transparent px-0 opacity-0"
        }`}
        inert={!aberto || undefined}
      >
        <button
          type="button"
          onClick={alternarMudo}
          aria-pressed={montado ? !ligado : undefined}
          aria-label={ligado ? "Emudecer a música" : "Devolver a música"}
          className="text-pergaminho-300 hover:text-pergaminho-50 grid size-8 shrink-0 place-items-center rounded-full transition-colors"
        >
          <IconeSom ligado={ligado} className="size-4" />
        </button>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(volume * 100)}
          onChange={(evento) => mudarVolume(Number(evento.target.value) / 100)}
          aria-label="Volume da música"
          className="regua-volume w-28 shrink-0"
          style={{ "--preenchido": `${volume * 100}%` } as React.CSSProperties}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          setAberto(!aberto);
          tocar("marcador");
        }}
        aria-expanded={montado ? aberto : undefined}
        aria-label="Controle da música de fundo"
        title="Música de fundo"
        className={`border-madeira-600/70 grid size-12 shrink-0 place-items-center rounded-full border shadow-lg backdrop-blur-sm transition-colors ${
          ligado
            ? "bg-heraldico-verde/90 text-pergaminho-50"
            : "bg-madeira-900/85 text-pergaminho-300"
        }`}
      >
        <IconeSom ligado={ligado} className="size-5" />
      </button>
    </div>
  );
}

function IconeSom({
  ligado,
  className,
}: {
  ligado: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      {ligado ? (
        <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.47 4.47 0 0 0 16.5 12Zm-2.5-9v2.06a7 7 0 0 1 0 13.88V21a9 9 0 0 0 0-18Z" />
      ) : (
        <path d="M3 9v6h4l5 5V4L7 9H3Zm18.5-1.09L20.09 6.5 17.5 9.09 14.91 6.5 13.5 7.91 16.09 10.5 13.5 13.09l1.41 1.41 2.59-2.59 2.59 2.59 1.41-1.41-2.59-2.59 2.59-2.59Z" />
      )}
    </svg>
  );
}
