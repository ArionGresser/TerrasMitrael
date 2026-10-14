import { MAGIAS } from "@/lib/magias";
import { HABILIDADES } from "@/lib/habilidades";
import { lerMagia } from "@/lib/magias-arena";

// As magias como a arena usa, num arquivo à parte: só baixa quando alguém
// abre as magias de um personagem no combate.
export const dynamic = "force-static";

export function GET() {
  const doGrimorio = MAGIAS.map((m) =>
    lerMagia({ slug: m.slug, nome: m.nome, nivel: m.nivel, tempo: m.tempo, alcance: m.alcance, concentracao: m.concentracao, texto: m.texto })
  );
  // As das fichas que não estão no SRD (Dobre a Finados, Braços de Hadar...)
  const proprias = Object.entries(HABILIDADES).flatMap(([slug, h]) =>
    (h.tipo === "truque" || h.tipo === "magia") && h.descricao && !MAGIAS.some((m) => m.slug === slug)
      ? [
          lerMagia({
            slug,
            nome: h.nome,
            nivel: h.circulo ?? (h.tipo === "truque" ? 0 : 1),
            tempo: h.tempo,
            alcance: h.alcance,
            concentracao: /concentra/i.test(h.duracao ?? ""),
            texto: h.descricao,
          }),
        ]
      : []
  );
  return Response.json([...doGrimorio, ...proprias]);
}
