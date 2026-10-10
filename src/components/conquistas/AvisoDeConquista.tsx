"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EVENTO, type Conquista } from "@/lib/conquistas";
import { tocar } from "@/lib/som";
import { IconeConquista } from "./IconeConquista";
import { COR_DO_NIVEL, NOME_DO_NIVEL, nomeDoPremio } from "./premios";

/** Quanto tempo cada aviso fica na tela. */
const DURACAO = 5200;

/**
 * O aviso de conquista: um lacre dourado que desce do alto da mesa com o
 * nome do feito e um brilho mágico. Se vierem dois de uma vez (tirar o
 * primeiro 20 conta como primeiro dado também), eles entram em fila.
 *
 * Fica numa região `aria-live`, então o leitor de tela anuncia o feito sem
 * tirar o foco de onde a pessoa está.
 */
export function AvisoDeConquista() {
  const [fila, setFila] = useState<Conquista[]>([]);
  const reduzido = useReducedMotion();
  const atual = fila[0] ?? null;

  useEffect(() => {
    const ouvir = (e: Event) => {
      const conquista = (e as CustomEvent<Conquista>).detail;
      setFila((f) => (f.some((c) => c.chave === conquista.chave) ? f : [...f, conquista]));
    };
    window.addEventListener(EVENTO, ouvir);
    return () => window.removeEventListener(EVENTO, ouvir);
  }, []);

  useEffect(() => {
    if (!atual) return;
    tocar("brilho", atual.nivel === "ouro" ? 5 : atual.nivel === "prata" ? 4 : 3);
    const t = setTimeout(() => setFila((f) => f.slice(1)), DURACAO);
    return () => clearTimeout(t);
  }, [atual]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4 sm:top-24">
      <AnimatePresence mode="wait">
        {atual ? (
          <motion.div
            key={atual.chave}
            initial={reduzido ? { opacity: 0 } : { opacity: 0, y: -28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduzido ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: reduzido ? 0.2 : 0.45, ease: [0.2, 0.8, 0.3, 1] }}
            className="pointer-events-auto"
          >
            <Link
              href="/conquistas/"
              onClick={() => setFila((f) => f.slice(1))}
              className="aviso-conquista border-dourado-400/70 bg-madeira-900/95 flex max-w-sm items-center gap-3 rounded-lg border py-2.5 pr-5 pl-2.5 shadow-2xl backdrop-blur-sm"
            >
              <span className="bg-dourado-400/15 border-dourado-400/60 text-dourado-300 grid size-12 shrink-0 place-items-center rounded-full border">
                <IconeConquista icone={atual.icone} className="size-7" />
              </span>
              <span className="min-w-0">
                <span className={`font-titulo block text-[0.6rem] tracking-[0.25em] uppercase ${COR_DO_NIVEL[atual.nivel].texto}`}>
                  Conquista de {NOME_DO_NIVEL[atual.nivel].toLowerCase()}
                </span>
                <span className="font-titulo text-pergaminho-50 block text-base leading-tight">{atual.nome}</span>
                <span className="text-pergaminho-300 block text-xs leading-snug">{atual.descricao}</span>
                {atual.premio ? (
                  <span className="text-dourado-300 mt-1 block text-xs font-semibold">
                    Liberou: {nomeDoPremio(atual.premio)}
                  </span>
                ) : null}
              </span>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
