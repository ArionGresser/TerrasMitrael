import { conteudoDoBau } from "@/lib/bau";

// O que o Baú sorteia, num arquivo à parte: a arena do combate só baixa
// isto quando o Mestre abre o tesouro, e não junto com a página.
export const dynamic = "force-static";

export function GET() {
  return Response.json(conteudoDoBau());
}
