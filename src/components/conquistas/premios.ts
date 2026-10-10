import { CURSORES } from "@/lib/cursor";
import { DADOS } from "@/lib/dados";
import type { Nivel, Premio } from "@/lib/conquistas";

/** Como o prêmio aparece escrito: "Mão de goblin", "Dado Coração de magma". */
export function nomeDoPremio(p: Premio): string {
  if (p.tipo === "mao") return CURSORES.find((c) => c.chave === p.chave)?.nome ?? p.chave;
  return `Dado ${DADOS.find((d) => d.chave === p.chave)?.nome ?? p.chave}`;
}

export const NOME_DO_NIVEL: Record<Nivel, string> = { bronze: "Bronze", prata: "Prata", ouro: "Ouro" };

/** A cor do metal de cada nível, na medalha e no rótulo. */
export const COR_DO_NIVEL: Record<Nivel, { texto: string; borda: string; fundo: string }> = {
  bronze: { texto: "text-[#d99a62]", borda: "border-[#b8743d]/70", fundo: "bg-[#b8743d]/15" },
  prata: { texto: "text-[#d9dde3]", borda: "border-[#aeb4bd]/70", fundo: "bg-[#aeb4bd]/15" },
  ouro: { texto: "text-dourado-300", borda: "border-dourado-400/80", fundo: "bg-dourado-400/15" },
};
