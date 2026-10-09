import horizontal from "../public/gravacoes/horizontal/cenas.json";

/**
 * O roteiro do trailer: a ordem das cenas, quanto tempo cada uma fica na
 * tela e o que a legenda diz.
 *
 * As legendas usam só frases que já estão no site (o menu e os cartões do
 * Livro do Aventureiro). Nada aqui é texto novo sobre o mundo.
 *
 * A música é o tema do Vrakyr. Ela cresce de vez aos 38 segundos da faixa,
 * e o encerramento entra exatamente ali: a abertura estica ou encolhe para
 * a conta fechar.
 */

export const FPS = 30;
export const TRANSICAO = 0.35;
/** Onde a faixa começa a tocar e onde ela cresce, em segundos da faixa. */
export const MUSICA_INICIO = 0.2;
export const MUSICA_VIRADA = 38.05;
export const FECHO = 5.6;

export type Formato = "horizontal";

type Gravacao = {
  duracao: number;
  eventos: { t: number; efeito: string; nivel?: number }[];
};

type Plano = {
  cena: string;
  /** Segundos na tela, se a gravação tiver tanto. */
  tela: number;
  /** Onde a cena começa dentro da gravação. */
  inicio: number;
  velocidade: number;
  legenda?: { nome: string; texto: string };
};

const PLANOS: Plano[] = [
  { cena: "inicio", tela: 3.6, inicio: 0.4, velocidade: 1.25 },
  {
    cena: "mapa",
    tela: 5.0,
    inicio: 0.3,
    velocidade: 1,
    legenda: { nome: "Mapa", texto: "O continente, suas terras e a história de cada lugar" },
  },
  {
    cena: "contos",
    tela: 5.0,
    inicio: 0.4,
    velocidade: 1,
    legenda: { nome: "Contos", texto: "As sessões jogadas e a história do continente" },
  },
  {
    cena: "personagem",
    tela: 5.6,
    inicio: 0.6,
    velocidade: 1.3,
    legenda: { nome: "Personagens", texto: "Os heróis que caminharam por estas terras" },
  },
  {
    cena: "grimorio",
    tela: 4.8,
    inicio: 0.4,
    velocidade: 1.25,
    legenda: { nome: "Grimório", texto: "As 339 magias, com busca por nome, classe, círculo e escola" },
  },
  {
    cena: "bestiario",
    tela: 4.4,
    inicio: 0.4,
    velocidade: 1.3,
    legenda: { nome: "Bestiário", texto: "Os 330 monstros e animais, com busca por tipo, Nível de Desafio e tamanho" },
  },
  {
    cena: "bau",
    tela: 6.0,
    inicio: 1.1,
    velocidade: 1,
    legenda: { nome: "Baú do Mestre", texto: "O jogador rola o d20 e o site tira moedas, equipamento e itens mágicos" },
  },
];

export type Bloco = {
  cena: string;
  /** Início e duração no vídeo, em quadros. */
  de: number;
  quadros: number;
  inicio: number;
  velocidade: number;
  legenda?: Plano["legenda"];
};

export type Som = { quadro: number; efeito: string };

export type Montagem = {
  abertura: number;
  blocos: Bloco[];
  fecho: number;
  total: number;
  sons: Som[];
};

const q = (s: number) => Math.round(s * FPS);

export function montar(formato: Formato): Montagem {
  const gravacoes = horizontal as Record<string, Gravacao>;

  const planos = PLANOS.map((p) => {
    const g = gravacoes[p.cena];
    const cabe = (g.duracao - p.inicio - 0.05) / p.velocidade;
    return { ...p, tela: Math.min(p.tela, cabe), g };
  });

  // O encerramento cai na virada da música
  const virada = MUSICA_VIRADA - MUSICA_INICIO;
  const meio = planos.reduce((s, p) => s + p.tela, 0) - TRANSICAO * planos.length;
  const abertura = Math.min(6, Math.max(2.6, virada - meio));

  const blocos: Bloco[] = [];
  const sons: Som[] = [{ quadro: q(0.35), efeito: "pergaminho" }];
  let t = abertura - TRANSICAO;
  for (const p of planos) {
    blocos.push({ cena: p.cena, de: q(t), quadros: q(p.tela), inicio: p.inicio, velocidade: p.velocidade, legenda: p.legenda });
    for (const e of p.g.eventos) {
      const noVideo = (e.t - p.inicio) / p.velocidade;
      if (noVideo < -0.05 || noVideo > p.tela - 0.1) continue;
      const efeito = e.efeito === "brilho" ? `brilho${e.nivel ?? 3}` : e.efeito;
      sons.push({ quadro: q(t + Math.max(0, noVideo)), efeito });
    }
    t += p.tela - TRANSICAO;
  }

  const fechoDe = q(t);
  return { abertura: q(abertura), blocos, fecho: fechoDe, total: fechoDe + q(FECHO), sons };
}
