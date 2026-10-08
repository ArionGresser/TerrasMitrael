/**
 * O que a lista de itens mágicos precisa saber sem carregar os textos.
 *
 * Fica separado de itens.ts pelo mesmo motivo de magias-base.ts: o filtro
 * roda no navegador, e o texto de todos os itens pesaria à toa.
 */

export const CATEGORIAS = [
  "Anel",
  "Arma",
  "Armadura",
  "Cajado",
  "Cetro",
  "Item Maravilhoso",
  "Pergaminho",
  "Poção",
  "Varinha",
];

/** Da mais comum para a mais rara. */
export const RARIDADES = [
  "Comum",
  "Incomum",
  "Raro",
  "Muito Raro",
  "Lendário",
  "Artefato",
];

export type ResumoDoItem = {
  slug: string;
  nome: string;
  original: string;
  categoria: string;
  raridades: string[];
  /** Quando a raridade muda conforme a versão do item (+1, +2, +3...). */
  variavel: boolean;
  sintonia: boolean;
  /** A arte do item, quando já existe (public/images/itens/<slug>.webp). */
  imagem?: string;
};

/** "Raro", "Incomum a Muito Raro". */
export function rotuloDaRaridade(
  item: Pick<ResumoDoItem, "raridades">,
): string {
  const r = item.raridades;
  return r.length === 1 ? r[0] : `${r[0]} a ${r[r.length - 1]}`;
}
