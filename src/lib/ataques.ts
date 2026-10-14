/**
 * Os ataques da arena: lidos do texto do Bestiário, trocados pela arma que
 * a criatura carrega no loot e rolados na hora.
 *
 * O Bestiário escreve um ataque assim:
 *   **_Arco Curto._** _Jogada de Ataque à Distância:_ +5, alcance 24/96 m.
 *   _Acerto:_ 6 (1d6 + 3) de dano perfurante.
 * Daqui sai o bônus (+5), os dados (1d6), o modificador (+3), o tipo e, se o
 * texto falar de uma condição ("fica com a condição Caído"), a condição.
 */

import { CONDICOES } from "@/lib/combate";

export type Ataque = {
  nome: string;
  distancia: boolean;
  bonus: number;
  /** Os dados do dano, sem o modificador: "1d6". Vazio quando o dano é fixo. */
  dados: string;
  mod: number;
  tipo: string;
  /** O dano a mais escrito depois ("mais 2 (1d4) de dano cortante se..."). */
  extra?: string;
  /** O dano a mais que vale sempre (sem "se"): entra na rolagem. "2d6" de "veneno". */
  extraDados?: string;
  extraTipo?: string;
  /** A condição que o texto diz que o golpe causa. */
  condicao?: string;
  /** De onde veio a troca: "no lugar do Arco Curto". */
  origem?: string;
  /** O +1, +2 ou +3 de uma arma mágica. */
  magico?: number;
  /** Item mágico com efeito próprio (Espada Flamejante): o Mestre confere o texto. */
  especial?: string;
  texto?: string;
};

/** A arma de um item do loot: o que ela muda no ataque de quem a carrega. */
export type ArmaDoItem = { base: string; dados: string; tipo: string; distancia: boolean; magico: number; especial?: boolean };

export type ItemDoLoot = { nome: string; destruido?: boolean; arma?: ArmaDoItem };

/** "**_Mordida._** texto" → nome e texto de cada habilidade da seção. */
export function habilidades(texto: string): { nome: string; texto: string }[] {
  return texto
    .split(/\n\s*\n/)
    .map((bloco) => {
      const m = bloco.match(/^\*\*_(.+?)\._\*\*\s*([\s\S]*)$/);
      return m ? { nome: m[1].trim(), texto: m[2].trim() } : { nome: "", texto: bloco.trim() };
    })
    .filter((h) => h.texto || h.nome);
}

const sinal = (s: string | undefined, n: string | undefined) => (n ? (s === "-" || s === "−" ? -1 : 1) * Number(n) : 0);

/** Um ataque do texto, ou null se a habilidade não for uma jogada de ataque. */
export function lerAtaque(nome: string, texto: string): Ataque | null {
  const jogada = texto.match(/_Jogada de Ataque ([^:]+?):_\s*([+−-]?\d+)/);
  if (!jogada) return null;
  const dano = texto.match(/_Acerto:_\s*(\d+)(?:\s*\((\d+d\d+)\s*(?:([+−-])\s*(\d+))?\))?\s*de dano (?:de )?(\p{L}+)/u);
  const extra = texto.match(/_Acerto:_[^.]*?\s(mais \d+ \((\d+d\d+)\) de dano (?:de )?(\p{L}+)([^.,]*))/u);
  const sempre = extra && !/^\s*se\b/.test(extra[4]);
  const condicao = CONDICOES.find((c) => new RegExp(`condição ${c}\\b`).test(texto));
  return {
    nome,
    distancia: /Dist/.test(jogada[1]) && !/Corpo a Corpo/.test(jogada[1]),
    bonus: Number(jogada[2].replace("−", "-")),
    dados: dano?.[2] ?? "",
    mod: dano?.[2] ? sinal(dano[3], dano[4]) : Number(dano?.[1] ?? 0),
    tipo: dano?.[5]?.toLowerCase() ?? "",
    extra: extra && !sempre ? extra[1].trim() : undefined,
    extraDados: sempre ? extra![2] : undefined,
    extraTipo: sempre ? extra![3].toLowerCase() : undefined,
    condicao,
    texto,
  };
}

/** Os ataques de todas as seções de ação da ficha. */
export function ataquesDaFicha(secoes: { titulo: string; texto: string }[]): Ataque[] {
  return secoes
    .filter((s) => /Ações|Reações/.test(s.titulo))
    .flatMap((s) => habilidades(s.texto).map((h) => (h.nome ? lerAtaque(h.nome, h.texto) : null)))
    .filter((a): a is Ataque => Boolean(a));
}

/** Quantos ataques os Ataques Múltiplos mandam fazer ("faz dois ataques"). */
export function quantosAtaques(texto: string): number {
  const n: Record<string, number> = { dois: 2, duas: 2, três: 3, tres: 3, quatro: 4, cinco: 5 };
  const m = texto.match(/faz (dois|duas|três|tres|quatro|cinco) ataques/i)?.[1];
  return m ? n[m.toLowerCase()] : 1;
}

const normal = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/**
 * Descobre se o item é uma arma e qual: "Besta Leve +1" é a Besta Leve com
 * +1; "Espada Flamejante (Espada Longa)" é a Espada Longa com efeito
 * especial. `armas` vem do equipamento do site (nome, dano e se é corpo a
 * corpo).
 */
export function armaDoItem(nome: string, armas: { nome: string; detalhe: string; corpoACorpo?: boolean }[]): ArmaDoItem | undefined {
  const n = normal(nome);
  const base = armas
    .filter((a) => n.includes(normal(a.nome.split(" (")[0])))
    .sort((a, b) => b.nome.length - a.nome.length)[0];
  if (!base) return undefined;
  const dano = base.detalhe.match(/(\d+d\d+|\d+)\s+(\p{L}+)/u);
  if (!dano) return undefined;
  const magico = Number(nome.match(/\+(\d)/)?.[1] ?? 0);
  const nomeBase = base.nome.split(" (")[0];
  return {
    base: nomeBase,
    dados: /d/.test(dano[1]) ? dano[1] : "",
    tipo: dano[2].toLowerCase(),
    distancia: !base.corpoACorpo,
    magico,
    especial: !magico && normal(nome) !== normal(nomeBase) ? true : undefined,
  };
}

/**
 * Os ataques da criatura com as armas do loot na mão: uma besta no loot de
 * um esqueleto toma o lugar do arco curto (o ataque à distância), com os
 * dados e o tipo da besta, o mesmo modificador e o +N da arma mágica.
 * Uma arma que não tem par entra como ataque novo, se a criatura usa armas.
 */
export function ataquesComLoot(ataques: Ataque[], itens: ItemDoLoot[] | undefined, equipamento: string[]): Ataque[] {
  const usaArmas = equipamento.length > 0;
  const deArma = (a: Ataque) => equipamento.some((e) => normal(e) === normal(a.nome));
  const lista = [...ataques];
  const trocados = new Set<number>();
  for (const item of itens ?? []) {
    const w = item.arma;
    if (!w || item.destruido || !usaArmas) continue;
    let i = lista.findIndex((a, k) => !trocados.has(k) && deArma(a) && a.distancia === w.distancia);
    const modelo = i >= 0 ? lista[i] : lista.find((a) => deArma(a));
    if (!modelo) continue;
    const novo: Ataque = {
      ...modelo,
      nome: item.nome,
      distancia: w.distancia,
      dados: w.dados,
      tipo: w.tipo,
      bonus: modelo.bonus + w.magico,
      mod: modelo.mod + w.magico,
      extra: undefined,
      extraDados: undefined,
      extraTipo: undefined,
      condicao: undefined,
      magico: w.magico || undefined,
      especial: w.especial ? `${item.nome} tem efeito próprio: confira o item.` : undefined,
      origem: i >= 0 ? `no lugar de ${modelo.nome}` : "arma do loot",
    };
    if (i >= 0) lista[i] = novo;
    else {
      lista.push(novo);
      i = lista.length - 1;
    }
    trocados.add(i);
  }
  return lista;
}

/** Rola "2d6" e devolve o total e cada dado (para mostrar "3 + 5"). */
export function rolarDadosDetalhado(dados: string, critico = false): { total: number; faces: number[] } {
  const m = dados.match(/(\d+)d(\d+)/);
  if (!m) return { total: 0, faces: [] };
  const quantos = Number(m[1]) * (critico ? 2 : 1);
  const faces = Array.from({ length: quantos }, () => 1 + Math.floor(Math.random() * Number(m[2])));
  return { total: faces.reduce((a, b) => a + b, 0), faces };
}

/** "1d6 + 3", "2d6 − 1", "4", "1d8 + 3 + 2d6 veneno" */
export function formulaDoDano(a: Pick<Ataque, "dados" | "mod" | "extraDados" | "extraTipo" | "tipo">): string {
  const base = !a.dados ? String(a.mod) : !a.mod ? a.dados : `${a.dados} ${a.mod > 0 ? "+" : "−"} ${Math.abs(a.mod)}`;
  return a.extraDados ? `${base} ${a.tipo} + ${a.extraDados} ${a.extraTipo}` : base;
}

export const comSinal = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
