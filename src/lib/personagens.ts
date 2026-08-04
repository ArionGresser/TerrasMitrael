import type { ComponentType } from "react";

import * as howai from "@/content/personagens/howai.mdx";
import * as levi from "@/content/personagens/levi.mdx";
import * as filavandrel from "@/content/personagens/filavandrel.mdx";
import * as baine from "@/content/personagens/baine.mdx";
import * as nero from "@/content/personagens/nero.mdx";
import * as rargnos from "@/content/personagens/rargnos.mdx";
import * as tyr from "@/content/personagens/tyr.mdx";
import * as mestre from "@/content/personagens/mestre.mdx";
import * as lily from "@/content/personagens/lily-bouvardia.mdx";
import * as ryhmm from "@/content/personagens/ryhmm-phylimm.mdx";
import * as johnny from "@/content/personagens/johnny-bling-bling.mdx";

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

/** Um atributo na ficha de D&D 5.5e, com a salvaguarda junto. */
export type AtributoAtual = {
  nome: string;
  valor: string;
  modificador: string;
  salvaguarda: string;
  proficiente?: boolean;
};

export type Pericia = { nome: string; bonus: string; proficiente?: boolean };

export type Arma = {
  nome: string;
  bonus?: string;
  dano: string;
  observacoes?: string;
};

/**
 * A ficha nas regras de 2024.
 *
 * Magias, traços, talentos e características não moram aqui: a ficha guarda
 * só a chave de cada um, e o texto vem de src/lib/habilidades.ts. É o que
 * garante que a mesma magia em dois personagens seja a mesma magia.
 */
export type FichaAtual = {
  sistema: "5.5e";
  classe: string;
  subclasse?: string;
  antecedente: string;
  especie: string;
  nivel: string;
  experiencia: string;
  alinhamento: string;
  combate: {
    ca: string;
    pv: string;
    pvTemporarios?: string;
    bonusProficiencia: string;
    iniciativa: string;
    deslocamento: string;
    tamanho: string;
    percepcaoPassiva: string;
  };
  atributos: AtributoAtual[];
  pericias: Pericia[];
  armas: Arma[];
  conjuracao?: {
    atributo: string;
    modificador: string;
    cd: string;
    ataque: string;
  };
  magias: string[];
  caracteristicas: string[];
  tracos: string[];
  talentos: string[];
  treinamento: { armaduras: string; armas: string; ferramentas?: string };
  idiomas: string[];
  equipamento: string[];
  moedas: { pc?: string; pp?: string; ce?: string; po?: string; pl?: string };
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
  /** Chaves de src/lib/tags.ts. Viram fitas costuradas na ficha. */
  tags?: string[];
  /** Frase que aparece no lugar da história, enquanto ela não existe. */
  emConstrucao?: string;
  citacoes: string[];

  /** Ficha nas regras de 2024. Os personagens novos usam esta. */
  ficha?: FichaAtual;

  // ---- Daqui para baixo, só a primeira geração ----
  identidade?: {
    idade: string;
    altura: string;
    genero: string;
    classe: string;
    raca: string;
  };
  pontos?: { vida: string; nivel: string; experiencia: string; sanidade: string };
  personalidade?: {
    alinhamento: string;
    motivacoes: string;
    inspiracoes: string;
    defeitos: string;
    objetivo: string;
    adoracao?: string;
  };
  atributos?: Atributo[];
  habilidades?: Habilidade[];
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
const MODULOS = [
  howai,
  levi,
  filavandrel,
  baine,
  nero,
  rargnos,
  tyr,
  mestre,
  lily,
  ryhmm,
  johnny,
];

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

/**
 * As fitas de um personagem.
 *
 * Quem não declarou `tags` no próprio arquivo recebe as que a condição dele
 * já implica, para as fichas antigas não precisarem ser editadas uma a uma.
 */
export function tagsDe(meta: MetaPersonagem): string[] {
  if (meta.tags) return meta.tags;
  if (meta.mestre) return ["mestre"];
  if (meta.originHero) return ["origin-hero", "ficha-antiga"];
  return [];
}
