"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CriaturaDeCombate } from "@/lib/encontros";
import { moedasPorExtenso, type Moedas } from "@/lib/ficha-viva";
import { presentesGuardados } from "@/lib/sessao";
import {
  apagarEncontroPronto,
  comecarEncontro,
  gruposDoPronto,
  lerEncontrosProntos,
  marcarProntoUsado,
  sortearLoots,
  type EncontroPronto,
} from "@/lib/montar-combate";
import { BOTAO, BOTAO_CHEIO } from "@/components/conta/MinhaConta";
import type { PersonagemDoCombate } from "./GeradorDeEncontros";
import { usePersonagensDaMesa } from "./usePersonagensDaMesa";

/**
 * Os encontros que o Mestre deixou prontos: um toque e o combate começa na
 * arena, com quem está marcado na Sessão de hoje. O loot fixo vai como
 * está; o resto sorteia na hora.
 */
export function EncontrosProntos({
  personagens: personagensDoSite,
  criaturas: dadas,
  carregar,
  versao = 0,
}: {
  personagens: PersonagemDoCombate[];
  criaturas?: CriaturaDeCombate[];
  /** No gerador: abre o encontro para mexer. */
  carregar?: (p: EncontroPronto) => void;
  /** Muda quando o gerador guarda um novo, para a lista reler. */
  versao?: number;
}) {
  const personagens = usePersonagensDaMesa(personagensDoSite);
  const router = useRouter();
  const [lista, setLista] = useState<EncontroPronto[] | null>(null);
  const [criaturas, setCriaturas] = useState<CriaturaDeCombate[] | null>(dadas ?? null);
  const [indo, setIndo] = useState<number | null>(null);
  const [apagando, setApagando] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    void lerEncontrosProntos().then(setLista);
  }, [versao]);

  useEffect(() => {
    if (dadas) return;
    void fetch("/monstros/combate.json")
      .then((r) => r.json() as Promise<CriaturaDeCombate[]>)
      .then(setCriaturas)
      .catch(() => setCriaturas([]));
  }, [dadas]);

  async function comecar(p: EncontroPronto) {
    if (!criaturas) return;
    setIndo(p.id);
    setAviso(null);
    const marcados = presentesGuardados();
    const presentes = personagens.filter((x) => !marcados || marcados.includes(x.slug));
    const grupos = gruposDoPronto(p.dados, criaturas);
    const loots = p.dados.lootFixo ?? (await sortearLoots(grupos, p.dados.loot, presentes.map((x) => x.nivel)));
    const erro = await comecarEncontro({ grupos, presentes, rolarPv: p.dados.rolarPv, loots, dificuldade: p.dados.dificuldade, comoComeca: p.dados.comoComeca });
    setIndo(null);
    if (erro) {
      setAviso(erro);
      return;
    }
    await marcarProntoUsado(p.id);
    router.push("/combate/");
  }

  async function apagar(id: number) {
    const erro = await apagarEncontroPronto(id);
    setApagando(null);
    if (erro) setAviso(erro);
    else setLista((l) => (l ?? []).filter((x) => x.id !== id));
  }

  if (lista === null) return <p className="text-tinta-500 text-sm italic">Abrindo os encontros guardados…</p>;
  if (!lista.length)
    return <p className="text-tinta-500 text-sm italic">Nenhum encontro guardado ainda. Monte um no gerador e toque em &quot;Guardar para depois&quot;.</p>;

  const nomeDe = (slug: string) => criaturas?.find((c) => c.slug === slug)?.nome ?? slug;

  return (
    <div>
      {aviso ? <p className="text-heraldico-vermelho mb-2 text-sm">{aviso}</p> : null}
      <ul className="space-y-2">
        {lista.map((p) => {
          const inimigos = p.dados.grupos.map((g) => (g.quantas > 1 ? `${g.quantas} ${nomeDe(g.slug)}` : nomeDe(g.slug))).join(", ");
          const combate = p.dados.grupos.length > 0;
          return (
            <li key={p.id} className="border-dourado-600/40 rounded-sm border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-titulo text-tinta-900 font-bold">
                    {combate ? "⚔ " : "✦ "}
                    {p.nome}
                  </p>
                  <p className="text-tinta-700 text-xs">
                    {combate ? inimigos : p.dados.fora?.encontro.titulo}
                    {p.dados.dificuldade ? ` · ${p.dados.dificuldade}` : ""}
                    {p.usado_em ? ` · usado em ${new Date(p.usado_em).toLocaleDateString("pt-BR")}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {combate ? (
                    <button type="button" disabled={indo !== null || !criaturas} onClick={() => void comecar(p)} className={`${BOTAO_CHEIO} min-h-10 px-4`}>
                      {indo === p.id ? "Arrumando…" : "▶ Começar"}
                    </button>
                  ) : null}
                  {carregar ? (
                    <button type="button" onClick={() => carregar(p)} className={`${BOTAO} min-h-10 px-3 text-xs`}>
                      Abrir no gerador
                    </button>
                  ) : null}
                  {apagando === p.id ? (
                    <>
                      <button type="button" onClick={() => void apagar(p.id)} className={`${BOTAO} border-heraldico-vermelho text-heraldico-vermelho min-h-10 px-3 text-xs`}>
                        Apagar de vez
                      </button>
                      <button type="button" onClick={() => setApagando(null)} className={`${BOTAO} min-h-10 px-3 text-xs`}>
                        Não
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setApagando(p.id)} aria-label={`Apagar ${p.nome}`} className={`${BOTAO} min-h-10 px-3 text-xs`}>
                      Apagar
                    </button>
                  )}
                </div>
              </div>
              <details className="mt-1">
                <summary className="text-tinta-700 min-h-9 cursor-pointer text-xs">Ver o que está preparado</summary>
                <div className="text-tinta-700 mt-1 space-y-1 text-sm">
                  {p.notas ? <p className="whitespace-pre-wrap">{p.notas}</p> : null}
                  {p.dados.comoComeca ? <p>
                      <strong>Como começa:</strong> {p.dados.comoComeca}
                    </p> : null}
                  {p.dados.fora ? (
                    <p>
                      <strong>{p.dados.fora.encontro.titulo}:</strong> {p.dados.fora.encontro.cena} {p.dados.fora.encontro[p.dados.fora.rumo]}
                    </p>
                  ) : null}
                  {combate ? (
                    p.dados.lootFixo ? (
                      <ul className="list-disc pl-5">
                        {p.dados.grupos.flatMap((g, k) =>
                          (p.dados.lootFixo![k] ?? []).map((l, i) => {
                            const quem = g.quantas > 1 ? `${nomeDe(g.slug)} ${i + 1}` : nomeDe(g.slug);
                            const coisas = l
                              ? [Object.keys(l.moedas).length ? moedasPorExtenso(l.moedas as Moedas) : "", ...l.itens.map((x) => x.nome)].filter(Boolean).join(", ")
                              : "";
                            return (
                              <li key={`${k}-${i}`}>
                                {quem}: {coisas || "nada"}
                              </li>
                            );
                          })
                        )}
                      </ul>
                    ) : (
                      <p>{p.dados.loot.ligado ? "O loot sorteia na hora de começar." : "Sem loot."}</p>
                    )
                  ) : null}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
