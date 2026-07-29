import type { ReactNode } from "react";

/**
 * A hierarquia tipográfica do site.
 *
 * A fonte uncial (Brasao) fica reservada ao nome do site e a títulos curtos
 * de grande destaque, porque é marcante mas cansa em texto longo.
 * Todo o resto usa Cinzel, que aguenta títulos compridos sem perder clareza.
 *
 * O tom escolhe a cor conforme o fundo: "tinta" para texto sobre pergaminho,
 * "claro" para texto direto sobre a madeira da mesa. Passar a cor por
 * className não funcionaria, porque duas classes utilitárias de cor têm a
 * mesma força e quem vence é a ordem no CSS gerado, não a ordem de escrita.
 */

type Tom = "tinta" | "claro";

const TONS: Record<Tom, { forte: string; medio: string; fraco: string }> = {
  tinta: {
    forte: "text-tinta-900",
    medio: "text-tinta-700",
    fraco: "text-tinta-500",
  },
  claro: {
    forte: "text-pergaminho-100",
    medio: "text-pergaminho-200",
    fraco: "text-pergaminho-300",
  },
};

export function TituloBrasao({
  children,
  className = "",
  tom = "tinta",
  as: Tag = "h1",
}: {
  children: ReactNode;
  className?: string;
  tom?: Tom;
  as?: "h1" | "h2" | "p" | "span";
}) {
  return (
    <Tag
      className={`font-brasao ${TONS[tom].forte} text-3xl leading-[1.15] sm:text-5xl lg:text-6xl ${className}`}
    >
      {children}
    </Tag>
  );
}

export function TituloSecao({
  children,
  className = "",
  tom = "tinta",
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  tom?: Tom;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={`font-titulo ${TONS[tom].forte} text-2xl leading-tight font-bold sm:text-3xl ${className}`}
    >
      {children}
    </Tag>
  );
}

export function TituloCapitulo({
  children,
  className = "",
  tom = "tinta",
  as: Tag = "h3",
}: {
  children: ReactNode;
  className?: string;
  tom?: Tom;
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <Tag
      className={`font-titulo ${TONS[tom].medio} text-lg leading-snug font-semibold sm:text-xl ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Texto pequeno em maiúsculas espaçadas, como "Terceira Era". */
export function Sobretitulo({
  children,
  className = "",
  tom = "tinta",
}: {
  children: ReactNode;
  className?: string;
  tom?: Tom;
}) {
  return (
    <p
      className={`font-titulo ${TONS[tom].fraco} text-[0.68rem] tracking-[0.3em] uppercase sm:text-xs ${className}`}
    >
      {children}
    </p>
  );
}

/** Separador ornamental entre blocos de conteúdo. */
export function Ornamento({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="via-dourado-600/50 h-px w-12 bg-gradient-to-r from-transparent to-transparent sm:w-20" />
      <span className="text-dourado-600 text-sm">✦</span>
      <span className="via-dourado-600/50 h-px w-12 bg-gradient-to-r from-transparent to-transparent sm:w-20" />
    </div>
  );
}
