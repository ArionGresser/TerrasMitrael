import type { ReactNode } from "react";

/**
 * A hierarquia tipográfica do site.
 *
 * A fonte uncial (Brasao) fica reservada ao nome do site e a títulos curtos
 * de grande destaque, porque é marcante mas cansa em texto longo.
 * Todo o resto usa Cinzel, que aguenta títulos compridos sem perder clareza.
 */

export function TituloBrasao({
  children,
  className = "",
  as: Tag = "h1",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
}) {
  return (
    <Tag
      className={`font-brasao text-tinta-900 text-3xl leading-[1.15] sm:text-5xl lg:text-6xl ${className}`}
    >
      {children}
    </Tag>
  );
}

export function TituloSecao({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={`font-titulo text-tinta-900 text-2xl leading-tight font-bold sm:text-3xl ${className}`}
    >
      {children}
    </Tag>
  );
}

export function TituloCapitulo({
  children,
  className = "",
  as: Tag = "h3",
}: {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <Tag
      className={`font-titulo text-tinta-700 text-lg leading-snug font-semibold sm:text-xl ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Texto pequeno em maiúsculas espaçadas, como "Terceira Era". */
export function Sobretitulo({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-titulo text-tinta-500 text-[0.68rem] tracking-[0.3em] uppercase sm:text-xs ${className}`}
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
