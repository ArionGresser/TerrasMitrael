import dados from "@/content/itens/itens.json";
import type { ResumoDoItem } from "./itens-base";
import { arte } from "./arte";

/**
 * Os itens mágicos das regras de 2024, em português.
 *
 * Vêm do SRD 5.2.1 (Creative Commons Attribution 4.0). O arquivo
 * content/itens/itens.json é gerado por scripts/itens/gerar.py, a partir da
 * tradução em scripts/itens/traducao/. Não edite o JSON à mão: edite a
 * tradução e rode o gerador.
 */

export type ItemMagico = ResumoDoItem & {
  /** A linha de baixo do nome, como "Item Maravilhoso, Raro (exige Sintonia)". */
  tipo: string;
  /** Markdown simples, o mesmo das magias. */
  texto: string;
};

export const ITENS = dados.itens as ItemMagico[];

export {
  CATEGORIAS,
  RARIDADES,
  rotuloDaRaridade,
  type ResumoDoItem,
} from "./itens-base";

const POR_NOME = new Map<string, ItemMagico>(
  ITENS.map((item) => [item.nome, item]),
);
for (const [apelido, nome] of Object.entries(
  dados.apelidos as Record<string, string>,
)) {
  POR_NOME.set(apelido, POR_NOME.get(nome)!);
}

/** Acha o item pelo nome em português, como aparece em itálico nos textos. */
export function itemPeloNome(nome: string): ItemMagico | undefined {
  return POR_NOME.get(nome);
}

export function buscarItem(slug: string): ItemMagico | undefined {
  return ITENS.find((item) => item.slug === slug);
}

export function indiceDosItens(): ResumoDoItem[] {
  return ITENS.map(
    ({ slug, nome, original, categoria, raridades, variavel, sintonia }) => ({
      slug,
      nome,
      original,
      categoria,
      raridades,
      variavel,
      sintonia,
      imagem: arte("itens", slug),
    }),
  );
}
