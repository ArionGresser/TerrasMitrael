/**
 * O combate na mesa: quem luta, a ordem de iniciativa, de quem é a vez.
 *
 * O Mestre guarda o estado inteiro (com os PV das criaturas) em
 * combates_do_mestre; a cada mudança, monta a versão da mesa, sem números,
 * que os jogadores veem na hora (ver supabase/0004-combate.sql).
 */

import { cliente } from "@/lib/conta";
import { estadoDosPv } from "@/lib/encontros";

export type Lutador = {
  id: string;
  tipo: "personagem" | "criatura";
  /** O slug do personagem ou da criatura no bestiário. */
  slug: string;
  nome: string;
  iniciativa: number | null;
  bonusIniciativa: number;
  ca: number;
  /** Só das criaturas: os personagens usam os PV da ficha viva. */
  pv: number;
  pvMaximo: number;
  xp: number;
  condicoes: string[];
  imagem?: string;
};

export type EstadoDoCombate = {
  rodada: number;
  /** O id de quem está agindo, ou null antes de começar. */
  vez: string | null;
  lutadores: Lutador[];
  dificuldade?: string;
};

/** O que os jogadores veem. */
export type MesaDoCombate = {
  rodada: number;
  vez: string | null;
  ordem: {
    id: string;
    tipo: Lutador["tipo"];
    slug: string;
    nome: string;
    iniciativa: number | null;
    estado: string;
    condicoes: string[];
    imagem?: string;
  }[];
};

export type CombateAtivo = { id: number; estado: EstadoDoCombate };

/** As condições do glossário, para marcar nos lutadores. */
export const CONDICOES = [
  "Agarrado",
  "Amedrontado",
  "Atordoado",
  "Caído",
  "Cego",
  "Contido",
  "Enfeitiçado",
  "Envenenado",
  "Exaustão",
  "Incapacitado",
  "Inconsciente",
  "Invisível",
  "Paralisado",
  "Petrificado",
  "Surdo",
];

/** A ordem de iniciativa: maior primeiro; empate, o bônus maior; quem não rolou fica no fim. */
export function ordenar(lutadores: Lutador[]): Lutador[] {
  return [...lutadores].sort((a, b) => {
    if (a.iniciativa === null && b.iniciativa === null) return 0;
    if (a.iniciativa === null) return 1;
    if (b.iniciativa === null) return -1;
    return b.iniciativa - a.iniciativa || b.bonusIniciativa - a.bonusIniciativa;
  });
}

/**
 * A versão da mesa. Os PV dos personagens vêm das fichas vivas (o Mestre
 * passa o mapa slug → [pv, máximo]).
 */
export function versaoDaMesa(estado: EstadoDoCombate, pvDosPersonagens: Record<string, [number, number]>): MesaDoCombate {
  return {
    rodada: estado.rodada,
    vez: estado.vez,
    ordem: ordenar(estado.lutadores).map((l) => {
      const [pv, max] = l.tipo === "personagem" ? (pvDosPersonagens[l.slug] ?? [1, 1]) : [l.pv, l.pvMaximo];
      return {
        id: l.id,
        tipo: l.tipo,
        slug: l.slug,
        nome: l.nome,
        iniciativa: l.iniciativa,
        estado: estadoDosPv(pv, max),
        condicoes: l.condicoes,
        imagem: l.imagem,
      };
    }),
  };
}

function erro(e: { message?: string } | null): string | null {
  return e ? e.message || "Algo deu errado." : null;
}

export async function combateAtivo(): Promise<CombateAtivo | null> {
  const sb = await cliente();
  const { data } = await sb.from("combates").select("id").eq("ativo", true).maybeSingle();
  if (!data) return null;
  const { data: segredo } = await sb.from("combates_do_mestre").select("dados").eq("combate", data.id).maybeSingle();
  return { id: data.id as number, estado: (segredo?.dados as EstadoDoCombate) ?? { rodada: 1, vez: null, lutadores: [] } };
}

export async function comecarCombate(estado: EstadoDoCombate, mesa: MesaDoCombate): Promise<string | null> {
  const sb = await cliente();
  const { data, error } = await sb.from("combates").insert({ mesa }).select("id").single();
  if (error) {
    return error.code === "23505" ? "Já existe um combate em andamento. Termine aquele antes de começar outro." : erro(error);
  }
  const { error: e2 } = await sb.from("combates_do_mestre").insert({ combate: data.id, dados: estado });
  return erro(e2);
}

export async function salvarCombate(id: number, estado: EstadoDoCombate, mesa: MesaDoCombate): Promise<string | null> {
  const sb = await cliente();
  const [a, b] = await Promise.all([
    sb.from("combates_do_mestre").update({ dados: estado }).eq("combate", id),
    sb.from("combates").update({ mesa, atualizado_em: new Date().toISOString() }).eq("id", id),
  ]);
  return erro(a.error) ?? erro(b.error);
}

export async function terminarCombate(id: number): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("combates").update({ ativo: false }).eq("id", id);
  return erro(error);
}

/** Para os jogadores: a mesa do combate ativo, ou null. */
export async function lerMesaDoCombate(): Promise<MesaDoCombate | null> {
  const sb = await cliente();
  const { data } = await sb.from("combates").select("mesa").eq("ativo", true).maybeSingle();
  return (data?.mesa as MesaDoCombate | undefined) ?? null;
}

/** Chama `aoMudar` a cada mudança no combate. Devolve a função que para. */
export function ouvirCombate(aoMudar: () => void): () => void {
  let parar = () => {};
  let parado = false;
  void cliente().then((sb) => {
    if (parado) return;
    const canal = sb
      .channel(`combate-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "combates" }, () => aoMudar())
      .subscribe();
    parar = () => void sb.removeChannel(canal);
  });
  return () => {
    parado = true;
    parar();
  };
}

/** Rola "2d8 + 4" (com espaços ou não). */
export function rolarDados(expressao: string): number {
  const m = expressao.replace(/\s/g, "").replace(/−/g, "-").match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return 0;
  let total = Number(m[3] ?? 0);
  for (let i = 0; i < Number(m[1]); i++) total += 1 + Math.floor(Math.random() * Number(m[2]));
  return Math.max(1, total);
}

export const d20 = () => 1 + Math.floor(Math.random() * 20);
