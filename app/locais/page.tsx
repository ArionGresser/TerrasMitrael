import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "Locais" };

export default function Pagina() {
  return (
    <EmBreve
      titulo="Locais"
      descricao="As terras que formam o continente: capitais movimentadas, florestas sagradas, redutos de magia e lugares onde ninguém em sã consciência pisaria."
      fase="Fase 5"
    />
  );
}
