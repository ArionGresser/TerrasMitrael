/**
 * O mapa da mesa: as marcas que o Mestre põe sobre o mapa de Mitrael (ver
 * supabase/0006-mapa-da-mesa.sql). Todos com conta veem na hora.
 */

import { cliente } from "@/lib/conta";

export type TipoDeMarca = "grupo" | "objetivo" | "caminho" | "nota";
export type Marca = { id: number; tipo: TipoDeMarca; x: number; y: number; texto: string | null; criado_em: string };

export async function lerMarcas(): Promise<Marca[]> {
  const sb = await cliente();
  const { data } = await sb.from("marcas_do_mapa").select("*").order("id");
  return ((data as Marca[] | null) ?? []).map((m) => ({ ...m, x: Number(m.x), y: Number(m.y) }));
}

export async function marcar(tipo: TipoDeMarca, x: number, y: number, texto?: string): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb
    .from("marcas_do_mapa")
    .insert({ tipo, x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)), texto: texto?.trim().slice(0, 120) || null });
  return error ? error.message : null;
}

export async function apagarMarca(id: number): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("marcas_do_mapa").delete().eq("id", id);
  return error ? error.message : null;
}

export function ouvirMarcas(aoMudar: () => void): () => void {
  let parar = () => {};
  let parado = false;
  void cliente().then((sb) => {
    if (parado) return;
    const canal = sb
      .channel(`mapa-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "marcas_do_mapa" }, () => aoMudar())
      .subscribe();
    parar = () => void sb.removeChannel(canal);
  });
  return () => {
    parado = true;
    parar();
  };
}
