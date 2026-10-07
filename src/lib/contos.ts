import type { ComponentType } from "react";
import { buscarPersonagem } from "./personagens";

import * as t2e1 from "@/content/contos/cronicas/temporada-2/episodio-01.mdx";
import * as t2e2 from "@/content/contos/cronicas/temporada-2/episodio-02.mdx";
import * as t2e3 from "@/content/contos/cronicas/temporada-2/episodio-03.mdx";

/**
 * Os Contos de Mitrael: as sessões jogadas, contadas como história.
 *
 * Organizado como uma estante de séries. Cada série tem temporadas, cada
 * temporada tem episódios, e cada episódio é uma sessão de mesa reescrita.
 * Nada nos episódios é inventado: o texto dá forma ao que aconteceu na
 * mesa, sem acrescentar fato que não foi jogado.
 *
 * Série ainda em produção aparece na estante, apagada e sem clique, para
 * quem chega saber o que vem por aí.
 */

export type MetaEpisodio = {
  numero: number;
  titulo: string;
  /** Uma ou duas frases, para a lista da temporada. Sem estragar o final. */
  resumo: string;
  /** Quando a sessão foi jogada, do jeito que se fala: "agosto de 2026". */
  sessao?: string;
  /** Quem esteve na mesa nesta sessão, pelas chaves dos personagens. */
  elenco: string[];
};

export type Episodio = {
  meta: MetaEpisodio;
  Texto: ComponentType;
};

export type Temporada = {
  numero: number;
  titulo: string;
  sinopse: string;
  /** Chaves dos personagens em src/lib/personagens.ts, na ordem de cena. */
  elenco: string[];
  episodios: Episodio[];
};

export type ArteDoCartaz =
  | { tipo: "imagem"; imagem: string; alt: string; posicao?: string }
  /** Faixas verticais com o retrato de cada personagem, lado a lado. */
  | { tipo: "mosaico"; personagens: string[] };

export type Serie = {
  slug: string;
  titulo: string;
  /** A etiqueta em cima do cartaz, como "Campanha principal". */
  selo: string;
  /** Uma linha de efeito, que vai embaixo do título no cartaz. */
  chamada: string;
  sinopse: string;
  arte: ArteDoCartaz;
  /** Falso deixa o cartaz apagado, com a faixa "Em produção" e sem clique. */
  disponivel: boolean;
  temporadas: Temporada[];
};

/**
 * Para publicar um episódio novo:
 * 1. crie o arquivo em content/contos/<série>/temporada-N/episodio-NN.mdx
 * 2. importe-o no topo deste arquivo
 * 3. acrescente-o à lista `episodios` da temporada certa
 */
function episodios(modulos: { meta: unknown; default: unknown }[]): Episodio[] {
  return modulos
    .map((modulo) => ({
      meta: modulo.meta as MetaEpisodio,
      Texto: modulo.default as ComponentType,
    }))
    .sort((a, b) => a.meta.numero - b.meta.numero);
}

export const SERIES: Serie[] = [
  {
    slug: "cronicas",
    titulo: "Crônicas de Mitrael",
    selo: "Campanha principal",
    chamada: "Tudo o que aconteceu na mesa, sessão a sessão",
    sinopse:
      "A campanha principal de Terras de Mitrael, contada episódio por episódio. O que está escrito aqui foi jogado: as escolhas, os dados e o preço de cada um.",
    arte: {
      tipo: "mosaico",
      personagens: [
        "lily-bouvardia",
        "pyhmm-phylimm",
        "egon-vitriol",
        "johnny-bling-bling",
        "vrakyr-windrose",
      ],
    },
    disponivel: true,
    temporadas: [
      {
        numero: 1,
        titulo: "A primeira geração",
        sinopse:
          "As sessões do elenco antigo, jogadas sob o sistema de regras da casa, do primeiro ano de mesa em diante. Foi aqui que boa parte do mapa ganhou nome.",
        elenco: [
          "howai",
          "levi",
          "bralzeg-lodbrok",
          "filavandrel",
          "nero",
          "rargnos",
          "tyr",
        ],
        episodios: episodios([]),
      },
      {
        numero: 2,
        titulo: "O novo elenco",
        sinopse:
          "Cinco desconhecidos, já sob as regras de 2024: uma clériga centaura, um pequenino arqueólogo, um goblin bruxo, um anão mineiro e um paladino leonino.",
        elenco: [
          "lily-bouvardia",
          "pyhmm-phylimm",
          "johnny-bling-bling",
          "vrakyr-windrose",
          "egon-vitriol",
        ],
        episodios: episodios([t2e1, t2e2, t2e3]),
      },
    ],
  },
  {
    slug: "contos-de-johnny",
    titulo: "Os Contos de Johnny Bling Bling Money",
    selo: "Spin-off",
    chamada: "Golpes, pactos e uma coroa torta",
    sinopse:
      "As desventuras de Johnny Bling Bling Money longe da mesa principal.",
    arte: {
      tipo: "imagem",
      imagem: "/images/personagens/johnny-bling-bling-retrato.jpg",
      alt: "Johnny Bling Bling Money",
    },
    disponivel: false,
    temporadas: [],
  },
  {
    slug: "alquimia-universal",
    titulo: "Filavandrel Apresenta: A Alquimia Universal",
    selo: "Livro",
    chamada: "O caderno de um alquimista, aberto ao público",
    sinopse:
      "As fórmulas, os experimentos e as explosões de Filavandrel, página por página.",
    arte: {
      tipo: "imagem",
      imagem: "/images/filvandrel.jpg",
      alt: "Filavandrel",
    },
    disponivel: false,
    temporadas: [],
  },
];

export const SERIES_DISPONIVEIS = SERIES.filter((serie) => serie.disponivel);

export function buscarSerie(slug: string): Serie | undefined {
  return SERIES_DISPONIVEIS.find((serie) => serie.slug === slug);
}

/** O pedaço de endereço de uma temporada: "temporada-2". */
export function chaveDaTemporada(temporada: Temporada): string {
  return `temporada-${temporada.numero}`;
}

/** O pedaço de endereço de um episódio: "episodio-3". */
export function chaveDoEpisodio(episodio: Episodio): string {
  return `episodio-${episodio.meta.numero}`;
}

export function buscarTemporada(
  serie: Serie,
  chave: string
): Temporada | undefined {
  return serie.temporadas.find((t) => chaveDaTemporada(t) === chave);
}

export function buscarEpisodio(
  temporada: Temporada,
  chave: string
): Episodio | undefined {
  return temporada.episodios.find((e) => chaveDoEpisodio(e) === chave);
}

/** Nome e retrato de cada personagem do elenco, para os rostos da temporada. */
export function rostosDoElenco(slugs: string[]) {
  return slugs.flatMap((slug) => {
    const personagem = buscarPersonagem(slug);
    if (!personagem) return [];
    const { nome, imagem, rosto } = personagem.meta;
    return [{ slug, nome, imagem, rosto: rosto ?? { x: 0.5, y: 0 } }];
  });
}

/** "1 episódio", "3 episódios", ou o aviso de que ainda não há nenhum. */
export function contagemDeEpisodios(temporada: Temporada): string {
  const total = temporada.episodios.length;
  if (total === 0) return "Episódios em escrita";
  return total === 1 ? "1 episódio" : `${total} episódios`;
}
