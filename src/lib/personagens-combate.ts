import { PERSONAGENS_ATUAIS } from "@/lib/personagens";
import type { PersonagemDoCombate } from "@/components/combate/GeradorDeEncontros";

const numero = (texto: string | undefined) => Number.parseInt((texto ?? "").replace(/[^\d-]/g, ""), 10) || 0;

/** Os personagens de 2024 com o que o encontro e o combate precisam. */
export function personagensDoCombate(): PersonagemDoCombate[] {
  return PERSONAGENS_ATUAIS.filter((p) => p.meta.ficha).map(({ meta }) => ({
    slug: meta.slug,
    nome: meta.nome,
    nivel: Math.max(1, numero(meta.ficha!.nivel)),
    ca: numero(meta.ficha!.combate.ca),
    iniciativa: numero(meta.ficha!.combate.iniciativa),
    pvMaximo: numero(meta.ficha!.combate.pv),
  }));
}
