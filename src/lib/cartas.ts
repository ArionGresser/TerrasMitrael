/**
 * As molduras das cartas e onde fica cada área vazia delas.
 *
 * As medidas saíram das próprias imagens (public/images/cartas), em fração
 * da largura (x) e da altura (y) da carta: [esquerda, topo, direita, base].
 * Se uma moldura for trocada, meça de novo; o desenho de áreas é o mesmo em
 * todas, mas cada pintura deixa as bordas um pouco diferentes.
 *
 * As cartas têm o formato de carta de baralho (5:7, 63 x 88 mm).
 */

export type TipoDeCarta = "magia" | "item-magico" | "equipamento" | "monstro";

type Caixa = [number, number, number, number];

export type Moldura = {
  src: string;
  /** Largura dividida pela altura. */
  proporcao: number;
  janela: Caixa;
  titulo: Caixa;
  tipo: Caixa;
  texto: Caixa;
  rodape: Caixa;
  /** O círculo do canto: centro e diâmetro, em fração da largura. */
  medalhao: { x: number; y: number; d: number };
  /** O medalhão é escuro (o escudo de ferro): o número vai em letra clara. */
  medalhaoEscuro?: boolean;
};

export const MOLDURAS: Record<TipoDeCarta, Moldura> = {
  magia: {
    src: "/images/cartas/carta-magia.webp",
    proporcao: 0.7129,
    janela: [0.129, 0.184, 0.902, 0.547],
    titulo: [0.229, 0.099, 0.887, 0.155],
    tipo: [0.245, 0.571, 0.786, 0.606],
    texto: [0.125, 0.628, 0.905, 0.883],
    rodape: [0.341, 0.906, 0.689, 0.955],
    medalhao: { x: 0.121, y: 0.112, d: 0.15 },
  },
  "item-magico": {
    src: "/images/cartas/carta-item-magico.webp",
    proporcao: 0.73,
    janela: [0.137, 0.191, 0.889, 0.546],
    titulo: [0.229, 0.104, 0.871, 0.159],
    tipo: [0.244, 0.571, 0.786, 0.606],
    texto: [0.127, 0.627, 0.901, 0.879],
    rodape: [0.345, 0.902, 0.683, 0.953],
    medalhao: { x: 0.12, y: 0.115, d: 0.131 },
  },
  equipamento: {
    src: "/images/cartas/carta-equipamento.webp",
    proporcao: 0.7143,
    janela: [0.121, 0.171, 0.888, 0.519],
    titulo: [0.255, 0.087, 0.885, 0.144],
    tipo: [0.228, 0.541, 0.781, 0.579],
    texto: [0.122, 0.604, 0.887, 0.871],
    rodape: [0.331, 0.894, 0.678, 0.943],
    medalhao: { x: 0.117, y: 0.112, d: 0.17 },
    medalhaoEscuro: true,
  },
  monstro: {
    src: "/images/cartas/carta-monstro.webp",
    proporcao: 0.6979,
    janela: [0.127, 0.182, 0.873, 0.536],
    titulo: [0.233, 0.104, 0.87, 0.152],
    tipo: [0.245, 0.562, 0.757, 0.594],
    texto: [0.129, 0.623, 0.873, 0.862],
    rodape: [0.356, 0.89, 0.644, 0.94],
    medalhao: { x: 0.109, y: 0.112, d: 0.17 },
  },
};

/** A cor da pedra no engaste do item mágico, pela raridade (como nos jogos). */
export const COR_DA_RARIDADE: Record<string, string> = {
  Comum: "#d9d4c7",
  Incomum: "#3f9b4a",
  Raro: "#2f6bd1",
  "Muito Raro": "#8a3fc4",
  Lendário: "#e0861f",
  Artefato: "#b3202a",
};
