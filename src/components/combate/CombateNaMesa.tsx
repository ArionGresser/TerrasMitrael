"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { lerMesaDoCombate, ouvirCombate, type MesaDoCombate } from "@/lib/combate";
import { ancora } from "@/lib/regras-ancora";
import { tocar } from "@/lib/som";
import { useConta } from "@/components/conta/useConta";

const COR_DO_ESTADO: Record<string, string> = {
  Ileso: "text-[#3f7d3a]",
  Ferido: "text-[#a8701c]",
  "Muito ferido": "text-heraldico-vermelho",
  Caído: "text-tinta-500 line-through",
};

/**
 * Durante um combate, quem tem conta vê uma faixa no alto da tela: a
 * rodada e de quem é a vez. Tocando, abre a ordem de iniciativa com o
 * estado de cada um (as criaturas aparecem como Ilesa, Ferida, Muito
 * ferida ou Caída, sem os números). Na vez do personagem do jogador, a
 * faixa fica vermelha e toca um aviso.
 *
 * O Mestre conduz pelo painel, então a faixa não aparece para ele lá.
 */
export function CombateNaMesa() {
  const conta = useConta();
  const caminho = usePathname();
  const dentro = conta.fase === "dentro";
  const meu = dentro ? conta.perfil.personagem : null;
  const [mesa, setMesa] = useState<MesaDoCombate | null>(null);
  const [aberta, setAberta] = useState(false);
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

  if (!mesa || caminho.startsWith("/mestre/")) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-[55] flex justify-center px-20 sm:top-5">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => setAberta((v) => !v)}
          aria-expanded={aberta}
          aria-controls="ordem-do-combate"
          className={`font-titulo mx-auto flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm shadow-xl backdrop-blur-sm ${
            minhaVez
              ? "border-dourado-300 bg-heraldico-vermelho text-pergaminho-50 animate-pulse"
              : "border-dourado-400/70 bg-madeira-900/95 text-pergaminho-50"
          }`}
        >
          <span aria-hidden>⚔</span>
          <span className="truncate">
            Rodada {mesa.rodada}
            {minhaVez ? " · Sua vez!" : daVez ? ` · Vez de ${daVez.nome}` : " · Rolando iniciativa"}
          </span>
          <span aria-hidden className={`transition-transform ${aberta ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {aberta ? (
          <ol
            id="ordem-do-combate"
            className="textura-pergaminho borda-envelhecida pergaminho-borda-1 mt-2 max-h-[60dvh] space-y-1 overflow-y-auto px-3 py-3 shadow-2xl"
          >
            {mesa.ordem.map((l) => (
              <li
                key={l.id}
                aria-current={l.id === mesa.vez ? "step" : undefined}
                className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${l.id === mesa.vez ? "bg-heraldico-vermelho/10" : ""}`}
              >
                <span className="text-tinta-500 w-6 text-right tabular-nums">{l.iniciativa ?? "–"}</span>
                <span className="text-tinta-900 min-w-0 flex-1 font-semibold">
                  {l.id === mesa.vez ? <span className="text-heraldico-vermelho">▶ </span> : null}
                  {l.nome}
                  {l.condicoes.length ? (
                    <span className="text-tinta-500 block text-xs font-normal">
                      {l.condicoes.map((c, i) => (
                        <span key={c}>
                          {i ? ", " : ""}
                          <Link href={`/regras/glossario/#${ancora(`${c} [Condição]`)}`} className="underline">
                            {c}
                          </Link>
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
                <span className={`text-xs ${COR_DO_ESTADO[l.estado] ?? ""}`}>{l.estado}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}
