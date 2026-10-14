/**
 * ✦ Encontros fora de combate: uma tabela da casa, genérica, sem nomes nem
 * lugares de Mitrael, para o Mestre trocar pelo que combinar com o mundo.
 *
 * Um d20 escolhe o encontro e outro d20 decide para que lado ele vai:
 * 1 a 6 ruim, 7 a 14 neutro, 15 a 20 bom. Alguns, no lado ruim, viram
 * combate: o gerador sorteia as criaturas do tipo certo.
 *
 * Quando o Mestre deixa o dado decidir se é combate ou não, um d20 de 1 a
 * 8 dá combate (com um d6 para como a luta começa) e de 9 a 20 dá um
 * encontro desta tabela.
 */

export type Rumo = "ruim" | "neutro" | "bom";

export type EncontroFora = {
  titulo: string;
  /** A cena, para ler ou contar à mesa. */
  cena: string;
  ruim: string;
  neutro: string;
  bom: string;
  /** No lado ruim, vira combate com criaturas destes tipos. */
  combate?: string[];
};

export const ENCONTROS_FORA: EncontroFora[] = [
  {
    titulo: "Viajantes na estrada",
    cena: "Um pequeno grupo vem no sentido contrário, com mochilas pesadas e cara de quem andou muito.",
    ruim: "São batedores de um bando: medem o grupo, contam as armas e somem no mato. Mais tarde, a emboscada.",
    neutro: "Cumprimentam de longe, desconfiados, e seguem sem conversa.",
    bom: "Param para dividir comida e contam um boato útil sobre o caminho adiante.",
    combate: ["Humanoide"],
  },
  {
    titulo: "Pedágio de bandidos",
    cena: "Uma corda atravessa a estrada. Do outro lado, gente armada e um chapéu virado para as moedas.",
    ruim: "Não querem conversa: ou tudo o que o grupo carrega, ou briga.",
    neutro: "Cobram 5 PO por cabeça e deixam passar. Dá para pechinchar com um bom teste de Persuasão.",
    bom: "O chefe está cansado e aceita qualquer moeda, ou uma boa história, para não arriscar ninguém.",
    combate: ["Humanoide"],
  },
  {
    titulo: "Mercador ambulante",
    cena: "Uma carroça colorida, sininhos pendurados e um vendedor que já sorri antes de alguém chegar perto.",
    ruim: "Vende uma poção ou um amuleto falso com a maior cara de verdade.",
    neutro: "Equipamento comum pelo preço da tabela, e alguma notícia da última vila.",
    bom: "Tem uma coisa rara que não sabe quanto vale: um item comum de graça ou um mágico simples barato.",
  },
  {
    titulo: "Animal ferido",
    cena: "Um animal preso numa armadilha velha geme na beira do caminho.",
    ruim: "O resto da matilha (ou a mãe) chega enquanto o grupo está perto demais.",
    neutro: "Solto, ele foge para o mato sem olhar para trás.",
    bom: "Solto e cuidado, ele segue o grupo de longe por dias e avisa quando algo se aproxima.",
    combate: ["Fera"],
  },
  {
    titulo: "Acampamento abandonado",
    cena: "Uma fogueira ainda morna, barracas rasgadas e coisas deixadas para trás às pressas.",
    ruim: "Quem fez isso com os donos ainda está por perto, e volta.",
    neutro: "Pistas de quem passou: pegadas, um bilhete, a direção que tomaram.",
    bom: "Suprimentos esquecidos: rações, corda, um pouco de moeda.",
    combate: ["Monstruosidade", "Fera", "Humanoide"],
  },
  {
    titulo: "O tempo fecha",
    cena: "O céu escurece de repente. O vento muda e o cheiro de chuva fica forte.",
    ruim: "Tempestade de verdade: um teste de Constituição CD 12 para cada um, e quem falhar ganha 1 nível de Exaustão.",
    neutro: "Chuva grossa que atrasa a viagem em meio dia.",
    bom: "Uma gruta seca aparece bem na hora, e dentro dela alguém deixou lenha.",
  },
  {
    titulo: "Passagem quebrada",
    cena: "A ponte, o vau ou a trilha que deveria estar ali desabou.",
    ruim: "Atravessar exige um teste de Atletismo CD 13; quem falhar sofre 2d6 de dano e perde algo da mochila.",
    neutro: "Há um desvio, mas custa horas de caminhada.",
    bom: "Alguém já montou uma travessia improvisada, firme o bastante.",
  },
  {
    titulo: "Peregrino",
    cena: "Uma figura de manto e cajado reza em voz baixa na beira da estrada.",
    ruim: "Acha o grupo impuro e promete que a viagem vai dar errado. A mesa decide se é só praga de velho.",
    neutro: "Pede companhia até a próxima encruzilhada e fala sem parar.",
    bom: "Abençoa o grupo: cada um ganha Inspiração Heroica.",
  },
  {
    titulo: "Patrulha",
    cena: "Soldados ou guardas da região barram o caminho e pedem que o grupo se explique.",
    ruim: "Acham o grupo suspeito de um crime recente. Ou se explicam muito bem, ou vão presos.",
    neutro: "Fazem perguntas, revistam as mochilas e liberam.",
    bom: "Estão atrás de algo que o grupo também quer, e oferecem recompensa por ajuda.",
    combate: ["Humanoide"],
  },
  {
    titulo: "Marco antigo",
    cena: "Uma pedra entalhada, uma estátua sem rosto ou um pedaço de muralha de uma época esquecida.",
    ruim: "Mexer acorda o que dorme ali embaixo.",
    neutro: "Uma inscrição meio apagada: com um teste de História, conta algo do lugar.",
    bom: "Uma oferenda velha ainda está no pé do marco: moedas antigas e uma bugiganga.",
    combate: ["Morto-Vivo", "Constructo"],
  },
  {
    titulo: "Pedido de ajuda",
    cena: "Alguém corre até o grupo, sem fôlego, apontando para trás.",
    ruim: "É uma isca: o problema era o próprio grupo.",
    neutro: "Um parente sumiu, uma vaca fugiu, um poço secou. Pouca recompensa, muita gratidão.",
    bom: "O pedido leva a algo que interessa ao grupo, e quem pede paga bem.",
    combate: ["Humanoide"],
  },
  {
    titulo: "Fera à espreita",
    cena: "Algo grande acompanha o grupo de longe, entre as árvores ou nas pedras.",
    ruim: "Ataca de noite, no turno de guarda mais fraco.",
    neutro: "Segue por um tempo e perde o interesse.",
    bom: "Era só curiosidade: mostra onde tem água e some.",
    combate: ["Fera", "Monstruosidade"],
  },
  {
    titulo: "Restos de uma luta",
    cena: "Corpos, armas quebradas e marcas no chão: aconteceu uma batalha aqui há pouco.",
    ruim: "Os vencedores ainda estão catando o que sobrou.",
    neutro: "Dá para ler o que aconteceu, e quem perdeu.",
    bom: "Um sobrevivente ferido, grato por qualquer ajuda, e equipamento que ninguém levou.",
    combate: ["Humanoide", "Monstruosidade"],
  },
  {
    titulo: "Água no caminho",
    cena: "Uma fonte, um riacho ou um poço, bem quando o cantil está vazio.",
    ruim: "A água está ruim: quem beber faz um teste de Constituição CD 11 ou fica Envenenado por uma hora.",
    neutro: "Água boa. Cantis cheios.",
    bom: "Uma fonte limpa e fria: um Descanso Curto aqui devolve 1 Dado de Vida a cada um.",
  },
  {
    titulo: "Caçadores",
    cena: "Gente da região com arcos e armadilhas, carregando a caça do dia.",
    ruim: "Acham que o grupo espantou a caça deles e querem compensação.",
    neutro: "Trocam carne por qualquer coisa útil.",
    bom: "Mostram um atalho e avisam de um perigo no caminho.",
    combate: ["Humanoide"],
  },
  {
    titulo: "Barulho na noite",
    cena: "No meio da guarda, um galho estala. Depois outro.",
    ruim: "Emboscada: os inimigos chegam com Vantagem na iniciativa.",
    neutro: "Um bicho pequeno revirando a comida.",
    bom: "Alguém perdido, atraído pela fogueira, com notícias.",
    combate: ["Humanoide", "Fera", "Monstruosidade", "Morto-Vivo"],
  },
  {
    titulo: "Carroça atolada",
    cena: "Uma carroça presa na lama, os bois cansados e o dono desesperado.",
    ruim: "Enquanto o grupo empurra, os comparsas do dono aparecem.",
    neutro: "Com um teste de Atletismo, a carroça sai. O dono agradece e segue.",
    bom: "O dono paga em mercadoria e promete abrigo na casa dele.",
    combate: ["Humanoide"],
  },
  {
    titulo: "Andarilho estranho",
    cena: "Alguém de olhar distante pede para se sentar à fogueira.",
    ruim: "Some antes do amanhecer, levando algo de valor de alguém do grupo.",
    neutro: "Conta histórias de lugares que ninguém conhece.",
    bom: "Diz uma frase que, mais adiante, vai fazer todo o sentido. O Mestre guarda para depois.",
  },
  {
    titulo: "Plantas e fungos",
    cena: "Um canteiro de cogumelos ou flores que ninguém do grupo reconhece.",
    ruim: "Esporos: quem chegar perto faz um teste de Constituição CD 12 ou fica Envenenado.",
    neutro: "Nada de mais, mas cheiram forte.",
    bom: "Com um teste de Natureza ou Medicina, rendem o bastante para uma poção de cura.",
  },
  {
    titulo: "Um rosto conhecido",
    cena: "Alguém que o grupo já encontrou antes aparece onde ninguém esperava.",
    ruim: "Veio cobrar uma dívida, uma ofensa ou uma promessa.",
    neutro: "Coincidência: troca notícias e segue.",
    bom: "Traz um favor, um aviso ou um presente.",
    combate: ["Humanoide"],
  },
];

/** Como a luta começa, quando o dado manda combate (d6). */
export const COMO_COMECA = [
  "Emboscada: os inimigos atacam primeiro. Quem não percebeu (Percepção passiva contra a Furtividade deles) fica Surpreso e tem Desvantagem na iniciativa.",
  "Frente a frente: os dois lados se veem ao mesmo tempo, sem vantagem para ninguém.",
  "Frente a frente: os dois lados se veem ao mesmo tempo, sem vantagem para ninguém.",
  "O grupo vê primeiro: dá para preparar uma surpresa, conversar ou contornar.",
  "O grupo vê primeiro: dá para preparar uma surpresa, conversar ou contornar.",
  "Os inimigos estão ocupados com outra coisa (comendo, brigando entre si, saqueando): uma rodada de vantagem para quem agir rápido.",
];

const d = (lados: number) => 1 + Math.floor(Math.random() * lados);

export function rumoDo(d20: number): Rumo {
  return d20 <= 6 ? "ruim" : d20 <= 14 ? "neutro" : "bom";
}

export type Sorteado = { encontro: EncontroFora; dadoDoEncontro: number; dadoDoRumo: number; rumo: Rumo };

export function sortearFora(): Sorteado {
  const dadoDoEncontro = d(20);
  const dadoDoRumo = d(20);
  return { encontro: ENCONTROS_FORA[dadoDoEncontro - 1], dadoDoEncontro, dadoDoRumo, rumo: rumoDo(dadoDoRumo) };
}

export function sortearComoComeca(): { dado: number; texto: string } {
  const dado = d(6);
  return { dado, texto: COMO_COMECA[dado - 1] };
}

/** O d20 que decide: 1 a 8 combate, 9 a 20 fora de combate. */
export function combateOuNao(): { dado: number; combate: boolean } {
  const dado = d(20);
  return { dado, combate: dado <= 8 };
}
