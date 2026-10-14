"use client";

import { nivelComAjustes, useAjustes } from "@/lib/ajustes-da-ficha";

/**
 * A legenda da aba Ficha ("Goblin · Bruxo · Charlatão · Nível 1") com o
 * nível da mesa: quem subiu de nível na ficha viva vê o nível novo aqui
 * (o dono e o Mestre; para os outros, segue o da ficha do site).
 */
export function LegendaDaFicha({ slug, texto }: { slug: string; texto: string }) {
  const ajustes = useAjustes(slug);
  return <>{texto.replace(/Nível (\d+)/, (_, n: string) => `Nível ${nivelComAjustes(Number(n), ajustes)}`)}</>;
}
