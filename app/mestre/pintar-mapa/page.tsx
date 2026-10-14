import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { PintarMapa } from "@/components/mapa/PintarMapa";

export const metadata: Metadata = {
  title: "Pintar o mapa",
  robots: { index: false },
};

export default function PaginaPintarMapa() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>Atrás do escudo</Sobretitulo>
            <TituloBrasao className="mt-4">Pintar o mapa</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-sm leading-relaxed">
              Pinte os terrenos e marque os lugares por cima do mapa de hoje. Sai uma referência de cores e um prompt para a IA
              redesenhar o mapa inteiro. Os nomes ficam de fora: quem escreve os nomes é o site, por cima da arte.
            </p>
          </header>
          <div className="mt-8">
            <PintarMapa />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
