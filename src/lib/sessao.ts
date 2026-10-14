import { cliente } from "@/lib/conta";
import type { MesaDoCombate } from "@/lib/combate";

/**
 * Quem o Mestre marcou como presente na Sessão de hoje. Fica neste
 * navegador; o gerador de encontros já começa com essa lista.
 */
export const CHAVE_DOS_PRESENTES = "mitrael:sessao:presentes";

export function presentesGuardados(): string[] | null {
  try {
    const v = localStorage.getItem(CHAVE_DOS_PRESENTES);
    return v ? (JSON.parse(v) as string[]) : null;
  } catch {
    return null;
  }
}

// ---------- As sessões guardadas (supabase/0011-sessoes.sql), só do Mestre ----------

export type Sessao = { id: number; dia: string; titulo: string; presentes: string[]; notas: string; criada_em: string; mudada_em: string };

/** "2026-10-14", no fuso de quem está jogando. */
export function diaDeHoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function lerSessoes(): Promise<Sessao[]> {
  const sb = await cliente();
  const { data } = await sb.from("sessoes").select("*").order("dia", { ascending: false }).limit(200);
  return (data as Sessao[] | null) ?? [];
}

/** Grava (ou cria) a sessão do dia com os campos que mudaram. */
export async function salvarSessao(dia: string, campos: Partial<Pick<Sessao, "titulo" | "presentes" | "notas">>): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb
    .from("sessoes")
    .upsert({ dia, ...campos, mudada_em: new Date().toISOString() }, { onConflict: "dia" });
  return error ? error.message : null;
}

export type CombateDoDia = { id: number; ativo: boolean; mesa: MesaDoCombate; criado_em: string };

/** Os combates que começaram num dia (pela hora local de quem joga). */
export async function combatesDoDia(dia: string): Promise<CombateDoDia[]> {
  const sb = await cliente();
  const inicio = new Date(`${dia}T00:00:00`);
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
  const { data } = await sb
    .from("combates")
    .select("id, ativo, mesa, criado_em")
    .gte("criado_em", inicio.toISOString())
    .lt("criado_em", fim.toISOString())
    .order("id");
  return (data as CombateDoDia[] | null) ?? [];
}
