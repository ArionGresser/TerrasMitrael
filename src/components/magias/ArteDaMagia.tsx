import Image from "next/image";
import { Selo } from "@/components/ui/Selo";

/**
 * O ícone de uma magia, ou o selo em branco que segura o lugar dele, no
 * mesmo jeito das habilidades nas fichas. Serve na lista e na página.
 */
export function IconeDaMagia({
  icone,
  tamanho = "lista",
}: {
  icone?: string;
  tamanho?: "lista" | "pagina";
}) {
  const medida = tamanho === "lista" ? "size-10" : "size-20 sm:size-24";
  const pixels = tamanho === "lista" ? 40 : 96;

  if (icone) {
    return (
      <Image
        src={icone}
        alt=""
        width={pixels}
        height={pixels}
        className={`border-dourado-600/40 ${medida} shrink-0 rounded-sm border object-cover shadow-[0_2px_6px_-2px_rgba(0,0,0,0.5)]`}
      />
    );
  }

  // Na lista são centenas de linhas: o lugar vazio é só um losango, leve,
  // em vez do desenho inteiro do selo.
  if (tamanho === "lista") {
    return (
      <span
        aria-hidden
        className="border-dourado-600/25 bg-pergaminho-200/50 text-dourado-600/45 grid size-10 shrink-0 place-items-center rounded-sm border border-dashed text-xs"
      >
        ✦
      </span>
    );
  }

  return (
    <span
      aria-hidden
      title="O ícone desta magia ainda está sendo desenhado"
      className={`border-dourado-600/25 bg-pergaminho-200/50 ${medida} flex shrink-0 flex-col items-center justify-center gap-1 rounded-sm border border-dashed`}
    >
      <Selo variante="marca" className="size-9 opacity-25 sm:size-11" />
      <span className="font-titulo text-tinta-500 text-[0.5rem] leading-none tracking-[0.1em] uppercase">
        em obra
      </span>
    </span>
  );
}

/**
 * As ilustrações de uso da magia. Sem nenhuma ainda, um quadro vazio
 * avisa que a pintura está a caminho, para o espaço já existir na página.
 */
export function IlustracoesDaMagia({
  nome,
  ilustracoes,
}: {
  nome: string;
  ilustracoes: string[];
}) {
  if (ilustracoes.length === 0) {
    return (
      <div className="border-dourado-600/30 bg-pergaminho-200/40 flex aspect-[16/9] flex-col items-center justify-center gap-3 rounded-sm border border-dashed px-6 text-center">
        <Selo variante="marca" className="size-14 opacity-20" />
        <p className="text-tinta-500 text-sm italic">
          A ilustração desta magia ainda está sendo pintada.
        </p>
      </div>
    );
  }

  const [primeira, ...resto] = ilustracoes;
  return (
    <div className="space-y-3">
      <Quadro src={primeira} alt={`${nome}: ilustração 1`} grande />
      {resto.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {resto.map((src, i) => (
            <Quadro key={src} src={src} alt={`${nome}: ilustração ${i + 2}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Quadro({ src, alt, grande = false }: { src: string; alt: string; grande?: boolean }) {
  return (
    <figure className="border-dourado-600/40 relative aspect-[16/9] overflow-hidden rounded-sm border shadow-[0_8px_20px_-10px_rgba(0,0,0,0.7)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={grande ? "(max-width: 640px) 100vw, 608px" : "(max-width: 640px) 50vw, 300px"}
        className="object-cover"
      />
    </figure>
  );
}
