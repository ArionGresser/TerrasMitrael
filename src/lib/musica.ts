import { somLigado } from "./som";

/**
 * A música de fundo: uma faixa por seção do site, e uma própria para o
 * personagem que tiver a sua.
 *
 * Vale o mesmo contrato dos efeitos: a escolha fica salva, e se um arquivo
 * não existir o site funciona em silêncio, sem erro.
 *
 * Três regras a mais, que só a música precisa:
 * 1. Nada é baixado por quem desligou o som. Quem chega e desliga no primeiro
 *    toque não paga por nenhum megabyte de faixa.
 * 2. A música abaixa sozinha enquanto uma narração toca. Sem isso ninguém
 *    entende a história do personagem por cima do fundo musical.
 * 3. Seção sem faixa própria toca o tema. Enquanto faltarem arquivos, o site
 *    inteiro tem música, em vez de emudecer em três de quatro seções.
 *
 * O som sai por um elemento de áudio comum ligado a um controle de ganho da
 * Web Audio. Ver `ligar` para o motivo, que é o celular.
 */

export type Ambiente =
  | "tema"
  | "locais"
  | "eventos"
  | "personagens"
  | "johnny"
  | "vrakyr"
  | "pyhmm";

const ARQUIVOS: Record<Ambiente, string> = {
  tema: "/musicas/tema.m4a",
  locais: "/musicas/locais.m4a",
  eventos: "/musicas/eventos.m4a",
  personagens: "/musicas/personagens.m4a",
  johnny: "/musicas/johnny-tema.m4a",
  vrakyr: "/musicas/vrakyr-tema.m4a",
  pyhmm: "/musicas/pyhmm-tema.m4a",
};

/**
 * Personagem com faixa própria, pela chave do endereço dele.
 *
 * Quem está aqui manda na música da própria página, no lugar da faixa da
 * seção. Toca em laço, como todas: quem fica lendo a ficha inteira não
 * chega ao silêncio no meio da leitura.
 */
const TEMA_DE_PERSONAGEM: Record<string, Ambiente> = {
  "johnny-bling-bling": "johnny",
  "vrakyr-windrose": "vrakyr",
  "pyhmm-phylimm": "pyhmm",
};

/** A faixa que o tema cobre quando a da seção não existe. */
const RESERVA: Ambiente = "tema";

/**
 * O trecho que vale dentro de cada arquivo, em segundos.
 *
 * As faixas chegaram com sobra nas duas pontas: o tema tem dois segundos e
 * meio de nada antes da primeira nota, e todas morrem no fim, umas cortando
 * seco no silêncio e outras descendo num desvanecer. Tocadas de ponta a
 * ponta, a música entrava tarde ao abrir a página e o laço caía num buraco
 * de volume a cada volta.
 *
 * Em vez de reeditar os arquivos, o tocador entra no ponto certo e volta
 * antes do fim, na altura em que a faixa ainda está inteira. Medido janela a
 * janela na energia da onda, não no olho.
 */
const TRECHO: Partial<Record<Ambiente, { inicio: number; fim: number }>> = {
  tema: { inicio: 2.3, fim: 256.8 },
  johnny: { inicio: 0.2, fim: 233.3 },
  vrakyr: { inicio: 0.2, fim: 311.5 },
  pyhmm: { inicio: 0.55, fim: 130 },
};

/**
 * Música é fundo, não é o assunto.
 *
 * O teto é o que sai com o controle no máximo. O padrão de quem chega fica
 * bem abaixo dele: a música tem que caber embaixo da leitura, e quem quiser
 * ouvir mais alto empurra o controle para cima.
 */
const VOLUME_MAXIMO = 0.44;
export const VOLUME_PADRAO = 0.35;
/** O quanto sobra da música enquanto uma narração fala por cima. */
const FATOR_ABAFADO = 0.18;

/**
 * As rampas de volume, em segundos.
 *
 * A troca entre duas faixas pede tempo, para uma sair enquanto a outra
 * entra. A primeira faixa do dia não: ali não há nada de que se despedir,
 * e um segundo de rampa vira mais um segundo de espera para quem chegou.
 */
const TRANSICAO = 1.2;
const ENTRADA = 0.35;
const ABAFAMENTO = 0.4;

const CHAVE_VOLUME = "mitrael:volume";

type Faixa = { elemento: HTMLAudioElement; ganho: GainNode };

const cache = new Map<Ambiente, Faixa>();
const indisponivel = new Set<Ambiente>();

let contexto: AudioContext | null = null;
let atual: Ambiente | null = null;
let abafado = false;
let esperandoGesto = false;
let houveGesto = false;
let vigia: number | null = null;

/**
 * Qual faixa pertence a cada endereço do site.
 *
 * A ficha de um personagem com tema próprio ganha da faixa da seção. É o
 * caso mais específico, então vem primeiro.
 */
export function ambienteDaRota(caminho: string): Ambiente {
  const partes = caminho.split("/").filter(Boolean);

  if (partes[0] === "personagens") {
    const proprio = partes[1] ? TEMA_DE_PERSONAGEM[partes[1]] : undefined;
    if (proprio) return proprio;
    return "personagens";
  }

  if (partes[0] === "locais") return "locais";
  if (partes[0] === "eventos") return "eventos";
  return "tema";
}

/**
 * O quanto da música a pessoa pediu, de 0 a 1.
 *
 * No servidor devolve o padrão, para a página estática sair do build igual
 * à primeira renderização do navegador. Quem já mexeu no controle mantém a
 * escolha, e só ela: mudar o padrão daqui não mexe em preferência salva.
 */
export function fracaoDoVolume(): number {
  if (typeof window === "undefined") return VOLUME_PADRAO;
  const salvo = window.localStorage.getItem(CHAVE_VOLUME);
  if (salvo === null) return VOLUME_PADRAO;
  const numero = Number(salvo);
  if (!Number.isFinite(numero)) return VOLUME_PADRAO;
  return Math.min(1, Math.max(0, numero));
}

/** Move o volume na hora, sem rampa: o dedo está no controle agora. */
export function definirVolumeDaMusica(fracao: number) {
  if (typeof window === "undefined") return;
  const limpa = Math.min(1, Math.max(0, fracao));
  window.localStorage.setItem(CHAVE_VOLUME, String(limpa));

  if (!atual) return;
  const faixa = cache.get(atual);
  if (faixa && !faixa.elemento.paused) levar(faixa, volumeAlvo(), 0);
}

function volumeAlvo(): number {
  const base = fracaoDoVolume() * VOLUME_MAXIMO;
  return abafado ? base * FATOR_ABAFADO : base;
}

/**
 * Leva o ganho de uma faixa até o valor pedido, em rampa ou de uma vez.
 *
 * Cancela o que já estava agendado e refaz a partir do valor de agora, senão
 * duas rampas encavaladas brigam: quem troca de página no meio de uma
 * transição ouviria a música pular de altura.
 */
function levar(faixa: Faixa, para: number, segundos: number) {
  if (!contexto) return;
  const agora = contexto.currentTime;
  const ganho = faixa.ganho.gain;

  ganho.cancelScheduledValues(agora);
  ganho.setValueAtTime(ganho.value, agora);

  if (segundos <= 0) ganho.setValueAtTime(para, agora);
  else ganho.linearRampToValueAtTime(para, agora + segundos);
}

/**
 * Devolve a agulha ao começo do trecho antes de o fim da faixa entrar.
 *
 * O laço do próprio navegador continua ligado por baixo, como rede de
 * segurança: se este vigia falhar, a música ainda volta sozinha, só que
 * passando pela ponta que a gente queria evitar.
 */
function vigiarOLaco(faixa: Faixa, ambiente: Ambiente) {
  pararDeVigiar();

  const trecho = TRECHO[ambiente];
  if (!trecho) return;

  vigia = window.setInterval(() => {
    if (faixa.elemento.paused) return;
    if (faixa.elemento.currentTime >= trecho.fim) {
      faixa.elemento.currentTime = trecho.inicio;
    }
  }, 250);
}

function pararDeVigiar() {
  if (vigia !== null) {
    window.clearInterval(vigia);
    vigia = null;
  }
}

/**
 * Pula a abertura muda, mas só quando a faixa está começando do zero.
 *
 * Quem religou o som no meio da música volta de onde parou: aí a agulha já
 * está bem depois do ponto de entrada e não há nada a saltar.
 */
function saltarAAbertura(faixa: Faixa, ambiente: Ambiente) {
  const trecho = TRECHO[ambiente];
  if (!trecho) return;
  if (faixa.elemento.currentTime < trecho.inicio) {
    faixa.elemento.currentTime = trecho.inicio;
  }
}

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (contexto) return contexto;

  const Construtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Construtor) return null;

  contexto = new Construtor();
  return contexto;
}

/**
 * Monta uma faixa: o elemento de áudio e o controle de ganho por onde ela sai.
 *
 * O elemento existe porque faixa de cinco minutos não pode ser decodificada
 * inteira na memória: assim ela chega aos poucos, como um vídeo. E o ganho
 * existe porque, no iPhone, o volume de um elemento de áudio é só de leitura.
 * Mandar `elemento.volume = 0.3` lá não faz nada, e a régua do site ficava
 * enfeite, com a música presa no volume do aparelho. O ganho da Web Audio
 * obedece em todo lugar.
 */
function ligar(ambiente: Ambiente): Faixa | null {
  if (indisponivel.has(ambiente)) return null;

  const existente = cache.get(ambiente);
  if (existente) return existente;

  const ctx = obterContexto();
  if (!ctx) return null;

  const elemento = new Audio(ARQUIVOS[ambiente]);
  elemento.loop = true;
  elemento.preload = "auto";
  elemento.addEventListener("error", () => {
    // Arquivo ausente: risca esta faixa e cai no tema, em vez de emudecer
    indisponivel.add(ambiente);
    cache.delete(ambiente);
    elemento.pause();
    if (ambiente !== RESERVA && atual === ambiente) tocarAmbiente(ambiente);
  });

  const ganho = ctx.createGain();
  ganho.gain.value = 0;
  ctx.createMediaElementSource(elemento).connect(ganho);
  ganho.connect(ctx.destination);

  const faixa: Faixa = { elemento, ganho };
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

  const faixa = ligar(ambiente);
  if (!faixa) return;

  const anterior = atual;
  atual = ambiente;

  // O relógio da Web Audio só anda depois que alguém libera o som. Toda
  // rampa daqui para baixo depende disso, então vem primeiro.
  contexto?.resume();

  // A anterior só sai depois que a nova entra. Cortar antes deixaria um
  // buraco de silêncio na troca e, pior, mataria o tema à toa quando a
  // faixa pedida não existe: o arquivo ausente só se revela ao falhar.
  const havia = anterior !== null && anterior !== ambiente;
  if (havia) {
    const saindo = cache.get(anterior);
    if (saindo && !saindo.elemento.paused) {
      levar(saindo, 0, TRANSICAO);
      window.setTimeout(() => saindo.elemento.pause(), TRANSICAO * 1000);
    }
  }

  const entrar = () => {
    saltarAAbertura(faixa, ambiente);
    vigiarOLaco(faixa, ambiente);
    levar(faixa, volumeAlvo(), havia ? TRANSICAO : ENTRADA);
  };

  if (!faixa.elemento.paused) {
    entrar();
    return;
  }

  // A agulha só anda depois que a faixa toca: antes disso o elemento pode
  // nem ter os metadados, e o pedido se perde.
  faixa.elemento.play().then(entrar).catch(aguardarGesto);
}

/** Ao desligar o som: para onde estava, para voltar do mesmo ponto. */
export function pausarMusica() {
  pararDeVigiar();
  if (!atual) return;
  const faixa = cache.get(atual);
  if (!faixa || faixa.elemento.paused) return;

  levar(faixa, 0, TRANSICAO);
  window.setTimeout(() => faixa.elemento.pause(), TRANSICAO * 1000);
}

/** Ao ligar o som de novo: continua de onde parou. */
export function retomarMusica() {
  if (!atual) return;
  tocarAmbiente(atual);
}

/** Abaixa a música enquanto uma narração toca, e devolve o volume no fim. */
export function abafarMusica(abaixar: boolean) {
  abafado = abaixar;
  if (!atual) return;
  const faixa = cache.get(atual);
  if (!faixa || faixa.elemento.paused) return;
  levar(faixa, volumeAlvo(), ABAFAMENTO);
}
