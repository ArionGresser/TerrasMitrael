import { Suspense } from "react";
import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Ornamento } from "@/components/ui/Titulo";
import { ReplayDoCombate } from "@/components/combate/ReplayDoCombate";

export const metadata: Metadata = {
  title: "Combate gravado",
  description: "Assista a um combate da mesa, rodada por rodada.",
  robots: { index: false },
};

export default function PaginaReplay() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-3 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={3}>
          <header className="text-center">
            <TituloBrasao>Combate gravado</TituloBrasao>
            <Ornamento className="mt-4" />
          </header>
          <div className="mt-6">
            <Suspense fallback={<p className="text-tinta-700 py-10 text-center italic">Desenrolando a gravação…</p>}>
              <ReplayDoCombate />
            </Suspense>
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
