"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { tocar } from "@/lib/som";
import { marcar } from "@/lib/conquistas";

/**
 * A temporada dos Contos como um livro de verdade.
 *
 * A capa de couro abre, e as páginas viram em 3D: no computador o livro fica
 * aberto em duas páginas, no celular uma por vez. Clique na página (ou nas
 * setas, no teclado, ou arraste o dedo) e a folha vira, com o som de papel.
 *
 * O texto do episódio corre em colunas do tamanho exato da página, como nos
 * leitores de livro digital: o próprio navegador corta o texto, até no meio
 * de um parágrafo, e cada coluna vira uma página. Muda o tamanho da tela, o
 * livro se refaz sozinho.
 *
 * Virar depois da última página leva ao próximo episódio; voltar antes da
 * primeira leva ao anterior, já aberto no fim. Quem pediu menos movimento vê
 * a página trocar sem o giro. E quem prefere ler de outro jeito tem o botão
 * "Ler sem o livro", que guarda a escolha neste navegador.
 *
 * O texto inteiro continua na página o tempo todo: os buscadores leem tudo, e
 * o leitor de tela recebe o episódio corrido, sem os cortes das páginas.
 */

/** Altura sobre largura de cada página. */
const PROPORCAO = 1.45;
/** O vão entre as colunas do texto, que nunca aparece: só separa as páginas. */
const VAO = 48;
/** Quanto do couro aparece em volta das páginas. */
const BORDA = 12;
const DURACAO = 0.8;
const MODO = "mitrael:leitura";

type Medidas = { duas: boolean; pw: number; ph: number };

/** Antes de medir a tela: um livro aberto de tamanho médio. */
const INICIAL: Medidas = { duas: true, pw: 420, ph: 609 };

function medir(largura: number, alturaTela: number): Medidas {
  const duas = largura >= 760;
  const livre = duas ? (largura - BORDA * 2) / 2 : largura - BORDA * 2;
  const teto = Math.max(440, alturaTela - 200);
  if (duas) {
    let pw = Math.min(470, livre);
    let ph = pw * PROPORCAO;
    if (ph > teto) {
      ph = teto;
      pw = ph / PROPORCAO;
    }
    return { duas, pw: Math.floor(pw), ph: Math.floor(ph) };
  }
  // No celular a página usa a largura toda, mesmo que fique mais baixa
  const pw = Math.min(520, livre);
  return { duas, pw: Math.floor(pw), ph: Math.floor(Math.min(pw * 1.6, teto)) };
}

/** As margens de dentro da página: o cabeçalho corrido em cima, o número embaixo. */
function margens({ pw, ph }: Medidas) {
  const lado = Math.round(Math.max(18, pw * 0.085));
  const topo = 46;
  const pe = 42;
  return { lado, topo, pe, tw: pw - lado * 2, th: ph - topo - pe };
}

type Pagina = { tipo: "fixa"; no: ReactNode } | { tipo: "texto"; k: number } | { tipo: "branca" };
type Virada = { dir: 1 | -1; de: number; para: number };
type Lado = "esquerda" | "direita" | "sozinha";

export function Livro({
  chave,
  titulo,
  capa,
  antes,
  texto,
  depois = [],
  anterior,
  proximo,
  rotuloAnterior = "Anterior",
  rotuloProximo = "Próximo",
  classico,
  cabecalho,
  capitulosEmPagina = false,
}: {
  /** Onde o marcador de página fica guardado, como "cronicas/temporada-2/episodio-03". */
  chave: string;
  /** O título que corre no alto das páginas de texto. */
  titulo: string;
  /** A capa de couro, para o livro começar fechado. */
  capa?: ReactNode;
  /** As páginas inteiras antes do texto: abertura, sumário... */
  antes: ReactNode[];
  /** O texto que corre pelas páginas, cortado em colunas. */
  texto?: ReactNode;
  /** As páginas inteiras depois do texto. */
  depois?: ReactNode[];
  /** Para onde o livro vai ao voltar da primeira página. */
  anterior?: string;
  /** Para onde o livro vai ao virar a última página. */
  proximo?: string;
  rotuloAnterior?: string;
  rotuloProximo?: string;
  /** A mesma história sem o livro: a página corrida de sempre, inteira. */
  classico: ReactNode;
  /** O que vai acima do livro, como o caminho de volta. */
  cabecalho?: ReactNode;
  /** Cada título do texto abre uma página nova, como capítulo de livro. */
  capitulosEmPagina?: boolean;
}) {
  const classeDoTexto = `leitura-conto texto-do-livro${capitulosEmPagina ? " capitulos-em-pagina" : ""}`;
  const router = useRouter();
  const reduzido = useReducedMotion();
  const caixa = useRef<HTMLDivElement>(null);
  const medidor = useRef<HTMLDivElement>(null);
  const garantia = useRef<number | null>(null);
  const toque = useRef<{ x: number; y: number; arrastou: boolean } | null>(null);

  const [modo, setModo] = useState<"livro" | "texto">("livro");
  const [m, setM] = useState<Medidas>(INICIAL);
  const [pronto, setPronto] = useState(false);
  const [paginasDeTexto, setPaginasDeTexto] = useState(texto ? 1 : 0);
  /** Já contou as páginas do texto: antes disso, "a última página" ainda não existe. */
  const [contado, setContado] = useState(!texto);
  const [atual, setAtual] = useState(0);
  const [aberto, setAberto] = useState(!capa);
  const [abrindo, setAbrindo] = useState(false);
  const [virada, setVirada] = useState<Virada | null>(null);
  const [parou, setParou] = useState<number | null>(null);

  const { lado, topo, pe, tw, th } = margens(m);

  const paginas: Pagina[] = [
    ...antes.map((no): Pagina => ({ tipo: "fixa", no })),
    ...Array.from({ length: paginasDeTexto }, (_, k): Pagina => ({ tipo: "texto", k })),
    ...depois.map((no): Pagina => ({ tipo: "fixa", no })),
  ];
  const total = paginas.length;
  const passo = m.duas ? 2 : 1;
  const ultima = m.duas ? Math.max(0, total - 1 - ((total - 1) % 2)) : Math.max(0, total - 1);

  // ---------- O jeito de ler, guardado neste navegador ----------

  useEffect(() => {
    try {
      if (localStorage.getItem(MODO) === "texto") setModo("texto");
    } catch {
      // Sem armazenamento: fica o livro
    }
  }, []);

  function trocarModo(novo: "livro" | "texto") {
    setModo(novo);
    try {
      localStorage.setItem(MODO, novo);
    } catch {
      // Navegação privada: só não guarda
    }
  }

  // ---------- O tamanho do livro acompanha a tela ----------

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const ajustar = () => {
      setM(medir(el.clientWidth, window.innerHeight));
      setPronto(true);
    };
    ajustar();
    const observar = new ResizeObserver(ajustar);
    observar.observe(el);
    return () => observar.disconnect();
  }, [modo]);

  // Quantas páginas o texto ocupa: o medidor é o texto inteiro em colunas,
  // e cada coluna é uma página
  useEffect(() => {
    const el = medidor.current;
    if (!el || !texto) return;
    const contar = () => {
      const n = Math.max(1, Math.round((el.scrollWidth + VAO) / (tw + VAO)));
      setPaginasDeTexto(n);
      setContado(true);
    };
    contar();
    // A fonte do título chega depois e pode empurrar o texto
    document.fonts?.ready.then(contar).catch(() => {});
    const tarde = window.setTimeout(contar, 600);
    return () => window.clearTimeout(tarde);
  }, [texto, tw, th, modo]);

  // Ao mudar de uma para duas páginas, a vista precisa começar numa par
  useEffect(() => {
    setAtual((a) => Math.min(m.duas ? a - (a % 2) : a, ultima));
  }, [m.duas, ultima]);

  // ---------- Onde abrir: o fim (vindo do episódio seguinte) ou o marcador ----------

  const marcador = `mitrael:livro:${chave}`;
  const jaAbriu = useRef(false);
  /**
   * Veio do capítulo seguinte e ainda não virou nada: fica preso à última
   * folha. A contagem do texto pode crescer depois que fontes e imagens
   * chegam, e sem isso o livro abria duas folhas antes do fim.
   */
  const noFim = useRef(false);
  useEffect(() => {
    if (noFim.current) setAtual(ultima);
  }, [ultima]);
  useEffect(() => {
    if (jaAbriu.current || !pronto || !contado) return;
    jaAbriu.current = true;
    const pedido = new URLSearchParams(window.location.search).get("pagina");
    if (pedido === "fim") {
      noFim.current = true;
      setAberto(true);
      setAtual(ultima);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    try {
      // O marcador guarda o índice da página; a partir da terceira, vale perguntar
      const salvo = Number(localStorage.getItem(marcador));
      if (salvo > 1 && salvo <= ultima) setParou(salvo);
    } catch {
      // Sem marcador
    }
  }, [pronto, contado, ultima, marcador]);

  useEffect(() => {
    if (!aberto || atual === 0) return;
    try {
      localStorage.setItem(marcador, String(atual));
    } catch {
      // Navegação privada
    }
  }, [atual, aberto, marcador]);

  // ---------- Virar ----------

  const terminar = useCallback(() => {
    if (garantia.current !== null) window.clearTimeout(garantia.current);
    garantia.current = null;
    setVirada((v) => {
      if (v) setAtual(v.para);
      return null;
    });
    setAbrindo(false);
  }, []);

  const virar = useCallback(
    (dir: 1 | -1) => {
      if (virada || abrindo) return;
      noFim.current = false;
      setParou(null);
      if (!aberto) {
        setAberto(true);
        if (!reduzido) {
          setAbrindo(true);
          tocar("capa");
          garantia.current = window.setTimeout(terminar, DURACAO * 1000 + 200);
        }
        return;
      }
      const para = atual + dir * passo;
      if (para < 0) {
        if (anterior) router.push(`${anterior}?pagina=fim`);
        return;
      }
      if (para > ultima) {
        if (proximo) {
          tocar("virarPagina");
          router.push(proximo);
        }
        return;
      }
      tocar("virarPagina");
      // Virou até a última folha com as próprias mãos (e não chegou nela
      // voltando do capítulo seguinte): leu o livro até o fim
      if (para + passo > ultima && ultima > 2) marcar("leitor", chave);
      if (reduzido) {
        setAtual(para);
        return;
      }
      setVirada({ dir, de: atual, para });
      garantia.current = window.setTimeout(terminar, DURACAO * 1000 + 200);
    },
    [virada, abrindo, aberto, reduzido, atual, passo, ultima, anterior, proximo, router, terminar],
  );

  const irPara = (pagina: number) => {
    noFim.current = false;
    setParou(null);
    setAberto(true);
    setAtual(m.duas ? pagina - (pagina % 2) : pagina);
  };

  // Teclado: setas e Page Up/Down, em qualquer lugar da página
  useEffect(() => {
    if (modo !== "livro") return;
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target;
      if (alvo instanceof Element && alvo.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        virar(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        virar(-1);
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [modo, virar]);

  // Arrastar o dedo para o lado vira a página; um toque na página também
  function aoPressionar(e: React.PointerEvent) {
    toque.current = { x: e.clientX, y: e.clientY, arrastou: false };
  }
  function aoSoltar(e: React.PointerEvent) {
    const t = toque.current;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      t.arrastou = true;
      virar(dx < 0 ? 1 : -1);
    }
  }
  function aoClicar(e: React.MouseEvent) {
    if (toque.current?.arrastou) return;
    if ((e.target as Element).closest("a, button")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    // Duas páginas: a da direita avança, a da esquerda volta. Uma página:
    // o terço da esquerda volta, o resto avança
    virar(x < (m.duas ? 0.5 : 0.33) ? -1 : 1);
  }

  // ---------- O desenho de cada página ----------

  function conteudo(indice: number, onde: Lado, oculta = false) {
    const p: Pagina = paginas[indice] ?? { tipo: "branca" };
    const classeLado = onde === "esquerda" ? "pagina-esquerda" : onde === "direita" ? "pagina-direita" : "pagina-sozinha";
    return (
      <div
        className={`pagina-livro ${classeLado} size-full`}
        aria-hidden={oculta || p.tipo !== "fixa" || undefined}
        inert={oculta || undefined}
      >
        {p.tipo === "fixa" ? (
          <div className="absolute inset-0 overflow-y-auto" style={{ padding: `${topo - 14}px ${lado}px ${pe}px` }}>
            {p.no}
          </div>
        ) : p.tipo === "texto" ? (
          <>
            <p
              className="font-titulo text-tinta-500 absolute inset-x-0 truncate px-10 text-center text-[0.6rem] tracking-[0.25em] uppercase"
              style={{ top: 18 }}
            >
              {titulo}
            </p>
            <div className="absolute overflow-hidden" style={{ left: lado, top: topo, width: tw, height: th }}>
              <div
                className={classeDoTexto}
                style={{
                  width: tw,
                  height: th,
                  columnWidth: tw,
                  columnGap: VAO,
                  transform: `translateX(${-p.k * (tw + VAO)}px)`,
                }}
              >
                {texto}
              </div>
            </div>
          </>
        ) : null}
        {p.tipo !== "branca" ? (
          <p className="font-titulo text-tinta-500 absolute inset-x-0 text-center text-xs" style={{ bottom: 14 }}>
            {indice + 1}
          </p>
        ) : null}
      </div>
    );
  }

  /** Uma página parada, no seu lugar do livro. */
  function parada(indice: number, onde: Lado) {
    const esquerda = onde === "direita" ? m.pw : 0;
    return (
      <div className="absolute top-0" style={{ left: esquerda, width: m.pw, height: m.ph }}>
        {conteudo(indice, onde)}
      </div>
    );
  }

  /** A folha que vira, com a frente e o verso. */
  function folha({
    frente,
    verso,
    sobre,
    de,
    ate,
  }: {
    frente: ReactNode;
    verso: ReactNode;
    sobre: "esquerda" | "direita" | "sozinha";
    de: number;
    ate: number;
  }) {
    const naDireita = sobre === "direita";
    const giraPelaDireita = sobre === "esquerda";
    return (
      <motion.div
        className="folha-que-vira absolute top-0 z-20"
        style={{
          left: naDireita ? m.pw : 0,
          width: m.pw,
          height: m.ph,
          transformOrigin: giraPelaDireita ? "right center" : "left center",
        }}
        initial={{ rotateY: de }}
        animate={{ rotateY: ate }}
        transition={{ duration: DURACAO, ease: [0.45, 0.05, 0.25, 1] }}
        onAnimationComplete={terminar}
      >
        <div className="face shadow-[0_0_24px_rgba(0,0,0,0.25)]">{frente}</div>
        <div className="face face-verso shadow-[0_0_24px_rgba(0,0,0,0.25)]">{verso}</div>
      </motion.div>
    );
  }

  // ---------- Montar a vista ----------

  const largura = m.duas ? m.pw * 2 : m.pw;
  let vista: ReactNode;

  if (!aberto || abrindo) {
    // O livro fechado (ou a capa girando para abrir)
    const capaNo = (
      <div className="couro-do-livro relative size-full rounded-r-md">
        <div className="friso-da-capa absolute inset-3 rounded-sm" />
        {capa}
      </div>
    );
    vista = (
      <div
        className="relative mx-auto [perspective:2400px]"
        style={{
          width: largura,
          height: m.ph,
          transform: !aberto && m.duas ? `translateX(-${m.pw / 2}px)` : undefined,
          transition: "transform 0.8s cubic-bezier(.45,.05,.25,1)",
        }}
      >
        {abrindo ? (
          <>
            {m.duas ? parada(1, "direita") : parada(0, "sozinha")}
            {folha({
              frente: capaNo,
              verso: m.duas ? conteudo(0, "esquerda", true) : <div className="couro-do-livro size-full" />,
              sobre: m.duas ? "direita" : "sozinha",
              de: 0,
              ate: -180,
            })}
          </>
        ) : (
          <button
            type="button"
            onClick={() => virar(1)}
            aria-label="Abrir o livro"
            className="absolute top-0 cursor-pointer text-left"
            style={{ left: m.duas ? m.pw : 0, width: m.pw, height: m.ph }}
          >
            {capaNo}
          </button>
        )}
      </div>
    );
  } else if (m.duas) {
    const v = virada;
    vista = (
      <div className="relative mx-auto [perspective:2400px]" style={{ width: largura, height: m.ph }}>
        {!v ? (
          <>
            {parada(atual, "esquerda")}
            {parada(atual + 1, "direita")}
          </>
        ) : v.dir === 1 ? (
          <>
            {parada(v.de, "esquerda")}
            {parada(v.para + 1, "direita")}
            {folha({
              frente: conteudo(v.de + 1, "direita", true),
              verso: conteudo(v.para, "esquerda", true),
              sobre: "direita",
              de: 0,
              ate: -180,
            })}
          </>
        ) : (
          <>
            {parada(v.para, "esquerda")}
            {parada(v.de + 1, "direita")}
            {folha({
              frente: conteudo(v.de, "esquerda", true),
              verso: conteudo(v.para + 1, "direita", true),
              sobre: "esquerda",
              de: 0,
              ate: 180,
            })}
          </>
        )}
        {/* A lombada: a dobra escura no meio do livro aberto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-30 w-6 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,rgb(40_20_8/0.35)_45%,rgb(40_20_8/0.45)_50%,rgb(40_20_8/0.35)_55%,transparent)]"
          style={{ left: m.pw }}
        />
      </div>
    );
  } else {
    const v = virada;
    vista = (
      <div className="relative mx-auto [perspective:2400px]" style={{ width: largura, height: m.ph }}>
        {!v ? (
          parada(atual, "sozinha")
        ) : v.dir === 1 ? (
          <>
            {parada(v.para, "sozinha")}
            {folha({
              frente: conteudo(v.de, "sozinha", true),
              verso: <div className="pagina-livro size-full" />,
              sobre: "sozinha",
              de: 0,
              ate: -180,
            })}
          </>
        ) : (
          <>
            {parada(v.de, "sozinha")}
            {folha({
              frente: conteudo(v.para, "sozinha", true),
              verso: <div className="pagina-livro size-full" />,
              sobre: "sozinha",
              de: -180,
              ate: 0,
            })}
          </>
        )}
      </div>
    );
  }

  // ---------- O que aparece embaixo: as setas e onde você está ----------

  const primeiraVisivel = atual + 1;
  const ultimaVisivel = Math.min(total, atual + passo);
  const ondeEsta = !aberto
    ? "Capa"
    : m.duas && ultimaVisivel > primeiraVisivel
      ? `Páginas ${primeiraVisivel} e ${ultimaVisivel} de ${total}`
      : `Página ${primeiraVisivel} de ${total}`;
  const podeVoltar = aberto && (atual > 0 || Boolean(anterior));
  const podeAvancar = !aberto || atual < ultima || Boolean(proximo);

  if (modo === "texto") {
    return (
      <>
        {classico}
        {/* Para voltar ao livro, sempre à mão no canto da tela */}
        <button
          type="button"
          onClick={() => trocarModo("livro")}
          className="placa-comunidade font-titulo text-pergaminho-100 hover:text-dourado-200 fixed bottom-4 left-4 z-40 min-h-11 rounded-sm px-4 text-xs tracking-[0.14em] uppercase"
        >
          Ler como livro
        </button>
      </>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-3 pt-20 pb-8 sm:px-6 sm:pt-24">
      {cabecalho}
    <div ref={caixa} className="livro relative mt-5 w-full overflow-x-clip">
      <a
        href="#texto-corrido"
        onClick={(e) => {
          e.preventDefault();
          trocarModo("texto");
        }}
        className="sr-only focus:not-sr-only focus:mb-3 focus:inline-block"
      >
        Ler em texto corrido, sem o livro
      </a>

      {/* O couro em volta das páginas */}
      <div
        className={`relative mx-auto transition-opacity duration-300 ${pronto ? "opacity-100" : "opacity-0"}`}
        style={{ width: largura + (aberto ? BORDA * 2 : 0), maxWidth: "100%" }}
      >
        <div
          className={aberto ? "couro-do-livro rounded-md" : ""}
          style={{ padding: aberto ? BORDA : 0 }}
          onPointerDown={aoPressionar}
          onPointerUp={aoSoltar}
          onClick={aberto ? aoClicar : undefined}
        >
          {vista}
        </div>

        {/* A fita marcadora: só a ponta, escapando por baixo do livro aberto */}
        {aberto ? (
          <span
            aria-hidden
            className="bg-heraldico-vermelho absolute -bottom-7 z-0 h-10 w-3 shadow-[1px_2px_3px_rgba(0,0,0,0.5)] [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-8px),0_100%)]"
            style={{ left: m.duas ? `calc(50% + ${m.pw * 0.62}px)` : "78%" }}
          />
        ) : null}
      </div>

      {parou !== null ? (
        <div className="border-dourado-600/40 bg-pergaminho-100/95 text-tinta-900 mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-3 rounded-sm border px-4 py-2 text-sm shadow">
          <span>Você parou na página {parou + 1}.</span>
          <button
            type="button"
            onClick={() => irPara(parou)}
            className="font-titulo hover:text-heraldico-vermelho min-h-10 font-semibold underline underline-offset-4"
          >
            Continuar
          </button>
          <button type="button" onClick={() => setParou(null)} className="text-tinta-500 min-h-10 text-xs underline">
            Começar do início
          </button>
        </div>
      ) : null}

      {/* As setas e onde você está no livro */}
      <div className="mx-auto mt-5 flex max-w-xl items-center justify-between gap-3 px-2">
        <button
          type="button"
          onClick={() => virar(-1)}
          disabled={!podeVoltar}
          aria-label={aberto && atual === 0 && anterior ? rotuloAnterior : "Voltar a página"}
          className="placa-comunidade font-titulo text-pergaminho-100 hover:text-dourado-200 min-h-11 min-w-11 rounded-sm px-3 text-xs tracking-[0.12em] uppercase disabled:opacity-30"
        >
          <span aria-hidden className="text-lg leading-none">‹</span>{" "}
          <span className="hidden sm:inline">{aberto && atual === 0 && anterior ? rotuloAnterior : "Voltar"}</span>
        </button>
        <p aria-live="polite" className="text-pergaminho-200 text-center text-xs [text-shadow:0_1px_2px_#000]">
          {ondeEsta}
        </p>
        <button
          type="button"
          onClick={() => virar(1)}
          disabled={!podeAvancar}
          aria-label={!aberto ? "Abrir o livro" : atual + passo > ultima && proximo ? rotuloProximo : "Virar a página"}
          className="placa-comunidade font-titulo text-pergaminho-100 hover:text-dourado-200 min-h-11 min-w-11 rounded-sm px-3 text-xs tracking-[0.12em] uppercase disabled:opacity-30"
        >
          <span className="hidden sm:inline">
            {!aberto ? "Abrir" : atual + passo > ultima && proximo ? rotuloProximo : "Avançar"}
          </span>{" "}
          <span aria-hidden className="text-lg leading-none">›</span>
        </button>
      </div>

      <p className="mt-3 text-center">
        <button
          type="button"
          onClick={() => trocarModo("texto")}
          className="text-pergaminho-300/80 hover:text-pergaminho-100 min-h-10 text-xs underline underline-offset-4"
        >
          Ler sem o livro
        </button>
      </p>

      {/* O medidor: o texto inteiro em colunas, invisível, para contar as páginas */}
      {texto ? (
        <div aria-hidden className="pointer-events-none invisible absolute top-0 left-0 overflow-hidden" style={{ width: 1, height: 1 }}>
          <div
            ref={medidor}
            className={classeDoTexto}
            style={{ width: tw, height: th, columnWidth: tw, columnGap: VAO }}
          >
            {texto}
          </div>
        </div>
      ) : null}

      {/* O texto corrido, para leitor de tela e buscadores */}
      {texto ? (
        <article id="texto-corrido" className="sr-only">
          <div className="leitura-conto">{texto}</div>
        </article>
      ) : null}
    </div>
    </main>
  );
}
