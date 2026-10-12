import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { ConducaoDoCombate } from "@/components/combate/ConducaoDoCombate";
import { criaturasDeCombate } from "@/lib/monstros";
import { personagensDoCombate } from "@/lib/personagens-combate";

export const metadata: Metadata = {
  title: "Combate",
  robots: { index: false },
};

export default function PaginaCombate() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={3}>
          <header className="text-center">
            <Sobretitulo>Atrás do escudo</Sobretitulo>
            <TituloBrasao className="mt-4">Combate</TituloBrasao>
            <Ornamento className="mt-6" />
          </header>
          <div className="mt-8">
            <ConducaoDoCombate criaturas={criaturasDeCombate()} personagens={personagensDoCombate()} />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
