"use client";

import { Fragment, useEffect, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { CONDICOES, type Lutador } from "@/lib/combate";
import { ataquesComLoot, ataquesDaFicha, comSinal, formulaDoDano, habilidades, lerAtaque, quantosAtaques } from "@/lib/ataques";
import { moedasPorExtenso, type Moedas } from "@/lib/ficha-viva";
import { ancora } from "@/lib/regras-ancora";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import type { AtaqueEscolhido } from "./RolagemDoAtaque";
import { Barra, COR_DO_ESTADO, type Cartao } from "./Palco";

/** Um golpe de uma habilidade sem jogada de ataque (sopro, grito): em quem, quanto e o que causou. */
export type Golpe = { alvo: string; acertou: boolean; dano: number; tipo: string; condicao: string };

export type FichaDoBestiario = {
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
export function fichasDoBestiario() {
  fichasCarregando ??= fetch("/monstros/fichas.json").then((r) => r.json() as Promise<Record<string, FichaDoBestiario>>);
  return fichasCarregando;
}

/** A ficha do Bestiário de uma criatura (null para as da casa). */
export function useFichaDoBestiario(slug: string): FichaDoBestiario | null | undefined {
  const [ficha, setFicha] = useState<FichaDoBestiario | null | undefined>(undefined);
  useEffect(() => {
    if (slug.startsWith("da-casa-")) {
      setFicha(null);
      return;
    }
    let vivo = true;
    void fichasDoBestiario()
      .then((f) => vivo && setFicha(f[slug] ?? null))
      .catch(() => vivo && setFicha(null));
    return () => {
      vivo = false;
    };
  }, [slug]);
  return ficha;
}

/** O limite de usos no nome: "(3/Dia)" → 3; "(Recarga 5–6)" → 1, que volta ao recarregar. */
function limite(nome: string): { max: number; recarga: boolean } | null {
  const dia = nome.match(/\((\d+)\/(dia|Dia)/);
  if (dia) return { max: Number(dia[1]), recarga: false };
  if (/Recarga/i.test(nome)) return { max: 1, recarga: true };
  return null;
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

/** A moldura de pergaminho da sanfona. */
function Moldura({ titulo, subtitulo, fechar, children }: { titulo: string; subtitulo?: ReactNode; fechar: () => void; children: ReactNode }) {
  return (
    <div className="border-dourado-600/60 bg-pergaminho-50 text-tinta-900 mx-auto max-w-3xl rounded-md border-2 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-titulo text-lg leading-tight font-bold">{titulo}</h3>
          {subtitulo ? <div className="text-tinta-700 text-sm">{subtitulo}</div> : null}
        </div>
        <button type="button" onClick={fechar} aria-label={`Fechar a ficha de ${titulo}`} className={`${BOTAO} size-11 shrink-0 px-0 text-lg`}>
          ×
        </button>
      </div>
      <div className="mt-3 space-y-4">{children}</div>
    </div>
  );
}

function Titulo({ children }: { children: ReactNode }) {
  return <h4 className="font-titulo text-heraldico-vermelho text-xs font-bold tracking-[0.16em] uppercase">{children}</h4>;
}

/**
 * As condições como etiquetas: cada uma com "×" (tirar: o Mestre, ou um
 * aliado que ajudou) e "tentar sair" (o teste de quem está preso nela).
 */
export function Condicoes({
  lista,
  tirar,
  rotuloTirar = "tirar",
  tentarSair,
  por,
}: {
  lista: string[];
  tirar?: (c: string) => void;
  rotuloTirar?: string;
  tentarSair?: (c: string, total: number, saiu: boolean) => void;
  /** Pôr uma condição nova (só o Mestre). */
  por?: (c: string) => void;
}) {
  const [testando, setTestando] = useState<string | null>(null);
  const [total, setTotal] = useState("");
  const t = Number.parseInt(total, 10);
  return (
    <div>
      {lista.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {lista.map((c) => (
            <li key={c} className="border-heraldico-vermelho/50 bg-heraldico-vermelho/10 flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-3 text-sm">
              <Link href={`/regras/glossario/#${ancora(`${c} [Condição]`)}`} target="_blank" className="font-semibold">
                {c}
              </Link>
              {tentarSair ? (
                <button type="button" onClick={() => setTestando(testando === c ? null : c)} className="text-tinta-700 min-h-8 px-1.5 text-xs underline">
                  tentar sair
                </button>
              ) : null}
              {tirar ? (
                <button type="button" onClick={() => tirar(c)} aria-label={`${rotuloTirar} ${c}`} title={rotuloTirar} className="text-heraldico-vermelho grid size-8 place-items-center rounded-full text-base font-bold hover:bg-black/5">
                  ×
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-tinta-500 text-sm italic">Nenhuma condição.</p>
      )}
      {testando && tentarSair ? (
        <div className="border-dourado-600/40 mt-2 flex flex-wrap items-center gap-2 rounded-sm border p-2">
          <span className="text-tinta-700 text-sm">Teste para sair de {testando}:</span>
          <button type="button" onClick={() => setTotal(String(1 + Math.floor(Math.random() * 20)))} className={`${BOTAO} min-h-9 px-3 text-xs`}>
            Rolar d20
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            aria-label="Total do teste"
            placeholder="total"
            className={`${CAMPO} max-w-20 text-center`}
          />
          <button
            type="button"
            disabled={!Number.isFinite(t)}
            onClick={() => (tentarSair(testando, t, true), setTestando(null), setTotal(""))}
            className={`${BOTAO_CHEIO} min-h-9 px-3 text-xs`}
          >
            Saiu
          </button>
          <button
            type="button"
            disabled={!Number.isFinite(t)}
            onClick={() => (tentarSair(testando, t, false), setTestando(null), setTotal(""))}
            className={`${BOTAO} min-h-9 px-3 text-xs`}
          >
            Não saiu
          </button>
        </div>
      ) : null}
      {por ? (
        <select value="" onChange={(e) => e.target.value && por(e.target.value)} aria-label="Pôr uma condição" className={`${CAMPO} mt-2 w-auto`}>
          <option value="">+ Pôr condição…</option>
          {CONDICOES.filter((c) => !lista.includes(c)).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

function DanoECura({ nome, dano, cura }: { nome: string; dano: (n: number) => void; cura: (n: number) => void }) {
  const [valor, setValor] = useState("");
  const n = Math.max(0, Math.floor(Number(valor) || 0));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={valor}
        placeholder="PV"
        aria-label={`Dano ou cura em ${nome}`}
        onChange={(e) => setValor(e.target.value)}
        className={`${CAMPO} max-w-20`}
      />
      <button type="button" disabled={!n} onClick={() => (dano(n), setValor(""))} className={`${BOTAO} px-3`}>
        Dano
      </button>
      <button type="button" disabled={!n} onClick={() => (cura(n), setValor(""))} className={`${BOTAO} px-3`}>
        Cura
      </button>
    </div>
  );
}

/** Um botão de ataque: nome, bônus, dano e de onde veio. */
function BotaoDeAtaque({ a, atacar, desligado }: { a: AtaqueEscolhido; atacar: () => void; desligado?: boolean }) {
  return (
    <li className="border-dourado-600/40 flex items-center gap-3 rounded-sm border p-2">
      <span className="min-w-0 flex-1">
        <span className="font-titulo block text-sm font-bold">{a.nome}</span>
        <span className="text-tinta-700 block text-xs">
          {comSinal(a.bonus)} para acertar · {formulaDoDano(a)}
          {a.extraDados ? "" : ` ${a.tipo}`}
          {a.condicao ? ` · pode deixar ${a.condicao}` : ""}
        </span>
        {a.origem ? <span className="text-dourado-600 block text-xs font-semibold">Do loot, {a.origem}</span> : null}
      </span>
      <button type="button" disabled={desligado} onClick={atacar} className={`${BOTAO_CHEIO} shrink-0 px-4`}>
        Atacar
      </button>
    </li>
  );
}

// ======================================================================
// A criatura, vista pelo Mestre
// ======================================================================

export function PainelDaCriatura({
  lutador: l,
  ehDaVez,
  ataquesNoTurno,
  alvos,
  fechar,
  dano,
  cura,
  condicao,
  tentarSair,
  mudar,
  atacar,
  usar,
  remover,
}: {
  lutador: Lutador;
  ehDaVez: boolean;
  ataquesNoTurno: number;
  alvos: { id: string; nome: string }[];
  fechar: () => void;
  dano: (n: number) => void;
  cura: (n: number) => void;
  condicao: (c: string, tirar: boolean) => void;
  tentarSair: (c: string, total: number, saiu: boolean) => void;
  mudar: (m: Partial<Lutador>, texto?: string, publico?: string) => void;
  atacar: (a: AtaqueEscolhido) => void;
  usar: (habilidade: string, golpes: Golpe[], usos?: Record<string, number>) => void;
  remover: () => void;
}) {
  const ficha = useFichaDoBestiario(l.slug);
  const [usando, setUsando] = useState<{ nome: string; texto: string } | null>(null);
  const usos = l.usos ?? {};
  const equipamento = ficha?.campos.find((c) => c.rotulo === "Equipamento")?.valor.split(/,\s*/) ?? [];
  const ataques: AtaqueEscolhido[] = ficha
    ? ataquesComLoot(ataquesDaFicha(ficha.secoes), l.loot?.itens, equipamento).map((a) => ({
        ...a,
        condicaoCerta: Boolean(a.condicao) && !/Teste de Resistência/.test(a.texto ?? ""),
      }))
    : [];
  const multiplos = ficha?.secoes.flatMap((s) => habilidades(s.texto)).find((h) => /Ataques Múltiplos/.test(h.nome));
  const porTurno = multiplos ? quantosAtaques(multiplos.texto) : 1;

  return (
    <Moldura
      titulo={l.nome}
      fechar={fechar}
      subtitulo={
        <>
          <span className="font-semibold tabular-nums">
            {l.pv}/{l.pvMaximo} PV · CA {l.ca}
          </span>
          {ficha ? <span> · {ficha.linha}</span> : null}
          {l.fugiu ? <span className="text-heraldico-vermelho"> · fugiu</span> : null}
          <span className="mt-1 block w-48">
            <Barra pv={l.pv} max={l.pvMaximo} />
          </span>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Titulo>Pontos de vida</Titulo>
          <div className="mt-1">
            <DanoECura nome={l.nome} dano={dano} cura={cura} />
          </div>
        </div>
        <div>
          <Titulo>Condições</Titulo>
          <div className="mt-1">
            <Condicoes lista={l.condicoes} tirar={(c) => condicao(c, true)} tentarSair={tentarSair} por={(c) => condicao(c, false)} />
          </div>
        </div>
      </div>

      {/* Os ataques: tocar em Atacar e depois no alvo */}
      <div>
        <Titulo>Ataques</Titulo>
        {multiplos ? (
          <p className="text-tinta-700 mt-1 text-sm">
            <strong>Ataques Múltiplos:</strong> {porTurno} por turno.{" "}
            {ehDaVez ? <span className={ataquesNoTurno >= porTurno ? "text-heraldico-vermelho font-semibold" : ""}>Já fez {ataquesNoTurno}.</span> : null}
          </p>
        ) : null}
        {ataques.length ? (
          <ul className="mt-2 space-y-2">
            {ataques.map((a, i) => (
              <BotaoDeAtaque key={`${a.nome}-${i}`} a={a} atacar={() => atacar(a)} />
            ))}
          </ul>
        ) : ficha === undefined ? (
          <p className="text-tinta-500 mt-1 text-sm italic">Abrindo a ficha…</p>
        ) : (
          <AtaqueLivre atacar={atacar} />
        )}
      </div>

      {usando ? (
        <UsarHabilidade
          habilidade={usando}
          alvos={alvos}
          limitada={limite(usando.nome)}
          usadas={usos[usando.nome] ?? 0}
          cancelar={() => setUsando(null)}
          confirmar={(golpes) => {
            const lim = limite(usando.nome);
            usar(usando.nome, golpes, lim ? { ...usos, [usando.nome]: (usos[usando.nome] ?? 0) + 1 } : undefined);
            setUsando(null);
          }}
        />
      ) : null}

      {ficha ? (
        <>
          {/* As outras habilidades e os traços */}
          {ficha.secoes.map((s) => {
            const lista = habilidades(s.texto).filter((h) => !(h.nome && lerAtaque(h.nome, h.texto)) && !/Ataques Múltiplos/.test(h.nome));
            if (!lista.length) return null;
            return (
              <section key={s.titulo}>
                <Titulo>{s.titulo}</Titulo>
                <ul className="mt-1 space-y-2">
                  {lista.map((h, i) => {
                    const lim = h.nome ? limite(h.nome) : null;
                    const usadas = usos[h.nome] ?? 0;
                    const esgotada = lim ? usadas >= lim.max : false;
                    return (
                      <li key={`${h.nome}-${i}`} className="text-sm leading-relaxed">
                        {h.nome ? <strong>{h.nome}. </strong> : null}
                        <Texto texto={h.texto} />
                        {h.nome && (s.titulo !== "Traços" || lim) ? (
                          <span className="mt-1 flex flex-wrap items-center gap-2">
                            <button type="button" disabled={esgotada} onClick={() => setUsando(h)} className={`${BOTAO} min-h-9 px-3 text-xs`}>
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
                                  mudar({ usos: { ...usos, [h.nome]: lim.recarga ? 0 : usadas - 1 } }, lim.recarga ? `${l.nome}: ${h.nome} recarregou.` : undefined)
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
            );
          })}

          {/* Atributos, perícias, imunidades, sentidos */}
          <section>
            <Titulo>Ficha</Titulo>
            <div className="mt-1 grid grid-cols-6 gap-1 text-center text-xs">
              {ficha.atributos.map((a) => (
                <div key={a.sigla} className="border-dourado-600/30 rounded-sm border py-1">
                  <div className="font-titulo text-tinta-500 font-bold">{a.sigla}</div>
                  <div className="font-semibold tabular-nums">{a.valor}</div>
                  <div className="text-tinta-700 tabular-nums">{a.mod}</div>
                  <div className="text-tinta-500 text-[0.6rem] tabular-nums">res {a.save}</div>
                </div>
              ))}
            </div>
            <ul className="text-tinta-700 mt-2 space-y-0.5 text-sm">
              <li>
                <strong>Deslocamento</strong> {ficha.deslocamento} · <strong>ND</strong> {ficha.nd} ({ficha.xp} XP)
              </li>
              {ficha.campos.map((c) => (
                <li key={c.rotulo}>
                  <strong>{c.rotulo}</strong> {c.valor}
                </li>
              ))}
            </ul>
            <Link href={`/monstros/${l.slug}/`} target="_blank" className="text-heraldico-vermelho mt-2 inline-block text-sm underline">
              Abrir a página da criatura
            </Link>
          </section>
        </>
      ) : ficha === null ? (
        <section>
          <p className="text-tinta-700 text-sm">Criatura da casa: sem ficha no Bestiário.</p>
          <HabilidadeLivre usar={(nome) => setUsando({ nome, texto: "" })} />
        </section>
      ) : null}

      <Loot lutador={l} mudar={mudar} />

      <div className="border-dourado-600/30 flex flex-wrap gap-2 border-t pt-3">
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
    </Moldura>
  );
}

/** Para criatura sem ficha: um ataque escrito na hora. */
function AtaqueLivre({ atacar }: { atacar: (a: AtaqueEscolhido) => void }) {
  const [a, setA] = useState({ nome: "", bonus: "4", dados: "1d6", mod: "2", tipo: "" });
  const id = useId();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!a.nome.trim()) return;
        atacar({ nome: a.nome.trim(), bonus: Number(a.bonus) || 0, dados: a.dados.trim(), mod: Number(a.mod) || 0, tipo: a.tipo.trim() });
      }}
      className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-6"
    >
      <label htmlFor={`${id}-n`} className="text-tinta-700 col-span-2 text-xs">
        Ataque
        <input id={`${id}-n`} value={a.nome} onChange={(e) => setA({ ...a, nome: e.target.value })} placeholder="Garra" className={`${CAMPO} mt-1`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Acerto +
        <input type="number" value={a.bonus} onChange={(e) => setA({ ...a, bonus: e.target.value })} className={`${CAMPO} mt-1 px-1 text-center`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Dados
        <input value={a.dados} onChange={(e) => setA({ ...a, dados: e.target.value })} className={`${CAMPO} mt-1 px-1 text-center`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Dano +
        <input type="number" value={a.mod} onChange={(e) => setA({ ...a, mod: e.target.value })} className={`${CAMPO} mt-1 px-1 text-center`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Tipo
        <input value={a.tipo} onChange={(e) => setA({ ...a, tipo: e.target.value })} placeholder="cortante" className={`${CAMPO} mt-1 px-1`} />
      </label>
      <button type="submit" disabled={!a.nome.trim()} className={`${BOTAO_CHEIO} col-span-2 sm:col-span-6`}>
        Atacar
      </button>
    </form>
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

/** Uma habilidade sem jogada de ataque: cada alvo com o dano, o tipo e o efeito. */
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
  confirmar: (golpes: Golpe[]) => void;
}) {
  const dano = Number(habilidade.texto.match(/(\d+) \(\d+d\d+[^)]*\) de dano/)?.[1] ?? 0);
  const tipo = habilidade.texto.match(/de dano (\p{L}+)/u)?.[1]?.toLowerCase() ?? "";
  const condicao = CONDICOES.find((c) => new RegExp(`condição ${c}\\b`).test(habilidade.texto)) ?? "";
  const [golpes, setGolpes] = useState<Golpe[]>([]);
  const marcado = (id: string) => golpes.find((g) => g.alvo === id);
  const mudar = (id: string, m: Partial<Golpe>) => setGolpes((g) => g.map((x) => (x.alvo === id ? { ...x, ...m } : x)));

  return (
    <section className="border-heraldico-vermelho/50 bg-heraldico-vermelho/5 rounded-sm border-2 p-3">
      <h4 className="font-titulo font-bold">Usar {habilidade.nome}</h4>
      {limitada ? (
        <p className="text-tinta-700 text-xs">{limitada.recarga ? "Depois de usar, fica esperando a recarga." : `Uso ${usadas + 1} de ${limitada.max}.`}</p>
      ) : null}
      <p className="text-tinta-700 mt-1 text-xs">Marque quem foi atingido. Quem passou no teste: desmarque &quot;pegou&quot; ou ponha metade do dano.</p>
      <ul className="mt-2 space-y-1.5">
        {alvos.map((a) => {
          const g = marcado(a.id);
          return (
            <li key={a.id} className="border-dourado-600/30 flex flex-wrap items-center gap-2 rounded-sm border p-1.5">
              <label className="flex min-h-9 flex-1 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(g)}
                  onChange={(e) =>
                    setGolpes((x) => (e.target.checked ? [...x, { alvo: a.id, acertou: true, dano, tipo, condicao }] : x.filter((y) => y.alvo !== a.id)))
                  }
                  className="accent-heraldico-vermelho size-5"
                />
                {a.nome}
              </label>
              {g ? (
                <>
                  <label className="text-tinta-700 flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={g.acertou} onChange={(e) => mudar(a.id, { acertou: e.target.checked })} className="accent-heraldico-vermelho size-4" />
                    pegou
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={g.dano}
                    disabled={!g.acertou}
                    aria-label={`Dano em ${a.nome}`}
                    onChange={(e) => mudar(a.id, { dano: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                    className={`${CAMPO} max-w-20 px-1 text-center`}
                  />
                  <button type="button" disabled={!g.acertou} onClick={() => mudar(a.id, { dano: Math.floor(g.dano / 2) })} className="text-tinta-700 min-h-9 text-xs underline">
                    metade
                  </button>
                  <select value={g.condicao} disabled={!g.acertou} onChange={(e) => mudar(a.id, { condicao: e.target.value })} aria-label="Efeito" className={`${CAMPO} w-auto`}>
                    <option value="">sem efeito</option>
                    {CONDICOES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
      <label className="text-tinta-700 mt-2 block text-xs">
        Tipo do dano
        <input
          value={golpes[0]?.tipo ?? tipo}
          onChange={(e) => setGolpes((g) => g.map((x) => ({ ...x, tipo: e.target.value })))}
          className={`${CAMPO} mt-1 max-w-48`}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => confirmar(golpes)} className={BOTAO_CHEIO}>
          {golpes.length ? "Confirmar" : "Só marcar o uso"}
        </button>
        <button type="button" onClick={cancelar} className={`${BOTAO} px-3`}>
          Cancelar
        </button>
      </div>
    </section>
  );
}

/** O que a criatura carrega. A entrega é no fim do combate (ou na hora, se o Mestre quiser). */
function Loot({ lutador: l, mudar }: { lutador: Lutador; mudar: (m: Partial<Lutador>, texto?: string, publico?: string) => void }) {
  const loot = l.loot;
  if (!loot) {
    return (
      <section>
        <Titulo>O que carrega</Titulo>
        <p className="text-tinta-500 mt-1 text-sm italic">Nada além do XP.</p>
      </section>
    );
  }
  const temMoedas = Object.values(loot.moedas).some((v) => (v ?? 0) > 0);
  return (
    <section>
      <Titulo>O que carrega</Titulo>
      {!temMoedas && !loot.itens.length ? <p className="text-tinta-500 mt-1 text-sm italic">Nada de valor.</p> : null}
      <ul className="mt-1 space-y-1 text-sm">
        {temMoedas ? <li>{moedasPorExtenso(loot.moedas as Moedas)}</li> : null}
        {loot.itens.map((i, k) => (
          <li key={`${i.nome}-${k}`} className="flex flex-wrap items-center gap-2">
            <span className={i.destruido ? "text-tinta-500 line-through" : ""}>
              {i.nome}
              {i.arma && !i.destruido ? <span className="text-dourado-600 ml-1 text-xs font-semibold">(em uso)</span> : null}
            </span>
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
      <p className="text-tinta-500 mt-1 text-xs">
        {loot.levadoPor
          ? "Já repartido."
          : l.fugiu
            ? "Fugiu e levou tudo junto."
            : "Fica no chão quando ela cair. No fim do combate você escolhe para quem vai cada coisa."}
      </p>
    </section>
  );
}

// ======================================================================
// Um aventureiro: o Mestre vê tudo; o dono age; o aliado ajuda
// ======================================================================

export function PainelDoAventureiro({
  c,
  armas,
  quemOlha,
  ehDaVez,
  fechar,
  atacar,
  tirarCondicao,
  tentarSair,
  porCondicao,
  dano,
  cura,
  abrirFicha,
  terminarTurno,
  remover,
  magias,
  pararConcentracao,
}: {
  c: Cartao;
  armas: AtaqueEscolhido[];
  quemOlha: "mestre" | "dono" | "aliado";
  ehDaVez: boolean;
  fechar: () => void;
  atacar?: (a: AtaqueEscolhido) => void;
  tirarCondicao?: (cond: string) => void;
  tentarSair?: (cond: string, total: number, saiu: boolean) => void;
  porCondicao?: (cond: string) => void;
  dano?: (n: number) => void;
  cura?: (n: number) => void;
  abrirFicha: () => void;
  terminarTurno?: () => void;
  remover?: () => void;
  /** As magias, já montadas (só para o dono e o Mestre). */
  magias?: ReactNode;
  pararConcentracao?: () => void;
}) {
  return (
    <Moldura
      titulo={quemOlha === "dono" ? `${c.nome} (você)` : c.nome}
      fechar={fechar}
      subtitulo={
        <>
          <span className="font-semibold tabular-nums">
            {c.pv !== undefined ? `${c.pv}/${c.pvMaximo} PV` : c.estado}
            {c.ca ? ` · CA ${c.ca}` : ""}
          </span>
          {ehDaVez ? (
            <span className="text-heraldico-vermelho font-semibold"> · {quemOlha === "dono" ? "é a sua vez" : `é a vez de ${c.nome.split(" ")[0]}`}</span>
          ) : null}
          {c.pv !== undefined && c.pvMaximo ? (
            <span className="mt-1 block w-48">
              <Barra pv={c.pv} max={c.pvMaximo} />
            </span>
          ) : null}
          {c.concentrando ? (
            <span className="mt-1 block text-xs">
              Concentrado em <em>{c.concentrando}</em>
              {pararConcentracao ? (
                <button type="button" onClick={pararConcentracao} className="text-heraldico-vermelho ml-2 min-h-8 underline">
                  parar
                </button>
              ) : null}
            </span>
          ) : null}
        </>
      }
    >
      {atacar ? (
        <div>
          <Titulo>Atacar</Titulo>
          <p className="text-tinta-500 mt-1 text-xs">Escolha a arma e depois toque no alvo, na arena.</p>
          <ul className="mt-2 space-y-2">
            {armas.map((a) => (
              <BotaoDeAtaque key={a.nome} a={a} atacar={() => atacar(a)} />
            ))}
          </ul>
          <OutroAtaque atacar={atacar} />
        </div>
      ) : null}

      {magias ? (
        <div>
          <Titulo>Magias</Titulo>
          <div className="mt-1">{magias}</div>
        </div>
      ) : null}

      <div>
        <Titulo>Condições</Titulo>
        <div className="mt-1">
          <Condicoes
            lista={c.condicoes}
            tirar={tirarCondicao}
            rotuloTirar={quemOlha === "aliado" ? "ajudar a tirar" : "tirar"}
            tentarSair={tentarSair}
            por={porCondicao}
          />
        </div>
        {quemOlha === "aliado" && c.condicoes.length ? (
          <p className="text-tinta-500 mt-1 text-xs">Ajudou {c.nome.split(" ")[0]} a se levantar ou a se soltar? Toque no × da condição.</p>
        ) : null}
      </div>

      {dano && cura ? (
        <div>
          <Titulo>Pontos de vida</Titulo>
          <div className="mt-1">
            <DanoECura nome={c.nome} dano={dano} cura={cura} />
          </div>
        </div>
      ) : null}

      <div className="border-dourado-600/30 flex flex-wrap gap-2 border-t pt-3">
        {terminarTurno && ehDaVez ? (
          <button type="button" onClick={terminarTurno} className={BOTAO_CHEIO}>
            Terminar {quemOlha === "dono" ? "meu turno" : "o turno"}
          </button>
        ) : null}
        <button type="button" onClick={abrirFicha} className={`${BOTAO} px-3`}>
          {quemOlha === "aliado" ? "Ver a ficha" : quemOlha === "dono" ? "Minha ficha inteira" : "Ficha inteira"}
        </button>
        {remover ? (
          <button type="button" onClick={remover} className={`${BOTAO} px-3 text-xs`}>
            Tirar do combate
          </button>
        ) : null}
      </div>
    </Moldura>
  );
}

/** Magia de ataque, arma improvisada, ataque desarmado: o que não está na lista. */
function OutroAtaque({ atacar }: { atacar: (a: AtaqueEscolhido) => void }) {
  const [aberto, setAberto] = useState(false);
  const [a, setA] = useState({ nome: "", bonus: "", dados: "", mod: "", tipo: "" });
  if (!aberto)
    return (
      <button type="button" onClick={() => setAberto(true)} className="text-tinta-700 mt-2 min-h-9 text-xs underline">
        + Outro ataque (magia, improviso)
      </button>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!a.nome.trim()) return;
        atacar({ nome: a.nome.trim(), bonus: Number(a.bonus) || 0, dados: a.dados.trim(), mod: Number(a.mod) || 0, tipo: a.tipo.trim() });
      }}
      className="border-dourado-600/30 mt-2 grid grid-cols-2 gap-2 rounded-sm border p-2 sm:grid-cols-6"
    >
      <label className="text-tinta-700 col-span-2 text-xs">
        Nome
        <input value={a.nome} onChange={(e) => setA({ ...a, nome: e.target.value })} placeholder="Raio de Fogo" className={`${CAMPO} mt-1`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Acerto +
        <input type="number" value={a.bonus} onChange={(e) => setA({ ...a, bonus: e.target.value })} className={`${CAMPO} mt-1 px-1 text-center`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Dados
        <input value={a.dados} onChange={(e) => setA({ ...a, dados: e.target.value })} placeholder="1d10" className={`${CAMPO} mt-1 px-1 text-center`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Dano +
        <input type="number" value={a.mod} onChange={(e) => setA({ ...a, mod: e.target.value })} className={`${CAMPO} mt-1 px-1 text-center`} />
      </label>
      <label className="text-tinta-700 text-xs">
        Tipo
        <input value={a.tipo} onChange={(e) => setA({ ...a, tipo: e.target.value })} placeholder="ígneo" className={`${CAMPO} mt-1 px-1`} />
      </label>
      <button type="submit" disabled={!a.nome.trim()} className={`${BOTAO_CHEIO} col-span-2 sm:col-span-6`}>
        Escolher o alvo
      </button>
    </form>
  );
}

// ======================================================================
// Um inimigo, visto pelo jogador
// ======================================================================

export function PainelDoInimigo({ c, fechar, atacarEste }: { c: Cartao; fechar: () => void; atacarEste?: () => void }) {
  return (
    <Moldura
      titulo={c.nome}
      fechar={fechar}
      subtitulo={<span className={`font-semibold ${COR_DO_ESTADO[c.estado]?.replace("text-[#7fd17a]", "text-[#2f6b2a]") ?? ""}`}>{c.estado}</span>}
    >
      <div>
        <Titulo>Condições</Titulo>
        <div className="mt-1">
          <Condicoes lista={c.condicoes} />
        </div>
      </div>
      <p className="text-tinta-500 text-sm">CA e PV ficam com o Mestre.</p>
      {atacarEste ? (
        <button type="button" onClick={atacarEste} className={BOTAO_CHEIO}>
          Atacar {c.nome.split(" ")[0]}
        </button>
      ) : null}
    </Moldura>
  );
}
