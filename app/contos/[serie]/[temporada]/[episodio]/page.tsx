import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SERIES_DISPONIVEIS,
  buscarEpisodio,
  buscarSerie,
  buscarTemporada,
  chaveDaTemporada,
  chaveDoEpisodio,
} from "@/lib/contos";
import { Elenco, Trilha } from "@/components/contos/Partes";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

type Props = {
  params: Promise<{ serie: string; temporada: string; episodio: string }>;
};

/**
 * Um endereço por episódio publicado.
 *
 * Enquanto nenhum existe, devolve um endereço reserva que cai em "página não
 * encontrada". Sem ele, o site estático nem constrói: o Next recusa página
 * de episódio com lista vazia. Ao publicar o primeiro episódio a reserva
 * some sozinha.
 */
export function generateStaticParams() {
  const enderecos = SERIES_DISPONIVEIS.flatMap((serie) =>
    serie.temporadas.flatMap((temporada) =>
      temporada.episodios.map((episodio) => ({
        serie: serie.slug,
        temporada: chaveDaTemporada(temporada),
        episodio: chaveDoEpisodio(episodio),
      }))
    )
  );
  if (enderecos.length > 0) return enderecos;

  const [serie] = SERIES_DISPONIVEIS;
  const [temporada] = serie.temporadas;
  return [
    {
      serie: serie.slug,
      temporada: chaveDaTemporada(temporada),
      episodio: "em-breve",
    },
  ];
}

async function resolver(params: Props["params"]) {
  const chaves = await params;
  const serie = buscarSerie(chaves.serie);
  const temporada = serie ? buscarTemporada(serie, chaves.temporada) : undefined;
  const episodio = temporada
    ? buscarEpisodio(temporada, chaves.episodio)
    : undefined;
  return { serie, temporada, episodio };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serie, temporada, episodio } = await resolver(params);
  if (!serie || !temporada || !episodio) return {};
  return {
    title: `${episodio.meta.titulo}, ${serie.titulo} T${temporada.numero}E${episodio.meta.numero}`,
    description: episodio.meta.resumo,
  };
}

export default async function PaginaEpisodio({ params }: Props) {
  const { serie, temporada, episodio } = await resolver(params);
  if (!serie || !temporada || !episodio) notFound();

  const base = `/contos/${serie.slug}/${chaveDaTemporada(temporada)}`;
  const indice = temporada.episodios.indexOf(episodio);
  const anterior = temporada.episodios[indice - 1];
  const proximo = temporada.episodios[indice + 1];
  const { Texto } = episodio;

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Trilha
          passos={[
            { nome: "Contos", href: "/contos/" },
            { nome: serie.titulo, href: `/contos/${serie.slug}/` },
            { nome: `Temporada ${temporada.numero}`, href: `${base}/` },
            { nome: `Episódio ${episodio.meta.numero}` },
          ]}
        />

        <Pergaminho borda={1} className="mt-5">
          <header className="text-center">
            <Sobretitulo>
              Temporada {temporada.numero} · Episódio {episodio.meta.numero}
            </Sobretitulo>
            <TituloBrasao className="mt-4">{episodio.meta.titulo}</TituloBrasao>
            {episodio.meta.sessao ? (
              <p className="text-tinta-500 mt-3 text-xs tracking-wide">
                Jogado em {episodio.meta.sessao}
              </p>
            ) : null}
            <Ornamento className="mt-6" />
          </header>

          {/* Quem estava na mesa. Ninguém precisa decorar o elenco para ler:
              cada rosto leva à ficha de quem é. */}
          <section aria-label="Personagens neste episódio" className="mt-6">
            <p className="font-titulo text-tinta-500 mb-3 text-center text-[0.66rem] tracking-[0.2em] uppercase">
              Neste episódio
            </p>
            <Elenco slugs={episodio.meta.elenco} prioridade />
          </section>

          <div className="mt-8 text-[0.95rem] leading-[1.8] sm:text-base">
            <Texto />
          </div>

          <Ornamento className="mt-10" />

          <nav
            aria-label="Outros episódios"
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {anterior ? (
              <BotaoLink
                href={`${base}/${chaveDoEpisodio(anterior)}/`}
                variante="secundario"
              >
                ← Episódio {anterior.meta.numero}
              </BotaoLink>
            ) : null}
            {proximo ? (
              <BotaoLink
                href={`${base}/${chaveDoEpisodio(proximo)}/`}
                variante="primario"
              >
                Episódio {proximo.meta.numero} →
              </BotaoLink>
            ) : (
              <BotaoLink href={`${base}/`} variante="primario">
                Voltar à temporada
              </BotaoLink>
            )}
          </nav>
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
