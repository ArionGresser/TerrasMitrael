import type { Metadata } from "next";
import { indiceDoGrimorio, MAGIAS } from "@/lib/magias";
import { Grimorio } from "@/components/magias/Grimorio";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { Capa } from "@/components/ui/Capa";

export const metadata: Metadata = {
  title: "Grimório",
  description:
    "As magias das regras de 2024 de D&D, em português, com busca por nome, classe, círculo e escola. Tradução livre do SRD 5.2.1.",
};

export default function PaginaGrimorio() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Capa
          imagem="/images/compendio/magias.webp"
          sobretitulo="Regras de 2024"
          titulo="Grimório"
          volta={{ href: "/regras/", rotulo: "Livro do Aventureiro" }}
        >
          <p>
            Para conferir uma regra no meio da sessão ou escolher a magia do
            próximo nível. {MAGIAS.length} magias até agora.
          </p>
        </Capa>

        <Pergaminho borda={2} className="mt-8">
          <div>
            <Grimorio magias={indiceDoGrimorio()} />
          </div>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
