"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Revela o conteúdo conforme a página é rolada.
 *
 * Quem pediu menos movimento no sistema recebe o conteúdo já visível,
 * sem animação nenhuma. A imersão nunca vem antes da acessibilidade.
 */
export function Revelar({
  children,
  atraso = 0,
  direcao = "baixo",
  className = "",
}: {
  children: ReactNode;
  atraso?: number;
  direcao?: "baixo" | "esquerda" | "direita";
  className?: string;
}) {
  const preferReduzido = useReducedMotion();

  if (preferReduzido) {
    return <div className={className}>{children}</div>;
  }

  const deslocamento = {
    baixo: { y: 22, x: 0 },
    esquerda: { y: 0, x: -22 },
    direita: { y: 0, x: 22 },
  }[direcao];

  return (
    <motion.div
      initial={{ opacity: 0, ...deslocamento }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: atraso, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
