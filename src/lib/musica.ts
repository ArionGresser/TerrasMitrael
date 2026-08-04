import { Howl } from "howler";
import { somLigado } from "./som";

/**
 * A música de fundo, uma faixa por seção do site.
 *
 * Vale o mesmo contrato dos efeitos: a escolha fica salva, e se um arquivo
 * não existir o site funciona em silêncio, sem erro.
 *
 * Três regras a mais, que só a música precisa:
 * 1. Nada é baixado por quem desligou o som. Quem chega e desliga no primeiro
 *    toque não paga por nenhum megabyte de faixa.
 * 2. A música abaixa sozinha enquanto uma narração toca. Sem isso ninguém
 *    entende a história do personagem por cima do fundo musical.
 * 3. Seção sem faixa própria toca o tema. Enquanto só existir tema.m4a, o
 *    site inteiro tem música, em vez de emudecer em três de quatro seções.
 */

export type Ambiente = "tema" | "locais" | "eventos" | "personagens";

const ARQUIVOS: Record<Ambiente, string> = {
  tema: "/musicas/tema.m4a",
  locais: "/musicas/locais.m4a",
  eventos: "/musicas/eventos.m4a",
  personagens: "/musicas/personagens.m4a",
};

/** A faixa que o tema cobre quando a da seção não existe. */
const RESERVA: Ambiente = "tema";

/** Música é fundo, não é o assunto. Fica bem abaixo da voz e dos efeitos. */
const VOLUME = 0.22;
const VOLUME_ABAFADO = 0.04;
const TRANSICAO = 1200;

const cache = new Map<Ambiente, Howl>();
const indisponivel = new Set<Ambiente>();

let atual: Ambiente | null = null;
let abafado = false;
let esperandoGesto = false;
let houveGesto = false;

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
      // Arquivo ausente: risca esta faixa e cai no tema, em vez de emudecer
      indisponivel.add(ambiente);
      cache.delete(ambiente);
      if (ambiente !== RESERVA && atual === ambiente) tocarAmbiente(ambiente);
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
    houveGesto = true;
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

/** A faixa que vai tocar de verdade: a da seção, ou o tema no lugar dela. */
function resolver(ambiente: Ambiente): Ambiente {
  return indisponivel.has(ambiente) ? RESERVA : ambiente;
}

/** Entra na faixa da seção, saindo da anterior sem corte. */
export function tocarAmbiente(pedido: Ambiente) {
  const ambiente = resolver(pedido);

  if (!somLigado()) {
    atual = ambiente;
    return;
  }

  // Antes do primeiro toque na página, nem adianta baixar: o navegador não
  // deixaria tocar de todo jeito. Quem chega e desliga o som na hora não
  // gasta um byte de faixa.
  if (!houveGesto) {
    atual = ambiente;
    aguardarGesto();
    return;
  }

  const faixa = obter(ambiente);
  if (!faixa) return;

  const anterior = atual;
  atual = ambiente;

  if (faixa.state() === "unloaded") faixa.load();

  // A anterior só sai depois que a nova entra. Cortar antes deixaria um
  // buraco de silêncio na troca e, pior, mataria o tema à toa quando a
  // faixa pedida não existe: o arquivo ausente só se revela ao falhar.
  const trocar = () => {
    if (anterior && anterior !== ambiente) {
      const saindo = cache.get(anterior);
      if (saindo?.playing()) {
        desvanecer(saindo, 0, () => saindo.stop());
      }
    }
    faixa.fade(faixa.volume() as number, volumeAlvo(), TRANSICAO);
  };

  if (faixa.playing()) {
    trocar();
    return;
  }

  // O volume tem que subir depois que a faixa começa de verdade. Pedir o
  // fade antes disso deixa a ordem parada numa fila interna do Howler que
  // só esvazia com a reprodução: a música tocava, mas muda, no volume zero
  // com que nasce. A faixa já é criada em zero, então não há o que zerar.
  faixa.once("play", trocar);
  faixa.play();
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
