import type { Metadata } from "next";
import Link from "next/link";
import { indiceDosItens, ITENS } from "@/lib/itens";
import { Tesouro } from "@/components/itens/Tesouro";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";

export const metadata: Metadata = {
  title: "Itens Mágicos",
  description:
    "Os itens mágicos das regras de 2024 de D&D, em português, com busca por nome, tipo, raridade e sintonia. Tradução livre do SRD 5.2.1.",
};

export default function PaginaItens() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <SeloDeVolta href="/regras/" rotulo="Livro do Aventureiro" />

        <Pergaminho borda={2} className="mt-5">
          <header className="text-center">
            <Sobretitulo>Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">Itens Mágicos</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              O que sai dos tesouros, das câmaras esquecidas e dos bolsos dos
              monstros. {ITENS.length} itens.
            </p>
            <p className="mt-4 text-sm">
              <Link
                href="/regras/itens-magicos/"
                className="text-tinta-900 decoration-dourado-600/60 hover:text-heraldico-vermelho underline underline-offset-4"
              >
                Regras dos itens mágicos
              </Link>
              <span className="text-tinta-500">
                : raridade e preço, cargas, maldições e fabricação
              </span>
            </p>
          </header>

          <div className="mt-8">
            <Tesouro itens={indiceDosItens()} />
          </div>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
