import type { Metadata } from "next";
import { Fragment } from "react";
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
import { Arte } from "@/components/contos/Cartaz";
import { Livro } from "@/components/contos/Livro";
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
  const trilha = (
    <Trilha
      passos={[
        { nome: "Crônicas", href: "/contos/" },
        { nome: serie.titulo, href: `/contos/${serie.slug}/` },
        { nome: `Temporada ${temporada.numero}` },
      ]}
    />
  );
  const [primeiro] = temporada.episodios;

  // A capa de couro: os rostos do elenco num quadro, e o título gravado em ouro
  const capa = (
    <div className="absolute inset-0 flex flex-col items-center px-8 pt-12 pb-10 text-center">
      <p className="font-titulo text-dourado-300/90 text-[0.6rem] tracking-[0.35em] uppercase">
        {serie.titulo}
      </p>
      <p className="font-brasao text-dourado-200 mt-3 text-4xl leading-none [text-shadow:0_1px_0_rgb(0_0_0/0.6)]">
        Temporada {temporada.numero}
      </p>
      <div className="border-dourado-400/60 relative mt-6 aspect-[4/5] w-3/4 overflow-hidden rounded-sm border-2 shadow-[0_6px_16px_rgba(0,0,0,0.6)]">
        <Arte
          arte={temporada.arte ?? { tipo: "mosaico", personagens: temporada.elenco }}
          prioridade
          sizes="300px"
        />
      </div>
      <p className="font-brasao text-dourado-200 mt-6 text-2xl leading-tight [text-shadow:0_1px_0_rgb(0_0_0/0.6)]">
        {temporada.titulo}
      </p>
      <p className="font-titulo text-dourado-300/80 mt-auto text-[0.62rem] tracking-[0.3em] uppercase">
        Toque para abrir
      </p>
    </div>
  );

  // Folha de rosto, elenco e sumário: as primeiras páginas do livro
  const rosto = (
    <div className="flex min-h-full flex-col justify-center text-center">
      <Sobretitulo>
        {serie.titulo} · Temporada {temporada.numero}
      </Sobretitulo>
      <TituloBrasao className="mt-4">{temporada.titulo}</TituloBrasao>
      <Ornamento className="mt-6" />
      <p className="text-tinta-700 mt-6 text-[0.95rem] leading-relaxed">{temporada.sinopse}</p>
    </div>
  );
  const naMesa = (
    <div className="flex min-h-full flex-col justify-center">
      <p className="font-titulo text-tinta-500 mb-4 text-center text-[0.66rem] tracking-[0.2em] uppercase">
        Na mesa
      </p>
      <Elenco slugs={temporada.elenco} prioridade />
    </div>
  );
  const sumario = (
    <div>
      <p className="font-brasao text-tinta-900 text-center text-3xl">Sumário</p>
      <Ornamento className="mt-3" />
      {temporada.episodios.length === 0 ? (
        <p className="text-tinta-700 mt-8 text-center text-sm leading-relaxed italic">
          Os capítulos desta temporada ainda estão sendo passados a limpo. A
          mesa já jogou. Falta a escriba terminar de escrever.
        </p>
      ) : (
        <ol className="mt-5 space-y-1">
          {temporada.episodios.map((episodio) => (
            <li key={episodio.meta.numero}>
              <Link
                href={`${base}/${chaveDoEpisodio(episodio)}/`}
                className="group hover:bg-dourado-400/15 flex items-baseline gap-3 rounded-sm px-2 py-2"
              >
                <span className="font-brasao text-dourado-600 w-6 shrink-0 text-right text-xl leading-none">
                  {episodio.meta.numero}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-titulo text-tinta-900 block text-[0.95rem] leading-snug font-semibold group-hover:underline">
                    {episodio.meta.titulo}
                  </span>
                  {episodio.meta.sessao ? (
                    <span className="text-tinta-500 block text-xs">Jogado em {episodio.meta.sessao}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  const classico = (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        {trilha}

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
            <Elenco slugs={temporada.elenco} prioridade />
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
                      {/* Acima do link que cobre o cartão, para cada rosto
                          levar à própria ficha */}
                      <div className="relative z-10 mt-3 flex">
                        <Elenco slugs={episodio.meta.elenco} tamanho="pequeno" />
                      </div>
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
    </>
  );

  return (
    <>
      <Livro
        chave={`${serie.slug}/${chaveDaTemporada(temporada)}`}
        titulo={`${serie.titulo} · Temporada ${temporada.numero}`}
        cabecalho={trilha}
        capa={capa}
        antes={[rosto, naMesa, sumario].map((pagina, i) => (
          <Fragment key={i}>{pagina}</Fragment>
        ))}
        anterior={`/contos/${serie.slug}/`}
        rotuloAnterior="Temporadas"
        proximo={primeiro ? `${base}/${chaveDoEpisodio(primeiro)}/` : undefined}
        rotuloProximo="Capítulo 1"
        classico={classico}
      />
      <Rodape />
    </>
  );
}
