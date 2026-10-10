import Image from "next/image";

/**
 * Ilustração no meio do texto da lore.
 * Fica disponível dentro dos arquivos .mdx sem precisar de import.
 */
export function Ilustracao({
  src,
  alt,
  legenda,
  quadrada = false,
}: {
  src: string;
  alt: string;
  legenda?: string;
  /** Inteira num quadro quadrado, em vez de cortada na faixa 16:9. */
  quadrada?: boolean;
}) {
  return (
    <figure className={quadrada ? "mx-auto my-8 max-w-md" : "my-8"}>
      <div
        className={`border-madeira-800/25 shadow-pergaminho relative w-full overflow-hidden rounded-sm border ${
          quadrada ? "aspect-square" : "aspect-[16/9]"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={quadrada ? "(max-width: 768px) 100vw, 448px" : "(max-width: 768px) 100vw, 700px"}
          className={quadrada ? "object-cover" : "object-cover sepia-[0.16]"}
        />
      </div>
      {legenda ? (
        <figcaption className="text-tinta-500 mt-2 text-center text-xs italic">
          {legenda}
        </figcaption>
      ) : null}
    </figure>
  );
}
