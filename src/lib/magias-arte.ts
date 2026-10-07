import fs from "node:fs";
import path from "node:path";

/**
 * As artes do grimório: o ícone de cada magia e as ilustrações de uso.
 *
 * Nada é cadastrado à mão. Basta soltar o arquivo na pasta com o nome da
 * magia (o mesmo slug do endereço) e o site acha na hora de gerar as páginas:
 *
 *   public/images/magias/icones/bola-de-fogo.webp
 *   public/images/magias/ilustracoes/bola-de-fogo-1.webp   (até -3)
 *
 * Enquanto o arquivo não existe, aparece o selo de "em obra" no lugar.
 * Só roda no servidor, porque olha o disco.
 */

const PUBLICO = path.join(process.cwd(), "public");
const FORMATOS = [".webp", ".jpg", ".png"];
const MAXIMO_DE_ILUSTRACOES = 3;

function procurar(semExtensao: string): string | undefined {
  for (const formato of FORMATOS) {
    const relativo = `${semExtensao}${formato}`;
    if (fs.existsSync(path.join(PUBLICO, relativo))) return `/${relativo}`;
  }
  return undefined;
}

export function iconeDaMagia(slug: string): string | undefined {
  return procurar(`images/magias/icones/${slug}`);
}

export function ilustracoesDaMagia(slug: string): string[] {
  const achadas: string[] = [];
  for (let n = 1; n <= MAXIMO_DE_ILUSTRACOES; n++) {
    const arquivo = procurar(`images/magias/ilustracoes/${slug}-${n}`);
    if (arquivo) achadas.push(arquivo);
  }
  return achadas;
}
