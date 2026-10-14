/**
 * As magias na arena: o texto de cada uma (Grimório do SRD, ou a habilidade
 * própria da ficha) vira o jeito de usá-la no combate. Um ataque mágico vai
 * para a rolagem de ataque; uma salvaguarda vai para o Mestre dizer quem
 * passou; cura e dano sem teste valem na hora.
 *
 * A leitura é pelo texto, que segue sempre os mesmos moldes ("sofre 8d6 de
 * dano de fogo", "salvaguarda de Destreza", "O dano aumenta em 1d6 para
 * cada círculo do espaço acima do 3º"). O que ela não entender cai em
 * "outra": a magia é conjurada, gasta o espaço e fica no histórico.
 *
 * Sem disco aqui: a lista pronta vem de /magias/arena.json.
 */

import { CONDICOES } from "@/lib/combate";
import type { AjustesDaFicha } from "@/lib/ajustes-da-ficha";

export type ModoDaMagia = "ataque" | "salvaguarda" | "direto" | "cura" | "outra";

export type MagiaNaArena = {
  slug: string;
  nome: string;
  /** O círculo (0: truque). */
  nivel: number;
  tempo: string;
  alcance: string;
  concentracao: boolean;
  modo: ModoDaMagia;
  salvaguarda?: string;
  /** Quem passa na salvaguarda sofre metade. */
  metade?: boolean;
  dados?: string;
  fixo?: number;
  tipo?: string;
  /** A cura soma o modificador do atributo de conjuração. */
  somaMod?: boolean;
  /** O que sobe por círculo acima do da magia. */
  porCirculo?: string;
  /** Truque que cresce nos níveis 5, 11 e 17: mais dados, ou mais feixes (um ataque por feixe). */
  truque?: "dados" | "feixes";
  /** Quantas vezes o efeito acontece (os dardos dos Mísseis Mágicos), e quantas a mais por círculo. */
  vezes?: { base: number; porCirculo: number };
  condicao?: string;
  /** A primeira frase, para lembrar o que a magia faz. */
  efeito: string;
};

const ATRIBUTOS = ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"];
const POR_EXTENSO: Record<string, number> = { um: 1, uma: 1, dois: 2, duas: 2, "três": 3, quatro: 4, cinco: 5 };

/** Lê o texto de uma magia e diz como ela funciona na arena. */
export function lerMagia(m: { slug: string; nome: string; nivel: number; tempo?: string; alcance?: string; concentracao?: boolean; texto: string }): MagiaNaArena {
  const t = m.texto.replace(/\s+/g, " ");
  const tempo = m.tempo ?? "Ação";
  const base: MagiaNaArena = {
    slug: m.slug,
    nome: m.nome,
    nivel: m.nivel,
    tempo,
    alcance: m.alcance ?? "",
    concentracao: !!m.concentracao,
    modo: "outra",
    efeito: (t.match(/^[^.]+\./)?.[0] ?? t).slice(0, 200),
  };

  const cura = t.match(/recupera\w* (?:uma quantidade de )?Pontos de Vida iguais a (\d+d\d+)( mais o modificador do seu atributo de conjuração)?/);
  const dano = t.match(/(\d+d\d+)(?: \+ (\d+))? de dano (?:de )?(\p{L}+)( extra)?/u);
  const salva = t.match(/salvaguarda de (Força|Destreza|Constituição|Inteligência|Sabedoria|Carisma)/i);
  const ataque = /ataque mágico|jogada de ataque de magia|ataque de magia/i.test(t);
  const sobe = t.match(/(?:dano|cura) aumenta em (\d+d\d+) para cada círculo do espaço acima/);
  // A condição que o texto cita primeiro (o Sono deixa Incapacitado antes de Inconsciente)
  const condicao = CONDICOES.map((c) => ({ c, i: t.search(new RegExp(`condição ${c}\\b`)) }))
    .filter((x) => x.i >= 0)
    .sort((a, b) => a.i - b.i)[0]?.c;
  const dardos = t.match(/(?:cria|arremessa) (\p{L}+) (?:dardos|raios)/u);

  if (m.nivel === 0 && /Aprimoramento de Truque/.test(t)) base.truque = /feixes/.test(t) ? "feixes" : /aumenta/.test(t) ? "dados" : undefined;
  if (sobe) base.porCirculo = sobe[1];
  if (condicao) base.condicao = condicao;
  if (dardos) base.vezes = { base: POR_EXTENSO[dardos[1]] ?? 1, porCirculo: /(?:mais um (?:dardo|raio)|um (?:dardo|raio) adicional) para cada círculo/.test(t) ? 1 : 0 };

  if (cura) return { ...base, modo: "cura", dados: cura[1], somaMod: !!cura[2] };
  if (dano) {
    Object.assign(base, { dados: dano[1], fixo: dano[2] ? Number(dano[2]) : undefined, tipo: dano[3].toLowerCase() });
    // "de dano necrótico extra": efeito que se soma aos acertos (Bruxaria), a não ser que venha logo depois de acertar (Destruição Divina)
    if (dano[4] && !/depois de acertar/.test(tempo)) return { ...base, modo: "outra" };
  }
  if (ataque && dano) return { ...base, modo: "ataque" };
  if (salva) {
    const at = ATRIBUTOS.find((a) => a.toLowerCase() === salva[1].toLowerCase())!;
    return { ...base, modo: "salvaguarda", salvaguarda: at, metade: /metade/.test(t) };
  }
  if (dano) return { ...base, modo: "direto" };
  return base;
}

// ---------- Dados ----------

/** Soma "2d6" e "1d6" em "3d6"; com dados diferentes, junta: "2d8 + 1d6". */
function somarDados(a: string | undefined, b: string | undefined, vezesB = 1): string | undefined {
  if (!b || vezesB <= 0) return a;
  const [qb, fb] = b.split("d").map(Number);
  if (!a) return `${qb * vezesB}d${fb}`;
  const [qa, fa] = a.split("d").map(Number);
  return fa === fb ? `${qa + qb * vezesB}d${fa}` : `${a} + ${qb * vezesB}d${fb}`;
}

/** Os níveis 5, 11 e 17 aumentam os truques. */
export const patamarDoTruque = (nivel: number) => 1 + (nivel >= 5 ? 1 : 0) + (nivel >= 11 ? 1 : 0) + (nivel >= 17 ? 1 : 0);

/** Os dados da magia no nível do personagem e no círculo do espaço gasto. */
export function dadosDaMagia(m: MagiaNaArena, nivelDoPersonagem: number, circulo: number): { dados?: string; feixes: number; vezes: number } {
  let dados = m.dados;
  let feixes = 1;
  if (m.nivel === 0 && m.truque === "dados" && dados) {
    const [q, f] = dados.split("d").map(Number);
    dados = `${q * patamarDoTruque(nivelDoPersonagem)}d${f}`;
  }
  if (m.nivel === 0 && m.truque === "feixes") feixes = patamarDoTruque(nivelDoPersonagem);
  const acima = m.nivel > 0 ? Math.max(0, circulo - m.nivel) : 0;
  if (m.porCirculo) dados = somarDados(dados, m.porCirculo, acima);
  const vezes = m.vezes ? m.vezes.base + m.vezes.porCirculo * acima : 1;
  return { dados, feixes, vezes };
}

/** Rola "3d6", "2d8 + 1d6" ou "1d4 + 1". */
export function rolarFormula(formula: string): { total: number; faces: number[] } {
  let total = 0;
  const faces: number[] = [];
  for (const termo of formula.split("+").map((s) => s.trim())) {
    const d = termo.match(/^(\d+)d(\d+)$/);
    if (d) {
      for (let i = 0; i < Number(d[1]); i++) {
        const f = 1 + Math.floor(Math.random() * Number(d[2]));
        faces.push(f);
        total += f;
      }
    } else total += Number(termo) || 0;
  }
  return { total, faces };
}

// ---------- As magias de um personagem ----------

/**
 * As magias que o personagem tem: as da ficha do site e as ganhas ao subir
 * de nível na mesa, com as trocas feitas.
 */
export function magiasDoPersonagem(conhecidas: string[], ajustes: AjustesDaFicha | null | undefined, todas: MagiaNaArena[]): MagiaNaArena[] {
  const slugs = new Set(conhecidas);
  for (const s of ajustes?.niveis ?? []) {
    for (const e of s.escolhas) if (e.tipo === "truque" || e.tipo === "magia") slugs.add(e.slug);
    for (const t of s.trocas ?? []) {
      if (t.tipo === "invocacao") continue;
      slugs.delete(t.de);
      if (t.slug) slugs.add(t.slug);
    }
  }
  return todas.filter((m) => slugs.has(m.slug)).sort((a, b) => a.nivel - b.nivel || a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Os truques que somam o Carisma no dano (invocação Explosão Agonizante), pelo nome. */
export function truquesAgonizantes(ajustes: AjustesDaFicha | null | undefined): string[] {
  return (ajustes?.niveis ?? []).flatMap((s) => s.escolhas.flatMap((e) => (e.tipo === "invocacao" && e.nome === "Explosão Agonizante" && e.truque ? [e.truque] : [])));
}
