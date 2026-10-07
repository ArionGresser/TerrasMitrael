import Image from "next/image";
import Link from "next/link";
import { quando, type Novidade } from "@/lib/novidades";
import { Revelar } from "@/components/ui/Revelar";

/**
 * As linhas do mural de novidades: miniatura, etiqueta, título, resumo e,
 * pequenininha no canto, a data e a hora em que aquilo entrou no site.
 * A página inicial e a página de todas as novidades usam a mesma lista.
 */
export function ListaDeNovidades({ itens }: { itens: Novidade[] }) {
  return (
    <ul className="border-dourado-600/30 bg-madeira-950/60 divide-dourado-600/15 divide-y rounded-sm border shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]">
      {itens.map((item, i) => (
        <li key={item.chave}>
          <Revelar atraso={Math.min(i, 5) * 0.06}>
            <Link
              href={item.href}
              className="group hover:bg-madeira-800/50 flex items-center gap-4 p-3 transition-colors sm:p-4"
            >
              <span className="border-dourado-600/40 relative size-16 shrink-0 overflow-hidden rounded-sm border sm:size-20">
                <Image
                  src={item.imagem}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover sepia-[0.12]"
                  style={{ objectPosition: item.posicao ?? "center" }}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-titulo text-dourado-400 text-[0.6rem] tracking-[0.22em] uppercase">
                    {item.etiqueta}
                  </span>
                  <time
                    dateTime={item.data}
                    className="text-pergaminho-300/70 text-[0.62rem] tabular-nums"
                  >
                    {quando(item.data)}
                  </time>
                </span>
                <span className="font-titulo text-pergaminho-50 mt-0.5 block text-base leading-snug font-semibold group-hover:underline sm:text-lg">
                  {item.titulo}
                </span>
                <span className="text-pergaminho-200/85 mt-1 line-clamp-2 block text-xs leading-relaxed sm:text-sm">
                  {item.texto}
                </span>
              </span>
              <span
                aria-hidden
                className="text-dourado-400 shrink-0 pl-1 transition-transform motion-safe:group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </Revelar>
        </li>
      ))}
    </ul>
  );
}
