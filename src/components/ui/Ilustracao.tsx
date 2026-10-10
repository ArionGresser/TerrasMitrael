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
  emPe = false,
  pequena = false,
}: {
  src: string;
  alt: string;
  legenda?: string;
  /** Inteira num quadro quadrado, em vez de cortada na faixa 16:9. */
  quadrada?: boolean;
  /** Inteira num quadro em pé (11:16), para desenho de corpo inteiro. */
  emPe?: boolean;
  /** Um emblema pequeno e quadrado no meio do texto, como um brasão. */
  pequena?: boolean;
}) {
  const inteira = quadrada || emPe || pequena;
  return (
    <figure
      className={
        pequena ? "mx-auto my-6 w-36" : emPe ? "mx-auto my-8 max-w-xs sm:max-w-sm" : quadrada ? "mx-auto my-8 max-w-md" : "my-8"
      }
    >
      <div
        className={`border-madeira-800/25 shadow-pergaminho relative w-full overflow-hidden rounded-sm border ${
          emPe ? "aspect-[11/16]" : quadrada || pequena ? "aspect-square" : "aspect-[16/9]"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={pequena ? "144px" : inteira ? "(max-width: 768px) 100vw, 448px" : "(max-width: 768px) 100vw, 700px"}
          className={inteira ? "object-cover" : "object-cover sepia-[0.16]"}
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
