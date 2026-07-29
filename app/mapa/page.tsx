import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "Mapa" };

export default function Pagina() {
  return (
    <EmBreve
      titulo="Mapa de Mitrael"
      descricao="O continente inteiro diante de você: os mares, os reinos, as florestas e a barreira que sela o que veio de fora."
      fase="Fase 8"
    />
  );
}
