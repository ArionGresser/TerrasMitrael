import type { Metadata } from "next";
import Link from "next/link";
import { indiceDoBestiario, MONSTROS } from "@/lib/monstros";
import { Bestiario } from "@/components/monstros/Bestiario";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { Capa } from "@/components/ui/Capa";

export const metadata: Metadata = {
  title: "Bestiário",
  description:
    "Os monstros e animais das regras de 2024 de D&D, em português, com busca por nome, tipo, Nível de Desafio e tamanho. Tradução livre do SRD 5.2.1.",
};

export default function PaginaBestiario() {
  const animais = MONSTROS.filter((m) => m.fonte === "animal").length;

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Capa
          imagem="/images/compendio/monstros.webp"
          sobretitulo="Regras de 2024"
          titulo="Bestiário"
          volta={{ href: "/regras/", rotulo: "Livro do Aventureiro" }}
        >
          <p>
            O que espera nas estradas, nas masmorras e nos planos lá fora.{" "}
            {MONSTROS.length - animais} monstros e {animais} animais.
          </p>
          <p className="mt-3 text-sm not-italic">
            <Link
              href="/regras/como-ler-uma-ficha/"
              className="text-pergaminho-100 decoration-dourado-400/60 hover:text-dourado-300 underline underline-offset-4"
            >
              Como ler uma ficha
            </Link>
            <span className="text-pergaminho-300">
              : cada parte, do tamanho às Ações Lendárias
            </span>
          </p>
        </Capa>

        <Pergaminho borda={2} className="mt-8">
          <div>
            <Bestiario monstros={indiceDoBestiario()} />
          </div>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
