import type { Metadata } from "next";
import { indiceDoGrimorio, MAGIAS } from "@/lib/magias";
import { Grimorio } from "@/components/magias/Grimorio";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";

export const metadata: Metadata = {
  title: "Grimório",
  description:
    "As magias das regras de 2024 de D&D, em português, com busca por nome, classe, círculo e escola. Tradução livre do SRD 5.2.1.",
};

export default function PaginaGrimorio() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <SeloDeVolta href="/regras/" rotulo="Livro do Aventureiro" />

        <Pergaminho borda={2} className="mt-5">
          <header className="text-center">
            <Sobretitulo>Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">Grimório</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Para conferir uma regra no meio da sessão ou escolher a magia do
              próximo nível. {MAGIAS.length} magias até agora.
            </p>
          </header>

          <div className="mt-8">
            <Grimorio magias={indiceDoGrimorio()} />
          </div>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
