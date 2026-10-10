"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Selo } from "@/components/ui/Selo";
import { lugarGuardado, pedirVolta } from "@/lib/rolagem";

/**
 * O caminho de volta, carimbado no canto do papel: um selo de cera com a
 * seta gravada e, ao lado, para onde ele leva ("Voltar · Grimório").
 *
 * Vem logo antes da folha (ou da capa, ou do livro) e desce sobre o canto
 * dela, como um lacre. Quem vem depois só precisa da margem de sempre
 * (mt-5): a sobreposição já está contada aqui.
 *
 * E lembra de onde a pessoa saiu: se ela já esteve na tela de destino
 * nesta aba, volta com os mesmos filtros e na mesma altura da lista (ver
 * src/lib/rolagem.ts). Se chegou direto, por um link compartilhado, é um
 * link comum para o topo da tela. Clique com Ctrl ou do meio continua
 * abrindo em outra aba, como qualquer link.
 */
export function SeloDeVolta({ href, rotulo }: { href: string; rotulo: string }) {
  const router = useRouter();

  function aoClicar(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const lugar = lugarGuardado(href);
    if (!lugar) return;
    e.preventDefault();
    pedirVolta(href, lugar.y);
    router.push(href + lugar.busca, { scroll: false });
  }

  return (
    <nav aria-label="Caminho" className="relative z-20 -mb-9 flex h-14 pl-1 sm:-ml-5 sm:pl-0">
      <Link
        href={href}
        onClick={aoClicar}
        className="group focus-visible:outline-dourado-400 inline-flex items-start gap-2.5 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span className="relative block size-14 shrink-0 drop-shadow-[0_3px_5px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out motion-safe:group-hover:-rotate-[10deg] motion-safe:group-hover:scale-105 motion-safe:group-active:scale-95">
          <Selo emblema="voltar" id="selo-volta" className="size-full" />
        </span>
        <span className="pt-0.5 leading-none">
          <span className="font-titulo text-dourado-400/90 block text-[0.58rem] tracking-[0.28em] uppercase">Voltar</span>
          <span className="font-titulo text-pergaminho-100 group-hover:text-pergaminho-50 mt-1 block text-sm leading-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.7)] transition-colors">
            {rotulo}
          </span>
        </span>
      </Link>
    </nav>
  );
}
