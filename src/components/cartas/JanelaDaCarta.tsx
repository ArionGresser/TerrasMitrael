"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { MOLDURAS, type TipoDeCarta } from "@/lib/cartas";
import { tocar } from "@/lib/som";

/** Os blocos do texto das regras (parágrafos, listas, tabelas), em ordem. */
const BLOCOS = [
  ".carta-texto > .carta-ficha",
  ".carta-texto > [class*='space-y'] > *",
  ".carta-texto > div > [class*='space-y'] > *",
].join(", ");

/** O menor tamanho de letra no papel antes de partir para a carta de continuação (uns 5 pt). */
const MENOR_ESCALA = 0.84;
/** A letra um pouco menor que a impressão aceita para poupar uma carta (uns 4,7 pt). */
const LETRA_APERTADA = 0.76;

function transborda(texto: HTMLElement) {
  return texto.scrollHeight > texto.clientHeight + 1;
}

/** O ponto (nó de texto e posição) do caractere `k` dentro de um elemento. */
function pontoDoCaractere(el: HTMLElement, k: number): [Node, number] {
  const andar = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let resto = k;
  let no = andar.nextNode();
  let ultimo: Node | null = null;
  while (no) {
    const n = no.textContent?.length ?? 0;
    if (resto <= n) return [no, resto];
    resto -= n;
    ultimo = no;
    no = andar.nextNode();
  }
  return [ultimo ?? el, ultimo?.textContent?.length ?? 0];
}

/** Deixa no bloco só o texto entre os caracteres `de` e `ate` (marcação inclusa). */
function recortar(bloco: HTMLElement, html: string, de: number, ate: number | null) {
  bloco.innerHTML = html;
  if (ate !== null) {
    const r = document.createRange();
    r.setStart(...pontoDoCaractere(bloco, ate));
    r.setEnd(bloco, bloco.childNodes.length);
    r.deleteContents();
  }
  if (de > 0) {
    const r = document.createRange();
    r.setStart(bloco, 0);
    r.setEnd(...pontoDoCaractere(bloco, de));
    r.deleteContents();
  }
}

/**
 * Parte uma carta comprida em quantas forem precisas. Cada uma enche o
 * painel até o fim: o parágrafo que não cabe inteiro é cortado entre duas
 * palavras e continua na carta seguinte, que diz "continuação" na faixa do
 * tipo. Tabelas não se cortam: passam inteiras para a próxima.
 */
function paginar(original: HTMLElement, area: HTMLElement, letra = MENOR_ESCALA) {
  const total = original.querySelectorAll(BLOCOS).length;
  // Onde a próxima carta começa: o bloco e o caractere dentro dele
  let bloco = 0;
  let desde = 0;
  let pagina = 0;
  while (bloco < total && pagina < 12) {
    const carta = original.cloneNode(true) as HTMLElement;
    carta.style.width = "63mm";
    area.appendChild(carta);
    const texto = carta.querySelector<HTMLElement>(".carta-texto")!;
    texto.style.overflow = "hidden";
    texto.style.setProperty("--escala", String(letra));
    const blocos = [...carta.querySelectorAll<HTMLElement>(BLOCOS)];
    const html = blocos.map((b) => b.innerHTML);
    blocos.forEach((b, i) => {
      if (i < bloco) b.style.display = "none";
    });
    if (desde > 0) recortar(blocos[bloco], html[bloco], desde, null);

    // Quantos blocos cabem inteiros a partir daqui
    let fim = total;
    while (transborda(texto) && fim > bloco) {
      fim--;
      blocos[fim].style.display = "none";
    }

    let proximo = { bloco: fim, desde: 0 };
    if (fim < total) {
      // O primeiro que não coube: corta entre palavras no maior pedaço que cabe
      const alvo = blocos[fim];
      const inicio = fim === bloco ? desde : 0;
      const tamanho = (alvo.textContent ?? "").length + (fim === bloco ? desde : 0);
      const cortavel = !alvo.querySelector("table");
      alvo.style.display = "";
      let melhor = -1;
      if (cortavel) {
        let baixo = inicio + 1;
        let alto = tamanho;
        while (baixo <= alto) {
          const meio = (baixo + alto) >> 1;
          recortar(alvo, html[fim], inicio, meio);
          if (transborda(texto)) alto = meio - 1;
          else {
            melhor = meio;
            baixo = meio + 1;
          }
        }
      }
      // Volta até o fim da última palavra inteira
      const inteiro = (() => {
        const t = document.createElement("div");
        t.innerHTML = html[fim];
        return t.textContent ?? "";
      })();
      if (melhor > inicio) {
        const espaco = inteiro.lastIndexOf(" ", melhor);
        if (espaco > inicio + 20) melhor = espaco;
      }
      if (melhor > inicio + 20) {
        recortar(alvo, html[fim], inicio, melhor);
        proximo = { bloco: fim, desde: melhor + 1 };
      } else if (fim === bloco) {
        // Nem um pedaço coube (uma tabela grande): vai inteiro, com a letra menor
        recortar(alvo, html[fim], inicio, null);
        let escala = letra;
        while (transborda(texto) && escala > 0.55) {
          escala -= 0.04;
          texto.style.setProperty("--escala", escala.toFixed(2));
        }
        proximo = { bloco: fim + 1, desde: 0 };
      } else {
        alvo.style.display = "none";
      }
    }
    if (pagina > 0) {
      const faixa = carta.querySelector<HTMLElement>("[data-faixa]");
      if (faixa) faixa.textContent = "continuação";
    }
    bloco = proximo.bloco;
    desde = proximo.desde;
    pagina++;
  }
  return pagina;
}

/**
 * A carta comprida no papel: tenta com a letra normal e com uma um pouco
 * menor (ainda legível) e fica com a que gasta menos cartas, para não sobrar
 * uma carta de continuação com uma linha só.
 */
function paginarNoMenorNumero(original: HTMLElement, area: HTMLElement) {
  const teste = document.createElement("div");
  area.appendChild(teste);
  const normal = paginar(original, teste, MENOR_ESCALA);
  teste.replaceChildren();
  const menor = paginar(original, teste, LETRA_APERTADA);
  teste.remove();
  paginar(original, area, menor < normal ? LETRA_APERTADA : MENOR_ESCALA);
}

/**
 * Imprime uma ou mais cartas no tamanho de carta de baralho (63 x 88 mm).
 *
 * As cartas são copiadas para uma área própria, fora da página. Na tela o
 * texto rola dentro do painel; no papel não dá, então cada carta tenta
 * caber inteira, encolhendo a letra só até um tamanho que ainda se lê, e o
 * que passar disso continua numa segunda carta.
 */
export function imprimirCarta(cartas: HTMLElement[]) {
  let area = document.getElementById("area-de-impressao");
  if (!area) {
    area = document.createElement("div");
    area.id = "area-de-impressao";
    document.body.appendChild(area);
  }
  area.replaceChildren();

  // Mede fora da tela, já na largura do papel
  area.setAttribute(
    "style",
    "display:flex;flex-wrap:wrap;gap:4mm;position:fixed;left:-10000px;top:0;width:200mm",
  );
  for (const original of cartas) {
    const carta = original.cloneNode(true) as HTMLElement;
    carta.style.width = "63mm";
    area.appendChild(carta);
    const texto = carta.querySelector<HTMLElement>(".carta-texto");
    if (!texto) continue;
    texto.style.overflow = "hidden";
    let escala = 1;
    while (transborda(texto) && escala > MENOR_ESCALA) {
      escala -= 0.04;
      texto.style.setProperty("--escala", escala.toFixed(2));
    }
    if (transborda(texto)) {
      carta.remove();
      paginarNoMenorNumero(original, area);
    }
  }
  area.removeAttribute("style");

  const raiz = document.documentElement;
  raiz.classList.add("imprimindo");
  const limpar = () => {
    raiz.classList.remove("imprimindo");
    window.removeEventListener("afterprint", limpar);
  };
  window.addEventListener("afterprint", limpar);
  window.print();
}

/** O botão Imprimir de uma carta que está na página. */
export function BotaoImprimirCarta({ className = "" }: { className?: string }) {
  const botao = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={botao}
      type="button"
      onClick={() => {
        const carta = botao.current?.closest("[data-com-carta]")?.querySelector<HTMLElement>("[data-carta]");
        if (carta) imprimirCarta([carta]);
      }}
      className={`border-dourado-600/60 text-tinta-900 hover:bg-dourado-400/20 font-titulo inline-flex min-h-11 items-center justify-center rounded-sm border px-5 text-sm font-semibold tracking-wide transition-colors ${className}`}
    >
      Imprimir a carta
    </button>
  );
}

const BOTAO_DA_JANELA =
  "border-madeira-600/70 bg-madeira-900/90 text-pergaminho-100 hover:text-pergaminho-50 inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm shadow-lg";

/**
 * A janela em que a carta aparece por cima da tela, no celular e no
 * computador: a carta no maior tamanho que cabe, e embaixo os botões.
 */
export function JanelaDaCarta({
  aberta,
  tipo,
  aoFechar,
  pagina,
  children,
}: {
  aberta: boolean;
  tipo: TipoDeCarta;
  aoFechar(): void;
  /** O endereço da página completa, quando existe. */
  pagina?: string;
  children: ReactNode;
}) {
  const janela = useRef<HTMLDialogElement>(null);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = janela.current;
    if (!d) return;
    if (aberta && !d.open) {
      d.showModal();
      tocar("abrirMenu");
    }
    if (!aberta && d.open) d.close();
  }, [aberta]);

  const proporcao = MOLDURAS[tipo].proporcao;

  return (
    <dialog
      ref={janela}
      onClose={() => {
        tocar("fecharMenu");
        aoFechar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) janela.current?.close();
      }}
      aria-label="Carta"
      className="m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/75"
    >
      <div className="flex flex-col items-center gap-4 p-3">
        <div
          ref={caixa}
          data-com-carta
          className="drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
          style={{ width: `min(90vw, calc((100dvh - 7.5rem) * ${proporcao}), 30rem)` }}
        >
          {children}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              const carta = caixa.current?.querySelector<HTMLElement>("[data-carta]");
              if (carta) imprimirCarta([carta]);
            }}
            className={BOTAO_DA_JANELA}
          >
            Imprimir
          </button>
          {pagina ? (
            <Link href={pagina} className={BOTAO_DA_JANELA}>
              Página completa
            </Link>
          ) : null}
          <button type="button" onClick={() => janela.current?.close()} className={BOTAO_DA_JANELA} autoFocus>
            Fechar
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * A carta de uma página do site, trazida para uma janela por cima da lista:
 * a carta pronta mora na página da magia ou do item (com o texto das regras
 * já formatado), e a lista busca só ela quando alguém toca no cartão. Assim a
 * lista não precisa carregar o texto de centenas de magias.
 */
const guardadas = new Map<string, string>();

export function useCartaDaPagina() {
  const [pagina, setPagina] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!pagina) return;
    let cancelado = false;
    setErro(false);
    const pronta = guardadas.get(pagina);
    if (pronta) {
      setHtml(pronta);
      return;
    }
    setHtml(null);
    fetch(pagina)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((texto) => {
        const doc = new DOMParser().parseFromString(texto, "text/html");
        const carta = doc.querySelector("[data-carta]");
        if (!carta) throw new Error("sem carta");
        // As imagens da página vêm preguiçosas: na janela, já carregam
        carta.querySelectorAll("img").forEach((i) => i.setAttribute("loading", "eager"));
        guardadas.set(pagina, carta.outerHTML);
        if (!cancelado) setHtml(carta.outerHTML);
      })
      .catch(() => {
        if (!cancelado) setErro(true);
      });
    return () => {
      cancelado = true;
    };
  }, [pagina]);

  return {
    pagina,
    abrir: (endereco: string) => setPagina(endereco),
    fechar: () => {
      setPagina(null);
      setHtml(null);
    },
    conteudo: erro ? (
      <p className="text-pergaminho-100 bg-madeira-900/90 rounded-md p-6 text-center text-sm">
        Não deu para abrir a carta agora. A página completa continua no botão abaixo.
      </p>
    ) : html ? (
      <div dangerouslySetInnerHTML={{ __html: html }} />
    ) : (
      <p className="text-pergaminho-200 p-10 text-center text-sm italic">Tirando a carta do baralho...</p>
    ),
  };
}

/** Um clique comum (não Ctrl, não botão do meio): esses abrem a carta em vez da página. */
export function cliqueSimples(e: MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
