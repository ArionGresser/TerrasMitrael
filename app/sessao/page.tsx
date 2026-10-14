import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Ornamento } from "@/components/ui/Titulo";
import { SessaoDeHoje } from "@/components/sessao/SessaoDeHoje";
import { personagensDoCombate } from "@/lib/personagens-combate";

export const metadata: Metadata = {
  title: "Sessão de hoje",
  description: "Quem está na mesa, o combate, o mapa e os atalhos do dia.",
  robots: { index: false },
};

export default function PaginaSessao() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-3 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <TituloBrasao>Sessão de hoje</TituloBrasao>
            <Ornamento className="mt-4" />
          </header>
          <div className="mt-6">
            <SessaoDeHoje personagens={personagensDoCombate()} />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
