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
export function useMDXComponents(componentes: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <TituloSecao as="h2" className="mt-10 first:mt-0">
        {children}
      </TituloSecao>
    ),
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
    hr: () => <Ornamento className="my-9" />,
    // Disponível dentro dos arquivos .mdx sem precisar de import
    Ilustracao,
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
