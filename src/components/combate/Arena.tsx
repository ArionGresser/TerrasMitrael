"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CONDICOES,
  combateAtivo,
  combatesPassados,
  d20,
  iniciativasDosJogadores,
  lerMesaDoCombate,
  ordenar,
  ouvirCombate,
  ouvirIniciativas,
  registrar,
  rolarMinhaIniciativa,
  salvarCombate,
  versaoDaMesa,
  type CombateAtivo,
  type EstadoDoCombate,
  type Lutador,
  type MesaDoCombate,
} from "@/lib/combate";
import { estadoDosPv, type CriaturaDeCombate } from "@/lib/encontros";
import { iniciarConta } from "@/lib/conta";
import { lerTodasAsFichas, mestre, ouvirMesa, type FichaViva } from "@/lib/ficha-viva";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import { useConta } from "@/components/conta/useConta";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import { Janela } from "@/components/ficha-viva/Janela";
import { FichaVivaDoPersonagem } from "@/components/ficha-viva/FichaVivaDoPersonagem";
import type { RegrasDaFicha } from "@/components/ficha-viva/PainelDaFicha";
import type { PersonagemDoCombate } from "./GeradorDeEncontros";
import { FimDoCombate } from "./FimDoCombate";

/** Um cartão da arena, do jeito que cada um pode ver. */
type Cartao = {
  id: string;
  tipo: Lutador["tipo"];
  slug: string;
  nome: string;
  iniciativa: number | null;
  condicoes: string[];
  imagem?: string;
  estado: string;
  /** Sem número para quem não pode ver (os inimigos, para os jogadores). */
  pv?: number;
  pvMaximo?: number;
  ca?: number;
};

const COR_DO_ESTADO: Record<string, string> = {
  Ileso: "text-[#3f7d3a]",
  Ferido: "text-[#a8701c]",
  "Muito ferido": "text-heraldico-vermelho",
  Caído: "text-tinta-500",
};

/**
 * A arena do combate: os aventureiros de um lado, os inimigos do outro, a
 * ordem de iniciativa em cima e o histórico embaixo.
 *
 * Para o Mestre é o painel de condução: toca nos cartões para escolher os
 * alvos e usa os atalhos (dano, cura, condição, próximo turno). Para os
 * jogadores, os números dos inimigos ficam escondidos ("???"), e os atalhos
 * são rolar a iniciativa, abrir a própria ficha e pedir algo ao Mestre.
 */
export function Arena({
  personagens,
  bases,
  regras,
}: {
  personagens: PersonagemDoCombate[];
  bases: Record<string, BaseDaFicha>;
  regras: RegrasDaFicha;
}) {
  const conta = useConta();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const meu = conta.fase === "dentro" ? conta.perfil.personagem : null;
  const nomes = useMemo(() => Object.fromEntries(personagens.map((p) => [p.slug, p.nome])), [personagens]);

  // Todos: a mesa pública
  const [mesa, setMesa] = useState<MesaDoCombate | null | undefined>(undefined);
  // Só o Mestre: o combate inteiro e as fichas
  const [combate, setCombate] = useState<CombateAtivo | null | undefined>(undefined);
  const [fichas, setFichas] = useState<FichaViva[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState<string | null>(null);
  const [fichaAberta, setFichaAberta] = useState<string | null>(null);
  const [terminando, setTerminando] = useState(false);
  const salvarDepois = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    void iniciarConta();
  }, []);

  const lerMesa = useCallback(() => void lerMesaDoCombate().then(setMesa), []);
  const lerFichas = useCallback(async () => setFichas(await lerTodasAsFichas()), []);

  useEffect(() => {
    if (conta.fase !== "dentro") return;
    lerMesa();
    const pararMesa = ouvirCombate(lerMesa);
    if (!ehMestre) return pararMesa;
    void combateAtivo().then(setCombate);
    void lerFichas();
    const pararFichas = ouvirMesa((t) => t === "fichas" && void lerFichas(), undefined, ["fichas"]);
    return () => {
      pararMesa();
      pararFichas();
    };
  }, [conta.fase, ehMestre, lerMesa, lerFichas]);

  const pvs = useMemo(
    () =>
      Object.fromEntries(
        fichas.map((f) => [f.personagem, [f.pv, bases[f.personagem]?.pvMaximo ?? f.pv] as [number, number]])
      ),
    [fichas, bases]
  );

  // O Mestre salva um instante depois da última mudança, e a mesa dos jogadores muda junto
  useEffect(() => {
    if (!ehMestre || !combate) return;
    clearTimeout(salvarDepois.current);
    salvarDepois.current = setTimeout(async () => {
      const erro = await salvarCombate(combate.id, combate.estado, versaoDaMesa(combate.estado, pvs));
      if (erro) setAviso(`Não salvou: ${erro}`);
    }, 350);
  }, [ehMestre, combate, pvs]);

  // A iniciativa que os jogadores rolam chega aqui na hora
  const combateId = combate?.id;
  useEffect(() => {
    if (!ehMestre || !combateId) return;
    const aplicar = (personagem: string, valor: number) =>
      setCombate((c) => {
        if (!c || !c.estado.lutadores.some((l) => l.slug === personagem && l.iniciativa !== valor)) return c;
        const estado = {
          ...c.estado,
          lutadores: c.estado.lutadores.map((l) => (l.tipo === "personagem" && l.slug === personagem ? { ...l, iniciativa: valor } : l)),
        };
        const nome = c.estado.lutadores.find((l) => l.slug === personagem)?.nome ?? personagem;
        return { ...c, estado: { ...estado, historico: registrar(estado, `${nome} rolou ${valor} de iniciativa.`) } };
      });
    void iniciativasDosJogadores(combateId).then((l) => l.forEach((i) => aplicar(i.personagem, i.valor)));
    return ouvirIniciativas((personagem, valor, combate) => {
      if (combate === combateId) aplicar(personagem, valor);
    });
  }, [ehMestre, combateId]);

  if (conta.fase === "carregando" || (conta.fase === "dentro" && mesa === undefined)) {
    return <p className="text-tinta-700 py-10 text-center italic">Arrumando a arena…</p>;
  }
  if (conta.fase === "fora") {
    return (
      <p className="text-tinta-700 py-10 text-center">
        A arena é para quem joga.{" "}
        <Link href="/conta/" className="text-heraldico-vermelho underline">
          Entre na sua conta
        </Link>
        .
      </p>
    );
  }

  const estado = ehMestre ? combate?.estado : undefined;
  const semCombate = ehMestre ? combate === null : !mesa;
  if (semCombate || (ehMestre && combate === undefined)) {
    return ehMestre && combate === undefined ? (
      <p className="text-tinta-700 py-10 text-center italic">Arrumando a arena…</p>
    ) : (
      <SemCombate ehMestre={ehMestre} />
    );
  }

  // ---------- O que cada um vê ----------

  const cartoes: Cartao[] = estado
    ? ordenar(estado.lutadores).map((l) => {
        const [pv, max] = l.tipo === "personagem" ? (pvs[l.slug] ?? [l.pvMaximo, l.pvMaximo]) : [l.pv, l.pvMaximo];
        return {
          id: l.id,
          tipo: l.tipo,
          slug: l.slug,
          nome: l.nome,
          iniciativa: l.iniciativa,
          condicoes: l.condicoes,
          imagem: l.tipo === "personagem" ? personagens.find((p) => p.slug === l.slug)?.imagem : l.imagem,
          estado: estadoDosPv(pv, max),
          pv,
          pvMaximo: max,
          ca: l.ca,
        };
      })
    : (mesa?.ordem ?? []).map((l) => ({
        ...l,
        imagem: l.tipo === "personagem" ? personagens.find((p) => p.slug === l.slug)?.imagem : l.imagem,
      }));

  const numero = estado?.numero ?? mesa?.numero;
  const rodada = estado?.rodada ?? mesa?.rodada ?? 1;
  const vez = estado?.vez ?? mesa?.vez ?? null;
  const daVez = cartoes.find((c) => c.id === vez);
  const historico = estado ? (estado.historico ?? []).map((r) => ({ rodada: r.rodada, texto: r.texto })) : (mesa?.historico ?? []);
  const aventureiros = cartoes.filter((c) => c.tipo === "personagem");
  const inimigos = cartoes.filter((c) => c.tipo === "criatura");
  const meuCartao = meu ? aventureiros.find((c) => c.slug === meu) : undefined;

  // ---------- As mãos do Mestre ----------

  const mudar = (novo: Partial<EstadoDoCombate>) =>
    setCombate((c) => (c ? { ...c, estado: { ...c.estado, ...novo } } : c));

  function anotar(estadoNovo: EstadoDoCombate, texto: string, publico = texto): EstadoDoCombate {
    return { ...estadoNovo, historico: registrar(estadoNovo, texto, publico) };
  }

  function alternar(id: string) {
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function pv(delta: number) {
    if (!estado || !selecionados.size || !delta) return;
    let novo = estado;
    for (const id of selecionados) {
      const l = novo.lutadores.find((x) => x.id === id);
      if (!l) continue;
      if (l.tipo === "personagem") {
        const erro = await mestre.pv(l.slug, delta, l.pvMaximo);
        if (erro) {
          setAviso(`${l.nome}: ${erro}`);
          continue;
        }
        novo = anotar(novo, `${l.nome}: ${delta < 0 ? `${-delta} de dano` : `+${delta} PV`}.`);
      } else {
        const pvNovo = Math.max(0, Math.min(l.pvMaximo, l.pv + delta));
        novo = {
          ...novo,
          lutadores: novo.lutadores.map((x) => (x.id === id ? { ...x, pv: pvNovo } : x)),
        };
        const publico =
          delta < 0 ? (pvNovo === 0 ? `${l.nome} foi atingido e caiu.` : `${l.nome} foi atingido.`) : `${l.nome} se recuperou.`;
        novo = anotar(novo, `${l.nome}: ${delta < 0 ? `${-delta} de dano` : `+${delta} PV`} (${pvNovo}/${l.pvMaximo}).`, publico);
      }
    }
    mudar(novo);
    void lerFichas();
  }

  function condicao(c: string) {
    if (!estado || !c) return;
    let novo = estado;
    for (const id of selecionados) {
      const l = novo.lutadores.find((x) => x.id === id);
      if (!l) continue;
      const tem = l.condicoes.includes(c);
      novo = {
        ...novo,
        lutadores: novo.lutadores.map((x) =>
          x.id === id ? { ...x, condicoes: tem ? x.condicoes.filter((y) => y !== c) : [...x.condicoes, c] } : x
        ),
      };
      novo = anotar(novo, tem ? `${l.nome} não está mais ${c}.` : `${l.nome} ficou ${c}.`);
    }
    mudar(novo);
  }

  function proximo() {
    if (!estado) return;
    const ordem = ordenar(estado.lutadores);
    if (!ordem.length) return;
    const i = ordem.findIndex((l) => l.id === estado.vez);
    if (estado.vez === null || i < 0) mudar(anotar({ ...estado, vez: ordem[0].id }, `Começou a rodada ${estado.rodada}.`));
    else if (i === ordem.length - 1) {
      const novo = { ...estado, vez: ordem[0].id, rodada: estado.rodada + 1 };
      mudar(anotar(novo, `Começou a rodada ${novo.rodada}.`));
    } else mudar({ vez: ordem[i + 1].id });
  }

  function iniciativaDasCriaturas() {
    if (!estado) return;
    const novo = {
      ...estado,
      lutadores: estado.lutadores.map((l) => (l.tipo === "criatura" && l.iniciativa === null ? { ...l, iniciativa: d20() + l.bonusIniciativa } : l)),
    };
    mudar(anotar(novo, "Os inimigos rolaram a iniciativa."));
  }

  function remover() {
    if (!estado || !selecionados.size) return;
    const fora = estado.lutadores.filter((l) => selecionados.has(l.id));
    const novo = {
      ...estado,
      lutadores: estado.lutadores.filter((l) => !selecionados.has(l.id)),
      vez: estado.vez && selecionados.has(estado.vez) ? null : estado.vez,
    };
    mudar(anotar(novo, `Saiu do combate: ${fora.map((l) => l.nome).join(", ")}.`));
    setSelecionados(new Set());
  }

  function acrescentar(c: CriaturaDeCombate) {
    if (!estado) return;
    const iguais = estado.lutadores.filter((l) => l.slug === c.slug).length;
    const nome = iguais ? `${c.nome} ${iguais + 1}` : c.nome;
    const novo: EstadoDoCombate = {
      ...estado,
      lutadores: [
        ...estado.lutadores,
        {
          id: `${c.slug}-${iguais + 1}-${Math.random().toString(36).slice(2, 6)}`,
          tipo: "criatura",
          slug: c.slug,
          nome,
          iniciativa: null,
          bonusIniciativa: c.iniciativa,
          ca: c.ca,
          pv: c.pv,
          pvMaximo: c.pv,
          xp: c.xp,
          condicoes: [],
          imagem: c.imagem,
        },
      ],
    };
    mudar(anotar(novo, `Chegou: ${nome}.`));
  }

  function mudarIniciativa(id: string, valor: number | null) {
    if (!estado) return;
    mudar({ lutadores: estado.lutadores.map((l) => (l.id === id ? { ...l, iniciativa: valor } : l)) });
  }

  const umPersonagem =
    selecionados.size === 1 ? estado?.lutadores.find((l) => selecionados.has(l.id) && l.tipo === "personagem") : undefined;

  return (
    <div className="pb-4">
      {/* Cabeçalho: o número do combate, a rodada e de quem é a vez */}
      <div className="text-center">
        <p className="font-titulo text-tinta-500 text-xs tracking-[0.2em] uppercase">
          Combate{numero ? ` nº ${numero}` : ""}
          {estado?.dificuldade ? ` · ${estado.dificuldade}` : ""}
        </p>
        <p className="font-titulo text-tinta-900 mt-1 text-3xl font-bold">Rodada {rodada}</p>
        <p className={`mt-1 text-sm ${meuCartao && daVez?.id === meuCartao.id ? "text-heraldico-vermelho font-bold" : "text-tinta-700"}`}>
          {daVez ? (meuCartao && daVez.id === meuCartao.id ? "Sua vez!" : `Vez de ${daVez.nome}`) : "Rolando a iniciativa"}
        </p>
      </div>

      {/* A ordem de iniciativa */}
      <ol aria-label="Ordem de iniciativa" className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {cartoes.map((c) => (
          <li
            key={c.id}
            aria-current={c.id === vez ? "step" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
              c.id === vez
                ? "border-heraldico-vermelho bg-heraldico-vermelho text-pergaminho-50"
                : c.tipo === "personagem"
                  ? "border-[#3f6d8f]/50 text-tinta-900"
                  : "border-heraldico-vermelho/40 text-tinta-900"
            } ${c.estado === "Caído" ? "opacity-50" : ""}`}
          >
            <span className="font-bold tabular-nums">{c.iniciativa ?? "–"}</span>
            <span className="max-w-28 truncate">{c.nome}</span>
          </li>
        ))}
      </ol>

      {/* Os dois lados */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-6">
        <Lado titulo="Aventureiros" cor="azul">
          {aventureiros.map((c) => (
            <CartaoDaArena
              key={c.id}
              c={c}
              vez={c.id === vez}
              escondido={false}
              meu={c.slug === meu}
              selecionado={selecionados.has(c.id)}
              aoTocar={ehMestre ? () => alternar(c.id) : undefined}
              mudarIniciativa={ehMestre ? (v) => mudarIniciativa(c.id, v) : undefined}
            />
          ))}
        </Lado>
        <Lado titulo="Inimigos" cor="vermelho">
          {inimigos.map((c) => (
            <CartaoDaArena
              key={c.id}
              c={c}
              vez={c.id === vez}
              escondido={!ehMestre}
              selecionado={selecionados.has(c.id)}
              aoTocar={ehMestre ? () => alternar(c.id) : undefined}
              mudarIniciativa={ehMestre ? (v) => mudarIniciativa(c.id, v) : undefined}
            />
          ))}
        </Lado>
      </div>

      {/* Os atalhos */}
      {ehMestre && estado ? (
        <AtalhosDoMestre
          selecionados={selecionados.size}
          vezComecou={estado.vez !== null}
          aviso={aviso}
          dano={(n) => void pv(-n)}
          cura={(n) => void pv(n)}
          condicao={condicao}
          proximo={proximo}
          iniciativa={iniciativaDasCriaturas}
          remover={remover}
          acrescentar={acrescentar}
          todosInimigos={() => setSelecionados(new Set(inimigos.map((c) => c.id)))}
          limpar={() => setSelecionados(new Set())}
          verFicha={umPersonagem ? () => setFichaAberta(umPersonagem.slug) : undefined}
          terminar={() => setTerminando(true)}
        />
      ) : meu ? (
        <AtalhosDoJogador
          meuCartao={meuCartao}
          bonus={personagens.find((p) => p.slug === meu)?.iniciativa ?? 0}
          abrirFicha={(ancora) => {
            setFichaAberta(meu);
            if (ancora) setTimeout(() => document.getElementById(ancora)?.scrollIntoView({ behavior: "smooth" }), 500);
          }}
        />
      ) : (
        <p className="text-tinta-500 mt-6 text-center text-sm">
          A sua conta ainda não está ligada a um personagem. O Mestre faz isso no painel dele.
        </p>
      )}

      {/* O histórico */}
      <section aria-labelledby="titulo-historico" className="mt-8">
        <h2 id="titulo-historico" className="font-titulo text-tinta-500 text-xs font-semibold tracking-[0.16em] uppercase">
          Histórico do combate
        </h2>
        {historico.length ? (
          <ol className="border-dourado-600/30 mt-2 max-h-72 space-y-1 overflow-y-auto rounded-sm border p-3 text-sm">
            {[...historico].reverse().map((r, i) => (
              <li key={historico.length - i} className="text-tinta-700">
                <span className="text-tinta-500 mr-2 text-xs tabular-nums">R{r.rodada}</span>
                {r.texto}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-tinta-500 mt-2 text-sm italic">Nada aconteceu ainda.</p>
        )}
      </section>

      {/* A ficha viva por cima da arena */}
      <Janela aberta={Boolean(fichaAberta)} aoFechar={() => setFichaAberta(null)} titulo={fichaAberta ? (nomes[fichaAberta] ?? "Ficha") : "Ficha"} larga>
        {fichaAberta && bases[fichaAberta] ? (
          <>
            <FichaVivaDoPersonagem slug={fichaAberta} base={bases[fichaAberta]} regras={regras} />
            <Link href={`/personagens/${fichaAberta}/`} className="text-heraldico-vermelho text-sm underline">
              Abrir a ficha completa
            </Link>
          </>
        ) : null}
      </Janela>

      {ehMestre && combate && estado ? (
        <FimDoCombate
          aberta={terminando}
          aoFechar={() => setTerminando(false)}
          combate={combate}
          pvs={pvs}
          nomes={nomes}
          niveis={Object.fromEntries(personagens.map((p) => [p.slug, p.nivel]))}
          aoTerminar={() => {
            setTerminando(false);
            setCombate(null);
            setSelecionados(new Set());
          }}
        />
      ) : null}
    </div>
  );
}

export function Lado({ titulo, cor, children }: { titulo: string; cor: "azul" | "vermelho"; children: React.ReactNode }) {
  return (
    <section aria-label={titulo}>
      <h2
        className={`font-titulo border-b-2 pb-1 text-center text-xs font-bold tracking-[0.18em] uppercase ${
          cor === "azul" ? "border-[#3f6d8f]/60 text-[#2f5677]" : "border-heraldico-vermelho/60 text-heraldico-vermelho"
        }`}
      >
        {titulo}
      </h2>
      <ul className="mt-2 space-y-2">{children}</ul>
    </section>
  );
}

export function CartaoDaArena({
  c,
  vez,
  escondido,
  meu = false,
  selecionado,
  aoTocar,
  mudarIniciativa,
}: {
  c: Cartao;
  vez: boolean;
  escondido: boolean;
  meu?: boolean;
  selecionado: boolean;
  aoTocar?: () => void;
  mudarIniciativa?: (v: number | null) => void;
}) {
  const fracao = c.pv !== undefined && c.pvMaximo ? Math.min(1, c.pv / c.pvMaximo) : null;
  const caido = c.estado === "Caído";

  const corpo = (
    <>
      <span className="bg-madeira-900 relative block aspect-[4/3] w-full overflow-hidden rounded-sm">
        {c.imagem ? (
          <Image src={c.imagem} alt="" fill sizes="(max-width: 640px) 45vw, 320px" className={`object-cover ${c.tipo === "personagem" ? "object-top" : ""} ${caido ? "grayscale" : ""}`} />
        ) : null}
        <span className="bg-madeira-900/85 text-pergaminho-50 absolute top-1 left-1 rounded-sm px-1.5 text-xs font-bold tabular-nums">
          {c.iniciativa ?? "–"}
        </span>
        {meu ? (
          <span className="bg-dourado-400 text-tinta-900 absolute top-1 right-1 rounded-sm px-1.5 text-[0.6rem] font-bold uppercase">Você</span>
        ) : null}
      </span>
      <span className="mt-1.5 block px-0.5">
        <span className="font-titulo text-tinta-900 block truncate text-sm leading-tight font-bold">
          {vez ? <span className="text-heraldico-vermelho">▶ </span> : null}
          {c.nome}
        </span>
        <span className="text-tinta-700 block text-xs tabular-nums">
          CA {escondido ? "???" : (c.ca ?? "–")} · PV {escondido ? "???" : c.pv !== undefined ? `${c.pv}/${c.pvMaximo}` : "–"}
        </span>
        {fracao !== null && !escondido ? (
          <span className="bg-madeira-800/15 mt-1 block h-1.5 overflow-hidden rounded-full" aria-hidden>
            <span
              className={`block h-full rounded-full ${fracao > 0.5 ? "bg-[#3f7d3a]" : fracao > 0.25 ? "bg-[#c58a1c]" : "bg-heraldico-vermelho"}`}
              style={{ width: `${fracao * 100}%` }}
            />
          </span>
        ) : null}
        <span className={`block text-xs font-semibold ${COR_DO_ESTADO[c.estado] ?? ""}`}>{c.estado}</span>
        {c.condicoes.length ? <span className="text-heraldico-vermelho block text-[0.7rem] leading-tight">{c.condicoes.join(", ")}</span> : null}
      </span>
    </>
  );

  const borda = selecionado
    ? "border-dourado-600 ring-dourado-400 ring-2"
    : vez
      ? "border-heraldico-vermelho"
      : meu
        ? "border-dourado-600/70"
        : "border-dourado-600/25";

  return (
    <li className={`rounded-sm border-2 bg-pergaminho-50/50 p-1.5 transition-colors ${borda} ${caido ? "opacity-60" : ""}`}>
      {aoTocar ? (
        <button type="button" onClick={aoTocar} aria-pressed={selecionado} className="block w-full text-left">
          {corpo}
        </button>
      ) : (
        corpo
      )}
      {mudarIniciativa ? (
        <label className="text-tinta-500 mt-1 flex items-center gap-1 px-0.5 text-[0.65rem]">
          Inic.
          <input
            type="number"
            inputMode="numeric"
            value={c.iniciativa ?? ""}
            onChange={(e) => mudarIniciativa(e.target.value === "" ? null : Math.floor(Number(e.target.value)))}
            aria-label={`Iniciativa de ${c.nome}`}
            className="border-dourado-600/40 bg-pergaminho-50 text-tinta-900 h-8 w-14 rounded-sm border px-1 text-center text-sm font-bold"
          />
        </label>
      ) : null}
    </li>
  );
}

export function AtalhosDoMestre(p: {
  selecionados: number;
  vezComecou: boolean;
  aviso: string | null;
  dano: (n: number) => void;
  cura: (n: number) => void;
  condicao: (c: string) => void;
  proximo: () => void;
  iniciativa: () => void;
  remover: () => void;
  acrescentar: (c: CriaturaDeCombate) => void;
  todosInimigos: () => void;
  limpar: () => void;
  verFicha?: () => void;
  terminar: () => void;
}) {
  const [valor, setValor] = useState("");
  const [criaturas, setCriaturas] = useState<CriaturaDeCombate[] | null>(null);
  const [busca, setBusca] = useState("");
  const n = Math.max(0, Math.floor(Number(valor) || 0));
  const semAlvo = p.selecionados === 0;

  async function carregarCriaturas() {
    if (criaturas) return;
    try {
      const r = await fetch("/monstros/combate.json");
      setCriaturas((await r.json()) as CriaturaDeCombate[]);
    } catch {
      setCriaturas([]);
    }
  }

  return (
    <div className="border-heraldico-vermelho/30 bg-pergaminho-50/95 sticky bottom-[4.5rem] z-10 mt-5 rounded-sm border-2 p-3 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-tinta-700">
          {semAlvo ? "Toque nos cartões para escolher os alvos." : `${p.selecionados} ${p.selecionados === 1 ? "escolhido" : "escolhidos"}`}
        </span>
        <span className="flex gap-3">
          <button type="button" onClick={p.todosInimigos} className="text-tinta-700 min-h-8 underline">
            Todos os inimigos
          </button>
          {!semAlvo ? (
            <button type="button" onClick={p.limpar} className="text-tinta-700 min-h-8 underline">
              Limpar
            </button>
          ) : null}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={valor}
          placeholder="PV"
          aria-label="Quanto de dano ou cura"
          onChange={(e) => setValor(e.target.value)}
          className={`${CAMPO} max-w-20`}
        />
        <button type="button" disabled={semAlvo || !n} onClick={() => (p.dano(n), setValor(""))} className={`${BOTAO} px-3`}>
          Dano
        </button>
        <button type="button" disabled={semAlvo || !n} onClick={() => (p.cura(n), setValor(""))} className={`${BOTAO} px-3`}>
          Cura
        </button>
        <select
          value=""
          disabled={semAlvo}
          onChange={(e) => p.condicao(e.target.value)}
          aria-label="Pôr ou tirar uma condição dos escolhidos"
          className={`${CAMPO} sm:w-auto sm:min-w-0 sm:flex-1`}
        >
          <option value="">Condição…</option>
          {CONDICOES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button type="button" onClick={p.proximo} className={`${BOTAO_CHEIO} col-span-2`}>
          {p.vezComecou ? "Próximo turno" : "Começar a rodada"}
        </button>
        <button type="button" onClick={p.iniciativa} className={`${BOTAO} px-2 text-xs`}>
          Iniciativa dos inimigos
        </button>
        <button type="button" onClick={p.terminar} className={`${BOTAO} px-2 text-xs`}>
          Terminar combate
        </button>
      </div>

      <details className="mt-2" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && void carregarCriaturas()}>
        <summary className="text-tinta-700 min-h-9 cursor-pointer text-xs">Mais: acrescentar criatura (do Bestiário ou da casa), ficha, tirar do combate</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const c = criaturas?.find((x) => x.nome.toLowerCase() === busca.trim().toLowerCase());
            if (c) {
              p.acrescentar(c);
              setBusca("");
            }
          }}
          className="mt-2 flex items-end gap-2"
        >
          <label className="text-tinta-700 flex-1 text-xs">
            Chegou mais alguém?
            <input list="arena-criaturas" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={criaturas ? "Nome da criatura" : "Carregando…"} className={`${CAMPO} mt-1`} />
            <datalist id="arena-criaturas">
              {(criaturas ?? []).map((c) => (
                <option key={c.slug} value={c.nome} />
              ))}
            </datalist>
          </label>
          <button type="submit" className={BOTAO}>
            Acrescentar
          </button>
        </form>
        <CriaturaDaCasa acrescentar={p.acrescentar} />
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" disabled={!p.verFicha} onClick={p.verFicha} className={`${BOTAO} px-3 text-xs`}>
            Ver a ficha do escolhido
          </button>
          <button type="button" disabled={semAlvo} onClick={p.remover} className={`${BOTAO} px-3 text-xs`}>
            Tirar do combate
          </button>
        </div>
      </details>

      {p.aviso ? <p className="text-heraldico-vermelho mt-2 text-xs">{p.aviso}</p> : null}
    </div>
  );
}

export function AtalhosDoJogador({
  meuCartao,
  bonus,
  abrirFicha,
}: {
  meuCartao?: Cartao;
  bonus: number;
  abrirFicha: (ancora?: string) => void;
}) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [rolando, setRolando] = useState(false);

  async function rolar() {
    setRolando(true);
    const dado = d20();
    const total = dado + bonus;
    const erro = await rolarMinhaIniciativa(total);
    setRolando(false);
    setAviso(erro ?? `Você rolou ${dado} ${bonus >= 0 ? "+" : "-"} ${Math.abs(bonus)} = ${total} de iniciativa.`);
  }

  return (
    <div className="border-dourado-600/50 bg-pergaminho-50/95 sticky bottom-[4.5rem] z-10 mt-5 rounded-sm border-2 p-3 shadow-lg backdrop-blur-sm">
      {!meuCartao ? (
        <p className="text-tinta-700 mb-2 text-center text-sm">O seu personagem não está neste combate.</p>
      ) : null}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={rolando || !meuCartao || meuCartao.iniciativa !== null}
          onClick={() => void rolar()}
          className={`${BOTAO_CHEIO} px-2 text-xs`}
        >
          {meuCartao?.iniciativa !== null && meuCartao ? `Iniciativa ${meuCartao.iniciativa}` : "Rolar iniciativa"}
        </button>
        <button type="button" onClick={() => abrirFicha()} className={`${BOTAO} px-2 text-xs`}>
          Minha ficha
        </button>
        <button type="button" onClick={() => abrirFicha("pedidos-ao-mestre")} className={`${BOTAO} px-2 text-xs`}>
          Pedir ao Mestre
        </button>
      </div>
      {aviso ? (
        <p role="status" className="text-tinta-700 mt-2 text-center text-xs">
          {aviso}
        </p>
      ) : null}
    </div>
  );
}

function SemCombate({ ehMestre }: { ehMestre: boolean }) {
  const [passados, setPassados] = useState<Awaited<ReturnType<typeof combatesPassados>> | null>(null);
  useEffect(() => {
    if (ehMestre) void combatesPassados().then(setPassados);
  }, [ehMestre]);

  return (
    <div className="py-6 text-center">
      <p className="text-tinta-700">Nenhum combate agora.</p>
      {ehMestre ? (
        <>
          <Link href="/mestre/encontros/" className={`${BOTAO_CHEIO} mt-4`}>
            Montar um encontro
          </Link>
          {passados?.length ? (
            <section className="mt-8 text-left">
              <h2 className="font-titulo text-tinta-900 text-center text-lg font-bold">
                {passados.length === 1 ? "1 combate até agora" : `${passados.length} combates até agora`}
              </h2>
              <ul className="mt-3 space-y-2">
                {passados.map(({ id, mesa, criado_em }) => (
                  <li key={id} className="border-dourado-600/30 rounded-sm border px-3 py-2 text-sm">
                    <p className="text-tinta-900 font-semibold">
                      Combate nº {mesa.numero ?? id} · {new Date(mesa.resumo?.data ?? criado_em).toLocaleDateString("pt-BR")}
                      {mesa.resumo ? ` · ${mesa.resumo.rodadas} ${mesa.resumo.rodadas === 1 ? "rodada" : "rodadas"}` : ""}
                    </p>
                    {mesa.resumo ? (
                      <p className="text-tinta-700 text-xs leading-relaxed">
                        Contra {mesa.resumo.inimigos.join(", ") || "ninguém"}. {mesa.resumo.personagens.join(", ")}
                        {mesa.resumo.xpPorCabeca ? ` ganharam ${mesa.resumo.xpPorCabeca} XP cada` : ""}.
                        {mesa.resumo.tesouro ? ` Tesouro: ${mesa.resumo.tesouro}.` : ""}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : (
        <p className="text-tinta-500 mt-2 text-sm">Quando o Mestre começar um, a faixa aparece no alto da tela.</p>
      )}
    </div>
  );
}

/**
 * Uma criatura que não está no Bestiário (o coveiro da aventura, um chefe
 * feito para a mesa): nome, CA, PV, bônus de iniciativa e XP, e ela entra
 * no combate como qualquer outra.
 */
function CriaturaDaCasa({ acrescentar }: { acrescentar: (c: CriaturaDeCombate) => void }) {
  const [c, setC] = useState({ nome: "", ca: 12, pv: 10, iniciativa: 0, xp: 50 });
  const numero = (campo: "ca" | "pv" | "iniciativa" | "xp", rotulo: string, min = 0) => (
    <label className="text-tinta-700 text-xs">
      {rotulo}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={c[campo]}
        onChange={(e) => setC({ ...c, [campo]: Math.floor(Number(e.target.value) || 0) })}
        className={`${CAMPO} mt-1 px-1 text-center`}
      />
    </label>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const nome = c.nome.trim();
        if (!nome) return;
        acrescentar({
          slug: `da-casa-${nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          nome,
          tipo: "Da casa",
          fonte: "monstro",
          nd: "–",
          ndNumero: 0,
          xp: Math.max(0, c.xp),
          ca: Math.max(1, c.ca),
          pv: Math.max(1, c.pv),
          pvDados: "",
          iniciativa: c.iniciativa,
        });
        setC({ ...c, nome: "" });
      }}
      className="border-dourado-600/30 mt-3 rounded-sm border p-2"
    >
      <p className="text-tinta-700 text-xs font-semibold">Criatura da casa (fora do Bestiário)</p>
      <label className="text-tinta-700 mt-1 block text-xs">
        Nome que os jogadores veem
        <input value={c.nome} maxLength={40} onChange={(e) => setC({ ...c, nome: e.target.value })} className={`${CAMPO} mt-1`} />
      </label>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {numero("ca", "CA", 1)}
        {numero("pv", "PV", 1)}
        {numero("iniciativa", "Inic. +", -5)}
        {numero("xp", "XP")}
      </div>
      <button type="submit" disabled={!c.nome.trim()} className={`${BOTAO} mt-2 w-full`}>
        Pôr no combate
      </button>
    </form>
  );
}
