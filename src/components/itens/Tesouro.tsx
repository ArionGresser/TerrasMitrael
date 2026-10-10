"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORIAS,
  RARIDADES,
  rotuloDaRaridade,
  type ResumoDoItem,
} from "@/lib/itens-base";
import { ArteDoCartao, CARTAO_COM_ARTE, GRADE_DE_CARTOES } from "@/components/ui/QuadroDeArte";
import { JanelaDaCarta, cliqueSimples, useCartaDaPagina } from "@/components/cartas/JanelaDaCarta";

/**
 * A lista de itens mágicos com busca e filtros, no mesmo molde do Grimório.
 *
 * Os filtros também ficam no endereço (?categoria=Poção&raridade=Raro),
 * para dar para mandar a lista filtrada no grupo.
 */

type Filtros = {
  busca: string;
  categoria: string;
  raridade: string;
  sintonia: "" | "sim" | "nao";
};

const VAZIO: Filtros = { busca: "", categoria: "", raridade: "", sintonia: "" };

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** A letra do grupo, sem acento: "Óleo Etéreo" fica no O. */
function inicial(nome: string): string {
  return normalizar(nome[0]).toUpperCase();
}

export function Tesouro({ itens }: { itens: ResumoDoItem[] }) {
  const carta = useCartaDaPagina();
  const [filtros, setFiltros] = useState<Filtros>(VAZIO);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sintonia = p.get("sintonia");
    setFiltros({
      busca: p.get("busca") ?? "",
      categoria: p.get("categoria") ?? "",
      raridade: p.get("raridade") ?? "",
      sintonia: sintonia === "sim" || sintonia === "nao" ? sintonia : "",
    });
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (filtros.busca) p.set("busca", filtros.busca);
    if (filtros.categoria) p.set("categoria", filtros.categoria);
    if (filtros.raridade) p.set("raridade", filtros.raridade);
    if (filtros.sintonia) p.set("sintonia", filtros.sintonia);
    const consulta = p.toString();
    window.history.replaceState(
      null,
      "",
      consulta ? `?${consulta}` : window.location.pathname,
    );
  }, [filtros]);

  const mudar = <K extends keyof Filtros>(chave: K, valor: Filtros[K]) =>
    setFiltros((f) => ({ ...f, [chave]: valor }));

  const encontrados = useMemo(() => {
    const busca = normalizar(filtros.busca.trim());
    return itens.filter(
      (i) =>
        (!busca ||
          normalizar(i.nome).includes(busca) ||
          normalizar(i.original).includes(busca)) &&
        (!filtros.categoria || i.categoria === filtros.categoria) &&
        (!filtros.raridade || i.raridades.includes(filtros.raridade)) &&
        (!filtros.sintonia || i.sintonia === (filtros.sintonia === "sim")),
    );
  }, [itens, filtros]);

  const porLetra = useMemo(() => {
    const grupos = new Map<string, ResumoDoItem[]>();
    for (const i of encontrados) {
      const letra = inicial(i.nome);
      grupos.set(letra, [...(grupos.get(letra) ?? []), i]);
    }
    return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [encontrados]);

  const filtrando =
    filtros.busca || filtros.categoria || filtros.raridade || filtros.sintonia;

  const campo =
    "border-dourado-600/40 bg-pergaminho-50 text-tinta-900 focus-visible:outline-dourado-600 min-h-11 w-full rounded-sm border px-3 text-sm";

  return (
    <div>
      <JanelaDaCarta
        aberta={!!carta.pagina}
        tipo="item-magico"
        pagina={carta.pagina ?? undefined}
        aoFechar={carta.fechar}
      >
        {carta.conteudo}
      </JanelaDaCarta>
      <div className="painel-ficha mt-4 px-3 pt-6 pb-4 [color-scheme:light] sm:px-5">
        <h2 className="placa-painel font-titulo text-tinta-900 absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[0.66rem] leading-none font-bold tracking-[0.2em] whitespace-nowrap uppercase">
          Procurar
        </h2>

        <label className="block">
          <span className="sr-only">Nome do item</span>
          <input
            type="search"
            value={filtros.busca}
            onChange={(e) => mudar("busca", e.target.value)}
            placeholder="Nome do item, em português ou inglês"
            className={campo}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Tipo</span>
            <select
              value={filtros.categoria}
              onChange={(e) => mudar("categoria", e.target.value)}
              className={campo}
            >
              <option value="">Todos</option>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Raridade</span>
            <select
              value={filtros.raridade}
              onChange={(e) => mudar("raridade", e.target.value)}
              className={campo}
            >
              <option value="">Todas</option>
              {RARIDADES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>

          <label className="col-span-2 block sm:col-span-1">
            <span className="text-tinta-500 mb-1 block text-xs">Sintonia</span>
            <select
              value={filtros.sintonia}
              onChange={(e) =>
                mudar("sintonia", e.target.value as Filtros["sintonia"])
              }
              className={campo}
            >
              <option value="">Tanto faz</option>
              <option value="sim">Exige Sintonia</option>
              <option value="nao">Sem Sintonia</option>
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
          ? "1 item encontrado"
          : `${encontrados.length} itens encontrados`}
      </p>

      {porLetra.length === 0 ? (
        <p className="text-tinta-700 mt-6 text-center text-sm italic">
          Nenhum item com esses filtros. Tente tirar algum.
        </p>
      ) : (
        <div className="mt-2 space-y-8">
          {porLetra.map(([letra, lista]) => (
            <section key={letra} aria-label={`Letra ${letra}`}>
              <h2 className="font-titulo text-tinta-900 border-dourado-600/40 border-b pb-1 text-lg font-bold">
                {letra}
                <span className="text-tinta-500 ml-2 text-xs font-normal">
                  {lista.length}
                </span>
              </h2>
              <ul className={`mt-3 ${GRADE_DE_CARTOES}`}>
                {lista.map((i) => (
                  <li key={i.slug}>
                    <Link
                      href={`/itens/${i.slug}/`}
                      className={CARTAO_COM_ARTE}
                      onClick={(e) => {
                        // Toque comum abre a carta; Ctrl+clique ainda abre a página
                        if (!cliqueSimples(e)) return;
                        e.preventDefault();
                        carta.abrir(`/itens/${i.slug}/`);
                      }}
                    >
                      <ArteDoCartao src={i.imagem} />
                      <span className="min-w-0 flex-1">
                        <span className="text-tinta-900 block leading-snug font-semibold group-hover:underline">
                          {i.nome}
                        </span>
                        <span className="text-tinta-500 mt-0.5 block text-xs">
                          {i.categoria} · {rotuloDaRaridade(i)}
                        </span>
                        <span className="text-tinta-500 hidden text-xs italic sm:block">{i.original}</span>
                        {i.sintonia ? (
                          <span
                            title="Exige Sintonia"
                            className="border-dourado-600/50 font-titulo text-tinta-700 mt-1.5 grid size-6 place-items-center rounded-full border text-[0.65rem] font-bold"
                          >
                            <span aria-hidden>S</span>
                            <span className="sr-only">Exige Sintonia</span>
                          </span>
                        ) : null}
                      </span>
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
