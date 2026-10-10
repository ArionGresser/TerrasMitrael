"use client";

import { useEffect, useState } from "react";
import { CURSORES, aplicarCursor, cursorSalvo } from "@/lib/cursor";
import { EVENTO, liberado, quemLibera } from "@/lib/conquistas";
import { tocar } from "@/lib/som";
import { Vitrine } from "@/components/escolhas/Vitrine";

/** Muda a cada conquista, para as vitrines conferirem de novo o que está liberado. */
export function useConquistas() {
  const [vez, setVez] = useState(0);
  useEffect(() => {
    const mudou = () => setVez((v) => v + 1);
    window.addEventListener(EVENTO, mudou);
    window.addEventListener("storage", mudou);
    return () => {
      window.removeEventListener(EVENTO, mudou);
      window.removeEventListener("storage", mudou);
    };
  }, []);
  return vez;
}

const ICONE_DO_SISTEMA = (
  <svg viewBox="0 0 24 24" className="text-pergaminho-200 size-6" fill="currentColor" aria-hidden>
    <path d="M5 2.5v17l4.6-4.4 2.9 6.4 2.8-1.3-2.9-6.2H19L5 2.5Z" />
  </svg>
);

/**
 * O botão da mãozinha, ao lado do controle de som.
 *
 * A luva de couro é a do site e vem com todo mundo, assim como o cursor
 * normal do sistema. As outras mãos se liberam com as conquistas
 * (src/lib/conquistas.ts): até lá aparecem trancadas, dizendo o que fazer.
 * Uma mão guardada que ainda não foi liberada volta para a de couro.
 */
export function TrocaCursor() {
  const [atual, setAtual] = useState<string | null>(null);
  const vez = useConquistas();

  useEffect(() => {
    const salvo = cursorSalvo();
    const valido = liberado("mao", salvo) ? salvo : "couro";
    aplicarCursor(valido, valido !== salvo);
    setAtual(valido);
  }, []);

  const itens = CURSORES.map((c) => {
    const livre = vez >= 0 && liberado("mao", c.chave);
    const quem = quemLibera("mao", c.chave);
    return {
      chave: c.chave,
      nome: c.nome,
      liberado: livre,
      comoLiberar: quem ? `conquiste "${quem.nome}" (${quem.descricao.replace(/\.$/, "")}).` : undefined,
      desenho:
        c.chave === "sistema" ? (
          ICONE_DO_SISTEMA
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/cursores/${c.chave}-mao.svg`} alt="" width={44} height={44} />
        ),
    };
  });

  const cursor = CURSORES.find((c) => c.chave === atual);

  return (
    <Vitrine
      titulo="A mão que clica"
      rotulo={`Escolher o cursor${cursor ? ` (agora: ${cursor.nome})` : ""}`}
      itens={itens}
      atual={atual}
      aoEscolher={(chave) => {
        aplicarCursor(chave);
        setAtual(chave);
        tocar("aba");
      }}
      icone={
        atual && atual !== "sistema" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/cursores/${atual}-mao.svg`} alt="" width={26} height={26} />
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M5 2.5v17l4.6-4.4 2.9 6.4 2.8-1.3-2.9-6.2H19L5 2.5Z" />
          </svg>
        )
      }
    />
  );
}
