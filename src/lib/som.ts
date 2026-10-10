import { Howl } from "howler";
import { sintetizar, type Sintetizado } from "./sintese";

/**
 * Efeitos sonoros do site.
 *
 * Três regras que valem sempre:
 * 1. O efeito responde ao gesto. Ele é o retorno de que o toque foi
 *    registrado, então tem o próprio interruptor, separado da música: quem
 *    desliga a trilha continua ouvindo o pergaminho abrir, e quem quer
 *    silêncio total desliga os dois.
 * 2. O efeito toca junto com o gesto, não depois dele. Ver TRECHOS.
 * 3. Se um arquivo de som não existir, o site funciona normalmente e em
 *    silêncio. O áudio é enfeite, nunca requisito.
 *
 * E uma regra de gosto: cada coisa tem o seu som, sempre o mesmo. O mesmo
 * botão nunca soa de dois jeitos, senão o ouvido não aprende o site.
 *
 * Os sons de papel, couro, metal e moedas são do pacote RPG Audio, do
 * Kenney (kenney.nl). O rugido, o feitiço, a fechadura, a lâmina e a
 * batida na madeira são dos
 * pacotes "80 CC0 RPG SFX" e "80 CC0 creature SFX", de rubberduck
 * (opengameart.org). Todos em domínio público (CC0), cortados no começo do
 * som e igualados em volume ao pergaminho. Os sons que não existem no
 * mundo físico, como o zoom e o brilho mágico, são montados na hora: ver
 * `sintese.ts`. O "tiiim" das ferragens de ferro também é montado, mas uma
 * vez só, em arquivo: um ferro batido limpo não existia nos pacotes.
 */

export type DeArquivo =
  | "abrirMenu"
  | "fecharMenu"
  | "virarPagina"
  | "marcador"
  | "capa"
  | "aba"
  | "fivela"
  | "trinco"
  | "moedas"
  | "fechadura"
  | "lamina"
  | "feitico"
  | "rugido"
  | "madeira"
  | "metal";

export type Efeito = DeArquivo | Sintetizado;

const ARQUIVOS: Record<DeArquivo, string> = {
  abrirMenu: "/sons/pergaminho-abrir.mp3",
  fecharMenu: "/sons/pergaminho-fechar.mp3",
  virarPagina: "/sons/virar-pagina.m4a",
  marcador: "/sons/marcador.m4a",
  capa: "/sons/capa.m4a",
  aba: "/sons/aba.m4a",
  fivela: "/sons/fivela.m4a",
  trinco: "/sons/trinco.m4a",
  moedas: "/sons/moedas.m4a",
  fechadura: "/sons/fechadura.m4a",
  lamina: "/sons/lamina.m4a",
  feitico: "/sons/feitico.m4a",
  rugido: "/sons/rugido.m4a",
  madeira: "/sons/madeira.m4a",
  metal: "/sons/metal.m4a",
};

/** Os que o primeiro toque já pode pedir: vêm logo. Os outros, quando sobrar tempo. */
const ESSENCIAIS: DeArquivo[] = ["abrirMenu", "fecharMenu", "virarPagina", "marcador", "aba"];

const VOLUMES: Record<Efeito, number> = {
  abrirMenu: 0.6,
  fecharMenu: 0.55,
  virarPagina: 0.5,
  marcador: 0.4,
  capa: 0.6,
  aba: 0.45,
  fivela: 0.45,
  trinco: 0.5,
  moedas: 0.45,
  fechadura: 0.45,
  lamina: 0.4,
  feitico: 0.45,
  rugido: 0.45,
  madeira: 0.55,
  metal: 0.5,
  zoomPerto: 0.5,
  zoomLonge: 0.5,
  brilho: 0.6,
  divino: 0.7,
};

/**
 * Onde o som de verdade começa dentro de cada arquivo, em milissegundos.
 *
 * Os dois arquivos de pergaminho têm quase meio segundo de silêncio antes do
 * roçar do papel, e mais meio segundo de silêncio depois. Tocados do início,
 * o barulho chegava atrasado em relação ao gesto. Em vez de reeditar o áudio,
 * o tocador entra direto no ponto certo: o efeito sai junto com o toque.
 *
 * Medido janela a janela na energia da onda, não no olho. Os arquivos dos
 * pacotes CC0 já entraram cortados e não precisam disso.
 */
const ANDAMENTO: Partial<Record<DeArquivo, [inicio: number, duracao: number]>> = {
  abrirMenu: [460, 480],
  fecharMenu: [460, 480],
};

/** O nome do trecho dentro do arquivo, quando o efeito recorta um. */
const TRECHO = "toque";

/**
 * Para onde o efeito cai quando o arquivo dele não carrega.
 *
 * Em vez de a interface ficar muda, o efeito usa o vizinho mais parecido:
 * virar uma página e abrir um pergaminho são o mesmo roçar de papel.
 */
const RESERVA: Partial<Record<DeArquivo, DeArquivo>> = {
  virarPagina: "abrirMenu",
  marcador: "abrirMenu",
  capa: "virarPagina",
  aba: "virarPagina",
};

const SINTETIZADOS: Sintetizado[] = ["zoomPerto", "zoomLonge", "brilho", "divino"];
const ehSintetizado = (e: Efeito): e is Sintetizado => (SINTETIZADOS as Efeito[]).includes(e);

/**
 * O som de cada tela, pela tela de destino e por nada mais.
 *
 * Vale para a porta de entrada de cada parte: o link para o Bestiário ruge
 * sempre, de onde quer que se venha. Já abrir um monstro lá dentro é virar
 * uma página do livro: cem rugidos seguidos cansariam qualquer um.
 */
const TELAS: Record<string, Efeito> = {
  mapa: "abrirMenu",
  contos: "capa",
  personagens: "fivela",
  regras: "capa",
  classes: "lamina",
  magias: "feitico",
  itens: "brilho",
  monstros: "rugido",
  bau: "fechadura",
  conquistas: "moedas",
};

/** O brilho que abre a tela dos itens mágicos: o de um item raro. */
const NIVEL_DA_TELA_DE_ITENS = 3;

export function tocarDestino(caminho: string) {
  const partes = caminho.split("/").filter(Boolean);
  const efeito = partes.length === 1 ? TELAS[partes[0]] : undefined;
  if (!efeito) return tocar("virarPagina");
  tocar(efeito, efeito === "brilho" ? NIVEL_DA_TELA_DE_ITENS : undefined);
}

const CHAVE = "mitrael:som";
const CHAVE_EFEITOS = "mitrael:efeitos";

const cache = new Map<DeArquivo, Howl>();
const disponivel: Partial<Record<DeArquivo, boolean>> = {};

/**
 * No servidor devolve sempre `false`, porque a página estática precisa sair
 * do build igual à primeira renderização do navegador. Quem nunca mexeu no
 * botão conta como ligado: só "desligado" gravado desliga.
 */
export function somLigado(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CHAVE) !== "desligado";
}

export function definirSom(ligado: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, ligado ? "ligado" : "desligado");
}

/** Os efeitos, com a mesma regra da música: só "desligado" gravado desliga. */
export function efeitosLigados(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CHAVE_EFEITOS) !== "desligado";
  } catch {
    return true;
  }
}

export function definirEfeitos(ligados: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_EFEITOS, ligados ? "ligado" : "desligado");
  } catch {
    // Navegação privada: vale até fechar a aba
  }
}

function obter(efeito: DeArquivo): Howl | null {
  if (disponivel[efeito] === false) return null;

  const existente = cache.get(efeito);
  if (existente) return existente;

  const recorte = ANDAMENTO[efeito];

  const som = new Howl({
    src: [ARQUIVOS[efeito]],
    volume: VOLUMES[efeito],
    preload: false,
    ...(recorte ? { sprite: { [TRECHO]: recorte } } : {}),
    onloaderror: () => {
      // Arquivo ausente ou ilegível: desiste deste efeito em silêncio
      disponivel[efeito] = false;
      cache.delete(efeito);
    },
  });

  cache.set(efeito, som);
  return som;
}

/**
 * Toca um efeito, se os efeitos estiverem ligados e o arquivo existir.
 *
 * Não consulta o botão de música: quem desliga a trilha está dispensando o
 * fundo musical, não o retorno do próprio toque. Para isso há o interruptor
 * dos efeitos.
 *
 * `nivel` vale para o brilho mágico: de 1 (comum) a 5 (lendário).
 */
export function tocar(pedido: Efeito, nivel?: number) {
  if (!efeitosLigados()) return;

  if (ehSintetizado(pedido)) {
    sintetizar(pedido, VOLUMES[pedido], nivel);
    return;
  }

  const reserva = RESERVA[pedido];
  const efeito = disponivel[pedido] === false && reserva ? reserva : pedido;

  const som = obter(efeito);
  if (!som) return;

  if (som.state() === "unloaded") som.load();
  som.play(ANDAMENTO[efeito] ? TRECHO : undefined);
}

/**
 * Toca um efeito de arquivo com força e altura próprias, sem mexer no
 * padrão dele: o d20 quicando bate mais forte ou mais fraco conforme o
 * impacto, e um pouco mais agudo que a mão batendo na mesa, porque é menor.
 */
export function tocarComo(pedido: DeArquivo, { volume = 1, velocidade = 1 }: { volume?: number; velocidade?: number }) {
  if (!efeitosLigados()) return;
  const som = obter(pedido);
  if (!som) return;
  if (som.state() === "unloaded") som.load();
  const id = som.play(ANDAMENTO[pedido] ? TRECHO : undefined);
  som.volume(VOLUMES[pedido] * Math.min(1, Math.max(0, volume)), id);
  som.rate(velocidade, id);
}

/**
 * O sopro do zoom, uma vez por gesto.
 *
 * A rodinha do mouse e a pinça disparam dezenas de passos por segundo. O
 * sopro sai no primeiro e só volta depois de uma pausa no gesto, ou se a
 * direção virar: aproximar e já afastar são dois gestos.
 */
let ultimoZoom = 0;
let direcaoDoZoom = 0;
export function somDeZoom(perto: boolean) {
  const agora = performance.now();
  const direcao = perto ? 1 : -1;
  const pausa = agora - ultimoZoom > 380;
  ultimoZoom = agora;
  if (!pausa && direcao === direcaoDoZoom) return;
  direcaoDoZoom = direcao;
  tocar(perto ? "zoomPerto" : "zoomLonge");
}

/** O brilho de cada raridade: quantas notas sobem. */
export const NIVEL_DA_RARIDADE: Record<string, number> = {
  Comum: 1,
  Incomum: 2,
  Raro: 3,
  "Muito Raro": 4,
  Lendário: 5,
};

/**
 * Conexão em que vale baixar antes de pedir: computador (ou rede rápida
 * declarada) e sem economia de dados. No celular com 3G, cada megabyte
 * baixado à toa disputa a banda com o texto e as imagens da página.
 */
export function conexaoFolgada(): boolean {
  if (typeof window === "undefined") return false;
  const conexao = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conexao?.saveData) return false;
  if (conexao?.effectiveType) return conexao.effectiveType === "4g" && window.matchMedia("(pointer: fine)").matches;
  return window.matchMedia("(pointer: fine)").matches;
}

let houveToque = false;
let esperandoToque = false;

/** Monta os efeitos: os do dia a dia logo, os de cada seção quando sobrar tempo. */
function montarEfeitos() {
  const carregar = (efeito: DeArquivo) => {
    const som = obter(efeito);
    if (som && som.state() === "unloaded") som.load();
  };
  ESSENCIAIS.forEach(carregar);
  const resto = () =>
    (Object.keys(ARQUIVOS) as DeArquivo[]).filter((e) => !ESSENCIAIS.includes(e)).forEach(carregar);
  if ("requestIdleCallback" in window) window.requestIdleCallback(resto, { timeout: 5000 });
  else setTimeout(resto, 3000);
}

/**
 * Deixa os efeitos prontos, sem pesar na abertura da página.
 *
 * Antes do primeiro toque o navegador não deixa tocar som nenhum, então
 * até lá nada é montado. Montar o primeiro som acorda o motor de áudio do
 * navegador, e isso, feito ao abrir a página, travava o celular por mais
 * de um segundo (medido no 3G com processador de celular). Agora acontece
 * no primeiro toque, que é quando o som passa a ser possível.
 *
 * Em conexão folgada, os arquivos do dia a dia já vêm antes para o cache
 * do navegador, com prioridade baixa, para o primeiro som não esperar
 * download. Quem desligou os efeitos não baixa nada.
 */
export function prepararEfeitos() {
  if (typeof window === "undefined" || !efeitosLigados()) return;
  if (houveToque) return montarEfeitos();
  if (esperandoToque) return;
  esperandoToque = true;

  const GESTOS = ["pointerdown", "keydown", "touchstart"];
  const tocou = () => {
    for (const g of GESTOS) document.removeEventListener(g, tocou, true);
    houveToque = true;
    esperandoToque = false;
    if (efeitosLigados()) montarEfeitos();
  };
  for (const g of GESTOS) document.addEventListener(g, tocou, { capture: true, passive: true });

  if (!conexaoFolgada()) return;
  const adiantar = () => {
    if (houveToque) return;
    for (const efeito of ESSENCIAIS) fetch(ARQUIVOS[efeito], { priority: "low" } as RequestInit).catch(() => {});
  };
  const quandoOcioso = () =>
    "requestIdleCallback" in window ? window.requestIdleCallback(adiantar, { timeout: 4000 }) : setTimeout(adiantar, 2000);
  if (document.readyState === "complete") quandoOcioso();
  else window.addEventListener("load", quandoOcioso, { once: true });
}
