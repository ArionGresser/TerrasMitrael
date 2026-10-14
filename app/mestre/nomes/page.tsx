import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { GeradorDeNomes } from "@/components/mestre/GeradorDeNomes";

export const metadata: Metadata = {
  title: "Gerador de nomes",
  robots: { index: false },
};

export default function PaginaNomes() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>Atrás do escudo</Sobretitulo>
            <TituloBrasao className="mt-4">Gerador de nomes</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-sm leading-relaxed">
              Um taverneiro, um guarda, um anão que apareceu do nada: escolha o povo e pegue um nome. Os anões vêm com o
              clã da família, como Barba Cinzenta, e às vezes com apelido.
            </p>
          </header>
          <div className="mt-8">
            <GeradorDeNomes />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
