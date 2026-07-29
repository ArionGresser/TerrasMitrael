import Image from "next/image";

/**
 * Ilustração no meio do texto da lore.
 * Fica disponível dentro dos arquivos .mdx sem precisar de import.
 */
export function Ilustracao({
  src,
  alt,
  legenda,
}: {
  src: string;
  alt: string;
  legenda?: string;
}) {
  return (
    <figure className="my-8">
      <div className="border-madeira-800/25 shadow-pergaminho relative aspect-[16/9] w-full overflow-hidden rounded-sm border">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover sepia-[0.16]"
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
