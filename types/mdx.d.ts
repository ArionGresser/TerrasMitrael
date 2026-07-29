/**
 * Ensina ao TypeScript o formato dos arquivos de conteúdo em .mdx.
 *
 * Cada arquivo da lore exporta duas coisas: o texto (default) e o `meta`
 * com os dados da entrada (nome, resumo, imagem…).
 */
declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const meta: Record<string, unknown>;

  const MDXContent: ComponentType<Record<string, unknown>>;
  export default MDXContent;
}
