"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { CONDICOES, type Lutador } from "@/lib/combate";
import { mestre, moedasPorExtenso, type Moedas } from "@/lib/ficha-viva";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import { Janela } from "@/components/ficha-viva/Janela";

/** Um golpe de uma habilidade: em quem, se acertou, quanto, de que tipo e o que causou. */
export type Golpe = { alvo: string; acertou: boolean; dano: number; tipo: string; condicao: string };

type FichaDoBestiario = {
  linha: string;
  ca: string;
  pv: string;
  deslocamento: string;
  atributos: { sigla: string; valor: number; mod: string; save: string }[];
  campos: { rotulo: string; valor: string }[];
  nd: string;
  xp: string;
  secoes: { titulo: string; texto: string }[];
};

let fichasCarregando: Promise<Record<string, FichaDoBestiario>> | null = null;
function fichasDoBestiario() {
  fichasCarregando ??= fetch("/monstros/fichas.json").then((r) => r.json() as Promise<Record<string, FichaDoBestiario>>);
  return fichasCarregando;
}

/** "**_Mordida._** texto" → nome e texto de cada habilidade da seção. */
function habilidades(texto: string): { nome: string; texto: string }[] {
  return texto
    .split(/\n\s*\n/)
    .map((bloco) => {
      const m = bloco.match(/^\*\*_(.+?)\._\*\*\s*([\s\S]*)$/);
      return m ? { nome: m[1].trim(), texto: m[2].trim() } : { nome: "", texto: bloco.trim() };
    })
    .filter((h) => h.texto || h.nome);
}

/** O limite de usos no nome: "(3/Dia)" → 3; "(Recarga 5–6)" → 1, que volta ao recarregar. */
function limite(nome: string): { max: number; recarga: boolean } | null {
  const dia = nome.match(/\((\d+)\/(dia|Dia)/);
  if (dia) return { max: Number(dia[1]), recarga: false };
  if (/Recarga/i.test(nome)) return { max: 1, recarga: true };
  return null;
}

/** Os números do texto, para já vir preenchido: quantos ataques, dano médio e o tipo. */
function sugestao(texto: string): { ataques: number; dano: number; tipo: string } {
  const n = { dois: 2, duas: 2, três: 3, tres: 3, quatro: 4, cinco: 5 } as Record<string, number>;
  const ataques = texto.match(/faz (dois|duas|três|tres|quatro|cinco) ataques/i)?.[1];
  const dano = texto.match(/_?Acerto:_?\s*(\d+)/)?.[1];
  const tipo = texto.match(/de dano (\p{L}+)/u)?.[1];
  return { ataques: ataques ? n[ataques.toLowerCase()] : 1, dano: dano ? Number(dano) : 0, tipo: tipo ?? "" };
}

/** O markdown curto das fichas: **negrito** e _itálico_. */
function Texto({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("**") ? (
          <strong key={i}>{p.slice(2, -2).replace(/_/g, "")}</strong>
        ) : p.startsWith("_") && p.endsWith("_") && p.length > 2 ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        )
      )}
    </>
  );
}

/**
 * A ficha de uma criatura na arena, só para o Mestre: os PV com dano e cura,
 * as condições, a ficha do Bestiário com um "Usar" em cada habilidade (que
 * conta os usos e marca cada golpe: alvo, acerto, dano, tipo e efeito) e o
 * loot que ela carrega.
 */
export function FichaDaCriatura({
  lutador: l,
  alvos,
  personagens,
  aoFechar,
  dano,
  cura,
  condicao,
  mudar,
  golpear,
  remover,
  marcarComoAlvo,
  ehAlvo,
}: {
  lutador: Lutador;
  alvos: { id: string; nome: string }[];
  personagens: { slug: string; nome: string }[];
  aoFechar: () => void;
  dano: (n: number) => void;
  cura: (n: number) => void;
  condicao: (c: string) => void;
  mudar: (m: Partial<Lutador>, texto?: string, publico?: string) => void;
  golpear: (habilidade: string, golpes: Golpe[], usos?: Record<string, number>) => Promise<void>;
  remover: () => void;
  marcarComoAlvo: () => void;
  ehAlvo: boolean;
}) {
  const [ficha, setFicha] = useState<FichaDoBestiario | null | undefined>(undefined);
  const [valor, setValor] = useState("");
  const [usando, setUsando] = useState<{ nome: string; texto: string } | null>(null);
  const daCasa = l.slug.startsWith("da-casa-");
  const n = Math.max(0, Math.floor(Number(valor) || 0));

  useEffect(() => {
    if (daCasa) {
      setFicha(null);
      return;
    }
    void fichasDoBestiario()
      .then((f) => setFicha(f[l.slug] ?? null))
      .catch(() => setFicha(null));
  }, [l.slug, daCasa]);

  const usos = l.usos ?? {};
  const f = l.pvMaximo ? Math.min(1, l.pv / l.pvMaximo) : 0;

  return (
    <Janela aberta aoFechar={aoFechar} titulo={l.nome} larga>
      <div className="space-y-4">
        {/* PV, CA e os botões rápidos */}
        <div>
          <p className="font-titulo text-tinta-900 text-2xl font-bold tabular-nums">
            {l.pv}
            <span className="text-tinta-500 text-base"> / {l.pvMaximo} PV</span>
            <span className="text-tinta-700 ml-3 text-base">CA {l.ca}</span>
            {l.fugiu ? <span className="text-tinta-500 ml-3 text-sm">fugiu</span> : null}
          </p>
          <div className="bg-madeira-800/15 mt-1 h-2 overflow-hidden rounded-full" aria-hidden>
            <div className={`h-full ${f > 0.5 ? "bg-[#3f7d3a]" : f > 0.25 ? "bg-[#c58a1c]" : "bg-heraldico-vermelho"}`} style={{ width: `${f * 100}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={valor}
              placeholder="PV"
              aria-label={`Dano ou cura em ${l.nome}`}
              onChange={(e) => setValor(e.target.value)}
              className={`${CAMPO} max-w-20`}
            />
            <button type="button" disabled={!n} onClick={() => (dano(n), setValor(""))} className={`${BOTAO} px-3`}>
              Dano
            </button>
            <button type="button" disabled={!n} onClick={() => (cura(n), setValor(""))} className={`${BOTAO} px-3`}>
              Cura
            </button>
            <select value="" onChange={(e) => condicao(e.target.value)} aria-label="Pôr ou tirar uma condição" className={`${CAMPO} w-auto`}>
              <option value="">Condição…</option>
              {CONDICOES.map((c) => (
                <option key={c} value={c}>
                  {l.condicoes.includes(c) ? `Tirar ${c}` : c}
                </option>
              ))}
            </select>
          </div>
          {l.condicoes.length ? <p className="text-heraldico-vermelho mt-1 text-sm">{l.condicoes.join(", ")}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={marcarComoAlvo} className={`${BOTAO} px-3 text-xs`}>
              {ehAlvo ? "Desmarcar como alvo" : "Marcar como alvo"}
            </button>
            <button
              type="button"
              onClick={() =>
                mudar(
                  { fugiu: !l.fugiu },
                  l.fugiu ? `${l.nome} voltou ao combate.` : `${l.nome} fugiu${l.loot && !l.loot.levadoPor ? " e levou o que carregava" : ""}.`,
                  l.fugiu ? `${l.nome} voltou ao combate.` : `${l.nome} fugiu.`
                )
              }
              className={`${BOTAO} px-3 text-xs`}
            >
              {l.fugiu ? "Voltou ao combate" : "Fugiu"}
            </button>
            <button type="button" onClick={remover} className={`${BOTAO} px-3 text-xs`}>
              Tirar do combate
            </button>
          </div>
        </div>

        {/* A habilidade em uso: os golpes */}
        {usando ? (
          <UsarHabilidade
            habilidade={usando}
            alvos={alvos}
            limitada={limite(usando.nome)}
            usadas={usos[usando.nome] ?? 0}
            cancelar={() => setUsando(null)}
            confirmar={async (golpes) => {
              const lim = limite(usando.nome);
              await golpear(usando.nome, golpes, lim ? { ...usos, [usando.nome]: (usos[usando.nome] ?? 0) + 1 } : undefined);
              setUsando(null);
            }}
          />
        ) : null}

        {/* A ficha do Bestiário */}
        {ficha === undefined ? <p className="text-tinta-500 text-sm italic">Abrindo a ficha…</p> : null}
        {ficha ? (
          <div className="border-dourado-600/30 border-t pt-3">
            <p className="text-tinta-700 text-sm italic">{ficha.linha}</p>
            <p className="text-tinta-700 mt-1 text-sm">
              <strong>PV</strong> {ficha.pv} · <strong>Desl.</strong> {ficha.deslocamento} · <strong>ND</strong> {ficha.nd} ({ficha.xp} XP)
            </p>
            <div className="mt-2 grid grid-cols-6 gap-1 text-center text-xs">
              {ficha.atributos.map((a) => (
                <div key={a.sigla} className="border-dourado-600/30 rounded-sm border py-1">
                  <div className="font-titulo text-tinta-500 font-bold">{a.sigla}</div>
                  <div className="text-tinta-900 font-semibold tabular-nums">{a.valor}</div>
                  <div className="text-tinta-700 tabular-nums">{a.mod}</div>
                </div>
              ))}
            </div>
            <ul className="text-tinta-700 mt-2 space-y-0.5 text-sm">
              {ficha.campos.map((c) => (
                <li key={c.rotulo}>
                  <strong>{c.rotulo}</strong> {c.valor}
                </li>
              ))}
            </ul>
            {ficha.secoes.map((s) => (
              <section key={s.titulo} className="mt-3">
                <h3 className="font-titulo text-heraldico-vermelho text-sm font-bold tracking-wide uppercase">{s.titulo}</h3>
                <ul className="mt-1 space-y-2">
                  {habilidades(s.texto).map((h, i) => {
                    const lim = h.nome ? limite(h.nome) : null;
                    const usadas = usos[h.nome] ?? 0;
                    const esgotada = lim ? usadas >= lim.max : false;
                    return (
                      <li key={`${h.nome}-${i}`} className="text-tinta-900 text-sm leading-relaxed">
                        {h.nome ? <strong>{h.nome}. </strong> : null}
                        <Texto texto={h.texto} />
                        {h.nome && (s.titulo !== "Traços" || lim) ? (
                          <span className="mt-1 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={esgotada}
                              onClick={() => setUsando(h)}
                              className={`${BOTAO} min-h-9 px-3 text-xs`}
                            >
                              Usar
                            </button>
                            {lim ? (
                              <span className={`text-xs ${esgotada ? "text-heraldico-vermelho font-semibold" : "text-tinta-500"}`}>
                                {lim.recarga ? (esgotada ? "usada, esperando recarga" : "pronta") : `${usadas}/${lim.max} usos`}
                              </span>
                            ) : null}
                            {lim && usadas > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  mudar(
                                    { usos: { ...usos, [h.nome]: lim.recarga ? 0 : usadas - 1 } },
                                    lim.recarga ? `${l.nome}: ${h.nome} recarregou.` : undefined
                                  )
                                }
                                className="text-tinta-500 min-h-9 text-xs underline"
                              >
                                {lim.recarga ? "Recarregou" : "Devolver um uso"}
                              </button>
                            ) : null}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            <Link href={`/monstros/${l.slug}/`} target="_blank" className="text-heraldico-vermelho mt-3 inline-block text-sm underline">
              Abrir a página da criatura
            </Link>
          </div>
        ) : null}
        {ficha === null ? (
          <div className="border-dourado-600/30 border-t pt-3">
            <p className="text-tinta-700 text-sm">{daCasa ? "Criatura da casa: sem ficha no Bestiário." : "Ficha não encontrada."}</p>
            <HabilidadeLivre usar={(nome) => setUsando({ nome, texto: "" })} />
          </div>
        ) : null}

        <Loot lutador={l} personagens={personagens} mudar={mudar} />
      </div>
    </Janela>
  );
}

function HabilidadeLivre({ usar }: { usar: (nome: string) => void }) {
  const [nome, setNome] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (nome.trim()) usar(nome.trim());
      }}
      className="mt-2 flex items-end gap-2"
    >
      <label className="text-tinta-700 flex-1 text-xs">
        Usar uma habilidade
        <input value={nome} maxLength={60} onChange={(e) => setNome(e.target.value)} placeholder="Raio da Fome, Medo…" className={`${CAMPO} mt-1`} />
      </label>
      <button type="submit" disabled={!nome.trim()} className={BOTAO}>
        Usar
      </button>
    </form>
  );
}

function UsarHabilidade({
  habilidade,
  alvos,
  limitada,
  usadas,
  cancelar,
  confirmar,
}: {
  habilidade: { nome: string; texto: string };
  alvos: { id: string; nome: string }[];
  limitada: { max: number; recarga: boolean } | null;
  usadas: number;
  cancelar: () => void;
  confirmar: (golpes: Golpe[]) => Promise<void>;
}) {
  const s = sugestao(habilidade.texto);
  const novoGolpe = (): Golpe => ({ alvo: alvos[0]?.id ?? "", acertou: true, dano: s.dano, tipo: s.tipo, condicao: "" });
  const [golpes, setGolpes] = useState<Golpe[]>(() => Array.from({ length: s.ataques }, novoGolpe));
  const [indo, setIndo] = useState(false);
  const mudarGolpe = (i: number, m: Partial<Golpe>) => setGolpes((g) => g.map((x, j) => (j === i ? { ...x, ...m } : x)));

  async function ir(lista: Golpe[]) {
    setIndo(true);
    await confirmar(lista);
    setIndo(false);
  }

  return (
    <section className="border-heraldico-vermelho/50 bg-heraldico-vermelho/5 rounded-sm border-2 p-3">
      <h3 className="font-titulo text-tinta-900 font-bold">Usar {habilidade.nome}</h3>
      {limitada ? (
        <p className="text-tinta-700 text-xs">
          {limitada.recarga ? "Depois de usar, fica esperando a recarga." : `Uso ${usadas + 1} de ${limitada.max}.`}
        </p>
      ) : null}
      <ol className="mt-2 space-y-3">
        {golpes.map((g, i) => (
          <li key={i} className="border-dourado-600/30 rounded-sm border p-2">
            <div className="flex items-center justify-between">
              <span className="font-titulo text-tinta-700 text-xs font-bold uppercase">Golpe {i + 1}</span>
              {golpes.length > 1 ? (
                <button type="button" onClick={() => setGolpes((x) => x.filter((_, j) => j !== i))} className="text-tinta-500 min-h-8 px-2 text-xs underline">
                  tirar
                </button>
              ) : null}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <label className="text-tinta-700 col-span-2 text-xs">
                Em quem
                <select value={g.alvo} onChange={(e) => mudarGolpe(i, { alvo: e.target.value })} className={`${CAMPO} mt-1`}>
                  {alvos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-tinta-700 flex min-h-11 items-end gap-2 text-xs">
                <input type="checkbox" checked={g.acertou} onChange={(e) => mudarGolpe(i, { acertou: e.target.checked })} className="accent-heraldico-vermelho mb-3 size-5" />
                <span className="mb-3">Acertou</span>
              </label>
              <label className="text-tinta-700 text-xs">
                Dano
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={g.dano}
                  disabled={!g.acertou}
                  onChange={(e) => mudarGolpe(i, { dano: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                  className={`${CAMPO} mt-1`}
                />
              </label>
              <label className="text-tinta-700 text-xs">
                Tipo
                <input value={g.tipo} disabled={!g.acertou} onChange={(e) => mudarGolpe(i, { tipo: e.target.value })} placeholder="necrótico" className={`${CAMPO} mt-1`} />
              </label>
              <label className="text-tinta-700 col-span-2 text-xs sm:col-span-5">
                Efeito
                <select value={g.condicao} disabled={!g.acertou} onChange={(e) => mudarGolpe(i, { condicao: e.target.value })} className={`${CAMPO} mt-1`}>
                  <option value="">Nenhum</option>
                  {CONDICOES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setGolpes((g) => [...g, novoGolpe()])} className={`${BOTAO} px-3 text-xs`}>
          + outro golpe
        </button>
        <button type="button" disabled={indo || !alvos.length} onClick={() => void ir(golpes)} className={BOTAO_CHEIO}>
          Confirmar
        </button>
        <button type="button" disabled={indo} onClick={() => void ir([])} className={`${BOTAO} px-3 text-xs`}>
          Só marcar o uso
        </button>
        <button type="button" onClick={cancelar} className="text-tinta-500 min-h-11 px-2 text-xs underline">
          Cancelar
        </button>
      </div>
    </section>
  );
}

/** O loot da criatura: no chão se ela caiu, perdido se fugiu, e o "looteou" manda para a ficha. */
function Loot({
  lutador: l,
  personagens,
  mudar,
}: {
  lutador: Lutador;
  personagens: { slug: string; nome: string }[];
  mudar: (m: Partial<Lutador>, texto?: string, publico?: string) => void;
}) {
  const [para, setPara] = useState(personagens[0]?.slug ?? "");
  const [indo, setIndo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const loot = l.loot;
  if (!loot) return null;

  const restantes = loot.itens.filter((i) => !i.destruido);
  const temMoedas = Object.values(loot.moedas).some((v) => (v ?? 0) > 0);
  const vazio = !restantes.length && !temMoedas;
  const nomeDe = (s: string) => personagens.find((p) => p.slug === s)?.nome ?? s;

  async function lootear() {
    if (!para) return;
    setIndo(true);
    const erros: string[] = [];
    if (temMoedas) {
      const e = await mestre.moedas(para, loot!.moedas as Moedas);
      if (e) erros.push(e);
    }
    for (const i of restantes) {
      const e = await mestre.darItem(para, i.nome.slice(0, 80), 1);
      if (e) erros.push(e);
    }
    setIndo(false);
    if (erros.length) {
      setAviso(erros.join(" "));
      return;
    }
    const oQue = [temMoedas ? moedasPorExtenso(loot!.moedas as Moedas) : "", ...restantes.map((i) => i.nome)].filter(Boolean).join(", ");
    mudar({ loot: { ...loot!, levadoPor: para } }, `${nomeDe(para)} looteou ${l.nome}: ${oQue || "nada"}.`, `${nomeDe(para)} looteou ${l.nome}.`);
  }

  let situacao: ReactNode;
  if (loot.levadoPor) situacao = <p className="text-tinta-700 text-sm">Já looteado por {nomeDe(loot.levadoPor)}.</p>;
  else if (l.fugiu) situacao = <p className="text-heraldico-vermelho text-sm">Fugiu e levou tudo junto.</p>;
  else if (l.pv > 0) situacao = <p className="text-tinta-500 text-xs">Ainda está com a criatura. Quando ela cair, fica no chão para lootear.</p>;
  else situacao = null;

  return (
    <section className="border-dourado-600/30 border-t pt-3">
      <h3 className="font-titulo text-tinta-900 text-sm font-bold tracking-wide uppercase">O que ela carrega</h3>
      {vazio ? (
        <p className="text-tinta-500 text-sm italic">Nada de valor.</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm">
          {temMoedas ? <li className="text-tinta-900">{moedasPorExtenso(loot.moedas as Moedas)}</li> : null}
          {loot.itens.map((i, k) => (
            <li key={`${i.nome}-${k}`} className="flex flex-wrap items-center gap-2">
              <span className={i.destruido ? "text-tinta-500 line-through" : "text-tinta-900"}>{i.nome}</span>
              {!loot.levadoPor ? (
                <button
                  type="button"
                  onClick={() =>
                    mudar(
                      { loot: { ...loot, itens: loot.itens.map((x, j) => (j === k ? { ...x, destruido: !x.destruido } : x)) } },
                      i.destruido ? undefined : `${i.nome} de ${l.nome} foi destruído.`
                    )
                  }
                  className="text-tinta-500 min-h-8 text-xs underline"
                >
                  {i.destruido ? "não foi destruído" : "destruído"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {situacao}
      {!loot.levadoPor && !l.fugiu && !vazio ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-tinta-700 text-xs">
            Quem looteou
            <select value={para} onChange={(e) => setPara(e.target.value)} className={`${CAMPO} mt-1 w-auto`}>
              {personagens.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <button type="button" disabled={indo || !para} onClick={() => void lootear()} className={BOTAO_CHEIO}>
            Entregar o loot
          </button>
        </div>
      ) : null}
      {aviso ? <p className="text-heraldico-vermelho mt-1 text-xs">{aviso}</p> : null}
    </section>
  );
}
