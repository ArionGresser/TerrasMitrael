import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Ornamento } from "@/components/ui/Titulo";
import { Anotacoes } from "@/components/anotacoes/Anotacoes";

export const metadata: Metadata = {
  title: "Anotações",
  description: "O caderno de anotações de cada jogador.",
  robots: { index: false },
};

export default function PaginaAnotacoes() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-3 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <TituloBrasao>Anotações</TituloBrasao>
            <Ornamento className="mt-4" />
          </header>
          <div className="mt-6">
            <Anotacoes />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
