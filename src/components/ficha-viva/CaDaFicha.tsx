"use client";

import { useId, useState } from "react";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import type { FichaViva } from "@/lib/ficha-viva";
import { atributosComAjustes, type AjustesDaFicha } from "@/lib/ajustes-da-ficha";
import { ARMADURAS, calcularCa, escolhaDaFicha, type EscolhaDeCa } from "@/lib/classe-de-armadura";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import type { AcoesDaFicha } from "./PainelDaFicha";

/**
 * A Classe de Armadura pelas regras: escolher a armadura, o Escudo e o
 * bônus mágico, e ver a conta. Ao usar, a CA passa a seguir a Destreza (e a
 * Constituição do Bárbaro) sozinha, inclusive na arena.
 */
export function CaDaFicha({
  ficha,
  base,
  fazer,
  acoes,
  ocupado,
}: {
  ficha: FichaViva;
  base: BaseDaFicha;
  fazer: (acao: () => Promise<string | null>, sucesso?: string) => Promise<boolean>;
  acoes: AcoesDaFicha;
  ocupado: boolean;
}) {
  const id = useId();
  const salva = ficha.ajustes?.ca;
  const [e, setE] = useState<EscolhaDeCa>(() => salva ?? escolhaDaFicha(base.equipamento, base.conhecidas));
  const atributos = atributosComAjustes(base.atributos, ficha.ajustes);
  const { ca, conta } = calcularCa(e, atributos, base.classe);
  const atual = salva ? calcularCa(salva, atributos, base.classe).ca : base.ca;

  async function usar() {
    const ajustes: AjustesDaFicha = { ...(ficha.ajustes ?? {}), ca: e };
    await fazer(() => acoes.mudar({ ajustes }), `CA ${ca}, pelas regras.`);
  }
  async function voltar() {
    const { ca: _ca, ...resto } = ficha.ajustes ?? {};
    await fazer(() => acoes.mudar({ ajustes: resto }), `Voltou à CA da ficha do site (${base.ca}).`);
  }

  return (
    <details className="border-dourado-600/30 mt-3 rounded-sm border">
      <summary className="font-titulo text-tinta-900 min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold">
        Classe de Armadura: {atual}
        {salva ? <span className="text-heraldico-vermelho ml-2 text-xs font-normal">pelas regras</span> : null}
      </summary>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-tinta-700 text-xs leading-relaxed">
          Escolha o que está vestindo. A conta segue a tabela de Armaduras das regras; o limite de Destreza das armaduras médias, a
          Defesa sem Armadura do Bárbaro e do Monge e a Armadura Arcana entram sozinhos. Na ficha do site: CA {base.ca}.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label htmlFor={`${id}-arm`} className="text-tinta-700 text-xs">
            Armadura
            <select
              id={`${id}-arm`}
              value={e.armadura ?? ""}
              onChange={(x) => setE({ ...e, armadura: x.target.value || null })}
              className={`${CAMPO} mt-1`}
            >
              <option value="">Sem armadura</option>
              {ARMADURAS.map((a) => (
                <option key={a.nome} value={a.nome}>
                  {a.nome} ({a.tipo})
                </option>
              ))}
            </select>
          </label>
          <label htmlFor={`${id}-bonus`} className="text-tinta-700 text-xs">
            Bônus mágico
            <input
              id={`${id}-bonus`}
              type="number"
              min={0}
              max={5}
              value={e.bonus}
              onChange={(x) => setE({ ...e, bonus: Math.max(0, Math.min(5, Number(x.target.value) || 0)) })}
              className={`${CAMPO} mt-1 max-w-24`}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-x-5">
          <label className="text-tinta-700 flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" checked={e.escudo} onChange={(x) => setE({ ...e, escudo: x.target.checked })} className="accent-heraldico-vermelho size-4" />
            Escudo (+2)
          </label>
          {!e.armadura ? (
            <label className="text-tinta-700 flex min-h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!e.armaduraArcana}
                onChange={(x) => setE({ ...e, armaduraArcana: x.target.checked })}
                className="accent-heraldico-vermelho size-4"
              />
              Armadura Arcana (13 + Destreza)
            </label>
          ) : null}
        </div>
        <p className="text-tinta-900 text-sm" aria-live="polite">
          {conta}
          {ca !== base.ca ? <span className="text-tinta-500"> (a ficha do site diz {base.ca})</span> : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={ocupado} onClick={() => void usar()} className={BOTAO_CHEIO}>
            Usar esta CA
          </button>
          {salva ? (
            <button type="button" disabled={ocupado} onClick={() => void voltar()} className={BOTAO}>
              Voltar à CA da ficha
            </button>
          ) : null}
        </div>
      </div>
    </details>
  );
}
