import fs from "node:fs";
import path from "node:path";

/**
 * As artes do Livro do Aventureiro: espécies, classes, itens, monstros e as
 * regras. Nada é cadastrado à mão. Basta soltar o arquivo na pasta da seção
 * com o nome do endereço da página, e o site acha na hora de gerar:
 *
 *   public/images/especies/anao.webp
 *   public/images/classes/barbaro.webp
 *   public/images/itens/bolsa-devoradora.webp
 *   public/images/monstros/dragao-vermelho-adulto.webp
 *   public/images/regras/talentos/alerta.webp
 *
 * O scripts/arte/importar.py também gera uma versão pequena (160 px) em
 * <pasta>/mini/, que as listas usam no lugar da grande.
 *
 * Enquanto o arquivo não existe, a página mostra o quadro vazio no lugar.
 * Só roda no servidor, porque olha o disco.
 */

const PUBLICO = path.join(process.cwd(), "public");
const FORMATOS = [".webp", ".jpg", ".png"];

export function arte(pasta: string, nome: string): string | undefined {
  for (const formato of FORMATOS) {
    const relativo = `images/${pasta}/${nome}${formato}`;
    if (fs.existsSync(path.join(PUBLICO, relativo))) return `/${relativo}`;
  }
  return undefined;
}
