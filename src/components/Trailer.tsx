"use client";

import { useEffect, useRef, useState } from "react";
import { Selo } from "@/components/ui/Selo";

/**
 * O vídeo de apresentação, servido pelo próprio site.
 *
 * Até alguém decidir assistir, só existe a capa: um quadro do vídeo,
 * desfocado, com o selo de cera do play no meio. O arquivo do vídeo (uns
 * 20 MB) só começa a baixar depois do clique, então a página inicial
 * continua leve, e ninguém é rastreado por player de terceiros.
 */
export function Trailer({
  video,
  capa,
  titulo,
  duracao,
}: {
  video: string;
  capa: string;
  titulo: string;
  /** Como "1:16", escrito embaixo do selo. */
  duracao: string;
}) {
  const [tocando, setTocando] = useState(false);
  const player = useRef<HTMLVideoElement>(null);

  // Quem abriu pelo teclado continua no vídeo, com os controles na mão
  useEffect(() => {
    if (tocando) player.current?.focus();
  }, [tocando]);

  if (tocando) {
    return (
      <div className="border-madeira-800/40 relative aspect-video w-full overflow-hidden rounded-sm border bg-black">
        <video
          ref={player}
          src={video}
          poster={capa}
          title={titulo}
          controls
          autoPlay
          playsInline
          preload="auto"
          className="absolute inset-0 size-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTocando(true)}
      className="group border-madeira-800/40 focus-visible:outline-dourado-400 relative block aspect-video w-full overflow-hidden rounded-sm border bg-black focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={`Assistir: ${titulo} (${duracao})`}
    >
      <img
        src={capa}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full scale-110 object-cover blur-[5px] brightness-[0.62] transition-[filter] duration-500 group-hover:blur-[3px] group-hover:brightness-[0.72]"
      />
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,7,4,0.7)_100%)]" />

      <span aria-hidden className="absolute inset-0 grid place-items-center">
        <span className="relative block size-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6 motion-safe:group-active:scale-95 sm:size-24">
          <Selo emblema="play" id="selo-video" className="size-full" />
        </span>
      </span>

      <span
        aria-hidden
        className="font-titulo text-pergaminho-100 absolute inset-x-0 bottom-3 text-center text-[0.65rem] tracking-[0.3em] uppercase [text-shadow:0_1px_3px_#000] sm:bottom-5 sm:text-xs"
      >
        Assistir · {duracao}
      </span>
    </button>
  );
}
