"use client";

import { useId, useState } from "react";
import { buscarTag } from "@/lib/tags";
import { tocar } from "@/lib/som";
import { Costura, estiloDaFita } from "./Fita";

/**
 * As fitas que abrem.
 *
 * Cada uma é um pedaço de tecido com a ponta recortada em bico, na cor da
 * ordem que ela representa. Tocar numa fita abre a explicação logo abaixo,
 * e fecha a que estiver aberta: duas explicações ao mesmo tempo só cansam
 * a vista.
 *
 * Serve na ficha do personagem e no glossário, com o mesmo texto nos dois
 * lugares. No cartaz do mural quem entra é a versão muda, de Fita.tsx.
 */
export function Fitas({
  chaves,
  alinhamento = "centro",
}: {
  chaves: string[];
  alinhamento?: "centro" | "esquerda";
}) {
  const [aberta, setAberta] = useState<string | null>(null);
  const id = useId();

  if (chaves.length === 0) return null;

  const tagAberta = aberta ? buscarTag(aberta) : null;

  return (
    <div>
      <ul
        className={`flex flex-wrap gap-2 ${
          alinhamento === "centro" ? "justify-center" : "justify-start"
        }`}
      >
        {chaves.map((chave) => {
          const tag = buscarTag(chave);
          const escolhida = aberta === chave;

          return (
            <li key={chave}>
              <button
                type="button"
                onClick={() => {
                  setAberta(escolhida ? null : chave);
                  tocar("marcador");
                }}
                aria-expanded={escolhida}
                aria-controls={`${id}-painel`}
                className="fita font-titulo relative flex min-h-11 items-center gap-2 py-1.5 pr-6 pl-3.5 text-[0.7rem] font-bold tracking-[0.12em] uppercase transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
                style={estiloDaFita(tag)}
              >
                <Costura tag={tag} />
                {tag.nome}
                <span aria-hidden className="text-[0.6rem] opacity-70">
                  {escolhida ? "▴" : "▾"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div id={`${id}-painel`} aria-live="polite">
        {tagAberta ? (
          <div
            className="mt-3 border-l-[3px] py-1.5 pl-4 text-left"
            style={{ borderColor: tagAberta.cor.fita }}
          >
            <p className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.2em] uppercase">
              {tagAberta.resumo}
            </p>
            <p className="text-tinta-700 mt-1.5 text-sm leading-relaxed">
              {tagAberta.texto}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
