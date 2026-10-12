import { MONSTROS } from "@/lib/monstros";

// As fichas inteiras das criaturas (traços, ações, atributos), num arquivo à
// parte: a arena só baixa quando o Mestre abre a ficha de um inimigo.
export const dynamic = "force-static";

export function GET() {
  return Response.json(
    Object.fromEntries(
      MONSTROS.map((m) => [
        m.slug,
        { linha: m.linha, ca: m.ca, pv: m.pv, deslocamento: m.deslocamento, atributos: m.atributos, campos: m.campos, nd: m.nd, xp: m.xp, secoes: m.secoes },
      ])
    )
  );
}
