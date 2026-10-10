"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TAMANHOS, TIPOS, type ResumoDoMonstro } from "@/lib/monstros-base";
import { Miniatura } from "@/components/ui/QuadroDeArte";

/**
 * A lista do bestiário com busca e filtros, no mesmo molde do Grimório.
 *
 * Os filtros ficam no endereço (?tipo=Dragão&nd=5), para dar para mandar a
 * lista filtrada no grupo. A lista sai agrupada por Nível de Desafio, que é
 * como o Mestre procura uma criatura para o encontro.
 */

type Filtros = {
  busca: string;
  tipo: string;
  nd: string;
  tamanho: string;
  fonte: "" | "monstro" | "animal";
};

const VAZIO: Filtros = { busca: "", tipo: "", nd: "", tamanho: "", fonte: "" };

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function Bestiario({ monstros }: { monstros: ResumoDoMonstro[] }) {
  const [filtros, setFiltros] = useState<Filtros>(VAZIO);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const fonte = p.get("fonte");
    setFiltros({
      busca: p.get("busca") ?? "",
      tipo: p.get("tipo") ?? "",
      nd: p.get("nd") ?? "",
      tamanho: p.get("tamanho") ?? "",
      fonte: fonte === "monstro" || fonte === "animal" ? fonte : "",
    });
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (filtros.busca) p.set("busca", filtros.busca);
    if (filtros.tipo) p.set("tipo", filtros.tipo);
    if (filtros.nd) p.set("nd", filtros.nd);
    if (filtros.tamanho) p.set("tamanho", filtros.tamanho);
    if (filtros.fonte) p.set("fonte", filtros.fonte);
    const consulta = p.toString();
    window.history.replaceState(
      null,
      "",
      consulta ? `?${consulta}` : window.location.pathname,
    );
  }, [filtros]);

  const mudar = <K extends keyof Filtros>(chave: K, valor: Filtros[K]) =>
    setFiltros((f) => ({ ...f, [chave]: valor }));

  // Os NDs que existem, em ordem: 0, 1/8, 1/4, 1/2, 1, 2...
  const nds = useMemo(
    () =>
      [...new Map(monstros.map((m) => [m.nd, m.ndNumero])).entries()]
        .sort(([, a], [, b]) => a - b)
        .map(([nd]) => nd),
    [monstros],
  );

  const encontrados = useMemo(() => {
    const busca = normalizar(filtros.busca.trim());
    return monstros.filter(
      (m) =>
        (!busca ||
          normalizar(m.nome).includes(busca) ||
          normalizar(m.original).includes(busca)) &&
        (!filtros.tipo || m.tipo === filtros.tipo) &&
        (!filtros.nd || m.nd === filtros.nd) &&
        (!filtros.tamanho || m.tamanho === filtros.tamanho) &&
        (!filtros.fonte || m.fonte === filtros.fonte),
    );
  }, [monstros, filtros]);

  const porNd = useMemo(() => {
    const grupos = new Map<string, ResumoDoMonstro[]>();
    for (const m of [...encontrados].sort((a, b) => a.ndNumero - b.ndNumero)) {
      grupos.set(m.nd, [...(grupos.get(m.nd) ?? []), m]);
    }
    return [...grupos.entries()].map(
      ([nd, lista]) =>
        [nd, lista.sort((a, b) => a.nome.localeCompare(b.nome))] as const,
    );
  }, [encontrados]);

  const filtrando =
    filtros.busca ||
    filtros.tipo ||
    filtros.nd ||
    filtros.tamanho ||
    filtros.fonte;

  const campo =
    "border-dourado-600/40 bg-pergaminho-50 text-tinta-900 focus-visible:outline-dourado-600 min-h-11 w-full rounded-sm border px-3 text-sm";

  return (
    <div>
      <div className="painel-ficha mt-4 px-3 pt-6 pb-4 [color-scheme:light] sm:px-5">
        <h2 className="placa-painel font-titulo text-tinta-900 absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[0.66rem] leading-none font-bold tracking-[0.2em] whitespace-nowrap uppercase">
          Procurar
        </h2>

        <label className="block">
          <span className="sr-only">Nome da criatura</span>
          <input
            type="search"
            value={filtros.busca}
            onChange={(e) => mudar("busca", e.target.value)}
            placeholder="Nome da criatura, em português ou inglês"
            className={campo}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Tipo</span>
            <select
              value={filtros.tipo}
              onChange={(e) => mudar("tipo", e.target.value)}
              className={campo}
            >
              <option value="">Todos</option>
              {TIPOS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">
              Nível de Desafio
            </span>
            <select
              value={filtros.nd}
              onChange={(e) => mudar("nd", e.target.value)}
              className={campo}
            >
              <option value="">Todos</option>
              {nds.map((nd) => (
                <option key={nd} value={nd}>
                  ND {nd}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Tamanho</span>
            <select
              value={filtros.tamanho}
              onChange={(e) => mudar("tamanho", e.target.value)}
              className={campo}
            >
              <option value="">Todos</option>
              {TAMANHOS.map(([en, pt]) => (
                <option key={en} value={en}>
                  {pt}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Seção</span>
            <select
              value={filtros.fonte}
              onChange={(e) =>
                mudar("fonte", e.target.value as Filtros["fonte"])
              }
              className={campo}
            >
              <option value="">Tudo</option>
              <option value="monstro">Monstros</option>
              <option value="animal">Animais</option>
            </select>
          </label>
        </div>

        {filtrando ? (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setFiltros(VAZIO)}
              className="text-tinta-500 hover:text-heraldico-vermelho min-h-11 text-xs underline underline-offset-4"
            >
              Limpar filtros
            </button>
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="text-tinta-500 mt-5 text-center text-xs">
        {encontrados.length === 1
          ? "1 criatura encontrada"
          : `${encontrados.length} criaturas encontradas`}
      </p>

      {porNd.length === 0 ? (
        <p className="text-tinta-700 mt-6 text-center text-sm italic">
          Nenhuma criatura com esses filtros. Tente tirar algum.
        </p>
      ) : (
        <div className="mt-2 space-y-8">
          {porNd.map(([nd, lista]) => (
            <section key={nd} aria-label={`Nível de Desafio ${nd}`}>
              <h2 className="font-titulo text-tinta-900 border-dourado-600/40 border-b pb-1 text-lg font-bold">
                ND {nd}
                <span className="text-tinta-500 ml-2 text-xs font-normal">
                  {lista.length}
                </span>
              </h2>
              <ul>
                {lista.map((m) => (
                  <li
                    key={m.slug}
                    className="border-dourado-600/20 border-b border-dashed last:border-0"
                  >
                    <Link
                      href={`/monstros/${m.slug}/`}
                      className="group hover:bg-pergaminho-200/40 -mx-2 flex items-center gap-3 rounded-sm px-2 py-2.5 transition-colors sm:gap-4"
                    >
                      <Miniatura src={m.imagem} tamanho="larga" />
                      <span className="min-w-0 flex-1">
                        <span className="text-tinta-900 block font-semibold group-hover:underline">
                          {m.nome}
                        </span>
                        <span className="text-tinta-500 block text-xs">
                          {m.tipo} ·{" "}
                          {TAMANHOS.find(([en]) => en === m.tamanho)?.[1]}
                          <span className="italic"> · {m.original}</span>
                        </span>
                      </span>
                      {m.fonte === "animal" ? (
                        <span
                          title="Animal"
                          className="border-dourado-600/50 font-titulo text-tinta-700 grid size-6 shrink-0 place-items-center rounded-full border text-[0.65rem] font-bold"
                        >
                          <span aria-hidden>A</span>
                          <span className="sr-only">Animal</span>
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
