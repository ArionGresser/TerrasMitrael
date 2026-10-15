import { somLigado, conexaoFolgada } from "./som";

/**
 * A música de fundo, montada em cenas.
 *
 * Uma cena é uma música e, às vezes, camadas de ambiente por cima: o rio de
 * ácido embaixo da masmorra, o povo da cidade embaixo de Razavar, os grilos
 * e a coruja embaixo da noite. Cada seção do site tem a sua cena, e duas
 * páginas mudam de cena enquanto se lê: as Crônicas, a cada folha em que a
 * história muda de lugar (ver `Cena` no MDX e `cenaDaPagina`), e o mapa, ao
 * abrir um lugar.
 *
 * Trocar de cena não recomeça o que continua: da cidade para a noite, a
 * música do vilarejo segue de onde estava e só os grilos entram. O que sai,
 * sai devagar, e o que entra, entra devagar, para a troca passar sem
 * ninguém notar o corte.
 *
 * Vale o mesmo contrato dos efeitos: a escolha fica salva, e se um arquivo
 * não existir o site funciona em silêncio, sem erro.
 *
 * Três regras a mais, que só a música precisa:
 * 1. Nada é baixado por quem desligou o som, nem por quem está em conexão 2G
 *    ou com economia de dados ligada. Para os demais, a faixa da página
 *    começa a vir só depois que o site terminou de carregar, sem disputar
 *    banda com imagem nenhuma.
 * 2. A música abaixa sozinha enquanto uma narração toca. Sem isso ninguém
 *    entende a história do personagem por cima do fundo musical.
 * 3. Cena cuja música falta toca o tema. Enquanto faltarem arquivos, o site
 *    inteiro tem música, em vez de emudecer.
 *
 * O som sai por elementos de áudio comuns ligados a controles de ganho da
 * Web Audio. Ver `ligarVoz` para o motivo, que é o celular.
 */

// ---------- As camadas: cada arquivo que pode tocar ----------

type DadosDaCamada = {
  src: string;
  /** Música ou ambiente: cena sem nenhuma música de pé cai no tema. */
  tipo: "musica" | "ambiente";
  /**
   * O trecho que vale dentro do arquivo, em segundos. Só as faixas antigas
   * precisam: vêm com silêncio nas pontas. As novas já saem aparadas do
   * corte (scripts no histórico de 15/10/2026), e tocam de ponta a ponta.
   */
  trecho?: { inicio: number; fim: number };
  /**
   * Toca de vez em quando, e não sem parar: a coruja pia, some, pia de novo.
   * O intervalo entre um pio e outro, em segundos.
   */
  esporadico?: [number, number];
};

const CAMADAS = {
  // As faixas de cada seção. Medidas janela a janela na energia da onda:
  // `inicio` é onde a primeira nota entra, `fim` onde o último som morre
  tema: { src: "/musicas/tema.m4a", tipo: "musica", trecho: { inicio: 0.7, fim: 255.15 } },
  eventos: { src: "/musicas/eventos.m4a", tipo: "musica" },
  cronicas: { src: "/musicas/cronicas-tema.m4a", tipo: "musica", trecho: { inicio: 0.25, fim: 234.05 } },
  livro: { src: "/musicas/livro-tema.m4a", tipo: "musica", trecho: { inicio: 0.2, fim: 273.3 } },
  personagens: { src: "/musicas/personagens.m4a", tipo: "musica", trecho: { inicio: 0.5, fim: 254.0 } },
  johnny: { src: "/musicas/johnny-tema.m4a", tipo: "musica", trecho: { inicio: 0.2, fim: 233.3 } },
  vrakyr: { src: "/musicas/vrakyr-tema.m4a", tipo: "musica", trecho: { inicio: 0.2, fim: 313.6 } },
  pyhmm: { src: "/musicas/pyhmm-tema.m4a", tipo: "musica", trecho: { inicio: 0.55, fim: 131.3 } },
  egon: { src: "/musicas/egon-tema.m4a", tipo: "musica", trecho: { inicio: 1.3, fim: 191.7 } },
  // Flickering Shadows of Trees, com +6,8 dB para ficar no volume das outras
  lily: { src: "/musicas/lily-tema.m4a", tipo: "musica", trecho: { inicio: 0.1, fim: 103.3 } },

  // O mapa e cada lugar dele
  "local-mapa": { src: "/musicas/local-mapa.m4a", tipo: "musica" },
  "local-vernaculo": { src: "/musicas/local-vernaculo.m4a", tipo: "musica" },
  "local-razavar": { src: "/musicas/local-razavar.m4a", tipo: "musica" },
  "local-sovara-mithr": { src: "/musicas/local-sovara-mithr.m4a", tipo: "musica" },
  "local-arauto": { src: "/musicas/local-arauto.m4a", tipo: "musica" },
  "local-putrefados": { src: "/musicas/local-putrefados.m4a", tipo: "musica" },
  "local-askar": { src: "/musicas/local-askar.m4a", tipo: "musica" },

  // As cenas da Saga de Mitrael
  "cena-masmorra": { src: "/musicas/cena-masmorra.m4a", tipo: "musica" },
  "cena-estrada": { src: "/musicas/cena-estrada.m4a", tipo: "musica" },
  "cena-vilarejo": { src: "/musicas/cena-vilarejo.m4a", tipo: "musica" },
  "cena-taverna": { src: "/musicas/cena-taverna.m4a", tipo: "musica" },

  // A Grande Guerra Leviana
  "guerra-mar": { src: "/musicas/guerra-mar.m4a", tipo: "musica" },
  "guerra-batalha": { src: "/musicas/guerra-batalha.m4a", tipo: "musica" },

  // Os ambientes, que tocam por baixo da música
  "rio-acido": { src: "/sons/ambiente/rio-acido.m4a", tipo: "ambiente" },
  "rio-aberto": { src: "/sons/ambiente/rio-aberto.m4a", tipo: "ambiente" },
  grilos: { src: "/sons/ambiente/grilos.m4a", tipo: "ambiente" },
  coruja: { src: "/sons/ambiente/coruja.m4a", tipo: "ambiente", esporadico: [18, 40] },
  mar: { src: "/sons/ambiente/mar.m4a", tipo: "ambiente" },
  cidade: { src: "/sons/ambiente/cidade.m4a", tipo: "ambiente" },
  floresta: { src: "/sons/ambiente/floresta.m4a", tipo: "ambiente" },
  "taverna-gente": { src: "/sons/ambiente/taverna-gente.m4a", tipo: "ambiente" },
} satisfies Record<string, DadosDaCamada>;

type IdDaCamada = keyof typeof CAMADAS;

function dados(id: IdDaCamada): DadosDaCamada {
  return CAMADAS[id];
}

// ---------- As cenas: o que toca junto, e em que altura ----------

/** Uma camada dentro da cena, com a altura dela (1 é a da música). */
type Parte = { camada: IdDaCamada; volume: number };
const m = (camada: IdDaCamada, volume = 1): Parte => ({ camada, volume });

const CENAS = {
  tema: [m("tema")],
  eventos: [m("eventos")],
  cronicas: [m("cronicas")],
  livro: [m("livro")],
  personagens: [m("personagens")],
  johnny: [m("johnny")],
  vrakyr: [m("vrakyr")],
  pyhmm: [m("pyhmm")],
  egon: [m("egon")],
  lily: [m("lily")],

  // O mapa aberto, e cada lugar ao ser aberto nele
  mapa: [m("local-mapa")],
  "local-vernaculo": [m("local-vernaculo")],
  "local-razavar": [m("local-razavar", 0.85), m("cidade", 0.6)],
  "local-sovara-mithr": [m("local-sovara-mithr", 0.85), m("floresta", 0.55)],
  "local-arauto": [m("local-arauto")],
  "local-putrefados": [m("local-putrefados")],
  "local-askar": [m("local-askar")],

  // A Saga de Mitrael, cena a cena
  /** O calabouço e a mina de Varek, à beira do rio de ácido. */
  masmorra: [m("cena-masmorra"), m("rio-acido", 0.3)],
  /** A saída da mina, o vale e a descida até o vilarejo. */
  estrada: [m("cena-estrada"), m("rio-aberto", 0.4)],
  /** Na estrada, longe de rio: a viagem de um lugar a outro. */
  viagem: [m("cena-estrada")],
  /** Andando pelo vilarejo e pelos arredores, de dia. */
  vilarejo: [m("cena-vilarejo")],
  /** Dentro de uma taverna vazia ou calma. */
  taverna: [m("cena-taverna")],
  /** A taverna cheia de gente: a mesma música, com o burburinho por baixo. */
  "taverna-cheia": [m("cena-taverna", 0.9), m("taverna-gente", 0.5)],
  /** A noite lá fora: a mesma música do vilarejo, com os bichos da noite. */
  noite: [m("cena-vilarejo", 0.85), m("grilos", 0.28), m("coruja", 0.4)],

  // A Grande Guerra Leviana
  /** No mar, antes do ataque, e no fim, depois da guerra. */
  "guerra-mar": [m("guerra-mar"), m("mar", 0.55)],
  "guerra-batalha": [m("guerra-batalha")],
} satisfies Record<string, Parte[]>;

export type Ambiente = keyof typeof CENAS;

/** A cena que o tema cobre quando a música de outra falta. */
const RESERVA: Ambiente = "tema";

export function ehCena(nome: string): nome is Ambiente {
  return nome in CENAS;
}

// ---------- As rotas ----------

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
  "egon-vitriol": "egon",
  "lily-bouvardia": "lily",
};

/**
 * A primeira cena de cada texto com cenas, para a música certa já começar
 * no clique do link, antes de o livro medir as páginas e dizer onde está.
 */
const CENA_DE_ABERTURA: Record<string, Ambiente> = {
  "/contos/cronicas/temporada-2/episodio-1": "masmorra",
  "/contos/cronicas/temporada-2/episodio-2": "masmorra",
  "/contos/cronicas/temporada-2/episodio-3": "estrada",
  "/contos/cronicas/temporada-2/episodio-4": "taverna",
  "/contos/cronicas/temporada-2/episodio-5": "vilarejo",
  "/contos/cronicas/temporada-2/episodio-6": "taverna",
  "/contos/cronicas/temporada-2/episodio-7": "vilarejo",
  "/eventos/guerra-leviana": "guerra-mar",
};

/** Os endereços do Livro do Aventureiro: a capa e cada capítulo dele. */
const CAPITULOS_DO_LIVRO = new Set(["regras", "classes", "especies", "magias", "itens", "monstros", "bau"]);

const semBarraFinal = (caminho: string) => (caminho.length > 1 ? caminho.replace(/\/+$/, "") : caminho);

/**
 * Qual cena pertence a cada endereço do site.
 *
 * A ficha de um personagem com tema próprio ganha da faixa da seção. É o
 * caso mais específico, então vem primeiro.
 */
export function ambienteDaRota(caminho: string): Ambiente {
  const limpo = semBarraFinal(caminho);
  const abertura = CENA_DE_ABERTURA[limpo];
  if (abertura) return abertura;

  const partes = limpo.split("/").filter(Boolean);

  if (partes[0] === "personagens") {
    const proprio = partes[1] ? TEMA_DE_PERSONAGEM[partes[1]] : undefined;
    if (proprio) return proprio;
    return "personagens";
  }

  if (partes[0] === "mapa") return "mapa";
  if (partes[0] === "eventos") return "eventos";
  if (partes[0] === "contos") return "cronicas";
  // Os mesmos endereços do `inclui` do Livro em navegacao.ts
  if (partes[0] && CAPITULOS_DO_LIVRO.has(partes[0])) return "livro";
  return "tema";
}

// ---------- Volume ----------

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
 * As rampas, em segundos.
 *
 * Trocar de cena é lento de propósito: é a página do livro virando, e a
 * música do lugar novo vem chegando enquanto a do anterior vai embora. A
 * primeira faixa do dia não: ali não há nada de que se despedir, e cada
 * segundo de rampa vira mais um segundo de espera para quem chegou.
 */
const TROCA_DE_CENA = 3;
const ENTRADA = 0.35;
const ABAFAMENTO = 0.4;
/** O vídeo de apresentação cala a música: sai em quase um segundo e volta com calma. */
const SAIDA_PARA_O_VIDEO = 0.8;
const VOLTA_DO_VIDEO = 1.6;

/**
 * Quanto tempo o fim de uma volta e o começo da seguinte tocam juntos.
 * Ambiente curto (o rio de cinco segundos) cruza rápido, senão passaria
 * metade do tempo cruzando.
 */
function cruzamento(id: IdDaCamada, duracao: number): number {
  if (duracao < 20) return Math.min(1.2, duracao / 4);
  return dados(id).tipo === "musica" ? 4 : 3;
}

const CHAVE_VOLUME = "mitrael:volume";

let contexto: AudioContext | null = null;
/** O ganho geral: o controle de volume, a narração e o vídeo mandam aqui. */
let geral: GainNode | null = null;
let atual: Ambiente | null = null;
let abafado = false;
/** Calada de vez, enquanto um vídeo do site toca. */
let calado = false;
let esperandoGesto = false;
let houveGesto = false;

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
  if (geral) levar(geral, volumeGeral(), 0);
}

function volumeGeral(): number {
  if (calado) return 0;
  const base = fracaoDoVolume() * VOLUME_MAXIMO;
  return abafado ? base * FATOR_ABAFADO : base;
}

/**
 * Leva um ganho até o valor pedido, em rampa ou de uma vez.
 *
 * Cancela o que já estava agendado e refaz a partir do valor de agora, senão
 * duas rampas encavaladas brigam: quem troca de página no meio de uma
 * transição ouviria a música pular de altura.
 */
function levar(no: GainNode, para: number, segundos: number) {
  if (!contexto) return;
  const agora = contexto.currentTime;
  const ganho = no.gain;
  ganho.cancelScheduledValues(agora);
  ganho.setValueAtTime(ganho.value, agora);
  if (segundos <= 0) ganho.setValueAtTime(para, agora);
  else ganho.linearRampToValueAtTime(para, agora + segundos);
}

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (contexto) return contexto;

  const Construtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Construtor) return null;

  contexto = new Construtor();
  geral = contexto.createGain();
  geral.gain.value = volumeGeral();
  geral.connect(contexto.destination);
  return contexto;
}

// ---------- As camadas tocando ----------

/** Um elemento de áudio e o ganho dele. Cada camada tem até dois, para cruzar a volta. */
type Voz = { elemento: HTMLAudioElement; ganho: GainNode };

type Camada = {
  id: IdDaCamada;
  /** O ganho da camada na cena: é ele que sobe e desce na troca de cena. */
  ganho: GainNode;
  vozes: Voz[];
  /** Qual das vozes é a que está valendo. */
  ativa: number;
  /** A volta está cruzando agora: a outra voz já entrou. */
  cruzando: boolean;
  /** Na cena de agora: se não, está saindo, e pausa quando a rampa acabar. */
  presente: boolean;
  /** O próximo pio, para quem é esporádico. */
  proximo: number | null;
};

const camadas = new Map<IdDaCamada, Camada>();
/** Elementos já baixando antes do primeiro toque, ainda sem saída de som. */
const aquecidas = new Map<IdDaCamada, HTMLAudioElement>();
const indisponivel = new Set<IdDaCamada>();
let vigia: number | null = null;

function criarElemento(id: IdDaCamada): HTMLAudioElement {
  const elemento = new Audio();
  const d = dados(id);
  // O laço do próprio navegador fica ligado como rede de segurança: se o
  // vigia falhar, a música ainda volta sozinha, só que sem o cruzamento
  elemento.loop = !d.esporadico;
  elemento.preload = "auto";
  elemento.addEventListener("error", () => {
    // Arquivo ausente: risca esta camada e refaz a cena sem ela
    indisponivel.add(id);
    const camada = camadas.get(id);
    camada?.vozes.forEach((v) => v.elemento.pause());
    camadas.delete(id);
    aquecidas.delete(id);
    if (atual) tocarAmbiente(atual);
  });
  elemento.src = d.src;
  // Já nasce apontando para depois da abertura muda
  if (d.trecho) elemento.currentTime = d.trecho.inicio;
  return elemento;
}

/**
 * Liga um elemento à saída pela Web Audio.
 *
 * O elemento existe porque faixa de cinco minutos não pode ser decodificada
 * inteira na memória: assim ela chega aos poucos, como um vídeo. E o ganho
 * existe porque, no iPhone, o volume de um elemento de áudio é só de leitura.
 * Mandar `elemento.volume = 0.3` lá não faz nada, e a régua do site ficava
 * enfeite, com a música presa no volume do aparelho. O ganho da Web Audio
 * obedece em todo lugar.
 */
function ligarVoz(elemento: HTMLAudioElement, saida: GainNode, inicial: number): Voz | null {
  const ctx = obterContexto();
  if (!ctx) return null;
  const ganho = ctx.createGain();
  ganho.gain.value = inicial;
  ctx.createMediaElementSource(elemento).connect(ganho);
  ganho.connect(saida);
  return { elemento, ganho };
}

function ligar(id: IdDaCamada): Camada | null {
  if (indisponivel.has(id)) return null;
  const existente = camadas.get(id);
  if (existente) return existente;

  const ctx = obterContexto();
  if (!ctx || !geral) return null;

  const ganho = ctx.createGain();
  ganho.gain.value = 0;
  ganho.connect(geral);

  const elemento = aquecidas.get(id) ?? criarElemento(id);
  aquecidas.delete(id);
  const voz = ligarVoz(elemento, ganho, 1);
  if (!voz) return null;

  const camada: Camada = { id, ganho, vozes: [voz], ativa: 0, cruzando: false, presente: false, proximo: null };
  camadas.set(id, camada);
  return camada;
}

/** Onde a volta começa e onde ela termina, com o arquivo já carregado. */
function limites(id: IdDaCamada, elemento: HTMLAudioElement): { inicio: number; fim: number } | null {
  const t = dados(id).trecho;
  if (t) return t;
  const duracao = elemento.duration;
  if (!Number.isFinite(duracao) || duracao <= 0) return null;
  return { inicio: 0, fim: duracao };
}

/**
 * A volta cruzada: perto do fim, uma segunda cópia da faixa começa do
 * início enquanto a primeira vai sumindo. Sem isso, a volta era um corte
 * seco (ou um buraco de silêncio, nas que terminam em silêncio), e com
 * ambiente curto como o rio, um corte a cada cinco segundos.
 */
function cruzarVolta(camada: Camada) {
  const atualVoz = camada.vozes[camada.ativa];
  const lim = limites(camada.id, atualVoz.elemento);
  if (!lim || camada.cruzando) return;
  const cruza = cruzamento(camada.id, lim.fim - lim.inicio);
  if (atualVoz.elemento.currentTime < lim.fim - cruza) return;

  let outra = camada.vozes[1 - camada.ativa];
  if (!outra) {
    const nova = ligarVoz(criarElemento(camada.id), camada.ganho, 0);
    if (!nova) return;
    camada.vozes.push(nova);
    outra = nova;
  }
  camada.cruzando = true;
  outra.elemento.currentTime = lim.inicio;
  levar(outra.ganho, 0, 0);
  outra.elemento
    .play()
    .then(() => {
      levar(outra.ganho, 1, cruza);
      levar(atualVoz.ganho, 0, cruza);
      window.setTimeout(() => {
        atualVoz.elemento.pause();
        atualVoz.elemento.currentTime = lim.inicio;
        camada.ativa = camada.vozes.indexOf(outra);
        camada.cruzando = false;
      }, cruza * 1000 + 50);
    })
    .catch(() => {
      camada.cruzando = false;
    });
}

/** Os pios da coruja: um de cada vez, em intervalos que não se repetem. */
function piar(camada: Camada) {
  const intervalo = dados(camada.id).esporadico;
  if (!intervalo || !camada.presente) return;
  const agora = performance.now();
  if (camada.proximo === null) {
    camada.proximo = agora + 1000 * (intervalo[0] / 2 + Math.random() * intervalo[0]);
    return;
  }
  if (agora < camada.proximo) return;
  const voz = camada.vozes[0];
  voz.elemento.currentTime = 0;
  voz.elemento.play().catch(() => {});
  camada.proximo = agora + 1000 * (intervalo[0] + Math.random() * (intervalo[1] - intervalo[0]));
}

/** Um só relógio para todas as camadas: confere a volta de cada uma. */
function vigiar() {
  if (vigia !== null) return;
  vigia = window.setInterval(() => {
    let alguma = false;
    for (const camada of camadas.values()) {
      if (!camada.presente) continue;
      alguma = true;
      if (dados(camada.id).esporadico) piar(camada);
      else if (!camada.vozes[camada.ativa].elemento.paused) cruzarVolta(camada);
    }
    if (!alguma) pararDeVigiar();
  }, 200);
}

function pararDeVigiar() {
  if (vigia !== null) {
    window.clearInterval(vigia);
    vigia = null;
  }
}

/** Começa a camada (ou continua de onde estava). Esporádica só "toca" no relógio. */
function soar(camada: Camada): Promise<void> {
  if (dados(camada.id).esporadico) return Promise.resolve();
  const voz = camada.vozes[camada.ativa];
  if (!voz.elemento.paused) return Promise.resolve();
  return voz.elemento.play();
}

function silenciar(camada: Camada) {
  camada.vozes.forEach((v) => v.elemento.pause());
  camada.proximo = null;
}

// ---------- A cena da página ----------

/**
 * A cena que a própria página pediu, valendo só no endereço em que foi
 * pedida. Guardar o endereço junto deixa a ordem dos efeitos do React sem
 * importância: o livro pode avisar antes ou depois de a rota trocar.
 */
let pedidoDaPagina: { caminho: string; cena: Ambiente } | null = null;
let rotaAtual = "";

/**
 * O livro diz em que cena a leitura está, e o mapa diz que lugar está
 * aberto. Com `null`, volta a cena da seção.
 */
export function cenaDaPagina(cena: Ambiente | null) {
  if (typeof window === "undefined") return;
  const caminho = semBarraFinal(window.location.pathname);
  pedidoDaPagina = cena ? { caminho, cena } : null;
  if (semBarraFinal(rotaAtual) === caminho) tocarAmbiente(cenaPedida());
}

function cenaPedida(): Ambiente {
  const caminho = semBarraFinal(rotaAtual);
  if (pedidoDaPagina && pedidoDaPagina.caminho === caminho) return pedidoDaPagina.cena;
  return ambienteDaRota(caminho);
}

/** Chamado a cada troca de endereço: toca a cena dele, ou a que a página já tinha pedido. */
export function tocarRota(caminho: string) {
  rotaAtual = caminho;
  tocarAmbiente(cenaPedida());
}

/** As partes da cena que podem tocar; sem nenhuma música de pé, o tema. */
function resolver(cena: Ambiente): Parte[] {
  const partes = (CENAS[cena] as Parte[]).filter((p) => !indisponivel.has(p.camada));
  if (partes.some((p) => dados(p.camada).tipo === "musica")) return partes;
  return cena === RESERVA ? partes : resolver(RESERVA);
}

// ---------- Antes do primeiro toque ----------

/**
 * Começa a baixar a música da cena antes do primeiro toque.
 *
 * O navegador não deixa tocar antes disso, mas deixa baixar. Sem isto, o
 * primeiro toque disparava o download do zero e a música chegava segundos
 * depois. Espera o site terminar de carregar e o navegador ficar ocioso,
 * para nunca atrasar texto ou imagem, e só acontece em conexão folgada.
 * Só a música: os ambientes são pequenos e chegam a tempo.
 */
function preaquecer(cena: Ambiente) {
  if (typeof window === "undefined" || !conexaoFolgada()) return;
  const musica = resolver(cena).find((p) => dados(p.camada).tipo === "musica");
  if (!musica) return;
  const id = musica.camada;
  if (camadas.has(id) || aquecidas.has(id)) return;

  const agir = () => {
    if (houveGesto || atual !== cena || !somLigado()) return;
    if (aquecidas.has(id) || camadas.has(id)) return;
    aquecidas.set(id, criarElemento(id));
  };
  const quandoOcioso = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(agir, { timeout: 3000 });
    else setTimeout(agir, 1500);
  };
  if (document.readyState === "complete") quandoOcioso();
  else window.addEventListener("load", quandoOcioso, { once: true });
}

/**
 * Os eventos que o navegador aceita como "a pessoa pediu som".
 *
 * No celular o que vale é o dedo soltando a tela, e não encostando. Esperar
 * só o encostar fazia o primeiro toque ser ignorado, e a música dependia
 * de um segundo toque que ninguém sabia que precisava dar.
 */
const GESTOS = ["pointerdown", "pointerup", "touchend", "click", "keydown"];

/**
 * Depois de recarregar a página, o navegador proíbe qualquer som que a
 * pessoa não tenha pedido naquele carregamento. É regra do navegador, não
 * dá para contornar. O que dá é voltar assim que ela tocar em qualquer coisa.
 */
function aguardarGesto() {
  if (esperandoGesto || typeof window === "undefined") return;
  esperandoGesto = true;

  const retomar = (evento: Event) => {
    // Encostar o dedo não libera som, só soltar. O clique do mouse, sim.
    if (evento.type === "pointerdown" && (evento as PointerEvent).pointerType !== "mouse") return;
    if (evento.type === "keydown" && (evento as KeyboardEvent).key === "Escape") return;

    esperandoGesto = false;
    houveGesto = true;
    for (const gesto of GESTOS) document.removeEventListener(gesto, retomar, true);
    if (atual) tocarAmbiente(atual);
  };

  for (const gesto of GESTOS) document.addEventListener(gesto, retomar, true);
}

// ---------- Tocar uma cena ----------

/** A volta de cada troca: a mais nova ganha, e as antigas param no meio. */
let troca = 0;

/**
 * Entra numa cena, saindo da anterior sem buraco.
 *
 * O que já estava tocando segue até o que é novo soar de verdade, e só
 * então os dois se cruzam. Já foi diferente: a faixa anterior saía na hora
 * do clique, e a nova ainda estava baixando. O resultado era silêncio ao
 * abrir um personagem, e no iPhone às vezes silêncio até o próximo toque.
 * O que continua de uma cena para a outra só muda de altura, sem recomeçar.
 */
export function tocarAmbiente(pedido: Ambiente) {
  if (!somLigado()) {
    atual = pedido;
    return;
  }

  // Antes do primeiro toque o navegador não deixa tocar. Deixa baixar,
  // e é o que se faz enquanto isso, se a conexão permitir.
  if (!houveGesto) {
    atual = pedido;
    preaquecer(pedido);
    aguardarGesto();
    return;
  }

  const partes = resolver(pedido);
  const ctx = obterContexto();
  if (!ctx || !geral) return;
  // O relógio da Web Audio só anda depois que alguém libera o som. Toda
  // rampa daqui para baixo depende disso, então vem primeiro.
  ctx.resume();
  levar(geral, volumeGeral(), 0);

  const mesma = atual === pedido && partes.every((p) => camadas.get(p.camada)?.presente);
  atual = pedido;
  if (mesma) {
    // Religou o som, ou voltou de uma rampa de saída: só garante que soa
    for (const p of partes) {
      const c = camadas.get(p.camada);
      if (c) soar(c).then(() => levar(c.ganho, p.volume, ENTRADA)).catch(aguardarGesto);
    }
    vigiar();
    return;
  }

  const minha = ++troca;
  const ligadas = partes
    .map((p) => ({ p, c: ligar(p.camada) }))
    .filter((x): x is { p: Parte; c: Camada } => x.c !== null);
  const ficam = new Set(ligadas.map((x) => x.c));
  const haviaOutra = [...camadas.values()].some((c) => c.presente);

  const entrar = () => {
    // Quem virou a página de novo enquanto esta baixava não quer mais ela
    if (minha !== troca) return;
    const rampa = haviaOutra ? TROCA_DE_CENA : ENTRADA;
    for (const { p, c } of ligadas) {
      c.presente = true;
      levar(c.ganho, p.volume, rampa);
    }
    for (const c of camadas.values()) {
      if (ficam.has(c) || !c.presente) continue;
      c.presente = false;
      levar(c.ganho, 0, rampa);
      window.setTimeout(() => {
        // Voltou a ser pedida durante a rampa: fica
        if (!c.presente) silenciar(c);
      }, rampa * 1000 + 100);
    }
    vigiar();
  };

  // Espera tudo o que é novo soar de verdade. Ambiente que demora não
  // segura a música: depois de quatro segundos, a cena entra assim mesmo.
  const novas = ligadas.filter(({ c }) => !c.presente).map(({ c }) => soar(c));
  const espera = new Promise<void>((r) => window.setTimeout(r, 4000));
  Promise.race([Promise.allSettled(novas).then(() => undefined), espera]).then(() => {
    Promise.allSettled(novas).then((r) => {
      if (r.some((x) => x.status === "rejected") && minha === troca) aguardarGesto();
    });
    entrar();
  });
}

/** Se esta camada é parte do que deveria estar soando agora. */
function naCenaAtual(id: IdDaCamada): boolean {
  return atual !== null && resolver(atual).some((p) => p.camada === id);
}

/**
 * Chamado no clique de um link interno, antes de a página trocar.
 *
 * O clique é um gesto da pessoa, e é nele que o navegador mais confia para
 * liberar som, em especial no iPhone. A música do destino começa ali mesmo,
 * em volume zero, e já vem baixando enquanto a página nova monta. Quando
 * ela abre, a música está pronta para entrar.
 */
export function anteciparRota(caminho: string) {
  if (!houveGesto || !somLigado()) return;
  const cena = ambienteDaRota(caminho);
  if (cena === atual) return;

  contexto?.resume();
  for (const p of resolver(cena)) {
    if (dados(p.camada).esporadico) continue;
    const c = ligar(p.camada);
    if (!c || c.presente) continue;
    const voz = c.vozes[c.ativa];
    if (!voz.elemento.paused) continue;
    levar(c.ganho, 0, 0);
    voz.elemento.play().catch(() => {});
    // Clique que não virou troca de página: devolve o silêncio que pegou
    window.setTimeout(() => {
      if (!c.presente && !naCenaAtual(p.camada)) silenciar(c);
    }, 5000);
  }
}

/** Ao desligar o som: para onde estava, para voltar do mesmo ponto. */
export function pausarMusica() {
  if (!geral) return;
  levar(geral, 0, 1.2);
  window.setTimeout(() => {
    // Religou antes de a rampa acabar: a música fica
    if (somLigado()) return;
    pararDeVigiar();
    for (const c of camadas.values()) {
      c.presente = false;
      silenciar(c);
      if (contexto) levar(c.ganho, 0, 0);
    }
  }, 1200);
}

/** Ao ligar o som de novo: continua de onde parou. */
export function retomarMusica() {
  if (!atual) return;
  tocarAmbiente(atual);
}

/** Abaixa a música enquanto uma narração toca, e devolve o volume no fim. */
export function abafarMusica(abaixar: boolean) {
  abafado = abaixar;
  if (geral) levar(geral, volumeGeral(), ABAFAMENTO);
}

/**
 * Cala a música enquanto um vídeo do site toca, e devolve quando ele pausa
 * ou acaba. Diferente da narração, aqui ela some de vez: o vídeo tem a
 * trilha dele, e duas músicas juntas viram barulho. As camadas seguem
 * tocando em silêncio, então voltam do ponto em que estariam.
 */
export function calarMusica(calar: boolean) {
  if (calado === calar) return;
  calado = calar;
  if (geral) levar(geral, volumeGeral(), calar ? SAIDA_PARA_O_VIDEO : VOLTA_DO_VIDEO);
}
