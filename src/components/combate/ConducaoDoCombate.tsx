"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CONDICOES,
  combateAtivo,
  d20,
  ordenar,
  salvarCombate,
  terminarCombate,
  versaoDaMesa,
  type CombateAtivo,
  type EstadoDoCombate,
  type Lutador,
} from "@/lib/combate";
import { estadoDosPv, type CriaturaDeCombate } from "@/lib/encontros";
import { iniciarConta } from "@/lib/conta";
import { lerTodasAsFichas, mestre, ouvirMesa, type FichaViva } from "@/lib/ficha-viva";
import { useConta } from "@/components/conta/useConta";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import { Janela } from "@/components/ficha-viva/Janela";
import type { PersonagemDoCombate } from "./GeradorDeEncontros";

/**
 * O Mestre conduzindo o combate: a ordem de iniciativa, a vez de cada um,
 * os PV das criaturas e as condições. Cada mudança é salva e a versão da
 * mesa (sem os números das criaturas) chega na hora aos jogadores.
 */
export function ConducaoDoCombate({
  criaturas,
  personagens,
}: {
  criaturas: CriaturaDeCombate[];
  personagens: PersonagemDoCombate[];
}) {
  const conta = useConta();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const [combate, setCombate] = useState<CombateAtivo | null | undefined>(undefined);
  const [fichas, setFichas] = useState<FichaViva[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [terminando, setTerminando] = useState(false);
  const salvarDepois = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();

  useEffect(() => {
    void iniciarConta();
  }, []);

  const lerFichas = useCallback(async () => setFichas(await lerTodasAsFichas()), []);

  useEffect(() => {
    if (!ehMestre) return;
    void combateAtivo().then(setCombate);
    void lerFichas();
    return ouvirMesa((tabela) => {
      if (tabela === "fichas") void lerFichas();
    }, undefined, ["fichas"]);
  }, [ehMestre, lerFichas]);

  const pvs = useMemo(
    () =>
      Object.fromEntries(
        fichas.map((f) => [f.personagem, [f.pv, personagens.find((p) => p.slug === f.personagem)?.pvMaximo ?? f.pv] as [number, number]])
      ),
    [fichas, personagens]
  );

  // Salva um instante depois da última mudança (e quando os PV dos personagens mudam)
  useEffect(() => {
    if (!combate) return;
    clearTimeout(salvarDepois.current);
    salvarDepois.current = setTimeout(async () => {
      const erro = await salvarCombate(combate.id, combate.estado, versaoDaMesa(combate.estado, pvs));
      if (erro) setAviso(`Não salvou: ${erro}`);
    }, 400);
  }, [combate, pvs]);

  if (conta.fase === "carregando" || (ehMestre && combate === undefined)) {
    return <p className="text-tinta-700 py-10 text-center italic">Arrumando a mesa…</p>;
  }
  if (!ehMestre) {
    return (
      <p className="text-tinta-700 py-10 text-center">
        Esta tela é só do Mestre.{" "}
        <Link href="/conta/" className="text-heraldico-vermelho underline">
          Entrar na conta
        </Link>
      </p>
    );
  }
  if (!combate) {
    return (
      <div className="py-8 text-center">
        <p className="text-tinta-700">Nenhum combate em andamento.</p>
        <Link href="/mestre/encontros/" className={`${BOTAO_CHEIO} mt-4`}>
          Montar um encontro
        </Link>
      </div>
    );
  }

  const estado = combate.estado;
  const ordem = ordenar(estado.lutadores);
  const mudar = (novo: Partial<EstadoDoCombate>) => setCombate({ ...combate, estado: { ...estado, ...novo } });
  const mudarLutador = (lid: string, m: Partial<Lutador>) =>
    mudar({ lutadores: estado.lutadores.map((l) => (l.id === lid ? { ...l, ...m } : l)) });

  function rolarIniciativa(quem: "criaturas" | "todos") {
    mudar({
      lutadores: estado.lutadores.map((l) =>
        quem === "todos" || l.tipo === "criatura" ? { ...l, iniciativa: d20() + l.bonusIniciativa } : l
      ),
    });
  }

  function proximo() {
    if (!ordem.length) return;
    const i = ordem.findIndex((l) => l.id === estado.vez);
    if (estado.vez === null || i < 0) mudar({ vez: ordem[0].id });
    else if (i === ordem.length - 1) mudar({ vez: ordem[0].id, rodada: estado.rodada + 1 });
    else mudar({ vez: ordem[i + 1].id });
  }

  async function pvDoPersonagem(l: Lutador, delta: number) {
    const erro = await mestre.pv(l.slug, delta, l.pvMaximo);
    setAviso(erro ?? `${l.nome}: ${delta < 0 ? `${-delta} de dano` : `+${delta} PV`}.`);
    await lerFichas();
  }

  function acrescentar(nome: string) {
    const c = criaturas.find((x) => x.nome.toLowerCase() === nome.trim().toLowerCase());
    if (!c) return false;
    const iguais = estado.lutadores.filter((l) => l.slug === c.slug).length;
    mudar({
      lutadores: [
        ...estado.lutadores,
        {
          id: `${c.slug}-${iguais + 1}-${Math.random().toString(36).slice(2, 6)}`,
          tipo: "criatura",
          slug: c.slug,
          nome: iguais ? `${c.nome} ${iguais + 1}` : c.nome,
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
    });
    return true;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-titulo text-tinta-900 text-2xl font-bold">Rodada {estado.rodada}</p>
        {estado.dificuldade ? <p className="text-tinta-500 text-sm">Encontro {estado.dificuldade.toLowerCase()}</p> : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button type="button" onClick={() => rolarIniciativa("criaturas")} className={BOTAO}>
          Iniciativa das criaturas
        </button>
        <button type="button" onClick={() => rolarIniciativa("todos")} className={BOTAO}>
          Iniciativa de todos
        </button>
        <button type="button" onClick={proximo} className={`${BOTAO_CHEIO} col-span-2`}>
          {estado.vez ? "Próximo turno" : "Começar a primeira rodada"}
        </button>
      </div>
      <p aria-live="polite" className="text-tinta-700 mt-2 min-h-5 text-sm">
        {aviso}
      </p>

      <ol className="mt-2 space-y-2">
        {ordem.map((l) => (
          <LinhaDoLutador
            key={l.id}
            lutador={l}
            vez={estado.vez === l.id}
            pvDaFicha={l.tipo === "personagem" ? pvs[l.slug] : undefined}
            mudar={(m) => mudarLutador(l.id, m)}
            remover={() => mudar({ lutadores: estado.lutadores.filter((x) => x.id !== l.id), vez: estado.vez === l.id ? null : estado.vez })}
            pvDoPersonagem={(d) => void pvDoPersonagem(l, d)}
          />
        ))}
      </ol>

      <AcrescentarCriatura criaturas={criaturas} acrescentar={acrescentar} id={id} />

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => setTerminando(true)} className={BOTAO_CHEIO}>
          Terminar o combate
        </button>
        <Link href="/mestre/encontros/" className={BOTAO}>
          Gerador de encontros
        </Link>
      </div>

      <Terminar
        aberta={terminando}
        aoFechar={() => setTerminando(false)}
        estado={estado}
        aoTerminar={async (porCabeca, quem) => {
          for (const slug of quem) {
            const erro = porCabeca > 0 ? await mestre.xp(slug, porCabeca) : null;
            if (erro) {
              setAviso(erro);
              return;
            }
          }
          const erro = await terminarCombate(combate.id);
          if (erro) setAviso(erro);
          else {
            setTerminando(false);
            setCombate(null);
          }
        }}
      />
    </div>
  );
}

function LinhaDoLutador({
  lutador: l,
  vez,
  pvDaFicha,
  mudar,
  remover,
  pvDoPersonagem,
}: {
  lutador: Lutador;
  vez: boolean;
  pvDaFicha?: [number, number];
  mudar: (m: Partial<Lutador>) => void;
  remover: () => void;
  pvDoPersonagem: (delta: number) => void;
}) {
  const [valor, setValor] = useState("");
  const id = useId();
  const n = Math.max(0, Math.floor(Number(valor) || 0));
  const [pv, max] = l.tipo === "personagem" ? (pvDaFicha ?? [0, l.pvMaximo]) : [l.pv, l.pvMaximo];
  const caido = pv <= 0;

  function aplicar(sinal: 1 | -1) {
    if (!n) return;
    if (l.tipo === "personagem") pvDoPersonagem(sinal * n);
    else mudar({ pv: Math.max(0, Math.min(l.pvMaximo, l.pv + sinal * n)) });
    setValor("");
  }

  return (
    <li
      aria-current={vez ? "step" : undefined}
      className={`rounded-sm border-2 p-3 ${vez ? "border-heraldico-vermelho bg-heraldico-vermelho/5" : "border-dourado-600/30"} ${caido ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-tinta-700 w-16 text-center text-[0.65rem] uppercase">
          Inic.
          <input
            type="number"
            inputMode="numeric"
            value={l.iniciativa ?? ""}
            onChange={(e) => mudar({ iniciativa: e.target.value === "" ? null : Math.floor(Number(e.target.value)) })}
            aria-label={`Iniciativa de ${l.nome}`}
            className={`${CAMPO} mt-0.5 px-1 text-center font-bold`}
          />
        </label>
        {l.imagem ? (
          <span className="bg-madeira-900 relative size-11 shrink-0 overflow-hidden rounded-sm">
            <Image src={l.imagem} alt="" fill sizes="44px" className="object-cover" />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="font-titulo text-tinta-900 block font-bold">
            {vez ? <span className="text-heraldico-vermelho">▶ </span> : null}
            {l.tipo === "personagem" ? (
              <Link href={`/personagens/${l.slug}/`} target="_blank" className="hover:underline">
                {l.nome}
              </Link>
            ) : (
              <Link href={`/monstros/${l.slug}/`} target="_blank" className="hover:underline">
                {l.nome}
              </Link>
            )}
          </span>
          <span className="text-tinta-700 block text-sm tabular-nums">
            CA {l.ca} · <strong className="text-tinta-900">{pv}</strong>/{max} PV · {estadoDosPv(pv, max)}
            {l.iniciativa === null ? <span className="text-tinta-500"> · bônus {l.bonusIniciativa >= 0 ? "+" : ""}{l.bonusIniciativa}</span> : null}
          </span>
        </span>
        <button type="button" onClick={remover} aria-label={`Tirar ${l.nome} do combate`} className="text-tinta-500 hover:text-heraldico-vermelho grid size-11 place-items-center text-lg">
          ×
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label htmlFor={`${id}-pv`} className="sr-only">
          Quanto de dano ou cura em {l.nome}
        </label>
        <input
          id={`${id}-pv`}
          type="number"
          inputMode="numeric"
          min={0}
          value={valor}
          placeholder="PV"
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") aplicar(-1);
          }}
          className={`${CAMPO} w-20`}
        />
        <button type="button" disabled={!n} onClick={() => aplicar(-1)} className={`${BOTAO} px-3`}>
          Dano
        </button>
        <button type="button" disabled={!n} onClick={() => aplicar(1)} className={`${BOTAO} px-3`}>
          Cura
        </button>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value && !l.condicoes.includes(e.target.value)) mudar({ condicoes: [...l.condicoes, e.target.value] });
          }}
          aria-label={`Pôr uma condição em ${l.nome}`}
          className={`${CAMPO} w-auto flex-1`}
        >
          <option value="">+ Condição</option>
          {CONDICOES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {l.condicoes.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {l.condicoes.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => mudar({ condicoes: l.condicoes.filter((x) => x !== c) })}
                aria-label={`Tirar a condição ${c} de ${l.nome}`}
                className="border-heraldico-vermelho/50 text-heraldico-vermelho min-h-8 rounded-full border px-3 text-xs"
              >
                {c} ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function AcrescentarCriatura({ criaturas, acrescentar, id }: { criaturas: CriaturaDeCombate[]; acrescentar: (nome: string) => boolean; id: string }) {
  const [busca, setBusca] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (acrescentar(busca)) setBusca("");
      }}
      className="mt-4 flex items-end gap-2"
    >
      <label className="text-tinta-700 flex-1 text-xs">
        Chegou mais alguém?
        <input list={`${id}-criaturas`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome da criatura" className={`${CAMPO} mt-1`} />
        <datalist id={`${id}-criaturas`}>
          {criaturas.map((c) => (
            <option key={c.slug} value={c.nome} />
          ))}
        </datalist>
      </label>
      <button type="submit" className={BOTAO}>
        Acrescentar
      </button>
    </form>
  );
}

function Terminar({
  aberta,
  aoFechar,
  estado,
  aoTerminar,
}: {
  aberta: boolean;
  aoFechar: () => void;
  estado: EstadoDoCombate;
  aoTerminar: (porCabeca: number, quem: string[]) => Promise<void>;
}) {
  const personagens = estado.lutadores.filter((l) => l.tipo === "personagem");
  const criaturas = estado.lutadores.filter((l) => l.tipo === "criatura");
  const [todas, setTodas] = useState(false);
  const [quem, setQuem] = useState<Set<string>>(() => new Set(personagens.map((p) => p.slug)));
  const [indo, setIndo] = useState(false);

  // Quem entrou no combate depois também conta
  useEffect(() => {
    if (aberta) setQuem(new Set(estado.lutadores.filter((l) => l.tipo === "personagem").map((p) => p.slug)));
  }, [aberta, estado.lutadores]);

  const contam = criaturas.filter((c) => todas || c.pv <= 0);
  const total = contam.reduce((s, c) => s + c.xp, 0);
  const porCabeca = quem.size ? Math.floor(total / quem.size) : 0;

  async function ir(comXp: boolean) {
    setIndo(true);
    await aoTerminar(comXp ? porCabeca : 0, [...quem]);
    setIndo(false);
  }

  return (
    <Janela aberta={aberta} aoFechar={aoFechar} titulo="Terminar o combate">
      <p className="text-tinta-700 text-sm">
        {contam.length} de {criaturas.length} criaturas contam: <strong className="text-tinta-900">{total.toLocaleString("pt-BR")} XP</strong>.
      </p>
      <label className="text-tinta-700 mt-2 flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={todas} onChange={(e) => setTodas(e.target.checked)} className="accent-heraldico-vermelho size-4" />
        Contar todas (fugiram, se renderam ou foram vencidas de outro jeito)
      </label>
      <p className="text-tinta-700 mt-2 text-sm">Dividir entre:</p>
      <ul className="mt-1 space-y-1">
        {personagens.map((p) => (
          <li key={p.slug}>
            <label className="text-tinta-900 flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={quem.has(p.slug)}
                onChange={(e) =>
                  setQuem((s) => {
                    const n = new Set(s);
                    if (e.target.checked) n.add(p.slug);
                    else n.delete(p.slug);
                    return n;
                  })
                }
                className="accent-heraldico-vermelho size-4"
              />
              {p.nome}
            </label>
          </li>
        ))}
      </ul>
      <p className="font-titulo text-tinta-900 mt-2">{porCabeca.toLocaleString("pt-BR")} XP para cada um</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={indo || !porCabeca} onClick={() => void ir(true)} className={BOTAO_CHEIO}>
          Dar o XP e terminar
        </button>
        <button type="button" disabled={indo} onClick={() => void ir(false)} className={BOTAO}>
          Terminar sem XP
        </button>
      </div>
      <p className="text-tinta-500 mt-3 text-xs">
        O tesouro sai do{" "}
        <Link href="/bau/" className="underline">
          Baú do Mestre
        </Link>
        , que manda direto para a ficha.
      </p>
    </Janela>
  );
}
