import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ITENS, buscarItem } from "@/lib/itens";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { QuadroDeArte } from "@/components/ui/QuadroDeArte";
import { arte } from "@/lib/arte";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ITENS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = buscarItem((await params).slug);
  if (!item) return {};
  return {
    title: `${item.nome}, item mágico`,
    description: `${item.tipo}. ${item.texto.split("\n")[0].replace(/[_*]/g, "").slice(0, 150)}`,
  };
}

export default async function PaginaItem({ params }: Props) {
  const item = buscarItem((await params).slug);
  if (!item) notFound();

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <nav aria-label="Caminho" className="text-center text-xs">
          <Link
            href="/itens/"
            className="text-pergaminho-300/80 hover:text-pergaminho-100 underline-offset-4 hover:underline"
          >
            ← Itens Mágicos
          </Link>
        </nav>

        <Pergaminho borda={1} className="mt-5">
          <header className="text-center">
            <Sobretitulo>{item.categoria}</Sobretitulo>
            <TituloBrasao className="mt-4">{item.nome}</TituloBrasao>
            <p className="text-tinta-500 mt-2 text-sm italic" lang="en">
              {item.original}
            </p>
            <p className="text-tinta-700 mx-auto mt-4 max-w-md text-sm italic">
              {item.tipo}
            </p>
            <Ornamento className="mt-6" />
          </header>

          <div className="mx-auto max-w-[38rem]">
            <QuadroDeArte
              src={arte("itens", item.slug)}
              alt={`Ilustração: ${item.nome}`}
              formato="quadrado"
              className="mt-2"
            />

            <div className="mt-6">
              <TextoDeRegra texto={item.texto} />
            </div>

            <Ornamento className="mt-10" />

            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              <li>
                <Link
                  href={`/itens/?categoria=${encodeURIComponent(item.categoria)}`}
                  className="border-dourado-600/50 text-tinta-900 hover:bg-dourado-400/20 inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors"
                >
                  Mais itens do tipo {item.categoria}
                </Link>
              </li>
              {item.raridades.map((r) => (
                <li key={r}>
                  <Link
                    href={`/itens/?raridade=${encodeURIComponent(r)}`}
                    className="border-dourado-600/50 text-tinta-900 hover:bg-dourado-400/20 inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors"
                  >
                    {r}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-9 text-center">
              <BotaoLink href="/itens/" variante="primario">
                Voltar aos itens
              </BotaoLink>
            </div>

            <CreditoSrd className="mt-10" />
          </div>
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
