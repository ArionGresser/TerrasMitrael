/**
 * "Dádiva do Destino" → "dadiva-do-destino", para os endereços com #.
 *
 * Fica num arquivo próprio, sem nada de servidor, para o navegador também
 * poder montar os links do glossário (regras.ts lê o disco).
 */
export function ancora(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
