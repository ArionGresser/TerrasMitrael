import gravacoes from "../public/gravacoes/horizontal/cenas.json";
import marcasDosEfeitos from "../public/sons/trailer/efeitos.json";

/**
 * O roteiro do trailer (video/ROTEIRO-2.txt), preso à música.
 *
 * A trilha é a versão medieval de Welcome To Los Santos (GTA V). Medida no
 * arquivo: uma batida a cada 0,675 s (cerca de 88,8 por minuto), a faixa
 * enche aos 28,5 s, freia de repente aos 63,24 s e volta com tudo aos 67,3 s.
 * Cada troca de cena cai no começo de um compasso, os cortes da montagem
 * caem nas batidas, e o selo do encerramento bate na volta da música.
 *
 * Os tempos de tudo aqui são os da própria música, em segundos: o vídeo e a
 * faixa começam juntos.
 *
 * Cada cena mostra pedaços da gravação dela (`trechos`), cada um com a sua
 * velocidade. Um trecho que começa onde o anterior parou só muda o ritmo;
 * um que pula para a frente é um corte, e entra num esmaecer curtinho.
 *
 * As legendas usam só frases do site ou do roteiro aprovado.
 */

export const FPS = 30;
export const DURACAO = 76;
/** Quanto uma cena invade a seguinte, para as duas se cruzarem na troca. */
export const SOBRA = 0.25;

export const MUSICA = {
  arquivo: "musica/gta-v.mp3",
  freada: 63.235,
  auge: 67.3,
  /** De onde a música começa a abaixar até o fim. */
  saida: 72.6,
};

export type Trecho = { de: number; ate?: number; velocidade: number };

export type Cena = {
  id: string;
  gravacao: string;
  inicio: number;
  fim: number;
  trechos: Trecho[];
  legenda?: { nome: string; texto: string };
  /** Como entra: cruzando com a cena anterior, ou vindo do escuro. */
  entrada?: "cruzar" | "escuro";
};

export type Tomada =
  | { tipo: "imagem"; imagem: string; de: number; ate: number; cheia?: boolean }
  | { tipo: "gravacao"; gravacao: string; de: number; ate: number; em: number; velocidade?: number };

export type Som = { arquivo: string; em: number; volume: number; marca?: number };

const CENAS: Cena[] = [
  {
    id: "inicio",
    gravacao: "inicio",
    inicio: 6.28,
    fim: 11.68,
    trechos: [{ de: 0.6, velocidade: 1.7 }],
  },
  {
    id: "mesa",
    gravacao: "mesa",
    inicio: 11.68,
    fim: 22.48,
    trechos: [
      { de: 1.8, ate: 7.0, velocidade: 1 },
      { de: 7.0, velocidade: 2.35 },
    ],
    legenda: { nome: "A mesa", texto: "Role o d20, ganhe conquistas e libere dados e luvas novos" },
  },
  {
    id: "mapa",
    gravacao: "mapa",
    inicio: 22.48,
    fim: 28.53,
    trechos: [
      { de: 0.3, ate: 7.0, velocidade: 1.55 },
      { de: 7.0, velocidade: 2.5 },
    ],
    legenda: { nome: "Mapa", texto: "Passe a mão pelo continente e abra a história de cada lugar" },
  },
  {
    id: "personagens",
    gravacao: "personagens",
    inicio: 28.53,
    fim: 39.33,
    trechos: [
      { de: 0.2, ate: 2.0, velocidade: 1 },
      { de: 2.0, ate: 10.1, velocidade: 4.05 },
      { de: 11.4, ate: 13.2, velocidade: 1 },
      { de: 15.5, ate: 17.3, velocidade: 1 },
      { de: 20.0, ate: 21.8, velocidade: 1 },
      { de: 25.4, ate: 27.3, velocidade: 1.6 },
      { de: 28.8, velocidade: 1.6 },
    ],
    legenda: { nome: "Personagens", texto: "Cada herói com o seu retrato, a sua história e a sua ficha" },
  },
  {
    id: "cronicas",
    gravacao: "cronicas",
    inicio: 39.33,
    fim: 47.43,
    trechos: [
      { de: 0.3, ate: 1.9, velocidade: 1 },
      { de: 1.9, ate: 12.8, velocidade: 2.72 },
      { de: 15.9, velocidade: 1.45 },
    ],
    legenda: { nome: "Crônicas", texto: "Cada sessão jogada vira episódio, temporada por temporada" },
  },
  {
    id: "livro",
    gravacao: "livro",
    inicio: 47.43,
    fim: 55.53,
    trechos: [
      { de: 0.3, ate: 1.8, velocidade: 1 },
      { de: 1.8, ate: 5.6, velocidade: 2.1 },
      { de: 6.8, ate: 9.4, velocidade: 1.15 },
      { de: 9.6, velocidade: 1.9 },
    ],
    legenda: { nome: "Livro do Aventureiro", texto: "339 magias, 330 monstros e 258 itens mágicos, em português" },
  },
  {
    id: "em-breve",
    gravacao: "novidades",
    inicio: MUSICA.freada,
    fim: MUSICA.auge,
    trechos: [{ de: 0.4, velocidade: 1.9 }],
    legenda: { nome: "Em breve", texto: "E tem muito mais por vir" },
    entrada: "escuro",
  },
];

/** A montagem que sobe até a freada: cada corte numa batida, cada vez mais curtos. */
const BATIDA = 0.675;
const M0 = 55.53;
const b = (n: number) => Number((M0 + n * BATIDA).toFixed(3));

const MONTAGEM: Tomada[] = [
  { tipo: "imagem", imagem: "saga-capa", de: b(0), ate: b(2) },
  { tipo: "imagem", imagem: "dragao", de: b(2), ate: b(4), cheia: true },
  { tipo: "gravacao", gravacao: "bau", de: b(4), ate: b(5), em: 4.2 },
  // O elenco da Temporada 2, um por batida
  { tipo: "imagem", imagem: "pyhmm", de: b(5), ate: b(6) },
  { tipo: "imagem", imagem: "johnny", de: b(6), ate: b(7) },
  { tipo: "imagem", imagem: "lily", de: b(7), ate: b(8) },
  { tipo: "imagem", imagem: "egon", de: b(8), ate: b(9) },
  { tipo: "imagem", imagem: "vrakyr", de: b(9), ate: b(10) },
  { tipo: "gravacao", gravacao: "mesa", de: b(10), ate: b(10.5), em: 3.85 },
  { tipo: "gravacao", gravacao: "mapa", de: b(10.5), ate: MUSICA.freada, em: 7.15, velocidade: 1.6 },
];

type Gravacao = { duracao: number; eventos: { t: number; efeito: string; nivel?: number }[] };
const G = gravacoes as Record<string, Gravacao>;
const E = marcasDosEfeitos as Record<string, { marca: number; duracao: number }>;

/** Os trechos com o fim calculado: o último preenche o que falta da cena. */
export function trechosDe(c: Cena): Required<Trecho>[] {
  const total = c.fim - c.inicio + (c.entrada === "escuro" ? 0 : SOBRA) + SOBRA;
  let usado = 0;
  return c.trechos.map((t, i) => {
    const ate = t.ate ?? t.de + (total - usado) * t.velocidade;
    usado += (ate - t.de) / t.velocidade;
    const max = G[c.gravacao].duracao - 0.05;
    if (ate > max) throw new Error(`${c.id}: o trecho ${i} passa do fim da gravação (${ate.toFixed(2)} > ${max.toFixed(2)})`);
    return { de: t.de, ate, velocidade: t.velocidade };
  });
}

/** Onde um instante da gravação cai no vídeo, se ele aparece. */
function noVideo(c: Cena, t: number): number | null {
  let tempo = c.inicio - (c.entrada === "escuro" ? 0 : SOBRA);
  for (const tr of trechosDe(c)) {
    if (t >= tr.de && t <= tr.ate) return tempo + (t - tr.de) / tr.velocidade;
    tempo += (tr.ate - tr.de) / tr.velocidade;
  }
  return null;
}

function evento(cena: string, efeito: string) {
  const c = CENAS.find((x) => x.id === cena)!;
  const e = G[c.gravacao].eventos.find((x) => x.efeito === efeito);
  if (!e) throw new Error(`${cena}: sem a marca ${efeito}`);
  const t = noVideo(c, e.t);
  if (t === null) throw new Error(`${cena}: a marca ${efeito} ficou fora dos trechos`);
  return t;
}

/** Um efeito com a marca (a batida, o topo) caindo no instante pedido. */
function efeito(nome: string, em: number, volume: number): Som {
  return { arquivo: `sons/trailer/${nome}.wav`, em: em - E[nome].marca, volume };
}

export const VOLUMES = {
  musica: 0.62,
  whoosh: 1.0,
  /** Quanto a música abre espaço para o whoosh, em cada troca de cena. */
  abertura: 0.62,
  hitGrave: 0.9,
  riser: 0.95,
  subdrop: 0.85,
  impact: 0.8,
  feitico: 1.6,
  brilho: 1.0,
};

export function montar() {
  const trocas = CENAS.filter((c) => c.entrada !== "escuro").map((c) => c.inicio).concat(M0);
  const sons: Som[] = [
    // O selo da abertura cai na primeira batida
    efeito("hit-grave", 0.88, VOLUMES.hitGrave),
    // Um whoosh em cada troca de cena, com o pico em cima do corte
    ...trocas.map((t, i) => ({ ...efeito("whoosh", t - 0.04, VOLUMES.whoosh * (i % 2 ? 0.9 : 1)) })),
    // O brilho do próprio site quando desce o lacre do Vinte natural
    { arquivo: "sons/brilho3.wav", em: evento("mesa", "brilho"), volume: VOLUMES.brilho },
    // O feitiço do site no clique do Grimório
    { arquivo: "sons/feitico.wav", em: evento("livro", "feitico"), volume: VOLUMES.feitico },
    // A freada: o riser sobe e chega no topo exatamente no auge
    efeito("riser", MUSICA.auge, VOLUMES.riser),
    // O auge: a batida seca do subdrop e o estrondo do impact juntos
    efeito("subdrop", MUSICA.auge, VOLUMES.subdrop),
    efeito("impact", MUSICA.auge, VOLUMES.impact),
  ];
  return { cenas: CENAS, montagem: MONTAGEM, sons, trocas };
}
