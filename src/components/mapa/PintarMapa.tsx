"use client";

import { useCallback, useEffect, useId, useRef, useState, type PointerEvent as EventoDePonteiro } from "react";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";

/**
 * Pintar o mapa para a IA redesenhar: o Mestre pinta por cima do mapa de
 * hoje com cores de terreno e marca cidades, castelos e portos. Sai uma
 * imagem-guia (só cores e símbolos, sem nome nenhum) e um prompt que
 * explica a legenda. Os nomes ficam de fora de propósito: quem escreve os
 * nomes no mapa é o site, por cima da arte.
 *
 * Tudo roda aqui no navegador e fica guardado neste aparelho.
 */

const L = 1600;
const A = 1132;
const CHAVE = "mitrael:pintar-mapa";

export const TERRENOS = [
  { chave: "mar", nome: "Mar", cor: "#2b6f8a", ingles: "open sea and ocean" },
  { chave: "agua", nome: "Lago e rio", cor: "#4fb3d9", ingles: "lakes and rivers" },
  { chave: "planicie", nome: "Planície", cor: "#b7d77a", ingles: "grassland, meadows and farmland" },
  { chave: "floresta", nome: "Floresta", cor: "#2f7d32", ingles: "dense forest" },
  { chave: "montanha", nome: "Montanha", cor: "#8a6f5a", ingles: "mountain ranges and rocky highlands" },
  { chave: "neve", nome: "Neve e gelo", cor: "#eef3f8", ingles: "snow, glaciers and frozen tundra" },
  { chave: "deserto", nome: "Deserto e sal", cor: "#e8c872", ingles: "desert dunes and salt flats" },
  { chave: "pantano", nome: "Pântano", cor: "#6b7f3a", ingles: "swamps and marshland" },
  { chave: "maldita", nome: "Terra maldita", cor: "#5a3a4a", ingles: "cursed, blighted wasteland with dead trees" },
  { chave: "vulcao", nome: "Vulcânica", cor: "#b5402a", ingles: "volcanic land, ash fields and lava" },
  { chave: "estrada", nome: "Estrada", cor: "#d9b38c", ingles: "roads and trade routes" },
] as const;

export const MARCAS = [
  { chave: "cidade", nome: "Cidade", simbolo: "●", ingles: "a large walled city" },
  { chave: "vila", nome: "Vila", simbolo: "•", ingles: "a small village" },
  { chave: "castelo", nome: "Castelo", simbolo: "■", ingles: "a castle or fortress" },
  { chave: "porto", nome: "Porto", simbolo: "▼", ingles: "a harbor town with docks" },
  { chave: "templo", nome: "Templo", simbolo: "✚", ingles: "a temple or sanctuary" },
  { chave: "torre", nome: "Torre", simbolo: "▲", ingles: "a lone tower" },
  { chave: "ruina", nome: "Ruína", simbolo: "✕", ingles: "ancient ruins" },
] as const;

type Ferramenta = "pincel" | "balde" | "borracha" | "marca";
type Marca = { id: string; tipo: string; x: number; y: number; nome: string };

const onde = (x: number, y: number) => {
  const v = y < A / 3 ? "north" : y > (2 * A) / 3 ? "south" : "";
  const h = x < L / 3 ? "west" : x > (2 * L) / 3 ? "east" : "";
  return v && h ? `${v}-${h}` : v || h || "center";
};

export function PintarMapa() {
  const id = useId();
  const pintura = useRef<HTMLCanvasElement>(null);
  const base = useRef<ImageData | null>(null);
  const historico = useRef<string[]>([]);
  const ultimo = useRef<{ x: number; y: number } | null>(null);
  const guardarDepois = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [ferramenta, setFerramenta] = useState<Ferramenta>("pincel");
  const [terreno, setTerreno] = useState<string>("floresta");
  const [tamanho, setTamanho] = useState(24);
  const [tolerancia, setTolerancia] = useState(28);
  const [tipoDeMarca, setTipoDeMarca] = useState<string>("cidade");
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [mostrarMapa, setMostrarMapa] = useState(true);
  const [opacidade, setOpacidade] = useState(0.75);
  const [podeDesfazer, setPodeDesfazer] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [textoDoPrompt, setTextoDoPrompt] = useState<string | null>(null);

  const cor = TERRENOS.find((t) => t.chave === terreno)?.cor ?? "#000";
  const ctx = () => pintura.current?.getContext("2d", { willReadFrequently: true }) ?? null;

  const guardar = useCallback((m: Marca[]) => {
    clearTimeout(guardarDepois.current);
    guardarDepois.current = setTimeout(() => {
      try {
        localStorage.setItem(CHAVE, JSON.stringify({ pintura: pintura.current?.toDataURL("image/png"), marcas: m }));
      } catch {
        setAviso("Não deu para guardar neste aparelho (memória do navegador cheia). Baixe a referência para não perder.");
      }
    }, 800);
  }, []);

  // O mapa de baixo, lido uma vez, é o que o balde usa para achar as bordas
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = L;
      c.height = A;
      const x = c.getContext("2d")!;
      x.drawImage(img, 0, 0, L, A);
      base.current = x.getImageData(0, 0, L, A);
    };
    img.src = "/images/map.jpg";
  }, []);

  // O que ficou guardado da última vez
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "null") as { pintura?: string; marcas?: Marca[] } | null;
      if (salvo?.marcas) setMarcas(salvo.marcas);
      if (salvo?.pintura) {
        const img = new Image();
        img.onload = () => ctx()?.drawImage(img, 0, 0);
        img.src = salvo.pintura;
      }
    } catch {
      // Sem armazenamento: começa em branco
    }
  }, []);

  function lembrar() {
    const c = pintura.current;
    if (!c) return;
    historico.current = [...historico.current, c.toDataURL("image/png")].slice(-15);
    setPodeDesfazer(true);
  }

  function desfazer() {
    const anterior = historico.current.pop();
    setPodeDesfazer(historico.current.length > 0);
    if (!anterior) return;
    const img = new Image();
    img.onload = () => {
      const x = ctx();
      if (!x) return;
      x.clearRect(0, 0, L, A);
      x.drawImage(img, 0, 0);
      guardar(marcas);
    };
    img.src = anterior;
  }

  const ponto = (e: EventoDePonteiro<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * L, y: ((e.clientY - r.top) / r.height) * A };
  };

  function traco(de: { x: number; y: number }, para: { x: number; y: number }) {
    const x = ctx();
    if (!x) return;
    x.globalCompositeOperation = ferramenta === "borracha" ? "destination-out" : "source-over";
    x.strokeStyle = cor;
    x.lineWidth = terreno === "estrada" && ferramenta === "pincel" ? Math.max(4, tamanho / 3) : tamanho;
    x.lineCap = "round";
    x.lineJoin = "round";
    x.beginPath();
    x.moveTo(de.x, de.y);
    x.lineTo(para.x, para.y);
    x.stroke();
    x.globalCompositeOperation = "source-over";
  }

  /** Enche a área de cor parecida no mapa de baixo (o mar inteiro, um continente). */
  function balde(px: number, py: number) {
    const b = base.current;
    const x = ctx();
    if (!b || !x) {
      setAviso("O mapa ainda está carregando. Tente de novo em um instante.");
      return;
    }
    const sx = Math.floor(px);
    const sy = Math.floor(py);
    const d = b.data;
    const i0 = (sy * L + sx) * 4;
    const [r0, g0, b0] = [d[i0], d[i0 + 1], d[i0 + 2]];
    const lim = tolerancia * tolerancia * 3;
    const visto = new Uint8Array(L * A);
    const camada = x.getImageData(0, 0, L, A);
    const [cr, cg, cb] = [1, 3, 5].map((k) => parseInt(cor.slice(k, k + 2), 16));
    const pilha = [sy * L + sx];
    let pintados = 0;
    while (pilha.length) {
      const p = pilha.pop()!;
      if (visto[p]) continue;
      visto[p] = 1;
      const j = p * 4;
      const dr = d[j] - r0;
      const dg = d[j + 1] - g0;
      const db = d[j + 2] - b0;
      if (dr * dr + dg * dg + db * db > lim) continue;
      camada.data[j] = cr;
      camada.data[j + 1] = cg;
      camada.data[j + 2] = cb;
      camada.data[j + 3] = 255;
      pintados++;
      const px2 = p % L;
      if (px2 > 0) pilha.push(p - 1);
      if (px2 < L - 1) pilha.push(p + 1);
      if (p >= L) pilha.push(p - L);
      if (p < L * (A - 1)) pilha.push(p + L);
    }
    x.putImageData(camada, 0, 0);
    setAviso(pintados > L * A * 0.6 ? "O balde pegou quase o mapa todo: diminua a tolerância e desfaça." : null);
  }

  function aoApertar(e: EventoDePonteiro<HTMLCanvasElement>) {
    const p = ponto(e);
    if (ferramenta === "marca") {
      const nova = { id: Math.random().toString(36).slice(2, 8), tipo: tipoDeMarca, x: p.x, y: p.y, nome: "" };
      const lista = [...marcas, nova];
      setMarcas(lista);
      setSelecionada(nova.id);
      guardar(lista);
      return;
    }
    lembrar();
    if (ferramenta === "balde") {
      balde(p.x, p.y);
      guardar(marcas);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    ultimo.current = p;
    traco(p, p);
  }

  function aoMover(e: EventoDePonteiro<HTMLCanvasElement>) {
    if (!ultimo.current) return;
    const p = ponto(e);
    traco(ultimo.current, p);
    ultimo.current = p;
  }

  function aoSoltar() {
    if (!ultimo.current) return;
    ultimo.current = null;
    guardar(marcas);
  }

  function mudarMarca(idDaMarca: string, m: Partial<Marca> | null) {
    const lista = m ? marcas.map((x) => (x.id === idDaMarca ? { ...x, ...m } : x)) : marcas.filter((x) => x.id !== idDaMarca);
    setMarcas(lista);
    if (!m) setSelecionada(null);
    guardar(lista);
  }

  function limparTudo() {
    lembrar();
    ctx()?.clearRect(0, 0, L, A);
    setMarcas([]);
    guardar([]);
  }

  // ---------- Saídas ----------

  function referencia(comMapa: boolean): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.width = L;
    c.height = A;
    const x = c.getContext("2d")!;
    x.fillStyle = "#ffffff";
    x.fillRect(0, 0, L, A);
    if (comMapa && base.current) x.putImageData(base.current, 0, 0);
    x.globalAlpha = comMapa ? 0.7 : 1;
    if (pintura.current) x.drawImage(pintura.current, 0, 0);
    x.globalAlpha = 1;
    x.fillStyle = "#111111";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = "bold 34px sans-serif";
    for (const m of marcas) x.fillText(MARCAS.find((k) => k.chave === m.tipo)?.simbolo ?? "●", m.x, m.y);
    return c;
  }

  function baixar(comMapa: boolean) {
    const a = document.createElement("a");
    a.download = comMapa ? "mitrael-referencia-com-mapa.png" : "mitrael-referencia.png";
    a.href = referencia(comMapa).toDataURL("image/png");
    a.click();
  }

  function baixarMarcas() {
    const a = document.createElement("a");
    a.download = "mitrael-marcas.json";
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ largura: L, altura: A, marcas }, null, 2)], { type: "application/json" }));
    a.click();
  }

  function prompt(): string {
    const usados = new Set<string>();
    const c = pintura.current?.getContext("2d");
    if (c) {
      const d = c.getImageData(0, 0, L, A).data;
      for (let i = 0; i < d.length; i += 4 * 97) {
        if (d[i + 3] < 128) continue;
        const hex = `#${[d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        const t = TERRENOS.find((k) => k.cor === hex);
        if (t) usados.add(t.chave);
      }
    }
    const legenda = TERRENOS.filter((t) => usados.has(t.chave)).map((t) => `- ${t.cor} = ${t.ingles}`);
    const tipos = MARCAS.filter((k) => marcas.some((m) => m.tipo === k.chave));
    const lista = marcas.map((m) => `- ${MARCAS.find((k) => k.chave === m.tipo)?.ingles ?? "a place"} in the ${onde(m.x, m.y)}`);
    return [
      "Create ONE image: a top-down hand-painted fantasy world map, in the style of a premium fantasy game atlas (painterly, rich textures, crisp linework, individual tree canopies, sculpted mountain ridges, winding rivers, soft parchment edges).",
      "The attached image is a COLOR GUIDE, not a style reference. Follow its shapes and positions exactly: every coastline, every colored area and every symbol must stay where it is. Paint each color as the terrain below; never show the flat colors themselves.",
      "",
      "Color key:",
      ...(legenda.length ? legenda : ["- (no painted areas yet)"]),
      ...(tipos.length
        ? ["", "Black symbols mark places to draw as small illustrated landmarks (not icons):", ...tipos.map((k) => `- ${k.simbolo} = ${k.ingles}`)]
        : []),
      ...(lista.length ? ["", "Places:", ...lista] : []),
      "",
      "Lighting: soft, even daylight from the top-left (northwest); no glow, no vignette, no dramatic shadows.",
      "ABSOLUTELY NO TEXT: no names, no labels, no banners, no compass text, no legend. The names are added later by the website.",
      `Same aspect ratio as the guide (${L} x ${A}, landscape).`,
    ].join("\n");
  }

  async function copiarPrompt() {
    try {
      await navigator.clipboard.writeText(prompt());
      setAviso("Prompt copiado. Anexe a referência (só as cores) e cole o prompt no ChatGPT.");
    } catch {
      setAviso("Não deu para copiar. Abra \"Ver o prompt\" e copie à mão.");
    }
  }

  const marcaSelecionada = marcas.find((m) => m.id === selecionada);
  const chip = (ligado: boolean) =>
    `font-titulo min-h-10 rounded-sm border px-3 text-sm font-semibold transition-colors ${
      ligado ? "bg-tinta-900 border-tinta-900 text-pergaminho-50" : "border-dourado-600/50 text-tinta-900 hover:bg-dourado-400/20"
    }`;

  return (
    <div className="space-y-4" style={{ colorScheme: "light" }}>
      {/* Ferramentas */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Ferramenta">
        {(
          [
            ["pincel", "✎ Pincel"],
            ["balde", "◍ Balde"],
            ["borracha", "⌫ Borracha"],
            ["marca", "⌖ Marcar lugar"],
          ] as const
        ).map(([f, rotulo]) => (
          <button key={f} type="button" aria-pressed={ferramenta === f} onClick={() => setFerramenta(f)} className={chip(ferramenta === f)}>
            {rotulo}
          </button>
        ))}
        <button type="button" disabled={!podeDesfazer} onClick={desfazer} className={`${BOTAO} min-h-10 px-3`}>
          ↶ Desfazer
        </button>
      </div>

      {ferramenta === "marca" ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tipo de lugar">
          {MARCAS.map((k) => (
            <button key={k.chave} type="button" aria-pressed={tipoDeMarca === k.chave} onClick={() => setTipoDeMarca(k.chave)} className={chip(tipoDeMarca === k.chave)}>
              {k.simbolo} {k.nome}
            </button>
          ))}
        </div>
      ) : ferramenta !== "borracha" ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Terreno">
          {TERRENOS.map((t) => (
            <button
              key={t.chave}
              type="button"
              aria-pressed={terreno === t.chave}
              onClick={() => setTerreno(t.chave)}
              className={`${chip(terreno === t.chave)} inline-flex items-center gap-1.5`}
            >
              <span className="border-tinta-900/30 inline-block size-4 rounded-sm border" style={{ background: t.cor }} aria-hidden />
              {t.nome}
            </button>
          ))}
        </div>
      ) : null}

      <div className="text-tinta-700 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {ferramenta === "pincel" || ferramenta === "borracha" ? (
          <label htmlFor={`${id}-tam`} className="flex items-center gap-2">
            Tamanho
            <input id={`${id}-tam`} type="range" min={4} max={120} value={tamanho} onChange={(e) => setTamanho(Number(e.target.value))} />
          </label>
        ) : null}
        {ferramenta === "balde" ? (
          <label htmlFor={`${id}-tol`} className="flex items-center gap-2">
            Tolerância
            <input id={`${id}-tol`} type="range" min={5} max={80} value={tolerancia} onChange={(e) => setTolerancia(Number(e.target.value))} />
          </label>
        ) : null}
        <label className="flex min-h-10 items-center gap-2">
          <input type="checkbox" checked={mostrarMapa} onChange={(e) => setMostrarMapa(e.target.checked)} className="accent-heraldico-vermelho size-4" />
          Mostrar o mapa de hoje
        </label>
        <label htmlFor={`${id}-op`} className="flex items-center gap-2">
          Pintura
          <input id={`${id}-op`} type="range" min={0.2} max={1} step={0.05} value={opacidade} onChange={(e) => setOpacidade(Number(e.target.value))} />
        </label>
      </div>

      <p className="text-tinta-500 text-xs">
        {ferramenta === "balde"
          ? "O balde enche a área de cor parecida no mapa de hoje: um clique no mar pinta o oceano, um clique num continente pinta a terra dele."
          : ferramenta === "marca"
            ? "Toque no mapa para pôr o lugar, e escreva o nome embaixo. O nome não vai para a imagem: o site escreve por cima."
            : "Pinte por cima do mapa. A estrada sai mais fina."}
      </p>

      {/* O mapa */}
      <div className="border-dourado-600/40 relative overflow-hidden rounded-sm border bg-white" style={{ aspectRatio: `${L} / ${A}` }}>
        {mostrarMapa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/images/map.jpg" alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full select-none" />
        ) : null}
        <canvas
          ref={pintura}
          width={L}
          height={A}
          aria-label="Área de pintura do mapa"
          onPointerDown={aoApertar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          className="absolute inset-0 size-full touch-none"
          style={{ opacity: opacidade, cursor: ferramenta === "marca" ? "copy" : "crosshair" }}
        />
        <svg viewBox={`0 0 ${L} ${A}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          {marcas.map((m) => (
            <g key={m.id}>
              <text x={m.x} y={m.y} textAnchor="middle" dominantBaseline="middle" fontSize={38} fontWeight="bold" fill={m.id === selecionada ? "#8b1a1a" : "#111"}>
                {MARCAS.find((k) => k.chave === m.tipo)?.simbolo}
              </text>
              {m.nome ? (
                <text x={m.x} y={m.y + 36} textAnchor="middle" fontSize={26} fill="#111" stroke="#fff" strokeWidth={6} paintOrder="stroke">
                  {m.nome}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      {aviso ? (
        <p role="status" className="text-tinta-700 text-sm">
          {aviso}
        </p>
      ) : null}

      {/* Os lugares marcados */}
      {marcas.length ? (
        <section>
          <h2 className="font-titulo text-tinta-900 text-lg font-bold">Lugares marcados</h2>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {marcas.map((m) => (
              <li key={m.id} className={`flex items-center gap-2 rounded-sm border p-1.5 ${m.id === selecionada ? "border-heraldico-vermelho" : "border-dourado-600/30"}`}>
                <span aria-hidden className="w-6 text-center font-bold">
                  {MARCAS.find((k) => k.chave === m.tipo)?.simbolo}
                </span>
                <input
                  value={m.nome}
                  maxLength={60}
                  onFocus={() => setSelecionada(m.id)}
                  onChange={(e) => mudarMarca(m.id, { nome: e.target.value })}
                  placeholder={`${MARCAS.find((k) => k.chave === m.tipo)?.nome ?? "Lugar"} sem nome`}
                  aria-label="Nome do lugar"
                  className={`${CAMPO} min-h-10`}
                />
                <button type="button" onClick={() => mudarMarca(m.id, null)} aria-label={`Tirar ${m.nome || "este lugar"}`} className="text-tinta-500 hover:text-heraldico-vermelho min-h-10 min-w-10 text-lg">
                  ×
                </button>
              </li>
            ))}
          </ul>
          {marcaSelecionada ? <p className="text-tinta-500 mt-1 text-xs">O lugar escolhido aparece em vermelho no mapa.</p> : null}
        </section>
      ) : null}

      {/* Saídas */}
      <section className="border-dourado-600/30 space-y-2 border-t pt-4">
        <h2 className="font-titulo text-tinta-900 text-lg font-bold">Levar para a IA</h2>
        <ol className="text-tinta-700 list-decimal space-y-1 pl-5 text-sm">
          <li>Baixe a referência (só as cores).</li>
          <li>Copie o prompt, anexe a referência no ChatGPT e cole o prompt.</li>
          <li>Mande a imagem que voltar para o Claude, junto com as marcas: ele troca o mapa do site e põe os nomes.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => baixar(false)} className={BOTAO_CHEIO}>
            Baixar a referência
          </button>
          <button type="button" onClick={() => void copiarPrompt()} className={BOTAO_CHEIO}>
            Copiar o prompt
          </button>
          <button type="button" onClick={() => baixar(true)} className={BOTAO}>
            Referência com o mapa por baixo
          </button>
          <button type="button" disabled={!marcas.length} onClick={baixarMarcas} className={BOTAO}>
            Baixar as marcas
          </button>
        </div>
        <details onToggle={(e) => setTextoDoPrompt((e.currentTarget as HTMLDetailsElement).open ? prompt() : null)}>
          <summary className="text-tinta-700 min-h-9 cursor-pointer text-sm">Ver o prompt</summary>
          {textoDoPrompt ? (
            <pre className="text-tinta-900 bg-pergaminho-50 border-dourado-600/30 mt-2 max-h-72 overflow-auto rounded-sm border p-3 text-xs whitespace-pre-wrap">{textoDoPrompt}</pre>
          ) : null}
        </details>
        <button type="button" onClick={limparTudo} className="text-tinta-500 hover:text-heraldico-vermelho mt-2 min-h-9 text-xs underline">
          Começar do zero (dá para desfazer a pintura)
        </button>
      </section>
    </div>
  );
}
