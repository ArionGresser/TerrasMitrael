import Image from "next/image";
import { Selo } from "@/components/ui/Selo";

/**
 * O quadro de uma ilustração: a imagem, quando já existe, ou o quadro vazio
 * com o selo, segurando o lugar dela na página até a pintura chegar.
 *
 * "largo" é 16:9 (cenas, retratos de povo, monstros); "quadrado" é para
 * objetos, como os itens, grande o bastante para ver os detalhes da pintura. "compacto" tira o aviso escrito, para cartões
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
      : "mx-auto aspect-square w-64 max-w-full sm:w-80";

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
          (formato === "largo" ? "(max-width: 640px) 100vw, 608px" : "(max-width: 640px) 256px, 320px")
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
  /** "larga" mostra a arte deitada inteira (16:9), como no Bestiário. */
  tamanho?: "lista" | "bloco" | "larga";
}) {
  const medida = {
    lista: "size-10",
    bloco: "size-16 sm:size-20",
    larga: "aspect-video h-auto w-28 sm:w-40",
  }[tamanho];
  const [largura, altura] = tamanho === "larga" ? [160, 90] : tamanho === "lista" ? [40, 40] : [80, 80];

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={largura}
        height={altura}
        sizes={tamanho === "larga" ? "(max-width: 640px) 112px, 160px" : undefined}
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

/**
 * As listas com arte em duas colunas (Grimório, Itens Mágicos, Equipamento
 * de Aventura). No celular a arte ocupa a largura do cartão, em cima do
 * nome; do sm para cima ela fica ao lado dele, com 144 px. A arte vem numa
 * moldura de madeira (.moldura-madeira, no globals.css).
 */
export const GRADE_DE_CARTOES = "grid grid-cols-2 gap-2 sm:gap-3";

export const CARTAO_COM_ARTE =
  "group hover:bg-pergaminho-200/50 flex h-full w-full flex-col gap-2.5 rounded-md p-2 text-left transition-colors sm:flex-row sm:items-center sm:gap-4";

export function ArteDoCartao({ src }: { src?: string }) {
  return (
    <span className="moldura-madeira aspect-square w-full sm:w-36 sm:shrink-0">
      {src ? (
        <Image
          src={src}
          alt=""
          width={144}
          height={144}
          sizes="(max-width: 640px) 45vw, 144px"
          className="size-full rounded-[4px] object-cover"
        />
      ) : (
        <span aria-hidden className="bg-pergaminho-200 grid size-full place-items-center rounded-[4px]">
          <Selo variante="marca" className="size-10 opacity-20" />
        </span>
      )}
    </span>
  );
}
