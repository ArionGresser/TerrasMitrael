import type { Metadata } from "next";
import Link from "next/link";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { PainelDeConquistas } from "@/components/conquistas/PainelDeConquistas";

export const metadata: Metadata = {
  title: "Conquistas",
  description:
    "Os pequenos feitos que dá para realizar pelo site: rolar um 20 natural na mesa, deixar uma moeda em pé, ler um livro das Crônicas até o fim.",
};

export default function PaginaConquistas() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={3}>
          <header className="text-center">
            <Sobretitulo>Os feitos da mesa</Sobretitulo>
            <TituloBrasao className="mt-4">Conquistas</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Role os dados, jogue as moedas, leia as Crônicas e explore o mapa. Alguns feitos acontecem sem querer,
              outros pedem paciência.
            </p>
          </header>
        </Pergaminho>

        <aside
          aria-labelledby="titulo-entrar"
          className="border-madeira-600/70 bg-madeira-900/80 mt-10 flex flex-col items-center gap-4 rounded-lg border p-5 text-center sm:flex-row sm:text-left"
        >
          <div className="flex-1">
            <h2 id="titulo-entrar" className="font-titulo text-pergaminho-50 text-lg">
              Leve suas conquistas com você
            </h2>
            <p className="text-pergaminho-300 mt-1 text-sm leading-relaxed">
              Elas ficam guardadas neste navegador. Com uma conta, vão junto para qualquer aparelho, e entrar pela
              primeira vez já vale uma conquista.
            </p>
          </div>
          <Link
            href="/conta/"
            className="font-titulo border-dourado-400/70 text-pergaminho-50 hover:bg-dourado-400/15 inline-flex min-h-11 shrink-0 items-center rounded-md border px-5 text-sm tracking-[0.12em] uppercase transition-colors"
          >
            Minha conta
          </Link>
        </aside>

        <div className="mt-10">
          <PainelDeConquistas />
        </div>
      </main>

      <Rodape />
    </>
  );
}
