import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Os botões do site são placas rebitadas na mesa.
 *
 * Cor, brilho e profundidade vêm do mesmo lugar que o selo de cera da
 * navegação, para o site inteiro parecer feito pela mesma oficina. O que muda
 * é o formato: o selo é redondo, a placa é chapa de cantos cortados.
 *
 * O recorte dos cantos mora num span interno, nunca no botão. Aplicado no
 * botão, ele cortaria fora o anel de foco de quem navega por teclado.
 */

type Variante = "primario" | "secundario" | "discreto";

const CHAPAS: Record<Variante, string> = {
  primario: "placa placa-cera",
  secundario: "placa placa-bronze",
  discreto: "placa opacity-0 group-hover:opacity-100 placa-bronze",
};

const TEXTOS: Record<Variante, string> = {
  primario: "text-pergaminho-50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]",
  secundario: "text-tinta-900",
  discreto: "text-tinta-700 group-hover:text-tinta-900",
};

const BASE =
  "group font-titulo relative inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide transition-transform duration-150 active:translate-y-px active:scale-[0.985]";

/** A sombra que a placa joga na mesa acompanha o recorte dos cantos. */
const SOMBRA = "drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]";

function Conteudo({
  children,
  variante,
}: {
  children: ReactNode;
  variante: Variante;
}) {
  return (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 transition-[filter] duration-150 group-hover:brightness-110 ${CHAPAS[variante]}`}
      />
      <span className={`relative ${TEXTOS[variante]}`}>{children}</span>
    </>
  );
}

/**
 * min-h-11 garante a área de toque de 44px que o dedo precisa,
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
  const classes = `${BASE} ${SOMBRA} ${className}`;

  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        <Conteudo variante={variante}>{children}</Conteudo>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      <Conteudo variante={variante}>{children}</Conteudo>
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
      className={`${BASE} ${SOMBRA} ${className}`}
      {...props}
    >
      <Conteudo variante={variante}>{children}</Conteudo>
    </button>
  );
}
