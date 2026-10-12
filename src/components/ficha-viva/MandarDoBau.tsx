"use client";

import { useEffect, useId, useState } from "react";
import { lerTodasAsFichas, mestre, type Moedas } from "@/lib/ficha-viva";
import type { Resultado } from "@/lib/bau-sorteio";
import { useConta } from "@/components/conta/useConta";
import { BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

/** As moedas do Baú (PC, PP, PE, PO, PL) no jeito da ficha. */
const MOEDA_DA_FICHA: Record<string, keyof Moedas> = { PC: "pc", PP: "pp", PE: "ce", PO: "po", PL: "pl" };

/**
 * Só para o Mestre, embaixo do que saiu do Baú: escolhe um personagem e
 * manda tudo (as moedas e os itens já decididos) direto para a ficha viva
 * dele. O jogador recebe o aviso na tela.
 */
export function MandarDoBau({ resultado, nomes }: { resultado: Resultado; nomes: Record<string, string> }) {
  const conta = useConta();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const [fichas, setFichas] = useState<string[]>([]);
  const [para, setPara] = useState("");
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!ehMestre) return;
    void lerTodasAsFichas().then((f) => {
      const slugs = f.map((x) => x.personagem);
      setFichas(slugs);
      setPara((p) => p || slugs[0] || "");
    });
  }, [ehMestre]);

  // Um novo baú aberto: o aviso do anterior some
  useEffect(() => setAviso(null), [resultado]);

  if (!ehMestre || !fichas.length) return null;

  const itens = resultado.vagas.flatMap((v) =>
    v.escolhido ? [v.escolhido.magia ? `${v.escolhido.nome}: ${v.escolhido.magia.nome}` : v.escolhido.nome] : []
  );
  const faltaDecidir = resultado.vagas.some((v) => !v.escolhido);
  const moedas: Moedas = {};
  for (const m of resultado.moedas) {
    const chave = MOEDA_DA_FICHA[m.chave];
    if (chave && m.quantidade > 0) moedas[chave] = (moedas[chave] ?? 0) + m.quantidade;
  }
  const nada = !itens.length && !Object.keys(moedas).length;

  async function mandar() {
    setEnviando(true);
    const erros: string[] = [];
    if (Object.keys(moedas).length) {
      const e = await mestre.moedas(para, moedas);
      if (e) erros.push(e);
    }
    for (const item of itens) {
      const e = await mestre.darItem(para, item.slice(0, 80), 1);
      if (e) erros.push(e);
    }
    setEnviando(false);
    setAviso(
      erros.length
        ? { erro: true, texto: erros.join(" ") }
        : { erro: false, texto: `Mandado para a ficha de ${nomes[para] ?? para}.` }
    );
  }

  return (
    <div className="border-heraldico-vermelho/30 mt-6 rounded-sm border-2 border-dashed p-3">
      <p className="font-titulo text-tinta-900 text-sm font-bold">Mandar para a ficha (Mestre)</p>
      {faltaDecidir ? (
        <p className="text-tinta-500 mt-1 text-xs">Os achados que ainda esperam o segundo dado não vão junto.</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label htmlFor={id} className="text-tinta-700 min-w-40 flex-1 text-xs">
          Para quem
          <select id={id} value={para} onChange={(e) => setPara(e.target.value)} className={`${CAMPO} mt-1`}>
            {fichas.map((s) => (
              <option key={s} value={s}>
                {nomes[s] ?? s}
              </option>
            ))}
          </select>
        </label>
        <button type="button" disabled={enviando || nada} onClick={() => void mandar()} className={BOTAO_CHEIO}>
          Mandar
        </button>
      </div>
      {aviso ? (
        <p role="status" className={`mt-2 text-sm ${aviso.erro ? "text-heraldico-vermelho" : "text-tinta-700"}`}>
          {aviso.texto}
        </p>
      ) : null}
    </div>
  );
}
