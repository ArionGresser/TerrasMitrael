import Image from "next/image";
import Link from "next/link";
import { quando, EM_BREVE, type Novidade } from "@/lib/novidades";
import type { Icone } from "@/lib/conquistas";
import { IconeConquista } from "@/components/conquistas/IconeConquista";
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
              <Miniatura imagem={item.imagem} icone={item.icone} posicao={item.posicao} />
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

/**
 * O quadradinho do começo da linha: a arte, quando a novidade tem uma, ou
 * o desenho dela gravado em dourado na madeira, quando ainda não tem.
 */
function Miniatura({ imagem, icone, posicao, apagada = false }: { imagem?: string; icone?: Icone; posicao?: string; apagada?: boolean }) {
  return (
    <span
      className={`relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-sm border sm:size-20 ${
        apagada ? "border-dourado-600/40 bg-madeira-900/60 border-dashed" : "border-dourado-600/40 bg-madeira-800/70"
      }`}
    >
      {imagem ? (
        <Image
          src={imagem}
          alt=""
          fill
          sizes="80px"
          className="object-cover sepia-[0.12]"
          style={{ objectPosition: posicao ?? "center" }}
        />
      ) : icone ? (
        <IconeConquista icone={icone} className={`size-8 sm:size-9 ${apagada ? "text-dourado-500/70" : "text-dourado-400"}`} />
      ) : null}
    </span>
  );
}

/**
 * O que ainda está a caminho, no topo do mural: as mesmas linhas, mas sem
 * link, sem data e com a moldura tracejada, de coisa que ainda não chegou.
 */
export function ListaEmBreve() {
  return (
    <ul className="border-dourado-600/30 bg-madeira-950/40 divide-dourado-600/15 divide-y rounded-sm border border-dashed">
      {EM_BREVE.map((item) => (
        <li key={item.titulo} className="flex items-center gap-4 p-3 sm:p-4">
          <Miniatura icone={item.icone} apagada />
          <span className="min-w-0 flex-1">
            <span className="font-titulo text-dourado-400/80 text-[0.6rem] tracking-[0.22em] uppercase">Em breve</span>
            <span className="font-titulo text-pergaminho-100 mt-0.5 block text-base leading-snug font-semibold sm:text-lg">
              {item.titulo}
            </span>
            <span className="text-pergaminho-200/75 mt-1 block text-xs leading-relaxed sm:text-sm">{item.texto}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
