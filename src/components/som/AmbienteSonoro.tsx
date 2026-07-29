"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ambienteDaRota, tocarAmbiente, abafarMusica } from "@/lib/musica";

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
  }, [caminho]);

  // As narrações mandam na música. Os eventos de áudio não sobem pela árvore,
  // então precisam ser ouvidos na fase de captura para chegarem até aqui.
  useEffect(() => {
    const ehNarracao = (alvo: EventTarget | null) =>
      alvo instanceof HTMLAudioElement;

    const aoTocar = (evento: Event) => {
      if (ehNarracao(evento.target)) abafarMusica(true);
    };
    const aoParar = (evento: Event) => {
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
