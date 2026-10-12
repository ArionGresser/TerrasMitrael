import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Ornamento } from "@/components/ui/Titulo";
import { MapaDaMesa } from "@/components/mapa/MapaDaMesa";

export const metadata: Metadata = {
  title: "Mapa da mesa",
  description: "Onde o grupo está, por onde andou e aonde precisa chegar.",
  robots: { index: false },
};

export default function PaginaMapaDaMesa() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-3 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <TituloBrasao>Mapa da mesa</TituloBrasao>
            <Ornamento className="mt-4" />
          </header>
          <div className="mt-6">
            <MapaDaMesa />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
