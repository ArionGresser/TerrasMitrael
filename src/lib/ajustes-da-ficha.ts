/**
 * Os ajustes da mesa por cima da ficha do site: o PV máximo, os valores de
 * atributo e as subidas de nível (coluna `ajustes` da ficha viva,
 * supabase/0008-ajustes-da-ficha.sql).
 *
 * As subidas somam por cima dos ajustes à mão: o PV máximo é "o do site (ou
 * o ajustado) + o que cada subida deu", e o mesmo com os atributos. Assim,
 * desfazer uma subida não apaga um ajuste, e vice-versa.
 *
 * Mudar um atributo arrasta junto o que depende dele: o modificador, a
 * salvaguarda, as perícias, a iniciativa, a Percepção passiva e a
 * conjuração. A conta é pela diferença de modificador, para não perder
 * proficiência, especialização ou bônus de item que a ficha já soma.
 */

import { useSyncExternalStore } from "react";
import type { FichaAtual } from "@/lib/personagens";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import { proficienciaDo, type SubidaDeNivel } from "@/lib/subir-de-nivel";
import { XP_DO_NIVEL } from "@/lib/xp";
import { calcularCa, type EscolhaDeCa } from "@/lib/classe-de-armadura";
import { ancora } from "@/lib/regras-ancora";

export type AjustesDaFicha = {
  pv_maximo?: number;
  atributos?: Record<string, number>;
  /** As subidas de nível feitas na mesa, em ordem. */
  niveis?: SubidaDeNivel[];
  /** O Mestre liberou a subida até este nível (por marco, sem XP). */
  liberado?: number;
  /** A CA pelas regras: a armadura, o Escudo e o bônus (a conta sai dos atributos). */
  ca?: EscolhaDeCa;
};

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
  !!a && (a.pv_maximo !== undefined || Object.keys(a.atributos ?? {}).length > 0 || (a.niveis?.length ?? 0) > 0 || !!a.ca);

/** Os PV máximos que as subidas de nível deram. */
export const pvDasSubidas = (a: AjustesDaFicha | null | undefined) => (a?.niveis ?? []).reduce((t, s) => t + s.pv, 0);

/** Quanto as subidas (Aumento no Valor de Atributo, talentos) somaram num atributo. */
export const atributoDasSubidas = (a: AjustesDaFicha | null | undefined, nome: string) =>
  (a?.niveis ?? []).reduce((t, s) => t + (s.atributos?.[nome] ?? 0), 0);

/** O nível com as subidas da mesa. */
export const nivelComAjustes = (nivelDoSite: number, a: AjustesDaFicha | null | undefined) => a?.niveis?.at(-1)?.nivel ?? nivelDoSite;

/** O PV máximo com os ajustes e as subidas, a partir do PV máximo do site. */
export const pvMaximoComAjustes = (pvDoSite: number, a: AjustesDaFicha | null | undefined) =>
  (a?.pv_maximo ?? pvDoSite) + pvDasSubidas(a);

/** O valor do atributo com os ajustes e as subidas, ou undefined se não mudou. */
function valorAjustado(a: AjustesDaFicha, nome: string, doSite: number): number | undefined {
  const sobe = atributoDasSubidas(a, nome);
  const mao = a.atributos?.[nome];
  if (mao === undefined && !sobe) return undefined;
  return Math.min(30, (mao ?? doSite) + sobe);
}

/** Quanto o modificador de cada atributo mudou com os ajustes. */
function deltas(ficha: FichaAtual, a: AjustesDaFicha): Record<string, number> {
  const d: Record<string, number> = {};
  for (const at of ficha.atributos) {
    const novo = valorAjustado(a, at.nome, numero(at.valor));
    d[at.nome] = novo === undefined ? 0 : modificador(novo) - numero(at.modificador);
  }
  return d;
}

/** A ficha do site com os ajustes da mesa aplicados. */
export function ajustarFicha(ficha: FichaAtual, a: AjustesDaFicha | null | undefined): FichaAtual {
  if (!temAjustes(a)) return ficha;
  const d = deltas(ficha, a!);
  const conj = ficha.conjuracao;
  const nivelDoSite = Math.max(1, numero(ficha.nivel));
  const nivel = nivelComAjustes(nivelDoSite, a);
  const profDoSite = numero(ficha.combate.bonusProficiencia) || proficienciaDo(nivelDoSite);
  // O bônus de proficiência sobe nos níveis 5, 9, 13 e 17
  const dProf = proficienciaDo(nivel) - proficienciaDo(nivelDoSite);
  const dConj = (conj ? (d[conj.atributo] ?? 0) : 0) + (conj ? dProf : 0);
  const modDoSite = (nome: string) => numero(ficha.atributos.find((x) => x.nome === nome)?.modificador);
  const percepcao = ficha.pericias.find((p) => p.nome === "Percepção");
  return {
    ...ficha,
    nivel: String(nivel),
    combate: {
      ...ficha.combate,
      pv: String(pvMaximoComAjustes(numero(ficha.combate.pv), a)),
      ca: String(
        caComAjustes(
          numero(ficha.combate.ca),
          ficha.atributos.map((x) => ({ nome: x.nome, valor: numero(x.valor) })),
          ancora(ficha.classe),
          a
        )
      ),
      bonusProficiencia: comSinal(profDoSite + dProf),
      iniciativa: somar(ficha.combate.iniciativa, d.Destreza ?? 0),
      percepcaoPassiva: String(
        numero(ficha.combate.percepcaoPassiva) + (d.Sabedoria ?? 0) + (percepcao?.proficiente ? dProf : 0)
      ),
    },
    atributos: ficha.atributos.map((at) => {
      const novo = valorAjustado(a!, at.nome, numero(at.valor));
      const dSalva = (d[at.nome] ?? 0) + (at.proficiente ? dProf : 0);
      if (novo === undefined) return dSalva ? { ...at, salvaguarda: somar(at.salvaguarda, dSalva) } : at;
      return { ...at, valor: String(novo), modificador: comSinal(modificador(novo)), salvaguarda: somar(at.salvaguarda, dSalva) };
    }),
    pericias: ficha.pericias.map((p) => {
      const at = ATRIBUTO_DA_PERICIA[p.nome];
      // Especialização: o bônus da ficha tem a proficiência em dobro
      const especialista = at && numero(p.bonus) - modDoSite(at) === 2 * profDoSite;
      const delta = (at ? (d[at] ?? 0) : 0) + (p.proficiente ? dProf * (especialista ? 2 : 1) : 0);
      return delta ? { ...p, bonus: somar(p.bonus, delta) } : p;
    }),
    conjuracao:
      conj && dConj
        ? {
            ...conj,
            modificador: somar(conj.modificador, d[conj.atributo] ?? 0),
            cd: String(numero(conj.cd) + dConj),
            ataque: somar(conj.ataque, dConj),
          }
        : conj,
  };
}

/** Os máximos da ficha viva com os ajustes: nível, PV máximo, Dados de Vida e espaços de magia. */
export function ajustarBase(base: BaseDaFicha, a: AjustesDaFicha | null | undefined): BaseDaFicha {
  if (!temAjustes(a)) return base;
  const conDoSite = base.atributos.find((x) => x.nome === "Constituição")?.valor ?? 10;
  const con = valorAjustado(a!, "Constituição", conDoSite);
  const nivel = nivelComAjustes(base.nivel, a);
  const magia = base.espacosPorNivel[nivel - 1];
  return {
    ...base,
    nivel,
    dadosDeVida: nivel,
    proximoNivel: XP_DO_NIVEL[nivel] ?? null,
    pvMaximo: pvMaximoComAjustes(base.pvMaximo, a),
    modConstituicao: con === undefined ? base.modConstituicao : modificador(con),
    espacos: nivel !== base.nivel && magia ? magia.espacos : base.espacos,
    pacto: nivel !== base.nivel && magia ? magia.pacto : base.pacto,
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

/** A CD e o ataque de magia com os ajustes: o atributo mudado e a proficiência do nível novo. */
export function conjuracaoComAjustes(
  c: { atributo: string; valor: number; mod: number; cd: number; ataque: number },
  nivelDoSite: number,
  a: AjustesDaFicha | null | undefined
): { mod: number; cd: number; ataque: number } {
  const valor = (a?.atributos?.[c.atributo] ?? c.valor) + atributoDasSubidas(a, c.atributo);
  const dMod = modificador(Math.min(30, valor)) - modificador(c.valor);
  const dProf = proficienciaDo(nivelComAjustes(nivelDoSite, a)) - proficienciaDo(nivelDoSite);
  return { mod: c.mod + dMod, cd: c.cd + dMod + dProf, ataque: c.ataque + dMod + dProf };
}

/** Os valores de atributo com os ajustes e as subidas: {"Destreza": 16, ...}. */
export function atributosComAjustes(doSite: { nome: string; valor: number }[], a: AjustesDaFicha | null | undefined): Record<string, number> {
  return Object.fromEntries(doSite.map((x) => [x.nome, a ? (valorAjustado(a, x.nome, x.valor) ?? x.valor) : x.valor]));
}

/** A CA com a escolha pelas regras, se houver; sem ela, a CA da ficha do site. */
export function caComAjustes(
  caDoSite: number,
  atributosDoSite: { nome: string; valor: number }[],
  classe: string | null,
  a: AjustesDaFicha | null | undefined
): number {
  if (!a?.ca) return caDoSite;
  return calcularCa(a.ca, atributosComAjustes(atributosDoSite, a), classe).ca;
}
