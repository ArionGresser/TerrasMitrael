import Image from "next/image";
import Link from "next/link";
import { rostosDoElenco } from "@/lib/contos";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";

/**
 * Peças pequenas que as páginas dos Contos dividem entre si.
 */

/**
 * O caminho de volta: o selo carimbado no canto do papel, que leva um
 * degrau acima (do episódio para a temporada, da temporada para a série).
 * Os degraus mais altos ficam no menu, a um toque do selo do topo.
 */
export function Trilha({
  passos,
}: {
  passos: { nome: string; href?: string }[];
}) {
  const acima = [...passos].reverse().find((p) => p.href);
  if (!acima?.href) return null;
  return <SeloDeVolta href={acima.href} rotulo={acima.nome} />;
}

/**
 * Os rostos de quem esteve na mesa naquela temporada.
 *
 * Cada rosto leva à ficha do personagem: quem lê um episódio e quer saber
 * quem é aquele goblin está a um toque de descobrir.
 */
export function Elenco({
  slugs,
  tamanho = "normal",
  prioridade = false,
}: {
  slugs: string[];
  tamanho?: "normal" | "pequeno";
  /** Para quando os rostos estão no alto da página e não podem demorar. */
  prioridade?: boolean;
}) {
  const rostos = rostosDoElenco(slugs);
  const lado = tamanho === "pequeno" ? "size-9" : "size-14";

  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-3">
      {rostos.map((rosto) => (
        <li key={rosto.slug}>
          <Link
            href={`/personagens/${rosto.slug}/`}
            className="group flex w-16 flex-col items-center gap-1 text-center"
            title={rosto.nome}
          >
            <span
              className={`border-dourado-600/50 relative ${lado} overflow-hidden rounded-full border-2 shadow transition-transform motion-safe:group-hover:-translate-y-0.5`}
            >
              <Image
                src={rosto.imagem}
                alt=""
                fill
                sizes="56px"
                priority={prioridade}
                className="object-cover sepia-[0.12]"
                style={{
                  objectPosition: `${rosto.rosto.x * 100}% ${rosto.rosto.y * 100}%`,
                }}
              />
            </span>
            {tamanho === "normal" ? (
              <span className="text-tinta-700 text-[0.62rem] leading-tight group-hover:underline">
                {rosto.nome.split(" ")[0]}
              </span>
            ) : (
              <span className="sr-only">{rosto.nome}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
