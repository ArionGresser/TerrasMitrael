"use client";

import type { FichaAtual } from "@/lib/personagens";
import { ajustarFicha, temAjustes, useAjustes } from "@/lib/ajustes-da-ficha";
import { FichaAtualNumeros } from "@/components/personagens/FichaAtualNumeros";

/**
 * Os números da ficha do site, com os ajustes da mesa por cima quando a
 * ficha viva estiver aberta (dono e Mestre). Para o resto do mundo, e
 * enquanto a ficha viva não chega, fica igual à ficha do site.
 */
export function NumerosDaFicha({ slug, ficha }: { slug: string; ficha: FichaAtual }) {
  const ajustes = useAjustes(slug);
  return (
    <>
      {temAjustes(ajustes) ? (
        <p className="text-tinta-500 mt-6 text-center text-xs italic">Com os ajustes feitos na mesa.</p>
      ) : null}
      <FichaAtualNumeros ficha={ajustarFicha(ficha, ajustes)} />
    </>
  );
}
