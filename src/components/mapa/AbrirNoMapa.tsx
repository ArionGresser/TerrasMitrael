"use client";

import type { ReactNode } from "react";

/**
 * Um botão fora do mapa que abre um lugar ou uma região dentro dele.
 *
 * O mapa ouve o aviso "mapa:abrir", sobe para a vista e voa até o ponto,
 * com o painel aberto. Assim a lista embaixo do mapa leva à mesma história,
 * sem recarregar a página.
 */
export function AbrirNoMapa({
  tipo = "local",
  chave,
  className,
  children,
}: {
  tipo?: "local" | "regiao";
  chave: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("mapa:abrir", { detail: { tipo, chave } }))
      }
      className={className}
    >
      {children}
    </button>
  );
}
