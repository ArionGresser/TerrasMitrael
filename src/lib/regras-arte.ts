import { arte } from "./arte";

/**
 * Quais itens dos documentos de regra têm ilustração, e de que formato.
 * O arquivo vai em public/images/regras/<documento>/<item>.webp, com o nome
 * da âncora do item (o que aparece depois do # no endereço):
 *
 *   public/images/regras/antecedentes/acolito.webp
 *   public/images/regras/talentos/alerta.webp
 *   public/images/regras/equipamento/corda.webp
 *
 * Os itens que só explicam regra ("Como Ler a Tabela de Armas") ficam sem.
 */

export type ArteDeRegra = { formato: "largo" | "quadrado"; src?: string };

/** No equipamento, as tabelas ganham um quadro largo, como uma prateleira. */
const PRATELEIRAS = new Set([
  "armas-simples-corpo-a-corpo",
  "armas-simples-a-distancia",
  "armas-marciais-corpo-a-corpo",
  "armas-marciais-a-distancia",
  "armaduras-leves",
  "armaduras-medias",
  "armaduras-pesadas",
  "escudo",
  "ferramentas-de-artesao",
  "outras-ferramentas",
  "montarias-e-carga",
  "bardas-e-selas",
  "veiculos-grandes",
]);

function formato(
  documento: string,
  grupo: string | undefined,
  item: string,
): ArteDeRegra["formato"] | undefined {
  if (documento === "antecedentes" || documento === "talentos") return "largo";
  if (documento === "equipamento") {
    if (grupo === "Equipamento de Aventura") return "quadrado";
    if (PRATELEIRAS.has(item)) return "largo";
  }
  return undefined;
}

export function arteDoItemDeRegra(
  documento: string,
  grupo: string | undefined,
  item: string,
): ArteDeRegra | undefined {
  const f = formato(documento, grupo, item);
  if (!f) return undefined;
  // Os objetos aparecem com até 112 px na lista; a arte cheia serve, porque
  // o carregador de imagem entrega a cópia de 256 px dela
  return { formato: f, src: arte(`regras/${documento}`, item) };
}
