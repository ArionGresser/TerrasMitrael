import dados from "@/content/magias/magias.json";
import { circulo, type ResumoDaMagia } from "./magias-base";

/**
 * O grimório: as magias das regras de 2024, em português.
 *
 * Vêm do SRD 5.2.1, o Documento de Referência do Sistema que a Wizards of
 * the Coast liberou sob licença Creative Commons Attribution 4.0. O arquivo
 * content/magias/magias.json é gerado por scripts/magias/gerar.py, a partir
 * da tradução em scripts/magias/traducao/. Não edite o JSON à mão: edite a
 * tradução e rode o gerador.
 */

export type Magia = {
  slug: string;
  nome: string;
  /** O nome em inglês, como está no SRD, para quem joga com o livro. */
  original: string;
  /** 0 é truque. */
  nivel: number;
  escola: string;
  classes: string[];
  tempo: string;
  alcance: string;
  componentes: string;
  duracao: string;
  concentracao: boolean;
  ritual: boolean;
  /** Markdown simples: parágrafos, _itálico_, **negrito**, listas e tabelas. */
  texto: string;
};

export const MAGIAS = dados as Magia[];

export { ESCOLAS, CLASSES, circulo, type ResumoDaMagia } from "./magias-base";

const POR_NOME = new Map(MAGIAS.map((magia) => [magia.nome, magia]));

/** Acha a magia pelo nome em português, como aparece nas fichas e nos textos. */
export function magiaPeloNome(nome: string): Magia | undefined {
  return POR_NOME.get(nome);
}

export function buscarMagia(slug: string): Magia | undefined {
  return MAGIAS.find((magia) => magia.slug === slug);
}

/** A linha de baixo do nome: "Evocação de 3º círculo", "Truque de Evocação". */
export function rotuloDaMagia(magia: Magia): string {
  return magia.nivel === 0
    ? `Truque de ${magia.escola}`
    : `${magia.escola} de ${circulo(magia.nivel)}`;
}

export function indiceDoGrimorio(): ResumoDaMagia[] {
  return MAGIAS.map(
    ({ slug, nome, original, nivel, escola, classes, tempo, concentracao, ritual }) => ({
      slug,
      nome,
      original,
      nivel,
      escola,
      classes,
      tempo,
      concentracao,
      ritual,
    })
  );
}
