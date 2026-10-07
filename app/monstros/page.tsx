import type { Metadata } from "next";
import Link from "next/link";
import { indiceDoBestiario, MONSTROS } from "@/lib/monstros";
import { Bestiario } from "@/components/monstros/Bestiario";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

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
        <nav aria-label="Caminho" className="text-center text-xs">
          <Link
            href="/regras/"
            className="text-pergaminho-300/80 hover:text-pergaminho-100 underline-offset-4 hover:underline"
          >
            ← Livro do Aventureiro
          </Link>
        </nav>

        <Pergaminho borda={2} className="mt-5">
          <header className="text-center">
            <Sobretitulo>Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">Bestiário</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              O que espera nas estradas, nas masmorras e nos planos lá fora.{" "}
              {MONSTROS.length - animais} monstros e {animais} animais.
            </p>
            <p className="mt-4 text-sm">
              <Link
                href="/regras/como-ler-uma-ficha/"
                className="text-tinta-900 decoration-dourado-600/60 hover:text-heraldico-vermelho underline underline-offset-4"
              >
                Como ler uma ficha
              </Link>
              <span className="text-tinta-500">
                : cada parte, do tamanho às Ações Lendárias
              </span>
            </p>
          </header>

          <div className="mt-8">
            <Bestiario monstros={indiceDoBestiario()} />
          </div>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
