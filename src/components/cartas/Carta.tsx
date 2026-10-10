import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { MOLDURAS, type TipoDeCarta } from "@/lib/cartas";

/**
 * Uma carta: a moldura pintada por cima, a arte na janela e o texto nas
 * áreas vazias, cada coisa no lugar medido em src/lib/cartas.ts.
 *
 * As letras se medem pela largura da carta (cqw), então a carta é a mesma
 * em qualquer tamanho: na janela do celular, na do computador e impressa
 * em 63 x 88 mm. O texto das regras rola dentro do painel na tela; na
 * impressão ele encolhe até caber (ver imprimirCarta).
 *
 * Não tem estado nem efeito: serve no servidor e no navegador. O atributo
 * data-carta é o que as listas procuram para abrir a carta numa janela.
 */
export function Carta({
  tipo,
  nome,
  arte,
  encaixe = "inteira",
  linhaDeTipo,
  medalhao,
  rodape,
  children,
  className = "",
}: {
  tipo: TipoDeCarta;
  nome: string;
  arte?: string;
  /**
   * "inteira" para as artes quadradas (ícones de magia, itens, equipamento):
   * a pintura cabe inteira na janela larga, com ela mesma desfocada atrás.
   * "cobrir" para as cenas largas, que preenchem a janela.
   */
  encaixe?: "inteira" | "cobrir";
  /** A faixa abaixo da arte, como "Evocação de 3º círculo". */
  linhaDeTipo: string;
  /** O que vai no círculo do canto: o círculo da magia, a pedra da raridade... */
  medalhao?: ReactNode;
  rodape?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const m = MOLDURAS[tipo];
  const caixa = ([x0, y0, x1, y1]: [number, number, number, number]): CSSProperties => ({
    left: `${x0 * 100}%`,
    top: `${y0 * 100}%`,
    width: `${(x1 - x0) * 100}%`,
    height: `${(y1 - y0) * 100}%`,
  });
  // Nome comprido encolhe para caber na placa numa linha só
  const letraDoNome = nome.length > 28 ? 3.6 : nome.length > 20 ? 4.4 : 5.4;

  return (
    <div
      data-carta={tipo}
      className={`carta @container relative w-full select-text ${className}`}
      style={{ aspectRatio: String(m.proporcao) }}
    >
      <div className="bg-madeira-950 absolute overflow-hidden" style={caixa(m.janela)}>
        {arte && encaixe === "inteira" ? (
          <>
            <Image src={arte} alt="" fill sizes="160px" className="scale-125 object-cover blur-[2cqw] brightness-[0.55]" />
            <Image src={arte} alt="" fill sizes="(max-width: 640px) 60vw, 300px" className="object-contain" />
          </>
        ) : arte ? (
          <Image src={arte} alt="" fill sizes="(max-width: 640px) 80vw, 400px" className="object-cover" />
        ) : null}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.src} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full" />

      <h2
        className="font-titulo text-tinta-900 absolute flex items-center justify-center overflow-hidden px-[2cqw] text-center leading-none font-bold whitespace-nowrap"
        style={{ ...caixa(m.titulo), fontSize: `${letraDoNome}cqw` }}
      >
        {nome}
      </h2>

      {medalhao ? (
        <div
          className={`font-titulo absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center leading-none font-bold ${
            m.medalhaoEscuro ? "text-pergaminho-50 [text-shadow:0_0.3cqw_0.6cqw_#000]" : "text-tinta-900"
          }`}
          style={{
            left: `${m.medalhao.x * 100}%`,
            top: `${m.medalhao.y * 100}%`,
            width: `${m.medalhao.d * 100}%`,
            aspectRatio: "1",
            fontSize: "6.5cqw",
          }}
        >
          {medalhao}
        </div>
      ) : null}

      <p
        data-faixa
        className="font-titulo text-tinta-700 absolute flex items-center justify-center overflow-hidden px-[1.5cqw] text-center leading-none font-bold tracking-[0.06em] whitespace-nowrap uppercase"
        style={{ ...caixa(m.tipo), fontSize: linhaDeTipo.length > 32 ? "2.4cqw" : "2.9cqw" }}
      >
        {linhaDeTipo}
      </p>

      <div className="carta-texto absolute overflow-y-auto overscroll-contain px-[3cqw] py-[2.4cqw]" style={caixa(m.texto)}>
        {children}
      </div>

      {rodape ? (
        <p
          className="font-titulo text-tinta-900 absolute flex items-center justify-center overflow-hidden px-[1cqw] text-center leading-none font-bold whitespace-nowrap"
          style={{ ...caixa(m.rodape), fontSize: "2.8cqw" }}
        >
          {rodape}
        </p>
      ) : null}
    </div>
  );
}

/** A pedra do engaste do item mágico, na cor da raridade. */
export function PedraDaRaridade({ cor }: { cor: string }) {
  return (
    <span
      aria-hidden
      className="block size-[68%] rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, #fff8 0%, ${cor} 38%, color-mix(in srgb, ${cor} 55%, #000) 100%)`,
        boxShadow: `inset 0 -0.6cqw 1cqw #0006, 0 0 2.2cqw ${cor}`,
      }}
    />
  );
}
