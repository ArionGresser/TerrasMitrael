import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "Personagens" };

export default function Pagina() {
  return (
    <EmBreve
      titulo="Personagens"
      descricao="Os heróis que caminharam por estas terras, com suas origens, suas escolhas e as marcas que deixaram no mundo."
      fase="Fase 7"
    />
  );
}
