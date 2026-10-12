/**
 * O caderno de anotações de cada conta (ver supabase/0007-anotacoes.sql).
 * As particulares só o dono lê; as "da mesa" todos com conta leem.
 */

import { cliente } from "@/lib/conta";

export type Anotacao = {
  id: number;
  dono: string;
  autor: string;
  titulo: string;
  texto: string;
  da_mesa: boolean;
  criada_em: string;
  mudada_em: string;
};

export type RascunhoDeAnotacao = Pick<Anotacao, "titulo" | "texto" | "da_mesa">;

export async function lerAnotacoes(): Promise<Anotacao[]> {
  const sb = await cliente();
  const { data } = await sb.from("anotacoes").select("*").order("mudada_em", { ascending: false });
  return (data as Anotacao[] | null) ?? [];
}

const limpar = (r: RascunhoDeAnotacao): RascunhoDeAnotacao => ({
  titulo: r.titulo.trim().slice(0, 120),
  texto: r.texto.slice(0, 20000),
  da_mesa: r.da_mesa,
});

/** Cria a anotação e devolve ela já com id, ou a mensagem do erro. */
export async function criarAnotacao(r: RascunhoDeAnotacao): Promise<Anotacao | string> {
  const sb = await cliente();
  const { data, error } = await sb.from("anotacoes").insert(limpar(r)).select().single();
  return error ? error.message : (data as Anotacao);
}

export async function salvarAnotacao(id: number, r: RascunhoDeAnotacao): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("anotacoes").update(limpar(r)).eq("id", id);
  return error ? error.message : null;
}

export async function apagarAnotacao(id: number): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("anotacoes").delete().eq("id", id);
  return error ? error.message : null;
}

export function ouvirAnotacoes(aoMudar: () => void): () => void {
  let parar = () => {};
  let parado = false;
  void cliente().then((sb) => {
    if (parado) return;
    const canal = sb
      .channel(`anotacoes-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "anotacoes" }, () => aoMudar())
      .subscribe();
    parar = () => void sb.removeChannel(canal);
  });
  return () => {
    parado = true;
    parar();
  };
}
