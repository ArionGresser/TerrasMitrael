import Image from "next/image";
import { Selo } from "@/components/ui/Selo";

/**
 * O quadro de uma ilustração: a imagem, quando já existe, ou o quadro vazio
 * com o selo, segurando o lugar dela na página até a pintura chegar.
 *
 * "largo" é 16:9 (cenas, retratos de povo, monstros); "quadrado" é para
 * objetos, como os itens. "compacto" tira o aviso escrito, para cartões
 * pequenos, onde o selo sozinho já basta.
 */
export function QuadroDeArte({
  src,
  alt,
  formato = "largo",
  compacto = false,
  sizes,
  className = "",
}: {
  src?: string;
  alt: string;
  formato?: "largo" | "quadrado";
  compacto?: boolean;
  sizes?: string;
  className?: string;
}) {
  const medida =
    formato === "largo"
      ? "aspect-[16/9] w-full"
      : "mx-auto aspect-square w-44 sm:w-52";

  if (!src) {
    return (
      <div
        aria-hidden
        className={`border-dourado-600/30 bg-pergaminho-200/40 flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 text-center ${medida} ${className}`}
      >
        <Selo
          variante="marca"
          className={compacto ? "size-9 opacity-20" : "size-12 opacity-20 sm:size-14"}
        />
        {compacto ? null : (
          <p className="text-tinta-500 text-xs italic sm:text-sm">
            A ilustração ainda está sendo pintada.
          </p>
        )}
      </div>
    );
  }

  return (
    <figure
      className={`border-dourado-600/40 relative overflow-hidden rounded-sm border shadow-[0_8px_20px_-10px_rgba(0,0,0,0.7)] ${medida} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={
          sizes ??
          (formato === "largo" ? "(max-width: 640px) 100vw, 608px" : "208px")
        }
        className="object-cover"
      />
    </figure>
  );
}

/**
 * A miniatura de uma linha de lista (itens, bestiário) ou de um bloco de
 * regra. Sem arte, fica só um losango leve, porque são centenas de linhas.
 */
export function Miniatura({
  src,
  tamanho = "lista",
}: {
  src?: string;
  tamanho?: "lista" | "bloco";
}) {
  const medida = tamanho === "lista" ? "size-10" : "size-16 sm:size-20";
  const pixels = tamanho === "lista" ? 40 : 80;

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={pixels}
        height={pixels}
        className={`border-dourado-600/40 ${medida} shrink-0 rounded-sm border object-cover shadow-[0_2px_6px_-2px_rgba(0,0,0,0.5)]`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`border-dourado-600/25 bg-pergaminho-200/50 text-dourado-600/45 grid ${medida} shrink-0 place-items-center rounded-sm border border-dashed text-xs`}
    >
      ✦
    </span>
  );
}
