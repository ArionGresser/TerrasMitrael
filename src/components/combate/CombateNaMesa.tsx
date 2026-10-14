"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { lerMesaDoCombate, ouvirCombate, type MesaDoCombate } from "@/lib/combate";
import { tocar } from "@/lib/som";
import { useConta } from "@/components/conta/useConta";

/**
 * Durante um combate, quem tem conta vê uma faixa no alto da tela com a
 * rodada e de quem é a vez. Tocando nela, vai para a arena. Na vez do
 * personagem do jogador, a faixa fica vermelha e toca um aviso.
 *
 * Na própria arena a faixa some: lá já está tudo à vista.
 */
export function CombateNaMesa() {
  const conta = useConta();
  const caminho = usePathname();
  const dentro = conta.fase === "dentro";
  const meu = dentro ? conta.perfil.personagem : null;
  const [mesa, setMesa] = useState<MesaDoCombate | null>(null);
  const vezAnterior = useRef<string | null>(null);

  useEffect(() => {
    if (!dentro) return;
    const ler = () => void lerMesaDoCombate().then(setMesa);
    ler();
    const parar = ouvirCombate(ler);
    const aoVoltar = () => {
      if (document.visibilityState === "visible") ler();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      parar();
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [dentro]);

  const daVez = mesa?.ordem.find((l) => l.id === mesa.vez);
  const minhaVez = Boolean(meu && daVez?.tipo === "personagem" && daVez.slug === meu);

  useEffect(() => {
    if (minhaVez && vezAnterior.current !== mesa?.vez) tocar("trinco");
    vezAnterior.current = mesa?.vez ?? null;
  }, [minhaVez, mesa?.vez]);

  if (!mesa || caminho.startsWith("/combate")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[55] flex justify-center px-20 sm:top-5">
      <Link
        href="/combate/"
        className={`font-titulo pointer-events-auto flex min-h-11 max-w-md items-center gap-2 rounded-full border px-4 text-sm shadow-xl backdrop-blur-sm ${
          minhaVez
            ? "border-dourado-300 bg-heraldico-vermelho text-pergaminho-50 animate-pulse"
            : "border-dourado-400/70 bg-madeira-900/95 text-pergaminho-50"
        }`}
      >
        <span aria-hidden>⚔</span>
        <span className="truncate">
          {mesa.numero ? `Combate nº ${mesa.numero} · ` : ""}
          {mesa.rodada === 0 ? "Role a iniciativa!" : `Rodada ${mesa.rodada}`}
          {mesa.rodada === 0 ? "" : minhaVez ? " · Sua vez!" : daVez ? ` · Vez de ${daVez.nome}` : " · Rolando iniciativa"}
        </span>
        <span aria-hidden>›</span>
      </Link>
    </div>
  );
}
