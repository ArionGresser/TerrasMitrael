"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { MesaAPI, ResultadoDoDado } from "@/lib/mesa3d/cena";

declare global {
  interface Window {
    __mesa3d?: MesaAPI;
  }
}

/**
 * A mesa em 3D: o pano, as velas, as moedas e o d20.
 *
 * O canvas fica por cima do papel (sem receber clique nem atrapalhar a
 * seleção de texto), para o dado e as moedas poderem rolar pela tela toda.
 * O resto das coisas mora só nas laterais, na madeira que sobra.
 *
 * Só existe em computador com tela larga (a partir de 1280 px e mouse), e
 * fora do mapa, que ocupa a tela inteira. A cena e as bibliotecas de 3D e
 * de física só são baixadas quando o navegador fica à toa depois de abrir
 * a página: quem está no celular nunca baixa nada disso.
 *
 * O resultado do dado aparece aqui, num rótulo preso à madeira, e não na
 * tela: se a página rolar, ele vai junto com o dado.
 */
export function Mesa3D() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const caminho = usePathname();
  const [ativo, setAtivo] = useState(false);
  const [resultado, setResultado] = useState<(ResultadoDoDado & { vez: number }) | null>(null);

  // Liga só onde faz sentido
  useEffect(() => {
    const tela = window.matchMedia("(min-width: 1280px) and (pointer: fine)");
    const decidir = () => setAtivo(tela.matches && !caminho?.startsWith("/mapa"));
    decidir();
    tela.addEventListener("change", decidir);
    return () => tela.removeEventListener("change", decidir);
  }, [caminho]);

  useEffect(() => {
    if (!ativo) return;
    let cancelado = false;
    let mesa: MesaAPI | null = null;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const iniciar = () => {
      // Os números do d20 são pintados na fonte dos títulos: ela precisa
      // ter chegado antes, senão o dado sai com a fonte reserva
      const fonte = getComputedStyle(document.documentElement).getPropertyValue("--fonte-titulo").trim();
      const fontePronta = fonte ? document.fonts.load(`700 80px ${fonte}`).catch(() => null) : null;
      Promise.all([import("@/lib/mesa3d/cena"), fontePronta])
        .then(([{ criarMesa }]) => {
          if (cancelado || !canvas.current) return;
          const teste = document.createElement("canvas");
          if (!teste.getContext("webgl2") && !teste.getContext("webgl")) return;
          mesa = criarMesa(
            canvas.current,
            { resultado: (r) => setResultado((a) => ({ ...r, vez: (a?.vez ?? 0) + 1 })) },
            reduzido,
          );
          window.__mesa3d = mesa;
        })
        .catch((erro) => {
          // Sem 3D: a mesa continua sendo só madeira
          if (process.env.NODE_ENV !== "production") console.error("Mesa 3D:", erro);
        });
    };
    const temOcioso = typeof window.requestIdleCallback === "function";
    const ocioso = temOcioso ? window.requestIdleCallback(iniciar, { timeout: 2500 }) : setTimeout(iniciar, 1200);

    return () => {
      cancelado = true;
      if (temOcioso) window.cancelIdleCallback(ocioso as number);
      else clearTimeout(ocioso);
      mesa?.destruir();
      if (window.__mesa3d === mesa) delete window.__mesa3d;
    };
  }, [ativo]);

  // Página nova: as coisas da mesa se arrumam de novo para ela
  useEffect(() => {
    setResultado(null);
    window.__mesa3d?.reconstruir();
  }, [caminho]);

  if (!ativo) return null;

  return (
    <>
      <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[15] h-screen w-screen" />
      {resultado ? (
        <div
          key={resultado.vez}
          role="status"
          className="resultado-dado pointer-events-none absolute z-[16] -translate-x-1/2"
          style={{ left: resultado.x, top: resultado.y - 70 }}
        >
          <span className={`numero ${resultado.valor === 20 ? "divino" : resultado.valor === 1 ? "falha" : ""}`}>
            {resultado.valor}
          </span>
          {resultado.valor === 20 ? <span className="legenda">Vinte natural!</span> : null}
          {resultado.valor === 1 ? <span className="legenda falha">Falha crítica</span> : null}
        </div>
      ) : null}
    </>
  );
}
