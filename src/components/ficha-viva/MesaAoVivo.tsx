"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { lerTodasAsFichas, mestre, moedasPorExtenso, ouvirMesa, TIPOS_DE_MOEDA, type FichaViva, type Moedas } from "@/lib/ficha-viva";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import { ajustarBase } from "@/lib/ajustes-da-ficha";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

type Personagem = { slug: string; nome: string; base?: BaseDaFicha };

/**
 * A mesa ao vivo, no painel do Mestre: todas as fichas abertas lado a lado,
 * mudando na hora quando um jogador gasta um espaço ou bebe uma poção. Dá
 * para marcar várias e mandar dano, cura, XP, item ou moedas para todas de
 * uma vez (cada jogador recebe o aviso na tela dele).
 */
export function MesaAoVivo({ personagens }: { personagens: Personagem[] }) {
  const [fichas, setFichas] = useState<FichaViva[] | null>(null);
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const recarregar = useCallback(async () => setFichas(await lerTodasAsFichas()), []);

  useEffect(() => {
    void recarregar();
    const parar = ouvirMesa((tabela) => {
      if (tabela === "fichas") void recarregar();
    });
    return parar;
  }, [recarregar]);

  const naMesa = (fichas ?? [])
    .map((f) => ({ ficha: f, p: personagens.find((p) => p.slug === f.personagem) }))
    .filter((x): x is { ficha: FichaViva; p: Personagem & { base: BaseDaFicha } } => Boolean(x.p?.base))
    // O PV máximo e a Constituição ajustados na mesa valem aqui também
    .map((x) => ({ ...x, p: { ...x.p, base: ajustarBase(x.p.base, x.ficha.ajustes) } }));

  /** Faz a mesma coisa em cada ficha marcada e conta quantas deram certo. */
  async function paraAsMarcadas(nome: string, acao: (slug: string, base: BaseDaFicha) => Promise<string | null>) {
    const alvos = naMesa.filter((x) => marcadas.has(x.p.slug));
    if (!alvos.length) {
      setAviso({ erro: true, texto: "Marque pelo menos um personagem." });
      return false;
    }
    setOcupado(true);
    const erros: string[] = [];
    for (const { p } of alvos) {
      const erro = await acao(p.slug, p.base);
      if (erro) erros.push(`${p.nome}: ${erro}`);
    }
    setOcupado(false);
    await recarregar();
    setAviso(
      erros.length
        ? { erro: true, texto: erros.join(" ") }
        : { erro: false, texto: `${nome} para ${alvos.map((x) => x.p.nome).join(", ")}.` }
    );
    return !erros.length;
  }

  if (!fichas) return <p className="text-tinta-700 text-center text-sm italic">Arrumando a mesa…</p>;

  return (
    <section aria-labelledby="titulo-mesa">
      <h2 id="titulo-mesa" className="font-titulo text-tinta-900 text-center text-lg font-bold">
        A mesa ao vivo
      </h2>
      {naMesa.length === 0 ? (
        <p className="text-tinta-500 mt-2 text-center text-sm italic">
          Nenhuma ficha viva aberta ainda. Ligue um personagem a uma conta lá embaixo, ou abra a ficha viva na página dele.
        </p>
      ) : (
        <>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {naMesa.map(({ ficha, p }) => (
              <CartaoDaMesa
                key={p.slug}
                ficha={ficha}
                personagem={p}
                marcada={marcadas.has(p.slug)}
                marcar={(sim) =>
                  setMarcadas((m) => {
                    const nova = new Set(m);
                    if (sim) nova.add(p.slug);
                    else nova.delete(p.slug);
                    return nova;
                  })
                }
              />
            ))}
          </ul>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <button type="button" onClick={() => setMarcadas(new Set(naMesa.map((x) => x.p.slug)))} className="text-tinta-700 min-h-9 underline">
              Marcar todos
            </button>
            <button type="button" onClick={() => setMarcadas(new Set())} className="text-tinta-700 min-h-9 underline">
              Desmarcar
            </button>
          </div>
          <ParaAsMarcadas ocupado={ocupado} quantas={marcadas.size} fazer={paraAsMarcadas} />
          <p aria-live="polite" className={`mt-2 min-h-5 text-center text-sm ${aviso?.erro ? "text-heraldico-vermelho" : "text-tinta-700"}`}>
            {aviso?.texto}
          </p>
        </>
      )}
    </section>
  );
}

function CartaoDaMesa({
  ficha,
  personagem: p,
  marcada,
  marcar,
}: {
  ficha: FichaViva;
  personagem: Personagem & { base: BaseDaFicha };
  marcada: boolean;
  marcar: (sim: boolean) => void;
}) {
  const id = useId();
  const fracao = p.base.pvMaximo ? Math.min(1, ficha.pv / p.base.pvMaximo) : 0;
  const xp = p.base.experiencia + (ficha.experiencia_ganha ?? 0);
  const espacos = Object.entries(p.base.espacos)
    .map(([c, total]) => `${c}º ${total - Math.min(total, ficha.espacos_gastos[c] ?? 0)}/${total}`)
    .join(" · ");

  return (
    <li className={`rounded-sm border-2 p-3 transition-colors ${marcada ? "border-heraldico-vermelho/60 bg-heraldico-vermelho/5" : "border-dourado-600/30"}`}>
      <div className="flex items-start gap-2">
        <input id={id} type="checkbox" checked={marcada} onChange={(e) => marcar(e.target.checked)} className="accent-heraldico-vermelho mt-1 size-5" />
        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
          <span className="font-titulo text-tinta-900 block font-bold">{p.nome}</span>
          <span className="text-tinta-700 block text-sm tabular-nums">
            <strong className="text-tinta-900">{ficha.pv}</strong>/{p.base.pvMaximo} PV
            {ficha.pv_temporarios ? <span className="text-dourado-600"> +{ficha.pv_temporarios}</span> : null}
            {ficha.inspiracao ? <span className="text-dourado-600" title="Inspiração Heroica"> ✦</span> : null}
          </span>
        </label>
        <Link href={`/personagens/${p.slug}/`} className="text-heraldico-vermelho shrink-0 text-xs underline">
          Ficha
        </Link>
      </div>
      <div className="bg-madeira-800/15 mt-2 h-2 overflow-hidden rounded-full" aria-hidden>
        <div
          className={`h-full rounded-full ${fracao > 0.5 ? "bg-[#3f7d3a]" : fracao > 0.25 ? "bg-[#c58a1c]" : "bg-heraldico-vermelho"}`}
          style={{ width: `${fracao * 100}%` }}
        />
      </div>
      <p className="text-tinta-500 mt-2 text-xs">
        {xp.toLocaleString("pt-BR")} XP · Dados de Vida {p.base.dadosDeVida - ficha.dados_de_vida_gastos}/{p.base.dadosDeVida}
        {espacos ? ` · ${espacos}` : ""} · {moedasPorExtenso(ficha.moedas)}
      </p>
    </li>
  );
}

function ParaAsMarcadas({
  ocupado,
  quantas,
  fazer,
}: {
  ocupado: boolean;
  quantas: number;
  fazer: (nome: string, acao: (slug: string, base: BaseDaFicha) => Promise<string | null>) => Promise<boolean>;
}) {
  const [valor, setValor] = useState("");
  const [item, setItem] = useState("");
  const [qtd, setQtd] = useState(1);
  const [moedas, setMoedas] = useState<Moedas>({});
  const id = useId();
  const n = Math.floor(Number(valor) || 0);
  const desligado = ocupado || quantas === 0;

  return (
    <div className="border-dourado-600/30 mt-4 space-y-4 rounded-sm border p-3">
      <p className="text-tinta-700 text-center text-xs">
        {quantas ? `Para ${quantas === 1 ? "o marcado" : `os ${quantas} marcados`}:` : "Marque os personagens acima para mandar algo."}
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <label htmlFor={`${id}-n`} className="text-tinta-700 w-24 text-xs">
          Quanto
          <input id={`${id}-n`} type="number" inputMode="numeric" min={0} value={valor} onChange={(e) => setValor(e.target.value)} className={`${CAMPO} mt-1`} />
        </label>
        <button
          type="button"
          disabled={desligado || n <= 0}
          onClick={async () => {
            if (await fazer(`${n} de dano`, (slug, base) => mestre.pv(slug, -n, base.pvMaximo))) setValor("");
          }}
          className={BOTAO}
        >
          Dano
        </button>
        <button
          type="button"
          disabled={desligado || n <= 0}
          onClick={async () => {
            if (await fazer(`+${n} PV`, (slug, base) => mestre.pv(slug, n, base.pvMaximo))) setValor("");
          }}
          className={BOTAO}
        >
          Cura
        </button>
        <button
          type="button"
          disabled={desligado || n <= 0}
          onClick={async () => {
            if (await fazer(`+${n} XP`, (slug) => mestre.xp(slug, n))) setValor("");
          }}
          className={BOTAO}
        >
          XP
        </button>
      </div>

      <div className="grid grid-cols-[1fr_4.5rem_auto] items-end gap-2">
        <label htmlFor={`${id}-item`} className="text-tinta-700 text-xs">
          Item
          <input id={`${id}-item`} value={item} maxLength={80} onChange={(e) => setItem(e.target.value)} className={`${CAMPO} mt-1`} />
        </label>
        <label htmlFor={`${id}-qtd`} className="text-tinta-700 text-xs">
          Quantos
          <input
            id={`${id}-qtd`}
            type="number"
            min={1}
            max={999}
            value={qtd}
            onChange={(e) => setQtd(Math.max(1, Math.min(999, Math.floor(Number(e.target.value) || 1))))}
            className={`${CAMPO} mt-1`}
          />
        </label>
        <button
          type="button"
          disabled={desligado || !item.trim()}
          onClick={async () => {
            if (await fazer(`${qtd}× ${item.trim()}`, (slug) => mestre.darItem(slug, item, qtd))) {
              setItem("");
              setQtd(1);
            }
          }}
          className={BOTAO}
        >
          Dar
        </button>
      </div>

      <div>
        <div className="grid grid-cols-5 gap-2">
          {TIPOS_DE_MOEDA.map((t) => (
            <label key={t.chave} className="text-tinta-700 text-center text-xs">
              {t.chave.toUpperCase()}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={moedas[t.chave] ?? ""}
                onChange={(e) => setMoedas({ ...moedas, [t.chave]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                aria-label={t.nome}
                className={`${CAMPO} mt-1 px-1 text-center`}
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={desligado || !Object.values(moedas).some((v) => (v ?? 0) > 0)}
          onClick={async () => {
            if (await fazer(moedasPorExtenso(moedas), (slug) => mestre.moedas(slug, moedas))) setMoedas({});
          }}
          className={`${BOTAO_CHEIO} mt-2 w-full`}
        >
          Dar moedas a cada um
        </button>
      </div>
    </div>
  );
}
