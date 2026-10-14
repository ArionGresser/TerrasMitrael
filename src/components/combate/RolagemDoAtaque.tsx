"use client";

import { useId, useState } from "react";
import { CONDICOES, d20 } from "@/lib/combate";
import { comSinal, formulaDoDano, rolarDadosDetalhado } from "@/lib/ataques";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

/** O ataque escolhido, de uma criatura (do Bestiário) ou de um personagem (da ficha). */
export type AtaqueEscolhido = {
  nome: string;
  bonus: number;
  dados: string;
  mod: number;
  tipo: string;
  condicao?: string;
  /** A condição vem marcada (o texto não pede teste de resistência). */
  condicaoCerta?: boolean;
  extra?: string;
  extraDados?: string;
  extraTipo?: string;
  especial?: string;
  origem?: string;
  magico?: number;
};

export type ResultadoDoAtaque = {
  total: number;
  natural?: number;
  /** Só quem sabe a CA decide aqui; sem isso, a tela do Mestre compara. */
  acertou?: boolean;
  critico: boolean;
  dano: number;
  tipo: string;
  condicao?: string;
};

/**
 * Rolar um ataque contra um alvo já escolhido: o d20 (rolado aqui ou no dado
 * de verdade, digitado), o acerto contra a CA (que só o Mestre vê, e pode
 * inverter), o dano com o bônus da arma mágica somado e a condição que o
 * golpe causa. Errou: vai direto para o histórico.
 */
export function RolagemDoAtaque({
  autor,
  alvo,
  ataque,
  enviar,
  cancelar,
  trocarAlvo,
}: {
  autor: string;
  alvo: { nome: string; ca?: number };
  ataque: AtaqueEscolhido;
  enviar: (r: ResultadoDoAtaque) => Promise<string | null>;
  cancelar: () => void;
  trocarAlvo: () => void;
}) {
  const id = useId();
  const [total, setTotal] = useState("");
  const [natural, setNatural] = useState<number | undefined>(undefined);
  const [forcado, setForcado] = useState<boolean | null>(null);
  const [dano, setDano] = useState("");
  const [faces, setFaces] = useState<number[] | null>(null);
  const [tipo, setTipo] = useState(ataque.extraTipo ? `${ataque.tipo} e ${ataque.extraTipo}` : ataque.tipo);
  const [condicao, setCondicao] = useState(ataque.condicaoCerta ? (ataque.condicao ?? "") : "");
  const [indo, setIndo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const t = Number.parseInt(total, 10);
  const temTotal = Number.isFinite(t);
  const critico = natural === 20;
  const sabeCa = alvo.ca !== undefined;
  const automatico = !temTotal ? null : natural === 20 ? true : natural === 1 ? false : sabeCa ? t >= alvo.ca! : null;
  const acertou = forcado ?? automatico;
  const mostraDano = acertou !== false;

  function rolarAtaque() {
    const n = d20();
    setNatural(n);
    setTotal(String(n + ataque.bonus));
    setForcado(null);
  }

  function rolarDano() {
    const r = rolarDadosDetalhado(ataque.dados, critico);
    const x = ataque.extraDados ? rolarDadosDetalhado(ataque.extraDados, critico) : { total: 0, faces: [] };
    setFaces([...r.faces, ...x.faces]);
    setDano(String(Math.max(ataque.dados ? 1 : 0, r.total + ataque.mod) + x.total));
  }
  const dobrar = (d: string) => (critico ? d.replace(/^(\d+)/, (n) => String(Number(n) * 2)) : d);

  async function confirmar() {
    if (!temTotal) return;
    setIndo(true);
    const e = await enviar({
      total: t,
      natural,
      acertou: acertou ?? undefined,
      critico,
      dano: mostraDano ? Math.max(0, Number.parseInt(dano, 10) || 0) : 0,
      tipo: tipo.trim(),
      condicao: mostraDano && condicao ? condicao : undefined,
    });
    setIndo(false);
    if (e) setErro(e);
  }

  return (
    <section
      aria-label={`${autor} ataca ${alvo.nome}`}
      className="border-heraldico-vermelho/60 bg-pergaminho-50 fixed inset-x-2 bottom-2 z-50 mx-auto max-h-[80dvh] max-w-xl overflow-y-auto rounded-md border-2 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] sm:bottom-4 sm:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-titulo text-tinta-900 text-base leading-tight font-bold">
          {autor} ataca <span className="text-heraldico-vermelho">{alvo.nome}</span>
          <span className="text-tinta-700 block text-sm font-normal">
            {ataque.nome} · {comSinal(ataque.bonus)} para acertar · {formulaDoDano(ataque)}
            {ataque.extraDados ? "" : ` ${ataque.tipo}`}
            {ataque.magico ? ` (já com o +${ataque.magico} da arma)` : ""}
          </span>
        </h3>
        <button type="button" onClick={trocarAlvo} className="text-tinta-700 min-h-9 shrink-0 text-xs underline">
          trocar alvo
        </button>
      </div>
      {ataque.origem ? <p className="text-tinta-500 text-xs italic">Arma do loot, {ataque.origem}.</p> : null}
      {ataque.especial ? <p className="text-heraldico-vermelho text-xs">{ataque.especial}</p> : null}

      {/* 1. A jogada de ataque */}
      <div className="mt-3">
        <p className="font-titulo text-tinta-500 text-[0.65rem] font-bold tracking-[0.18em] uppercase">Jogada de ataque</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button type="button" onClick={rolarAtaque} className={`${BOTAO_CHEIO} px-4`}>
            Rolar d20 {comSinal(ataque.bonus)}
          </button>
          <span className="text-tinta-500 text-xs">ou o total do dado de verdade:</span>
          <label htmlFor={`${id}-total`} className="sr-only">
            Total da jogada de ataque
          </label>
          <input
            id={`${id}-total`}
            type="number"
            inputMode="numeric"
            value={total}
            onChange={(e) => {
              setTotal(e.target.value);
              setNatural(undefined);
              setForcado(null);
            }}
            className={`${CAMPO} max-w-20 text-center text-lg font-bold`}
          />
        </div>
        {natural !== undefined ? (
          <p className="text-tinta-700 mt-1 text-sm">
            d20: <strong className={natural === 20 ? "text-dourado-600" : natural === 1 ? "text-heraldico-vermelho" : ""}>{natural}</strong>{" "}
            {comSinal(ataque.bonus)} = <strong>{total}</strong>
            {natural === 20 ? " · 20 natural: crítico!" : natural === 1 ? " · 1 natural: erro" : ""}
          </p>
        ) : temTotal ? (
          <div className="mt-1 flex flex-wrap gap-3 text-xs">
            <label className="text-tinta-700 flex min-h-9 items-center gap-1.5">
              <input type="checkbox" checked={natural === 20} onChange={(e) => setNatural(e.target.checked ? 20 : undefined)} className="accent-heraldico-vermelho size-4" />
              Foi 20 natural
            </label>
            <label className="text-tinta-700 flex min-h-9 items-center gap-1.5">
              <input type="checkbox" checked={natural === 1} onChange={(e) => setNatural(e.target.checked ? 1 : undefined)} className="accent-heraldico-vermelho size-4" />
              Foi 1 natural
            </label>
          </div>
        ) : null}

        {temTotal ? (
          sabeCa ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-tinta-700 text-sm">
                {total} contra CA {alvo.ca}:
              </span>
              <button
                type="button"
                aria-pressed={acertou === true}
                onClick={() => setForcado(acertou === true ? false : true)}
                className={`min-h-9 rounded-full border-2 px-3 text-sm font-bold ${
                  acertou ? "border-[#3f7d3a] bg-[#3f7d3a] text-white" : "border-heraldico-vermelho bg-heraldico-vermelho text-white"
                }`}
              >
                {acertou ? (critico ? "Acerto crítico ✓" : "Acertou ✓") : "Errou ✗"}
              </button>
              <span className="text-tinta-500 text-xs">{forcado !== null ? "(você mudou)" : "toque para inverter"}</span>
            </div>
          ) : (
            <p className="text-tinta-500 mt-2 text-xs">
              {critico ? "20 natural: acerta e é crítico." : natural === 1 ? "1 natural: erra." : "A CA fica com o Mestre: a mesa diz na hora se acertou."}
            </p>
          )
        ) : null}
      </div>

      {/* 2. O dano */}
      {temTotal && mostraDano ? (
        <div className="mt-3">
          <p className="font-titulo text-tinta-500 text-[0.65rem] font-bold tracking-[0.18em] uppercase">
            Dano {sabeCa ? "" : "(se acertar)"} {critico ? "· crítico: dados em dobro" : ""}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {ataque.dados ? (
              <button type="button" onClick={rolarDano} className={`${BOTAO} px-3`}>
                Rolar {dobrar(ataque.dados)}
                {ataque.mod ? ` ${ataque.mod > 0 ? "+" : "−"} ${Math.abs(ataque.mod)}` : ""}
                {ataque.extraDados ? ` + ${dobrar(ataque.extraDados)}` : ""}
              </button>
            ) : null}
            <label htmlFor={`${id}-dano`} className="sr-only">
              Dano
            </label>
            <input
              id={`${id}-dano`}
              type="number"
              inputMode="numeric"
              min={0}
              value={dano}
              placeholder="dano"
              onChange={(e) => setDano(e.target.value)}
              className={`${CAMPO} max-w-20 text-center text-lg font-bold`}
            />
            <label htmlFor={`${id}-tipo`} className="sr-only">
              Tipo de dano
            </label>
            <input id={`${id}-tipo`} value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="tipo" className={`${CAMPO} max-w-32`} />
          </div>
          {faces ? (
            <p className="text-tinta-700 mt-1 text-sm">
              {faces.join(" + ")}
              {ataque.mod ? ` ${ataque.mod > 0 ? "+" : "−"} ${Math.abs(ataque.mod)}` : ""} = <strong>{dano}</strong>
            </p>
          ) : null}
          {ataque.extra ? <p className="text-tinta-500 mt-1 text-xs">Atenção: {ataque.extra}.</p> : null}

          <label className="text-tinta-700 mt-2 block text-xs">
            Condição que o golpe causa
            <select value={condicao} onChange={(e) => setCondicao(e.target.value)} className={`${CAMPO} mt-1`}>
              <option value="">Nenhuma</option>
              {CONDICOES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {ataque.condicao && !ataque.condicaoCerta ? (
            <p className="text-tinta-500 mt-1 text-xs">
              O golpe pode deixar {ataque.condicao}, mas o texto pede um teste ou uma condição: marque se valer.
            </p>
          ) : null}
        </div>
      ) : null}

      {erro ? <p className="text-heraldico-vermelho mt-2 text-sm">{erro}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!temTotal || indo} onClick={() => void confirmar()} className={BOTAO_CHEIO}>
          {indo ? "Um instante…" : acertou === false ? "Registrar o erro" : sabeCa ? "Confirmar o golpe" : "Atacar"}
        </button>
        <button type="button" onClick={cancelar} className={`${BOTAO} px-3`}>
          Cancelar
        </button>
      </div>
    </section>
  );
}
