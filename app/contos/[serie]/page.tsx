import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SERIES_DISPONIVEIS,
  buscarSerie,
  chaveDaTemporada,
  contagemDeEpisodios,
} from "@/lib/contos";
import { Cartaz, Poster } from "@/components/contos/Cartaz";
import { Trilha } from "@/components/contos/Partes";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloSecao,
  Sobretitulo,
} from "@/components/ui/Titulo";

type Props = { params: Promise<{ serie: string }> };

export function generateStaticParams() {
  return SERIES_DISPONIVEIS.map((serie) => ({ serie: serie.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const serie = buscarSerie((await params).serie);
  if (!serie) return {};
  return { title: serie.titulo, description: serie.sinopse };
}

export default async function PaginaSerie({ params }: Props) {
  const serie = buscarSerie((await params).serie);
  if (!serie) notFound();

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Trilha passos={[{ nome: "Contos", href: "/contos/" }, { nome: serie.titulo }]} />

        <Pergaminho borda={1} className="mt-5">
          <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start sm:gap-8">
            <div className="w-40 shrink-0 sm:w-48">
              <Cartaz serie={{ ...serie, disponivel: true }} prioridade />
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <Sobretitulo>{serie.selo}</Sobretitulo>
              <TituloBrasao className="mt-2">{serie.titulo}</TituloBrasao>
              <p className="text-tinta-700 mt-5 text-base leading-relaxed">
                {serie.sinopse}
              </p>
            </div>
          </div>
        </Pergaminho>

        <Revelar className="mt-14">
          <TituloSecao tom="claro" className="text-center">
            Escolha a temporada
          </TituloSecao>
        </Revelar>

        <ul className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-x-6 gap-y-10 min-[420px]:grid-cols-2">
          {serie.temporadas.map((temporada, i) => (
            <li key={temporada.numero} className="flex flex-col">
              <Revelar
                atraso={i * 0.08}
                direcao={i % 2 === 0 ? "esquerda" : "direita"}
              >
                <div className="mx-auto w-full max-w-[16rem]">
                  <Poster
                    arte={{ tipo: "mosaico", personagens: temporada.elenco }}
                    selo={temporada.titulo}
                    titulo={`Temporada ${temporada.numero}`}
                    chamada={contagemDeEpisodios(temporada)}
                    // Temporada sem episódio nenhum fica apagada e sem
                    // clique, como as séries em produção. Acende sozinha
                    // quando o primeiro episódio for publicado.
                    href={
                      temporada.episodios.length > 0
                        ? `/contos/${serie.slug}/${chaveDaTemporada(temporada)}/`
                        : undefined
                    }
                    prioridade={i < 2}
                  />
                </div>
                <p className="text-pergaminho-200/90 mx-auto mt-4 max-w-[16rem] text-center text-sm leading-relaxed">
                  {temporada.sinopse}
                </p>
              </Revelar>
            </li>
          ))}
        </ul>
      </main>

      <Rodape />
    </>
  );
}
