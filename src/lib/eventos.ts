import type { ComponentType } from "react";

import * as guerraLeviana from "@/content/eventos/guerra-leviana.mdx";

export type MetaEvento = {
  slug: string;
  nome: string;
  subtitulo: string;
  resumo: string;
  chamada: string;
  imagem: string;
  imagemAlt: string;
  duracao: string;
  ordem: number;
  destaque?: boolean;
};

export type Evento = {
  meta: MetaEvento;
  Conteudo: ComponentType;
};

/**
 * Para adicionar um evento novo:
 * 1. crie o arquivo em content/eventos/nome-do-evento.mdx
 * 2. importe-o acima
 * 3. acrescente-o à lista abaixo
 */
const MODULOS = [guerraLeviana];

export const EVENTOS: Evento[] = MODULOS.map((modulo) => ({
  meta: modulo.meta as MetaEvento,
  Conteudo: modulo.default as ComponentType,
})).sort((a, b) => a.meta.ordem - b.meta.ordem);

export function buscarEvento(slug: string): Evento | undefined {
  return EVENTOS.find((evento) => evento.meta.slug === slug);
}

/**
 * A cronologia da Terceira Era, reconstruída a partir das crônicas.
 * Serve à linha do tempo da página de Eventos.
 */
export type Marco = {
  ano: string;
  titulo: string;
  texto: string;
  peso?: "normal" | "grave";
};

export const CRONOLOGIA: Marco[] = [
  {
    ano: "Fim do século V",
    titulo: "A queda da ditadura",
    texto:
      "As amarras de uma ditadura imperial sanguinária chegam ao fim. O livre mercado nasce e o desenvolvimento cresce de forma acelerada.",
  },
  {
    ano: "Ano 614",
    titulo: "A expedição parte",
    texto:
      "Dezesseis embarcações levam as melhores mentes do continente rumo ao desconhecido, para provar teorias e encontrar novas terras.",
  },
  {
    ano: "Ano 614",
    titulo: "A costa vermelha",
    texto:
      "Oito dias depois, a frota encontra Askar e é recebida a fogo. Apenas quatro embarcações voltam para casa.",
    peso: "grave",
  },
  {
    ano: "Ano 614",
    titulo: "Seis Orcs em um vilarejo",
    texto:
      "Dois dias após o retorno, o primeiro desembarque inimigo mata centenas de pessoas que não esperavam visita nenhuma. A guerra começa.",
    peso: "grave",
  },
  {
    ano: "Ano 624",
    titulo: "Os Honrados Voluntários",
    texto:
      "Dez anos de derrotas levam o Rei Surmellion 2º a convocar todo povo destemido do continente. Milhões atendem ao chamado.",
  },
  {
    ano: "Ano 647",
    titulo: "O último suspiro",
    texto:
      "Após trinta e três anos, com a derrota iminente, o Rei convoca os Lendários Magos e os misteriosos de Vérsia. Feitiços proibidos voltam à mesa.",
    peso: "grave",
  },
  {
    ano: "Ano 650",
    titulo: "A vitória e o seu preço",
    texto:
      "O Exército Vermelho é quebrado. Um domo mágico sela Askar para sempre, e o campo de batalha vira a Terra dos Putrefados.",
    peso: "grave",
  },
];
