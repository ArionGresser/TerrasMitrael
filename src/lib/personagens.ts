import type { ComponentType } from "react";

import * as howai from "@/content/personagens/howai.mdx";
import * as levi from "@/content/personagens/levi.mdx";
import * as filavandrel from "@/content/personagens/filavandrel.mdx";
import * as baine from "@/content/personagens/baine.mdx";
import * as nero from "@/content/personagens/nero.mdx";
import * as rargnos from "@/content/personagens/rargnos.mdx";
import * as tyr from "@/content/personagens/tyr.mdx";
import * as mestre from "@/content/personagens/mestre.mdx";

export type Atributo = {
  nome: string;
  valor: string;
  raca?: string;
  modificador?: string;
};

export type Habilidade = {
  nome: string;
  tipo: string;
  imagem: string;
  descricao: string;
};

export type MetaPersonagem = {
  slug: string;
  nome: string;
  epiteto: string;
  originHero: boolean;
  mestre?: boolean;
  ordem: number;
  resumo: string;
  imagem: string;
  imagemAlt: string;
  ilustracao?: string;
  ilustracaoAlt?: string;
  audio?: string;
  identidade: {
    idade: string;
    altura: string;
    genero: string;
    classe: string;
    raca: string;
  };
  pontos: { vida: string; nivel: string; experiencia: string; sanidade: string };
  personalidade: {
    alinhamento: string;
    motivacoes: string;
    inspiracoes: string;
    defeitos: string;
    objetivo: string;
    adoracao?: string;
  };
  atributos: Atributo[];
  habilidades: Habilidade[];
  citacoes: string[];
};

export type Personagem = {
  meta: MetaPersonagem;
  Historia: ComponentType;
};

/**
 * Para adicionar um personagem novo:
 * 1. crie o arquivo em content/personagens/nome.mdx
 * 2. importe-o acima
 * 3. acrescente-o à lista abaixo
 *
 * Personagens criados sob o sistema de regras caseiro levam
 * `originHero: true` e recebem o selo na página.
 */
const MODULOS = [howai, levi, filavandrel, baine, nero, rargnos, tyr, mestre];

export const PERSONAGENS: Personagem[] = MODULOS.map((modulo) => ({
  meta: modulo.meta as MetaPersonagem,
  Historia: modulo.default as ComponentType,
})).sort((a, b) => a.meta.ordem - b.meta.ordem);

/** Primeira geração de jogadores, com fichas do sistema caseiro. */
export const ORIGIN_HEROES = PERSONAGENS.filter((p) => p.meta.originHero);

/** Personagens criados já sob as regras de D&D 5.5e. */
export const PERSONAGENS_ATUAIS = PERSONAGENS.filter(
  (p) => !p.meta.originHero && !p.meta.mestre
);

/** Fora das duas categorias: o Mestre. */
export const FORA_DE_CATEGORIA = PERSONAGENS.filter((p) => p.meta.mestre);

export function buscarPersonagem(slug: string): Personagem | undefined {
  return PERSONAGENS.find((p) => p.meta.slug === slug);
}
