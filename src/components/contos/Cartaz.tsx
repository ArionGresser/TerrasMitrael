import Image from "next/image";
import Link from "next/link";
import { buscarPersonagem } from "@/lib/personagens";
import type { ArteDoCartaz, Serie } from "@/lib/contos";
import { Selo } from "@/components/ui/Selo";

/**
 * O cartaz de uma série, no formato de capa de filme.
 *
 * Série disponível vira link e cresce um pouco ao passar o mouse. Série em
 * produção fica apagada, com uma faixa atravessada, e não é link nenhum:
 * nem clique nem tecla levam a uma página que ainda não existe. O leitor
 * de tela ouve o aviso por extenso.
 */
export function Cartaz({
  serie,
  prioridade = false,
}: {
  serie: Serie;
  prioridade?: boolean;
}) {
  const conteudo = (
    <>
      <Arte arte={serie.arte} prioridade={prioridade} />

      {/* A sombra de baixo, onde o título precisa ser lido */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
      />

      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
        <Selo
          variante="marca"
          className="text-dourado-400 size-5 drop-shadow"
        />
        <span className="font-titulo text-pergaminho-100 text-[0.55rem] tracking-[0.18em] uppercase drop-shadow">
          {serie.selo}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <p className="font-brasao text-pergaminho-50 text-xl leading-[1.1] drop-shadow sm:text-2xl">
          {serie.titulo}
        </p>
        <p className="text-pergaminho-200/90 mt-1.5 text-[0.7rem] leading-snug italic">
          {serie.chamada}
        </p>
      </div>

      {serie.disponivel ? null : (
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

  if (!serie.disponivel) {
    return (
      <div
        className={`${moldura} cursor-not-allowed grayscale-[0.85] brightness-75`}
        role="img"
        aria-label={`${serie.titulo}. Em produção, ainda não disponível.`}
        title="Em produção"
      >
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      href={`/contos/${serie.slug}/`}
      className={`${moldura} focus-visible:outline-dourado-400 transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02]`}
    >
      <span className="sr-only">Abrir </span>
      {conteudo}
    </Link>
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

  // Mosaico: uma faixa estreita de cada retrato, rosto no alto
  const retratos = arte.personagens.flatMap((slug) => {
    const personagem = buscarPersonagem(slug);
    return personagem ? [personagem.meta.imagem] : [];
  });

  return (
    <div className="absolute inset-0 flex gap-px bg-black transition-transform duration-500 motion-safe:group-hover:scale-105">
      {retratos.map((imagem) => (
        <div key={imagem} className="relative h-full flex-1 overflow-hidden">
          <Image
            src={imagem}
            alt=""
            fill
            priority={prioridade}
            sizes="(max-width: 640px) 12vw, 60px"
            className="object-cover object-top sepia-[0.15]"
          />
        </div>
      ))}
    </div>
  );
}
