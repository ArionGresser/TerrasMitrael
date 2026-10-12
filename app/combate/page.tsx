import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Ornamento } from "@/components/ui/Titulo";
import { Arena } from "@/components/combate/Arena";
import { personagensDoCombate } from "@/lib/personagens-combate";
import { PERSONAGENS_ATUAIS } from "@/lib/personagens";
import { baseDaFicha } from "@/lib/ficha-viva-base";
import { regrasDaFicha } from "@/lib/regras-da-ficha";
import { FichaAtualMochila, FichaAtualNumeros, FichaAtualPoderes, temPoderes } from "@/components/personagens/FichaAtual";

export const metadata: Metadata = {
  title: "Combate",
  description: "A arena do combate da mesa: a ordem de iniciativa, os aventureiros e os inimigos.",
  robots: { index: false },
};

export default function PaginaArena() {
  const bases = Object.fromEntries(
    PERSONAGENS_ATUAIS.filter((p) => p.meta.ficha).map((p) => [p.meta.slug, baseDaFicha(p.meta.ficha!)])
  );
  // A ficha do site de cada um, para os jogadores verem a dos companheiros na arena
  const fichasDoSite = Object.fromEntries(
    PERSONAGENS_ATUAIS.filter((p) => p.meta.ficha).map((p) => [
      p.meta.slug,
      <div key={p.meta.slug} className="space-y-6">
        <FichaAtualNumeros ficha={p.meta.ficha!} />
        {temPoderes(p.meta.ficha!) ? <FichaAtualPoderes ficha={p.meta.ficha!} /> : null}
        <FichaAtualMochila ficha={p.meta.ficha!} />
      </div>,
    ])
  );
  return (
    <>
      <main className="mx-auto max-w-4xl px-3 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={3}>
          <header className="text-center">
            <TituloBrasao>A arena</TituloBrasao>
            <Ornamento className="mt-4" />
          </header>
          <div className="mt-6">
            <Arena personagens={personagensDoCombate()} bases={bases} regras={regrasDaFicha()} fichasDoSite={fichasDoSite} />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
