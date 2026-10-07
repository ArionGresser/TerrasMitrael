import type { ReactNode } from "react";

/**
 * Um quadro da ficha: moldura de filete dourado com cantoneiras, e o nome
 * da seção numa plaquinha pousada sobre a borda de cima, como o rótulo de
 * uma gaveta. Separa cada parte da ficha sem precisar de linha solta entre
 * elas, e o olho acha a seção pelo quadro antes de ler o nome.
 */
export function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="painel-ficha mt-10 px-3 pt-6 pb-4 sm:px-5">
      <h3 className="placa-painel font-titulo text-tinta-900 absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[0.66rem] leading-none font-bold tracking-[0.2em] whitespace-nowrap uppercase">
        {titulo}
      </h3>
      {children}
    </section>
  );
}
