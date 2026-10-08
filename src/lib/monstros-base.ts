/**
 * O que a lista do bestiário precisa saber sem carregar as fichas inteiras.
 *
 * Fica separado de monstros.ts pelo mesmo motivo de magias-base.ts: o
 * filtro roda no navegador, e o texto de todas as fichas pesaria à toa.
 */

export const TIPOS = [
  "Aberração",
  "Celestial",
  "Constructo",
  "Dragão",
  "Elemental",
  "Enxame",
  "Fada",
  "Fera",
  "Gigante",
  "Gosma",
  "Humanoide",
  "Ínfero",
  "Monstruosidade",
  "Morto-Vivo",
  "Planta",
];

/** Do menor para o maior, com o nome em português. */
export const TAMANHOS: [string, string][] = [
  ["Tiny", "Miúdo"],
  ["Small", "Pequeno"],
  ["Medium", "Médio"],
  ["Large", "Grande"],
  ["Huge", "Enorme"],
  ["Gargantuan", "Imenso"],
];

export type ResumoDoMonstro = {
  slug: string;
  nome: string;
  original: string;
  fonte: "monstro" | "animal";
  tipo: string;
  tamanho: string;
  nd: string;
  ndNumero: number;
  /** A arte da criatura, quando já existe (public/images/monstros/<slug>.webp). */
  imagem?: string;
};
