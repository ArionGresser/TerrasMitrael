"use client";

import { useState } from "react";
import { d20, ordenar, rolarMinhaIniciativa, type Lutador } from "@/lib/combate";
import { comSinal } from "@/lib/ataques";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

/**
 * A rodada 0, para o Mestre: a iniciativa de cada um, rolada aqui ou
 * digitada do dado de verdade. Os jogadores rolam na tela deles e o número
 * chega sozinho. A rodada 1 só começa quando todos tiverem iniciativa.
 */
export function IniciativaDoMestre({
  lutadores,
  definir,
  comecar,
}: {
  lutadores: Lutador[];
  definir: (valores: Record<string, number | null>) => void;
  comecar: () => void;
}) {
  const faltam = lutadores.filter((l) => l.iniciativa === null);
  const rolar = (ls: Lutador[]) => definir(Object.fromEntries(ls.map((l) => [l.id, d20() + l.bonusIniciativa])));

  return (
    <section className="border-heraldico-vermelho/40 bg-pergaminho-50 rounded-sm border-2 p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-titulo text-tinta-900 text-lg font-bold">Rodada 0 · Iniciativa</h2>
        <p className="text-tinta-700 text-sm">{faltam.length ? `Faltam ${faltam.length}` : "Todos prontos!"}</p>
      </div>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {ordenar(lutadores).map((l) => (
          <li key={l.id} className="border-dourado-600/30 flex items-center gap-2 rounded-sm border p-1.5">
            <span className={`size-2.5 shrink-0 rounded-full ${l.tipo === "personagem" ? "bg-[#3f6d8f]" : "bg-heraldico-vermelho"}`} aria-hidden />
            <span className="text-tinta-900 min-w-0 flex-1 truncate text-sm font-semibold">
              {l.nome} <span className="text-tinta-500 font-normal">{comSinal(l.bonusIniciativa)}</span>
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={l.iniciativa ?? ""}
              onChange={(e) => definir({ [l.id]: e.target.value === "" ? null : Math.floor(Number(e.target.value)) })}
              aria-label={`Iniciativa de ${l.nome}`}
              placeholder={l.tipo === "personagem" ? "rolando…" : "–"}
              className={`${CAMPO} max-w-20 px-1 text-center font-bold`}
            />
            <button type="button" onClick={() => rolar([l])} aria-label={`Rolar a iniciativa de ${l.nome}`} className={`${BOTAO} size-11 shrink-0 px-0`}>
              ⚄
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => rolar(lutadores.filter((l) => l.tipo === "criatura" && l.iniciativa === null))} className={`${BOTAO} px-3`}>
          Rolar a dos inimigos
        </button>
        <button type="button" onClick={() => rolar(faltam)} disabled={!faltam.length} className={`${BOTAO} px-3`}>
          Rolar a de quem falta
        </button>
        <button type="button" disabled={faltam.length > 0} onClick={comecar} className={`${BOTAO_CHEIO} flex-1`}>
          Começar a rodada 1
        </button>
      </div>
      {faltam.length ? (
        <p className="text-tinta-500 mt-1 text-xs">
          Esperando: {faltam.map((l) => l.nome).join(", ")}. Os jogadores rolam na tela deles; se rolarem no dado de verdade, você digita aqui.
        </p>
      ) : null}
    </section>
  );
}

/** A rodada 0, para o jogador: rolar aqui ou digitar o que saiu no dado. */
export function IniciativaDoJogador({ bonus, minha }: { bonus: number; minha: number | null | undefined }) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);
  const [manual, setManual] = useState("");

  async function mandar(total: number, texto: string) {
    setIndo(true);
    const erro = await rolarMinhaIniciativa(total);
    setIndo(false);
    setAviso(erro ?? texto);
    if (!erro) setManual("");
  }

  if (minha === undefined) return null;
  return (
    <section className="border-heraldico-vermelho/40 bg-pergaminho-50 rounded-sm border-2 p-3 text-center sm:p-4">
      <h2 className="font-titulo text-tinta-900 text-lg font-bold">Rodada 0 · Iniciativa</h2>
      {minha !== null ? (
        <p className="text-tinta-700 mt-1">
          A sua: <strong className="text-tinta-900 text-2xl">{minha}</strong>. Esperando os outros.
        </p>
      ) : (
        <>
          <button
            type="button"
            disabled={indo}
            onClick={() => {
              const dado = d20();
              void mandar(dado + bonus, `Você rolou ${dado} ${bonus >= 0 ? "+" : "−"} ${Math.abs(bonus)} = ${dado + bonus}.`);
            }}
            className={`${BOTAO_CHEIO} mt-2 w-full max-w-xs`}
          >
            Rolar iniciativa ({comSinal(bonus)})
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = Math.floor(Number(manual));
              if (manual !== "" && Number.isFinite(n)) void mandar(n, `Iniciativa ${n} anotada.`);
            }}
            className="mt-2 flex items-center justify-center gap-2"
          >
            <label htmlFor="iniciativa-manual" className="text-tinta-700 text-sm">
              Rolei no dado, deu (total):
            </label>
            <input
              id="iniciativa-manual"
              type="number"
              inputMode="numeric"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              className={`${CAMPO} max-w-20 text-center`}
            />
            <button type="submit" disabled={indo || manual === ""} className={`${BOTAO} px-3`}>
              Mandar
            </button>
          </form>
        </>
      )}
      {aviso ? (
        <p role="status" className="text-tinta-700 mt-2 text-sm">
          {aviso}
        </p>
      ) : null}
    </section>
  );
}
