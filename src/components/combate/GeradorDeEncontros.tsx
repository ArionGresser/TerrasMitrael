"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DIFICULDADES,
  FAMILIAS,
  passaNoNome,
  dificuldadeDe,
  orcamento,
  sortearEncontro,
  xpDoEncontro,
  type CriaturaDeCombate,
  type Dificuldade,
  type Filtros,
  type Grupo,
} from "@/lib/encontros";
import { iniciarConta } from "@/lib/conta";
import { MOEDAS } from "@/lib/bau-sorteio";
import {
  comecarEncontro,
  gruposDoPronto,
  salvarEncontroPronto,
  sortearLoots,
  type DadosDoEncontro,
  type EncontroPronto,
} from "@/lib/montar-combate";
import { EncontrosProntos } from "./EncontrosProntos";
import { usePersonagensDaMesa } from "./usePersonagensDaMesa";
import { combateOuNao, sortearComoComeca, sortearFora, type Sorteado } from "@/lib/encontros-fora";
import { useConta } from "@/components/conta/useConta";
import { presentesGuardados } from "@/lib/sessao";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

export type PersonagemDoCombate = {
  slug: string;
  nome: string;
  nivel: number;
  ca: number;
  iniciativa: number;
  pvMaximo: number;
  imagem?: string;
  /** As armas da ficha, com o bônus de ataque e o modificador de dano já calculados. */
  armas?: { nome: string; bonus: number; dados: string; mod: number; tipo: string; nota?: string }[];
  /** O atributo de conjuração da ficha do site (a mesa soma os ajustes por cima). */
  conjuracao?: { atributo: string; valor: number; mod: number; cd: number; ataque: number };
  /** As magias da ficha do site, pela chave. */
  conhecidas?: string[];
  /** Os valores de atributo e a classe, para a CA pelas regras. */
  atributos?: { nome: string; valor: number }[];
  classe?: string;
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
  personagens: personagensDoSite,
  tipos,
}: {
  criaturas: CriaturaDeCombate[];
  personagens: PersonagemDoCombate[];
  tipos: string[];
}) {
  const personagens = usePersonagensDaMesa(personagensDoSite);
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
  const [modo, setModo] = useState<"combate" | "fora" | "dado">("combate");
  const [fora, setFora] = useState<Sorteado | null>(null);
  const [comoComeca, setComoComeca] = useState<{ dado: number; texto: string } | null>(null);
  const [decisao, setDecisao] = useState<{ dado: number; combate: boolean } | null>(null);
  const [versaoDosProntos, setVersaoDosProntos] = useState(0);
  const [editando, setEditando] = useState<EncontroPronto | null>(null);
  const id = useId();

  useEffect(() => {
    void iniciarConta();
    // Quem o Mestre marcou na Sessão de hoje
    const marcados = presentesGuardados();
    if (marcados) setNaSessao(new Set(marcados));
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
  const doTipo = criaturas.filter((c) => (!filtros.tipos.length || filtros.tipos.includes(c.tipo)) && (filtros.fonte === "todos" || c.fonte === filtros.fonte));
  // Só as famílias que têm alguém dentro dos tipos marcados
  const familiasQueServem = FAMILIAS.map((f) => ({ nome: f.nome, quantas: doTipo.filter((c) => f.padrao.test(c.nome)).length })).filter((f) => f.quantas > 0);
  const cabemNoFiltro = doTipo.filter((c) => c.ndNumero <= filtros.ndMaximo && passaNoNome(c, filtros)).length;
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

  function gerar(comFiltros: Filtros = filtros) {
    const novo = sortearEncontro(criaturas, limite, comFiltros);
    setGrupos(novo);
    setFora(null);
    setComoComeca(novo.length ? sortearComoComeca() : null);
    setAviso(novo.length ? null : "Nenhuma criatura cabe com esses filtros. Tente outra dificuldade, outro tipo ou um ND maior.");
  }

  /** Fora de combate, ou o dado decidindo entre os dois. */
  function rolarEncontro() {
    if (modo === "dado") {
      const d = combateOuNao();
      setDecisao(d);
      if (d.combate) {
        gerar();
        return;
      }
    } else setDecisao(null);
    setGrupos([]);
    setComoComeca(null);
    setFora(sortearFora());
  }

  /** O lado ruim de um encontro que vira briga: sorteia criaturas do tipo certo. */
  function virarCombate(doEncontro: string[]) {
    const novos = { ...filtros, tipos: doEncontro.filter((t) => tipos.includes(t)) };
    setFiltros(novos);
    gerar(novos);
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
    const presentes = personagens.filter((x) => naSessao.has(x.slug));
    const loots = await sortearLoots(grupos, loot, niveis);
    const problema = await comecarEncontro({ grupos, presentes, rolarPv, loots, dificuldade: real.nome, comoComeca: comoComeca?.texto });
    setComecando(false);
    if (problema) setAviso(problema);
    else router.push("/combate/");
  }

  /** Guarda o encontro montado para começar com um toque depois. */
  async function guardar(nome: string, notas: string, fixarLoot: boolean): Promise<string | null> {
    const dados: DadosDoEncontro = {
      grupos: grupos.map((g) => ({ slug: g.criatura.slug, quantas: g.quantas })),
      loot,
      rolarPv,
      dificuldade: grupos.length ? real.nome : undefined,
      comoComeca: comoComeca?.texto,
      fora: grupos.length ? undefined : (fora ?? undefined),
      lootFixo: fixarLoot && grupos.length ? await sortearLoots(grupos, loot, niveis) : undefined,
    };
    const erro = await salvarEncontroPronto(nome, notas, dados, editando?.id);
    if (!erro) {
      setVersaoDosProntos((v) => v + 1);
      setEditando(null);
    }
    return erro;
  }

  function carregarPronto(p: EncontroPronto) {
    setGrupos(gruposDoPronto(p.dados, criaturas));
    setLoot(p.dados.loot);
    setRolarPv(p.dados.rolarPv);
    setFora(p.dados.fora ?? null);
    setComoComeca(p.dados.comoComeca ? { dado: 0, texto: p.dados.comoComeca } : null);
    setEditando(p);
    setModo(p.dados.grupos.length ? "combate" : "fora");
    window.scrollTo({ top: document.getElementById(`${id}-enc`)?.offsetTop ?? 0, behavior: "smooth" });
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

      {/* Os que já estão prontos */}
      <section aria-labelledby={`${id}-prontos`}>
        <h2 id={`${id}-prontos`} className="font-titulo text-tinta-900 text-lg font-bold">
          Encontros prontos
        </h2>
        <p className="text-tinta-500 mb-2 text-xs">Preparados antes: um toque e começa, com quem está marcado na Sessão de hoje.</p>
        <EncontrosProntos personagens={personagensDoSite} criaturas={criaturas} carregar={carregarPronto} versao={versaoDosProntos} />
      </section>

      {/* Combate, fora de combate ou o dado decide */}
      <section aria-labelledby={`${id}-modo`}>
        <h2 id={`${id}-modo`} className="font-titulo text-tinta-900 text-lg font-bold">
          Que tipo de encontro
        </h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" role="group" aria-label="Tipo de encontro">
          {(
            [
              ["combate", "Combate", "Criaturas pelo orçamento de XP."],
              ["fora", "Fora de combate", "Viajantes, achados, perigos do caminho."],
              ["dado", "O dado decide", "d20: 1 a 8 combate, 9 a 20 outra coisa."],
            ] as const
          ).map(([chave, nome, texto]) => (
            <button
              key={chave}
              type="button"
              aria-pressed={modo === chave}
              onClick={() => setModo(chave)}
              className={`rounded-sm border px-3 py-2 text-left transition-colors ${
                modo === chave ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/40 text-tinta-900 hover:bg-dourado-400/15"
              }`}
            >
              <span className="font-titulo block text-sm font-bold">{nome}</span>
              <span className="block text-xs opacity-80">{texto}</span>
            </button>
          ))}
        </div>
        {modo !== "combate" ? (
          <button type="button" disabled={modo === "dado" && !niveis.length} onClick={rolarEncontro} className={`${BOTAO_CHEIO} mt-3 w-full`}>
            {modo === "dado" ? "Rolar o encontro" : fora ? "Sortear outro" : "Sortear encontro fora de combate"}
          </button>
        ) : null}
        {decisao ? (
          <p className="text-tinta-700 mt-2 text-center text-sm">
            d20: <strong className="text-tinta-900">{decisao.dado}</strong> · {decisao.combate ? "combate!" : "não é combate."}
          </p>
        ) : null}
        {fora ? <CartaoDoEncontroFora s={fora} virarCombate={virarCombate} /> : null}
        {fora && !grupos.length ? (
          <GuardarParaDepois key={editando?.id ?? "novo-fora"} editando={editando} combate={false} guardar={guardar} cancelar={() => setEditando(null)} />
        ) : null}
        <p className="text-tinta-500 mt-2 text-xs">✦ A tabela de encontros fora de combate é da casa e genérica: troque pelo que combinar com Mitrael.</p>
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

        <h3 className="font-titulo text-tinta-500 mt-4 text-xs font-semibold tracking-[0.16em] uppercase">Que família</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {familiasQueServem.map(({ nome, quantas }) => {
            const ligado = filtros.familia === nome;
            return (
              <button
                key={nome}
                type="button"
                aria-pressed={ligado}
                onClick={() => setFiltros({ ...filtros, familia: ligado ? undefined : nome })}
                className={`min-h-9 rounded-full border px-3 text-xs ${ligado ? "border-heraldico-vermelho bg-heraldico-vermelho text-pergaminho-50" : "border-dourado-600/40 text-tinta-700"}`}
              >
                {nome} <span className="opacity-60">{quantas}</span>
              </button>
            );
          })}
        </div>
        <label className="text-tinta-700 mt-2 block text-xs">
          Só criaturas com este nome
          <input
            value={filtros.nomeContem ?? ""}
            onChange={(e) => setFiltros({ ...filtros, nomeContem: e.target.value })}
            placeholder="esqueleto, zumbi, dragão vermelho…"
            className={`${CAMPO} mt-1`}
          />
        </label>
        <p className="text-tinta-500 mt-1 text-xs">
          {cabemNoFiltro} {cabemNoFiltro === 1 ? "criatura passa" : "criaturas passam"} nos filtros. A família manda nos acompanhantes também: esqueleto anda com esqueleto.
        </p>

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

        <button type="button" disabled={!niveis.length} onClick={() => gerar()} className={`${BOTAO_CHEIO} mt-4 w-full`}>
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
        {comoComeca && grupos.length ? (
          <div className="border-heraldico-vermelho/40 bg-heraldico-vermelho/5 mt-2 rounded-sm border p-3 text-sm">
            <p className="font-titulo text-tinta-900 font-bold">Como começa (d6: {comoComeca.dado})</p>
            <p className="text-tinta-700 mt-1">{comoComeca.texto}</p>
          </div>
        ) : null}

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
            <p className="text-tinta-500 text-xs">
              ✦ Feras, enxames, gosmas, plantas e criaturas sem inteligência não carregam nada: valem só o XP. Uma arma no loot troca a
              arma parecida da ficha (uma besta no lugar do arco curto), com o dano dela.
            </p>
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
            {comecando ? "Arrumando a mesa…" : "Começar o combate agora"}
          </button>
          <GuardarParaDepois key={editando?.id ?? "novo"} editando={editando} combate guardar={guardar} cancelar={() => setEditando(null)} />
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

const COR_DO_RUMO = {
  ruim: "border-heraldico-vermelho bg-heraldico-vermelho/10",
  neutro: "border-dourado-600 bg-dourado-400/10",
  bom: "border-[#3f7d3a] bg-[#3f7d3a]/10",
} as const;
const NOME_DO_RUMO = { ruim: "Vai mal", neutro: "Nem bem nem mal", bom: "Vai bem" } as const;

/** O encontro fora de combate sorteado: a cena, para que lado foi e, se for o caso, o botão de virar briga. */
function CartaoDoEncontroFora({ s, virarCombate }: { s: Sorteado; virarCombate: (tipos: string[]) => void }) {
  const e = s.encontro;
  return (
    <article className={`mt-3 rounded-sm border-2 p-4 ${COR_DO_RUMO[s.rumo]}`}>
      <p className="font-titulo text-tinta-500 text-xs tracking-[0.16em] uppercase">
        d20 {s.dadoDoEncontro} · encontro · d20 {s.dadoDoRumo} · {NOME_DO_RUMO[s.rumo]}
      </p>
      <h3 className="font-titulo text-tinta-900 mt-1 text-xl font-bold">{e.titulo}</h3>
      <p className="text-tinta-900 mt-2 leading-relaxed italic">{e.cena}</p>
      <p className="text-tinta-900 mt-2 leading-relaxed">
        <strong>{NOME_DO_RUMO[s.rumo]}:</strong> {e[s.rumo]}
      </p>
      <details className="mt-2">
        <summary className="text-tinta-700 min-h-9 cursor-pointer text-xs">Ver os outros lados</summary>
        <ul className="text-tinta-700 mt-1 space-y-1 text-sm">
          {(["ruim", "neutro", "bom"] as const)
            .filter((r) => r !== s.rumo)
            .map((r) => (
              <li key={r}>
                <strong>{NOME_DO_RUMO[r]}:</strong> {e[r]}
              </li>
            ))}
        </ul>
      </details>
      {e.combate ? (
        <button type="button" onClick={() => virarCombate(e.combate!)} className={`${BOTAO} mt-3`}>
          Virar combate ({e.combate.join(", ")})
        </button>
      ) : null}
    </article>
  );
}

/** Guardar o encontro montado (ou mexer num que já estava guardado). */
function GuardarParaDepois({
  editando,
  combate,
  guardar,
  cancelar,
}: {
  editando: EncontroPronto | null;
  combate: boolean;
  guardar: (nome: string, notas: string, fixarLoot: boolean) => Promise<string | null>;
  cancelar: () => void;
}) {
  const [nome, setNome] = useState(editando?.nome ?? "");
  const [notas, setNotas] = useState(editando?.notas ?? "");
  const [fixar, setFixar] = useState(Boolean(editando?.dados.lootFixo));
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [indo, setIndo] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setIndo(true);
    const erro = await guardar(nome, notas, fixar);
    setIndo(false);
    setAviso(erro ? { erro: true, texto: erro } : { erro: false, texto: "Guardado. Está lá em cima, em Encontros prontos." });
    if (!erro && !editando) {
      setNome("");
      setNotas("");
    }
  }

  return (
    <details open={Boolean(editando)} className="border-dourado-600/30 mt-3 rounded-sm border text-left">
      <summary className="font-titulo text-tinta-900 min-h-11 cursor-pointer px-3 py-3 text-sm font-semibold">
        {editando ? `Mexendo em: ${editando.nome}` : "Guardar para depois"}
      </summary>
      <form onSubmit={enviar} className="space-y-2 px-3 pb-3">
        <label className="text-tinta-700 block text-xs">
          Nome do encontro
          <input value={nome} maxLength={80} onChange={(e) => setNome(e.target.value)} placeholder="Emboscada na ponte" className={`${CAMPO} mt-1`} />
        </label>
        <label className="text-tinta-700 block text-xs">
          Notas (só você lê)
          <textarea value={notas} maxLength={4000} rows={3} onChange={(e) => setNotas(e.target.value)} className={`${CAMPO} mt-1 py-2`} />
        </label>
        {combate ? (
          <label className="text-tinta-700 flex min-h-9 items-center gap-2 text-sm">
            <input type="checkbox" checked={fixar} onChange={(e) => setFixar(e.target.checked)} className="accent-heraldico-vermelho size-4" />
            Sortear o loot agora e deixar fixo (senão sorteia ao começar)
          </label>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={indo || !nome.trim()} className={BOTAO_CHEIO}>
            {indo ? "Guardando…" : editando ? "Salvar as mudanças" : "Guardar"}
          </button>
          {editando ? (
            <button type="button" onClick={cancelar} className={`${BOTAO} px-3`}>
              Guardar como novo
            </button>
          ) : null}
        </div>
        {aviso ? <p className={`text-sm ${aviso.erro ? "text-heraldico-vermelho" : "text-tinta-700"}`}>{aviso.texto}</p> : null}
      </form>
    </details>
  );
}
