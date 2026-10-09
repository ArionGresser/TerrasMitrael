import type { Metadata } from "next";
import Link from "next/link";
import { conteudoDoBau } from "@/lib/bau";
import { BauDoMestre } from "@/components/bau/BauDoMestre";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Baú do Mestre",
  description:
    "Gerador de saque para a mesa: escolha o baú e o que pode ter dentro, o jogador rola o d20 e saem moedas, equipamento e itens mágicos das regras de 2024.",
};

export default function PaginaBau() {
  const conteudo = conteudoDoBau();

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

        <Pergaminho borda={3} className="mt-5">
          <header className="text-center">
            <Sobretitulo>Ferramenta do mestre</Sobretitulo>
            <TituloBrasao className="mt-4">Baú do Mestre</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              O jogador abriu o baú. Diga o que ele é e o que pode guardar,
              peça o d20 e veja o que sai lá de dentro.
            </p>
            <p className="text-tinta-500 mx-auto mt-3 max-w-lg text-xs leading-relaxed">
              Sorteia entre {conteudo.mundanos.length} peças de equipamento e{" "}
              {conteudo.magicos.length} itens mágicos do Livro, respeitando o
              tamanho de cada coisa: uma marreta não entra numa algibeira.
            </p>
          </header>

          <div className="mt-6">
            <BauDoMestre conteudo={conteudo} />
          </div>
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
