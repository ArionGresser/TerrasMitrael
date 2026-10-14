"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { lerEventos, type EventoGravado } from "@/lib/combate";
import { BOTAO, BOTAO_CHEIO } from "@/components/conta/MinhaConta";
import { Palco, type Cartao } from "./Palco";
import { Historico } from "./Historico";

const VELOCIDADES = [1, 2, 4];

/**
 * Assistir a um combate gravado, rodada por rodada: a arena como estava em
 * cada momento, os golpes animando e o histórico crescendo junto. Só
 * aparece o que os jogadores viam na hora (sem os PV das criaturas).
 *
 * O endereço é /combate/replay/?id=12, para as Crônicas poderem apontar
 * para a luta daquela sessão.
 */
export function ReplayDoCombate() {
  const parametros = useSearchParams();
  const id = Number(parametros.get("id"));
  const [eventos, setEventos] = useState<EventoGravado[] | null>(null);
  const [i, setI] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [velocidade, setVelocidade] = useState(1);

  useEffect(() => {
    if (!id) {
      setEventos([]);
      return;
    }
    void lerEventos(id)
      .then(setEventos)
      .catch(() => setEventos([]));
  }, [id]);

  const total = eventos?.length ?? 0;
  useEffect(() => {
    if (!tocando) return;
    if (i >= total - 1) {
      setTocando(false);
      return;
    }
    const t = setTimeout(() => setI((x) => Math.min(total - 1, x + 1)), 1700 / velocidade);
    return () => clearTimeout(t);
  }, [tocando, i, total, velocidade]);

  const atual = eventos?.[i];
  const cartoes: Cartao[] = useMemo(
    () => (atual?.ordem ?? []).map((l) => ({ ...l, slug: l.id, condicoes: l.condicoes ?? [] })),
    [atual]
  );
  const linhas = useMemo(() => (eventos ?? []).slice(0, i + 1).map((e) => ({ rodada: e.rodada, texto: e.texto })), [eventos, i]);

  if (eventos === null) return <p className="text-tinta-700 py-10 text-center italic">Desenrolando a gravação…</p>;
  if (!eventos.length || !atual)
    return (
      <div className="py-10 text-center">
        <p className="text-tinta-700">Este combate não tem gravação.</p>
        <p className="text-tinta-500 mt-1 text-sm">Os combates ficam gravados a partir da arena nova, em outubro de 2026.</p>
        <Link href="/combate/" className={`${BOTAO} mt-4`}>
          Ir para a arena
        </Link>
      </div>
    );

  const daVez = cartoes.find((c) => c.id === atual.vez);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-5">
      <div className="min-w-0">
        <div className="text-center">
          <p className="font-titulo text-tinta-500 text-xs tracking-[0.2em] uppercase">Combate gravado</p>
          <p className="font-titulo text-tinta-900 mt-1 text-3xl font-bold">{atual.rodada === 0 ? "Iniciativa" : `Rodada ${atual.rodada}`}</p>
          <p className="text-tinta-700 mt-1 text-sm">{daVez ? `Vez de ${daVez.nome}` : " "}</p>
        </div>

        <p aria-live="polite" className="border-dourado-600/40 bg-pergaminho-50 text-tinta-900 mt-3 rounded-sm border-2 px-3 py-2 text-center font-semibold">
          {atual.texto}
        </p>

        <div className="mt-3">
          <Palco cartoes={cartoes} inimigosEmCima meu={null} vez={atual.vez} escondido golpe={atual.golpe} animarSempre />
        </div>

        <div className="border-dourado-600/50 bg-pergaminho-50/95 sticky bottom-[4.5rem] z-10 mt-4 rounded-sm border-2 p-3 shadow-lg backdrop-blur-sm">
          <label htmlFor="replay-posicao" className="sr-only">
            Momento do combate
          </label>
          <input
            id="replay-posicao"
            type="range"
            min={0}
            max={total - 1}
            value={i}
            onChange={(e) => {
              setTocando(false);
              setI(Number(e.target.value));
            }}
            className="accent-heraldico-vermelho w-full"
          />
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => (setTocando(false), setI(0))} aria-label="Do começo" className={`${BOTAO} size-11 px-0`}>
              ⏮
            </button>
            <button type="button" onClick={() => (setTocando(false), setI((x) => Math.max(0, x - 1)))} aria-label="Momento anterior" className={`${BOTAO} size-11 px-0`}>
              ◀
            </button>
            <button
              type="button"
              onClick={() => {
                if (i >= total - 1) setI(0);
                setTocando((t) => !t);
              }}
              className={`${BOTAO_CHEIO} min-w-28`}
            >
              {tocando ? "⏸ Pausar" : i >= total - 1 ? "↺ De novo" : "▶ Assistir"}
            </button>
            <button type="button" onClick={() => (setTocando(false), setI((x) => Math.min(total - 1, x + 1)))} aria-label="Próximo momento" className={`${BOTAO} size-11 px-0`}>
              ▶
            </button>
            <button type="button" onClick={() => (setTocando(false), setI(total - 1))} aria-label="O fim" className={`${BOTAO} size-11 px-0`}>
              ⏭
            </button>
            <span className="flex gap-1" role="group" aria-label="Velocidade">
              {VELOCIDADES.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={velocidade === v}
                  onClick={() => setVelocidade(v)}
                  className={`min-h-11 rounded-sm border px-2 text-xs font-bold ${velocidade === v ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/40 text-tinta-700"}`}
                >
                  {v}×
                </button>
              ))}
            </span>
          </div>
          <p className="text-tinta-500 mt-1 text-center text-xs tabular-nums">
            Momento {i + 1} de {total}
          </p>
        </div>
      </div>

      <div className="mt-4 lg:mt-0">
        <Historico linhas={linhas} />
      </div>
    </div>
  );
}
