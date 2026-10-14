"use client";

import { useEffect, useRef, useState } from "react";

type Linha = { rodada: number; texto: string };

/**
 * A ata do combate, sempre à vista: na lateral em tela larga e numa faixa
 * que abre embaixo da arena no celular. A linha mais nova fica embaixo e a
 * lista rola sozinha até ela.
 */
export function Historico({ linhas, titulo = "Histórico" }: { linhas: Linha[]; titulo?: string }) {
  const [aberto, setAberto] = useState(false);
  const fim = useRef<HTMLLIElement>(null);
  const caixa = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const c = caixa.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [linhas.length, aberto]);

  const ultimas = linhas.slice(-3);

  const lista = (
    <ol ref={caixa} aria-live="polite" className="max-h-[60dvh] space-y-1 overflow-y-auto pr-1 text-sm lg:max-h-[calc(100dvh-14rem)]">
      {linhas.length ? (
        linhas.map((r, i) => {
          const novaRodada = i === 0 || linhas[i - 1].rodada !== r.rodada;
          return (
            <li key={i} ref={i === linhas.length - 1 ? fim : undefined}>
              {novaRodada ? (
                <p className="font-titulo text-heraldico-vermelho mt-2 mb-0.5 text-[0.65rem] font-bold tracking-[0.2em] uppercase first:mt-0">
                  {r.rodada === 0 ? "Iniciativa" : `Rodada ${r.rodada}`}
                </p>
              ) : null}
              <p className={`leading-snug ${i === linhas.length - 1 ? "text-tinta-900 font-semibold" : "text-tinta-700"}`}>{r.texto}</p>
            </li>
          );
        })
      ) : (
        <li className="text-tinta-500 italic">Nada aconteceu ainda.</li>
      )}
    </ol>
  );

  return (
    <aside aria-label={titulo} className="border-dourado-600/40 bg-pergaminho-50/80 rounded-sm border-2 p-3 lg:sticky lg:top-24">
      <h2 className="font-titulo text-tinta-900 flex items-center justify-between text-sm font-bold">
        {titulo}
        <span className="text-tinta-500 text-xs font-normal">{linhas.length}</span>
      </h2>
      {/* Tela larga: a lista inteira */}
      <div className="mt-2 hidden lg:block">{lista}</div>
      {/* Celular: as últimas linhas, e a lista inteira num toque */}
      <div className="mt-2 lg:hidden">
        {aberto ? (
          lista
        ) : (
          <ul className="space-y-0.5 text-sm">
            {ultimas.map((r, i) => (
              <li key={i} className={i === ultimas.length - 1 ? "text-tinta-900 font-semibold" : "text-tinta-700"}>
                {r.texto}
              </li>
            ))}
            {!ultimas.length ? <li className="text-tinta-500 italic">Nada aconteceu ainda.</li> : null}
          </ul>
        )}
        {linhas.length > 3 ? (
          <button type="button" onClick={() => setAberto((a) => !a)} className="text-tinta-700 mt-1 min-h-9 text-xs underline">
            {aberto ? "Mostrar só as últimas" : "Ver o histórico inteiro"}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
