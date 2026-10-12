"use client";

import { useSyncExternalStore } from "react";
import { estadoDaConta, ouvirConta, type EstadoDaConta } from "@/lib/conta";

const NO_SERVIDOR: EstadoDaConta = { fase: "carregando" };

/** A conta aberta neste navegador, para qualquer tela que precise. */
export function useConta(): EstadoDaConta {
  return useSyncExternalStore(ouvirConta, estadoDaConta, () => NO_SERVIDOR);
}
