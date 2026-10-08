/**
 * As regiões do mapa: o que o painel mostra quando alguém clica numa delas.
 *
 * O contorno vem de src/lib/regioes-do-mapa.ts, gerado a partir do desenho.
 * Aqui fica só o texto, e só o que já está contado: o nome e o subtítulo
 * escritos no próprio mapa, e os fatos que as fichas, os locais e as
 * crônicas já trazem. Região sem história ainda diz isso, sem inventar.
 */

export type Regiao = {
  chave: string;
  nome: string;
  /** O que o mapa escreve embaixo do nome, ou o que a região é. */
  subtitulo: string;
  /** O que já se sabe, em frases curtas. */
  fatos: string[];
  /** Os locais com página que ficam dentro dela. */
  locais: string[];
};

export const REGIOES: Regiao[] = [
  {
    chave: "tundra",
    nome: "Os Dedos da Tundra",
    subtitulo: "As terras geladas do norte",
    fatos: [
      "Terra natal de Tyr Vidar.",
      "Na Passagem Golem de Gelo, Howai passou a infância.",
    ],
    locais: [],
  },
  {
    chave: "tungel",
    nome: "Terras de Tungel",
    subtitulo: "Planícies Traiçoeiras de Tungel",
    fatos: [
      "Os povos de Tungel foram decisivos na Grande Guerra Leviana.",
      "No meio das planícies ficam o Grande Lago dos Ainran e a Pedra Divina.",
    ],
    locais: [],
  },
  {
    chave: "marily",
    nome: "Marily",
    subtitulo: "Deserto de Sal",
    fatos: [
      "No extremo norte fica Vérsia, dos Domadores de Portais, convocados no fim da guerra.",
    ],
    locais: [],
  },
  {
    chave: "gtry",
    nome: "Reinado de Gtry",
    subtitulo: "Reino Marítimo",
    fatos: [],
    locais: [],
  },
  {
    chave: "askar",
    nome: "Terras de Askar",
    subtitulo: "O continente selado a oeste",
    fatos: [
      "Ao norte fica Drakyrbon Mahur, reino dos dragões e dos Filhos do Fogo.",
    ],
    locais: ["askar"],
  },
  {
    chave: "pondor",
    nome: "Pondor do Aramate",
    subtitulo: "Ilha entre Askar e Mitrael",
    fatos: ["Ilha natal de Levi, tomada pelos Orcs."],
    locais: [],
  },
  {
    chave: "enclausurador",
    nome: "Enclausurador",
    subtitulo: "Ilha no Mar de Qän",
    fatos: [],
    locais: [],
  },
  {
    chave: "mitrael",
    nome: "Terras de Mitrael",
    subtitulo: "Os reinos do leste",
    fatos: [
      "Em Entrerrio fica a taverna onde Levi foi criado.",
      "Em Guratan, Filavandrel trabalhou.",
    ],
    locais: ["sovara-mithr", "arauto", "vernaculo", "razavar", "putrefados"],
  },
];
