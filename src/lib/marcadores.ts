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

/** Locais que têm página própria. */
export const MARCADORES_LOCAIS: Marcador[] = [
  { slug: "sovara-mithr", nome: "Sovara Mithr", x: 62.2, y: 53.0 },
  { slug: "arauto", nome: "Arauto dos Feiticeiros", x: 90.2, y: 66.6, lado: "esquerda" },
  { slug: "vernaculo", nome: "Vernáculo dos Clérigos", x: 88.3, y: 76.8, lado: "esquerda" },
  { slug: "razavar", nome: "Razavar", x: 90.3, y: 88.0, lado: "esquerda" },
  { slug: "putrefados", nome: "Terra dos Putrefados", x: 59.5, y: 87.8 },
  { slug: "askar", nome: "Terras de Askar", x: 20.0, y: 70.0 },
];

/**
 * Lugares que aparecem na lore e estão desenhados no mapa, mas ainda não
 * têm página própria. Servem de referência para futuras entradas.
 */
export const LUGARES_SEM_PAGINA = [
  { nome: "Os Dedos da Tundra", contexto: "Terra natal de Tyr Vidar" },
  { nome: "Passagem Golem de Gelo", contexto: "Onde Howai passou a infância" },
  { nome: "Pondor do Aramate", contexto: "Ilha natal de Levi, tomada pelos Orcs" },
  { nome: "Entrerrio", contexto: "A taverna onde Levi foi criado" },
  { nome: "Guratan", contexto: "Onde Baine trabalhou com Filavandrel" },
  { nome: "Terras de Tungel", contexto: "Povos decisivos na Grande Guerra" },
  { nome: "Vérsia", contexto: "Os Domadores de Portais, convocados no fim da guerra" },
  { nome: "Drakyrbon Mahur", contexto: "Reino dos dragões e dos Filhos do Fogo" },
];
