import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MAGIAS, buscarMagia, rotuloDaMagia } from "@/lib/magias";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { IconeDaMagia, IlustracoesDaMagia } from "@/components/magias/ArteDaMagia";
import { iconeDaMagia, ilustracoesDaMagia } from "@/lib/magias-arte";
import { Secao } from "@/components/personagens/Painel";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MAGIAS.map((magia) => ({ slug: magia.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const magia = buscarMagia((await params).slug);
  if (!magia) return {};
  return {
    title: `${magia.nome}, magia`,
    description: `${rotuloDaMagia(magia)}. ${magia.texto.split("\n")[0].slice(0, 150)}`,
  };
}

export default async function PaginaMagia({ params }: Props) {
  const magia = buscarMagia((await params).slug);
  if (!magia) notFound();

  const ficha = [
    { rotulo: "Tempo de conjuração", valor: magia.tempo },
    { rotulo: "Alcance", valor: magia.alcance },
    { rotulo: "Componentes", valor: magia.componentes },
    { rotulo: "Duração", valor: magia.duracao },
  ];

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <SeloDeVolta href="/magias/" rotulo="Grimório" />

        <Pergaminho borda={1} className="mt-5">
          <header className="text-center">
            <div className="mb-5 flex justify-center">
              <IconeDaMagia icone={iconeDaMagia(magia.slug)} tamanho="pagina" />
            </div>
            <Sobretitulo>{rotuloDaMagia(magia)}</Sobretitulo>
            <TituloBrasao className="mt-4">{magia.nome}</TituloBrasao>
            <p className="text-tinta-500 mt-2 text-sm italic" lang="en">
              {magia.original}
            </p>
            <Ornamento className="mt-6" />
          </header>

          <div className="mx-auto max-w-[38rem]">
            <Secao titulo="Conjuração">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {ficha.map((item) => (
                  <div
                    key={item.rotulo}
                    className={item.rotulo === "Componentes" ? "col-span-2" : ""}
                  >
                    <dt className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.14em] uppercase">
                      {item.rotulo}
                    </dt>
                    <dd className="text-tinta-900 mt-0.5 font-semibold">{item.valor}</dd>
                  </div>
                ))}
              </dl>
            </Secao>

            <div className="mt-8">
              <TextoDeRegra texto={magia.texto} />
            </div>

            <section aria-label="Ilustrações" className="mt-10">
              <IlustracoesDaMagia
                nome={magia.nome}
                ilustracoes={ilustracoesDaMagia(magia.slug)}
              />
            </section>

            <Ornamento className="mt-10" />

            <p className="font-titulo text-tinta-500 mt-5 text-center text-[0.62rem] tracking-[0.2em] uppercase">
              Na lista de
            </p>
            <ul className="mt-2 flex flex-wrap justify-center gap-2">
              {magia.classes.map((classe) => (
                <li key={classe}>
                  <Link
                    href={`/magias/?classe=${encodeURIComponent(classe)}`}
                    className="border-dourado-600/50 text-tinta-900 hover:bg-dourado-400/20 inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors"
                  >
                    {classe}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-9 text-center">
              <BotaoLink href="/magias/" variante="primario">
                Voltar ao grimório
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
