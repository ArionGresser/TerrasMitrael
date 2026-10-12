import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { GeradorDeEncontros } from "@/components/combate/GeradorDeEncontros";
import { criaturasDeCombate, TIPOS } from "@/lib/monstros";
import { personagensDoCombate } from "@/lib/personagens-combate";

export const metadata: Metadata = {
  title: "Gerador de encontros",
  robots: { index: false },
};

export default function PaginaEncontros() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>Atrás do escudo</Sobretitulo>
            <TituloBrasao className="mt-4">Gerador de encontros</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-sm leading-relaxed">
              Escolha quem está na sessão e a dificuldade, filtre as criaturas e sorteie. O orçamento de XP segue as regras
              de 2024: a soma do XP das criaturas não passa do limite da dificuldade.
            </p>
          </header>
          <div className="mt-8">
            <GeradorDeEncontros criaturas={criaturasDeCombate()} personagens={personagensDoCombate()} tipos={TIPOS} />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
