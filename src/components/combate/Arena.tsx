"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CONDICOES,
  acoesPendentes,
  combateAtivo,
  combatesPassados,
  gravarEventos,
  iniciativasDosJogadores,
  lerMesaDoCombate,
  mandarAcao,
  marcarAcaoFeita,
  ordenar,
  ouvirAcoes,
  ouvirCombate,
  ouvirIniciativas,
  registrar,
  retratoDaMesa,
  salvarCombate,
  ultimoEventoGravado,
  versaoDaMesa,
  type AcaoDoJogador,
  type AcaoRecebida,
  type CombateAtivo,
  type EstadoDoCombate,
  type GolpeNaTela,
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
import { Palco, type Cartao } from "./Palco";
import { Historico } from "./Historico";
import { IniciativaDoJogador, IniciativaDoMestre } from "./Iniciativa";
import { PainelDaCriatura, PainelDoAventureiro, PainelDoInimigo, type Golpe } from "./PainelDoLutador";
import { RolagemDoAtaque, type AtaqueEscolhido, type ResultadoDoAtaque } from "./RolagemDoAtaque";
import { ajustarBase, conjuracaoComAjustes, nivelComAjustes, pvMaximoComAjustes } from "@/lib/ajustes-da-ficha";
import { magiasDoPersonagem, truquesAgonizantes, type MagiaNaArena } from "@/lib/magias-arena";
import { mudarFicha } from "@/lib/ficha-viva";
import { MagiasDoAventureiro, ResolverMagia, type Conjuracao } from "./MagiasNaArena";

/** O que o desfazer precisa para voltar atrás: o estado de antes e os PV mexidos nas fichas. */
type Passo = {
  estado: EstadoDoCombate;
  pvs: { slug: string; delta: number; max: number }[];
  /** Os espaços de magia gastos neste passo, para o desfazer devolver. */
  espacos?: { slug: string; circulo: number }[];
  rotulo: string;
};

/** A mira: quem ataca, com quê, e quantos ataques ainda faltam (os feixes de uma magia). */
type Mira = { autor: string; ataque: AtaqueEscolhido; alvo?: string; restam?: number };

/**
 * A arena do combate, como um jogo de cartas por turnos.
 *
 * Rodada 0: todos rolam a iniciativa (o Mestre pode rolar ou digitar a de
 * cada um). Daí a arena passa a vez em ordem. Tocar num lutador abre a
 * ficha dele em sanfona, embaixo da fileira: ataques, condições, PV, o que
 * carrega. Atacar é escolher a arma, tocar no alvo e rolar: o acerto sai
 * contra a CA, o dano já vem com o bônus da arma, e o golpe anima na tela
 * de todos ao mesmo tempo.
 *
 * O jogador age na vez dele com o próprio personagem, e vale na hora: a
 * tela do Mestre aplica. O Mestre controla tudo e desfaz o que precisar.
 * Cada momento fica gravado para ser assistido depois.
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
  const [aviso, setAviso] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null);
  const [fichaInteira, setFichaInteira] = useState<string | null>(null);
  const [mira, setMira] = useState<Mira | null>(null);
  const [terminando, setTerminando] = useState(false);
  const [rotuloDesfazer, setRotuloDesfazer] = useState<string | null>(null);
  const [todasAsMagias, setTodasAsMagias] = useState<MagiaNaArena[] | null>(null);

  const estadoRef = useRef<EstadoDoCombate | null>(null);
  const pilha = useRef<Passo[]>([]);
  const salvarDepois = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const gravado = useRef<number | null>(null);
  const golpeGravado = useRef<number>(0);
  const feitas = useRef<Set<number>>(new Set());

  useEffect(() => {
    void iniciarConta();
  }, []);

  // O grimório da arena só desce quando alguém abre um lutador
  useEffect(() => {
    if (!aberto || todasAsMagias || !(ehMestre || meu)) return;
    let vivo = true;
    fetch("/magias/arena.json")
      .then((r) => r.json() as Promise<MagiaNaArena[]>)
      .then((l) => vivo && setTodasAsMagias(l))
      .catch(() => vivo && setTodasAsMagias([]));
    return () => {
      vivo = false;
    };
  }, [aberto, todasAsMagias, ehMestre, meu]);

  const lerMesa = useCallback(() => void lerMesaDoCombate().then(setMesa), []);
  const lerFichas = useCallback(async () => setFichas(await lerTodasAsFichas()), []);

  useEffect(() => {
    if (conta.fase !== "dentro") return;
    lerMesa();
    const pararMesa = ouvirCombate(lerMesa);
    if (!ehMestre) {
      // O jogador lê só a própria ficha (o banco só devolve a dele): os espaços de magia
      void lerFichas();
      const pararMinha = meu ? ouvirMesa((t) => t === "fichas" && void lerFichas(), meu, ["fichas"]) : () => {};
      return () => {
        pararMesa();
        pararMinha();
      };
    }
    void combateAtivo().then((c) => {
      estadoRef.current = c?.estado ?? null;
      setCombate(c);
    });
    void lerFichas();
    const pararFichas = ouvirMesa((t) => t === "fichas" && void lerFichas(), undefined, ["fichas"]);
    return () => {
      pararMesa();
      pararFichas();
    };
  }, [conta.fase, ehMestre, meu, lerMesa, lerFichas]);

  const pvs = useMemo(
    () =>
      Object.fromEntries(
        fichas.map((f) => [f.personagem, [f.pv, pvMaximoComAjustes(bases[f.personagem]?.pvMaximo ?? f.pv, f.ajustes)] as [number, number]])
      ),
    [fichas, bases]
  );
  const pvsRef = useRef(pvs);
  pvsRef.current = pvs;
  const fichasRef = useRef(fichas);
  fichasRef.current = fichas;

  /** Gasta (ou devolve, com -1) um espaço de magia na ficha viva. */
  const mexerNoEspaco = useCallback(async (slug: string, circulo: number, delta: number) => {
    const f = fichasRef.current.find((x) => x.personagem === slug);
    if (!f) return "A ficha viva deste personagem não está liberada.";
    const gastos = { ...(f.espacos_gastos ?? {}) };
    gastos[circulo] = Math.max(0, (gastos[circulo] ?? 0) + delta);
    return mudarFicha(slug, { espacos_gastos: gastos });
  }, []);

  // O Mestre salva um instante depois da última mudança; a mesa de todos muda junto, e cada linha nova fica gravada
  useEffect(() => {
    if (!ehMestre || !combate) return;
    clearTimeout(salvarDepois.current);
    salvarDepois.current = setTimeout(async () => {
      const versao = versaoDaMesa(combate.estado, pvs);
      const erro = await salvarCombate(combate.id, combate.estado, versao);
      if (erro) {
        setAviso(`Não salvou: ${erro}`);
        return;
      }
      if (gravado.current === null) return;
      const desde = gravado.current;
      const novos = (combate.estado.historico ?? []).filter((r) => (r.seq ?? 0) > desde);
      if (!novos.length) return;
      // O retrato dos aventureiros vai junto, para a gravação ter os rostos
      const ordem = retratoDaMesa(versao).map((l) => (l.tipo === "personagem" && !l.imagem ? { ...l, imagem: personagens.find((p) => p.slug === l.id)?.imagem } : l));
      const golpe = combate.estado.golpe && combate.estado.golpe.id > golpeGravado.current ? combate.estado.golpe : undefined;
      if (golpe) golpeGravado.current = golpe.id;
      gravado.current = novos.at(-1)!.seq!;
      void gravarEventos(
        combate.id,
        novos.map((r, i) => ({ seq: r.seq!, rodada: r.rodada, texto: r.publico, vez: combate.estado.vez, ordem, golpe: i === novos.length - 1 ? golpe : undefined }))
      );
    }, 350);
  }, [ehMestre, combate, pvs, personagens]);

  const combateId = combate?.id;

  // Até onde este combate já está gravado
  useEffect(() => {
    if (!ehMestre || !combateId) return;
    gravado.current = null;
    void ultimoEventoGravado(combateId).then((n) => (gravado.current = n));
  }, [ehMestre, combateId]);

  // ---------- As mãos do Mestre ----------

  /** Troca o estado inteiro, guarda o passo para desfazer e mexe nas fichas vivas. */
  const aplicar = useCallback(
    (novo: EstadoDoCombate, rotulo: string, mudancas: Passo["pvs"] = [], espacos: Passo["espacos"] = []) => {
      const antes = estadoRef.current;
      if (!antes) return;
      pilha.current = [...pilha.current, { estado: antes, pvs: mudancas, espacos, rotulo }].slice(-40);
      setRotuloDesfazer(rotulo);
      estadoRef.current = novo;
      setCombate((c) => (c ? { ...c, estado: novo } : c));
      if (mudancas.length) {
        void Promise.all(mudancas.map((m) => mestre.pv(m.slug, m.delta, m.max))).then((erros) => {
          const e = erros.find(Boolean);
          if (e) setAviso(e);
          void lerFichas();
        });
      }
      for (const g of espacos) {
        void mexerNoEspaco(g.slug, g.circulo, 1).then((erro) => {
          if (erro) setAviso(erro);
          void lerFichas();
        });
      }
    },
    [lerFichas, mexerNoEspaco]
  );

  const anotar = (e: EstadoDoCombate, texto: string, publico = texto): EstadoDoCombate => ({ ...e, historico: registrar(e, texto, publico) });
  const trocar = (e: EstadoDoCombate, id: string, m: Partial<Lutador>): EstadoDoCombate => ({
    ...e,
    lutadores: e.lutadores.map((l) => (l.id === id ? { ...l, ...m } : l)),
  });
  const golpe = (de: string, para: string, acertou: boolean, rotulo: string, extra: Partial<GolpeNaTela> = {}): GolpeNaTela => ({
    id: Date.now(),
    de,
    para,
    acertou,
    rotulo,
    ...extra,
  });
  const pvDe = (l: Lutador): [number, number] => (l.tipo === "personagem" ? (pvsRef.current[l.slug] ?? [l.pvMaximo, l.pvMaximo]) : [l.pv, l.pvMaximo]);

  /** Um ataque com jogada: do Mestre (já sabe se acertou) ou do jogador (compara aqui). */
  function resolverAtaque(autorId: string, alvoId: string, arma: string, r: ResultadoDoAtaque) {
    const e = estadoRef.current;
    if (!e) return;
    const autor = e.lutadores.find((l) => l.id === autorId);
    const alvo = e.lutadores.find((l) => l.id === alvoId);
    if (!autor || !alvo) return;
    const acertou = r.acertou ?? (r.natural === 20 || (r.natural !== 1 && r.total >= alvo.ca));
    const critico = acertou && r.natural === 20;
    const rolagem = r.natural ? `${r.total} (d20 ${r.natural})` : String(r.total);
    const partes = [`${rolagem} contra CA ${alvo.ca}`];
    const publicas: string[] = [];
    const mudancas: Passo["pvs"] = [];
    let novo = e;
    let rotulo = "Errou!";

    if (!acertou) {
      partes.push("errou");
      publicas.push("errou");
    } else {
      partes.push(critico ? "acerto crítico" : "acertou");
      publicas.push(critico ? "acerto crítico" : "acertou");
      rotulo = r.dano > 0 ? `−${r.dano}` : critico ? "Crítico!" : "Acertou!";
      if (r.dano > 0) {
        const [pv, max] = pvDe(alvo);
        const resto = Math.max(0, pv - r.dano);
        const dano = `${r.dano} de dano${r.tipo ? ` ${r.tipo}` : ""}`;
        if (alvo.tipo === "personagem") mudancas.push({ slug: alvo.slug, delta: -r.dano, max });
        else novo = trocar(novo, alvo.id, { pv: resto });
        partes.push(`${dano} (${resto}/${max})`);
        publicas.push(alvo.tipo === "personagem" ? `${dano} (${resto}/${max})` : dano);
        if (resto === 0) {
          partes.push("caiu");
          publicas.push("caiu");
        }
      }
      if (r.condicao && !alvo.condicoes.includes(r.condicao)) {
        novo = trocar(novo, alvo.id, { condicoes: [...alvo.condicoes, r.condicao] });
        partes.push(`ficou ${r.condicao}`);
        publicas.push(`ficou ${r.condicao}`);
      }
    }
    novo = anotar(novo, `${autor.nome} atacou ${alvo.nome} com ${arma}: ${partes.join(", ")}.`, `${autor.nome} atacou ${alvo.nome} com ${arma}: ${publicas.join(", ")}.`);
    novo = { ...novo, golpe: golpe(autor.id, alvo.id, acertou, rotulo, { critico }) };
    if (e.vez === autor.id) novo = { ...novo, ataquesNoTurno: (e.ataquesNoTurno ?? 0) + 1 };
    aplicar(novo, `ataque de ${autor.nome}`, mudancas);
  }

  /** Uma habilidade sem jogada de ataque (sopro, grito, magia em área). */
  function usarHabilidade(autorId: string, habilidade: string, golpes: Golpe[], usos?: Record<string, number>) {
    const e = estadoRef.current;
    if (!e) return;
    const autor = e.lutadores.find((l) => l.id === autorId);
    if (!autor) return;
    let novo = usos ? trocar(e, autorId, { usos }) : e;
    const mudancas: Passo["pvs"] = [];
    if (!golpes.length) novo = anotar(novo, `${autor.nome} usou ${habilidade}.`);
    let primeiro: GolpeNaTela | undefined;
    for (const g of golpes) {
      const alvo = novo.lutadores.find((l) => l.id === g.alvo);
      if (!alvo) continue;
      const partes: string[] = [];
      const publicas: string[] = [];
      if (!g.acertou) {
        partes.push("não pegou");
        publicas.push("não pegou");
      } else {
        if (g.dano > 0) {
          const [pv, max] = pvDe(alvo);
          const resto = Math.max(0, pv - g.dano);
          if (alvo.tipo === "personagem") mudancas.push({ slug: alvo.slug, delta: -g.dano, max });
          else novo = trocar(novo, alvo.id, { pv: resto });
          const dano = `${g.dano} de dano${g.tipo ? ` ${g.tipo}` : ""}`;
          partes.push(`${dano} (${resto}/${max})`);
          publicas.push(alvo.tipo === "personagem" ? `${dano} (${resto}/${max})` : dano);
          if (resto === 0) {
            partes.push("caiu");
            publicas.push("caiu");
          }
        }
        if (g.condicao && !alvo.condicoes.includes(g.condicao)) {
          novo = trocar(novo, alvo.id, { condicoes: [...alvo.condicoes, g.condicao] });
          partes.push(`ficou ${g.condicao}`);
          publicas.push(`ficou ${g.condicao}`);
        }
      }
      primeiro ??= golpe(autor.id, alvo.id, g.acertou, g.acertou ? (g.dano ? `−${g.dano}` : g.condicao || habilidade) : "Resistiu");
      novo = anotar(novo, `${autor.nome} usou ${habilidade} em ${alvo.nome}: ${partes.join(", ") || "acertou"}.`, `${autor.nome} usou ${habilidade} em ${alvo.nome}: ${publicas.join(", ") || "acertou"}.`);
    }
    if (primeiro) novo = { ...novo, golpe: primeiro };
    aplicar(novo, `${habilidade} de ${autor.nome}`, mudancas);
  }

  /**
   * Uma magia conjurada: gasta o espaço, anota no histórico e cuida da
   * concentração. Cura e dano sem teste valem na hora; a salvaguarda fica
   * esperando o Mestre dizer quem passou. O ataque mágico segue pela mira.
   */
  function conjurar(autorId: string, d: Conjuracao) {
    const e = estadoRef.current;
    if (!e) return;
    const autor = e.lutadores.find((l) => l.id === autorId);
    if (!autor) return;
    let novo = e;
    const circulo = d.circulo > 0 ? ` (${d.circulo}º círculo)` : "";
    if (d.concentracao) {
      if (autor.concentrando && autor.concentrando !== d.magia) novo = anotar(novo, `${autor.nome} parou de se concentrar em ${autor.concentrando}.`);
      novo = trocar(novo, autor.id, { concentrando: d.magia });
    }
    const espacos = d.circulo > 0 && autor.tipo === "personagem" ? [{ slug: autor.slug, circulo: d.circulo }] : [];
    const mudancas: Passo["pvs"] = [];

    if ((d.modo === "direto" || d.modo === "cura") && d.alvos?.length) {
      const cura = d.modo === "cura";
      let primeiro: GolpeNaTela | undefined;
      const partes: string[] = [];
      for (const a of d.alvos) {
        const alvo = novo.lutadores.find((l) => l.id === a.id);
        if (!alvo || !a.valor) continue;
        const [pv, max] = pvDe(alvo);
        const resto = cura ? Math.min(max, pv + a.valor) : Math.max(0, pv - a.valor);
        if (alvo.tipo === "personagem") mudancas.push({ slug: alvo.slug, delta: resto - pv, max });
        else novo = trocar(novo, alvo.id, { pv: resto });
        partes.push(`${alvo.nome} ${cura ? `recuperou ${resto - pv}` : `sofreu ${a.valor}${d.tipoDano ? ` de dano ${d.tipoDano}` : ""}`}${resto === 0 ? " e caiu" : ""}`);
        primeiro ??= golpe(autor.id, alvo.id, true, cura ? `+${resto - pv}` : `−${a.valor}`, cura ? { cura: true } : {});
      }
      novo = anotar(novo, `${autor.nome} conjurou ${d.magia}${circulo}: ${partes.join("; ") || "sem efeito"}.`);
      if (primeiro) novo = { ...novo, golpe: primeiro };
    } else if (d.modo === "salvaguarda" && d.alvos?.length) {
      const nomes = d.alvos.map((a) => novo.lutadores.find((l) => l.id === a.id)?.nome ?? "?").join(", ");
      novo = anotar(novo, `${autor.nome} conjurou ${d.magia}${circulo} em ${nomes}: salvaguarda de ${d.salvaguarda} (CD ${d.cd}).`);
      const pendente = {
        id: Date.now(),
        autor: autor.id,
        magia: d.magia,
        cd: d.cd ?? 10,
        salvaguarda: d.salvaguarda ?? "",
        metade: !!d.metade,
        dano: d.dano ?? 0,
        tipo: d.tipoDano ?? "",
        condicao: d.condicao,
        alvos: d.alvos.map((a) => a.id),
      };
      novo = { ...novo, pendentes: [...(novo.pendentes ?? []), pendente] };
    } else {
      novo = anotar(novo, `${autor.nome} conjurou ${d.magia}${circulo}.`);
    }
    aplicar(novo, `${d.magia} de ${autor.nome}`, mudancas, espacos);
  }

  /** O Mestre disse quem passou na salvaguarda: aplica como uma habilidade. */
  function resolverPendente(id: number, golpes: Golpe[]) {
    const e = estadoRef.current;
    const p = e?.pendentes?.find((x) => x.id === id);
    if (!e || !p) return;
    estadoRef.current = { ...e, pendentes: e.pendentes!.filter((x) => x.id !== id) };
    usarHabilidade(p.autor, p.magia, golpes);
  }

  function descartarPendente(id: number) {
    const e = estadoRef.current;
    if (!e?.pendentes) return;
    aplicar({ ...e, pendentes: e.pendentes.filter((x) => x.id !== id) }, "descartar a magia");
  }

  function pararConcentracao(id: string) {
    const e = estadoRef.current;
    const l = e?.lutadores.find((x) => x.id === id);
    if (!e || !l?.concentrando) return;
    aplicar(anotar(trocar(e, id, { concentrando: undefined }), `${l.nome} parou de se concentrar em ${l.concentrando}.`), "parar a concentração");
  }

  /** Dano ou cura direto (sem jogada), em um ou em vários. */
  function mexerNosPv(ids: string[], delta: number) {
    const e = estadoRef.current;
    if (!e || !ids.length || !delta) return;
    let novo = e;
    const mudancas: Passo["pvs"] = [];
    for (const id of ids) {
      const l = novo.lutadores.find((x) => x.id === id);
      if (!l) continue;
      const [pv, max] = pvDe(l);
      const depois = Math.max(0, Math.min(max, pv + delta));
      if (l.tipo === "personagem") mudancas.push({ slug: l.slug, delta, max });
      else novo = trocar(novo, id, { pv: depois });
      const texto = `${l.nome}: ${delta < 0 ? `${-delta} de dano` : `+${delta} PV`} (${depois}/${max}).`;
      const publico = l.tipo === "personagem" ? texto : delta < 0 ? `${l.nome} sofreu ${-delta} de dano${depois === 0 ? " e caiu" : ""}.` : `${l.nome} se recuperou.`;
      novo = anotar(novo, texto, publico);
    }
    if (ids.length === 1) novo = { ...novo, golpe: golpe(ids[0], ids[0], delta < 0, delta < 0 ? `−${-delta}` : `+${delta}`, { cura: delta > 0 }) };
    aplicar(novo, delta < 0 ? "dano" : "cura", mudancas);
  }

  function condicaoEm(id: string, c: string, tirar: boolean, motivo?: string) {
    const e = estadoRef.current;
    const l = e?.lutadores.find((x) => x.id === id);
    if (!e || !l || !c) return;
    const tem = l.condicoes.includes(c);
    if (tirar ? !tem : tem) return;
    let novo = trocar(e, id, { condicoes: tirar ? l.condicoes.filter((x) => x !== c) : [...l.condicoes, c] });
    novo = anotar(novo, tirar ? `${l.nome} não está mais ${c}${motivo ? ` (${motivo})` : ""}.` : `${l.nome} ficou ${c}.`);
    aplicar(novo, tirar ? `tirar ${c}` : `pôr ${c}`);
  }

  function tentarSair(id: string, c: string, total: number, saiu: boolean) {
    const e = estadoRef.current;
    const l = e?.lutadores.find((x) => x.id === id);
    if (!e || !l) return;
    let novo = saiu ? trocar(e, id, { condicoes: l.condicoes.filter((x) => x !== c) }) : e;
    novo = anotar(novo, `${l.nome} tentou sair de ${c}: ${total}, ${saiu ? "conseguiu" : "não conseguiu"}.`);
    novo = { ...novo, golpe: golpe(id, id, saiu, saiu ? `Livre de ${c}!` : "Preso", { cura: saiu }) };
    aplicar(novo, `teste de ${l.nome}`);
  }

  function definirIniciativas(valores: Record<string, number | null>) {
    const e = estadoRef.current;
    if (!e) return;
    let novo = { ...e, lutadores: e.lutadores.map((l) => (l.id in valores ? { ...l, iniciativa: valores[l.id] } : l)) };
    const roladas = Object.entries(valores).filter(([, v]) => v !== null);
    if (roladas.length > 1) novo = anotar(novo, `Iniciativa rolada: ${roladas.map(([id, v]) => `${e.lutadores.find((l) => l.id === id)?.nome} ${v}`).join(", ")}.`);
    // Um número digitado não precisa de linha no histórico nem de desfazer: vai mudando
    estadoRef.current = novo;
    setCombate((c) => (c ? { ...c, estado: novo } : c));
  }

  /** Quem pode ter a vez: criatura caída ou que fugiu fica de fora. */
  const podeAgir = (l: Lutador) => l.tipo === "personagem" || (l.pv > 0 && !l.fugiu);

  function proximoTurno(pular = false) {
    const e = estadoRef.current;
    if (!e) return;
    const ordem = ordenar(e.lutadores);
    const ativos = ordem.filter(podeAgir);
    if (!ativos.length) return;
    let novo: EstadoDoCombate = { ...e, ataquesNoTurno: 0 };
    const atual = ordem.find((l) => l.id === e.vez);
    if (pular && atual) novo = anotar(novo, `${atual.nome} passou a vez.`);
    if (e.rodada === 0 || e.vez === null || !atual) {
      const rodada = Math.max(1, e.rodada);
      novo = anotar({ ...novo, rodada, vez: ativos[0].id }, `Começou a rodada ${rodada}. Vez de ${ativos[0].nome}.`);
    } else {
      const i = ordem.findIndex((l) => l.id === e.vez);
      const seguinte = [...ordem.slice(i + 1), ...ordem.slice(0, i + 1)].find(podeAgir)!;
      const virou = ordem.indexOf(seguinte) <= i;
      if (virou) novo = anotar({ ...novo, rodada: e.rodada + 1, vez: seguinte.id }, `Começou a rodada ${e.rodada + 1}. Vez de ${seguinte.nome}.`);
      else novo = anotar({ ...novo, vez: seguinte.id }, `Vez de ${seguinte.nome}.`);
    }
    aplicar(novo, pular ? "pular a vez" : "passar o turno");
  }

  function acrescentar(c: CriaturaDeCombate) {
    const e = estadoRef.current;
    if (!e) return;
    const iguais = e.lutadores.filter((l) => l.slug === c.slug).length;
    const nome = iguais ? `${c.nome} ${iguais + 1}` : c.nome;
    const novo: EstadoDoCombate = {
      ...e,
      lutadores: [
        ...e.lutadores,
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
    aplicar(anotar(novo, `Chegou: ${nome}.`), `chegada de ${nome}`);
  }

  function remover(id: string) {
    const e = estadoRef.current;
    if (!e) return;
    const l = e.lutadores.find((x) => x.id === id);
    aplicar(anotar({ ...e, lutadores: e.lutadores.filter((x) => x.id !== id), vez: e.vez === id ? null : e.vez }, `Saiu do combate: ${l?.nome ?? "alguém"}.`), "tirar do combate");
    setAberto(null);
  }

  function mudarLutador(id: string, m: Partial<Lutador>, texto?: string, publico?: string) {
    const e = estadoRef.current;
    if (!e) return;
    const novo = trocar(e, id, m);
    aplicar(texto ? anotar(novo, texto, publico) : novo, texto ?? "mudança");
  }

  function desfazer() {
    const passo = pilha.current.pop();
    const atual = estadoRef.current;
    if (!passo || !atual) return;
    setRotuloDesfazer(pilha.current.at(-1)?.rotulo ?? null);
    // O histórico continua numerado de onde parou, para a gravação não se perder
    const seq = Math.max(0, ...(atual.historico ?? []).map((r) => r.seq ?? 0)) + 1;
    const nota = { rodada: passo.estado.rodada, texto: `O Mestre desfez: ${passo.rotulo}.`, publico: `O Mestre desfez: ${passo.rotulo}.`, seq };
    const volta: EstadoDoCombate = { ...passo.estado, golpe: undefined, historico: [...(passo.estado.historico ?? []), nota].slice(-200) };
    estadoRef.current = volta;
    setCombate((c) => (c ? { ...c, estado: volta } : c));
    if (passo.pvs.length) {
      void Promise.all(passo.pvs.map((m) => mestre.pv(m.slug, -m.delta, m.max))).then(() => void lerFichas());
    }
    for (const g of passo.espacos ?? []) void mexerNoEspaco(g.slug, g.circulo, -1).then(() => void lerFichas());
  }

  // ---------- O que chega dos jogadores ----------

  const receber = useRef<(a: AcaoRecebida) => void>(() => {});
  receber.current = (a: AcaoRecebida) => {
    const e = estadoRef.current;
    if (!e || feitas.current.has(a.id)) return;
    feitas.current.add(a.id);
    void marcarAcaoFeita(a.id);
    const autor = e.lutadores.find((l) => l.tipo === "personagem" && l.slug === a.personagem);
    if (!autor) return;
    const d = a.dados;
    if (d.tipo === "ataque") {
      resolverAtaque(autor.id, d.alvo, d.arma, { total: d.total, natural: d.natural, critico: d.natural === 20, dano: d.dano, tipo: d.tipoDano, condicao: d.condicao });
    } else if (d.tipo === "condicao") {
      const alvo = e.lutadores.find((l) => l.id === d.alvo);
      if (!alvo) return;
      if (d.teste !== undefined) tentarSair(alvo.id, d.condicao, d.teste, d.tirar);
      else if (d.tirar) condicaoEm(alvo.id, d.condicao, true, alvo.id === autor.id ? undefined : `ajuda de ${autor.nome}`);
      else if (alvo.id === autor.id) condicaoEm(alvo.id, d.condicao, false);
    } else if (d.tipo === "fim-do-turno") {
      if (e.vez === autor.id) proximoTurno();
    } else if (d.tipo === "magia") {
      conjurar(autor.id, d);
    } else if (d.tipo === "concentracao") {
      pararConcentracao(autor.id);
    }
  };

  useEffect(() => {
    if (!ehMestre || !combateId) return;
    let vivo = true;
    // O que chegou enquanto a tela do Mestre estava fechada
    const esperar = setInterval(() => {
      if (!estadoRef.current) return;
      clearInterval(esperar);
      void acoesPendentes(combateId).then((l) => vivo && l.forEach((a) => receber.current(a)));
    }, 200);
    const parar = ouvirAcoes((a) => {
      if (a.combate === combateId) receber.current(a);
    });
    return () => {
      vivo = false;
      clearInterval(esperar);
      parar();
    };
  }, [ehMestre, combateId]);

  // A iniciativa que os jogadores rolam chega aqui na hora
  useEffect(() => {
    if (!ehMestre || !combateId) return;
    const chegar = (personagem: string, valor: number) => {
      const e = estadoRef.current;
      const l = e?.lutadores.find((x) => x.tipo === "personagem" && x.slug === personagem);
      if (!e || !l || l.iniciativa === valor) return;
      const novo = anotar(trocar(e, l.id, { iniciativa: valor }), `${l.nome} rolou ${valor} de iniciativa.`);
      estadoRef.current = novo;
      setCombate((c) => (c ? { ...c, estado: novo } : c));
    };
    void iniciativasDosJogadores(combateId).then((l) => l.forEach((i) => chegar(i.personagem, i.valor)));
    return ouvirIniciativas((personagem, valor, c) => {
      if (c === combateId) chegar(personagem, valor);
    });
  }, [ehMestre, combateId]);

  // Na vez de uma criatura, a ficha dela abre sozinha para o Mestre; na vez do jogador, a dele
  const vezAtual = ehMestre ? combate?.estado.vez : mesa?.vez;
  const vezAnterior = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (vezAnterior.current === undefined) {
      vezAnterior.current = vezAtual ?? null;
      return;
    }
    if (vezAtual === vezAnterior.current) return;
    vezAnterior.current = vezAtual ?? null;
    if (!vezAtual) return;
    if (ehMestre) {
      const l = estadoRef.current?.lutadores.find((x) => x.id === vezAtual);
      if (l?.tipo === "criatura") setAberto(vezAtual);
    } else if (meu && mesa?.ordem.find((l) => l.id === vezAtual)?.slug === meu) {
      setAberto(vezAtual);
    }
  }, [vezAtual, ehMestre, meu, mesa]);

  // ---------- Telas sem combate ----------

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
        const [pv, max] = pvDe(l);
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
          concentrando: l.concentrando,
        };
      })
    : (mesa?.ordem ?? []).map((l) => ({ ...l, imagem: l.tipo === "personagem" ? retrato(l.slug) : l.imagem }));

  const numero = estado?.numero ?? mesa?.numero;
  const rodada = estado?.rodada ?? mesa?.rodada ?? 1;
  const vez = estado?.vez ?? mesa?.vez ?? null;
  const daVez = cartoes.find((c) => c.id === vez);
  const linhas = estado ? (estado.historico ?? []).map((r) => ({ rodada: r.rodada, texto: r.texto })) : (mesa?.historico ?? []);
  const meuCartao = meu ? cartoes.find((c) => c.tipo === "personagem" && c.slug === meu) : undefined;
  const minhaVez = Boolean(meuCartao && vez === meuCartao.id);
  const golpeNaTela = estado?.golpe ?? mesa?.golpe;
  const idDoCombate = combate?.id ?? mesa?.id;

  const armasDe = (slug: string): AtaqueEscolhido[] => (personagens.find((p) => p.slug === slug)?.armas ?? []).map((a) => ({ ...a }));

  /** O jogador manda uma ação; o Mestre faz direto. */
  async function agir(dados: AcaoDoJogador): Promise<string | null> {
    if (!meu || !idDoCombate) return "Não há combate agora.";
    const erro = await mandarAcao(idDoCombate, meu, dados);
    if (erro) setAviso(erro);
    return erro;
  }

  function tocarCartao(c: Cartao) {
    if (mira && !mira.alvo) {
      setMira({ ...mira, alvo: c.id });
      return;
    }
    setAberto((a) => (a === c.id ? null : c.id));
  }

  // ---------- A sanfona de quem está aberto ----------

  const abertoCartao = cartoes.find((c) => c.id === aberto);
  const abertoLutador = estado?.lutadores.find((l) => l.id === aberto);
  let sanfona: ReactNode = null;
  if (abertoCartao) {
    const fechar = () => setAberto(null);
    const comecarMira = (autor: string) => (a: AtaqueEscolhido) => {
      setMira({ autor, ataque: a });
      setAberto(null);
    };
    if (abertoCartao.tipo === "criatura") {
      if (ehMestre && abertoLutador) {
        sanfona = (
          <PainelDaCriatura
            key={abertoLutador.id}
            lutador={abertoLutador}
            ehDaVez={vez === abertoLutador.id}
            ataquesNoTurno={estado?.ataquesNoTurno ?? 0}
            alvos={cartoes.filter((c) => c.id !== abertoLutador.id).map((c) => ({ id: c.id, nome: c.nome }))}
            fechar={fechar}
            dano={(n) => mexerNosPv([abertoLutador.id], -n)}
            cura={(n) => mexerNosPv([abertoLutador.id], n)}
            condicao={(c, tirar) => condicaoEm(abertoLutador.id, c, tirar)}
            tentarSair={(c, t, saiu) => tentarSair(abertoLutador.id, c, t, saiu)}
            mudar={(m, texto, publico) => mudarLutador(abertoLutador.id, m, texto, publico)}
            atacar={comecarMira(abertoLutador.id)}
            usar={(h, golpes, usos) => usarHabilidade(abertoLutador.id, h, golpes, usos)}
            remover={() => remover(abertoLutador.id)}
          />
        );
      } else {
        sanfona = (
          <PainelDoInimigo
            c={abertoCartao}
            fechar={fechar}
            atacarEste={
              meuCartao
                ? () => {
                    setAberto(meuCartao.id);
                    setAviso(`Escolha a arma e depois toque em ${abertoCartao.nome}.`);
                  }
                : undefined
            }
          />
        );
      }
    } else {
      const dono = abertoCartao.slug === meu;
      const quemOlha = ehMestre ? "mestre" : dono ? "dono" : "aliado";
      const id = abertoCartao.id;
      const p = personagens.find((x) => x.slug === abertoCartao.slug);
      const viva = fichas.find((f) => f.personagem === abertoCartao.slug);
      const base = bases[abertoCartao.slug] ? ajustarBase(bases[abertoCartao.slug], viva?.ajustes) : undefined;
      const temMagias = !!p && ((p.conhecidas?.length ?? 0) > 0 || !!viva?.ajustes?.niveis?.length);
      const magias =
        (ehMestre || dono) && p && temMagias ? (
          <MagiasDoAventureiro
            autor={id}
            dados={{
              lista: todasAsMagias ? magiasDoPersonagem(p.conhecidas ?? [], viva?.ajustes, todasAsMagias) : null,
              espacos: base?.espacos ?? {},
              gastos: viva?.espacos_gastos ?? {},
              pacto: base?.pacto ?? false,
              nivel: nivelComAjustes(p.nivel, viva?.ajustes),
              conj: p.conjuracao ? conjuracaoComAjustes(p.conjuracao, p.nivel, viva?.ajustes) : null,
              agonizantes: truquesAgonizantes(viva?.ajustes),
            }}
            alvos={cartoes.filter((c) => c.estado !== "Fugiu").map((c) => ({ id: c.id, nome: c.nome, tipo: c.tipo }))}
            conjurar={(c) => (ehMestre ? conjurar(id, c) : void agir(c))}
            mirar={(a, vezes) => {
              setMira({ autor: id, ataque: a, restam: vezes });
              setAberto(null);
            }}
          />
        ) : undefined;
      sanfona = (
        <PainelDoAventureiro
          key={id}
          c={abertoCartao}
          armas={armasDe(abertoCartao.slug)}
          quemOlha={quemOlha}
          ehDaVez={vez === id}
          fechar={fechar}
          atacar={ehMestre || dono ? comecarMira(id) : undefined}
          tirarCondicao={
            ehMestre
              ? (c) => condicaoEm(id, c, true)
              : (c) => void agir({ tipo: "condicao", alvo: id, condicao: c, tirar: true, motivo: dono ? undefined : "ajuda" })
          }
          tentarSair={
            ehMestre
              ? (c, t, saiu) => tentarSair(id, c, t, saiu)
              : dono
                ? (c, t, saiu) => void agir({ tipo: "condicao", alvo: id, condicao: c, tirar: saiu, teste: t })
                : undefined
          }
          porCondicao={ehMestre ? (c) => condicaoEm(id, c, false) : undefined}
          dano={ehMestre ? (n) => mexerNosPv([id], -n) : undefined}
          cura={ehMestre ? (n) => mexerNosPv([id], n) : undefined}
          abrirFicha={() => setFichaInteira(abertoCartao.slug)}
          terminarTurno={ehMestre ? () => proximoTurno() : dono ? () => void agir({ tipo: "fim-do-turno" }) : undefined}
          remover={ehMestre ? () => remover(id) : undefined}
          magias={magias}
          pararConcentracao={ehMestre ? () => pararConcentracao(id) : dono ? () => void agir({ tipo: "concentracao", autor: id }) : undefined}
        />
      );
    }
  }
  const abertoEhInimigo = abertoCartao?.tipo === "criatura";

  // ---------- A mira ----------

  const autorDaMira = mira ? cartoes.find((c) => c.id === mira.autor) : undefined;
  const alvoDaMira = mira?.alvo ? cartoes.find((c) => c.id === mira.alvo) : undefined;

  async function enviarAtaque(r: ResultadoDoAtaque): Promise<string | null> {
    if (!mira?.alvo) return null;
    const proximo = mira.restam && mira.restam > 1 ? { autor: mira.autor, ataque: mira.ataque, restam: mira.restam - 1 } : null;
    if (proximo) setAviso(`Mais ${proximo.restam === 1 ? "um ataque" : `${proximo.restam} ataques`} de ${mira.ataque.nome}: toque no próximo alvo.`);
    if (ehMestre) {
      resolverAtaque(mira.autor, mira.alvo, mira.ataque.nome, r);
      setMira(proximo);
      return null;
    }
    const erro = await agir({
      tipo: "ataque",
      autor: mira.autor,
      alvo: mira.alvo,
      arma: mira.ataque.nome,
      total: r.total,
      natural: r.natural,
      dano: r.dano,
      tipoDano: r.tipo,
      condicao: r.condicao,
    });
    if (!erro) setMira(proximo);
    return erro;
  }

  const iniciativaPendente = rodada === 0;
  const minhaIniciativa = meuCartao ? meuCartao.iniciativa : undefined;

  return (
    <div className="pb-4 lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-5">
      <div className="min-w-0">
        <div className="text-center">
          <p className="font-titulo text-tinta-500 text-xs tracking-[0.2em] uppercase">
            Combate{numero ? ` nº ${numero}` : ""}
            {estado?.dificuldade ? ` · ${estado.dificuldade}` : ""}
          </p>
          <p className="font-titulo text-tinta-900 mt-1 text-3xl font-bold">{iniciativaPendente ? "Iniciativa" : `Rodada ${rodada}`}</p>
          <p className={`mt-1 text-sm ${minhaVez ? "text-heraldico-vermelho text-base font-bold" : "text-tinta-700"}`}>
            {iniciativaPendente ? "Todos rolam antes da rodada 1" : daVez ? (minhaVez ? "Sua vez!" : `Vez de ${daVez.nome}`) : "Esperando o Mestre começar"}
          </p>
        </div>

        {iniciativaPendente ? (
          <div className="mt-3">
            {ehMestre && estado ? (
              <IniciativaDoMestre lutadores={estado.lutadores} definir={definirIniciativas} comecar={() => proximoTurno()} />
            ) : meu ? (
              <IniciativaDoJogador bonus={personagens.find((p) => p.slug === meu)?.iniciativa ?? 0} minha={minhaIniciativa} />
            ) : null}
          </div>
        ) : null}

        <ol aria-label="Ordem de iniciativa" className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
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

        {mira && !mira.alvo ? (
          <div role="status" className="border-dourado-600 bg-madeira-900 text-pergaminho-50 sticky top-16 z-20 mt-3 flex items-center justify-between gap-2 rounded-sm border-2 px-3 py-2 text-sm shadow-lg">
            <span>
              <strong>{autorDaMira?.nome}</strong> com <strong>{mira.ataque.nome}</strong>: toque no alvo.
            </span>
            <button type="button" onClick={() => setMira(null)} className="min-h-9 underline">
              Cancelar
            </button>
          </div>
        ) : null}

        {ehMestre && estado?.pendentes?.length ? (
          <div className="mt-3 space-y-2">
            {estado.pendentes.map((p) => (
              <ResolverMagia
                key={p.id}
                p={p}
                autor={estado.lutadores.find((l) => l.id === p.autor)?.nome ?? "Alguém"}
                nomes={Object.fromEntries(estado.lutadores.map((l) => [l.id, l.nome]))}
                slugs={Object.fromEntries(estado.lutadores.map((l) => [l.id, { slug: l.slug, criatura: l.tipo === "criatura" }]))}
                aplicar={(g) => resolverPendente(p.id, g)}
                descartar={() => descartarPendente(p.id)}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-3">
          <Palco
            cartoes={cartoes}
            inimigosEmCima={!ehMestre}
            meu={meu}
            vez={vez}
            aberto={aberto}
            mirando={Boolean(mira && !mira.alvo)}
            escondido={!ehMestre}
            golpe={golpeNaTela}
            tocarCartao={tocarCartao}
            sanfonaDosInimigos={abertoEhInimigo ? sanfona : null}
            sanfonaDosAliados={abertoCartao && !abertoEhInimigo ? sanfona : null}
          />
        </div>

        {aviso ? (
          <p role="status" className="text-heraldico-vermelho mt-2 text-center text-sm">
            {aviso}{" "}
            <button type="button" onClick={() => setAviso(null)} className="text-tinta-500 underline">
              ok
            </button>
          </p>
        ) : null}

        {ehMestre && estado ? (
          <BarraDoMestre
            iniciativaPendente={iniciativaPendente}
            vezComecou={estado.vez !== null}
            rotuloDesfazer={rotuloDesfazer}
            cartoes={cartoes}
            desfazer={desfazer}
            proximo={() => proximoTurno()}
            pular={() => proximoTurno(true)}
            emGrupo={(ids, delta) => mexerNosPv(ids, delta)}
            condicaoEmGrupo={(ids, c) => ids.forEach((id) => condicaoEm(id, c, false))}
            acrescentar={acrescentar}
            terminar={() => setTerminando(true)}
          />
        ) : meu && !iniciativaPendente ? (
          <div className="border-dourado-600/50 bg-pergaminho-50/95 sticky bottom-[4.5rem] z-10 mt-4 grid grid-cols-2 gap-2 rounded-sm border-2 p-3 shadow-lg backdrop-blur-sm">
            <button type="button" disabled={!meuCartao} onClick={() => meuCartao && setAberto(meuCartao.id)} className={`${BOTAO_CHEIO} px-2 text-xs`}>
              {minhaVez ? "Agir agora" : "Meu personagem"}
            </button>
            {minhaVez ? (
              <button type="button" onClick={() => void agir({ tipo: "fim-do-turno" })} className={`${BOTAO} px-2 text-xs`}>
                Terminar meu turno
              </button>
            ) : (
              <button type="button" onClick={() => setFichaInteira(meu)} className={`${BOTAO} px-2 text-xs`}>
                Minha ficha e pedidos
              </button>
            )}
          </div>
        ) : !meu && !ehMestre ? (
          <p className="text-tinta-500 mt-6 text-center text-sm">A sua conta ainda não está ligada a um personagem. O Mestre faz isso no painel dele.</p>
        ) : null}
      </div>

      <div className="mt-4 lg:mt-0">
        <Historico linhas={linhas} />
        {idDoCombate ? (
          <p className="text-tinta-500 mt-2 text-center text-xs">
            Tudo fica gravado.{" "}
            <Link href={`/combate/replay/?id=${idDoCombate}`} target="_blank" className="underline">
              Assistir do começo
            </Link>
          </p>
        ) : null}
      </div>

      {mira?.alvo && autorDaMira && alvoDaMira ? (
        <RolagemDoAtaque
          key={`${mira.autor}-${mira.alvo}-${mira.ataque.nome}`}
          autor={autorDaMira.nome}
          alvo={{ nome: alvoDaMira.nome, ca: ehMestre ? alvoDaMira.ca : undefined }}
          ataque={mira.ataque}
          enviar={enviarAtaque}
          cancelar={() => setMira(null)}
          trocarAlvo={() => setMira({ ...mira, alvo: undefined })}
        />
      ) : null}

      <Janela aberta={Boolean(fichaInteira)} aoFechar={() => setFichaInteira(null)} titulo={fichaInteira ? (nomes[fichaInteira] ?? "Ficha") : "Ficha"} larga>
        {fichaInteira ? (
          <div className="space-y-4">
            {(fichaInteira === meu || ehMestre) && bases[fichaInteira] ? (
              <FichaVivaDoPersonagem slug={fichaInteira} base={bases[fichaInteira]} regras={regras} />
            ) : null}
            {fichasDoSite[fichaInteira] ? <div className="border-dourado-600/30 border-t pt-4">{fichasDoSite[fichaInteira]}</div> : null}
          </div>
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
          marcarEspolio={(ids) => {
            const e = estadoRef.current;
            if (!e) return;
            let novo = e;
            for (const id of ids) {
              const l = novo.lutadores.find((x) => x.id === id);
              if (l?.loot) novo = trocar(novo, id, { loot: { ...l.loot, levadoPor: "repartido" } });
            }
            aplicar(anotar(novo, "O espólio dos inimigos foi repartido."), "repartir o espólio");
          }}
          aoTerminar={() => {
            setTerminando(false);
            setCombate(null);
            estadoRef.current = null;
            pilha.current = [];
          }}
        />
      ) : null}
    </div>
  );
}

/** Os controles do Mestre: turno, desfazer, dano em grupo, criatura nova e fim. */
function BarraDoMestre(p: {
  iniciativaPendente: boolean;
  vezComecou: boolean;
  rotuloDesfazer: string | null;
  cartoes: Cartao[];
  desfazer: () => void;
  proximo: () => void;
  pular: () => void;
  emGrupo: (ids: string[], delta: number) => void;
  condicaoEmGrupo: (ids: string[], c: string) => void;
  acrescentar: (c: CriaturaDeCombate) => void;
  terminar: () => void;
}) {
  const [grupo, setGrupo] = useState<Set<string>>(new Set());
  const [valor, setValor] = useState("");
  const [criaturas, setCriaturas] = useState<CriaturaDeCombate[] | null>(null);
  const [busca, setBusca] = useState("");
  const n = Math.max(0, Math.floor(Number(valor) || 0));

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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {!p.iniciativaPendente ? (
          <>
            <button type="button" onClick={p.proximo} className={`${BOTAO_CHEIO} col-span-2`}>
              {p.vezComecou ? "Terminar o turno ▶" : "Começar a rodada"}
            </button>
            <button type="button" onClick={p.pular} disabled={!p.vezComecou} className={`${BOTAO} px-2 text-xs`}>
              Pular a vez
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={p.desfazer}
          disabled={!p.rotuloDesfazer}
          title={p.rotuloDesfazer ? `Desfazer: ${p.rotuloDesfazer}` : "Nada para desfazer"}
          className={`${BOTAO} px-2 text-xs ${p.iniciativaPendente ? "col-span-2" : ""}`}
        >
          ↶ Desfazer
        </button>
        {p.iniciativaPendente ? (
          <button type="button" onClick={p.terminar} className={`${BOTAO} col-span-2 px-2 text-xs`}>
            Terminar combate
          </button>
        ) : null}
      </div>

      <details className="mt-2">
        <summary className="text-tinta-700 min-h-9 cursor-pointer text-xs">Em vários de uma vez (magia em área, armadilha)</summary>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {p.cartoes.map((c) => {
            const ligado = grupo.has(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={ligado}
                  onClick={() =>
                    setGrupo((g) => {
                      const novo = new Set(g);
                      if (ligado) novo.delete(c.id);
                      else novo.add(c.id);
                      return novo;
                    })
                  }
                  className={`min-h-9 rounded-full border px-3 text-xs ${ligado ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/40 text-tinta-700"}`}
                >
                  {c.nome}
                </button>
              </li>
            );
          })}
        </ul>
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
          <button type="button" disabled={!grupo.size || !n} onClick={() => (p.emGrupo([...grupo], -n), setValor(""))} className={`${BOTAO} px-3`}>
            Dano
          </button>
          <button type="button" disabled={!grupo.size || !n} onClick={() => (p.emGrupo([...grupo], n), setValor(""))} className={`${BOTAO} px-3`}>
            Cura
          </button>
          <select value="" disabled={!grupo.size} onChange={(e) => e.target.value && p.condicaoEmGrupo([...grupo], e.target.value)} aria-label="Pôr uma condição nos marcados" className={`${CAMPO} w-auto`}>
            <option value="">Condição…</option>
            {CONDICOES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </details>

      <details className="mt-1" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && void carregarCriaturas()}>
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

      {!p.iniciativaPendente ? (
        <button type="button" onClick={p.terminar} className="text-tinta-700 mt-1 min-h-9 text-xs underline">
          Terminar o combate (XP e espólio)
        </button>
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
                    <p className="text-tinta-900 flex flex-wrap items-baseline justify-between gap-2 font-semibold">
                      <span>
                        Combate nº {mesa.numero ?? id} · {new Date(mesa.resumo?.data ?? criado_em).toLocaleDateString("pt-BR")}
                        {mesa.resumo ? ` · ${mesa.resumo.rodadas} ${mesa.resumo.rodadas === 1 ? "rodada" : "rodadas"}` : ""}
                      </span>
                      <Link href={`/combate/replay/?id=${id}`} className="text-heraldico-vermelho text-xs font-normal underline">
                        Assistir
                      </Link>
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
