import dados from "@/content/monstros/monstros.json";
import { TAMANHOS, type ResumoDoMonstro } from "./monstros-base";
import { arte } from "./arte";
import { lerDadosDePv, lerNumero, type CriaturaDeCombate } from "./encontros";

/**
 * O bestiário: os monstros e animais das regras de 2024, em português.
 *
 * Vêm do SRD 5.2.1 (Creative Commons Attribution 4.0). O arquivo
 * content/monstros/monstros.json é gerado por scripts/monstros/gerar.py: as
 * partes fixas da ficha são traduzidas por tabela (scripts/monstros/fixos.py)
 * e os traços e ações, à mão (scripts/monstros/traducao/). Não edite o JSON
 * à mão: edite a tradução e rode o gerador.
 */

export type Monstro = ResumoDoMonstro & {
  /** "Aberração Grande, Leal e Mau". */
  linha: string;
  ca: string;
  iniciativa: string;
  pv: string;
  deslocamento: string;
  atributos: { sigla: string; valor: number; mod: string; save: string }[];
  /** Perícias, resistências, sentidos, idiomas... só os que a ficha tem. */
  campos: { rotulo: string; valor: string }[];
  xp: string;
  bp: string;
  /** Traços, Ações, Ações Bônus, Reações e Ações Lendárias, em markdown. */
  secoes: { titulo: string; texto: string }[];
};

export const MONSTROS = dados as Monstro[];

export { TIPOS, TAMANHOS, type ResumoDoMonstro } from "./monstros-base";

const POR_NOME = new Map<string, Monstro>(MONSTROS.map((m) => [m.nome, m]));
// Nomes no plural que aparecem em negrito nas fichas
POR_NOME.set("Pudins Negros", POR_NOME.get("Pudim Negro")!);
POR_NOME.set("Geleias Ocres", POR_NOME.get("Geleia Ocre")!);

/** Acha a criatura pelo nome em português, como aparece em negrito nos textos. */
export function monstroPeloNome(nome: string): Monstro | undefined {
  return POR_NOME.get(nome);
}

export function buscarMonstro(slug: string): Monstro | undefined {
  return MONSTROS.find((m) => m.slug === slug);
}

export function tamanhoEmPortugues(en: string): string {
  return TAMANHOS.find(([chave]) => chave === en)?.[1] ?? en;
}

export function indiceDoBestiario(): ResumoDoMonstro[] {
  return MONSTROS.map(
    ({ slug, nome, original, fonte, tipo, tamanho, nd, ndNumero }) => ({
      slug,
      nome,
      original,
      fonte,
      tipo,
      tamanho,
      nd,
      ndNumero,
      // A arte inteira, deitada: a lista mostra a cena, não um recorte quadrado
      imagem: arte("monstros", slug) ?? arte("monstros/mini", slug),
    }),
  );
}

/** As criaturas com o que o gerador de encontros e o combate precisam. */
const SEM_BOLSO = ["Fera", "Enxame", "Gosma", "Planta"];

/** Ver CriaturaDeCombate.carrega. */
function carrega(m: (typeof MONSTROS)[number]): boolean {
  if (m.campos.some((c) => c.rotulo === "Equipamento")) return true;
  if (SEM_BOLSO.includes(m.tipo)) return false;
  const int = m.atributos.find((a) => a.sigla.toUpperCase() === "INT")?.valor ?? 10;
  return int >= 5;
}

export function criaturasDeCombate(): CriaturaDeCombate[] {
  return MONSTROS.map((m) => ({
    slug: m.slug,
    nome: m.nome,
    tipo: m.tipo,
    fonte: m.fonte,
    nd: m.nd,
    ndNumero: m.ndNumero,
    xp: lerNumero(m.xp),
    ca: lerNumero(m.ca),
    pv: lerNumero(m.pv),
    pvDados: lerDadosDePv(m.pv),
    iniciativa: lerNumero(m.iniciativa),
    imagem: arte("monstros/mini", m.slug) ?? arte("monstros", m.slug),
    carrega: carrega(m),
  }));
}
