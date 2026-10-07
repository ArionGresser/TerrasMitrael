/**
 * O que a lista do grimório precisa saber sem carregar as magias inteiras.
 *
 * Fica separado de magias.ts de propósito: o filtro da lista roda no
 * navegador, e importar magias.ts ali levaria junto o texto de todas as
 * magias, centenas de quilobytes que ninguém pediu para baixar.
 */

export const ESCOLAS = [
  "Abjuração",
  "Adivinhação",
  "Conjuração",
  "Encantamento",
  "Evocação",
  "Ilusão",
  "Necromancia",
  "Transmutação",
];

export const CLASSES = [
  "Bardo",
  "Bruxo",
  "Clérigo",
  "Druida",
  "Feiticeiro",
  "Mago",
  "Paladino",
  "Patrulheiro",
];

/** "Truque", "1º círculo", "9º círculo". */
export function circulo(nivel: number): string {
  return nivel === 0 ? "Truque" : `${nivel}º círculo`;
}

/** Só o que a lista precisa, para não mandar o texto de todas ao navegador. */
export type ResumoDaMagia = {
  slug: string;
  nome: string;
  original: string;
  nivel: number;
  escola: string;
  classes: string[];
  tempo: string;
  concentracao: boolean;
  ritual: boolean;
};
