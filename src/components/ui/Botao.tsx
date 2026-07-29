import type { ReactNode } from "react";
import Link from "next/link";

type Variante = "primario" | "secundario" | "discreto";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-heraldico-vermelho text-pergaminho-50 border-heraldico-vermelho hover:bg-heraldico-vermelho-claro shadow-[0_2px_5px_rgba(0,0,0,0.32)]",
  secundario:
    "bg-transparent text-tinta-900 border-dourado-600/60 hover:bg-dourado-400/20 hover:border-dourado-600",
  discreto:
    "bg-transparent text-tinta-700 border-transparent hover:text-tinta-900 hover:border-dourado-600/40",
};

const BASE =
  "font-titulo inline-flex items-center justify-center gap-2 rounded-sm border px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] min-h-11";

/**
 * Botão-link. min-h-11 garante a área de toque de 44px que o dedo precisa —
 * o site é usado principalmente no celular.
 */
export function BotaoLink({
  href,
  children,
  variante = "secundario",
  className = "",
  externo = false,
}: {
  href: string;
  children: ReactNode;
  variante?: Variante;
  className?: string;
  externo?: boolean;
}) {
  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BASE} ${VARIANTES[variante]} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${BASE} ${VARIANTES[variante]} ${className}`}>
      {children}
    </Link>
  );
}

export function Botao({
  children,
  onClick,
  variante = "secundario",
  className = "",
  ...props
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: Variante;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BASE} ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
