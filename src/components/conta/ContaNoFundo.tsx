"use client";

import { useEffect } from "react";
import { iniciarConta, ouvirConquistas } from "@/lib/conta";

/**
 * Fica em todas as páginas, sem aparecer: abre a conta guardada neste
 * navegador (se houver) e sobe para ela cada conquista nova.
 */
export function ContaNoFundo() {
  useEffect(() => {
    void iniciarConta();
    return ouvirConquistas();
  }, []);
  return null;
}
