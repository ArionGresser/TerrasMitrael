import { TODAS_AS_CLASSES } from "@/lib/classes";
import { dadosDeNivel } from "@/lib/dados-de-nivel";

// Um arquivo por classe, que o "Subir de nível" baixa só quando é aberto
export const dynamic = "force-static";

export function generateStaticParams() {
  return TODAS_AS_CLASSES.filter((c) => dadosDeNivel(c.slug)).map((c) => ({ slug: c.slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dados = dadosDeNivel(slug);
  return dados ? Response.json(dados) : new Response("Classe sem tradução", { status: 404 });
}
