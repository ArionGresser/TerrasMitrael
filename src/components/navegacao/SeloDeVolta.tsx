"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Selo } from "@/components/ui/Selo";
import { lugarGuardado, pedirVolta } from "@/lib/rolagem";

/**
 * O caminho de volta: um selo de cera com a seta gravada e, ao lado, para
 * onde ele leva ("Voltar · Grimório").
 *
 * Fica dentro da superfície que a pessoa está lendo, para não parecer um
 * enfeite solto na mesa:
 *   - "papel": o primeiro item dentro da folha, no canto de cima, em tinta;
 *   - "capa": no canto de cima da arte da capa (ver Capa), em letra clara;
 *   - "livro": carimbado na beirada de cima do livro de couro das Crônicas,
 *     onde não há papel. Desce sobre o livro, então quem vem depois só
 *     precisa da margem de sempre (mt-5).
 *
 * E lembra de onde a pessoa saiu: se ela já esteve na tela de destino
 * nesta aba, volta com os mesmos filtros e na mesma altura da lista (ver
 * src/lib/rolagem.ts). Se chegou direto, por um link compartilhado, é um
 * link comum para o topo da tela. Clique com Ctrl ou do meio continua
 * abrindo em outra aba, como qualquer link.
 */
export function SeloDeVolta({
  href,
  rotulo,
  lugar = "papel",
  className = "",
}: {
  href: string;
  rotulo: string;
  lugar?: "papel" | "capa" | "livro";
  className?: string;
}) {
  const router = useRouter();

  function aoClicar(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const lugarDaVolta = lugarGuardado(href);
    if (!lugarDaVolta) return;
    e.preventDefault();
    pedirVolta(href, lugarDaVolta.y);
    router.push(href + lugarDaVolta.busca, { scroll: false });
  }

  const posicao = {
    papel: "relative mb-6 -mt-2 sm:-mt-4",
    capa: "absolute top-3 left-3 z-20 sm:top-4 sm:left-4",
    livro: "relative z-20 -mb-9 h-14 pl-1 sm:-ml-5 sm:pl-0",
  }[lugar];
  const claro = lugar !== "papel";
  const tamanho = lugar === "livro" ? "size-14" : "size-12";

  return (
    <nav aria-label="Caminho" className={`flex ${posicao} ${className}`}>
      <Link
        href={href}
        onClick={aoClicar}
        className="group focus-visible:outline-dourado-400 inline-flex items-start gap-2.5 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span
          className={`relative block ${tamanho} shrink-0 drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out motion-safe:group-hover:-rotate-[10deg] motion-safe:group-hover:scale-105 motion-safe:group-active:scale-95`}
        >
          <Selo emblema="voltar" id={`selo-volta-${lugar}`} className="size-full" />
        </span>
        <span className="pt-0.5 leading-none">
          <span
            className={`font-titulo block text-[0.58rem] tracking-[0.28em] uppercase ${
              claro ? "text-dourado-400/90" : "text-dourado-600"
            }`}
          >
            Voltar
          </span>
          <span
            className={`font-titulo mt-1 block text-sm leading-tight transition-colors ${
              claro
                ? "text-pergaminho-100 group-hover:text-pergaminho-50 [text-shadow:0_1px_2px_rgb(0_0_0/0.7)]"
                : "text-tinta-900 group-hover:text-heraldico-vermelho"
            }`}
          >
            {rotulo}
          </span>
        </span>
      </Link>
    </nav>
  );
}
