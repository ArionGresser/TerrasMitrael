"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { abrir, CATEGORIAS_MAGICAS, type Conteudo, type Resultado } from "@/lib/bau-sorteio";
import { terminarCombate, versaoDaMesa, type CombateAtivo } from "@/lib/combate";
import { mestre, moedasPorExtenso } from "@/lib/ficha-viva";
import { BOTAO, BOTAO_CHEIO } from "@/components/conta/MinhaConta";
import { Janela } from "@/components/ficha-viva/Janela";
import { DistribuirTesouro, tesouroDoBau } from "@/components/ficha-viva/DistribuirTesouro";

/** O tamanho do baú pela dificuldade do encontro. */
function recipienteDa(dificuldade?: string) {
  if (dificuldade === "Baixa") return "caixa";
  if (dificuldade === "Alta" || dificuldade === "Acima de Alta") return "grande";
  return "medio";
}

function patamarDo(nivelMedio: number) {
  if (nivelMedio <= 4) return "1-4";
  if (nivelMedio <= 10) return "5-10";
  if (nivelMedio <= 16) return "11-16";
  return "17-20";
}

/**
 * O fim do combate: o XP das criaturas vencidas dividido entre os
 * personagens, o tesouro (sorteado pelas regras do Baú do Mestre, pelo
 * nível do grupo e pela dificuldade) repartido entre eles, e o resumo
 * guardado na lista dos combates.
 */
export function FimDoCombate({
  aberta,
  aoFechar,
  combate,
  pvs,
  nomes,
  niveis,
  aoTerminar,
}: {
  aberta: boolean;
  aoFechar: () => void;
  combate: CombateAtivo;
  pvs: Record<string, [number, number]>;
  nomes: Record<string, string>;
  niveis: Record<string, number>;
  aoTerminar: () => void;
}) {
  const estado = combate.estado;
  const personagens = estado.lutadores.filter((l) => l.tipo === "personagem");
  const criaturas = estado.lutadores.filter((l) => l.tipo === "criatura");
  const [todas, setTodas] = useState(false);
  const [quem, setQuem] = useState<Set<string>>(new Set());
  const [tesouro, setTesouro] = useState<{ d20: number; r: Resultado } | null>(null);
  const [conteudo, setConteudo] = useState<Conteudo | null>(null);
  const [indo, setIndo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Quem entrou no combate depois também conta
  const chave = personagens.map((p) => p.slug).join(",");
  useEffect(() => {
    if (aberta) setQuem(new Set(chave ? chave.split(",") : []));
  }, [aberta, chave]);

  const contam = criaturas.filter((c) => todas || c.pv <= 0);
  const total = contam.reduce((s, c) => s + c.xp, 0);
  const porCabeca = quem.size ? Math.floor(total / quem.size) : 0;

  async function sortearTesouro() {
    let c = conteudo;
    if (!c) {
      try {
        c = (await (await fetch("/bau/conteudo.json")).json()) as Conteudo;
        setConteudo(c);
      } catch {
        setErro("Não deu para abrir o baú. Confira a internet.");
        return;
      }
    }
    const lista = personagens.map((p) => niveis[p.slug] ?? 1);
    const medio = lista.length ? Math.round(lista.reduce((a, b) => a + b, 0) / lista.length) : 1;
    const d20 = 1 + Math.floor(Math.random() * 20);
    const r = abrir(
      {
        recipiente: recipienteDa(estado.dificuldade),
        moedas: ["PC", "PP", "PO"],
        comuns: ["arma", "armadura", "aventura", "ferramenta"],
        magicos: [...CATEGORIAS_MAGICAS],
        nivel: patamarDo(medio),
        d20,
      },
      c,
      true
    );
    setTesouro({ d20, r });
  }

  async function terminar(comXp: boolean) {
    setIndo(true);
    setErro(null);
    if (comXp && porCabeca > 0) {
      for (const slug of quem) {
        const e = await mestre.xp(slug, porCabeca);
        if (e) {
          setErro(`${nomes[slug] ?? slug}: ${e}`);
          setIndo(false);
          return;
        }
      }
    }
    const t = tesouro ? tesouroDoBau(tesouro.r) : null;
    const textoDoTesouro = t
      ? [Object.keys(t.moedas).length ? moedasPorExtenso(t.moedas) : "", ...t.itens].filter(Boolean).join(", ")
      : undefined;
    const e = await terminarCombate(combate.id, {
      ...versaoDaMesa(estado, pvs),
      resumo: {
        data: new Date().toISOString(),
        rodadas: estado.rodada,
        inimigos: criaturas.map((c) => c.nome),
        personagens: personagens.map((p) => p.nome),
        xpPorCabeca: comXp ? porCabeca : 0,
        tesouro: textoDoTesouro,
      },
    });
    setIndo(false);
    if (e) setErro(e);
    else aoTerminar();
  }

  const doBau = tesouro ? tesouroDoBau(tesouro.r) : null;

  return (
    <Janela aberta={aberta} aoFechar={aoFechar} titulo="Terminar o combate" larga>
      <section>
        <h3 className="font-titulo text-tinta-900 font-bold">Experiência</h3>
        <p className="text-tinta-700 mt-1 text-sm">
          {contam.length} de {criaturas.length} criaturas contam:{" "}
          <strong className="text-tinta-900">{total.toLocaleString("pt-BR")} XP</strong>.
        </p>
        <label className="text-tinta-700 mt-1 flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={todas} onChange={(e) => setTodas(e.target.checked)} className="accent-heraldico-vermelho size-4" />
          Contar todas (fugiram, se renderam ou foram vencidas de outro jeito)
        </label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {personagens.map((p) => {
            const ligado = quem.has(p.slug);
            return (
              <button
                key={p.slug}
                type="button"
                aria-pressed={ligado}
                onClick={() =>
                  setQuem((s) => {
                    const n = new Set(s);
                    if (ligado) n.delete(p.slug);
                    else n.add(p.slug);
                    return n;
                  })
                }
                className={`min-h-9 rounded-full border px-3 text-xs ${ligado ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/40 text-tinta-700"}`}
              >
                {p.nome}
              </button>
            );
          })}
        </div>
        <p className="font-titulo text-tinta-900 mt-2">{porCabeca.toLocaleString("pt-BR")} XP para cada um</p>
      </section>

      <section className="border-dourado-600/30 mt-5 border-t pt-4">
        <h3 className="font-titulo text-tinta-900 font-bold">Tesouro</h3>
        <p className="text-tinta-700 mt-1 text-sm">
          Sorteado pelo Baú do Mestre, pelo nível do grupo e pela dificuldade do encontro.
        </p>
        <button type="button" onClick={() => void sortearTesouro()} className={`${BOTAO} mt-2`}>
          {tesouro ? "Sortear outro tesouro" : "Ver o tesouro do combate"}
        </button>
        {tesouro && doBau ? (
          <div className="mt-3">
            <p className="text-tinta-900 text-sm">
              <strong>d20: {tesouro.d20}</strong> · {tesouro.r.faixa.nome}
              <span className="text-tinta-500"> · {tesouro.r.recipiente.nome}</span>
            </p>
            <ul className="text-tinta-700 mt-1 list-disc pl-5 text-sm">
              {Object.keys(doBau.moedas).length ? <li>{moedasPorExtenso(doBau.moedas)}</li> : null}
              {doBau.itens.map((i, k) => (
                <li key={`${i}-${k}`}>{i}</li>
              ))}
              {!Object.keys(doBau.moedas).length && !doBau.itens.length ? <li>Nada. Só poeira.</li> : null}
            </ul>
            <DistribuirTesouro moedas={doBau.moedas} itens={doBau.itens} nomes={nomes} participantes={personagens.map((p) => p.slug)} />
          </div>
        ) : null}
        <p className="text-tinta-500 mt-2 text-xs">
          Quer escolher o baú com calma? Abra o{" "}
          <Link href="/bau/" target="_blank" className="underline">
            Baú do Mestre
          </Link>{" "}
          numa aba nova.
        </p>
      </section>

      {erro ? (
        <p role="alert" className="text-heraldico-vermelho mt-3 text-sm">
          {erro}
        </p>
      ) : null}

      <div className="border-dourado-600/30 mt-5 flex flex-wrap gap-2 border-t pt-4">
        <button type="button" disabled={indo || !porCabeca} onClick={() => void terminar(true)} className={BOTAO_CHEIO}>
          Dar o XP e terminar
        </button>
        <button type="button" disabled={indo} onClick={() => void terminar(false)} className={BOTAO}>
          Terminar sem XP
        </button>
      </div>
    </Janela>
  );
}
