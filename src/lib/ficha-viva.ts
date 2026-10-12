/**
 * A ficha viva no banco: ler, mudar e pedir ao Mestre.
 *
 * As tabelas e as regras estão em supabase/0002-fichas.sql. O jogador muda
 * direto os PV, os espaços de magia e os Dados de Vida; tirar item e gastar
 * moeda passam por funções do banco, e pôr item ou moeda só pelo pedido.
 */

import { cliente } from "@/lib/conta";
import type { BaseDaFicha, ItemDaMochila, Moedas } from "@/lib/ficha-viva-base";

export type { ItemDaMochila, Moedas };

export type FichaViva = {
  personagem: string;
  pv: number;
  pv_temporarios: number;
  dados_de_vida_gastos: number;
  espacos_gastos: Record<string, number>;
  inspiracao: boolean;
  inventario: ItemDaMochila[];
  moedas: Moedas;
  atualizada_em: string;
};

/** O que o jogador muda direto, sem pedir. */
export type MudancaNaFicha = Partial<
  Pick<FichaViva, "pv" | "pv_temporarios" | "dados_de_vida_gastos" | "espacos_gastos" | "inspiracao">
>;

export type Pedido = {
  id: number;
  personagem: string;
  conta: string;
  tipo: "item" | "moedas";
  item: string | null;
  quantidade: number | null;
  moedas: Moedas | null;
  motivo: string | null;
  estado: "pendente" | "aprovado" | "recusado";
  resposta: string | null;
  criado_em: string;
  resolvido_em: string | null;
};

export const TIPOS_DE_MOEDA = [
  { chave: "pc", nome: "Peças de cobre" },
  { chave: "pp", nome: "Peças de prata" },
  { chave: "ce", nome: "Peças de electro" },
  { chave: "po", nome: "Peças de ouro" },
  { chave: "pl", nome: "Peças de platina" },
] as const;

/** "15 PP e 3 PO" */
export function moedasPorExtenso(m: Moedas | null | undefined): string {
  const partes = TIPOS_DE_MOEDA.filter((t) => (m?.[t.chave] ?? 0) > 0).map(
    (t) => `${m![t.chave]} ${t.chave.toUpperCase()}`
  );
  return partes.length ? partes.join(", ") : "nenhuma moeda";
}

function erroLegivel(erro: { message?: string } | null): string | null {
  if (!erro) return null;
  const texto = erro.message ?? "";
  if (texto.includes("Failed to fetch")) return "Não deu para falar com o servidor. Confira a internet.";
  // As mensagens das funções do banco já estão em português
  return texto || "Algo deu errado. Tente de novo.";
}

export async function lerFicha(personagem: string): Promise<FichaViva | null> {
  const sb = await cliente();
  const { data } = await sb.from("fichas").select("*").eq("personagem", personagem).maybeSingle();
  return (data as FichaViva | null) ?? null;
}

export async function mudarFicha(personagem: string, mudanca: MudancaNaFicha): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("fichas").update(mudanca).eq("personagem", personagem);
  return erroLegivel(error);
}

export async function tirarItem(personagem: string, item: string, quantidade: number): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.rpc("tirar_item", { p_personagem: personagem, p_item: item, p_quantidade: quantidade });
  return erroLegivel(error);
}

export async function gastarMoedas(personagem: string, moedas: Moedas): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.rpc("gastar_moedas", { p_personagem: personagem, p_moedas: moedas });
  return erroLegivel(error);
}

export async function criarFicha(personagem: string, base: BaseDaFicha): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.rpc("criar_ficha", {
    p_personagem: personagem,
    p_pv: base.inicial.pv,
    p_pv_temporarios: base.inicial.pvTemporarios,
    p_inventario: base.inicial.inventario,
    p_moedas: base.inicial.moedas,
  });
  return erroLegivel(error);
}

export async function listarPedidos(personagem?: string): Promise<Pedido[]> {
  const sb = await cliente();
  let consulta = sb.from("pedidos").select("*").order("criado_em", { ascending: false }).limit(50);
  if (personagem) consulta = consulta.eq("personagem", personagem);
  const { data } = await consulta;
  return (data as Pedido[] | null) ?? [];
}

export async function pedirItem(personagem: string, item: string, quantidade: number, motivo: string) {
  const nome = item.trim();
  if (!nome) return "Escreva o nome do item.";
  if (nome.length > 80) return "O nome do item pode ter no máximo 80 letras.";
  if (!(quantidade >= 1 && quantidade <= 999)) return "A quantidade vai de 1 a 999.";
  const sb = await cliente();
  const { error } = await sb
    .from("pedidos")
    .insert({ personagem, tipo: "item", item: nome, quantidade, motivo: motivo.trim().slice(0, 300) || null });
  return erroLegivel(error);
}

export async function pedirMoedas(personagem: string, moedas: Moedas, motivo: string) {
  const limpas = Object.fromEntries(Object.entries(moedas).filter(([, n]) => (n ?? 0) > 0));
  if (Object.keys(limpas).length === 0) return "Escreva quantas moedas você está pedindo.";
  const sb = await cliente();
  const { error } = await sb
    .from("pedidos")
    .insert({ personagem, tipo: "moedas", moedas: limpas, motivo: motivo.trim().slice(0, 300) || null });
  return erroLegivel(error);
}

export async function desistirDoPedido(id: number): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("pedidos").delete().eq("id", id);
  return erroLegivel(error);
}

export async function resolverPedido(id: number, aprovar: boolean, resposta: string): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.rpc("resolver_pedido", { p_id: id, p_aprovar: aprovar, p_resposta: resposta });
  return erroLegivel(error);
}

/** As fichas vivas que já existem (para o painel do Mestre). */
export async function fichasAbertas(): Promise<string[]> {
  const sb = await cliente();
  const { data } = await sb.from("fichas").select("personagem");
  return (data ?? []).map((l) => l.personagem as string);
}

// ---------- Dados ----------

/** Rola "2d4+2" e devolve cada dado e o total. */
export function rolar(expressao: string): { dados: number[]; bonus: number; total: number } {
  const m = expressao.replace(/\s/g, "").match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return { dados: [], bonus: 0, total: 0 };
  const quantos = Number(m[1]);
  const lados = Number(m[2]);
  const bonus = Number(m[3] ?? 0);
  const dados = Array.from({ length: quantos }, () => 1 + Math.floor(Math.random() * lados));
  return { dados, bonus, total: dados.reduce((a, b) => a + b, 0) + bonus };
}

/** As Poções de Cura do SRD e o que cada uma cura, pelo nome na mochila. */
export function curaDaPocao(nome: string): string | null {
  const n = nome.toLowerCase();
  if (!n.includes("poção de cura") && !n.includes("pocao de cura") && !n.includes("poções de cura")) return null;
  if (n.includes("suprema")) return "10d4+20";
  if (n.includes("superior")) return "8d4+8";
  if (n.includes("maior")) return "4d4+4";
  return "2d4+2";
}
