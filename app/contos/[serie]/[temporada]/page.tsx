import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SERIES_DISPONIVEIS,
  buscarSerie,
  buscarTemporada,
  chaveDaTemporada,
  chaveDoEpisodio,
} from "@/lib/contos";
import { Elenco, Trilha } from "@/components/contos/Partes";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloCapitulo,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

type Props = { params: Promise<{ serie: string; temporada: string }> };

export function generateStaticParams() {
  return SERIES_DISPONIVEIS.flatMap((serie) =>
    serie.temporadas.map((temporada) => ({
      serie: serie.slug,
      temporada: chaveDaTemporada(temporada),
    }))
  );
}

async function resolver(params: Props["params"]) {
  const { serie: chaveSerie, temporada: chaveTemporada } = await params;
  const serie = buscarSerie(chaveSerie);
  const temporada = serie ? buscarTemporada(serie, chaveTemporada) : undefined;
  return { serie, temporada };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serie, temporada } = await resolver(params);
  if (!serie || !temporada) return {};
  return {
    title: `${serie.titulo}, Temporada ${temporada.numero}`,
    description: temporada.sinopse,
  };
}

export default async function PaginaTemporada({ params }: Props) {
  const { serie, temporada } = await resolver(params);
  if (!serie || !temporada) notFound();

  const base = `/contos/${serie.slug}/${chaveDaTemporada(temporada)}`;

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Trilha
          passos={[
            { nome: "Contos", href: "/contos/" },
            { nome: serie.titulo, href: `/contos/${serie.slug}/` },
            { nome: `Temporada ${temporada.numero}` },
          ]}
        />

        <Pergaminho inclinacao="esquerda" borda={2} className="mt-5">
          <header className="text-center">
            <Sobretitulo>
              {serie.titulo} · Temporada {temporada.numero}
            </Sobretitulo>
            <TituloBrasao className="mt-4">{temporada.titulo}</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed">
              {temporada.sinopse}
            </p>
          </header>

          <div className="mt-8">
            <p className="font-titulo text-tinta-500 mb-3 text-center text-[0.66rem] tracking-[0.2em] uppercase">
              Na mesa
            </p>
            <Elenco slugs={temporada.elenco} />
          </div>
        </Pergaminho>

        {temporada.episodios.length === 0 ? (
          <Revelar className="mt-10">
            <Pergaminho variante="cartao" borda={3} inclinacao="direita">
              <p className="text-tinta-700 text-center text-sm leading-relaxed italic">
                Os episódios desta temporada ainda estão sendo passados a
                limpo. A mesa já jogou. Falta a escriba terminar de escrever.
              </p>
            </Pergaminho>
          </Revelar>
        ) : (
          <ol className="mt-10 space-y-5">
            {temporada.episodios.map((episodio, i) => (
              <li key={episodio.meta.numero}>
                <Revelar atraso={(i % 4) * 0.06}>
                  <Pergaminho
                    variante="cartao"
                    borda={((i % 3) + 1) as 1 | 2 | 3}
                    className="relative flex gap-4 sm:gap-6"
                  >
                    <span
                      aria-hidden
                      className="font-brasao text-dourado-600/70 w-10 shrink-0 text-center text-4xl leading-none sm:w-14 sm:text-5xl"
                    >
                      {episodio.meta.numero}
                    </span>
                    <div className="min-w-0">
                      <TituloCapitulo>
                        <Link
                          href={`${base}/${chaveDoEpisodio(episodio)}/`}
                          className="after:absolute after:inset-0 hover:underline"
                        >
                          <span className="sr-only">
                            Episódio {episodio.meta.numero}:{" "}
                          </span>
                          {episodio.meta.titulo}
                        </Link>
                      </TituloCapitulo>
                      {episodio.meta.sessao ? (
                        <p className="text-tinta-500 mt-0.5 text-xs tracking-wide">
                          Jogado em {episodio.meta.sessao}
                        </p>
                      ) : null}
                      <p className="text-tinta-700 mt-2 text-sm leading-relaxed">
                        {episodio.meta.resumo}
                      </p>
                    </div>
                  </Pergaminho>
                </Revelar>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 text-center">
          <BotaoLink href={`/contos/${serie.slug}/`} variante="primario">
            Outras temporadas
          </BotaoLink>
        </div>
      </main>

      <Rodape />
    </>
  );
}
