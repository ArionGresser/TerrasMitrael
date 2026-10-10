import type { Metadata } from "next";
import Link from "next/link";
import { indiceDosItens, ITENS } from "@/lib/itens";
import { Tesouro } from "@/components/itens/Tesouro";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { Capa } from "@/components/ui/Capa";

export const metadata: Metadata = {
  title: "Itens Mágicos",
  description:
    "Os itens mágicos das regras de 2024 de D&D, em português, com busca por nome, tipo, raridade e sintonia. Tradução livre do SRD 5.2.1.",
};

export default function PaginaItens() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Capa
          imagem="/images/compendio/itens.webp"
          sobretitulo="Regras de 2024"
          titulo="Itens Mágicos"
          volta={{ href: "/regras/", rotulo: "Livro do Aventureiro" }}
        >
          <p>
            O que sai dos tesouros, das câmaras esquecidas e dos bolsos dos
            monstros. {ITENS.length} itens.
          </p>
          <p className="mt-3 text-sm not-italic">
            <Link
              href="/regras/itens-magicos/"
              className="text-pergaminho-100 decoration-dourado-400/60 hover:text-dourado-300 underline underline-offset-4"
            >
              Regras dos itens mágicos
            </Link>
            <span className="text-pergaminho-300">
              : raridade e preço, cargas, maldições e fabricação
            </span>
          </p>
        </Capa>

        <Pergaminho borda={2} className="mt-8">
          <div>
            <Tesouro itens={indiceDosItens()} />
          </div>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
