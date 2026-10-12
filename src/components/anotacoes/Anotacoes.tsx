"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { iniciarConta } from "@/lib/conta";
import {
  apagarAnotacao,
  criarAnotacao,
  lerAnotacoes,
  ouvirAnotacoes,
  salvarAnotacao,
  type Anotacao,
  type RascunhoDeAnotacao,
} from "@/lib/anotacoes";
import { useConta } from "@/components/conta/useConta";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

type Filtro = "minhas" | "mesa";

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/**
 * O caderno de anotações: cada um escreve as suas, que só ele lê, e pode
 * mostrar uma para a mesa toda. Salva sozinho enquanto a pessoa escreve.
 */
export function Anotacoes() {
  const conta = useConta();
  const eu = conta.fase === "dentro" ? conta.perfil.id : null;
  const [lista, setLista] = useState<Anotacao[] | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("minhas");
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    void iniciarConta();
  }, []);

  const ler = useCallback(() => void lerAnotacoes().then(setLista), []);
  useEffect(() => {
    if (!eu) return;
    ler();
    return ouvirAnotacoes(ler);
  }, [eu, ler]);

  if (conta.fase === "carregando") return <p className="text-tinta-700 py-10 text-center italic">Abrindo o caderno…</p>;
  if (conta.fase === "fora")
    return (
      <p className="text-tinta-700 py-10 text-center">
        As anotações ficam guardadas na sua conta.{" "}
        <Link href="/conta/" className="text-heraldico-vermelho underline">
          Entre nela
        </Link>
        .
      </p>
    );

  const todas = lista ?? [];
  const nota = todas.find((a) => a.id === aberta);

  if (nota)
    return (
      <Editor
        key={nota.id}
        nota={nota}
        minha={nota.dono === eu}
        voltar={() => {
          setAberta(null);
          ler();
        }}
      />
    );

  async function nova() {
    const r = await criarAnotacao({ titulo: "", texto: "", da_mesa: filtro === "mesa" });
    if (typeof r === "string") {
      setAviso(`Não criou: ${r}`);
      return;
    }
    setAviso(null);
    setLista((l) => [r, ...(l ?? [])]);
    setAberta(r.id);
  }

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const vistas = todas
    .filter((a) => (filtro === "minhas" ? a.dono === eu : a.da_mesa))
    .filter((a) => !termo || `${a.titulo}\n${a.texto}`.toLocaleLowerCase("pt-BR").includes(termo));
  const daMesa = todas.filter((a) => a.da_mesa).length;

  const aba = (qual: Filtro, texto: string) => (
    <button
      type="button"
      aria-pressed={filtro === qual}
      onClick={() => setFiltro(qual)}
      className={`font-titulo min-h-11 flex-1 rounded-sm px-3 text-sm font-semibold transition-colors ${
        filtro === qual ? "bg-madeira-800 text-pergaminho-50" : "text-tinta-700 hover:bg-dourado-400/15"
      }`}
    >
      {texto}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="border-dourado-600/40 flex gap-1 rounded-sm border p-1" role="group" aria-label="Quais anotações">
        {aba("minhas", "Minhas")}
        {aba("mesa", `Da mesa${daMesa ? ` (${daMesa})` : ""}`)}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Procurar nas anotações"
          aria-label="Procurar nas anotações"
          className={CAMPO}
        />
        <button type="button" onClick={() => void nova()} className={`${BOTAO_CHEIO} shrink-0`}>
          + Nova anotação
        </button>
      </div>
      {aviso ? <p className="text-heraldico-vermelho text-sm">{aviso}</p> : null}

      {lista === null ? (
        <p className="text-tinta-700 text-center text-sm italic">Lendo…</p>
      ) : vistas.length === 0 ? (
        <p className="text-tinta-700 py-6 text-center text-sm">
          {termo
            ? "Nada com esse texto."
            : filtro === "minhas"
              ? "Nenhuma anotação ainda. Nomes, pistas, dívidas, aquele NPC suspeito: tudo cabe aqui."
              : "Ninguém mostrou uma anotação para a mesa ainda."}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {vistas.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setAberta(a.id)}
                className="border-dourado-600/30 hover:bg-dourado-400/10 block min-h-11 w-full rounded-sm border p-3 text-left transition-colors"
              >
                <span className="font-titulo text-tinta-900 block truncate text-sm font-semibold">{a.titulo || "Sem título"}</span>
                <span className="text-tinta-700 mt-1 line-clamp-2 block text-xs leading-relaxed">{a.texto || "Vazia."}</span>
                <span className="text-tinta-500 mt-1 block text-[0.7rem]">
                  {a.dono !== eu ? `${a.autor} · ` : a.da_mesa ? "mostrada à mesa · " : ""}
                  {quando(a.mudada_em)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Uma anotação aberta. A do dono salva sozinha; a de outro é só leitura. */
function Editor({ nota, minha, voltar }: { nota: Anotacao; minha: boolean; voltar: () => void }) {
  const [rascunho, setRascunho] = useState<RascunhoDeAnotacao>({ titulo: nota.titulo, texto: nota.texto, da_mesa: nota.da_mesa });
  const [estado, setEstado] = useState<"salvo" | "mudou" | "salvando" | string>("salvo");
  const [confirmar, setConfirmar] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendente = useRef<RascunhoDeAnotacao | null>(null);
  const id = useId();

  const gravar = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const r = pendente.current;
    if (!r) return;
    pendente.current = null;
    setEstado("salvando");
    const erro = await salvarAnotacao(nota.id, r);
    setEstado(erro ? `Não salvou: ${erro}` : pendente.current ? "mudou" : "salvo");
  }, [nota.id]);

  // Fechar a tela não perde o que foi escrito no último segundo
  useEffect(() => () => void gravar(), [gravar]);

  function mudar(parte: Partial<RascunhoDeAnotacao>) {
    const novo = { ...rascunho, ...parte };
    setRascunho(novo);
    pendente.current = novo;
    setEstado("mudou");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void gravar(), 800);
  }

  async function apagar() {
    pendente.current = null;
    if (timer.current) clearTimeout(timer.current);
    const erro = await apagarAnotacao(nota.id);
    if (erro) setEstado(`Não apagou: ${erro}`);
    else voltar();
  }

  const status =
    estado === "salvo" ? "Salvo" : estado === "mudou" ? "Escrevendo…" : estado === "salvando" ? "Salvando…" : estado;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={async () => {
            await gravar();
            voltar();
          }}
          className={`${BOTAO} px-3`}
        >
          ← Anotações
        </button>
        {minha ? (
          <span role="status" className={`text-xs ${estado.startsWith("Não") ? "text-heraldico-vermelho" : "text-tinta-500"}`}>
            {status}
          </span>
        ) : (
          <span className="text-tinta-500 text-xs">de {nota.autor}</span>
        )}
      </div>

      {minha ? (
        <>
          <label htmlFor={`${id}-titulo`} className="sr-only">
            Título
          </label>
          <input
            id={`${id}-titulo`}
            value={rascunho.titulo}
            maxLength={120}
            onChange={(e) => mudar({ titulo: e.target.value })}
            placeholder="Título"
            className={`${CAMPO} font-titulo font-semibold`}
          />
          <label htmlFor={`${id}-texto`} className="sr-only">
            Texto
          </label>
          <textarea
            id={`${id}-texto`}
            value={rascunho.texto}
            maxLength={20000}
            rows={14}
            autoFocus={!nota.titulo && !nota.texto}
            onChange={(e) => mudar({ texto: e.target.value })}
            placeholder="Escreva aqui. Salva sozinho."
            className={`${CAMPO} min-h-[50dvh] py-2 leading-relaxed`}
          />
          <label className="text-tinta-900 flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rascunho.da_mesa}
              onChange={(e) => mudar({ da_mesa: e.target.checked })}
              className="accent-heraldico-vermelho size-5"
            />
            Mostrar para a mesa (todos com conta leem; só você muda)
          </label>
          <div className="flex justify-end gap-2">
            {confirmar ? (
              <>
                <span className="text-tinta-700 self-center text-xs">Apagar de vez?</span>
                <button type="button" onClick={() => void apagar()} className={`${BOTAO} border-heraldico-vermelho text-heraldico-vermelho px-3`}>
                  Sim, apagar
                </button>
                <button type="button" onClick={() => setConfirmar(false)} className={`${BOTAO} px-3`}>
                  Não
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmar(true)} className={`${BOTAO} px-3`}>
                Apagar anotação
              </button>
            )}
          </div>
        </>
      ) : (
        <article>
          <h2 className="font-titulo text-tinta-900 text-lg font-bold">{nota.titulo || "Sem título"}</h2>
          <p className="text-tinta-900 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{nota.texto}</p>
          <p className="text-tinta-500 mt-3 text-xs">Mudada em {quando(nota.mudada_em)}</p>
        </article>
      )}
    </div>
  );
}
