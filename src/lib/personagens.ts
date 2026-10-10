import type { ComponentType } from "react";

import * as howai from "@/content/personagens/howai.mdx";
import * as levi from "@/content/personagens/levi.mdx";
import * as filavandrel from "@/content/personagens/filavandrel.mdx";
import * as nero from "@/content/personagens/nero.mdx";
import * as rargnos from "@/content/personagens/rargnos.mdx";
import * as tyr from "@/content/personagens/tyr.mdx";
import * as mestre from "@/content/personagens/mestre.mdx";
import * as lily from "@/content/personagens/lily-bouvardia.mdx";
import * as pyhmm from "@/content/personagens/pyhmm-phylimm.mdx";
import * as johnny from "@/content/personagens/johnny-bling-bling.mdx";
import * as vrakyr from "@/content/personagens/vrakyr-windrose.mdx";
import * as egon from "@/content/personagens/egon-vitriol.mdx";
import * as bralzeg from "@/content/personagens/bralzeg-lodbrok.mdx";

export type Atributo = {
  nome: string;
  valor: string;
  raca?: string;
  modificador?: string;
};

export type Habilidade = {
  nome: string;
  tipo: string;
  /** Sem imagem, a ficha mostra o selo em branco no lugar. */
  imagem?: string;
  descricao: string;
};

/** Um item da ficha antiga, com os dados escritos do jeito que a mesa usava. */
export type ItemAntigo = {
  nome: string;
  /** Os dados do item, como "2d15 ATK" ou "1d10 DEF". */
  valores?: string;
  descricao?: string;
};

/** O que um personagem antigo carrega. Cada parte só aparece se existir. */
export type MochilaAntiga = {
  armas?: ItemAntigo[];
  equipamento?: ItemAntigo[];
  inventario?: string[];
  moedas?: { nome: string; quantidade: string; metal?: string }[];
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
  /**
   * Onde fica o rosto no retrato, de 0 a 1 na largura e na altura.
   * Serve a quem recorta o retrato numa faixa estreita, como o mosaico dos
   * cartazes dos Contos: sem isso a faixa mostra o meio da imagem, e o meio
   * quase nunca é o rosto.
   */
  rosto?: { x: number; y: number };
  ilustracao?: string;
  ilustracaoAlt?: string;
  /**
   * Mostra a ilustração inteira, num quadro quadrado, em vez de cortá-la
   * na faixa larga. Para arte quadrada que não pode perder as bordas, como
   * um retrato encomendado.
   */
  ilustracaoQuadrada?: boolean;
  /** Mostra a ilustração inteira num quadro em pé, como um desenho de corpo inteiro. */
  ilustracaoEmPe?: boolean;
  ilustracaoLegenda?: string;
  /** Símbolo do clã ou da casa, em PNG ou WebP com fundo transparente. */
  brasao?: string;
  /**
   * Quando o brasão tem um anel em volta (como as runas do bando Vitriol),
   * as duas partes em separado: o centro fica parado e o anel gira devagar.
   * O `brasao` inteiro continua valendo para quem pede menos movimento.
   */
  brasaoCentro?: string;
  brasaoAnel?: string;
  brasaoAlt?: string;
  brasaoLegenda?: string;
  /**
   * Palavras que vão ao lado do brasão, numa coluna separada por um traço,
   * como as anotações na margem de um diário ("Astuto · Caótico...").
   */
  brasaoTracos?: string[];
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
    /** Como ele é no trato, em poucas palavras. */
    temperamento?: string;
  };
  atributos?: Atributo[];
  habilidades?: Habilidade[];
  mochila?: MochilaAntiga;
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
  nero,
  rargnos,
  tyr,
  mestre,
  lily,
  pyhmm,
  johnny,
  vrakyr,
  egon,
  bralzeg,
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

/**
 * Quem vem antes e depois na ficha, na mesma ordem da lista: os atuais, a
 * primeira geração e o Mestre. As pontas dão a volta, para os dois botões
 * da ficha sempre levarem a alguém.
 */
export function vizinhos(slug: string): { anterior: Personagem; proximo: Personagem } | undefined {
  const ordem = [...PERSONAGENS_ATUAIS, ...ORIGIN_HEROES, ...FORA_DE_CATEGORIA];
  const i = ordem.findIndex((p) => p.meta.slug === slug);
  if (i < 0 || ordem.length < 2) return undefined;
  return {
    anterior: ordem[(i - 1 + ordem.length) % ordem.length],
    proximo: ordem[(i + 1) % ordem.length],
  };
}

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
