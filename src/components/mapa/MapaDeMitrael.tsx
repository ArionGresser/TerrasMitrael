"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MAPA } from "@/lib/marcadores";
import { LARGURA_BASE, ALTURA_BASE } from "@/lib/regioes-do-mapa";
import { tocar } from "@/lib/som";
import { Ornamento } from "@/components/ui/Titulo";

/**
 * O mapa de Mitrael como um mundo para percorrer, no espírito do mapa do
 * universo de League of Legends: o continente ocupa a tela, arrasta com
 * inércia, aproxima na roda do mouse, na pinça ou no duplo clique. Cada
 * região acende sob o mouse e abre o seu painel; cada lugar marcado abre o
 * dele, com a câmera voando até lá.
 *
 * A câmera é só um deslocamento (x, y) e uma escala sobre a imagem em
 * tamanho natural. As regiões são um SVG na mesma camada da imagem, com o
 * contorno tirado do próprio desenho (scripts/mapa/gerar-regioes.py). Os
 * marcadores ficam numa camada à parte, que não escala: continuam do mesmo
 * tamanho e nítidos em qualquer zoom.
 *
 * O painel de cada lugar traz a história inteira dele, em capítulos que
 * se desenrolam ali mesmo: o mapa é a única porta para os locais.
 *
 * Tudo funciona também no teclado (setas, + e −, 0 e Esc, e a lista
 * "Explorar"), e quem pediu menos movimento recebe trocas diretas, sem voo
 * nem inércia.
 */

export type LocalNoMapa = {
  slug: string;
  nome: string;
  subtitulo: string;
  resumo: string;
  /** A frase de convite que abre a história. */
  chamada: string;
  /** A história inteira, já montada em capítulos pela página do mapa. */
  historia: ReactNode;
  imagem: string;
  imagemAlt: string;
  x: number;
  y: number;
  lado?: "esquerda" | "direita";
};

export type RegiaoNoMapa = {
  chave: string;
  nome: string;
  subtitulo: string;
  fatos: string[];
  locais: string[];
  /** O contorno, em pixels da imagem base (LARGURA_BASE x ALTURA_BASE). */
  d: string;
  centro: [number, number];
  caixa: [number, number, number, number];
};

type Camera = { x: number; y: number; s: number };
type Aberto = { tipo: "local" | "regiao"; chave: string } | null;

/**
 * A largura do painel no computador, em pixels: larga o bastante para ler a
 * história de um lugar sem cansar, sem nunca passar da metade do mapa.
 */
const PAINEL = 460;
const larguraDoPainel = (w: number) => Math.min(PAINEL, Math.round(w * 0.5));
/** Quanto o mapa aproxima além do encaixe inicial, no máximo. */
const ZOOM_MAXIMO = 3.2;
/** Abaixo disto, soltar o dedo é um clique, não um arrasto. */
const TOLERANCIA_DO_CLIQUE = 6;

export function MapaDeMitrael({
  locais,
  regioes,
}: {
  locais: LocalNoMapa[];
  regioes: RegiaoNoMapa[];
}) {
  const palco = useRef<HTMLDivElement>(null);
  const [tela, setTela] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState<Camera | null>(null);
  const camRef = useRef<Camera | null>(null);
  const telaRef = useRef({ w: 0, h: 0 });
  /**
   * A folga além da borda do mapa. Com o painel aberto, a câmera pode ir
   * além do fim do desenho na largura (ou altura) dele: assim um lugar na
   * beira do mapa ainda consegue parar no meio do pedaço visível.
   */
  const folga = useRef({ direita: 0, baixo: 0 });
  const [aberto, setAberto] = useState<Aberto>(null);
  const [sobre, setSobre] = useState<string | null>(null);
  const [lista, setLista] = useState(false);
  const [mexeu, setMexeu] = useState(false);
  const reduzido = useReducedMotion();
  const quadro = useRef<number | null>(null);
  const garantia = useRef<number | null>(null);
  const ponteiros = useRef(new Map<number, { x: number; y: number }>());
  const rastro = useRef<{ t: number; x: number; y: number }[]>([]);
  const toque = useRef<{ andou: number; regiao: string | null }>({ andou: 0, regiao: null });

  const W = MAPA.largura;
  const H = MAPA.altura;
  /** De pixel da imagem base (onde estão os contornos) para pixel do mapa. */
  const fb = W / LARGURA_BASE;

  // ---------- Limites da câmera ----------

  /** A menor escala cobre a tela inteira: nunca sobra borda vazia. */
  const escalaMinima = useCallback(
    () => Math.max(telaRef.current.w / W, telaRef.current.h / H),
    [W, H],
  );

  const limitar = useCallback(
    (c: Camera): Camera => {
      const { w, h } = telaRef.current;
      const min = escalaMinima();
      const s = Math.min(Math.max(c.s, min), min * ZOOM_MAXIMO);
      return {
        s,
        x: Math.min(0, Math.max(w - W * s - folga.current.direita, c.x)),
        y: Math.min(0, Math.max(h - H * s - folga.current.baixo, c.y)),
      };
    },
    [W, H, escalaMinima],
  );

  const aplicar = useCallback(
    (c: Camera) => {
      const k = limitar(c);
      camRef.current = k;
      setCam(k);
    },
    [limitar],
  );

  const parar = () => {
    if (quadro.current !== null) cancelAnimationFrame(quadro.current);
    if (garantia.current !== null) clearTimeout(garantia.current);
    quadro.current = null;
    garantia.current = null;
  };

  /** Leva a câmera até o destino num voo suave (ou direto, sem movimento). */
  const voar = useCallback(
    (destino: Camera, duracao = 900) => {
      parar();
      const fim = limitar(destino);
      const inicio = camRef.current;
      if (!inicio || reduzido) {
        aplicar(fim);
        return;
      }
      const t0 = performance.now();
      const passo = (agora: number) => {
        const t = Math.min(1, (agora - t0) / duracao);
        // Acelera e freia, como quem desliza o mapa com a mão
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        // A escala anda em proporção, não em linha reta: o zoom fica uniforme
        const s = inicio.s * Math.pow(fim.s / inicio.s, e);
        aplicar({
          s,
          x: inicio.x + (fim.x - inicio.x) * e,
          y: inicio.y + (fim.y - inicio.y) * e,
        });
        quadro.current = t < 1 ? requestAnimationFrame(passo) : null;
      };
      quadro.current = requestAnimationFrame(passo);
      // Com a aba escondida, o navegador congela a animação no meio. Passado
      // o tempo do voo, a câmera chega ao destino de qualquer jeito.
      garantia.current = window.setTimeout(() => {
        if (quadro.current !== null) cancelAnimationFrame(quadro.current);
        quadro.current = null;
        garantia.current = null;
        aplicar(fim);
      }, duracao + 120);
    },
    [aplicar, limitar, reduzido],
  );

  /** O mapa inteiro, centralizado. */
  const verTudo = useCallback(() => {
    const { w, h } = telaRef.current;
    const s = escalaMinima();
    voar({ s, x: (w - W * s) / 2, y: (h - H * s) / 2 }, 700);
  }, [W, H, escalaMinima, voar]);

  /** Aproxima (ou afasta) mantendo parado o ponto debaixo do cursor. */
  const zoomEm = useCallback(
    (px: number, py: number, fator: number, animado = false) => {
      const c = camRef.current;
      if (!c) return;
      const min = escalaMinima();
      const s = Math.min(Math.max(c.s * fator, min), min * ZOOM_MAXIMO);
      const k = s / c.s;
      const destino = { s, x: px - (px - c.x) * k, y: py - (py - c.y) * k };
      if (animado) voar(destino, 450);
      else aplicar(destino);
    },
    [aplicar, escalaMinima, voar],
  );

  /**
   * O pedaço do palco que o painel deixa livre: à esquerda dele no
   * computador, acima dele no celular. É ali que o lugar escolhido para.
   */
  /** Abre a folga do painel, que vai aparecer à direita ou embaixo. */
  const abrirFolga = useCallback(() => {
    const { w, h } = telaRef.current;
    folga.current = w >= 768 ? { direita: larguraDoPainel(w), baixo: 0 } : { direita: 0, baixo: h * 0.62 };
  }, []);

  const areaLivre = useCallback(() => {
    const { w, h } = telaRef.current;
    return w >= 768
      ? { cx: (w - larguraDoPainel(w)) / 2, cy: h / 2, lw: w - larguraDoPainel(w), lh: h }
      : { cx: w / 2, cy: h * 0.28, lw: w, lh: h * 0.5 };
  }, []);

  // ---------- O tamanho do palco ----------

  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const medir = (w: number, h: number) => {
      if (!w || !h) return;
      telaRef.current = { w, h };
      setTela({ w, h });
      if (!camRef.current) {
        const s = Math.max(w / W, h / H);
        aplicar({ s, x: (w - W * s) / 2, y: (h - H * s) / 2 });
      } else {
        aplicar(camRef.current);
      }
    };
    // Mede já na montagem, sem esperar o primeiro aviso de tamanho, que
    // demora um quadro (e nem chega com a aba escondida)
    medir(el.clientWidth, el.clientHeight);
    const observar = new ResizeObserver(([entrada]) =>
      medir(entrada.contentRect.width, entrada.contentRect.height),
    );
    observar.observe(el);
    return () => observar.disconnect();
  }, [W, H, aplicar]);

  // ---------- Roda do mouse ----------
  // Precisa de um ouvinte "não passivo" para impedir que a página role
  // enquanto o cursor está sobre o mapa.

  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const roda = (e: WheelEvent) => {
      // Sobre o painel ou a lista, a roda rola o texto, como em qualquer página
      if ((e.target as HTMLElement).closest("aside, [data-lista]")) return;
      // Com o mapa todo afastado, rolar para baixo desce a página até o
      // rodapé, em vez de tentar afastar mais o que já não afasta
      const c = camRef.current;
      if (e.deltaY > 0 && c && c.s <= escalaMinima() * 1.001) return;
      e.preventDefault();
      parar();
      const r = el.getBoundingClientRect();
      const fator = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018));
      zoomEm(e.clientX - r.left, e.clientY - r.top, fator);
      setMexeu(true);
    };
    el.addEventListener("wheel", roda, { passive: false });
    return () => el.removeEventListener("wheel", roda);
  }, [zoomEm, escalaMinima]);

  // ---------- Abrir um lugar ou uma região ----------

  const abrirLocal = useCallback(
    (slug: string) => {
      const local = locais.find((l) => l.slug === slug);
      if (!local) return;
      tocar("marcador");
      abrirFolga();
      setAberto({ tipo: "local", chave: slug });
      setLista(false);
      const min = escalaMinima();
      const s = Math.max(camRef.current?.s ?? min, min * 2.2);
      const { cx, cy } = areaLivre();
      voar({ s, x: cx - (local.x / 100) * W * s, y: cy - (local.y / 100) * H * s });
    },
    [locais, escalaMinima, areaLivre, abrirFolga, voar, W, H],
  );

  const abrirRegiao = useCallback(
    (chave: string) => {
      const r = regioes.find((g) => g.chave === chave);
      if (!r) return;
      tocar("marcador");
      abrirFolga();
      setAberto({ tipo: "regiao", chave });
      setLista(false);
      // Enquadra a região inteira no pedaço livre, com uma folga em volta
      const [x, y, w, h] = r.caixa.map((n) => n * fb);
      const { cx, cy, lw, lh } = areaLivre();
      const s = Math.min(lw / w, lh / h) * 0.82;
      voar({ s, x: cx - (x + w / 2) * s, y: cy - (y + h / 2) * s });
    },
    [regioes, fb, areaLivre, abrirFolga, voar],
  );

  const fechar = useCallback(() => {
    if (!aberto) return;
    tocar("fecharMenu");
    setAberto(null);
    // Sem painel, a folga some e a câmera desliza de volta para dentro do mapa
    folga.current = { direita: 0, baixo: 0 };
    if (camRef.current) voar(camRef.current, 500);
  }, [aberto, voar]);

  // ---------- O endereço acompanha o que está aberto ----------
  // /mapa/?regiao=askar ou /mapa/?local=razavar abre direto ali, para dar
  // para mandar o link de um lugar no grupo.

  const jaLeuEndereco = useRef(false);
  useEffect(() => {
    if (jaLeuEndereco.current || !cam) return;
    jaLeuEndereco.current = true;
    const p = new URLSearchParams(window.location.search);
    const r = p.get("regiao");
    const l = p.get("local");
    if (r) abrirRegiao(r);
    else if (l) abrirLocal(l);
  }, [cam, abrirRegiao, abrirLocal]);

  useEffect(() => {
    if (!jaLeuEndereco.current) return;
    const p = new URLSearchParams();
    if (aberto) p.set(aberto.tipo, aberto.chave);
    const consulta = p.toString();
    window.history.replaceState(null, "", consulta ? `?${consulta}` : window.location.pathname);
  }, [aberto]);

  // ---------- Arrastar e pinçar ----------

  function aoPressionar(e: React.PointerEvent<HTMLDivElement>) {
    // Botões e links do mapa recebem o clique normalmente
    if ((e.target as Element).closest("button, a, aside, [data-lista]")) return;
    parar();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ponteiro que o navegador já soltou: o arrasto segue sem captura
    }
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    rastro.current = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    const regiao = (e.target as Element).closest("[data-regiao]");
    toque.current = { andou: 0, regiao: regiao?.getAttribute("data-regiao") ?? null };
    setLista(false);
  }

  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    const anterior = ponteiros.current.get(e.pointerId);
    const c = camRef.current;

    // Sem botão apertado: só acompanha a região debaixo do mouse
    if (!anterior) {
      if (e.pointerType === "mouse") {
        const r = (e.target as Element).closest("[data-regiao]");
        setSobre(r?.getAttribute("data-regiao") ?? null);
      }
      return;
    }
    if (!c) return;

    if (ponteiros.current.size === 1) {
      const dx = e.clientX - anterior.x;
      const dy = e.clientY - anterior.y;
      toque.current.andou += Math.abs(dx) + Math.abs(dy);
      if (toque.current.andou < TOLERANCIA_DO_CLIQUE) return;
      aplicar({ ...c, x: c.x + dx, y: c.y + dy });
      ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      rastro.current.push({ t: performance.now(), x: e.clientX, y: e.clientY });
      if (rastro.current.length > 6) rastro.current.shift();
      setMexeu(true);
      return;
    }

    // Dois dedos: a distância entre eles vira zoom, o meio deles vira arrasto
    toque.current.andou = TOLERANCIA_DO_CLIQUE;
    const [a, b] = [...ponteiros.current.entries()];
    const outro = a[0] === e.pointerId ? b[1] : a[1];
    const r = e.currentTarget.getBoundingClientRect();
    const antes = Math.hypot(anterior.x - outro.x, anterior.y - outro.y);
    const depois = Math.hypot(e.clientX - outro.x, e.clientY - outro.y);
    const meioAntes = { x: (anterior.x + outro.x) / 2 - r.left, y: (anterior.y + outro.y) / 2 - r.top };
    const meioDepois = { x: (e.clientX + outro.x) / 2 - r.left, y: (e.clientY + outro.y) / 2 - r.top };
    const min = escalaMinima();
    const s = Math.min(Math.max(c.s * (depois / Math.max(antes, 1)), min), min * ZOOM_MAXIMO);
    const k = s / c.s;
    aplicar({
      s,
      x: meioDepois.x - (meioAntes.x - c.x) * k,
      y: meioDepois.y - (meioAntes.y - c.y) * k,
    });
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setMexeu(true);
  }

  function aoSoltar(e: React.PointerEvent<HTMLDivElement>) {
    if (!ponteiros.current.has(e.pointerId)) return;
    const eraUmDedo = ponteiros.current.size === 1;
    ponteiros.current.delete(e.pointerId);
    if (!eraUmDedo) return;

    // Quase não andou: foi um clique. Na região, abre; no mar, fecha.
    if (toque.current.andou < TOLERANCIA_DO_CLIQUE) {
      if (toque.current.regiao) abrirRegiao(toque.current.regiao);
      else fechar();
      return;
    }
    if (reduzido) return;

    // Inércia: o mapa continua deslizando na velocidade em que foi solto
    const pontos = rastro.current.filter((p) => performance.now() - p.t < 120);
    if (pontos.length < 2) return;
    const p0 = pontos[0];
    const p1 = pontos[pontos.length - 1];
    const dt = Math.max(p1.t - p0.t, 1);
    let vx = ((p1.x - p0.x) / dt) * 16;
    let vy = ((p1.y - p0.y) / dt) * 16;
    const deslizar = () => {
      const c = camRef.current;
      if (!c || (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3)) {
        quadro.current = null;
        return;
      }
      aplicar({ ...c, x: c.x + vx, y: c.y + vy });
      vx *= 0.92;
      vy *= 0.92;
      quadro.current = requestAnimationFrame(deslizar);
    };
    quadro.current = requestAnimationFrame(deslizar);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLDivElement>) {
    const c = camRef.current;
    if (!c) return;
    const { w, h } = telaRef.current;
    const passo = 120;
    const acoes: Record<string, () => void> = {
      ArrowLeft: () => voar({ ...c, x: c.x + passo }, 250),
      ArrowRight: () => voar({ ...c, x: c.x - passo }, 250),
      ArrowUp: () => voar({ ...c, y: c.y + passo }, 250),
      ArrowDown: () => voar({ ...c, y: c.y - passo }, 250),
      "+": () => zoomEm(w / 2, h / 2, 1.5, true),
      "=": () => zoomEm(w / 2, h / 2, 1.5, true),
      "-": () => zoomEm(w / 2, h / 2, 1 / 1.5, true),
      "0": () => verTudo(),
      Escape: () => {
        fechar();
        setLista(false);
      },
    };
    // As setas só andam com o foco no próprio mapa, não num botão dele
    if (e.target !== e.currentTarget && e.key.startsWith("Arrow")) return;
    const acao = acoes[e.key];
    if (acao) {
      e.preventDefault();
      acao();
      setMexeu(true);
    }
  }

  const local = aberto?.tipo === "local" ? locais.find((l) => l.slug === aberto.chave) : undefined;
  const regiao = aberto?.tipo === "regiao" ? regioes.find((r) => r.chave === aberto.chave) : undefined;
  const largo = tela.w >= 768;
  const destacada = regiao?.chave ?? sobre;

  return (
    <div
      ref={palco}
      role="region"
      aria-label="Mapa interativo de Mitrael. Use as setas para percorrer, mais e menos para aproximar, e a lista Explorar para abrir cada região e lugar."
      tabIndex={0}
      onKeyDown={aoTeclar}
      onPointerDown={aoPressionar}
      onPointerMove={aoMover}
      onPointerUp={aoSoltar}
      onPointerCancel={aoSoltar}
      onPointerLeave={() => setSobre(null)}
      onDoubleClick={(e) => {
        if ((e.target as Element).closest("button, a, aside, [data-lista]")) return;
        const r = e.currentTarget.getBoundingClientRect();
        zoomEm(e.clientX - r.left, e.clientY - r.top, 1.8, true);
        setMexeu(true);
      }}
      className={`bg-madeira-950 focus-visible:outline-dourado-400 relative h-[calc(100dvh-6rem)] min-h-[420px] w-full touch-none overflow-hidden border-y border-black/60 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.9)] select-none sm:h-[calc(100dvh-4.5rem)] ${
        sobre ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {/* O continente, com as regiões desenhadas por cima */}
      {cam ? (
        <div
          className="absolute top-0 left-0 origin-top-left will-change-transform"
          style={{
            width: W,
            height: H,
            transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAPA.src}
            alt={MAPA.alt}
            width={W}
            height={H}
            draggable={false}
            fetchPriority="high"
            decoding="async"
            className="block size-full"
          />
          <svg
            viewBox={`0 0 ${LARGURA_BASE} ${ALTURA_BASE}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            aria-hidden
          >
            <defs>
              <filter id="brilho-da-regiao" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            {regioes.map((r) => {
              const acesa = destacada === r.chave;
              return (
                <g key={r.chave}>
                  {acesa ? (
                    // O halo dourado em volta da costa, desfocado
                    <path
                      d={r.d}
                      fill="none"
                      stroke="#f3dc9a"
                      strokeOpacity={regiao?.chave === r.chave ? 0.9 : 0.6}
                      strokeWidth={5 / fb}
                      filter="url(#brilho-da-regiao)"
                      pointerEvents="none"
                    />
                  ) : null}
                  <path
                    data-regiao={r.chave}
                    d={r.d}
                    fillRule="evenodd"
                    pointerEvents="all"
                    fill={acesa ? "rgba(255, 222, 150, 0.13)" : "rgba(0, 0, 0, 0)"}
                    stroke={acesa ? "#f3dc9a" : "none"}
                    strokeWidth={1.6}
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "fill 250ms ease" }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      ) : null}

      {/* A vinheta: as bordas do mapa afundam no escuro, como papel velho */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,6,3,0.6)_100%)]"
      />

      {/* O nome da região debaixo do mouse, pousado no meio dela */}
      {cam && sobre && sobre !== regiao?.chave
        ? (() => {
            const r = regioes.find((g) => g.chave === sobre);
            if (!r) return null;
            return (
              <div
                aria-hidden
                className="border-dourado-600/60 bg-madeira-950/80 pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-sm border px-3.5 py-1.5 text-center shadow-[0_4px_14px_rgba(0,0,0,0.6)]"
                style={{
                  left: cam.x + r.centro[0] * fb * cam.s,
                  top: cam.y + r.centro[1] * fb * cam.s,
                }}
              >
                <p className="font-brasao text-pergaminho-50 text-lg leading-none whitespace-nowrap">
                  {r.nome}
                </p>
                <p className="font-titulo text-dourado-300 mt-1 text-[0.55rem] tracking-[0.2em] whitespace-nowrap uppercase">
                  {r.subtitulo}
                </p>
              </div>
            );
          })()
        : null}

      {/* Os lugares marcados */}
      {cam
        ? locais.map((l) => {
            const sx = cam.x + (l.x / 100) * W * cam.s;
            const sy = cam.y + (l.y / 100) * H * cam.s;
            if (sx < -120 || sy < -60 || sx > tela.w + 120 || sy > tela.h + 60) return null;
            const ativo = local?.slug === l.slug;
            return (
              <button
                key={l.slug}
                type="button"
                onClick={() => (ativo ? fechar() : abrirLocal(l.slug))}
                aria-label={`${l.nome}: abrir a história do lugar`}
                aria-pressed={ativo}
                className="group absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                style={{ left: sx, top: sy }}
              >
                {!ativo && !reduzido ? (
                  <span
                    aria-hidden
                    className="bg-dourado-300/40 absolute size-5 animate-ping rounded-full"
                    style={{ animationDuration: "2.6s" }}
                  />
                ) : null}
                <span
                  aria-hidden
                  className={`relative block rotate-45 border shadow-[0_2px_6px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-125 ${
                    ativo
                      ? "border-pergaminho-50 bg-heraldico-vermelho size-4 scale-125"
                      : "border-madeira-950 size-3.5 bg-[linear-gradient(135deg,#f3dc9a,#b8912c_55%,#7a5a14)]"
                  }`}
                />
                {/* O nome: sempre à vista num mapa sem nomes pintados; neste,
                    que já os traz, só ao passar o mouse ou com o lugar aberto */}
                <span
                  aria-hidden
                  className={`font-titulo pointer-events-none absolute top-full mt-0.5 rounded-sm px-1.5 py-0.5 text-[0.62rem] font-bold tracking-[0.16em] whitespace-nowrap uppercase transition-opacity [text-shadow:0_1px_2px_#000,0_0_10px_rgba(0,0,0,0.9)] sm:text-[0.72rem] ${
                    l.lado === "esquerda" ? "right-0" : "left-1/2 -translate-x-1/2"
                  } ${ativo ? "text-dourado-200" : "text-pergaminho-50"} ${
                    MAPA.rotulos || ativo
                      ? "opacity-100"
                      : "bg-madeira-950/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  {l.nome}
                </span>
              </button>
            );
          })
        : null}

      {/* O título e o crédito, no alto à esquerda */}
      <div className="pointer-events-none absolute top-7 left-4 max-w-[60%] sm:top-9 sm:left-6">
        <p className="font-titulo text-dourado-300 text-[0.58rem] tracking-[0.3em] uppercase [text-shadow:0_1px_3px_#000]">
          O continente inteiro
        </p>
        <h1 className="font-brasao text-pergaminho-50 mt-0.5 text-2xl leading-none [text-shadow:0_2px_6px_#000] sm:text-4xl">
          Mapa de Mitrael
        </h1>
        <p className="text-pergaminho-300/80 mt-1.5 text-[0.62rem] [text-shadow:0_1px_3px_#000]">
          Mapa por {MAPA.credito}
        </p>
      </div>

      {/* À direita: a lista para explorar e os controles de zoom */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 sm:top-4 sm:right-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLista((v) => !v)}
            aria-expanded={lista}
            className="placa-comunidade font-titulo text-pergaminho-100 hover:text-dourado-200 flex min-h-11 items-center gap-2 rounded-sm px-3.5 text-[0.68rem] tracking-[0.16em] uppercase transition-colors"
          >
            Explorar
            <span aria-hidden className={`text-[0.6rem] transition-transform ${lista ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          <AnimatePresence>
            {lista ? (
              <motion.div
                data-lista
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduzido ? 0 : 0.18 }}
                className="textura-pergaminho borda-envelhecida folha-alta absolute right-0 z-20 mt-2 max-h-[min(70vh,34rem)] w-64 overflow-y-auto rounded-sm py-2"
              >
                {[
                  {
                    titulo: "Regiões",
                    itens: regioes.map((r) => ({ chave: r.chave, nome: r.nome, sub: r.subtitulo, abrir: () => abrirRegiao(r.chave) })),
                  },
                  {
                    titulo: "Locais",
                    itens: locais.map((l) => ({ chave: l.slug, nome: l.nome, sub: l.subtitulo, abrir: () => abrirLocal(l.slug) })),
                  },
                ].map((grupo) => (
                  <div key={grupo.titulo}>
                    <p className="font-titulo text-tinta-500 px-4 pt-2 pb-1 text-[0.58rem] tracking-[0.25em] uppercase">
                      {grupo.titulo}
                    </p>
                    <ul>
                      {grupo.itens.map((item) => (
                        <li key={item.chave}>
                          <button
                            type="button"
                            onClick={item.abrir}
                            className="hover:bg-dourado-400/20 flex min-h-11 w-full flex-col justify-center px-4 py-1.5 text-left transition-colors"
                          >
                            <span className="font-titulo text-tinta-900 text-sm font-semibold">{item.nome}</span>
                            <span className="text-tinta-500 text-xs italic">{item.sub}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {[
          { rotulo: "Aproximar o mapa", texto: "+", acao: () => zoomEm(tela.w / 2, tela.h / 2, 1.5, true) },
          { rotulo: "Afastar o mapa", texto: "−", acao: () => zoomEm(tela.w / 2, tela.h / 2, 1 / 1.5, true) },
          { rotulo: "Ver o mapa inteiro", texto: "⤢", acao: () => verTudo() },
        ].map((b) => (
          <button
            key={b.rotulo}
            type="button"
            onClick={() => {
              b.acao();
              setMexeu(true);
            }}
            aria-label={b.rotulo}
            title={b.rotulo}
            className={`placa-comunidade text-pergaminho-100 hover:text-dourado-200 grid size-11 place-items-center rounded-sm text-lg leading-none transition-[colors,opacity] ${
              aberto && largo ? "pointer-events-none opacity-0" : ""
            }`}
          >
            {b.texto}
          </button>
        ))}
      </div>

      {/* A dica de uso, que some quando a pessoa começa a mexer */}
      <p
        aria-hidden
        className={`text-pergaminho-200 pointer-events-none absolute bottom-3 left-3 max-w-[80%] text-xs [text-shadow:0_1px_3px_#000] transition-opacity duration-500 ${
          mexeu || aberto ? "opacity-0" : "opacity-100"
        }`}
      >
        Arraste para explorar · role ou belisque para aproximar · clique numa região ou num lugar
      </p>

      {/* O painel do que foi escolhido: à direita no computador, por baixo no celular */}
      <AnimatePresence>
        {local || regiao ? (
          <motion.aside
            key={aberto?.chave}
            aria-label={local?.nome ?? regiao?.nome}
            initial={{ opacity: 0, x: largo ? 40 : 0, y: largo ? 0 : 40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: largo ? 40 : 0, y: largo ? 0 : 40 }}
            transition={{ duration: reduzido ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={largo ? { width: larguraDoPainel(tela.w) } : undefined}
            className="textura-pergaminho borda-envelhecida folha-alta text-tinta-900 absolute inset-x-0 bottom-0 z-30 max-h-[62%] cursor-auto overflow-y-auto overscroll-contain rounded-t-sm md:inset-x-auto md:top-0 md:right-0 md:max-h-none md:rounded-none"
          >
            {local ? (
              <PainelDoLocal
                local={local}
                vizinhos={locais}
                abrir={abrirLocal}
                fechar={fechar}
              />
            ) : regiao ? (
              <PainelDaRegiao
                regiao={regiao}
                regioes={regioes}
                locais={locais}
                abrirRegiao={abrirRegiao}
                abrirLocal={abrirLocal}
                fechar={fechar}
              />
            ) : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function BotaoFechar({ fechar }: { fechar: () => void }) {
  return (
    <button
      type="button"
      onClick={fechar}
      aria-label="Fechar o painel"
      className="placa-comunidade text-pergaminho-100 absolute top-2 right-2 grid size-10 place-items-center rounded-sm text-lg"
    >
      ×
    </button>
  );
}

/** As setas para o anterior e o próximo, como as páginas de um atlas. */
function Vizinhos({
  anterior,
  proximo,
}: {
  anterior: { nome: string; abrir: () => void };
  proximo: { nome: string; abrir: () => void };
}) {
  return (
    <div className="border-dourado-600/30 mt-6 flex items-center justify-between gap-2 border-t border-dashed pt-3 text-xs">
      <button
        type="button"
        onClick={anterior.abrir}
        className="text-tinta-700 hover:text-heraldico-vermelho min-h-11 text-left transition-colors"
      >
        ‹ {anterior.nome}
      </button>
      <button
        type="button"
        onClick={proximo.abrir}
        className="text-tinta-700 hover:text-heraldico-vermelho min-h-11 text-right transition-colors"
      >
        {proximo.nome} ›
      </button>
    </div>
  );
}

function PainelDoLocal({
  local,
  vizinhos,
  abrir,
  fechar,
}: {
  local: LocalNoMapa;
  vizinhos: LocalNoMapa[];
  abrir: (slug: string) => void;
  fechar: () => void;
}) {
  const i = vizinhos.indexOf(local);
  const ao = (d: number) => vizinhos[(i + d + vizinhos.length) % vizinhos.length];

  return (
    <>
      <div className="relative aspect-[21/9] w-full md:aspect-[16/9]">
        <Image
          src={local.imagem}
          alt={local.imagemAlt}
          fill
          sizes="(max-width: 768px) 100vw, 460px"
          className="object-cover sepia-[0.12]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <BotaoFechar fechar={fechar} />
      </div>

      <div className="px-5 pt-4 pb-5 sm:px-6">
        <p className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.25em] uppercase">
          {local.subtitulo}
        </p>
        <h2 className="font-brasao text-tinta-900 mt-1 text-3xl leading-tight">{local.nome}</h2>
        <p className="text-tinta-700 mt-3 text-sm leading-relaxed italic">{local.chamada}</p>

        <Ornamento className="mt-5" />

        {/* A história inteira, com cada capítulo enrolado até ser aberto */}
        <div className="mt-4 [&_h2]:text-2xl">{local.historia}</div>

        {vizinhos.length > 1 ? (
          <Vizinhos
            anterior={{ nome: ao(-1).nome, abrir: () => abrir(ao(-1).slug) }}
            proximo={{ nome: ao(1).nome, abrir: () => abrir(ao(1).slug) }}
          />
        ) : null}
      </div>
    </>
  );
}

function PainelDaRegiao({
  regiao,
  regioes,
  locais,
  abrirRegiao,
  abrirLocal,
  fechar,
}: {
  regiao: RegiaoNoMapa;
  regioes: RegiaoNoMapa[];
  locais: LocalNoMapa[];
  abrirRegiao: (chave: string) => void;
  abrirLocal: (slug: string) => void;
  fechar: () => void;
}) {
  const i = regioes.indexOf(regiao);
  const ao = (d: number) => regioes[(i + d + regioes.length) % regioes.length];
  const [x, y, w, h] = regiao.caixa;
  const folga = Math.max(w, h) * 0.08;
  const dentro = regiao.locais
    .map((slug) => locais.find((l) => l.slug === slug))
    .filter((l): l is LocalNoMapa => Boolean(l));

  return (
    <>
      {/* O retrato da região: o próprio mapa recortado nela, com a costa em dourado */}
      <div className="bg-madeira-950 relative aspect-[21/9] w-full md:aspect-[16/9]">
        <svg
          viewBox={`${x - folga} ${y - folga} ${w + folga * 2} ${h + folga * 2}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 size-full"
          aria-hidden
        >
          <image href={MAPA.src} width={LARGURA_BASE} height={ALTURA_BASE} />
          <path
            d={regiao.d}
            fillRule="evenodd"
            fill="rgba(255, 222, 150, 0.1)"
            stroke="#f3dc9a"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(10,6,3,0.7)_100%)]"
        />
        <BotaoFechar fechar={fechar} />
      </div>

      <div className="px-5 pt-4 pb-5">
        <p className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.25em] uppercase">
          Região · {regiao.subtitulo}
        </p>
        <h2 className="font-brasao text-tinta-900 mt-1 text-3xl leading-tight">{regiao.nome}</h2>

        {regiao.fatos.length > 0 ? (
          <ul className="text-tinta-700 mt-3 space-y-2 text-sm leading-relaxed">
            {regiao.fatos.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden className="text-dourado-600 mt-0.5 text-[0.6rem]">
                  ✦
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinta-500 mt-3 text-sm italic">
            Desenhada no mapa, com a história ainda por contar.
          </p>
        )}

        {dentro.length > 0 ? (
          <div className="mt-5">
            <p className="font-titulo text-tinta-500 text-[0.58rem] tracking-[0.25em] uppercase">
              Lugares nesta região
            </p>
            <ul className="mt-2 grid gap-1.5">
              {dentro.map((l) => (
                <li key={l.slug}>
                  <button
                    type="button"
                    onClick={() => abrirLocal(l.slug)}
                    className="border-dourado-600/30 hover:bg-dourado-400/15 hover:border-dourado-600/60 flex min-h-11 w-full items-center gap-2.5 rounded-sm border px-3 py-1.5 text-left transition-colors"
                  >
                    <span
                      aria-hidden
                      className="border-madeira-950 size-2.5 shrink-0 rotate-45 border bg-[linear-gradient(135deg,#f3dc9a,#b8912c_55%,#7a5a14)]"
                    />
                    <span>
                      <span className="font-titulo text-tinta-900 block text-sm font-semibold">{l.nome}</span>
                      <span className="text-tinta-500 block text-xs italic">{l.subtitulo}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Vizinhos
          anterior={{ nome: ao(-1).nome, abrir: () => abrirRegiao(ao(-1).chave) }}
          proximo={{ nome: ao(1).nome, abrir: () => abrirRegiao(ao(1).chave) }}
        />
      </div>
    </>
  );
}
