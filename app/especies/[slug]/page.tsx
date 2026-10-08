import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ESPECIES, buscarEspecie } from "@/lib/especies";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Secao } from "@/components/personagens/Painel";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { QuadroDeArte } from "@/components/ui/QuadroDeArte";
import { arte } from "@/lib/arte";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ESPECIES.map((especie) => ({ slug: especie.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const especie = buscarEspecie((await params).slug);
  if (!especie) return {};
  return {
    title: `${especie.nome}, espécie`,
    description: `${especie.nome} nas regras de 2024: ${especie.tracos.join(", ")}.`,
  };
}

export default async function PaginaEspecie({ params }: Props) {
  const especie = buscarEspecie((await params).slug);
  if (!especie) notFound();

  const indice = ESPECIES.indexOf(especie);
  const anterior = ESPECIES[indice - 1];
  const proxima = ESPECIES[indice + 1];

  const ficha = [
    { rotulo: "Tipo de criatura", valor: "Humanoide" },
    { rotulo: "Deslocamento", valor: especie.deslocamento },
    { rotulo: "Tamanho", valor: especie.tamanho, largo: true },
  ];

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <nav aria-label="Caminho" className="text-center text-xs">
          <Link
            href="/especies/"
            className="text-pergaminho-300/80 hover:text-pergaminho-100 underline-offset-4 hover:underline"
          >
            ← Espécies
          </Link>
        </nav>

        <Pergaminho borda={1} className="mt-5">
          <header className="text-center">
            <Sobretitulo>Espécie · Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">{especie.nome}</TituloBrasao>
            <p className="text-tinta-500 mt-2 text-sm italic" lang="en">
              {especie.original}
            </p>
            <Ornamento className="mt-6" />
          </header>

          <div className="mx-auto max-w-[38rem]">
            <QuadroDeArte
              src={arte("especies", especie.slug)}
              alt={`Ilustração: ${especie.nome}`}
              className="mt-2"
            />

            <Secao titulo="Características">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {ficha.map((item) => (
                  <div key={item.rotulo} className={item.largo ? "col-span-2" : ""}>
                    <dt className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.14em] uppercase">
                      {item.rotulo}
                    </dt>
                    <dd className="text-tinta-900 mt-0.5 font-semibold">{item.valor}</dd>
                  </div>
                ))}
              </dl>
            </Secao>

            <p className="text-tinta-700 mt-8 text-[0.95rem] italic sm:text-base">
              Como {especie.nome}, você tem estes traços especiais.
            </p>
            <div className="mt-3.5">
              <TextoDeRegra texto={especie.texto} />
            </div>

            <Ornamento className="mt-10" />

            <nav
              aria-label="Outras espécies"
              className="mt-6 flex items-center justify-between gap-4 text-sm"
            >
              {anterior ? (
                <Link
                  href={`/especies/${anterior.slug}/`}
                  className="text-tinta-700 hover:text-heraldico-vermelho min-h-11 content-center underline-offset-4 hover:underline"
                >
                  ← {anterior.nome}
                </Link>
              ) : (
                <span />
              )}
              {proxima ? (
                <Link
                  href={`/especies/${proxima.slug}/`}
                  className="text-tinta-700 hover:text-heraldico-vermelho min-h-11 content-center underline-offset-4 hover:underline"
                >
                  {proxima.nome} →
                </Link>
              ) : null}
            </nav>

            <div className="mt-7 text-center">
              <BotaoLink href="/especies/" variante="primario">
                Todas as espécies
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
