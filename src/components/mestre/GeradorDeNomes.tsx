"use client";

import { useEffect, useState } from "react";
import { gerarNomes, POVOS, type Genero, type NomeGerado } from "@/lib/nomes";
import { BOTAO, BOTAO_CHEIO } from "@/components/conta/MinhaConta";

const CHAVE = "mitrael:nomes:favoritos";

function lerFavoritos(): NomeGerado[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? "[]") as NomeGerado[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function guardarFavoritos(lista: NomeGerado[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // Sem armazenamento (janela anônima): os favoritos valem só até fechar
  }
}

const GENEROS: { valor: Genero; rotulo: string }[] = [
  { valor: "qualquer", rotulo: "Tanto faz" },
  { valor: "masculino", rotulo: "Masculino" },
  { valor: "feminino", rotulo: "Feminino" },
];

const CHIP = "font-titulo min-h-10 rounded-sm border px-3 text-sm font-semibold transition-colors";
const chip = (ligado: boolean) =>
  `${CHIP} ${ligado ? "bg-tinta-900 border-tinta-900 text-pergaminho-50" : "border-dourado-600/50 text-tinta-900 hover:bg-dourado-400/20"}`;

/** Um NPC precisa de nome agora: escolha o povo e toque para copiar. */
export function GeradorDeNomes() {
  const [povo, setPovo] = useState("anao");
  const [genero, setGenero] = useState<Genero>("qualquer");
  const [nomes, setNomes] = useState<NomeGerado[]>([]);
  const [favoritos, setFavoritos] = useState<NomeGerado[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    setFavoritos(lerFavoritos());
  }, []);

  useEffect(() => {
    setNomes(gerarNomes(povo, genero));
  }, [povo, genero]);

  async function copiar(nome: string) {
    try {
      await navigator.clipboard.writeText(nome);
      setCopiado(nome);
      setTimeout(() => setCopiado((c) => (c === nome ? null : c)), 1500);
    } catch {
      setCopiado(null);
    }
  }

  function alternarFavorito(n: NomeGerado) {
    const ja = favoritos.some((f) => f.nome === n.nome);
    const nova = ja ? favoritos.filter((f) => f.nome !== n.nome) : [n, ...favoritos].slice(0, 60);
    setFavoritos(nova);
    guardarFavoritos(nova);
  }

  const linha = (n: NomeGerado, mostrarPovo: boolean) => {
    const favorito = favoritos.some((f) => f.nome === n.nome);
    return (
      <li key={n.nome} className="border-dourado-600/30 flex items-stretch rounded-sm border">
        <button
          type="button"
          onClick={() => void copiar(n.nome)}
          className="hover:bg-dourado-400/15 min-h-11 flex-1 px-3 py-2 text-left transition-colors"
          aria-label={`Copiar ${n.nome}`}
        >
          <span className="font-titulo text-tinta-900 font-bold">{n.nome}</span>
          {mostrarPovo ? <span className="text-tinta-500 ml-2 text-xs">{n.povo}</span> : null}
          {copiado === n.nome ? <span className="text-heraldico-vermelho ml-2 text-xs">copiado!</span> : null}
        </button>
        <button
          type="button"
          onClick={() => alternarFavorito(n)}
          aria-pressed={favorito}
          aria-label={favorito ? `Tirar ${n.nome} dos favoritos` : `Guardar ${n.nome} nos favoritos`}
          className="border-dourado-600/30 text-dourado-600 hover:bg-dourado-400/15 min-h-11 min-w-11 border-l text-lg transition-colors"
        >
          {favorito ? "★" : "☆"}
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="font-titulo text-tinta-900 text-lg font-bold">Povo</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {POVOS.map((p) => (
            <button key={p.slug} type="button" aria-pressed={povo === p.slug} onClick={() => setPovo(p.slug)} className={chip(povo === p.slug)}>
              {p.nome}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-titulo text-tinta-900 text-lg font-bold">Gênero</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GENEROS.map((g) => (
            <button key={g.valor} type="button" aria-pressed={genero === g.valor} onClick={() => setGenero(g.valor)} className={chip(genero === g.valor)}>
              {g.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      <section aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-titulo text-tinta-900 text-lg font-bold">Nomes</h2>
          <button type="button" onClick={() => setNomes(gerarNomes(povo, genero))} className={BOTAO_CHEIO}>
            ↻ Outros nomes
          </button>
        </div>
        <p className="text-tinta-500 mt-1 text-xs">Toque no nome para copiar. A estrela guarda nos favoritos (neste aparelho).</p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">{nomes.map((n) => linha(n, false))}</ul>
      </section>

      {favoritos.length ? (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-titulo text-tinta-900 text-lg font-bold">Favoritos</h2>
            <button
              type="button"
              onClick={() => {
                setFavoritos([]);
                guardarFavoritos([]);
              }}
              className={`${BOTAO} min-h-9 px-3 text-xs`}
            >
              Limpar os favoritos
            </button>
          </div>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">{favoritos.map((n) => linha(n, true))}</ul>
        </section>
      ) : null}

      <p className="text-tinta-500 text-xs italic">✦ As sílabas e os sobrenomes são todos daqui, feitos para Mitrael.</p>
    </div>
  );
}
