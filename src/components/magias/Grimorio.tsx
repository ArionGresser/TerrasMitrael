"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArteDoCartao, CARTAO_COM_ARTE, GRADE_DE_CARTOES } from "@/components/ui/QuadroDeArte";
import { JanelaDaCarta, cliqueSimples, useCartaDaPagina } from "@/components/cartas/JanelaDaCarta";
import { CLASSES, ESCOLAS, circulo, type ResumoDaMagia } from "@/lib/magias-base";

/**
 * A lista de magias com busca e filtros.
 *
 * Os filtros ficam no endereço da página (?classe=Paladino&circulo=2), então
 * dá para mandar no grupo o link "magias de 2º círculo do Paladino" e quem
 * abrir já vê a lista filtrada.
 */

type Filtros = {
  busca: string;
  classe: string;
  circulo: string;
  escola: string;
  concentracao: boolean;
  ritual: boolean;
};

const VAZIO: Filtros = {
  busca: "",
  classe: "",
  circulo: "",
  escola: "",
  concentracao: false,
  ritual: false,
};

/** Busca sem se importar com acento nem maiúscula: "bola de fogo" acha "Bola de Fogo". */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function Grimorio({ magias }: { magias: ResumoDaMagia[] }) {
  const carta = useCartaDaPagina();
  const [filtros, setFiltros] = useState<Filtros>(VAZIO);

  // Lê os filtros do endereço ao abrir a página
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setFiltros({
      busca: p.get("busca") ?? "",
      classe: p.get("classe") ?? "",
      circulo: p.get("circulo") ?? "",
      escola: p.get("escola") ?? "",
      concentracao: p.get("concentracao") === "1",
      ritual: p.get("ritual") === "1",
    });
  }, []);

  // E escreve de volta a cada mudança, sem recarregar nem encher o histórico
  useEffect(() => {
    const p = new URLSearchParams();
    if (filtros.busca) p.set("busca", filtros.busca);
    if (filtros.classe) p.set("classe", filtros.classe);
    if (filtros.circulo) p.set("circulo", filtros.circulo);
    if (filtros.escola) p.set("escola", filtros.escola);
    if (filtros.concentracao) p.set("concentracao", "1");
    if (filtros.ritual) p.set("ritual", "1");
    const consulta = p.toString();
    window.history.replaceState(null, "", consulta ? `?${consulta}` : window.location.pathname);
  }, [filtros]);

  const mudar = <K extends keyof Filtros>(chave: K, valor: Filtros[K]) =>
    setFiltros((f) => ({ ...f, [chave]: valor }));

  const encontradas = useMemo(() => {
    const busca = normalizar(filtros.busca.trim());
    return magias.filter(
      (m) =>
        (!busca ||
          normalizar(m.nome).includes(busca) ||
          normalizar(m.original).includes(busca)) &&
        (!filtros.classe || m.classes.includes(filtros.classe)) &&
        (filtros.circulo === "" || m.nivel === Number(filtros.circulo)) &&
        (!filtros.escola || m.escola === filtros.escola) &&
        (!filtros.concentracao || m.concentracao) &&
        (!filtros.ritual || m.ritual)
    );
  }, [magias, filtros]);

  const porCirculo = useMemo(() => {
    const grupos = new Map<number, ResumoDaMagia[]>();
    for (const m of encontradas) {
      grupos.set(m.nivel, [...(grupos.get(m.nivel) ?? []), m]);
    }
    return [...grupos.entries()].sort(([a], [b]) => a - b);
  }, [encontradas]);

  const filtrando =
    filtros.busca ||
    filtros.classe ||
    filtros.circulo !== "" ||
    filtros.escola ||
    filtros.concentracao ||
    filtros.ritual;

  const campo =
    "border-dourado-600/40 bg-pergaminho-50 text-tinta-900 focus-visible:outline-dourado-600 min-h-11 w-full rounded-sm border px-3 text-sm";

  return (
    <div>
      <JanelaDaCarta
        aberta={!!carta.pagina}
        tipo="magia"
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
          <span className="sr-only">Nome da magia</span>
          <input
            type="search"
            value={filtros.busca}
            onChange={(e) => mudar("busca", e.target.value)}
            placeholder="Nome da magia, em português ou inglês"
            className={campo}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Classe</span>
            <select
              value={filtros.classe}
              onChange={(e) => mudar("classe", e.target.value)}
              className={campo}
            >
              <option value="">Todas</option>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-tinta-500 mb-1 block text-xs">Círculo</span>
            <select
              value={filtros.circulo}
              onChange={(e) => mudar("circulo", e.target.value)}
              className={campo}
            >
              <option value="">Todos</option>
              {Array.from({ length: 10 }, (_, n) => (
                <option key={n} value={n}>
                  {circulo(n)}
                </option>
              ))}
            </select>
          </label>

          <label className="col-span-2 block sm:col-span-1">
            <span className="text-tinta-500 mb-1 block text-xs">Escola</span>
            <select
              value={filtros.escola}
              onChange={(e) => mudar("escola", e.target.value)}
              className={campo}
            >
              <option value="">Todas</option>
              {ESCOLAS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <label className="text-tinta-700 flex min-h-11 items-center gap-2">
            <input
              type="checkbox"
              checked={filtros.concentracao}
              onChange={(e) => mudar("concentracao", e.target.checked)}
              className="accent-heraldico-vermelho size-4"
            />
            Só com concentração
          </label>
          <label className="text-tinta-700 flex min-h-11 items-center gap-2">
            <input
              type="checkbox"
              checked={filtros.ritual}
              onChange={(e) => mudar("ritual", e.target.checked)}
              className="accent-heraldico-vermelho size-4"
            />
            Só rituais
          </label>
          {filtrando ? (
            <button
              type="button"
              onClick={() => setFiltros(VAZIO)}
              className="text-tinta-500 hover:text-heraldico-vermelho ml-auto min-h-11 text-xs underline underline-offset-4"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      <p aria-live="polite" className="text-tinta-500 mt-5 text-center text-xs">
        {encontradas.length === 1
          ? "1 magia encontrada"
          : `${encontradas.length} magias encontradas`}
      </p>

      {porCirculo.length === 0 ? (
        <p className="text-tinta-700 mt-6 text-center text-sm italic">
          Nenhuma magia com esses filtros. Tente tirar algum.
        </p>
      ) : (
        <div className="mt-2 space-y-8">
          {porCirculo.map(([nivel, lista]) => (
            <section key={nivel} aria-label={circulo(nivel)}>
              <h2 className="font-titulo text-tinta-900 border-dourado-600/40 border-b pb-1 text-lg font-bold">
                {nivel === 0 ? "Truques" : circulo(nivel)}
                <span className="text-tinta-500 ml-2 text-xs font-normal">
                  {lista.length}
                </span>
              </h2>
              <ul className={`mt-3 ${GRADE_DE_CARTOES}`}>
                {lista.map((m) => (
                  <li key={m.slug}>
                    <Link
                      href={`/magias/${m.slug}/`}
                      className={CARTAO_COM_ARTE}
                      onClick={(e) => {
                        // Toque comum abre a carta; Ctrl+clique ainda abre a página
                        if (!cliqueSimples(e)) return;
                        e.preventDefault();
                        carta.abrir(`/magias/${m.slug}/`);
                      }}
                    >
                      <ArteDoCartao src={m.icone} />
                      <span className="min-w-0 flex-1">
                        <span className="text-tinta-900 block leading-snug font-semibold group-hover:underline">
                          {m.nome}
                        </span>
                        <span className="text-tinta-500 mt-0.5 block text-xs">
                          {m.escola} · {m.tempo}
                        </span>
                        <span className="text-tinta-500 hidden text-xs italic sm:block">{m.original}</span>
                        {m.concentracao || m.ritual ? (
                          <span className="mt-1.5 flex gap-1">
                            {m.concentracao ? (
                              <Marca titulo="Exige concentração">C</Marca>
                            ) : null}
                            {m.ritual ? <Marca titulo="Pode ser ritual">R</Marca> : null}
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

function Marca({ titulo, children }: { titulo: string; children: string }) {
  return (
    <span
      title={titulo}
      className="border-dourado-600/50 font-titulo text-tinta-700 grid size-6 place-items-center rounded-full border text-[0.65rem] font-bold"
    >
      <span aria-hidden>{children}</span>
      <span className="sr-only">{titulo}</span>
    </span>
  );
}
