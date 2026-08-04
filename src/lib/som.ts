import { Howl } from "howler";

/**
 * Efeitos sonoros do site.
 *
 * Três regras que valem sempre:
 * 1. O efeito responde ao gesto, sempre. Ele é o retorno de que o toque foi
 *    registrado, então não depende do botão de música: quem desliga a
 *    trilha continua ouvindo o pergaminho abrir.
 * 2. O efeito toca junto com o gesto, não depois dele. Ver ANDAMENTO.
 * 3. Se um arquivo de som não existir, o site funciona normalmente e em
 *    silêncio. O áudio é enfeite, nunca requisito.
 */

export type Efeito = "abrirMenu" | "fecharMenu" | "virarPagina" | "marcador";

const ARQUIVOS: Record<Efeito, string> = {
  abrirMenu: "/sons/pergaminho-abrir.mp3",
  fecharMenu: "/sons/pergaminho-fechar.mp3",
  virarPagina: "/sons/virar-pagina.mp3",
  marcador: "/sons/marcador.mp3",
};

const VOLUMES: Record<Efeito, number> = {
  abrirMenu: 0.35,
  fecharMenu: 0.3,
  virarPagina: 0.3,
  marcador: 0.25,
};

/**
 * Onde o som de verdade começa dentro de cada arquivo, em milissegundos.
 *
 * Os dois arquivos de pergaminho têm quase meio segundo de silêncio antes do
 * roçar do papel, e mais meio segundo de silêncio depois. Tocados do início,
 * o barulho chegava atrasado em relação ao gesto. Em vez de reeditar o áudio,
 * o tocador entra direto no ponto certo: o efeito sai junto com o toque.
 *
 * Medido janela a janela na energia da onda, não no olho.
 */
const ANDAMENTO: Partial<Record<Efeito, [inicio: number, duracao: number]>> = {
  abrirMenu: [460, 480],
  fecharMenu: [460, 480],
};

/** O nome do trecho dentro do arquivo, quando o efeito recorta um. */
const TRECHO = "toque";

const CHAVE = "mitrael:som";

const cache = new Map<Efeito, Howl>();
let disponivel: Partial<Record<Efeito, boolean>> = {};

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

function obter(efeito: Efeito): Howl | null {
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
 * Toca um efeito, se o arquivo existir.
 *
 * De propósito não consulta o botão de música: o efeito é a resposta ao
 * gesto da pessoa, e some junto com o gesto. Quem desliga a trilha está
 * dispensando o fundo musical, não o retorno do próprio toque.
 */
export function tocar(efeito: Efeito) {
  const som = obter(efeito);
  if (!som) return;

  if (som.state() === "unloaded") som.load();
  som.play(ANDAMENTO[efeito] ? TRECHO : undefined);
}

/** Deixa os efeitos prontos na memória, para o primeiro toque não atrasar. */
export function prepararEfeitos() {
  (Object.keys(ARQUIVOS) as Efeito[]).forEach((efeito) => {
    const som = obter(efeito);
    if (som && som.state() === "unloaded") som.load();
  });
}
