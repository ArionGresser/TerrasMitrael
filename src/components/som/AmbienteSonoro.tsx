"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ambienteDaRota, tocarAmbiente, abafarMusica, calarMusica } from "@/lib/musica";

/**
 * Liga a música de fundo à seção em que a pessoa está.
 *
 * Não desenha nada na tela. Fica no layout justamente para sobreviver à
 * troca de página: o site troca de tela sem recarregar, então a faixa
 * continua tocando de Locais para Locais e só muda ao mudar de seção.
 */
export function AmbienteSonoro() {
  const caminho = usePathname();

  useEffect(() => {
    tocarAmbiente(ambienteDaRota(caminho));
    // Quem sai da página com o vídeo tocando não dispara "pause": a música
    // volta aqui, se nenhum vídeo da tela nova estiver tocando
    if (!algumVideoTocando()) calarMusica(false);
  }, [caminho]);

  // As narrações e os vídeos mandam na música: a narração abaixa a faixa, o
  // vídeo cala de vez. Os eventos de mídia não sobem pela árvore, então
  // precisam ser ouvidos na fase de captura para chegarem até aqui.
  useEffect(() => {
    const ehNarracao = (alvo: EventTarget | null) =>
      alvo instanceof HTMLAudioElement;
    const ehVideo = (alvo: EventTarget | null) =>
      alvo instanceof HTMLVideoElement;

    const aoTocar = (evento: Event) => {
      if (ehNarracao(evento.target)) abafarMusica(true);
      if (ehVideo(evento.target)) calarMusica(true);
    };
    const aoParar = (evento: Event) => {
      if (ehVideo(evento.target)) {
        if (!algumVideoTocando()) calarMusica(false);
        return;
      }
      if (!ehNarracao(evento.target)) return;
      // Outra narração pode ter começado antes desta terminar
      const tocando = document.querySelectorAll("audio");
      const algumaAtiva = [...tocando].some((a) => !a.paused && !a.ended);
      if (!algumaAtiva) abafarMusica(false);
    };

    document.addEventListener("play", aoTocar, true);
    document.addEventListener("pause", aoParar, true);
    document.addEventListener("ended", aoParar, true);

    return () => {
      document.removeEventListener("play", aoTocar, true);
      document.removeEventListener("pause", aoParar, true);
      document.removeEventListener("ended", aoParar, true);
    };
  }, []);

  return null;
}

function algumVideoTocando() {
  return [...document.querySelectorAll("video")].some((v) => !v.paused && !v.ended);
}
