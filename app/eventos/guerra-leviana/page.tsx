import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "A Grande Guerra Leviana" };

export default function Pagina() {
  return (
    <EmBreve
      titulo="A Grande Guerra Leviana"
      descricao="Trinta e seis anos de guerra, cinco capítulos e o evento que define toda a história de Mitrael. Recebe o tratamento mais profundo de todo o site."
      fase="Fase 6"
    />
  );
}
