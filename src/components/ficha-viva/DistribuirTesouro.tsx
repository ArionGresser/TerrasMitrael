"use client";

import { useEffect, useMemo, useState } from "react";
import { lerTodasAsFichas, mestre, TIPOS_DE_MOEDA, type Moedas } from "@/lib/ficha-viva";
import { useConta } from "@/components/conta/useConta";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

type Tipo = (typeof TIPOS_DE_MOEDA)[number]["chave"];

/** Divide igual, sem perder moeda: quem vem primeiro leva a sobra, uma a uma. */
export function dividir(total: Moedas, quem: string[]): Record<string, Moedas> {
  const partes: Record<string, Moedas> = Object.fromEntries(quem.map((s) => [s, {}]));
  for (const { chave } of TIPOS_DE_MOEDA) {
    const t = total[chave] ?? 0;
    if (!t || !quem.length) continue;
    const cada = Math.floor(t / quem.length);
    const sobra = t % quem.length;
    quem.forEach((s, i) => {
      partes[s][chave] = cada + (i < sobra ? 1 : 0);
    });
  }
  return partes;
}

/**
 * O tesouro repartido entre os personagens: cada item vai para quem o Mestre
 * escolher, e as moedas se dividem igual (com a sobra para os primeiros) ou
 * do jeito que o Mestre quiser, pessoa por pessoa. Só o Mestre vê.
 */
export function DistribuirTesouro({
  moedas,
  itens,
  nomes,
  participantes,
  aoMandar,
}: {
  moedas: Moedas;
  itens: string[];
  nomes: Record<string, string>;
  /** Quem já começa marcado (os do combate). Sem isso, todos com ficha viva. */
  participantes?: string[];
  aoMandar?: () => void;
}) {
  const conta = useConta();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const [fichas, setFichas] = useState<string[]>([]);
  const [quem, setQuem] = useState<string[]>([]);
  const [partes, setPartes] = useState<Record<string, Moedas>>({});
  const [donos, setDonos] = useState<string[]>([]);
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mandado, setMandado] = useState(false);

  const tipos = TIPOS_DE_MOEDA.filter((t) => (moedas[t.chave] ?? 0) > 0);
  const chaveDoTesouro = useMemo(() => JSON.stringify([moedas, itens]), [moedas, itens]);

  // Pela lista em texto: quem chama pode montar o array a cada render
  const chaveDosParticipantes = participantes?.join(",") ?? "";
  useEffect(() => {
    if (!ehMestre) return;
    const marcados = chaveDosParticipantes ? chaveDosParticipantes.split(",") : null;
    void lerTodasAsFichas().then((f) => {
      const slugs = f.map((x) => x.personagem);
      setFichas(slugs);
      const inicio = marcados?.filter((p) => slugs.includes(p)) ?? slugs;
      setQuem(inicio.length ? inicio : slugs);
    });
  }, [ehMestre, chaveDosParticipantes]);

  // Tesouro novo ou gente nova: divide igual de novo e reparte os itens em roda
  useEffect(() => {
    setPartes(dividir(moedas, quem));
    setDonos(itens.map((_, i) => quem[i % Math.max(1, quem.length)] ?? ""));
    setAviso(null);
    setMandado(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveDoTesouro, quem]);

  if (!ehMestre || !fichas.length || (!tipos.length && !itens.length)) return null;

  const distribuido = (t: Tipo) => quem.reduce((s, q) => s + (partes[q]?.[t] ?? 0), 0);
  const confere = tipos.every((t) => distribuido(t.chave) === (moedas[t.chave] ?? 0));

  async function mandar() {
    setEnviando(true);
    const erros: string[] = [];
    for (const q of quem) {
      const m = Object.fromEntries(Object.entries(partes[q] ?? {}).filter(([, n]) => (n ?? 0) > 0)) as Moedas;
      if (Object.keys(m).length) {
        const e = await mestre.moedas(q, m);
        if (e) erros.push(`${nomes[q] ?? q}: ${e}`);
      }
    }
    for (let i = 0; i < itens.length; i++) {
      if (!donos[i]) continue;
      const e = await mestre.darItem(donos[i], itens[i].slice(0, 80), 1);
      if (e) erros.push(`${itens[i]}: ${e}`);
    }
    setEnviando(false);
    if (erros.length) setAviso({ erro: true, texto: erros.join(" ") });
    else {
      setAviso({ erro: false, texto: "Tesouro entregue. Cada jogador recebeu o aviso na tela." });
      setMandado(true);
      aoMandar?.();
    }
  }

  return (
    <div className="border-heraldico-vermelho/30 mt-6 rounded-sm border-2 border-dashed p-3">
      <p className="font-titulo text-tinta-900 text-sm font-bold">Repartir o tesouro (Mestre)</p>

      <p className="text-tinta-700 mt-2 text-xs">Quem divide</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {fichas.map((s) => {
          const ligado = quem.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={ligado}
              onClick={() => setQuem((q) => (ligado ? q.filter((x) => x !== s) : [...q, s]))}
              className={`min-h-9 rounded-full border px-3 text-xs ${ligado ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/40 text-tinta-700"}`}
            >
              {nomes[s] ?? s}
            </button>
          );
        })}
      </div>

      {tipos.length && quem.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-tinta-500 text-xs">
                <th className="text-left font-normal">Moedas</th>
                {tipos.map((t) => (
                  <th key={t.chave} className="px-1 font-normal">
                    <abbr title={t.nome} className="no-underline">
                      {t.chave.toUpperCase()}
                    </abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quem.map((q) => (
                <tr key={q}>
                  <th scope="row" className="text-tinta-900 py-1 pr-2 text-left font-semibold">
                    {nomes[q] ?? q}
                  </th>
                  {tipos.map((t) => (
                    <td key={t.chave} className="px-1 py-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={partes[q]?.[t.chave] ?? 0}
                        onChange={(e) =>
                          setPartes((p) => ({
                            ...p,
                            [q]: { ...p[q], [t.chave]: Math.max(0, Math.floor(Number(e.target.value) || 0)) },
                          }))
                        }
                        aria-label={`${t.nome} para ${nomes[q] ?? q}`}
                        className={`${CAMPO} min-w-14 px-1 text-center`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="text-tinta-500 text-xs">
                <th scope="row" className="pt-1 text-left font-normal">
                  No baú
                </th>
                {tipos.map((t) => (
                  <td key={t.chave} className={`pt-1 text-center ${distribuido(t.chave) !== moedas[t.chave] ? "text-heraldico-vermelho font-semibold" : ""}`}>
                    {distribuido(t.chave)}/{moedas[t.chave]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <button type="button" onClick={() => setPartes(dividir(moedas, quem))} className="text-tinta-700 mt-1 min-h-9 text-xs underline">
            Dividir igual de novo
          </button>
        </div>
      ) : null}

      {itens.length ? (
        <ul className="mt-3 space-y-2">
          {itens.map((item, i) => (
            <li key={`${item}-${i}`} className="flex flex-wrap items-center gap-2">
              <span className="text-tinta-900 min-w-0 flex-1 text-sm">{item}</span>
              <select
                value={donos[i] ?? ""}
                onChange={(e) => setDonos((d) => d.map((x, j) => (j === i ? e.target.value : x)))}
                aria-label={`Para quem vai ${item}`}
                className={`${CAMPO} w-auto`}
              >
                <option value="">Ninguém</option>
                {quem.map((q) => (
                  <option key={q} value={q}>
                    {nomes[q] ?? q}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      ) : null}

      {!confere ? (
        <p className="text-heraldico-vermelho mt-2 text-xs">As moedas repartidas não somam o que tem no baú. Pode mandar assim mesmo, se for de propósito.</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={enviando || mandado || !quem.length} onClick={() => void mandar()} className={BOTAO_CHEIO}>
          {mandado ? "Entregue" : "Entregar"}
        </button>
        {mandado ? (
          <button type="button" onClick={() => setMandado(false)} className={BOTAO}>
            Entregar de novo
          </button>
        ) : null}
      </div>
      {aviso ? (
        <p role="status" className={`mt-2 text-sm ${aviso.erro ? "text-heraldico-vermelho" : "text-tinta-700"}`}>
          {aviso.texto}
        </p>
      ) : null}
    </div>
  );
}

/** As moedas do Baú (PC, PP, PE, PO, PL) no jeito da ficha. */
export const MOEDA_DA_FICHA: Record<string, Tipo> = { PC: "pc", PP: "pp", PE: "ce", PO: "po", PL: "pl" };

/** O que saiu do Baú, no formato de repartir. */
export function tesouroDoBau(r: {
  moedas: { chave: string; quantidade: number }[];
  vagas: { escolhido?: { nome: string; magia?: { nome: string } } }[];
}): { moedas: Moedas; itens: string[] } {
  const moedas: Moedas = {};
  for (const m of r.moedas) {
    const chave = MOEDA_DA_FICHA[m.chave];
    if (chave && m.quantidade > 0) moedas[chave] = (moedas[chave] ?? 0) + m.quantidade;
  }
  const itens = r.vagas.flatMap((v) => (v.escolhido ? [v.escolhido.magia ? `${v.escolhido.nome}: ${v.escolhido.magia.nome}` : v.escolhido.nome] : []));
  return { moedas, itens };
}
