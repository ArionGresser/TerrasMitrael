"use client";

import { useState } from "react";
import Link from "next/link";
import { CONDICOES, d20, type AcaoDoJogador, type MagiaPendente } from "@/lib/combate";
import { comSinal } from "@/lib/ataques";
import { dadosDaMagia, rolarFormula, type MagiaNaArena } from "@/lib/magias-arena";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import { fichasDoBestiario, type Golpe } from "./PainelDoLutador";
import type { AtaqueEscolhido } from "./RolagemDoAtaque";

export type Conjuracao = Extract<AcaoDoJogador, { tipo: "magia" }>;

export type MagiasDoPersonagem = {
  lista: MagiaNaArena[] | null;
  espacos: Record<string, number>;
  gastos: Record<string, number>;
  pacto: boolean;
  nivel: number;
  conj: { mod: number; cd: number; ataque: number } | null;
  /** Os truques que somam o Carisma no dano (Explosão Agonizante), pelo nome. */
  agonizantes: string[];
};

const ROTULO = "font-titulo text-tinta-900 text-xs font-semibold tracking-[0.12em] uppercase";

/**
 * As magias de um personagem na arena: os espaços que restam e um botão
 * de conjurar para cada magia. Conjurar gasta o espaço (na tela do
 * Mestre, para o desfazer devolver) e segue pelo jeito da magia: ataque
 * vai para a mira, salvaguarda vai para o Mestre resolver, cura e dano
 * sem teste valem na hora.
 */
export function MagiasDoAventureiro({
  autor,
  dados,
  alvos,
  conjurar,
  mirar,
}: {
  autor: string;
  dados: MagiasDoPersonagem;
  alvos: { id: string; nome: string; tipo: "personagem" | "criatura" }[];
  conjurar: (c: Conjuracao) => void;
  mirar: (a: AtaqueEscolhido, vezes: number) => void;
}) {
  const [aberta, setAberta] = useState<string | null>(null);
  const { lista, espacos, gastos, pacto } = dados;
  if (lista === null) return <p className="text-tinta-500 text-sm italic">Abrindo o grimório…</p>;
  if (!lista.length) return null;

  const livres = (c: string) => Math.max(0, (espacos[c] ?? 0) - (gastos[c] ?? 0));
  const circulos = Object.keys(espacos).sort();
  const porCirculo = new Map<number, MagiaNaArena[]>();
  for (const m of lista) porCirculo.set(m.nivel, [...(porCirculo.get(m.nivel) ?? []), m]);

  return (
    <div>
      {circulos.length ? (
        <p className="text-tinta-700 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {circulos.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className="text-xs">{c}º{pacto ? " (pacto)" : ""}</span>
              <span aria-label={`${livres(c)} de ${espacos[c]} espaços de ${c}º círculo`} className="inline-flex gap-0.5">
                {Array.from({ length: espacos[c] }, (_, i) => (
                  <span key={i} className={`inline-block size-3 rounded-full border border-[#5b3a8a] ${i < livres(c) ? "bg-[#7b4fb8]" : "bg-transparent"}`} />
                ))}
              </span>
            </span>
          ))}
        </p>
      ) : null}
      <ul className="mt-2 space-y-1.5">
        {[...porCirculo.entries()].map(([nivel, magias]) => (
          <li key={nivel}>
            <p className="text-tinta-500 text-[0.7rem] font-semibold tracking-wider uppercase">{nivel === 0 ? "Truques" : `${nivel}º círculo`}</p>
            <ul className="mt-1 space-y-1.5">
              {magias.map((m) => {
                const semEspaco = m.nivel > 0 && !circulos.some((c) => Number(c) >= m.nivel && livres(c) > 0);
                return (
                  <li key={m.slug} className="border-dourado-600/30 rounded-sm border">
                    <div className="flex flex-wrap items-center gap-2 px-2 py-1.5">
                      <span className="min-w-0 flex-1 text-sm">
                        <Link href={`/magias/${m.slug}/`} target="_blank" className="text-tinta-900 font-semibold italic hover:underline">
                          {m.nome}
                        </Link>
                        <span className="text-tinta-500 block text-xs">
                          {m.tempo}
                          {m.concentracao ? " · concentração" : ""}
                          {m.modo === "salvaguarda" ? ` · salvaguarda de ${m.salvaguarda}` : m.modo === "ataque" ? " · ataque mágico" : ""}
                        </span>
                      </span>
                      <button
                        type="button"
                        disabled={semEspaco}
                        aria-expanded={aberta === m.slug}
                        onClick={() => setAberta((a) => (a === m.slug ? null : m.slug))}
                        className={`${BOTAO} min-h-10 px-3 text-xs`}
                      >
                        {semEspaco ? "Sem espaço" : aberta === m.slug ? "Fechar" : "Conjurar"}
                      </button>
                    </div>
                    {aberta === m.slug ? (
                      <Conjurar
                        autor={autor}
                        m={m}
                        dados={dados}
                        alvos={alvos}
                        livres={livres}
                        conjurar={(c) => {
                          conjurar(c);
                          setAberta(null);
                        }}
                        mirar={mirar}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Conjurar({
  autor,
  m,
  dados,
  alvos,
  livres,
  conjurar,
  mirar,
}: {
  autor: string;
  m: MagiaNaArena;
  dados: MagiasDoPersonagem;
  alvos: { id: string; nome: string; tipo: "personagem" | "criatura" }[];
  livres: (c: string) => number;
  conjurar: (c: Conjuracao) => void;
  mirar: (a: AtaqueEscolhido, vezes: number) => void;
}) {
  // O círculo: o do pacto, ou o menor livre que dá
  const opcoes = Object.keys(dados.espacos)
    .map(Number)
    .filter((c) => c >= m.nivel && livres(String(c)) > 0)
    .sort((a, b) => a - b);
  const [circulo, setCirculo] = useState(m.nivel === 0 ? 0 : (opcoes[0] ?? m.nivel));
  const { dados: formula, feixes, vezes } = dadosDaMagia(m, dados.nivel, circulo);
  const agoniza = dados.agonizantes.includes(m.nome);
  const somaFixa = (m.fixo ?? 0) + (agoniza && dados.conj ? dados.conj.mod : 0) + (m.modo === "cura" && m.somaMod && dados.conj ? dados.conj.mod : 0);
  const textoDoDano = formula ? `${formula}${somaFixa ? ` ${somaFixa > 0 ? "+" : "−"} ${Math.abs(somaFixa)}` : ""}${m.tipo && m.modo !== "cura" ? ` ${m.tipo}` : ""}` : "";

  const padraoDosAlvos = m.modo === "cura" ? alvos.filter((a) => a.id === autor).map((a) => a.id) : [];
  const [escolhidos, setEscolhidos] = useState<string[]>(padraoDosAlvos);
  const [valor, setValor] = useState("");
  const [vezesPor, setVezesPor] = useState<Record<string, number>>({});
  const [condicao, setCondicao] = useState(m.condicao ?? "");

  const base = { tipo: "magia" as const, autor, magia: m.nome, circulo, concentracao: m.concentracao, modo: m.modo };
  const rolar = () => setValor(String(rolarFormula(formula ?? "0").total + somaFixa));
  const n = Number.parseInt(valor, 10);
  const temValor = Number.isFinite(n);
  const alterna = (id: string) => setEscolhidos((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const escolhaDoCirculo =
    m.nivel > 0 && !dados.pacto && opcoes.length > 1 ? (
      <label className="text-tinta-700 flex items-center gap-2 text-xs">
        Espaço de
        <select value={circulo} onChange={(e) => setCirculo(Number(e.target.value))} className={`${CAMPO} w-auto`}>
          {opcoes.map((c) => (
            <option key={c} value={c}>
              {c}º círculo ({livres(String(c))} livre{livres(String(c)) === 1 ? "" : "s"})
            </option>
          ))}
        </select>
      </label>
    ) : m.nivel > 0 ? (
      <p className="text-tinta-700 text-xs">Gasta um espaço de {circulo}º círculo.</p>
    ) : null;

  const listaDeAlvos = (
    <ul className="grid gap-1 sm:grid-cols-2">
      {alvos.map((a) => (
        <li key={a.id}>
          <label className="flex min-h-9 items-center gap-2 text-sm">
            <input type="checkbox" checked={escolhidos.includes(a.id)} onChange={() => alterna(a.id)} className="accent-heraldico-vermelho size-4" />
            {a.nome}
            {m.vezes && escolhidos.includes(a.id) ? (
              <input
                type="number"
                min={1}
                max={vezes}
                value={vezesPor[a.id] ?? 1}
                onChange={(e) => setVezesPor({ ...vezesPor, [a.id]: Math.max(1, Math.min(vezes, Number(e.target.value) || 1)) })}
                aria-label={`Quantos em ${a.nome}`}
                className={`${CAMPO} max-w-16 px-1 text-center`}
              />
            ) : null}
          </label>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="border-dourado-600/30 space-y-2 border-t px-2 py-2">
      <p className="text-tinta-700 text-xs">{m.efeito}</p>
      {escolhaDoCirculo}

      {m.modo === "ataque" ? (
        <>
          <p className="text-tinta-700 text-sm">
            Ataque {comSinal(dados.conj?.ataque ?? 0)}, dano {textoDoDano}
            {agoniza ? " (Explosão Agonizante)" : ""}
            {feixes * vezes > 1 ? `, ${feixes * vezes} ataques` : ""}.
          </p>
          <button
            type="button"
            onClick={() => {
              conjurar({ ...base });
              mirar(
                {
                  nome: m.nome,
                  bonus: dados.conj?.ataque ?? 0,
                  dados: formula ?? "",
                  mod: somaFixa,
                  tipo: m.tipo ?? "",
                  condicao: m.condicao,
                },
                feixes * vezes
              );
            }}
            className={BOTAO_CHEIO}
          >
            Conjurar e escolher o alvo
          </button>
        </>
      ) : m.modo === "salvaguarda" ? (
        <>
          <p className="text-tinta-700 text-sm">
            CD {dados.conj?.cd ?? "?"} de {m.salvaguarda}
            {textoDoDano ? `, ${textoDoDano}` : ""}
            {m.metade ? " (metade se passar)" : ""}. O Mestre rola as salvaguardas.
          </p>
          <p className={ROTULO}>Quem está na área</p>
          {listaDeAlvos}
          {formula ? <ValorRolado rotulo="Dano" valor={valor} setValor={setValor} rolar={rolar} formula={textoDoDano} /> : null}
          <SeletorDeCondicao valor={condicao} mudar={setCondicao} />
          <button
            type="button"
            disabled={!escolhidos.length || (!!formula && !temValor)}
            onClick={() =>
              conjurar({
                ...base,
                alvos: escolhidos.map((id) => ({ id })),
                cd: dados.conj?.cd ?? 10,
                salvaguarda: m.salvaguarda,
                metade: m.metade,
                dano: temValor ? n : 0,
                tipoDano: m.tipo,
                condicao: condicao || undefined,
              })
            }
            className={BOTAO_CHEIO}
          >
            Conjurar
          </button>
        </>
      ) : m.modo === "direto" || m.modo === "cura" ? (
        <>
          <p className="text-tinta-700 text-sm">
            {m.modo === "cura" ? "Cura" : "Dano"} {textoDoDano}
            {vezes > 1 ? ` cada, ${vezes} no total (divida entre os alvos)` : ""}. Vale na hora.
          </p>
          <p className={ROTULO}>{m.modo === "cura" ? "Quem recebe" : "Em quem"}</p>
          {listaDeAlvos}
          <button
            type="button"
            disabled={!escolhidos.length}
            onClick={() =>
              conjurar({
                ...base,
                tipoDano: m.tipo,
                alvos: escolhidos.map((id) => {
                  // Cada dardo rola o seu; a cura em vários usa uma rolagem só, como a regra
                  const quantos = m.vezes ? (vezesPor[id] ?? 1) : 1;
                  let total = 0;
                  for (let i = 0; i < quantos; i++) total += rolarFormula(formula ?? "0").total + somaFixa;
                  return { id, valor: Math.max(0, total) };
                }),
              })
            }
            className={BOTAO_CHEIO}
          >
            Conjurar e rolar
          </button>
        </>
      ) : (
        <>
          {m.dados && m.tipo ? (
            <p className="text-tinta-700 text-sm">
              Soma {m.dados} de dano {m.tipo} nos acertos: role junto quando acertar.
            </p>
          ) : null}
          <button type="button" onClick={() => conjurar({ ...base })} className={BOTAO_CHEIO}>
            Conjurar
          </button>
        </>
      )}
    </div>
  );
}

function ValorRolado({ rotulo, valor, setValor, rolar, formula }: { rotulo: string; valor: string; setValor: (v: string) => void; rolar: () => void; formula: string }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-tinta-700 text-xs">
        {rotulo} ({formula})
        <input type="number" inputMode="numeric" min={0} value={valor} onChange={(e) => setValor(e.target.value)} className={`${CAMPO} mt-1 max-w-24 text-center`} />
      </label>
      <button type="button" onClick={rolar} className={`${BOTAO} min-h-11 px-3`}>
        ⚄ Rolar
      </button>
    </div>
  );
}

function SeletorDeCondicao({ valor, mudar }: { valor: string; mudar: (v: string) => void }) {
  return (
    <label className="text-tinta-700 block text-xs">
      Quem falha fica
      <select value={valor} onChange={(e) => mudar(e.target.value)} className={`${CAMPO} mt-1 w-auto`}>
        <option value="">sem condição</option>
        {CONDICOES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

// ======================================================================
// O Mestre resolve a salvaguarda
// ======================================================================

const SIGLA: Record<string, string> = { Força: "FOR", Destreza: "DES", Constituição: "CON", Inteligência: "INT", Sabedoria: "SAB", Carisma: "CAR" };

/**
 * Uma magia de salvaguarda que chegou: o Mestre rola (ou digita) a
 * salvaguarda de cada alvo, e o site diz quem passou contra a CD. Quem
 * passou sofre metade, se a magia diz isso, ou nada.
 */
export function ResolverMagia({
  p,
  nomes,
  slugs,
  autor,
  aplicar,
  descartar,
}: {
  p: MagiaPendente;
  nomes: Record<string, string>;
  slugs: Record<string, { slug: string; criatura: boolean }>;
  autor: string;
  aplicar: (golpes: Golpe[]) => void;
  descartar: () => void;
}) {
  const [testes, setTestes] = useState<Record<string, string>>({});

  async function rolarTodos() {
    let fichas: Record<string, { atributos: { sigla: string; save: string }[] }> = {};
    try {
      fichas = await fichasDoBestiario();
    } catch {
      fichas = {};
    }
    const novos: Record<string, string> = { ...testes };
    for (const id of p.alvos) {
      const s = slugs[id];
      const at = s?.criatura ? fichas[s.slug]?.atributos.find((a) => a.sigla.toUpperCase() === SIGLA[p.salvaguarda]) : undefined;
      const bonus = at ? Number(at.save.replace("−", "-")) || 0 : 0;
      if (s?.criatura) novos[id] = String(d20() + bonus);
    }
    setTestes(novos);
  }

  const resultado = (id: string): "passou" | "falhou" | null => {
    const n = Number.parseInt(testes[id] ?? "", 10);
    return Number.isFinite(n) ? (n >= p.cd ? "passou" : "falhou") : null;
  };
  const prontos = p.alvos.every((id) => resultado(id) !== null);

  return (
    <section className="border-heraldico-vermelho/50 bg-heraldico-vermelho/5 rounded-sm border-2 p-3">
      <h4 className="font-titulo text-tinta-900 font-bold">
        {autor} conjurou {p.magia}
      </h4>
      <p className="text-tinta-700 text-sm">
        CD {p.cd} de {p.salvaguarda}
        {p.dano ? `, ${p.dano} de dano ${p.tipo}` : ""}
        {p.metade ? " (metade se passar)" : ""}
        {p.condicao ? `; quem falha fica ${p.condicao}` : ""}.
      </p>
      <ul className="mt-2 space-y-1.5">
        {p.alvos.map((id) => {
          const r = resultado(id);
          return (
            <li key={id} className="border-dourado-600/30 flex flex-wrap items-center gap-2 rounded-sm border p-1.5 text-sm">
              <span className="min-w-0 flex-1">{nomes[id] ?? id}</span>
              <input
                type="number"
                inputMode="numeric"
                value={testes[id] ?? ""}
                onChange={(e) => setTestes({ ...testes, [id]: e.target.value })}
                aria-label={`Salvaguarda de ${nomes[id] ?? id}`}
                placeholder="total"
                className={`${CAMPO} max-w-20 px-1 text-center`}
              />
              <span className={`w-14 text-xs font-semibold ${r === "passou" ? "text-[#2f6b2a]" : r === "falhou" ? "text-heraldico-vermelho" : "text-tinta-500"}`}>
                {r ?? "–"}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => void rolarTodos()} className={`${BOTAO} px-3`}>
          ⚄ Rolar as das criaturas
        </button>
        <button
          type="button"
          disabled={!prontos}
          onClick={() =>
            aplicar(
              p.alvos.map((id) => {
                const passou = resultado(id) === "passou";
                const dano = passou ? (p.metade ? Math.floor(p.dano / 2) : 0) : p.dano;
                return { alvo: id, acertou: !passou || dano > 0, dano, tipo: p.tipo, condicao: passou ? "" : (p.condicao ?? "") };
              })
            )
          }
          className={BOTAO_CHEIO}
        >
          Aplicar
        </button>
        <button type="button" onClick={descartar} className={`${BOTAO} px-3 text-xs`}>
          Descartar
        </button>
      </div>
    </section>
  );
}
