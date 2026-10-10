import Link from "next/link";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";
import { vizinhos } from "@/lib/personagens";

/**
 * A primeira linha dentro da folha da ficha: o personagem anterior à
 * esquerda, o selo de voltar à lista no meio e o próximo à direita, na
 * ordem da lista de personagens.
 *
 * No celular os vizinhos mostram só a seta, para tudo caber numa linha; o
 * nome fica no rótulo para leitor de tela e na dica do mouse.
 */
export function NavegacaoDaFicha({ slug }: { slug: string }) {
  const lados = vizinhos(slug);

  return (
    <div className="-mt-2 mb-6 grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:-mt-4">
      {lados ? <Vizinho lado="anterior" slug={lados.anterior.meta.slug} nome={lados.anterior.meta.nome} /> : <span />}
      <SeloDeVolta href="/personagens/" rotulo="Personagens" className="mt-0! mb-0! sm:mt-0!" />
      {lados ? <Vizinho lado="proximo" slug={lados.proximo.meta.slug} nome={lados.proximo.meta.nome} /> : <span />}
    </div>
  );
}

function Vizinho({ lado, slug, nome }: { lado: "anterior" | "proximo"; slug: string; nome: string }) {
  const anterior = lado === "anterior";
  const rotulo = anterior ? "Anterior" : "Próximo";

  return (
    <Link
      href={`/personagens/${slug}/`}
      aria-label={`${rotulo}: ${nome}`}
      title={`${rotulo}: ${nome}`}
      className={`group focus-visible:outline-dourado-400 inline-flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 ${
        anterior ? "justify-self-start" : "flex-row-reverse justify-self-end text-right"
      }`}
    >
      <span
        aria-hidden
        className="border-dourado-600/60 text-tinta-700 group-hover:border-heraldico-vermelho group-hover:text-heraldico-vermelho grid size-10 shrink-0 place-items-center rounded-full border bg-white/30 shadow-[inset_0_1px_2px_rgb(90_62_28/0.25)] transition-colors"
      >
        <svg viewBox="0 0 24 24" className={`size-4 ${anterior ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </span>
      <span aria-hidden className="hidden leading-none sm:block">
        <span className="font-titulo text-dourado-600 block text-[0.58rem] tracking-[0.28em] uppercase">{rotulo}</span>
        <span className="font-titulo text-tinta-900 group-hover:text-heraldico-vermelho mt-1 block max-w-[9rem] truncate text-sm leading-tight transition-colors">
          {nome}
        </span>
      </span>
    </Link>
  );
}
