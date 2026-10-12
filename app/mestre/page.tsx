import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { PainelDoMestre } from "@/components/conta/PainelDoMestre";
import { PERSONAGENS } from "@/lib/personagens";
import { baseDaFicha } from "@/lib/ficha-viva-base";

export const metadata: Metadata = {
  title: "Painel do Mestre",
  robots: { index: false },
};

export default function PaginaMestre() {
  const personagens = PERSONAGENS.filter((p) => !p.meta.mestre).map((p) => ({
    slug: p.meta.slug,
    nome: p.meta.nome,
    base: p.meta.ficha ? baseDaFicha(p.meta.ficha) : undefined,
  }));
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={1}>
          <header className="text-center">
            <Sobretitulo>Atrás do escudo</Sobretitulo>
            <TituloBrasao className="mt-4">Painel do Mestre</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-sm leading-relaxed">
              A mesa ao vivo, os pedidos dos jogadores, o gerador de encontros e o combate. Mais embaixo, as contas: ligue cada uma ao personagem e crie senha nova para quem esqueceu.
            </p>
          </header>
          <div className="mt-8">
            <PainelDoMestre personagens={personagens} />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
