import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "Eventos" };

export default function Pagina() {
  return (
    <EmBreve
      titulo="Eventos"
      descricao="A linha do tempo de Mitrael, das expedições que partiram sem saber o que encontrariam às guerras que redesenharam o mapa."
      fase="Fase 6"
    />
  );
}
