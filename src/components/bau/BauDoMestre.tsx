"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Botao } from "@/components/ui/Botao";
import { tocar } from "@/lib/som";
import {
  abrir,
  faixaDo,
  opcaoDoDado,
  textoDoResultado,
  CATEGORIAS_MAGICAS,
  GRUPOS_COMUNS,
  MOEDAS,
  PATAMARES,
  RECIPIENTES,
  type Achado,
  type Conteudo,
  type Pedido,
  type Resultado,
} from "@/lib/bau-sorteio";

/**
 * O Baú do Mestre: no meio da sessão, o mestre diz o que é o baú e o que pode
 * ter dentro, o jogador rola o d20 e o site tira o que ele encontra.
 *
 * Dois jeitos de jogar:
 * - um dado: o d20 escolhe a faixa e o site sorteia o resto;
 * - dois dados: o d20 escolhe a faixa e, para cada achado, o site mostra a
 *   tabela e o dado a rolar (d4 a d100). O segundo dado escolhe o item, com
 *   a mesa inteira vendo.
 *
 * O que foi escolhido fica guardado neste navegador, para a próxima sessão
 * já começar do jeito de sempre.
 */

const GUARDADO = "terras-mitrael-bau";

type Escolhas = Omit<Pedido, "d20"> & { limitar: boolean; doisDados: boolean };

const PADRAO: Escolhas = {
  recipiente: "medio",
  moedas: ["PC", "PP", "PO"],
  comuns: ["arma", "armadura", "aventura", "ferramenta"],
  magicos: [...CATEGORIAS_MAGICAS],
  nivel: "1-4",
  limitar: true,
  doisDados: false,
};

const COR_DA_RARIDADE: Record<string, string> = {
  Comum: "text-tinta-700 border-tinta-500/40",
  Incomum: "text-emerald-800 border-emerald-700/40",
  Raro: "text-sky-800 border-sky-700/40",
  "Muito Raro": "text-violet-800 border-violet-700/40",
  Lendário: "text-amber-800 border-amber-700/50",
};

function alternar(lista: string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

/** Um botão que liga e desliga, como uma ficha sobre a mesa. */
function Ficha({
  ligado,
  onClick,
  children,
}: {
  ligado: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ligado}
      onClick={onClick}
      className={`font-titulo min-h-10 rounded-sm border px-3 text-[0.8rem] font-semibold transition-colors ${
        ligado
          ? "border-tinta-900 bg-tinta-900 text-pergaminho-50"
          : "border-dourado-600/50 text-tinta-700 hover:bg-dourado-400/15"
      }`}
    >
      {children}
    </button>
  );
}

/** O baú desenhado, do tamanho do recipiente. */
function Bau({ tamanho }: { tamanho: number }) {
  const lado = 18 + tamanho * 6;
  return (
    <svg viewBox="0 0 24 20" width={lado} height={(lado * 20) / 24} aria-hidden className="shrink-0">
      <path d="M2 8 Q2 2 12 2 Q22 2 22 8 Z" fill="#7a4a24" stroke="#2b1d10" strokeWidth="1" />
      <rect x="2" y="8" width="20" height="10" rx="1" fill="#8b5a2b" stroke="#2b1d10" strokeWidth="1" />
      <rect x="2" y="7.2" width="20" height="1.8" fill="#b8912c" />
      <rect x="10.5" y="8.5" width="3" height="4" rx="0.6" fill="#e2c46a" stroke="#2b1d10" strokeWidth="0.6" />
    </svg>
  );
}

function Painel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="painel-ficha relative mt-7 px-3 pt-6 pb-4 sm:px-5">
      <h2 className="placa-painel font-titulo text-tinta-900 absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[0.66rem] leading-none font-bold tracking-[0.2em] whitespace-nowrap uppercase">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function CartaoDoAchado({ achado }: { achado: Achado }) {
  return (
    <div className="flex items-start gap-3">
      <div className="border-madeira-800/30 bg-madeira-950/80 relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-sm border">
        {achado.imagem ? (
          <Image src={achado.imagem} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <Bau tamanho={0} />
        )}
      </div>
      <div className="min-w-0">
        <Link
          href={achado.href}
          className="font-titulo text-tinta-900 decoration-dourado-600/60 hover:text-heraldico-vermelho text-base leading-snug font-semibold underline-offset-4 hover:underline"
        >
          {achado.nome}
        </Link>
        <p className="text-tinta-500 mt-0.5 text-xs">{achado.detalhe}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {achado.raridade ? (
            <span
              className={`rounded-sm border px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase ${COR_DA_RARIDADE[achado.raridade] ?? ""}`}
            >
              {achado.raridade}
            </span>
          ) : null}
          {achado.magia ? (
            <Link
              href={achado.magia.href}
              className="text-tinta-700 hover:text-heraldico-vermelho text-xs underline underline-offset-4"
            >
              Ver a magia
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function BauDoMestre({ conteudo }: { conteudo: Conteudo }) {
  const [e, setE] = useState<Escolhas>(PADRAO);
  const [d20, setD20] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [rolado, setRolado] = useState(0);
  const [segundos, setSegundos] = useState<Record<number, string>>({});
  const [copiado, setCopiado] = useState(false);
  /** Conta as aberturas: cada baú novo entra com a sua própria animação. */
  const [vez, setVez] = useState(0);
  const reduzido = useReducedMotion();

  // As escolhas da última vez, guardadas neste navegador
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(GUARDADO) ?? "null");
      if (salvo) setE({ ...PADRAO, ...salvo });
    } catch {
      // Sem acesso ao armazenamento: começa do padrão
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(GUARDADO, JSON.stringify(e));
    } catch {
      // Navegação privada: só não guarda
    }
  }, [e]);

  const mudar = (parcial: Partial<Escolhas>) => setE((atual) => ({ ...atual, ...parcial }));
  const numero = Number(d20);
  const valido = Number.isInteger(numero) && numero >= 1 && numero <= 20;
  const nada = !e.moedas.length && !e.comuns.length && !e.magicos.length;

  function abrirOBau(valor = numero) {
    const r = abrir({ ...e, nivel: e.limitar ? e.nivel : "dado", d20: valor }, conteudo, !e.doisDados);
    setResultado(r);
    setVez((n) => n + 1);
    setRolado(valor);
    setSegundos({});
    setCopiado(false);
    tocar("abrirMenu");
  }

  function rolarPorMim() {
    const valor = 1 + Math.floor(Math.random() * 20);
    setD20(String(valor));
    abrirOBau(valor);
  }

  function escolherPeloDado(i: number, valor: number) {
    if (!resultado) return;
    const vaga = resultado.vagas[i];
    const opcao = opcaoDoDado(vaga, valor);
    if (!opcao) return;
    const vagas = resultado.vagas.map((v, j) => (j === i ? { ...v, escolhido: opcao.resolver() } : v));
    setResultado({ ...resultado, vagas });
    tocar("marcador");
  }

  async function copiar() {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(textoDoResultado(resultado, rolado));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Sem área de transferência: o texto continua na tela
    }
  }

  const faixa = valido ? faixaDo(numero) : null;

  return (
    <div>
      <Painel titulo="O recipiente">
        <ul className="grid gap-2 sm:grid-cols-2">
          {RECIPIENTES.map((r, i) => {
            const ligado = e.recipiente === r.chave;
            return (
              <li key={r.chave} className={i === RECIPIENTES.length - 1 ? "sm:col-span-2" : ""}>
                <button
                  type="button"
                  aria-pressed={ligado}
                  onClick={() => mudar({ recipiente: r.chave })}
                  className={`flex min-h-16 w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors ${
                    ligado
                      ? "border-tinta-900 bg-dourado-400/25 shadow-[inset_0_0_0_1px_var(--color-tinta-900)]"
                      : "border-dourado-600/40 hover:bg-dourado-400/10"
                  }`}
                >
                  <span className="grid w-11 shrink-0 place-items-center">
                    <Bau tamanho={r.tamanho} />
                  </span>
                  <span className="min-w-0">
                    <span className="font-titulo text-tinta-900 block text-sm font-bold">{r.nome}</span>
                    <span className="text-tinta-500 block text-xs italic">{r.exemplo}</span>
                    <span className="text-tinta-700 block text-xs">
                      Cabe até: {r.cabe} · até {r.vagas} achados
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Painel>

      <Painel titulo="O que pode ter">
        <div className="space-y-4">
          <fieldset>
            <legend className="text-tinta-500 mb-1.5 text-xs">Moedas</legend>
            <div className="flex flex-wrap gap-1.5">
              {MOEDAS.map((m) => (
                <Ficha key={m.chave} ligado={e.moedas.includes(m.chave)} onClick={() => mudar({ moedas: alternar(e.moedas, m.chave) })}>
                  {m.nome} ({m.chave})
                </Ficha>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-tinta-500 mb-1.5 text-xs">Equipamento comum</legend>
            <div className="flex flex-wrap gap-1.5">
              {GRUPOS_COMUNS.map((g) => (
                <Ficha key={g.chave} ligado={e.comuns.includes(g.chave)} onClick={() => mudar({ comuns: alternar(e.comuns, g.chave) })}>
                  {g.nome}
                </Ficha>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-tinta-500 mb-1.5 flex w-full items-center justify-between text-xs">
              Itens mágicos
              <button
                type="button"
                onClick={() => mudar({ magicos: e.magicos.length ? [] : [...CATEGORIAS_MAGICAS] })}
                className="hover:text-heraldico-vermelho min-h-8 underline underline-offset-4"
              >
                {e.magicos.length ? "Nenhum" : "Todos"}
              </button>
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIAS_MAGICAS.map((c) => (
                <Ficha key={c} ligado={e.magicos.includes(c)} onClick={() => mudar({ magicos: alternar(e.magicos, c) })}>
                  {c}
                </Ficha>
              ))}
            </div>
          </fieldset>
        </div>
      </Painel>

      <Painel titulo="O grupo">
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={e.limitar}
            onChange={(ev) => mudar({ limitar: ev.target.checked })}
            className="accent-tinta-900 size-5"
          />
          <span className="text-tinta-900 text-sm">
            Limitar a raridade pelo nível do grupo
            <span className="text-tinta-500 block text-xs">
              {e.limitar
                ? "Um grupo de nível baixo não tira um item lendário, nem com 20."
                : "Só o dado manda: qualquer raridade pode sair num resultado alto."}
            </span>
          </span>
        </label>
        {e.limitar ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PATAMARES.map((p) => (
              <Ficha key={p.chave} ligado={e.nivel === p.chave} onClick={() => mudar({ nivel: p.chave })}>
                {p.nome}
              </Ficha>
            ))}
          </div>
        ) : null}
      </Painel>

      <Painel titulo="A sorte">
        <div className="flex flex-wrap gap-1.5">
          <Ficha ligado={!e.doisDados} onClick={() => mudar({ doisDados: false })}>
            Um dado: o d20 decide tudo
          </Ficha>
          <Ficha ligado={e.doisDados} onClick={() => mudar({ doisDados: true })}>
            Dois dados: d20 e a tabela
          </Ficha>
        </div>
        <p className="text-tinta-500 mt-2 text-xs leading-relaxed">
          {e.doisDados
            ? "O d20 diz o quão bom é o baú. Depois, para cada achado, o site mostra a tabela e o dado que o jogador rola para saber qual item é."
            : "O jogador rola o d20, você digita o resultado e o site tira o que tem dentro."}
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Resultado do d20</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={d20}
              onChange={(ev) => setD20(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && valido && !nada) abrirOBau();
              }}
              className="border-dourado-600/40 bg-pergaminho-50 text-tinta-900 focus-visible:outline-dourado-600 font-titulo h-14 w-24 rounded-sm border text-center text-2xl font-bold"
            />
          </label>
          <div className="min-h-14 flex-1">
            {faixa ? (
              <p className="text-tinta-700 text-sm">
                <span className="font-titulo text-tinta-900 font-bold">{faixa.nome}.</span> {faixa.texto}
              </p>
            ) : d20 ? (
              <p className="text-heraldico-vermelho text-sm">Um número de 1 a 20.</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Botao variante="primario" onClick={() => abrirOBau()} disabled={!valido || nada} className="disabled:opacity-50">
            Abrir o baú
          </Botao>
          <Botao onClick={rolarPorMim} disabled={nada} className="disabled:opacity-50">
            Rolar por mim
          </Botao>
        </div>
        {nada ? (
          <p className="text-heraldico-vermelho mt-2 text-xs">Marque pelo menos uma coisa que o baú pode ter.</p>
        ) : null}
      </Painel>

      {resultado ? (
          <motion.section
            key={vez}
            aria-live="polite"
            initial={{ opacity: 0, y: reduzido ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduzido ? 0 : 0.4 }}
            className="painel-ficha relative mt-9 px-3 pt-7 pb-5 sm:px-5"
          >
            <h2 className="placa-painel font-titulo text-tinta-900 absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[0.66rem] leading-none font-bold tracking-[0.2em] whitespace-nowrap uppercase">
              O que tinha dentro
            </h2>

            <div className="flex items-center gap-4">
              <span className="font-titulo bg-tinta-900 text-pergaminho-50 grid size-14 shrink-0 place-items-center rounded-full text-2xl font-bold shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                {rolado}
              </span>
              <div>
                <p className="font-brasao text-tinta-900 text-2xl leading-tight">{resultado.faixa.nome}</p>
                <p className="text-tinta-700 text-sm italic">{resultado.faixa.texto}</p>
                <p className="text-tinta-500 mt-0.5 text-xs">{resultado.recipiente.nome}</p>
              </div>
            </div>

            {resultado.moedas.length ? (
              <div className="mt-5">
                <p className="text-tinta-500 text-xs">Moedas</p>
                <ul className="mt-1.5 flex flex-wrap gap-2">
                  {resultado.moedas.map((m) => (
                    <li
                      key={m.chave}
                      className="border-dourado-600/50 bg-dourado-400/15 font-titulo text-tinta-900 rounded-full border px-3 py-1 text-sm font-semibold"
                    >
                      {m.quantidade.toLocaleString("pt-BR")} {m.chave}
                      <span className="text-tinta-500 ml-1 text-xs font-normal">{m.nome.toLowerCase()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {resultado.vagas.length ? (
              <ol className="mt-5 space-y-3">
                {resultado.vagas.map((v, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: reduzido ? 0 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduzido ? 0 : 0.15 + i * 0.12 }}
                    className="border-dourado-600/30 rounded-sm border px-3 py-3"
                  >
                    {v.escolhido ? (
                      <CartaoDoAchado achado={v.escolhido} />
                    ) : (
                      <div>
                        <p className="font-titulo text-tinta-900 text-sm font-bold">
                          Achado {i + 1}: role 1d{v.dado}
                          <span className="text-tinta-500 ml-2 text-xs font-normal">
                            {v.tipo === "magico" ? "um item mágico" : "equipamento"} · {v.opcoes.length} opções
                          </span>
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={v.dado}
                            aria-label={`Resultado do d${v.dado} do achado ${i + 1}`}
                            value={segundos[i] ?? ""}
                            onChange={(ev) => setSegundos({ ...segundos, [i]: ev.target.value })}
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter") escolherPeloDado(i, Number(segundos[i]));
                            }}
                            className="border-dourado-600/40 bg-pergaminho-50 text-tinta-900 h-11 w-20 rounded-sm border text-center text-lg font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => escolherPeloDado(i, Number(segundos[i]))}
                            className="font-titulo border-tinta-900 bg-tinta-900 text-pergaminho-50 min-h-11 rounded-sm border px-4 text-xs font-semibold tracking-wide uppercase"
                          >
                            Ver o item
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const valor = 1 + Math.floor(Math.random() * v.dado);
                              setSegundos({ ...segundos, [i]: String(valor) });
                              escolherPeloDado(i, valor);
                            }}
                            className="text-tinta-700 hover:text-heraldico-vermelho min-h-11 px-2 text-xs underline underline-offset-4"
                          >
                            Rolar por mim
                          </button>
                        </div>
                        <ol className="border-dourado-600/25 mt-3 max-h-56 overflow-y-auto rounded-sm border text-xs [overscroll-behavior:contain]">
                          {v.opcoes.map((o) => (
                            <li key={o.de} className="border-dourado-600/15 flex gap-3 border-b px-2 py-1 last:border-0">
                              <span className="text-tinta-500 w-14 shrink-0 text-right tabular-nums">
                                {o.de === o.ate ? o.de : `${o.de}–${o.ate}`}
                              </span>
                              <span className="text-tinta-900">{o.nome}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {v.aviso ? <p className="text-tinta-500 mt-2 text-xs italic">{v.aviso}</p> : null}
                  </motion.li>
                ))}
              </ol>
            ) : !resultado.moedas.length ? (
              <p className="text-tinta-700 mt-5 text-sm italic">Nada. Só poeira e um cheiro de mofo.</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Botao onClick={copiar}>{copiado ? "Copiado" : "Copiar para o Discord"}</Botao>
              <Botao
                onClick={() => {
                  setResultado(null);
                  setD20("");
                }}
              >
                Abrir outro baú
              </Botao>
            </div>
          </motion.section>
        ) : null}
    </div>
  );
}
