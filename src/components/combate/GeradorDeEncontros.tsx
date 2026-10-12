"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DIFICULDADES,
  dificuldadeDe,
  orcamento,
  sortearEncontro,
  xpDoEncontro,
  type CriaturaDeCombate,
  type Dificuldade,
  type Filtros,
  type Grupo,
} from "@/lib/encontros";
import { comecarCombate, quantosCombates, registrar, rolarDados, versaoDaMesa, type EstadoDoCombate, type Lutador } from "@/lib/combate";
import { iniciarConta } from "@/lib/conta";
import { lerTodasAsFichas } from "@/lib/ficha-viva";
import { abrir, CATEGORIAS_MAGICAS, MOEDAS, type Conteudo } from "@/lib/bau-sorteio";
import { tesouroDoBau } from "@/components/ficha-viva/DistribuirTesouro";
import { useConta } from "@/components/conta/useConta";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

export type PersonagemDoCombate = {
  slug: string;
  nome: string;
  nivel: number;
  ca: number;
  iniciativa: number;
  pvMaximo: number;
  imagem?: string;
};

const ND_MAXIMOS = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];
const nd = (n: number) => (n === 0.125 ? "1/8" : n === 0.25 ? "1/4" : n === 0.5 ? "1/2" : String(n));

/**
 * O gerador de encontros do Mestre: escolhe quem está na sessão e a
 * dificuldade, filtra as criaturas (só mortos-vivos, só ínferos...) e
 * sorteia um encontro dentro do orçamento de XP das regras de 2024. Dá para
 * ajustar à mão e começar o combate dali.
 */
export function GeradorDeEncontros({
  criaturas,
  personagens,
  tipos,
}: {
  criaturas: CriaturaDeCombate[];
  personagens: PersonagemDoCombate[];
  tipos: string[];
}) {
  const conta = useConta();
  const router = useRouter();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const [naSessao, setNaSessao] = useState<Set<string>>(() => new Set(personagens.map((p) => p.slug)));
  const [extras, setExtras] = useState({ quantos: 0, nivel: 1 });
  const [dificuldade, setDificuldade] = useState<Dificuldade>("moderada");
  const [filtros, setFiltros] = useState<Filtros>({ tipos: [], fonte: "todos", ndMaximo: 30, maximo: 8 });
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [busca, setBusca] = useState("");
  const [rolarPv, setRolarPv] = useState(false);
  const [loot, setLoot] = useState({ ligado: true, qualidade: 0, moedas: ["PC", "PP", "PO"], comuns: true, magicos: false });
  const [aviso, setAviso] = useState<string | null>(null);
  const [comecando, setComecando] = useState(false);
  const id = useId();

  useEffect(() => {
    void iniciarConta();
  }, []);

  const niveis = useMemo(
    () => [
      ...personagens.filter((p) => naSessao.has(p.slug)).map((p) => p.nivel),
      ...Array.from({ length: extras.quantos }, () => extras.nivel),
    ],
    [personagens, naSessao, extras]
  );
  const limite = orcamento(niveis, dificuldade);
  const xp = xpDoEncontro(grupos);
  const real = dificuldadeDe(xp, niveis);
  const marcos = (["baixa", "moderada", "alta"] as const).map((d) => orcamento(niveis, d));
  const topo = Math.max(marcos[2], xp) || 1;

  if (conta.fase === "carregando") return <p className="text-tinta-700 py-10 text-center italic">Abrindo o escudo…</p>;
  if (!ehMestre)
    return (
      <p className="text-tinta-700 py-10 text-center">
        Esta ferramenta é só do Mestre.{" "}
        <Link href="/conta/" className="text-heraldico-vermelho underline">
          Entrar na conta
        </Link>
      </p>
    );

  function gerar() {
    const novo = sortearEncontro(criaturas, limite, filtros);
    setGrupos(novo);
    setAviso(novo.length ? null : "Nenhuma criatura cabe com esses filtros. Tente outra dificuldade, outro tipo ou um ND maior.");
  }

  function mudarQuantas(slug: string, delta: number) {
    setGrupos((gs) => gs.flatMap((g) => (g.criatura.slug !== slug ? [g] : g.quantas + delta > 0 ? [{ ...g, quantas: g.quantas + delta }] : [])));
  }

  function acrescentar(nome: string) {
    const c = criaturas.find((x) => x.nome.toLowerCase() === nome.trim().toLowerCase());
    if (!c) return;
    setGrupos((gs) => (gs.some((g) => g.criatura.slug === c.slug) ? gs.map((g) => (g.criatura.slug === c.slug ? { ...g, quantas: g.quantas + 1 } : g)) : [...gs, { criatura: c, quantas: 1 }]));
    setBusca("");
  }

  async function comecar() {
    setComecando(true);
    // O loot de cada inimigo, pelas faixas do Baú (o d20 é a qualidade)
    let conteudo: Conteudo | null = null;
    if (loot.ligado) {
      try {
        conteudo = (await (await fetch("/bau/conteudo.json")).json()) as Conteudo;
      } catch {
        conteudo = null;
      }
    }
    const nivelMedio = niveis.length ? niveis.reduce((a, b) => a + b, 0) / niveis.length : 1;
    const patamar = nivelMedio <= 4 ? "1-4" : nivelMedio <= 10 ? "5-10" : nivelMedio <= 16 ? "11-16" : "17-20";
    const lootDe = () => {
      if (!conteudo) return undefined;
      const r = abrir(
        {
          recipiente: "algibeira",
          moedas: loot.moedas,
          comuns: loot.comuns ? ["arma", "armadura", "aventura", "ferramenta"] : [],
          magicos: loot.magicos ? [...CATEGORIAS_MAGICAS] : [],
          nivel: patamar,
          d20: loot.qualidade || 1 + Math.floor(Math.random() * 20),
        },
        conteudo,
        true
      );
      const t = tesouroDoBau(r);
      return { moedas: t.moedas, itens: t.itens.map((nome) => ({ nome })) };
    };
    const lutadores: Lutador[] = [];
    for (const g of grupos) {
      for (let i = 1; i <= g.quantas; i++) {
        const pv = rolarPv && g.criatura.pvDados ? rolarDados(g.criatura.pvDados) : g.criatura.pv;
        lutadores.push({
          id: `${g.criatura.slug}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          tipo: "criatura",
          slug: g.criatura.slug,
          nome: g.quantas > 1 ? `${g.criatura.nome} ${i}` : g.criatura.nome,
          iniciativa: null,
          bonusIniciativa: g.criatura.iniciativa,
          ca: g.criatura.ca,
          pv,
          pvMaximo: pv,
          xp: g.criatura.xp,
          condicoes: [],
          imagem: g.criatura.imagem,
          loot: lootDe(),
        });
      }
    }
    for (const p of personagens.filter((x) => naSessao.has(x.slug))) {
      lutadores.push({
        id: p.slug,
        tipo: "personagem",
        slug: p.slug,
        nome: p.nome,
        iniciativa: null,
        bonusIniciativa: p.iniciativa,
        ca: p.ca,
        pv: 0,
        pvMaximo: p.pvMaximo,
        xp: 0,
        condicoes: [],
      });
    }
    const numero = (await quantosCombates()) + 1;
    const inicio: EstadoDoCombate = { numero, rodada: 1, vez: null, lutadores, dificuldade: real.nome };
    const inimigos = grupos.map((g) => (g.quantas > 1 ? `${g.quantas} ${g.criatura.nome}` : g.criatura.nome)).join(", ");
    const estado = { ...inicio, historico: registrar(inicio, `O combate começou: ${inimigos}.`) };
    const fichas = await lerTodasAsFichas();
    const pvs = Object.fromEntries(
      fichas.map((f) => [f.personagem, [f.pv, personagens.find((p) => p.slug === f.personagem)?.pvMaximo ?? f.pv] as [number, number]])
    );
    const problema = await comecarCombate(estado, versaoDaMesa(estado, pvs));
    setComecando(false);
    if (problema) setAviso(problema);
    else router.push("/combate/");
  }

  return (
    <div className="space-y-8">
      {/* Quem está na sessão */}
      <section aria-labelledby={`${id}-grupo`}>
        <h2 id={`${id}-grupo`} className="font-titulo text-tinta-900 text-lg font-bold">
          Quem está na sessão
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {personagens.map((p) => (
            <li key={p.slug}>
              <label className="border-dourado-600/40 has-[:checked]:bg-madeira-800 has-[:checked]:text-pergaminho-50 text-tinta-900 flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border px-3 text-sm">
                <input
                  type="checkbox"
                  checked={naSessao.has(p.slug)}
                  onChange={(e) =>
                    setNaSessao((s) => {
                      const n = new Set(s);
                      if (e.target.checked) n.add(p.slug);
                      else n.delete(p.slug);
                      return n;
                    })
                  }
                  className="accent-dourado-600 size-4"
                />
                {p.nome} <span className="opacity-70">nv {p.nivel}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-end gap-2 text-sm">
          <label className="text-tinta-700 w-28 text-xs">
            Mais aventureiros
            <input
              type="number"
              min={0}
              max={10}
              value={extras.quantos}
              onChange={(e) => setExtras({ ...extras, quantos: Math.max(0, Math.min(10, Math.floor(Number(e.target.value) || 0))) })}
              className={`${CAMPO} mt-1`}
            />
          </label>
          <label className="text-tinta-700 w-24 text-xs">
            de nível
            <input
              type="number"
              min={1}
              max={20}
              value={extras.nivel}
              onChange={(e) => setExtras({ ...extras, nivel: Math.max(1, Math.min(20, Math.floor(Number(e.target.value) || 1))) })}
              className={`${CAMPO} mt-1`}
            />
          </label>
        </div>
      </section>

      {/* Dificuldade e filtros */}
      <section aria-labelledby={`${id}-dif`}>
        <h2 id={`${id}-dif`} className="font-titulo text-tinta-900 text-lg font-bold">
          Dificuldade
        </h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" role="group" aria-label="Dificuldade">
          {DIFICULDADES.map((d) => (
            <button
              key={d.chave}
              type="button"
              aria-pressed={dificuldade === d.chave}
              onClick={() => setDificuldade(d.chave)}
              className={`rounded-sm border px-3 py-2 text-left transition-colors ${
                dificuldade === d.chave ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/40 text-tinta-900 hover:bg-dourado-400/15"
              }`}
            >
              <span className="font-titulo block text-sm font-bold">
                {d.nome} · {orcamento(niveis, d.chave).toLocaleString("pt-BR")} XP
              </span>
              <span className="block text-xs opacity-80">{d.texto}</span>
            </button>
          ))}
        </div>

        <h3 className="font-titulo text-tinta-500 mt-5 text-xs font-semibold tracking-[0.16em] uppercase">Que criaturas</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tipos.map((t) => {
            const ligado = filtros.tipos.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={ligado}
                onClick={() => setFiltros({ ...filtros, tipos: ligado ? filtros.tipos.filter((x) => x !== t) : [...filtros.tipos, t] })}
                className={`min-h-9 rounded-full border px-3 text-xs ${ligado ? "border-heraldico-vermelho bg-heraldico-vermelho text-pergaminho-50" : "border-dourado-600/40 text-tinta-700"}`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="text-tinta-500 mt-1 text-xs">{filtros.tipos.length ? "Só os tipos marcados." : "Nenhum marcado: vale qualquer tipo."}</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <label className="text-tinta-700 text-xs">
            De onde
            <select
              value={filtros.fonte}
              onChange={(e) => setFiltros({ ...filtros, fonte: e.target.value as Filtros["fonte"] })}
              className={`${CAMPO} mt-1`}
            >
              <option value="todos">Monstros e animais</option>
              <option value="monstro">Só monstros</option>
              <option value="animal">Só animais</option>
            </select>
          </label>
          <label className="text-tinta-700 text-xs">
            ND até
            <select value={filtros.ndMaximo} onChange={(e) => setFiltros({ ...filtros, ndMaximo: Number(e.target.value) })} className={`${CAMPO} mt-1`}>
              {ND_MAXIMOS.map((n) => (
                <option key={n} value={n}>
                  {n === 30 ? "Qualquer" : nd(n)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-tinta-700 text-xs">
            No máximo
            <select value={filtros.maximo} onChange={(e) => setFiltros({ ...filtros, maximo: Number(e.target.value) })} className={`${CAMPO} mt-1`}>
              {[1, 2, 3, 4, 6, 8, 12].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 criatura" : `${n} criaturas`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="button" disabled={!niveis.length} onClick={gerar} className={`${BOTAO_CHEIO} mt-4 w-full`}>
          {grupos.length ? "Sortear outro encontro" : "Sortear encontro"}
        </button>
        {!niveis.length ? <p className="text-tinta-500 mt-1 text-center text-xs">Marque quem está na sessão.</p> : null}
      </section>

      {/* O encontro */}
      <section aria-labelledby={`${id}-enc`} aria-live="polite">
        <h2 id={`${id}-enc`} className="font-titulo text-tinta-900 text-lg font-bold">
          O encontro
        </h2>
        {aviso ? <p className="text-heraldico-vermelho mt-1 text-sm">{aviso}</p> : null}

        <div className="mt-2">
          <p className="text-tinta-700 text-sm">
            <strong className="text-tinta-900">{xp.toLocaleString("pt-BR")} XP</strong> ·{" "}
            <span className={real.acima ? "text-heraldico-vermelho font-semibold" : ""}>{real.nome}</span>
          </p>
          <div className="bg-madeira-800/15 relative mt-2 h-3 rounded-full" aria-hidden>
            <div
              className={`h-full rounded-full ${real.acima ? "bg-heraldico-vermelho" : "bg-dourado-600"}`}
              style={{ width: `${Math.min(100, (xp / topo) * 100)}%` }}
            />
            {marcos.map((m, i) => (
              <span key={i} className="bg-tinta-900 absolute top-[-3px] h-[18px] w-0.5" style={{ left: `${(m / topo) * 100}%` }} />
            ))}
          </div>
          <p className="text-tinta-500 mt-1 text-xs">Os riscos marcam Baixa, Moderada e Alta para este grupo.</p>
        </div>

        {grupos.length ? (
          <ul className="mt-3 space-y-2">
            {grupos.map((g) => (
              <li key={g.criatura.slug} className="border-dourado-600/30 flex items-center gap-3 rounded-sm border p-2">
                <span className="bg-madeira-900 relative size-14 shrink-0 overflow-hidden rounded-sm">
                  {g.criatura.imagem ? <Image src={g.criatura.imagem} alt="" fill sizes="56px" className="object-cover" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <Link href={`/monstros/${g.criatura.slug}/`} target="_blank" className="font-titulo text-tinta-900 block font-bold underline-offset-2 hover:underline">
                    {g.quantas > 1 ? `${g.quantas}× ` : ""}
                    {g.criatura.nome}
                  </Link>
                  <span className="text-tinta-500 block text-xs">
                    {g.criatura.tipo} · ND {g.criatura.nd} · {g.criatura.xp.toLocaleString("pt-BR")} XP cada · CA {g.criatura.ca} · {g.criatura.pv} PV
                  </span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => mudarQuantas(g.criatura.slug, -1)} aria-label={`Um ${g.criatura.nome} a menos`} className={`${BOTAO} px-3`}>
                    −
                  </button>
                  <button type="button" onClick={() => mudarQuantas(g.criatura.slug, 1)} aria-label={`Mais um ${g.criatura.nome}`} className={`${BOTAO} px-3`}>
                    +
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinta-500 mt-3 text-sm italic">Sorteie, ou acrescente as criaturas à mão.</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            acrescentar(busca);
          }}
          className="mt-3 flex items-end gap-2"
        >
          <label className="text-tinta-700 flex-1 text-xs">
            Acrescentar criatura
            <input list={`${id}-lista`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Lobo, Esqueleto, Goblin…" className={`${CAMPO} mt-1`} />
            <datalist id={`${id}-lista`}>
              {criaturas.map((c) => (
                <option key={c.slug} value={c.nome}>
                  ND {c.nd}
                </option>
              ))}
            </datalist>
          </label>
          <button type="submit" className={BOTAO}>
            Acrescentar
          </button>
        </form>
      </section>

      {grupos.length ? (
        <section className="border-heraldico-vermelho/30 rounded-sm border-2 p-4 text-center">
          <label className="text-tinta-700 inline-flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={rolarPv} onChange={(e) => setRolarPv(e.target.checked)} className="accent-heraldico-vermelho size-4" />
            Rolar os PV de cada criatura (em vez da média)
          </label>
          <fieldset className="border-dourado-600/30 mt-3 rounded-sm border p-3 text-left">
            <legend className="font-titulo text-tinta-900 px-1 text-sm font-bold">Loot dos inimigos</legend>
            <label className="text-tinta-700 flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={loot.ligado} onChange={(e) => setLoot({ ...loot, ligado: e.target.checked })} className="accent-heraldico-vermelho size-4" />
              Cada inimigo carrega o próprio loot
            </label>
            {loot.ligado ? (
              <div className="mt-2 space-y-3">
                <label className="text-tinta-700 block text-xs">
                  Qualidade (o d20 das faixas do Baú)
                  <select value={loot.qualidade} onChange={(e) => setLoot({ ...loot, qualidade: Number(e.target.value) })} className={`${CAMPO} mt-1`}>
                    <option value={0}>Rolar um d20 para cada inimigo</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <p className="text-tinta-700 text-xs">Moedas</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {MOEDAS.map((m) => {
                      const ligado = loot.moedas.includes(m.chave);
                      return (
                        <button
                          key={m.chave}
                          type="button"
                          aria-pressed={ligado}
                          onClick={() => setLoot({ ...loot, moedas: ligado ? loot.moedas.filter((x) => x !== m.chave) : [...loot.moedas, m.chave] })}
                          className={`min-h-9 rounded-full border px-3 text-xs ${ligado ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/40 text-tinta-700"}`}
                        >
                          {m.chave} · {m.nome}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="text-tinta-700 flex min-h-9 items-center gap-2 text-sm">
                  <input type="checkbox" checked={loot.comuns} onChange={(e) => setLoot({ ...loot, comuns: e.target.checked })} className="accent-heraldico-vermelho size-4" />
                  Pode ter equipamento comum
                </label>
                <label className="text-tinta-700 flex min-h-9 items-center gap-2 text-sm">
                  <input type="checkbox" checked={loot.magicos} onChange={(e) => setLoot({ ...loot, magicos: e.target.checked })} className="accent-heraldico-vermelho size-4" />
                  Pode ter item mágico
                </label>
              </div>
            ) : null}
          </fieldset>
          <button type="button" disabled={comecando} onClick={() => void comecar()} className={`${BOTAO_CHEIO} mt-3 w-full`}>
            {comecando ? "Arrumando a mesa…" : "Começar o combate"}
          </button>
          <p className="text-tinta-500 mt-2 text-xs">
            Os jogadores com conta passam a ver a ordem de iniciativa na tela deles. O tesouro sai do{" "}
            <Link href="/bau/" className="underline">
              Baú do Mestre
            </Link>
            .
          </p>
        </section>
      ) : null}
    </div>
  );
}
