"use client";

import { useEffect, useState } from "react";
import { CONQUISTAS, EVENTO, conquistadas, progresso, visivel } from "@/lib/conquistas";
import { COR_DO_NIVEL, NOME_DO_NIVEL, nomeDoPremio } from "./premios";
import { IconeConquista } from "./IconeConquista";

type Estado = { feitas: Record<string, string>; contas: Record<string, number> };

function ler(): Estado {
  return {
    feitas: conquistadas(),
    contas: Object.fromEntries(CONQUISTAS.filter((c) => c.alvo).map((c) => [c.chave, progresso(c.chave)])),
  };
}

const data = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * A lista das conquistas, lida do navegador depois de abrir a página (no
 * build ela sai toda trancada, e se acende em seguida). Fica ouvindo: um
 * feito conquistado com a página aberta já aparece aceso.
 */
export function PainelDeConquistas() {
  const [estado, setEstado] = useState<Estado | null>(null);

  useEffect(() => {
    const atualizar = () => setEstado(ler());
    atualizar();
    window.addEventListener(EVENTO, atualizar);
    window.addEventListener("storage", atualizar);
    return () => {
      window.removeEventListener(EVENTO, atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  const feitas = estado?.feitas ?? {};
  const quantas = CONQUISTAS.filter((c) => feitas[c.chave]).length;
  // Os degraus seguintes só aparecem depois do anterior. As feitas vêm
  // primeiro, da mais nova para a mais antiga; depois as que faltam
  const escondidas = CONQUISTAS.filter((c) => !visivel(c, feitas)).length;
  const ordem = CONQUISTAS.filter((c) => visivel(c, feitas)).sort((a, b) => {
    const fa = feitas[a.chave];
    const fb = feitas[b.chave];
    if (fa && fb) return fb.localeCompare(fa);
    return fa ? -1 : fb ? 1 : 0;
  });

  return (
    <div>
      <div className="mx-auto max-w-md text-center">
        <p className="font-titulo text-pergaminho-100 text-sm tracking-[0.18em] uppercase">
          {quantas} de {CONQUISTAS.length} conquistadas
        </p>
        <div
          role="progressbar"
          aria-label="Conquistas feitas"
          aria-valuemin={0}
          aria-valuemax={CONQUISTAS.length}
          aria-valuenow={quantas}
          className="border-dourado-600/60 bg-madeira-900/70 mt-3 h-2.5 overflow-hidden rounded-full border"
        >
          <div
            className="from-dourado-600 to-dourado-300 h-full bg-gradient-to-r transition-[width] duration-700"
            style={{ width: `${(quantas / CONQUISTAS.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {ordem.map((c) => {
          const quando = feitas[c.chave];
          const conta = estado?.contas[c.chave] ?? 0;
          const metal = COR_DO_NIVEL[c.nivel];
          return (
            <li
              key={c.chave}
              className={`flex gap-3 rounded-lg border p-3 transition-colors ${
                quando
                  ? "border-dourado-400/70 bg-madeira-900/80 shadow-[0_0_18px_rgba(214,173,72,0.18)]"
                  : "border-madeira-600/50 bg-madeira-900/50"
              }`}
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full border ${
                  quando
                    ? `${metal.borda} ${metal.fundo} ${metal.texto}`
                    : "border-madeira-500/50 text-pergaminho-300/40"
                }`}
              >
                <IconeConquista icone={c.icone} className="size-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-titulo text-base leading-tight ${quando ? "text-pergaminho-50" : "text-pergaminho-200/70"}`}>
                  {c.nome}
                  <span className="sr-only">{quando ? " (conquistada)" : " (ainda não)"}</span>
                </p>
                <p className={`mt-0.5 text-sm leading-snug ${quando ? "text-pergaminho-200" : "text-pergaminho-300/60"}`}>
                  {c.descricao}
                </p>
                <p className={`font-titulo mt-1 text-[0.6rem] tracking-[0.2em] uppercase ${quando ? metal.texto : "text-pergaminho-300/50"}`}>
                  {NOME_DO_NIVEL[c.nivel]}
                  {c.premio ? (
                    <span className="tracking-normal normal-case">
                      {" · "}
                      {quando ? "liberou" : "libera"}: {nomeDoPremio(c.premio)}
                    </span>
                  ) : null}
                </p>
                {quando ? (
                  <p className="text-dourado-400 mt-1 text-xs">Conquistada em {data(quando)}</p>
                ) : c.alvo ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="bg-madeira-800 h-1.5 flex-1 overflow-hidden rounded-full">
                      <div className="bg-dourado-600/80 h-full" style={{ width: `${Math.min(100, (conta / c.alvo) * 100)}%` }} />
                    </div>
                    <span className="text-pergaminho-300/70 text-xs tabular-nums">
                      {Math.min(conta, c.alvo)}/{c.alvo}
                    </span>
                  </div>
                ) : null}
                {c.mesa && !quando ? (
                  <p className="text-pergaminho-300/50 mt-1.5 text-[0.7rem] italic">Na mesa do computador</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {escondidas ? (
        <p className="text-pergaminho-300/60 mt-6 text-center text-sm italic">
          E mais {escondidas} {escondidas === 1 ? "degrau escondido, que aparece" : "degraus escondidos, que aparecem"} quando você
          conquistar o anterior.
        </p>
      ) : null}
    </div>
  );
}
