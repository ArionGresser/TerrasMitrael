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

/** Uma linha do histórico: a rodada, o texto completo e o que os jogadores leem. */
export type Registro = { rodada: number; texto: string; publico: string };

export type EstadoDoCombate = {
  /** Quantos combates já houve, contando este. */
  numero?: number;
  rodada: number;
  /** O id de quem está agindo, ou null antes de começar. */
  vez: string | null;
  lutadores: Lutador[];
  dificuldade?: string;
  historico?: Registro[];
};

/** O que os jogadores veem. */
export type MesaDoCombate = {
  numero?: number;
  rodada: number;
  vez: string | null;
  historico?: { rodada: number; texto: string }[];
  /** Ao terminar: o que aconteceu, para a lista dos combates passados. */
  resumo?: ResumoDoCombate;
  ordem: {
    id: string;
    tipo: Lutador["tipo"];
    slug: string;
    nome: string;
    iniciativa: number | null;
    estado: string;
    condicoes: string[];
    imagem?: string;
    /** Só dos personagens: os aliados veem os PV uns dos outros. */
    pv?: number;
    pvMaximo?: number;
    ca?: number;
  }[];
};

export type ResumoDoCombate = {
  data: string;
  rodadas: number;
  inimigos: string[];
  personagens: string[];
  xpPorCabeca: number;
  tesouro?: string;
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
    numero: estado.numero,
    rodada: estado.rodada,
    vez: estado.vez,
    historico: (estado.historico ?? []).slice(-60).map((r) => ({ rodada: r.rodada, texto: r.publico })),
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
        ...(l.tipo === "personagem" ? { pv, pvMaximo: max, ca: l.ca } : {}),
      };
    }),
  };
}

/** Acrescenta uma linha ao histórico (fica com as últimas 150). */
export function registrar(estado: EstadoDoCombate, texto: string, publico = texto): Registro[] {
  return [...(estado.historico ?? []), { rodada: estado.rodada, texto, publico }].slice(-150);
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

/** Termina, guardando o resumo na mesa (para a lista dos combates passados). */
export async function terminarCombate(id: number, mesa: MesaDoCombate): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("combates").update({ ativo: false, mesa }).eq("id", id);
  return erro(error);
}

/** Quantos combates já houve (o próximo leva este número + 1). Só o Mestre conta todos. */
export async function quantosCombates(): Promise<number> {
  const sb = await cliente();
  const { count } = await sb.from("combates").select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function combatesPassados(): Promise<{ id: number; mesa: MesaDoCombate; criado_em: string }[]> {
  const sb = await cliente();
  const { data } = await sb
    .from("combates")
    .select("id, mesa, criado_em")
    .eq("ativo", false)
    .order("id", { ascending: false })
    .limit(30);
  return (data as { id: number; mesa: MesaDoCombate; criado_em: string }[] | null) ?? [];
}

// ---------- A iniciativa que o jogador rola ----------

export async function rolarMinhaIniciativa(valor: number): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.rpc("rolar_minha_iniciativa", { p_valor: valor });
  return erro(error);
}

export async function iniciativasDosJogadores(combate: number): Promise<{ personagem: string; valor: number }[]> {
  const sb = await cliente();
  const { data } = await sb.from("combate_iniciativas").select("personagem, valor").eq("combate", combate);
  return (data as { personagem: string; valor: number }[] | null) ?? [];
}

/** O Mestre ouve as iniciativas que os jogadores rolam. */
export function ouvirIniciativas(aoChegar: (personagem: string, valor: number, combate: number) => void): () => void {
  let parar = () => {};
  let parado = false;
  void cliente().then((sb) => {
    if (parado) return;
    const canal = sb
      .channel(`iniciativas-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "combate_iniciativas" }, (m) => {
        const l = m.new as { personagem?: string; valor?: number; combate?: number };
        if (l?.personagem && typeof l.valor === "number" && l.combate) aoChegar(l.personagem, l.valor, l.combate);
      })
      .subscribe();
    parar = () => void sb.removeChannel(canal);
  });
  return () => {
    parado = true;
    parar();
  };
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
