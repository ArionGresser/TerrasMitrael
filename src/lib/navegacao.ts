/**
 * As seções do site, em um só lugar.
 * Mudar aqui muda o menu, o rodapé e qualquer índice, nunca em três lugares.
 */

export type Secao = {
  href: string;
  nome: string;
  descricao: string;
  /** Outros endereços que também contam como esta seção no menu. */
  inclui?: string[];
};

export const SECOES: Secao[] = [
  {
    href: "/",
    nome: "Início",
    descricao: "A porta de entrada de Mitrael",
  },
  {
    href: "/mapa/",
    nome: "Mapa",
    descricao: "O continente, suas terras e a história de cada lugar",
  },
  {
    href: "/personagens/",
    nome: "Personagens",
    descricao: "Os heróis que caminharam por estas terras",
  },
  {
    href: "/contos/",
    nome: "Crônicas",
    descricao: "As sessões jogadas e a história do continente",
    inclui: ["/eventos/"],
  },
  {
    href: "/regras/",
    nome: "Livro do Aventureiro",
    descricao: "As regras de 2024 em português: classes, magias, itens e monstros",
    inclui: ["/classes/", "/especies/", "/magias/", "/itens/", "/monstros/", "/bau/"],
  },
  {
    href: "/conquistas/",
    nome: "Conquistas",
    descricao: "Os feitos que você já realizou pela mesa",
  },
];

export const COMUNIDADE = {
  youtube: "https://www.youtube.com/@TerrasMitrael",
  discord: "https://discord.gg/SQuSnvxpdp",
};
