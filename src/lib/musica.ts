import { Howl } from "howler";
import { somLigado } from "./som";

/**
 * A música de fundo, uma faixa por seção do site.
 *
 * Vale o mesmo contrato dos efeitos: começa desligada, a escolha fica salva,
 * e se um arquivo não existir o site funciona em silêncio, sem erro.
 *
 * Duas regras a mais, que só a música precisa:
 * 1. Nada é baixado antes de alguém ligar o som. Quem nunca clicar no botão
 *    continua com o site tão leve quanto hoje.
 * 2. A música abaixa sozinha enquanto uma narração toca. Sem isso ninguém
 *    entende a história do personagem por cima do fundo musical.
 */

export type Ambiente = "tema" | "locais" | "eventos" | "personagens";

const ARQUIVOS: Record<Ambiente, string> = {
  tema: "/musicas/tema.m4a",
  locais: "/musicas/locais.m4a",
  eventos: "/musicas/eventos.m4a",
  personagens: "/musicas/personagens.m4a",
};

/** Música é fundo, não é o assunto. Fica bem abaixo da voz e dos efeitos. */
const VOLUME = 0.22;
const VOLUME_ABAFADO = 0.04;
const TRANSICAO = 1200;

const cache = new Map<Ambiente, Howl>();
const indisponivel = new Set<Ambiente>();

let atual: Ambiente | null = null;
let abafado = false;
let esperandoGesto = false;

/** Qual faixa pertence a cada endereço do site. */
export function ambienteDaRota(caminho: string): Ambiente {
  if (caminho.startsWith("/locais")) return "locais";
  if (caminho.startsWith("/eventos")) return "eventos";
  if (caminho.startsWith("/personagens")) return "personagens";
  return "tema";
}

function volumeAlvo(): number {
  return abafado ? VOLUME_ABAFADO : VOLUME;
}

function obter(ambiente: Ambiente): Howl | null {
  if (indisponivel.has(ambiente)) return null;

  const existente = cache.get(ambiente);
  if (existente) return existente;

  const faixa = new Howl({
    src: [ARQUIVOS[ambiente]],
    volume: 0,
    loop: true,
    // Streaming em vez de decodificar o arquivo inteiro na memória.
    // Faixas longas travariam o celular por alguns segundos sem isto.
    html5: true,
    preload: false,
    onloaderror: () => {
      // Arquivo ausente: desiste desta faixa em silêncio
      indisponivel.add(ambiente);
      cache.delete(ambiente);
    },
    onplayerror: () => {
      // O navegador bloqueou o som automático. Volta no primeiro toque.
      aguardarGesto();
    },
  });

  cache.set(ambiente, faixa);
  return faixa;
}

/**
 * Depois de recarregar a página, o navegador proíbe qualquer som que a
 * pessoa não tenha pedido naquele carregamento. É regra do navegador, não
 * dá para contornar. O que dá é voltar assim que ela tocar em qualquer coisa.
 */
function aguardarGesto() {
  if (esperandoGesto || typeof window === "undefined") return;
  esperandoGesto = true;

  const retomar = () => {
    esperandoGesto = false;
    document.removeEventListener("pointerdown", retomar);
    document.removeEventListener("keydown", retomar);
    if (atual) tocarAmbiente(atual);
  };

  document.addEventListener("pointerdown", retomar, { once: true });
  document.addEventListener("keydown", retomar, { once: true });
}

function desvanecer(faixa: Howl, para: number, depois?: () => void) {
  const de = faixa.volume() as number;
  faixa.fade(de, para, TRANSICAO);
  if (depois) window.setTimeout(depois, TRANSICAO);
}

/** Entra na faixa da seção, saindo da anterior sem corte. */
export function tocarAmbiente(ambiente: Ambiente) {
  if (!somLigado()) {
    atual = ambiente;
    return;
  }

  const anterior = atual;
  atual = ambiente;

  if (anterior && anterior !== ambiente) {
    const saindo = cache.get(anterior);
    if (saindo?.playing()) {
      desvanecer(saindo, 0, () => saindo.stop());
    }
  }

  const faixa = obter(ambiente);
  if (!faixa) return;

  if (faixa.state() === "unloaded") faixa.load();
  if (!faixa.playing()) {
    faixa.volume(0);
    faixa.play();
  }
  faixa.fade(faixa.volume() as number, volumeAlvo(), TRANSICAO);
}

/** Ao desligar o som: para onde estava, para voltar do mesmo ponto. */
export function pausarMusica() {
  if (!atual) return;
  const faixa = cache.get(atual);
  if (!faixa?.playing()) return;
  desvanecer(faixa, 0, () => faixa.pause());
}

/** Ao ligar o som de novo: continua de onde parou. */
export function retomarMusica() {
  if (!atual) return;
  tocarAmbiente(atual);
}

/** Abaixa a música enquanto uma narração toca, e devolve o volume no fim. */
export function abafarMusica(ligar: boolean) {
  abafado = ligar;
  if (!atual) return;
  const faixa = cache.get(atual);
  if (!faixa?.playing()) return;
  faixa.fade(faixa.volume() as number, volumeAlvo(), 400);
}
