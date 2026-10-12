/**
 * Os ajustes da mesa por cima da ficha do site: o PV máximo e os valores de
 * atributo (coluna `ajustes` da ficha viva, supabase/0008-ajustes-da-ficha.sql).
 *
 * Mudar um atributo arrasta junto o que depende dele: o modificador, a
 * salvaguarda, as perícias, a iniciativa, a Percepção passiva e a
 * conjuração. A conta é pela diferença de modificador, para não perder
 * proficiência, especialização ou bônus de item que a ficha já soma.
 */

import { useSyncExternalStore } from "react";
import type { FichaAtual } from "@/lib/personagens";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";

export type AjustesDaFicha = { pv_maximo?: number; atributos?: Record<string, number> };

export const ATRIBUTOS = ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"] as const;

const ATRIBUTO_DA_PERICIA: Record<string, string> = {
  Atletismo: "Força",
  Acrobacia: "Destreza",
  Furtividade: "Destreza",
  Prestidigitação: "Destreza",
  Arcanismo: "Inteligência",
  História: "Inteligência",
  Investigação: "Inteligência",
  Natureza: "Inteligência",
  Religião: "Inteligência",
  "Adestrar Animais": "Sabedoria",
  Intuição: "Sabedoria",
  Medicina: "Sabedoria",
  Percepção: "Sabedoria",
  Sobrevivência: "Sabedoria",
  Atuação: "Carisma",
  Enganação: "Carisma",
  Intimidação: "Carisma",
  Persuasão: "Carisma",
};

const numero = (texto: string | undefined) => {
  const n = Number.parseInt((texto ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};
export const modificador = (valor: number) => Math.floor((valor - 10) / 2);
export const comSinal = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const somar = (texto: string, delta: number) => comSinal(numero(texto) + delta);

export const temAjustes = (a: AjustesDaFicha | null | undefined) =>
  !!a && (a.pv_maximo !== undefined || Object.keys(a.atributos ?? {}).length > 0);

/** Quanto o modificador de cada atributo mudou com os ajustes. */
function deltas(ficha: FichaAtual, a: AjustesDaFicha): Record<string, number> {
  const d: Record<string, number> = {};
  for (const at of ficha.atributos) {
    const novo = a.atributos?.[at.nome];
    d[at.nome] = novo === undefined ? 0 : modificador(novo) - numero(at.modificador);
  }
  return d;
}

/** A ficha do site com os ajustes da mesa aplicados. */
export function ajustarFicha(ficha: FichaAtual, a: AjustesDaFicha | null | undefined): FichaAtual {
  if (!temAjustes(a)) return ficha;
  const d = deltas(ficha, a!);
  const conj = ficha.conjuracao;
  const dConj = conj ? (d[conj.atributo] ?? 0) : 0;
  return {
    ...ficha,
    combate: {
      ...ficha.combate,
      pv: a!.pv_maximo !== undefined ? String(a!.pv_maximo) : ficha.combate.pv,
      iniciativa: somar(ficha.combate.iniciativa, d.Destreza ?? 0),
      percepcaoPassiva: String(numero(ficha.combate.percepcaoPassiva) + (d.Sabedoria ?? 0)),
    },
    atributos: ficha.atributos.map((at) => {
      const novo = a!.atributos?.[at.nome];
      if (novo === undefined) return at;
      return { ...at, valor: String(novo), modificador: comSinal(modificador(novo)), salvaguarda: somar(at.salvaguarda, d[at.nome]) };
    }),
    pericias: ficha.pericias.map((p) => {
      const at = ATRIBUTO_DA_PERICIA[p.nome];
      return at && d[at] ? { ...p, bonus: somar(p.bonus, d[at]) } : p;
    }),
    conjuracao:
      conj && dConj
        ? {
            ...conj,
            modificador: somar(conj.modificador, dConj),
            cd: String(numero(conj.cd) + dConj),
            ataque: somar(conj.ataque, dConj),
          }
        : conj,
  };
}

/** Os máximos da ficha viva com os ajustes: PV máximo e a Constituição dos Dados de Vida. */
export function ajustarBase(base: BaseDaFicha, a: AjustesDaFicha | null | undefined): BaseDaFicha {
  if (!temAjustes(a)) return base;
  const con = a!.atributos?.["Constituição"];
  return {
    ...base,
    pvMaximo: a!.pv_maximo ?? base.pvMaximo,
    modConstituicao: con === undefined ? base.modConstituicao : modificador(con),
  };
}

/*
 * A ficha viva lê os ajustes do banco e avisa aqui; os números da ficha do
 * site (que ficam em outro canto da página) escutam e se redesenham.
 */
const ajustes = new Map<string, AjustesDaFicha>();
const ouvintes = new Set<() => void>();

export function anunciarAjustes(slug: string, a: AjustesDaFicha | null | undefined) {
  const atual = ajustes.get(slug);
  if (JSON.stringify(atual ?? {}) === JSON.stringify(a ?? {})) return;
  if (a) ajustes.set(slug, a);
  else ajustes.delete(slug);
  for (const o of ouvintes) o();
}

export function useAjustes(slug: string): AjustesDaFicha | undefined {
  return useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => ouvintes.delete(o);
    },
    () => ajustes.get(slug),
    () => undefined
  );
}
