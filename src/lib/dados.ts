/**
 * Os d20 da mesa: o de resina preta com ouro, que todo mundo tem, e os que
 * se liberam com as conquistas (ver src/lib/conquistas.ts).
 *
 * Cada estilo é só a receita da pintura: a cor da resina e da fumaça por
 * dentro, a tinta dos números e frisos (metal ou não) e, nos raros, um
 * brilho próprio. A pintura de verdade é feita em
 * src/lib/mesa3d/texturas.ts, e a escolha fica guardada no navegador.
 */

export type EstiloDeDado = {
  chave: string;
  nome: string;
  /** A resina: a cor de fundo e os tons da fumaça que corre por dentro. */
  fundo: string;
  fumaca: string[];
  /** A tinta dos números e frisos, do claro (em cima) ao escuro (embaixo). */
  tinta: [string, string, string];
  /** Tinta de metal reflete a sala; tinta comum é fosca. */
  metal: boolean;
  /** Os números acendem sozinhos, como brasa (só nos raros). */
  brilho?: string;
};

export const DADOS: EstiloDeDado[] = [
  { chave: "preto", nome: "Ônix e ouro", fundo: "#0b0a0d", fumaca: ["70,58,92", "54,50,58"], tinta: ["#fff1b8", "#e6bd55", "#8f6a1c"], metal: true },
  { chave: "osso", nome: "Osso velho", fundo: "#d8cbb0", fumaca: ["150,120,80", "200,185,150"], tinta: ["#4a2e1c", "#2a1a10", "#120a05"], metal: false },
  { chave: "esmeralda", nome: "Esmeralda", fundo: "#0c3a26", fumaca: ["40,160,100", "10,80,50"], tinta: ["#fff1b8", "#e6bd55", "#8f6a1c"], metal: true },
  { chave: "safira", nome: "Safira e prata", fundo: "#0e1f4a", fumaca: ["60,110,220", "20,50,120"], tinta: ["#ffffff", "#d4dbe6", "#7d8796"], metal: true },
  { chave: "rubi", nome: "Sangue de rubi", fundo: "#4a0710", fumaca: ["190,30,50", "110,10,25"], tinta: ["#ffffff", "#d4dbe6", "#7d8796"], metal: true },
  { chave: "ametista", nome: "Ametista arcana", fundo: "#2a0d45", fumaca: ["150,70,230", "80,30,140"], tinta: ["#fff1b8", "#e6bd55", "#8f6a1c"], metal: true },
  { chave: "magma", nome: "Coração de magma", fundo: "#100605", fumaca: ["160,40,10", "60,20,15"], tinta: ["#fff2a0", "#ff9a2a", "#c2410c"], metal: false, brilho: "#ff7a1a" },
];

export const DADO_PADRAO = "preto";
const CHAVE = "mitrael:dado";
export const EVENTO_DADO = "mitrael:dado";

export function dadoSalvo(): string {
  try {
    return localStorage.getItem(CHAVE) ?? DADO_PADRAO;
  } catch {
    return DADO_PADRAO;
  }
}

/** Guarda a escolha e avisa a mesa, que repinta o dado na hora. */
export function escolherDado(chave: string) {
  try {
    localStorage.setItem(CHAVE, chave);
  } catch {
    // Vale até fechar a aba
  }
  window.dispatchEvent(new CustomEvent(EVENTO_DADO, { detail: chave }));
}
