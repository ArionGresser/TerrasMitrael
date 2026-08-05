import { Howl } from "howler";
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
 * 3. Seção sem faixa própria toca o tema. Enquanto só existir tema.m4a, o
 *    site inteiro tem música, em vez de emudecer em três de quatro seções.
 */

export type Ambiente =
  | "tema"
  | "locais"
  | "eventos"
  | "personagens"
  | "johnny";

const ARQUIVOS: Record<Ambiente, string> = {
  tema: "/musicas/tema.m4a",
  locais: "/musicas/locais.m4a",
  eventos: "/musicas/eventos.m4a",
  personagens: "/musicas/personagens.m4a",
  johnny: "/musicas/johnny-tema.m4a",
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
};

/** A faixa que o tema cobre quando a da seção não existe. */
const RESERVA: Ambiente = "tema";

/**
 * O trecho que vale dentro de cada arquivo, em segundos.
 *
 * As faixas chegaram com silêncio nas duas pontas: o tema tem dois segundos
 * e meio de nada antes da primeira nota, e quase todas terminam em silêncio
 * também. Tocadas de ponta a ponta, a música entrava tarde ao abrir a página
 * e o laço passava por quatro segundos de vazio a cada volta.
 *
 * Em vez de reeditar os arquivos, o tocador entra no ponto certo e volta
 * antes do fim. Medido janela a janela na energia da onda, não no olho.
 */
const TRECHO: Partial<Record<Ambiente, { inicio: number; fim: number }>> = {
  tema: { inicio: 2.3, fim: 256.8 },
  johnny: { inicio: 0.2, fim: 233.3 },
};

/**
 * Música é fundo, não é o assunto.
 *
 * O teto é o que sai com o controle no máximo. O padrão de quem chega é a
 * metade dele, que é a altura que já estava boa antes de existir controle.
 */
const VOLUME_MAXIMO = 0.44;
const FRACAO_PADRAO = 0.5;
/** O quanto sobra da música enquanto uma narração fala por cima. */
const FATOR_ABAFADO = 0.18;

/**
 * A troca entre duas faixas pede tempo, para uma sair enquanto a outra
 * entra. A primeira faixa do dia não: ali não há nada de que se despedir,
 * e um segundo de rampa vira mais um segundo de espera para quem chegou.
 */
const TRANSICAO = 1200;
const ENTRADA = 350;

const CHAVE_VOLUME = "mitrael:volume";

const cache = new Map<Ambiente, Howl>();
const indisponivel = new Set<Ambiente>();

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
 * à primeira renderização do navegador. Quem nunca mexeu no controle fica
 * na metade.
 */
export function fracaoDoVolume(): number {
  if (typeof window === "undefined") return FRACAO_PADRAO;
  const salvo = window.localStorage.getItem(CHAVE_VOLUME);
  if (salvo === null) return FRACAO_PADRAO;
  const numero = Number(salvo);
  if (!Number.isFinite(numero)) return FRACAO_PADRAO;
  return Math.min(1, Math.max(0, numero));
}

/** Move o volume na hora, sem transição: o dedo está no controle agora. */
export function definirVolumeDaMusica(fracao: number) {
  if (typeof window === "undefined") return;
  const limpa = Math.min(1, Math.max(0, fracao));
  window.localStorage.setItem(CHAVE_VOLUME, String(limpa));

  if (!atual) return;
  const faixa = cache.get(atual);
  if (faixa?.playing()) faixa.volume(volumeAlvo());
}

function volumeAlvo(): number {
  const base = fracaoDoVolume() * VOLUME_MAXIMO;
  return abafado ? base * FATOR_ABAFADO : base;
}

/**
 * Devolve a agulha ao começo do trecho antes de o silêncio do fim entrar.
 *
 * O laço do próprio navegador continua ligado por baixo, como rede de
 * segurança: se este vigia falhar, a música ainda volta sozinha, só que
 * passando pelo silêncio.
 */
function vigiarOLaco(faixa: Howl, ambiente: Ambiente) {
  pararDeVigiar();

  const trecho = TRECHO[ambiente];
  if (!trecho) return;

  vigia = window.setInterval(() => {
    if (!faixa.playing()) return;
    if ((faixa.seek() as number) >= trecho.fim) faixa.seek(trecho.inicio);
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
function saltarAAbertura(faixa: Howl, ambiente: Ambiente) {
  const trecho = TRECHO[ambiente];
  if (!trecho) return;
  if ((faixa.seek() as number) < trecho.inicio) faixa.seek(trecho.inicio);
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
  //
  // Já tentamos adiantar o download aqui, e não dá: o Howler destrava o
  // áudio do navegador no primeiro gesto, tocando um silêncio nos elementos
  // que ainda estão na reserva dele. Um elemento criado antes disso fica
  // fora da destravada, e a reprodução é recusada depois. O ganho também
  // seria pequeno: as faixas são transmitidas aos poucos, não baixadas
  // inteiras antes de tocar.
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
    const havia = anterior && anterior !== ambiente;

    if (havia) {
      const saindo = cache.get(anterior!);
      if (saindo?.playing()) {
        desvanecer(saindo, 0, () => saindo.stop());
      }
    }

    faixa.fade(
      faixa.volume() as number,
      volumeAlvo(),
      havia ? TRANSICAO : ENTRADA
    );
  };

  if (faixa.playing()) {
    trocar();
    return;
  }

  // O volume tem que subir depois que a faixa começa de verdade. Pedir o
  // fade antes disso deixa a ordem parada numa fila interna do Howler que
  // só esvazia com a reprodução: a música tocava, mas muda, no volume zero
  // com que nasce. A faixa já é criada em zero, então não há o que zerar.
  //
  // A agulha também só anda depois que a faixa toca: antes disso o elemento
  // de áudio pode nem ter os metadados, e o pedido se perde.
  faixa.once("play", () => {
    saltarAAbertura(faixa, ambiente);
    vigiarOLaco(faixa, ambiente);
    trocar();
  });
  faixa.play();
}

/** Ao desligar o som: para onde estava, para voltar do mesmo ponto. */
export function pausarMusica() {
  pararDeVigiar();
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
