import Image from "next/image";
import Link from "next/link";
import { rostosDoElenco } from "@/lib/contos";

/**
 * Peças pequenas que as páginas dos Contos dividem entre si.
 */

/** O caminho de volta, do episódio até a estante. */
export function Trilha({
  passos,
}: {
  passos: { nome: string; href?: string }[];
}) {
  return (
    <nav aria-label="Caminho">
      <ol className="text-pergaminho-300/80 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs">
        {passos.map((passo, i) => (
          <li key={passo.nome} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="text-dourado-600">
                ›
              </span>
            ) : null}
            {passo.href ? (
              <Link
                href={passo.href}
                className="hover:text-pergaminho-100 underline-offset-4 transition-colors hover:underline"
              >
                {passo.nome}
              </Link>
            ) : (
              <span aria-current="page" className="text-pergaminho-100">
                {passo.nome}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
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
}: {
  slugs: string[];
  tamanho?: "normal" | "pequeno";
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
                className="object-cover object-top sepia-[0.12]"
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
