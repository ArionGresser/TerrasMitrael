import Image from "next/image";
import Link from "next/link";
import { rostosDoElenco, type ArteDoCartaz, type Serie } from "@/lib/contos";
import { Selo } from "@/components/ui/Selo";

/**
 * O cartaz no formato de capa de filme: arte, selo no alto, título embaixo.
 *
 * Com `href` vira link e cresce um pouco ao passar o mouse. Travado, fica
 * apagado, com uma faixa atravessada, e não é link nenhum: nem clique nem
 * tecla levam a uma página que ainda não existe. O leitor de tela ouve o
 * aviso por extenso.
 */
export function Poster({
  arte,
  selo,
  titulo,
  chamada,
  href,
  prioridade = false,
}: {
  arte: ArteDoCartaz;
  selo: string;
  titulo: string;
  chamada: string;
  /** Sem endereço, o cartaz fica travado, "Em produção". */
  href?: string;
  prioridade?: boolean;
}) {
  const conteudo = (
    <>
      <Arte arte={arte} prioridade={prioridade} />

      {/* A sombra de baixo, onde o título precisa ser lido */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
      />

      {/* E uma faixa mais curta no alto, para a etiqueta não sumir na arte */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/75 to-transparent"
      />

      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
        <Selo
          variante="marca"
          className="text-dourado-400 size-5 drop-shadow"
        />
        <span className="font-titulo text-pergaminho-100 text-[0.55rem] tracking-[0.18em] uppercase drop-shadow">
          {selo}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <p className="font-brasao text-pergaminho-50 text-xl leading-[1.1] drop-shadow sm:text-2xl">
          {titulo}
        </p>
        <p className="text-pergaminho-200/90 mt-1.5 text-[0.7rem] leading-snug italic">
          {chamada}
        </p>
      </div>

      {href ? null : (
        <div
          aria-hidden
          className="bg-madeira-900/90 border-dourado-600/50 absolute top-[38%] -right-10 -left-10 -rotate-12 border-y py-1.5 text-center"
        >
          <span className="font-titulo text-dourado-400 text-[0.65rem] tracking-[0.3em] uppercase">
            Em produção
          </span>
        </div>
      )}
    </>
  );

  const moldura =
    "group relative block aspect-[2/3] w-full overflow-hidden rounded-sm border border-black/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]";

  if (!href) {
    return (
      <div
        className={`${moldura} cursor-not-allowed grayscale-[0.85] brightness-75`}
        role="img"
        aria-label={`${titulo}. Em produção, ainda não disponível.`}
        title="Em produção"
      >
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${moldura} focus-visible:outline-dourado-400 transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02]`}
    >
      <span className="sr-only">Abrir </span>
      {conteudo}
    </Link>
  );
}

/** O cartaz de uma série da estante. */
export function Cartaz({
  serie,
  prioridade = false,
}: {
  serie: Serie;
  prioridade?: boolean;
}) {
  return (
    <Poster
      arte={serie.arte}
      selo={serie.selo}
      titulo={serie.titulo}
      chamada={serie.chamada}
      href={serie.disponivel ? `/contos/${serie.slug}/` : undefined}
      prioridade={prioridade}
    />
  );
}

function Arte({
  arte,
  prioridade,
}: {
  arte: ArteDoCartaz;
  prioridade: boolean;
}) {
  if (arte.tipo === "imagem") {
    return (
      <Image
        src={arte.imagem}
        alt=""
        fill
        priority={prioridade}
        sizes="(max-width: 640px) 50vw, 260px"
        className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
        style={{ objectPosition: arte.posicao ?? "top" }}
      />
    );
  }

  // Mosaico: uma faixa estreita de cada retrato, com o rosto no meio dela
  const retratos = rostosDoElenco(arte.personagens);

  return (
    <div className="absolute inset-0 flex gap-px bg-black transition-transform duration-500 motion-safe:group-hover:scale-105">
      {retratos.map((retrato) => (
        <div key={retrato.slug} className="relative h-full flex-1 overflow-hidden">
          {/* O retrato ocupa a altura toda da faixa e transborda para os
              lados. Ancorado no meio da faixa e puxado de volta pela
              posição do rosto, deixa o rosto exatamente no centro, seja
              qual for a largura da faixa ou do retrato. */}
          <Image
            src={retrato.imagem}
            alt=""
            width={400}
            height={500}
            priority={prioridade}
            className="absolute top-0 left-1/2 h-full w-auto max-w-none min-w-full object-cover sepia-[0.15]"
            style={{ transform: `translateX(-${retrato.rosto.x * 100}%)` }}
          />
        </div>
      ))}
    </div>
  );
}
