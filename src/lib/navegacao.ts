/**
 * As seções do site, em um só lugar.
 * Mudar aqui muda o menu, o rodapé e qualquer índice, nunca em três lugares.
 */

export type Secao = {
  href: string;
  nome: string;
  descricao: string;
};

export const SECOES: Secao[] = [
  {
    href: "/",
    nome: "Início",
    descricao: "A porta de entrada de Mitrael",
  },
  {
    href: "/locais/",
    nome: "Locais",
    descricao: "As terras, cidades e florestas do continente",
  },
  {
    href: "/eventos/",
    nome: "Eventos",
    descricao: "A história que moldou o mundo",
  },
  {
    href: "/personagens/",
    nome: "Personagens",
    descricao: "Os heróis que caminharam por estas terras",
  },
  {
    href: "/contos/",
    nome: "Contos",
    descricao: "As sessões jogadas, contadas como história",
  },
  {
    href: "/magias/",
    nome: "Grimório",
    descricao: "As magias das regras de 2024, em português",
  },
  {
    href: "/classes/",
    nome: "Classes",
    descricao: "As classes das regras de 2024, em português",
  },
  {
    href: "/especies/",
    nome: "Espécies",
    descricao: "Os povos das regras de 2024, em português",
  },
  {
    href: "/mapa/",
    nome: "Mapa",
    descricao: "O continente inteiro diante de você",
  },
];

export const COMUNIDADE = {
  youtube: "https://www.youtube.com/@TerrasMitrael",
  discord: "https://discord.gg/SQuSnvxpdp",
};
