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
const BRONZE = { fita: "#6b4423", sombra: "#3d2513", letra: "#f4e4cd" };
const PRATA = { fita: "#4d5560", sombra: "#2c3138", letra: "#eef1f5" };
const VINHO = { fita: "#5a1f3d", sombra: "#361024", letra: "#f7e3ee" };
const OLIVA = { fita: "#4a4a1f", sombra: "#2b2b11", letra: "#f0f0d8" };
/** Bronze que envelheceu ao relento, como estátua de fundador de cidade. */
const AZINHAVRE = { fita: "#1f5a55", sombra: "#0f3330", letra: "#dff2ef" };
/**
 * O azul do anil, tinta cara de rota comercial, que só aparecia em roupa de
 * quem queria ser reconhecido de longe. É o matiz mais claro do quadro de
 * propósito, e o único nesta faixa: fama é barulho, e barulho não se
 * confunde com nada.
 */
const ANIL = { fita: "#4b3aa0", sombra: "#241a56", letra: "#ece8ff" };

/**
 * A ordem aqui é a ordem do glossário: as que mais aparecem primeiro, as
 * raras no fim. Quem entra novo entra no grupo a que pertence.
 */
export const TAGS: Record<string, Tag> = {
  // ---------- Renome: sobe junto com o nível ----------

  aventureiro: {
    nome: "Aventureiro",
    resumo: "Nível 1 ao 4",
    texto:
      "Criado já sob as regras de 2024, e ainda sem renome suficiente para ser chamado de outra coisa. Aventureiro é o que se escreve na ficha de quem acabou de chegar. Salva a vila, mata o lobo, encontra o anel perdido. O título muda conforme o personagem sobe de nível e o mundo passa a ter opinião sobre ele.",
    cor: VERDE,
  },

  veterano: {
    nome: "Veterano",
    resumo: "Nível 5 ao 10",
    texto:
      "O nível 5 é onde a coisa vira. O segundo ataque chega, as magias de terceiro círculo chegam, e o que era um problema sério passa a ser um problema resolvido. Daqui em diante o personagem não é mais o coitado que aceita qualquer contrato: ele escolhe. Quem passa dos primeiros níveis já viu companheiro cair, e isso aparece na cara.",
    cor: BRONZE,
  },

  campeao: {
    nome: "Campeão",
    resumo: "Nível 11 ao 16",
    texto:
      "Do nível 11 em diante o problema deixa de ser do vilarejo e passa a ser do reino. Entram as magias de sexto círculo, o golpe que antes dependia de sorte agora sai três vezes por turno, e o que assustava o grupo inteiro no primeiro ano vira encontro de passagem. Campeão é quem um rei manda chamar depois que o exército já tentou e não deu.",
    cor: DOURADO,
  },

  lenda: {
    nome: "Lenda",
    resumo: "Nível 17 ao 20",
    texto:
      "Do nível 17 em diante o personagem não resolve mais problemas de reino, resolve problemas de mundo. Existe gente que jura ter visto, gente que jura que nunca existiu, e as duas contam a mesma história. Poucos chegam aqui. Menos ainda chegam inteiros.",
    cor: VINHO,
  },

  // ---------- Feito: o que o mundo passou a contar dele ----------

  celebridade: {
    nome: "Celebridade",
    resumo: "Conhecido pelo nome",
    texto:
      "Esta não tem nada a ver com nível. Tem a ver com quem estava olhando. O bardo cuja canção é cantada em taverna por gente que nunca o viu de perto, o gladiador que a arena chama pelo nome antes de a porta abrir, o herói que uma cidade inteira viu salvar o que ia se perder. Fama abre porta que ouro não abre e marca um alvo nas costas que não sai mais. Sempre existe pelo menos uma versão errada dos fatos por aí, e costuma ser justamente a mais cantada.",
    cor: ANIL,
  },

  // ---------- Origem: de onde a ficha veio ----------

  fundador: {
    nome: "Fundador",
    resumo: "Primeira campanha",
    texto:
      "Do trio que jogou a primeiríssima campanha de Terras de Mitrael, quando o mapa cabia numa folha e metade do continente ainda não tinha nome. Cada decisão que eles tomaram naquela mesa virou fato consumado para todo mundo que veio depois. Não dá para desfazer o que um fundador fez: virou história.",
    cor: AZINHAVRE,
  },

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

  // ---------- Estado: o que anda acontecendo com ele ----------

  "em-construcao": {
    nome: "História a Escrever",
    resumo: "O escriba atrasou",
    texto:
      "O personagem existe, tem ficha, tem nome e já está em jogo. O que falta é alguém sentar e escrever de onde ele veio. O escriba responsável foi avisado. Duas vezes.",
    cor: AZUL,
  },

  caido: {
    nome: "Caído",
    resumo: "Morreu em mesa",
    texto:
      "Morreu jogando, com os dados na mesa e todo mundo olhando. Não foi decisão de roteiro nem saída combinada: foi rolagem. A ficha fica aqui exatamente como estava no último turno, porque apagar seria mentir sobre o que aconteceu naquela noite.",
    cor: PRATA,
  },

  aposentado: {
    nome: "Aposentado",
    resumo: "Saiu por bem",
    texto:
      "Sobreviveu, o que já é bastante, e escolheu parar. Abriu taverna, voltou para casa, aceitou um cargo, sumiu no mar. Continua vivo em algum canto do mapa e pode reaparecer se a história pedir, mas não rola iniciativa há um bom tempo.",
    cor: OLIVA,
  },

  desaparecido: {
    nome: "Desaparecido",
    resumo: "Paradeiro ignorado",
    texto:
      "Ninguém viu cair, ninguém viu sair. Simplesmente não estava mais lá na sessão seguinte. O Mestre sabe onde ele foi parar e não vai contar até a hora certa.",
    cor: AZUL,
  },

  // ---------- Papel: de que lado da mesa ----------

  vilao: {
    nome: "Virou Vilão",
    resumo: "Trocou de lado",
    texto:
      "Começou do lado de cá e terminou do lado de lá. Aconteceu na mesa, na frente de todo mundo, e ninguém conseguiu impedir. Hoje o Mestre é quem rola os dados dele, e o grupo aprendeu a temer uma ficha que conhece de cor.",
    cor: VERMELHO,
  },

  convidado: {
    nome: "Convidado",
    resumo: "Passou por uma mesa",
    texto:
      "Entrou para uma sessão ou duas, deixou marca e foi embora. Personagem de visitante que sentou na cadeira vaga numa noite e acabou virando parte do cânone sem querer.",
    cor: PRATA,
  },

  mestre: {
    nome: "O Mestre",
    resumo: "Atrás da tela",
    texto:
      "Quem narra. Não rola iniciativa, não pede para entrar na roda e ainda assim é o único que sabe o que tem atrás da porta. A ficha aqui é lembrança de quando ele também jogava.",
    cor: ROXO,
  },
};

/** As chaves na ordem em que foram cadastradas, para o glossário seguir. */
export const CHAVES_DAS_TAGS = Object.keys(TAGS);

export function buscarTag(chave: string): Tag {
  const tag = TAGS[chave];
  if (!tag) {
    throw new Error(
      `A fita "${chave}" não existe em src/lib/tags.ts. Cadastre-a lá antes de usar numa ficha.`
    );
  }
  return tag;
}
