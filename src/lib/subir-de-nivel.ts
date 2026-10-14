/**
 * Subir de nível: o que muda de um nível para o outro, lido da tabela de
 * cada classe (o SRD 5.2.1 já traduzido em content/classes), e o registro
 * de cada subida, que fica nos ajustes da ficha viva (supabase/0008).
 *
 * A subida guarda só o que ela deu (PV, atributos, escolhas). Os números da
 * ficha saem da conta "ficha do site + ajustes + subidas", em
 * ajustes-da-ficha.ts, e desfazer a última subida é tirar ela da lista.
 *
 * Roda no navegador: nada de disco aqui. Os dados da classe vêm de
 * /classes/<slug>/niveis.json (ver dados-de-nivel.ts).
 */

import { ancora } from "@/lib/regras-ancora";
import type { Patamar } from "@/lib/classes";

// ---------- Os dados de uma classe ----------

export type OpcaoDeInvocacao = {
  nome: string;
  prerequisito: string | null;
  nivelMinimo: number;
  /** Outras invocações exigidas (basta uma delas). */
  exige: string[];
  truqueDeDano: boolean;
  truqueDeAtaque: boolean;
  repetivel: boolean;
  texto: string;
};

export type TalentoDaLista = {
  id: string;
  nome: string;
  /** "Origem", "Gerais", "Estilo de Luta", "Dádiva Épica". */
  categoria: string;
  prerequisito: string | null;
  nivelMinimo: number;
  texto: string;
};

export type MagiaDaClasse = { slug: string; nome: string; nivel: number; dano: boolean; ataque: boolean };

export type DadosDeNivel = {
  slug: string;
  nome: string;
  dadoDeVida: number;
  colunas: string[];
  /** Uma linha da tabela por nível, do 1 ao 20. */
  linhas: string[][];
  patamares: Patamar[];
  subclasse: { nome: string; lema: string; patamares: Patamar[] };
  invocacoes: OpcaoDeInvocacao[];
  magias: MagiaDaClasse[];
  talentos: TalentoDaLista[];
};

/** A magia causa dano (tem dado de dano)? E pede jogada de ataque? */
export function danoDaMagia(texto: string): { dano: boolean; ataque: boolean } {
  return { dano: /\d+d\d+[^.]{0,40}\bdano\b|\bdano\b[^.]{0,20}\d+d\d+/.test(texto), ataque: /jogada de ataque/i.test(texto) };
}

// ---------- O registro de uma subida ----------

export type Escolha =
  | { tipo: "invocacao"; nome: string; truque?: string }
  | { tipo: "truque" | "magia"; slug: string; nome: string }
  | { tipo: "talento"; id: string; nome: string; atributo?: string }
  | { tipo: "subclasse"; nome: string }
  | { tipo: "nota"; titulo: string; texto: string };

export type Troca = { tipo: "invocacao" | "truque" | "magia"; de: string; para: string; slug?: string };

export type SubidaDeNivel = {
  /** O nível a que chegou. */
  nivel: number;
  /** Os PV máximos ganhos (dado + Constituição + extras). */
  pv: number;
  dado: "media" | "rolado";
  /** Aumento no Valor de Atributo: quanto cada atributo subiu. */
  atributos?: Record<string, number>;
  escolhas: Escolha[];
  trocas?: Troca[];
  por: "mestre" | "jogador";
  em: string;
};

// ---------- Contas ----------

export const proficienciaDo = (nivel: number) => 2 + Math.floor((Math.max(1, nivel) - 1) / 4);
export const pvMedio = (dado: number) => dado / 2 + 1;

const numero = (texto: string | undefined) => {
  const n = Number.parseInt((texto ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/** O valor de uma coluna da tabela num nível ("Invocações Místicas" no 2: "3"). */
export function celula(d: DadosDeNivel, nivel: number, coluna: string): string | undefined {
  const i = d.colunas.findIndex((c) => c.startsWith(coluna));
  return i >= 0 ? d.linhas[nivel - 1]?.[i] : undefined;
}

const NAO_E_NUMERO = new Set(["Nível", "Características de classe"]);

/** O que muda na tabela da classe de um nível para o seguinte. */
export function mudancasDaTabela(d: DadosDeNivel, para: number) {
  const antes = d.linhas[para - 2] ?? [];
  const depois = d.linhas[para - 1] ?? [];
  return d.colunas.flatMap((coluna, i) =>
    !NAO_E_NUMERO.has(coluna) && antes[i] !== depois[i] ? [{ coluna, antes: antes[i] ?? "–", depois: depois[i] ?? "–" }] : []
  );
}

/** Quantos a mais de uma coluna o nível novo dá (0 se a coluna não existe). */
export function aMais(d: DadosDeNivel, para: number, coluna: string): number {
  return Math.max(0, numero(celula(d, para, coluna)) - numero(celula(d, para - 1, coluna)));
}

/** O círculo mais alto de magia que o nível alcança (0: nenhum). */
export function circuloMaximo(d: DadosDeNivel, nivel: number): number {
  const pacto = celula(d, nivel, "Círculo dos espaços");
  if (pacto) return numero(pacto);
  let maior = 0;
  d.colunas.forEach((c, i) => {
    const circulo = c.match(/^(\d)º$/)?.[1];
    if (circulo && numero(d.linhas[nivel - 1]?.[i]) > 0) maior = Math.max(maior, Number(circulo));
  });
  return maior;
}

/** As características que chegam no nível, da classe e da subclasse do SRD. */
export function oQueChega(d: DadosDeNivel, nivel: number, temSubclasseDoSrd: boolean): Patamar[] {
  const daClasse = d.patamares.filter((p) => p.nivel === nivel);
  const daSub = temSubclasseDoSrd ? d.subclasse.patamares.filter((p) => p.nivel === nivel) : [];
  return [...daClasse, ...daSub.map((p) => ({ ...p, nomes: p.nomes.map((n) => `${n} (${d.subclasse.nome})`) }))];
}

/** As características do nível que pedem uma escolha que o site não sabe guiar. */
export function pedemEscolhaLivre(p: Patamar): boolean {
  if (/Aumento no Valor de Atributo|Subclasse de|Estilo de Luta|Dádiva Épica|Invocações Místicas|Magia de Pacto|Conjuração/.test(p.nomes.join(" ")))
    return false;
  return /\b[Ee]scolha (uma|um|duas|dois|três) |(ganha|aprende) [^.]{0,80}à sua escolha/.test(p.texto);
}

// ---------- O que o personagem já tem ----------

/** As invocações que já tem: as da ficha do site e as das subidas, com as trocas. */
export function invocacoesQueTem(d: DadosDeNivel, conhecidasDoSite: string[], subidas: SubidaDeNivel[]): string[] {
  const doSite = d.invocacoes.filter((o) => conhecidasDoSite.includes(ancora(o.nome))).map((o) => o.nome);
  return aplicarTrocas(doSite, subidas, "invocacao", (e) => (e.tipo === "invocacao" ? e.nome : null));
}

/** Os truques ou as magias que já tem, pelo slug. */
export function magiasQueTem(d: DadosDeNivel, conhecidasDoSite: string[], subidas: SubidaDeNivel[], truques: boolean): string[] {
  const doSite = d.magias.filter((m) => conhecidasDoSite.includes(m.slug) && (m.nivel === 0) === truques).map((m) => m.slug);
  const tipo = truques ? "truque" : "magia";
  return aplicarTrocas(doSite, subidas, tipo, (e) => (e.tipo === tipo ? e.slug : null), true);
}

function aplicarTrocas(
  inicio: string[],
  subidas: SubidaDeNivel[],
  tipo: Troca["tipo"],
  pegar: (e: Escolha) => string | null,
  porSlug = false
): string[] {
  const lista = [...inicio];
  for (const s of subidas) {
    for (const e of s.escolhas) {
      const v = pegar(e);
      if (v) lista.push(v);
    }
    for (const t of s.trocas ?? []) {
      if (t.tipo !== tipo) continue;
      const i = lista.indexOf(t.de);
      if (i >= 0) lista[i] = porSlug ? (t.slug ?? t.para) : t.para;
    }
  }
  return lista;
}

/** A invocação pode ser escolhida agora? Devolve o motivo, se não puder. */
export function porQueNao(
  o: OpcaoDeInvocacao,
  nivel: number,
  tem: string[],
  truquesDeDano: number,
  truquesDeAtaque: number
): string | null {
  if (nivel < o.nivelMinimo) return `a partir do nível ${o.nivelMinimo}`;
  if (tem.includes(o.nome) && !o.repetivel) return "já tem";
  if (o.exige.length && !o.exige.some((n) => tem.includes(n))) return `exige ${o.exige.join(" ou ")}`;
  if (o.truqueDeAtaque && !truquesDeAtaque) return "exige um truque de Bruxo com jogada de ataque";
  if (o.truqueDeDano && !truquesDeDano) return "exige um truque de Bruxo que cause dano";
  return null;
}

/** Os atributos que um talento deixa subir em 1 ("Aumente o seu valor de Força ou de Destreza em 1"). */
export function atributosDoTalento(texto: string): string[] {
  const frase = texto.match(/_Aumento no Valor de Atributo\._ ([^\n]+)/)?.[1] ?? "";
  if (/um valor de atributo à sua escolha/i.test(frase)) return ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"];
  return ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"].filter((a) => frase.includes(a));
}
