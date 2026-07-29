import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LOCAIS, buscarLocal } from "@/lib/locais";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

type Props = { params: Promise<{ slug: string }> };

// Gera uma página estática para cada arquivo em content/locais/
export function generateStaticParams() {
  return LOCAIS.map((local) => ({ slug: local.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const local = buscarLocal(slug);
  if (!local) return {};

  return {
    title: local.meta.nome,
    description: local.meta.resumo,
  };
}

export default async function PaginaLocal({ params }: Props) {
  const { slug } = await params;
  const local = buscarLocal(slug);

  if (!local) notFound();

  const { meta, Conteudo } = local;
  const indice = LOCAIS.findIndex((l) => l.meta.slug === slug);
  const proximo = LOCAIS[(indice + 1) % LOCAIS.length];

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho inclinacao="esquerda" borda={1}>
          <header className="text-center">
            <Sobretitulo>{meta.subtitulo}</Sobretitulo>
            <TituloBrasao className="mt-3">{meta.nome}</TituloBrasao>
            <Ornamento className="mt-5" />
            <p className="text-tinta-700 mx-auto mt-5 max-w-lg text-sm leading-relaxed italic sm:text-base">
              {meta.chamada}
            </p>
          </header>

          <div className="border-madeira-800/25 shadow-pergaminho relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-sm border">
            <Image
              src={meta.imagem}
              alt={meta.imagemAlt}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover sepia-[0.14]"
              priority
            />
          </div>

          <div className="mt-10">
            <Conteudo />
          </div>
        </Pergaminho>

        {/* Navegação entre locais */}
        <Revelar className="mt-8">
          <Pergaminho variante="cartao" borda={3} inclinacao="direita">
            <p className="text-tinta-500 text-center text-xs tracking-wide">
              Continue explorando
            </p>
            <p className="font-titulo text-tinta-900 mt-2 text-center text-lg font-semibold">
              {proximo.meta.nome}
            </p>
            <p className="text-tinta-700 mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed">
              {proximo.meta.chamada}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <BotaoLink
                href={`/locais/${proximo.meta.slug}/`}
                variante="primario"
                className="text-xs"
              >
                Ir para {proximo.meta.nome}
              </BotaoLink>
              <BotaoLink href="/locais/" variante="secundario" className="text-xs">
                Todos os locais
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>
      </main>

      <Rodape />
    </>
  );
}
