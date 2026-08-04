/**
 * As fitas costuradas nas fichas.
 *
 * Cada personagem carrega uma ou mais. São curtas de propósito: a fita diz o
 * que é, e o texto de dentro explica sem enrolar. Nenhuma delas ocupa espaço
 * na página até alguém querer saber.
 *
 * Conforme os personagens sobem de nível e ganham títulos, é aqui que as
 * fitas novas entram. Uma entrada nova neste arquivo já aparece na ficha.
 */

export type Tag = {
  nome: string;
  /** Aparece fechada, na própria fita. Curtíssimo. */
  resumo: string;
  /** O texto que abre ao tocar. Direto ao ponto, com alguma graça. */
  texto: string;
  /** A cor da fita e a da linha que a costura. */
  cor: { fita: string; sombra: string; letra: string };
};

const VERMELHO = { fita: "#7b2028", sombra: "#4d1219", letra: "#f7ecd8" };
const VERDE = { fita: "#2f4a3c", sombra: "#1c2e25", letra: "#e6f0e8" };
const DOURADO = { fita: "#96741f", sombra: "#5e4813", letra: "#fdf6e0" };
const ROXO = { fita: "#4a2c52", sombra: "#2c1930", letra: "#f2e6f5" };
const AZUL = { fita: "#25415e", sombra: "#15273a", letra: "#e4eef8" };

export const TAGS: Record<string, Tag> = {
  "origin-hero": {
    nome: "Origin Hero",
    resumo: "Primeira geração",
    texto:
      "Estava lá quando não havia nada. Estes são os heróis das primeiras mesas de Mitrael, de 2020 em diante, criados sob o sistema de regras próprio da casa, antes de o cenário adotar os livros oficiais. Muito do que existe hoje no mapa existe porque um deles decidiu alguma coisa numa noite de terça.",
    cor: DOURADO,
  },

  "ficha-antiga": {
    nome: "Ficha Antiga",
    resumo: "Sem conversão",
    texto:
      "Esta ficha nasceu no sistema caseiro e ainda não foi recalibrada para D&D 5.5e. Os números aqui são registro histórico, não regra de mesa: se você tentar levar este personagem para uma sessão de hoje, o Mestre vai olhar torto. Está preservada exatamente como foi jogada.",
    cor: VERMELHO,
  },

  aventureiro: {
    nome: "Aventureiro",
    resumo: "D&D 5.5e",
    texto:
      "Criado já sob as regras de 2024, e ainda sem renome suficiente para ser chamado de outra coisa. Aventureiro é o que se escreve na ficha de quem acabou de chegar. O título muda conforme o personagem sobe de nível e o mundo passa a ter opinião sobre ele.",
    cor: VERDE,
  },

  "em-construcao": {
    nome: "História a Escrever",
    resumo: "O escriba atrasou",
    texto:
      "O personagem existe, tem ficha, tem nome e já está em jogo. O que falta é alguém sentar e escrever de onde ele veio. O escriba responsável foi avisado. Duas vezes.",
    cor: AZUL,
  },

  mestre: {
    nome: "O Mestre",
    resumo: "Atrás da tela",
    texto:
      "Quem narra. Não rola iniciativa, não pede para entrar na roda e ainda assim é o único que sabe o que tem atrás da porta. A ficha aqui é lembrança de quando ele também jogava.",
    cor: ROXO,
  },
};

export function buscarTag(chave: string): Tag {
  const tag = TAGS[chave];
  if (!tag) {
    throw new Error(
      `A fita "${chave}" não existe em src/lib/tags.ts. Cadastre-a lá antes de usar numa ficha.`
    );
  }
  return tag;
}
