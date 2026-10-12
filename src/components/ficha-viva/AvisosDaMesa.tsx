"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lerAvisos, ouvirMesa, type Aviso } from "@/lib/ficha-viva";
import { tocar } from "@/lib/som";
import { useConta } from "@/components/conta/useConta";

const DURACAO = 6500;
const chaveDoVisto = (personagem: string) => `mitrael:ultimo-aviso:${personagem}`;

function ultimoVisto(personagem: string): number | null {
  try {
    const bruto = localStorage.getItem(chaveDoVisto(personagem));
    return bruto ? Number(bruto) : null;
  } catch {
    return null;
  }
}

function marcarVisto(personagem: string, id: number) {
  try {
    if ((ultimoVisto(personagem) ?? 0) < id) localStorage.setItem(chaveDoVisto(personagem), String(id));
  } catch {
    // Sem armazenamento, o aviso só pode aparecer de novo na próxima visita
  }
}

/**
 * Os recados da mesa: o que o Mestre fez na ficha do jogador (deu item,
 * mandou dano, aprovou um pedido) aparece numa faixa no pé da tela, em
 * qualquer página do site. O que chegou enquanto a pessoa estava fora
 * aparece quando ela volta.
 */
export function AvisosDaMesa() {
  const conta = useConta();
  const personagem = conta.fase === "dentro" ? conta.perfil.personagem : null;
  const [fila, setFila] = useState<Aviso[]>([]);
  const reduzido = useReducedMotion();
  const atual = fila[0] ?? null;

  useEffect(() => {
    if (!personagem) return;
    let vivo = true;
    const visto = ultimoVisto(personagem);
    void lerAvisos(personagem, visto ?? 0).then((avisos) => {
      if (!vivo) return;
      // Na primeira vez neste aparelho, não despeja o histórico todo
      if (visto === null) {
        const ultimo = avisos.at(-1);
        if (ultimo) marcarVisto(personagem, ultimo.id);
        return;
      }
      setFila((f) => [...f, ...avisos.filter((a) => !f.some((x) => x.id === a.id))]);
    });
    const parar = ouvirMesa(
      (_, linha) => {
        if (!linha.id) return;
        const aviso = linha as unknown as Aviso;
        setFila((f) => (f.some((x) => x.id === aviso.id) ? f : [...f, aviso]));
      },
      personagem,
      ["avisos"]
    );
    return () => {
      vivo = false;
      parar();
    };
  }, [personagem]);

  useEffect(() => {
    if (!atual || !personagem) return;
    marcarVisto(personagem, atual.id);
    tocar("abrirMenu");
    const t = setTimeout(() => setFila((f) => f.slice(1)), DURACAO);
    return () => clearTimeout(t);
  }, [atual, personagem]);

  if (!personagem) return null;

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      <AnimatePresence mode="wait">
        {atual ? (
          <motion.div
            key={atual.id}
            initial={reduzido ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduzido ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: reduzido ? 0.2 : 0.4 }}
            className="pointer-events-auto"
          >
            <Link
              href={`/personagens/${personagem}/`}
              onClick={() => setFila((f) => f.slice(1))}
              className="border-dourado-400/70 bg-madeira-900/95 flex max-w-sm items-center gap-3 rounded-lg border py-2.5 pr-5 pl-3 shadow-2xl backdrop-blur-sm"
            >
              <span aria-hidden className="text-dourado-300 text-xl">
                ✦
              </span>
              <span className="min-w-0">
                <span className="font-titulo text-dourado-300 block text-[0.6rem] tracking-[0.25em] uppercase">Da mesa</span>
                <span className="text-pergaminho-50 block text-sm leading-snug">{atual.texto}</span>
              </span>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
