import { criaturasDeCombate } from "@/lib/monstros";

// As criaturas com o que o combate precisa, num arquivo à parte: a arena só
// baixa a lista quando o Mestre vai acrescentar alguém.
export const dynamic = "force-static";

export function GET() {
  return Response.json(criaturasDeCombate());
}
