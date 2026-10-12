"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { FichaDaCriatura, type Golpe } from "./FichaDaCriatura";

/** Um lutador do jeito que cada um pode ver. */
type Cartao = {
  id: string;
  tipo: Lutador["tipo"];
  slug: string;
  nome: string;
  iniciativa: number | null;
  condicoes: string[];
  imagem?: string;
  estado: string;
  pv?: number;
  pvMaximo?: number;
  ca?: number;
};

const COR_DO_ESTADO: Record<string, string> = {
  Ileso: "text-[#7fd17a]",
  Ferido: "text-[#f0c060]",
  "Muito ferido": "text-[#ff8f7a]",
  Caído: "text-[#b9aa96]",
  Fugiu: "text-[#b9aa96]",
};

/**
 * A arena do combate.
 *
 * O jogador vê os inimigos em cima e os aliados embaixo, cada um num
 * medalhão com o retrato; o próprio personagem fica no meio, maior. Tocar
 * num aliado abre a ficha dele (a própria, para editar: dano, magias,
 * poções). Os números dos inimigos aparecem como "???".
 *
 * O Mestre vê o contrário: os aventureiros em cima e as criaturas embaixo,
 * com tudo à mostra. Tocar numa criatura abre a ficha dela: os PV, os
 * ataques com o botão de usar (que marca alvo, dano, tipo e efeito), os
 * usos de cada habilidade e o loot. Tudo o que muda chega na hora à tela
 * de cada jogador, e o histórico guarda a ata da luta.
 */
export function Arena({
  personagens,
  bases,
  regras,
  fichasDoSite,
}: {
  personagens: PersonagemDoCombate[];
  bases: Record<string, BaseDaFicha>;
  regras: RegrasDaFicha;
  /** A ficha do site de cada personagem (números, poderes e mochila), já montada. */
  fichasDoSite: Record<string, ReactNode>;
}) {
  const conta = useConta();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const meu = conta.fase === "dentro" ? conta.perfil.personagem : null;
  const nomes = useMemo(() => Object.fromEntries(personagens.map((p) => [p.slug, p.nome])), [personagens]);

  const [mesa, setMesa] = useState<MesaDoCombate | null | undefined>(undefined);
  const [combate, setCombate] = useState<CombateAtivo | null | undefined>(undefined);
  const [fichas, setFichas] = useState<FichaViva[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState<string | null>(null);
  const [aliadoAberto, setAliadoAberto] = useState<string | null>(null);
  const [criaturaAberta, setCriaturaAberta] = useState<string | null>(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);
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
        fichas.map((f) => [f.personagem, [f.pv, f.ajustes?.pv_maximo ?? bases[f.personagem]?.pvMaximo ?? f.pv] as [number, number]])
      ),
    [fichas, bases]
  );

  // O Mestre salva um instante depois da última mudança, e a mesa de todos muda junto
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
    return ouvirIniciativas((personagem, valor, c) => {
      if (c === combateId) aplicar(personagem, valor);
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
  if (ehMestre && combate === undefined) return <p className="text-tinta-700 py-10 text-center italic">Arrumando a arena…</p>;
  if (ehMestre ? combate === null : !mesa) return <SemCombate ehMestre={ehMestre} />;

  // ---------- O que cada um vê ----------

  const retrato = (slug: string) => personagens.find((p) => p.slug === slug)?.imagem;
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
          imagem: l.tipo === "personagem" ? retrato(l.slug) : l.imagem,
          estado: l.fugiu ? "Fugiu" : estadoDosPv(pv, max),
          pv,
          pvMaximo: max,
          ca: l.ca,
        };
      })
    : (mesa?.ordem ?? []).map((l) => ({ ...l, imagem: l.tipo === "personagem" ? retrato(l.slug) : l.imagem }));

  const numero = estado?.numero ?? mesa?.numero;
  const rodada = estado?.rodada ?? mesa?.rodada ?? 1;
  const vez = estado?.vez ?? mesa?.vez ?? null;
  const daVez = cartoes.find((c) => c.id === vez);
  const historico = estado ? (estado.historico ?? []).map((r) => ({ rodada: r.rodada, texto: r.texto })) : (mesa?.historico ?? []);
  const aliados = cartoes.filter((c) => c.tipo === "personagem");
  const inimigos = cartoes.filter((c) => c.tipo === "criatura");
  const meuCartao = meu ? aliados.find((c) => c.slug === meu) : undefined;
  const minhaVez = Boolean(meuCartao && daVez?.id === meuCartao.id);

  // ---------- As mãos do Mestre ----------

  const mudar = (novo: Partial<EstadoDoCombate>) => setCombate((c) => (c ? { ...c, estado: { ...c.estado, ...novo } } : c));
  const anotar = (e: EstadoDoCombate, texto: string, publico = texto): EstadoDoCombate => ({
    ...e,
    historico: registrar(e, texto, publico),
  });
  const mudarLutador = (id: string, m: Partial<Lutador>, texto?: string, publico?: string) =>
    setCombate((c) => {
      if (!c) return c;
      const e = { ...c.estado, lutadores: c.estado.lutadores.map((l) => (l.id === id ? { ...l, ...m } : l)) };
      return { ...c, estado: texto ? anotar(e, texto, publico) : e };
    });

  function alternar(id: string) {
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  /** Dano ou cura direto nos alvos marcados (ou nos que vierem). */
  async function pv(delta: number, alvos: string[] = [...selecionados]) {
    if (!estado || !alvos.length || !delta) return;
    let novo = estado;
    for (const id of alvos) {
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
        novo = { ...novo, lutadores: novo.lutadores.map((x) => (x.id === id ? { ...x, pv: pvNovo } : x)) };
        const publico = delta < 0 ? `${l.nome} foi atingido${pvNovo === 0 ? " e caiu" : ""}.` : `${l.nome} se recuperou.`;
        novo = anotar(novo, `${l.nome}: ${delta < 0 ? `${-delta} de dano` : `+${delta} PV`} (${pvNovo}/${l.pvMaximo}).`, publico);
      }
    }
    mudar(novo);
    void lerFichas();
  }

  /**
   * Uma criatura usa uma habilidade: cada golpe tem alvo, acerto, dano, tipo
   * e efeito. Aplica tudo, conta o uso e escreve na ata.
   */
  async function golpear(autorId: string, habilidade: string, golpes: Golpe[], usos?: Record<string, number>) {
    if (!estado) return;
    let novo = estado;
    const autor = novo.lutadores.find((l) => l.id === autorId);
    if (!autor) return;
    if (usos) novo = { ...novo, lutadores: novo.lutadores.map((l) => (l.id === autorId ? { ...l, usos } : l)) };
    if (!golpes.length) novo = anotar(novo, `${autor.nome} usou ${habilidade}.`);
    for (const g of golpes) {
      const alvo = novo.lutadores.find((l) => l.id === g.alvo);
      if (!alvo) continue;
      const partes: string[] = [];
      const partesPublicas: string[] = [];
      if (!g.acertou) {
        partes.push("errou");
        partesPublicas.push("errou");
      } else {
        if (g.dano > 0) {
          if (alvo.tipo === "personagem") {
            const erro = await mestre.pv(alvo.slug, -g.dano, alvo.pvMaximo);
            if (erro) setAviso(`${alvo.nome}: ${erro}`);
          } else {
            const pvNovo = Math.max(0, alvo.pv - g.dano);
            novo = { ...novo, lutadores: novo.lutadores.map((l) => (l.id === alvo.id ? { ...l, pv: pvNovo } : l)) };
            if (pvNovo === 0) partesPublicas.push("caiu");
          }
          const dano = `${g.dano} de dano${g.tipo ? ` ${g.tipo}` : ""}`;
          partes.push(dano);
          partesPublicas.push(alvo.tipo === "personagem" ? dano : `acertou${g.tipo ? ` (${g.tipo})` : ""}`);
        } else {
          partes.push("acertou");
          partesPublicas.push("acertou");
        }
        if (g.condicao) {
          const atual = novo.lutadores.find((l) => l.id === alvo.id)!;
          if (!atual.condicoes.includes(g.condicao)) {
            novo = {
              ...novo,
              lutadores: novo.lutadores.map((l) => (l.id === alvo.id ? { ...l, condicoes: [...l.condicoes, g.condicao] } : l)),
            };
          }
          partes.push(`ficou ${g.condicao}`);
          partesPublicas.push(`ficou ${g.condicao}`);
        }
      }
      novo = anotar(
        novo,
        `${autor.nome} usou ${habilidade} em ${alvo.nome}: ${partes.join(", ")}.`,
        `${autor.nome} usou ${habilidade} em ${alvo.nome}: ${partesPublicas.join(", ")}.`
      );
    }
    mudar(novo);
    void lerFichas();
  }

  function condicao(c: string, alvos: string[] = [...selecionados]) {
    if (!estado || !c) return;
    let novo = estado;
    for (const id of alvos) {
      const l = novo.lutadores.find((x) => x.id === id);
      if (!l) continue;
      const tem = l.condicoes.includes(c);
      novo = {
        ...novo,
        lutadores: novo.lutadores.map((x) => (x.id === id ? { ...x, condicoes: tem ? x.condicoes.filter((y) => y !== c) : [...x.condicoes, c] } : x)),
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

  function iniciativaDosInimigos() {
    if (!estado) return;
    const novo = {
      ...estado,
      lutadores: estado.lutadores.map((l) => (l.tipo === "criatura" && l.iniciativa === null ? { ...l, iniciativa: d20() + l.bonusIniciativa } : l)),
    };
    mudar(anotar(novo, "Os inimigos rolaram a iniciativa."));
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

  function remover(id: string) {
    if (!estado) return;
    const l = estado.lutadores.find((x) => x.id === id);
    mudar(
      anotar(
        { ...estado, lutadores: estado.lutadores.filter((x) => x.id !== id), vez: estado.vez === id ? null : estado.vez },
        `Saiu do combate: ${l?.nome ?? "alguém"}.`
      )
    );
    setSelecionados((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }

  const criatura = criaturaAberta ? estado?.lutadores.find((l) => l.id === criaturaAberta) : undefined;
  const aliado = aliadoAberto ? cartoes.find((c) => c.slug === aliadoAberto && c.tipo === "personagem") : undefined;

  // ---------- As faixas da arena ----------

  const faixaDeInimigos = (
    <Faixa titulo="Inimigos" lado="inimigos">
      {inimigos.map((c) => (
        <CartaoDeInimigo
          key={c.id}
          c={c}
          vez={c.id === vez}
          escondido={!ehMestre}
          selecionado={selecionados.has(c.id)}
          abrir={ehMestre ? () => setCriaturaAberta(c.id) : undefined}
          marcar={ehMestre ? () => alternar(c.id) : undefined}
        />
      ))}
      {!inimigos.length ? <p className="text-sm text-[#e9dcc6] italic">Nenhum inimigo.</p> : null}
    </Faixa>
  );

  const outros = meuCartao ? aliados.filter((a) => a.id !== meuCartao.id) : aliados;
  const metade = Math.ceil(outros.length / 2);
  const faixaDeAliados = (
    <Faixa titulo="Aventureiros" lado="aliados">
      {meuCartao ? (
        <>
          {outros.slice(0, metade).map((c) => (
            <Medalhao key={c.id} c={c} vez={c.id === vez} abrir={() => setAliadoAberto(c.slug)} />
          ))}
          <Medalhao c={meuCartao} vez={meuCartao.id === vez} meu abrir={() => setAliadoAberto(meuCartao.slug)} />
          {outros.slice(metade).map((c) => (
            <Medalhao key={c.id} c={c} vez={c.id === vez} abrir={() => setAliadoAberto(c.slug)} />
          ))}
        </>
      ) : (
        aliados.map((c) => (
          <Medalhao
            key={c.id}
            c={c}
            vez={c.id === vez}
            selecionado={selecionados.has(c.id)}
            abrir={() => setAliadoAberto(c.slug)}
            marcar={ehMestre ? () => alternar(c.id) : undefined}
          />
        ))
      )}
    </Faixa>
  );

  return (
    <div className="pb-4">
      <div className="text-center">
        <p className="font-titulo text-tinta-500 text-xs tracking-[0.2em] uppercase">
          Combate{numero ? ` nº ${numero}` : ""}
          {estado?.dificuldade ? ` · ${estado.dificuldade}` : ""}
        </p>
        <p className="font-titulo text-tinta-900 mt-1 text-3xl font-bold">Rodada {rodada}</p>
        <p className={`mt-1 text-sm ${minhaVez ? "text-heraldico-vermelho font-bold" : "text-tinta-700"}`}>
          {daVez ? (minhaVez ? "Sua vez!" : `Vez de ${daVez.nome}`) : "Rolando a iniciativa"}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ol aria-label="Ordem de iniciativa" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {cartoes.map((c) => (
            <li
              key={c.id}
              aria-current={c.id === vez ? "step" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                c.id === vez
                  ? "border-heraldico-vermelho bg-heraldico-vermelho text-pergaminho-50"
                  : c.tipo === "personagem"
                    ? "border-[#3f6d8f]/50 text-tinta-900"
                    : "border-heraldico-vermelho/40 text-tinta-900"
              } ${c.estado === "Caído" || c.estado === "Fugiu" ? "opacity-50" : ""}`}
            >
              <span className="font-bold tabular-nums">{c.iniciativa ?? "–"}</span>
              <span className="max-w-24 truncate">{c.nome}</span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => setHistoricoAberto(true)} className={`${BOTAO} shrink-0 px-3 text-xs`}>
          Histórico{historico.length ? ` (${historico.length})` : ""}
        </button>
      </div>

      {/* A arena: muralha de pedra, areia no meio, tochas nas laterais */}
      <div className="arena-muralha relative mt-3 rounded-[1.75rem] p-2.5 sm:p-3.5">
        <Tocha lado="esquerda" />
        <Tocha lado="direita" />
        <div className="arena-areia relative space-y-4 rounded-[1.25rem] px-2 py-4 sm:px-4">
          {ehMestre ? faixaDeAliados : faixaDeInimigos}
          <div aria-hidden className="arena-risco mx-auto h-px w-3/4" />
          {ehMestre ? faixaDeInimigos : faixaDeAliados}
        </div>
      </div>

      {ehMestre && estado ? (
        <AtalhosDoMestre
          selecionados={selecionados.size}
          vezComecou={estado.vez !== null}
          aviso={aviso}
          dano={(n) => void pv(-n)}
          cura={(n) => void pv(n)}
          condicao={(c) => condicao(c)}
          proximo={proximo}
          iniciativa={iniciativaDosInimigos}
          acrescentar={acrescentar}
          todosInimigos={() => setSelecionados(new Set(inimigos.map((c) => c.id)))}
          limpar={() => setSelecionados(new Set())}
          terminar={() => setTerminando(true)}
        />
      ) : meu ? (
        <AtalhosDoJogador
          meuCartao={meuCartao}
          bonus={personagens.find((p) => p.slug === meu)?.iniciativa ?? 0}
          abrirFicha={() => setAliadoAberto(meu)}
        />
      ) : (
        <p className="text-tinta-500 mt-6 text-center text-sm">A sua conta ainda não está ligada a um personagem. O Mestre faz isso no painel dele.</p>
      )}

      <Janela aberta={Boolean(aliadoAberto)} aoFechar={() => setAliadoAberto(null)} titulo={aliadoAberto ? (nomes[aliadoAberto] ?? "Ficha") : "Ficha"} larga>
        {aliadoAberto ? (
          <div className="space-y-4">
            {aliado ? (
              <p className="text-tinta-700 text-sm">
                {aliado.pv !== undefined ? `${aliado.pv}/${aliado.pvMaximo} PV · ` : ""}
                {aliado.estado}
                {aliado.condicoes.length ? ` · ${aliado.condicoes.join(", ")}` : ""}
              </p>
            ) : null}
            {(aliadoAberto === meu || ehMestre) && bases[aliadoAberto] ? (
              <FichaVivaDoPersonagem slug={aliadoAberto} base={bases[aliadoAberto]} regras={regras} />
            ) : null}
            {ehMestre && aliado ? (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => alternar(aliado.id)} className={`${BOTAO} px-3 text-xs`}>
                  {selecionados.has(aliado.id) ? "Desmarcar como alvo" : "Marcar como alvo"}
                </button>
                <button type="button" onClick={() => (remover(aliado.id), setAliadoAberto(null))} className={`${BOTAO} px-3 text-xs`}>
                  Tirar do combate
                </button>
              </div>
            ) : null}
            {fichasDoSite[aliadoAberto] ? <div className="border-dourado-600/30 border-t pt-4">{fichasDoSite[aliadoAberto]}</div> : null}
          </div>
        ) : null}
      </Janela>

      {ehMestre && criatura && estado ? (
        <FichaDaCriatura
          lutador={criatura}
          alvos={cartoes.filter((c) => c.id !== criatura.id).map((c) => ({ id: c.id, nome: c.nome }))}
          personagens={aliados.map((a) => ({ slug: a.slug, nome: a.nome }))}
          aoFechar={() => setCriaturaAberta(null)}
          dano={(n) => void pv(-n, [criatura.id])}
          cura={(n) => void pv(n, [criatura.id])}
          condicao={(c) => condicao(c, [criatura.id])}
          mudar={(m, texto, publico) => mudarLutador(criatura.id, m, texto, publico)}
          golpear={(habilidade, golpes, usos) => golpear(criatura.id, habilidade, golpes, usos)}
          remover={() => (remover(criatura.id), setCriaturaAberta(null))}
          marcarComoAlvo={() => alternar(criatura.id)}
          ehAlvo={selecionados.has(criatura.id)}
        />
      ) : null}

      <Janela aberta={historicoAberto} aoFechar={() => setHistoricoAberto(false)} titulo="Histórico do combate">
        {historico.length ? (
          <ol className="space-y-1 text-sm">
            {[...historico].reverse().map((r, i) => (
              <li key={historico.length - i} className="text-tinta-700">
                <span className="text-tinta-500 mr-2 text-xs tabular-nums">R{r.rodada}</span>
                {r.texto}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-tinta-500 text-sm italic">Nada aconteceu ainda.</p>
        )}
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

function Faixa({ titulo, lado, children }: { titulo: string; lado: "inimigos" | "aliados"; children: ReactNode }) {
  return (
    <section aria-label={titulo}>
      <h2
        className={`font-titulo mb-2 text-center text-[0.7rem] font-bold tracking-[0.25em] uppercase ${
          lado === "aliados" ? "text-[#a8cbe6]" : "text-[#ff9d8a]"
        }`}
      >
        {titulo}
      </h2>
      <ul className="flex flex-wrap items-end justify-center gap-x-3 gap-y-3">{children}</ul>
    </section>
  );
}

function Tocha({ lado }: { lado: "esquerda" | "direita" }) {
  return (
    <span aria-hidden className={`arena-tocha pointer-events-none absolute top-4 ${lado === "esquerda" ? "-left-1.5" : "-right-1.5"}`}>
      <span className="arena-chama" />
    </span>
  );
}

function Barra({ pv, max }: { pv: number; max: number }) {
  const f = max ? Math.min(1, pv / max) : 0;
  return (
    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-black/40" aria-hidden>
      <span className={`block h-full rounded-full ${f > 0.5 ? "bg-[#5cb85c]" : f > 0.25 ? "bg-[#e0a030]" : "bg-[#e0533f]"}`} style={{ width: `${f * 100}%` }} />
    </span>
  );
}

/** Um aliado: o retrato num medalhão redondo. O do próprio jogador é maior e dourado. */
function Medalhao({
  c,
  vez,
  meu = false,
  selecionado = false,
  abrir,
  marcar,
}: {
  c: Cartao;
  vez: boolean;
  meu?: boolean;
  selecionado?: boolean;
  abrir: () => void;
  marcar?: () => void;
}) {
  const caido = c.estado === "Caído";
  return (
    <li className={`relative flex flex-col items-center ${meu ? "w-28 sm:w-32" : "w-[4.75rem] sm:w-24"}`}>
      <button
        type="button"
        onClick={abrir}
        aria-label={`Abrir a ficha de ${c.nome}`}
        className={`relative block aspect-square w-full overflow-hidden rounded-full border-4 bg-[#2a1e14] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 ${
          vez ? "border-[#ffcf6b] ring-4 ring-[#c0392b]/80" : meu ? "border-[#e6b94c]" : "border-[#8b6a43]"
        } ${selecionado ? "ring-4 ring-[#7fd0ff]" : ""}`}
      >
        {c.imagem ? <Image src={c.imagem} alt="" fill sizes="128px" className={`object-cover object-top ${caido ? "grayscale" : ""}`} /> : null}
      </button>
      <span className="bg-madeira-900 text-pergaminho-50 absolute top-0 left-0 rounded-full px-1.5 text-[0.65rem] font-bold tabular-nums shadow">
        {c.iniciativa ?? "–"}
      </span>
      {marcar ? (
        <button
          type="button"
          onClick={marcar}
          aria-pressed={selecionado}
          aria-label={`${selecionado ? "Desmarcar" : "Marcar"} ${c.nome} como alvo`}
          className={`absolute top-0 right-0 grid size-8 place-items-center rounded-full border text-sm font-bold shadow ${
            selecionado ? "border-[#7fd0ff] bg-[#7fd0ff] text-[#10202c]" : "border-[#c9b08a] bg-[#2a1e14] text-[#c9b08a]"
          }`}
        >
          ◎
        </button>
      ) : null}
      <span className={`font-titulo mt-1 w-full truncate text-center leading-tight font-bold text-[#f3e6cf] ${meu ? "text-sm" : "text-xs"}`}>
        {meu ? "Você" : c.nome.split(" ")[0]}
      </span>
      {c.pv !== undefined && c.pvMaximo ? (
        <>
          <span className="text-[0.7rem] text-[#e9dcc6] tabular-nums">
            {c.pv}/{c.pvMaximo} PV
          </span>
          <Barra pv={c.pv} max={c.pvMaximo} />
        </>
      ) : (
        <span className={`text-[0.7rem] font-semibold ${COR_DO_ESTADO[c.estado] ?? "text-[#e9dcc6]"}`}>{c.estado}</span>
      )}
      {c.condicoes.length ? <span className="text-center text-[0.62rem] leading-tight text-[#ffb3a3]">{c.condicoes.join(", ")}</span> : null}
    </li>
  );
}

/** Um inimigo: a arte num cartão. Para os jogadores, os números são "???". */
function CartaoDeInimigo({
  c,
  vez,
  escondido,
  selecionado,
  abrir,
  marcar,
}: {
  c: Cartao;
  vez: boolean;
  escondido: boolean;
  selecionado: boolean;
  abrir?: () => void;
  marcar?: () => void;
}) {
  const fora = c.estado === "Caído" || c.estado === "Fugiu";
  const corpo = (
    <>
      <span className="relative block aspect-square w-full overflow-hidden rounded-md bg-[#2a1e14]">
        {c.imagem ? <Image src={c.imagem} alt="" fill sizes="140px" className={`object-cover ${fora ? "grayscale" : ""}`} /> : null}
        <span className="bg-madeira-900/90 text-pergaminho-50 absolute top-1 left-1 rounded-sm px-1.5 text-[0.65rem] font-bold tabular-nums">
          {c.iniciativa ?? "–"}
        </span>
      </span>
      <span className="font-titulo mt-1 block truncate text-xs leading-tight font-bold text-[#f3e6cf]">
        {vez ? <span className="text-[#ffcf6b]">▶ </span> : null}
        {c.nome}
      </span>
      <span className="block text-[0.68rem] text-[#e9dcc6] tabular-nums">
        CA {escondido ? "???" : (c.ca ?? "–")} · PV {escondido ? "???" : `${c.pv}/${c.pvMaximo}`}
      </span>
      {!escondido && c.pv !== undefined && c.pvMaximo ? <Barra pv={c.pv} max={c.pvMaximo} /> : null}
      <span className={`block text-[0.68rem] font-semibold ${COR_DO_ESTADO[c.estado] ?? "text-[#e9dcc6]"}`}>{c.estado}</span>
      {c.condicoes.length ? <span className="block text-[0.62rem] leading-tight text-[#ffb3a3]">{c.condicoes.join(", ")}</span> : null}
    </>
  );
  return (
    <li
      className={`relative w-[6.5rem] rounded-lg border-2 bg-[#3a2a1c]/90 p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.45)] sm:w-32 ${
        selecionado ? "border-[#7fd0ff]" : vez ? "border-[#ffcf6b]" : "border-[#7a2b22]"
      } ${fora ? "opacity-55" : ""}`}
    >
      {abrir ? (
        <button type="button" onClick={abrir} aria-label={`Abrir a ficha de ${c.nome}`} className="block w-full text-left">
          {corpo}
        </button>
      ) : (
        corpo
      )}
      {marcar ? (
        <button
          type="button"
          onClick={marcar}
          aria-pressed={selecionado}
          aria-label={`${selecionado ? "Desmarcar" : "Marcar"} ${c.nome} como alvo`}
          className={`absolute -top-2 -right-2 grid size-8 place-items-center rounded-full border text-sm font-bold shadow ${
            selecionado ? "border-[#7fd0ff] bg-[#7fd0ff] text-[#10202c]" : "border-[#c9b08a] bg-[#2a1e14] text-[#c9b08a]"
          }`}
        >
          ◎
        </button>
      ) : null}
    </li>
  );
}

function AtalhosDoMestre(p: {
  selecionados: number;
  vezComecou: boolean;
  aviso: string | null;
  dano: (n: number) => void;
  cura: (n: number) => void;
  condicao: (c: string) => void;
  proximo: () => void;
  iniciativa: () => void;
  acrescentar: (c: CriaturaDeCombate) => void;
  todosInimigos: () => void;
  limpar: () => void;
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
      setCriaturas((await (await fetch("/monstros/combate.json")).json()) as CriaturaDeCombate[]);
    } catch {
      setCriaturas([]);
    }
  }

  return (
    <div className="border-heraldico-vermelho/30 bg-pergaminho-50/95 sticky bottom-[4.5rem] z-10 mt-4 rounded-sm border-2 p-3 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-tinta-700">
          {semAlvo ? "◎ marca alvos. Tocar no inimigo abre a ficha dele, com os ataques." : `${p.selecionados} ${p.selecionados === 1 ? "alvo" : "alvos"}`}
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
          aria-label="Pôr ou tirar uma condição dos alvos"
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
        <summary className="text-tinta-700 min-h-9 cursor-pointer text-xs">Acrescentar criatura (do Bestiário ou da casa)</summary>
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
            Do Bestiário
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
      </details>
      {p.aviso ? <p className="text-heraldico-vermelho mt-2 text-xs">{p.aviso}</p> : null}
    </div>
  );
}

function AtalhosDoJogador({ meuCartao, bonus, abrirFicha }: { meuCartao?: Cartao; bonus: number; abrirFicha: () => void }) {
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
    <div className="border-dourado-600/50 bg-pergaminho-50/95 sticky bottom-[4.5rem] z-10 mt-4 rounded-sm border-2 p-3 shadow-lg backdrop-blur-sm">
      {!meuCartao ? <p className="text-tinta-700 mb-2 text-center text-sm">O seu personagem não está neste combate.</p> : null}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={rolando || !meuCartao || meuCartao.iniciativa !== null}
          onClick={() => void rolar()}
          className={`${BOTAO_CHEIO} px-2 text-xs`}
        >
          {meuCartao && meuCartao.iniciativa !== null ? `Iniciativa ${meuCartao.iniciativa}` : "Rolar iniciativa"}
        </button>
        <button type="button" onClick={abrirFicha} className={`${BOTAO} px-2 text-xs`}>
          Minha ficha e pedidos
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

/**
 * Uma criatura que não está no Bestiário (o coveiro da aventura, um chefe
 * feito para a mesa): nome, CA, PV, bônus de iniciativa e XP.
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
