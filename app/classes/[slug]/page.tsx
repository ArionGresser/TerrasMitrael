import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { classesTraduzidas, buscarClasse, type Patamar } from "@/lib/classes";
import { MAGIAS } from "@/lib/magias";
import { circulo } from "@/lib/magias-base";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Secao } from "@/components/personagens/Painel";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Dobra } from "@/components/ui/Dobra";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, TituloSecao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return classesTraduzidas().map((classe) => ({ slug: classe.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const classe = buscarClasse((await params).slug);
  if (!classe) return {};
  return {
    title: `${classe.nome}, classe`,
    description: `O ${classe.nome} nas regras de 2024, do nível 1 ao 20, com a subclasse ${classe.subclasse.nome}.`,
  };
}

export default async function PaginaClasse({ params }: Props) {
  const classe = buscarClasse((await params).slug);
  if (!classe) notFound();

  // A lista de magias sai do grimório, agrupada por círculo
  const magias = MAGIAS.filter((m) => m.classes.includes(classe.nome));
  const porCirculo = [...new Set(magias.map((m) => m.nivel))]
    .sort((a, b) => a - b)
    .map((nivel) => ({
      nivel,
      lista: magias
        .filter((m) => m.nivel === nivel)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    }));

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <nav aria-label="Caminho" className="text-center text-xs">
          <Link
            href="/classes/"
            className="text-pergaminho-300/80 hover:text-pergaminho-100 underline-offset-4 hover:underline"
          >
            ← Classes
          </Link>
        </nav>

        <Pergaminho borda={1} className="mt-5">
          <header className="text-center">
            <Sobretitulo>Classe · Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">{classe.nome}</TituloBrasao>
            <p className="text-tinta-500 mt-2 text-sm italic" lang="en">
              {classe.original}
            </p>
            <Ornamento className="mt-6" />
          </header>

          <div className="mx-auto max-w-[40rem]">
            <Secao titulo={`Traços do ${classe.nome}`}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {classe.tracos.map((t, i) => (
                  <div key={t.rotulo} className={i < 2 ? "" : "col-span-2"}>
                    <dt className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.14em] uppercase">
                      {t.rotulo}
                    </dt>
                    <dd className="text-tinta-900 mt-0.5 font-semibold">{t.valor}</dd>
                  </div>
                ))}
              </dl>
            </Secao>

            <div className="mt-8">
              <Dobra titulo={classe.tornandoSe.titulo}>
                <TextoDeRegra texto={classe.tornandoSe.texto} />
              </Dobra>
            </div>

            <TituloSecao className="mt-12 text-center">Características do {classe.nome}</TituloSecao>
            <div className="mt-5">
              <TextoDeRegra texto={classe.introducao} />
            </div>
            <div className="mt-5">
              <TextoDeRegra texto={classe.tabela} />
            </div>

            <ListaDePatamares patamares={classe.patamares} />

            <Ornamento className="mt-12" />

            <section aria-labelledby="titulo-subclasse" className="mt-8">
              <p className="font-titulo text-tinta-500 text-center text-[0.66rem] tracking-[0.2em] uppercase">
                Subclasse
              </p>
              <TituloSecao as="h2" className="mt-2 text-center">
                <span id="titulo-subclasse">{classe.subclasse.nome}</span>
              </TituloSecao>
              <p className="text-tinta-500 mt-2 text-center text-sm italic">{classe.subclasse.lema}</p>
              <div className="mt-6">
                <TextoDeRegra texto={classe.subclasse.texto} />
              </div>
              <ListaDePatamares patamares={classe.subclasse.patamares} />
            </section>

            {porCirculo.length > 0 ? (
              <>
                <Ornamento className="mt-12" />
                <div className="mt-8">
                  <Dobra titulo={`Lista de magias do ${classe.nome}`}>
                    <div className="space-y-5">
                      {porCirculo.map(({ nivel, lista }) => (
                        <div key={nivel}>
                          <h3 className="font-titulo text-tinta-900 border-dourado-600/40 border-b pb-1 text-base font-bold">
                            {nivel === 0 ? "Truques" : circulo(nivel)}
                          </h3>
                          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {lista.map((m) => (
                              <li key={m.slug}>
                                <Link
                                  href={`/magias/${m.slug}/`}
                                  className="text-tinta-900 hover:text-heraldico-vermelho decoration-dourado-600/50 inline-block py-1 underline underline-offset-2"
                                >
                                  {m.nome}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <p className="text-sm">
                        <Link
                          href={`/magias/?classe=${encodeURIComponent(classe.nome)}`}
                          className="text-heraldico-vermelho underline underline-offset-4"
                        >
                          Abrir no Grimório, com busca e filtros →
                        </Link>
                      </p>
                    </div>
                  </Dobra>
                </div>
              </>
            ) : null}

            <div className="mt-10 text-center">
              <BotaoLink href="/classes/" variante="primario">
                Todas as classes
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

/** Cada nível vira um pergaminho que se desenrola, com o nome do que ele traz. */
function ListaDePatamares({ patamares }: { patamares: Patamar[] }) {
  return (
    <div className="mt-8 space-y-5">
      {patamares.map((p) => (
        <Dobra
          key={`${p.nivel}-${p.nomes[0]}`}
          titulo={
            <>
              <span className="text-heraldico-vermelho">Nível {p.nivel}</span> · {p.nomes.join(", ")}
            </>
          }
        >
          <TextoDeRegra texto={p.texto} />
        </Dobra>
      ))}
    </div>
  );
}
