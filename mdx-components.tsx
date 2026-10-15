import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { TituloSecao, TituloCapitulo, Ornamento } from "@/components/ui/Titulo";
import { Ilustracao } from "@/components/ui/Ilustracao";

/**
 * Como o texto escrito em MDX vira HTML no site.
 *
 * Quem edita a lore escreve markdown normal ("## Título", "*itálico*",
 * "> citação") e o resultado sai já dentro da identidade visual,
 * sem precisar conhecer nenhum componente.
 */

/**
 * Fica fora da função e com nome próprio porque o componente Capitulos
 * procura por ele na árvore do texto para saber onde um capítulo começa.
 * Definido aqui dentro, cada chamada criaria uma função nova e a busca
 * nunca encontraria nada.
 */
export function TituloDeCapitulo({ children }: { children?: ReactNode }) {
  return (
    <TituloSecao as="h2" className="mt-10 first:mt-0">
      {children}
    </TituloSecao>
  );
}

/** O "---" do arquivo .mdx. Também precisa de nome próprio, pelo mesmo motivo. */
export function SeparadorDeTexto() {
  return <Ornamento className="my-9" />;
}

/**
 * Onde a história muda de lugar, para a música mudar junto: um marcador
 * invisível, sem altura, que o livro procura nas páginas (ver Livro.tsx e
 * as cenas em src/lib/musica.ts). Vai logo depois do título da parte, para
 * a troca cair na folha em que a parte começa.
 */
export function Cena({ nome }: { nome: string }) {
  return <span data-cena={nome} aria-hidden className="block h-0 overflow-hidden" />;
}

export function useMDXComponents(componentes: MDXComponents): MDXComponents {
  return {
    h2: TituloDeCapitulo,
    h3: ({ children }) => (
      <TituloCapitulo as="h3" className="mt-8">
        {children}
      </TituloCapitulo>
    ),
    p: ({ children }) => (
      <p className="mt-4 text-[0.95rem] leading-[1.8] sm:text-base">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 space-y-2 text-[0.95rem] leading-relaxed sm:text-base">
        {children}
      </ul>
    ),
    li: ({ children }) => (
      <li className="marker:text-dourado-600 ml-5 list-disc pl-1">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-dourado-600/50 text-tinta-700 mt-6 border-l-2 pl-4 italic">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="text-tinta-900 font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    hr: SeparadorDeTexto,
    // Disponível dentro dos arquivos .mdx sem precisar de import
    Ilustracao,
    Cena,
    a: ({ href, children }) => (
      <a
        href={href}
        className="decoration-dourado-600/60 hover:text-heraldico-vermelho underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
    ...componentes,
  };
}
