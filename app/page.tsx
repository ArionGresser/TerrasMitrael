"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * Página provisória da Fase 1.
 * Existe para confirmar que a base técnica funciona e para dar o primeiro
 * vislumbre da identidade visual. Será substituída pela Home real na Fase 4.
 */

const instalado = [
  { nome: "Next.js 16", papel: "monta as páginas do site" },
  { nome: "Tailwind CSS 4", papel: "dá forma e cor a tudo" },
  { nome: "Motion", papel: "as animações e transições" },
  { nome: "Howler.js", papel: "a trilha e os efeitos sonoros" },
  { nome: "MDX", papel: "a lore em arquivos de texto editáveis" },
];

export default function PaginaProvisoria() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      {/* O tecido puxado nas bordas da mesa */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]"
      />

      <motion.article
        initial={{ opacity: 0, y: 24, rotate: -0.4 }}
        animate={{ opacity: 1, y: 0, rotate: -0.4 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="textura-pergaminho borda-envelhecida shadow-pergaminho relative w-full max-w-2xl rounded-sm px-6 py-10 sm:px-12 sm:py-14"
      >
        <header className="text-center">
          <p className="text-tinta-500 font-titulo text-[0.7rem] tracking-[0.35em] uppercase sm:text-xs">
            Terceira Era
          </p>

          <h1 className="text-tinta-900 font-titulo mt-4 text-3xl leading-tight font-bold sm:text-5xl">
            Terras de Mitrael
          </h1>

          <div className="mt-5 flex items-center justify-center gap-3" aria-hidden>
            <span className="via-dourado-600/60 h-px w-16 bg-gradient-to-r from-transparent to-transparent" />
            <span className="text-dourado-600 text-sm">✦</span>
            <span className="via-dourado-600/60 h-px w-16 bg-gradient-to-r from-transparent to-transparent" />
          </div>

          <p className="text-tinta-700 mx-auto mt-5 max-w-md text-sm leading-relaxed italic sm:text-base">
            A reconstrução começou. Os alicerces do novo mundo estão assentados.
          </p>
        </header>

        <section className="mt-10">
          <h2 className="text-tinta-900 font-titulo text-center text-xs tracking-[0.2em] uppercase sm:text-sm">
            Fase 1 — Fundações
          </h2>

          <ul className="mt-5 space-y-2.5">
            {instalado.map((item, i) => (
              <motion.li
                key={item.nome}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.09, duration: 0.5 }}
                className="border-dourado-600/25 flex items-baseline gap-3 border-b border-dashed pb-2.5 last:border-0"
              >
                <span className="text-heraldico-verde shrink-0 text-sm" aria-hidden>
                  ✓
                </span>
                <span className="text-tinta-900 shrink-0 text-sm font-semibold">
                  {item.nome}
                </span>
                <span className="text-tinta-500 text-xs leading-snug sm:text-sm">
                  {item.papel}
                </span>
              </motion.li>
            ))}
          </ul>
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-10"
        >
          <h2 className="text-tinta-500 font-titulo text-center text-[0.65rem] tracking-[0.25em] uppercase">
            O mapa aguarda
          </h2>
          <div className="border-madeira-800/30 shadow-pergaminho relative mx-auto mt-4 max-w-sm overflow-hidden rounded-sm border">
            <Image
              src="/images/map.jpg"
              alt="Mapa de Mitrael"
              width={900}
              height={600}
              className="h-auto w-full sepia-[0.18]"
              priority
            />
          </div>
        </motion.section>

        <footer className="border-dourado-600/25 mt-10 border-t pt-5 text-center">
          <p className="text-tinta-500 text-[0.7rem] tracking-wide">
            Página provisória · será substituída pela Home na Fase 4
          </p>
        </footer>
      </motion.article>
    </main>
  );
}
