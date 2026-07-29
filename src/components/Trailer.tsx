"use client";

import { useState } from "react";

/**
 * O trailer só é carregado quando alguém decide assistir.
 *
 * Um <iframe> do YouTube na página traz cerca de 1 MB de scripts e cookies
 * de rastreamento para todo mundo que abre a Home, mesmo quem nunca vai
 * clicar em play. Aqui a capa é desenhada em CSS e o vídeo só entra depois
 * do clique — a Home carrega leve e ninguém é rastreado sem querer.
 */
export function Trailer({
  idVideo,
  titulo,
}: {
  idVideo: string;
  titulo: string;
}) {
  const [carregado, setCarregado] = useState(false);

  if (carregado) {
    return (
      <div className="border-madeira-800/40 relative aspect-video w-full overflow-hidden rounded-sm border">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${idVideo}?autoplay=1`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setCarregado(true)}
      className="group border-madeira-800/40 from-madeira-800 to-madeira-950 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm border bg-gradient-to-br"
      aria-label={`Assistir: ${titulo}`}
    >
      <span className="bg-heraldico-vermelho group-hover:bg-heraldico-vermelho-claro grid size-16 place-items-center rounded-full shadow-lg transition-all group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="text-pergaminho-50 ml-1 size-7" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="text-pergaminho-300 absolute bottom-4 text-xs tracking-wide">
        Toque para assistir no YouTube
      </span>
    </button>
  );
}
