import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Inclinação sutil, como uma folha largada sobre a mesa. */
  inclinacao?: "nenhuma" | "esquerda" | "direita";
  /** Variação da borda irregular (1 a 3), para folhas vizinhas não ficarem idênticas. */
  borda?: 1 | 2 | 3;
  /** "leitura" ocupa quase a tela toda no celular; "cartao" é um bloco menor. */
  variante?: "leitura" | "cartao";
  className?: string;
  as?: "article" | "section" | "div" | "aside";
};

const INCLINACOES = {
  nenhuma: "",
  esquerda: "-rotate-[0.4deg]",
  direita: "rotate-[0.35deg]",
} as const;

const BORDAS = {
  1: "pergaminho-borda-1",
  2: "pergaminho-borda-2",
  3: "pergaminho-borda-3",
} as const;

const VARIANTES = {
  leitura: "px-5 py-8 sm:px-12 sm:py-14",
  cartao: "px-4 py-5 sm:px-6 sm:py-7",
} as const;

/**
 * Uma folha de pergaminho pousada sobre a mesa.
 * É a superfície onde todo o conteúdo do site é lido.
 */
export function Pergaminho({
  children,
  inclinacao = "nenhuma",
  borda = 1,
  variante = "leitura",
  className = "",
  as: Tag = "article",
}: Props) {
  // A inclinação vale apenas para cartões.
  // Girar uma folha de leitura, que pode ter milhares de pixels de altura,
  // joga as pontas para fora da tela: a largura da caixa cresce em
  // altura × seno do ângulo, o que criava rolagem lateral no celular.
  const giro = variante === "cartao" ? INCLINACOES[inclinacao] : "";

  return (
    <Tag
      className={`textura-pergaminho borda-envelhecida shadow-pergaminho text-tinta-900 ${BORDAS[borda]} ${giro} ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </Tag>
  );
}
