"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { MAPA } from "@/lib/marcadores";
import { iniciarConta } from "@/lib/conta";
import { apagarMarca, lerMarcas, marcar, ouvirMarcas, type Marca, type TipoDeMarca } from "@/lib/mapa-da-mesa";
import { useConta } from "@/components/conta/useConta";
import { BOTAO, CAMPO } from "@/components/conta/MinhaConta";

const FERRAMENTAS: { tipo: TipoDeMarca; nome: string; texto: string }[] = [
  { tipo: "grupo", nome: "Mover o grupo", texto: "Toque onde o grupo está agora. A posição anterior vira trilha." },
  { tipo: "objetivo", nome: "Objetivo", texto: "Toque para marcar aonde eles precisam chegar." },
  { tipo: "caminho", nome: "Caminho", texto: "Toque os pontos do caminho planejado, na ordem." },
  { tipo: "nota", nome: "Nota", texto: "Toque para deixar uma anotação no mapa." },
];

const ZOOMS = [1, 1.6, 2.4, 3.4];

/**
 * O mapa da mesa: o mapa de Mitrael com a bolinha do grupo, a trilha de por
 * onde ele andou, os objetivos, o caminho planejado e notas. O Mestre marca;
 * todos com conta veem na hora. Tudo fica guardado.
 */
export function MapaDaMesa() {
  const conta = useConta();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const [marcas, setMarcas] = useState<Marca[] | null>(null);
  const [ferramenta, setFerramenta] = useState<TipoDeMarca | null>(null);
  const [texto, setTexto] = useState("");
  const [zoom, setZoom] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aberta, setAberta] = useState<Marca | null>(null);
  const mapa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void iniciarConta();
  }, []);

  const ler = useCallback(() => void lerMarcas().then(setMarcas), []);
  useEffect(() => {
    if (conta.fase !== "dentro") return;
    ler();
    return ouvirMarcas(ler);
  }, [conta.fase, ler]);

  if (conta.fase === "carregando") return <p className="text-tinta-700 py-10 text-center italic">Desenrolando o mapa…</p>;
  if (conta.fase === "fora")
    return (
      <p className="text-tinta-700 py-10 text-center">
        O mapa da mesa é para quem joga.{" "}
        <Link href="/conta/" className="text-heraldico-vermelho underline">
          Entre na sua conta
        </Link>
        .
      </p>
    );

  const lista = marcas ?? [];
  const grupo = lista.filter((m) => m.tipo === "grupo");
  const atual = grupo.at(-1);
  const caminho = lista.filter((m) => m.tipo === "caminho");
  const W = MAPA.largura;
  const H = MAPA.altura;
  const linha = (pontos: Marca[]) => pontos.map((p) => `${p.x * W},${p.y * H}`).join(" ");

  async function tocar(e: PointerEvent<HTMLDivElement>) {
    if (!ehMestre || !ferramenta || !mapa.current) return;
    const r = mapa.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const erro = await marcar(ferramenta, x, y, ferramenta === "grupo" ? undefined : texto);
    if (erro) setAviso(`Não marcou: ${erro}`);
    else {
      setAviso(null);
      if (ferramenta !== "caminho") setTexto("");
      ler();
    }
  }

  async function apagar(m: Marca) {
    const erro = await apagarMarca(m.id);
    setAviso(erro ? `Não apagou: ${erro}` : null);
    setAberta(null);
    ler();
  }

  async function limparCaminho() {
    for (const m of caminho) await apagarMarca(m.id);
    ler();
  }

  return (
    <div>
      {ehMestre ? (
        <div className="border-heraldico-vermelho/30 mb-3 rounded-sm border-2 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FERRAMENTAS.map((f) => (
              <button
                key={f.tipo}
                type="button"
                aria-pressed={ferramenta === f.tipo}
                onClick={() => setFerramenta((t) => (t === f.tipo ? null : f.tipo))}
                className={`font-titulo min-h-11 rounded-sm border px-2 text-xs font-semibold ${
                  ferramenta === f.tipo ? "border-madeira-800 bg-madeira-800 text-pergaminho-50" : "border-dourado-600/50 text-tinta-900"
                }`}
              >
                {f.nome}
              </button>
            ))}
          </div>
          <p className="text-tinta-700 mt-2 text-xs">
            {ferramenta ? FERRAMENTAS.find((f) => f.tipo === ferramenta)!.texto : "Escolha uma ferramenta e toque no mapa. Tocar numa marca abre ela (e dá para apagar)."}
          </p>
          {ferramenta && ferramenta !== "grupo" ? (
            <input
              value={texto}
              maxLength={120}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={ferramenta === "objetivo" ? "Altavela: a Estalagem do Galo Mudo" : ferramenta === "nota" ? "O que tem aqui" : "Nome do ponto (opcional)"}
              aria-label="Texto da marca"
              className={`${CAMPO} mt-2`}
            />
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {caminho.length ? (
              <button type="button" onClick={() => void limparCaminho()} className={`${BOTAO} px-3 text-xs`}>
                Apagar o caminho planejado
              </button>
            ) : null}
            {atual ? (
              <button type="button" onClick={() => void apagar(atual)} className={`${BOTAO} px-3 text-xs`}>
                Desfazer a última posição do grupo
              </button>
            ) : null}
          </div>
          {aviso ? <p className="text-heraldico-vermelho mt-2 text-xs">{aviso}</p> : null}
        </div>
      ) : null}

      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-tinta-700">
          {atual ? `O grupo está aqui desde ${new Date(atual.criado_em).toLocaleDateString("pt-BR")}.` : "O Mestre ainda não marcou onde o grupo está."}
        </span>
        <span className="flex gap-1">
          <button type="button" onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0} aria-label="Afastar" className={`${BOTAO} size-11 px-0`}>
            −
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))} disabled={zoom === ZOOMS.length - 1} aria-label="Aproximar" className={`${BOTAO} size-11 px-0`}>
            +
          </button>
        </span>
      </div>

      <div className="border-madeira-800/40 max-h-[75dvh] overflow-auto rounded-sm border-2 bg-[#20170f]">
        <div
          ref={mapa}
          onPointerUp={(e) => void tocar(e)}
          className={`relative ${ehMestre && ferramenta ? "cursor-crosshair" : ""}`}
          style={{ width: `${ZOOMS[zoom] * 100}%`, aspectRatio: `${W} / ${H}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MAPA.src} alt={MAPA.alt} className="absolute inset-0 size-full select-none" draggable={false} />
          <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 size-full">
            {/* A trilha de por onde o grupo andou */}
            {grupo.length > 1 ? (
              <polyline points={linha(grupo)} fill="none" stroke="#f2d27a" strokeWidth={5} strokeDasharray="2 12" strokeLinecap="round" />
            ) : null}
            {/* O caminho planejado */}
            {caminho.length > 1 || (atual && caminho.length) ? (
              <polyline
                points={linha(atual ? [atual, ...caminho] : caminho)}
                fill="none"
                stroke="#c0392b"
                strokeWidth={4}
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
            ) : null}
          </svg>

          {lista
            .filter((m) => m.tipo !== "grupo" || m.id === atual?.id)
            .map((m) => (
              <button
                key={m.id}
                type="button"
                onPointerUp={(e) => e.stopPropagation()}
                onClick={() => setAberta(m)}
                aria-label={m.tipo === "grupo" ? "O grupo" : `${m.tipo}: ${m.texto ?? ""}`}
                title={m.texto ?? (m.tipo === "grupo" ? "O grupo" : undefined)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
              >
                {m.tipo === "grupo" ? (
                  <span className="relative grid size-7 place-items-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#f2d27a]/50 motion-reduce:animate-none" />
                    <span className="relative size-5 rounded-full border-2 border-[#2b2118] bg-[#f2d27a] shadow-[0_0_10px_#f2d27a]" />
                  </span>
                ) : m.tipo === "objetivo" ? (
                  <span className="grid size-8 place-items-center rounded-full border-2 border-[#fff3d6] bg-[#c0392b] text-sm text-white shadow-lg">★</span>
                ) : m.tipo === "caminho" ? (
                  <span className="block size-3 rounded-full border-2 border-white bg-[#c0392b] shadow" />
                ) : (
                  <span className="grid size-6 place-items-center rounded-sm border border-[#2b2118] bg-[#f4ecdb] text-xs text-[#2b2118] shadow">✎</span>
                )}
              </button>
            ))}
        </div>
      </div>

      <ul className="text-tinta-700 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <li>
          <span className="mr-1 inline-block size-3 rounded-full bg-[#f2d27a] align-middle" /> o grupo · pontinhos: por onde andou
        </li>
        <li>
          <span className="mr-1 text-[#c0392b]">★</span> objetivo
        </li>
        <li>
          <span className="mr-1 inline-block h-0.5 w-5 border-t-2 border-dashed border-[#c0392b] align-middle" /> caminho planejado
        </li>
        <li>✎ nota</li>
      </ul>

      {lista.some((m) => m.tipo === "objetivo" || m.tipo === "nota") ? (
        <ul className="mt-3 space-y-1 text-sm">
          {lista
            .filter((m) => m.tipo === "objetivo" || m.tipo === "nota")
            .map((m) => (
              <li key={m.id} className="text-tinta-900">
                {m.tipo === "objetivo" ? "★" : "✎"} {m.texto || (m.tipo === "objetivo" ? "Objetivo" : "Nota")}
              </li>
            ))}
        </ul>
      ) : null}

      {aberta ? (
        <div role="dialog" aria-label="Marca do mapa" className="border-dourado-600/40 bg-pergaminho-50 fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-sm border-2 p-3 shadow-2xl">
          <p className="font-titulo text-tinta-900 text-sm font-bold">
            {aberta.tipo === "grupo" ? "O grupo" : aberta.tipo === "objetivo" ? "Objetivo" : aberta.tipo === "caminho" ? "Ponto do caminho" : "Nota"}
          </p>
          {aberta.texto ? <p className="text-tinta-700 text-sm">{aberta.texto}</p> : null}
          <p className="text-tinta-500 text-xs">Marcado em {new Date(aberta.criado_em).toLocaleString("pt-BR")}</p>
          <div className="mt-2 flex gap-2">
            {ehMestre ? (
              <button type="button" onClick={() => void apagar(aberta)} className={`${BOTAO} px-3 text-xs`}>
                Apagar
              </button>
            ) : null}
            <button type="button" onClick={() => setAberta(null)} className={`${BOTAO} px-3 text-xs`}>
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
