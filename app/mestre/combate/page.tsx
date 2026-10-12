import type { Metadata } from "next";
import { IrParaArena } from "@/components/combate/IrParaArena";

export const metadata: Metadata = {
  title: "Combate",
  robots: { index: false },
};

// O combate mudou para a arena (/combate/), que serve ao Mestre e aos jogadores
export default function PaginaCombateAntiga() {
  return <IrParaArena />;
}
