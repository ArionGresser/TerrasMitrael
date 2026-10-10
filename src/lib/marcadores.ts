/**
 * A imagem do mapa. Para trocar por uma versão melhor (maior, mais nítida),
 * basta mudar o arquivo e as medidas aqui: como os marcadores estão em
 * porcentagem, eles continuam no lugar se o desenho for o mesmo. Quanto
 * maior a imagem, mais o zoom aproxima sem borrar.
 */
export const MAPA = {
  src: "/images/map.jpg",
  largura: 1600,
  altura: 1132,
  alt: "Mapa do continente de Mitrael, com os mares Bazáltico, de Qän e Leviano, as Terras de Askar a oeste e as Terras de Mitrael a leste",
  /**
   * Este desenho já traz os nomes pintados. Com um mapa novo sem nomes,
   * mude para true: os marcadores passam a mostrar o nome o tempo todo.
   */
  rotulos: false,
};

/**
 * Posição dos marcadores sobre o mapa, em porcentagem da imagem.
 * A imagem original tem 1600 x 1132 pixels.
 *
 * Para ajustar um marcador, mude apenas x e y. O valor é a posição do
 * centro do marcador: x cresce para a direita, y cresce para baixo.
 */

export type Marcador = {
  slug: string;
  nome: string;
  x: number;
  y: number;
  /** De que lado o rótulo aparece, para não sair da imagem. */
  lado?: "esquerda" | "direita";
};

/** Locais com história própria, que abre no painel do mapa. */
export const MARCADORES_LOCAIS: Marcador[] = [
  { slug: "sovara-mithr", nome: "Sovara Mithr", x: 62.2, y: 53.0 },
  { slug: "arauto", nome: "Arauto dos Feiticeiros", x: 90.2, y: 66.6, lado: "esquerda" },
  { slug: "vernaculo", nome: "Vernáculo dos Clérigos", x: 88.3, y: 76.8, lado: "esquerda" },
  { slug: "razavar", nome: "Razavar", x: 90.3, y: 88.0, lado: "esquerda" },
  { slug: "putrefados", nome: "Terra dos Putrefados", x: 59.5, y: 87.8 },
  { slug: "askar", nome: "Terras de Askar", x: 20.0, y: 70.0 },
];
