"use client";

import { useEffect, useRef, useState } from "react";
import {
  somLigado,
  definirSom,
  efeitosLigados,
  definirEfeitos,
  tocarDestino,
  prepararEfeitos,
  tocar,
} from "@/lib/som";
import {
  pausarMusica,
  retomarMusica,
  fracaoDoVolume,
  definirVolumeDaMusica,
  anteciparRota,
  VOLUME_PADRAO,
} from "@/lib/musica";
import { TrocaCursor } from "@/components/TrocaCursor";
import { TrocaDado } from "@/components/TrocaDado";
import { DadoNoCelular } from "@/components/mesa/DadoNoCelular";

/**
 * O controle da música de fundo, sempre visível, no canto oposto ao selo.
 *
 * Manda na trilha, não nos efeitos: o roçar do pergaminho responde ao toque
 * de quem está ali e continua valendo com a música desligada. Os efeitos têm
 * o próprio interruptor, a varinha na ponta da régua.
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
  const [efeitos, setEfeitos] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLigado(somLigado());
    setVolume(fracaoDoVolume());
    setEfeitos(efeitosLigados());
    setMontado(true);
    prepararEfeitos();
  }, []);

  // Som de página virando ao seguir qualquer link interno, e a música do
  // destino já começando a vir no mesmo clique.
  // Fica aqui, num único ouvinte, em vez de espalhado por cada botão
  // do site: assim nenhum link novo precisa lembrar de tocar som.
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      const alvo = (evento.target as HTMLElement | null)?.closest("a");
      if (!alvo) return;

      const href = alvo.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (alvo.getAttribute("target") === "_blank") return;

      const destino = new URL(href, window.location.href).pathname;
      tocarDestino(destino);
      anteciparRota(destino);
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

  function alternarEfeitos() {
    const novo = !efeitos;
    setEfeitos(novo);
    definirEfeitos(novo);
    // Quem liga ouve o que ligou; quem desliga já não ouve nada
    if (novo) {
      prepararEfeitos();
      tocar("brilho", 2);
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
      {/* As coleções que as conquistas liberam: o dado da mesa e a mão do
          cursor. Sem a mesa do computador, o d20 abre a mesa em tela cheia;
          no toque não existe cursor, então a manopla sai */}
      <TrocaDado />
      <DadoNoCelular />
      <div className="pointer-coarse:hidden">
        <TrocaCursor />
      </div>

      {/* A régua, que sai de dentro do botão para a esquerda */}
      <div
        className={`border-madeira-600/70 bg-madeira-900/90 flex items-center gap-2 overflow-hidden rounded-full border py-2 shadow-lg backdrop-blur-sm transition-all duration-300 ${
          aberto
            ? "max-w-72 pr-2 pl-2 opacity-100"
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

        <span aria-hidden className="bg-madeira-600/60 h-5 w-px shrink-0" />

        <button
          type="button"
          onClick={alternarEfeitos}
          aria-pressed={montado ? efeitos : undefined}
          aria-label="Efeitos sonoros"
          title={efeitos ? "Desligar os efeitos" : "Ligar os efeitos"}
          className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${
            efeitos ? "text-dourado-400 hover:text-pergaminho-50" : "text-pergaminho-300/50 hover:text-pergaminho-100"
          }`}
        >
          <IconeEfeitos ligados={efeitos} className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setAberto(!aberto);
          tocar("marcador");
        }}
        aria-expanded={montado ? aberto : undefined}
        aria-label="Controle do som"
        title="Música e efeitos"
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

/** Uma varinha com faíscas; riscada quando os efeitos estão desligados. */
function IconeEfeitos({
  ligados,
  className,
}: {
  ligados: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 20 14 10" />
      <path d="M16 3v3M16 10v1M19.5 6.5H22M10 6.5h2M18.5 4l1.5-1.5M18.5 9l1.5 1.5" />
      {ligados ? null : <path d="M3 3l18 18" />}
    </svg>
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
