"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { MARCADORES_LOCAIS, type Marcador } from "@/lib/marcadores";
import { Botao } from "@/components/ui/Botao";
import { tocar } from "@/lib/som";

const NIVEIS = [1, 1.7, 2.6];

/**
 * O mapa de Mitrael com marcadores nos locais que têm página.
 *
 * O deslocamento usa a rolagem nativa do contêiner, em vez de gestos
 * personalizados: funciona igual no dedo e no mouse, respeita a rolagem
 * do sistema e não briga com leitores de tela. O zoom fica em botões,
 * para quem não consegue fazer pinça também conseguir aproximar.
 */
export function MapaInterativo() {
  const [nivel, setNivel] = useState(0);
  const [aberto, setAberto] = useState<Marcador | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const zoom = NIVEIS[nivel];

  function ajustarZoom(direcao: 1 | -1) {
    const alvo = Math.min(NIVEIS.length - 1, Math.max(0, nivel + direcao));
    if (alvo === nivel) return;

    const area = areaRef.current;
    if (area) {
      // Mantém o centro da visão ao aproximar ou afastar
      const razao = NIVEIS[alvo] / NIVEIS[nivel];
      const centroX = area.scrollLeft + area.clientWidth / 2;
      const centroY = area.scrollTop + area.clientHeight / 2;

      setNivel(alvo);

      requestAnimationFrame(() => {
        area.scrollLeft = centroX * razao - area.clientWidth / 2;
        area.scrollTop = centroY * razao - area.clientHeight / 2;
      });
      return;
    }

    setNivel(alvo);
  }

  return (
    <div className="relative">
      <div
        ref={areaRef}
        className="border-madeira-800/40 bg-madeira-950 relative overflow-auto rounded-sm border"
        style={{ maxHeight: "min(72vh, 620px)" }}
      >
        <div
          className="relative"
          style={{ width: `${zoom * 100}%`, transition: "width 250ms ease-out" }}
        >
          <Image
            src="/images/map.jpg"
            alt="Mapa do continente de Mitrael, com os mares Bazáltico, de Qän e Leviano, as Terras de Askar a oeste e as Terras de Mitrael a leste"
            width={1600}
            height={1132}
            className="h-auto w-full"
            priority
          />

          {MARCADORES_LOCAIS.map((marcador) => {
            const ativo = aberto?.slug === marcador.slug;

            return (
              <button
                key={marcador.slug}
                type="button"
                onClick={() => {
                  tocar("marcador");
                  setAberto(ativo ? null : marcador);
                }}
                aria-label={`Marcador: ${marcador.nome}`}
                aria-expanded={ativo}
                // A área clicável tem 44px mesmo com o ponto pequeno,
                // para o dedo acertar sem precisar de zoom.
                className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                style={{ left: `${marcador.x}%`, top: `${marcador.y}%` }}
              >
                <span className="relative grid place-items-center">
                  <span
                    className={`block rounded-full transition-all ${
                      ativo
                        ? "bg-dourado-300 ring-dourado-300/50 size-3 ring-[3px] sm:size-3.5"
                        : "bg-heraldico-vermelho ring-pergaminho-100/80 size-2 ring-2 hover:scale-125 sm:size-2.5"
                    }`}
                  />
                  {!ativo ? (
                    <span
                      aria-hidden
                      className="bg-heraldico-vermelho/40 absolute size-2 animate-ping rounded-full sm:size-2.5"
                      style={{ animationDuration: "2.5s" }}
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botões de zoom */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => ajustarZoom(1)}
          disabled={nivel === NIVEIS.length - 1}
          aria-label="Aproximar o mapa"
          className="bg-pergaminho-100/95 text-tinta-900 border-madeira-700/40 grid size-10 place-items-center rounded-sm border text-lg font-bold shadow-md transition-opacity disabled:opacity-40"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => ajustarZoom(-1)}
          disabled={nivel === 0}
          aria-label="Afastar o mapa"
          className="bg-pergaminho-100/95 text-tinta-900 border-madeira-700/40 grid size-10 place-items-center rounded-sm border text-lg font-bold shadow-md transition-opacity disabled:opacity-40"
        >
          −
        </button>
      </div>

      {zoom > 1 ? (
        <p className="text-pergaminho-300/70 mt-2 text-center text-xs">
          Arraste o mapa para explorar
        </p>
      ) : null}

      {/* Detalhe do marcador escolhido */}
      <AnimatePresence>
        {aberto ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="textura-pergaminho borda-envelhecida pergaminho-borda-2 shadow-pergaminho mt-4 px-5 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-tinta-500 text-[0.65rem] tracking-[0.2em] uppercase">
                  Local marcado
                </p>
                <p className="font-titulo text-tinta-900 mt-0.5 text-lg font-semibold">
                  {aberto.nome}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/locais/${aberto.slug}/`}
                  className="bg-heraldico-vermelho text-pergaminho-50 hover:bg-heraldico-vermelho-claro font-titulo inline-flex min-h-11 items-center rounded-sm px-4 text-xs font-semibold tracking-wide transition-colors"
                >
                  Abrir página
                </Link>
                <Botao
                  variante="discreto"
                  onClick={() => setAberto(null)}
                  className="text-xs"
                >
                  Fechar
                </Botao>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
