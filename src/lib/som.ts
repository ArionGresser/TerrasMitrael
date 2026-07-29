import { Howl } from "howler";

/**
 * Efeitos sonoros do site.
 *
 * Três regras que valem sempre:
 * 1. O som começa desligado. Ninguém é surpreendido por áudio.
 * 2. A escolha fica salva no navegador, então quem ligou uma vez não
 *    precisa ligar de novo a cada página.
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

const CHAVE = "mitrael:som";

const cache = new Map<Efeito, Howl>();
let disponivel: Partial<Record<Efeito, boolean>> = {};

export function somLigado(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CHAVE) === "ligado";
}

export function definirSom(ligado: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, ligado ? "ligado" : "desligado");
}

function obter(efeito: Efeito): Howl | null {
  if (disponivel[efeito] === false) return null;

  const existente = cache.get(efeito);
  if (existente) return existente;

  const som = new Howl({
    src: [ARQUIVOS[efeito]],
    volume: VOLUMES[efeito],
    preload: false,
    onloaderror: () => {
      // Arquivo ausente ou ilegível: desiste deste efeito em silêncio
      disponivel[efeito] = false;
      cache.delete(efeito);
    },
  });

  cache.set(efeito, som);
  return som;
}

/** Toca um efeito, se o som estiver ligado e o arquivo existir. */
export function tocar(efeito: Efeito) {
  if (!somLigado()) return;

  const som = obter(efeito);
  if (!som) return;

  if (som.state() === "unloaded") som.load();
  som.play();
}

/** Prepara os efeitos na memória, logo após alguém ligar o som. */
export function prepararEfeitos() {
  if (!somLigado()) return;
  (Object.keys(ARQUIVOS) as Efeito[]).forEach((efeito) => {
    const som = obter(efeito);
    if (som && som.state() === "unloaded") som.load();
  });
}
