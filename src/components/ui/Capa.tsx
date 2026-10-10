import Image from "next/image";
import type { ReactNode } from "react";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";
import { Ornamento, Sobretitulo, TituloBrasao } from "@/components/ui/Titulo";

/**
 * A capa de uma tela: a arte da seção na largura da folha, escurecida pela
 * mesma vinheta da abertura da página inicial, com o nome escrito direto
 * sobre ela. No celular a arte vai de borda a borda e fica um pouco mais
 * alta, para o título caber com folga.
 *
 * O selo de voltar, quando a tela tem para onde voltar, fica no canto de
 * cima da própria arte.
 *
 * A apresentação (children) vem logo abaixo, em letra clara sobre a
 * madeira. A arte é decorativa, porque o título já diz onde a pessoa está,
 * e carrega com prioridade: é a primeira coisa que aparece na tela.
 */
export function Capa({
  imagem,
  sobretitulo,
  titulo,
  original,
  volta,
  className = "",
  children,
}: {
  imagem: string;
  sobretitulo: string;
  titulo: string;
  /** O nome em inglês, para quem conhece as regras pelo livro original. */
  original?: string;
  /** Para onde o selo do canto leva, como a lista de onde a pessoa veio. */
  volta?: { href: string; rotulo: string };
  className?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <header
        className={`relative -mx-4 grid aspect-[4/3] place-items-center overflow-hidden shadow-[0_14px_40px_-12px_rgba(0,0,0,0.85)] sm:mx-0 sm:aspect-[16/9] sm:rounded-sm sm:border sm:border-black/40 ${className}`}>
        <Image
          src={imagem}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
        <div aria-hidden className="vinheta-abertura absolute inset-0" />
        {volta ? <SeloDeVolta href={volta.href} rotulo={volta.rotulo} lugar="capa" /> : null}

        <div className="relative px-6 text-center">
          <Sobretitulo tom="claro" className="sobretitulo-abertura text-dourado-300!">
            {sobretitulo}
          </Sobretitulo>
          <TituloBrasao tom="claro" className="titulo-abertura mt-3 sm:mt-4">
            {titulo}
          </TituloBrasao>
          {original ? (
            <p className="sobretitulo-abertura text-pergaminho-200 mt-2 text-sm italic" lang="en">
              {original}
            </p>
          ) : null}
          <Ornamento className="mt-5 [&_span]:text-dourado-300 sm:mt-6" />
        </div>
      </header>

      {children ? (
        <div className="text-pergaminho-200/90 mx-auto mt-6 max-w-lg text-center text-base leading-relaxed italic">
          {children}
        </div>
      ) : null}
    </>
  );
}
