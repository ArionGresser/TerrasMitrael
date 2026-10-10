"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { anotarLugar, voltaPendente } from "@/lib/rolagem";

/**
 * Anota, enquanto a pessoa rola, onde ela está em cada tela, e devolve a
 * tela ao lugar anotado quando ela volta pelo selo do papel (SeloDeVolta).
 *
 * A volta espera dois quadros: a lista precisa primeiro reler os filtros do
 * endereço e se redesenhar, senão a altura guardada cairia em outra magia.
 * E confere de novo um pouco depois, para o caso de algo acima ter
 * terminado de crescer nesse meio tempo.
 */
export function MemoriaDaRolagem() {
  const caminho = usePathname();

  useEffect(() => {
    let quadro = 0;
    const aoRolar = () => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        anotarLugar();
      });
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  useEffect(() => {
    const y = voltaPendente(caminho);
    if (y === null) return;
    const ir = () => window.scrollTo({ top: y, behavior: "instant" });
    let segundo = 0;
    const primeiro = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(ir);
    });
    const conferir = window.setTimeout(() => {
      if (Math.abs(window.scrollY - y) > 4) ir();
    }, 350);
    return () => {
      cancelAnimationFrame(primeiro);
      cancelAnimationFrame(segundo);
      window.clearTimeout(conferir);
    };
  }, [caminho]);

  return null;
}
