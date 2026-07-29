import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EVENTOS, buscarEvento } from "@/lib/eventos";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EVENTOS.map((evento) => ({ slug: evento.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const evento = buscarEvento(slug);
  if (!evento) return {};

  return {
    title: evento.meta.nome,
    description: evento.meta.resumo,
  };
}

export default async function PaginaEvento({ params }: Props) {
  const { slug } = await params;
  const evento = buscarEvento(slug);

  if (!evento) notFound();

  const { meta, Conteudo } = evento;

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho inclinacao="esquerda" borda={1}>
          <header className="text-center">
            <Sobretitulo>{meta.subtitulo}</Sobretitulo>
            <TituloBrasao className="mt-3">{meta.nome}</TituloBrasao>

            <div className="mt-4 flex justify-center">
              <span className="border-heraldico-vermelho/40 bg-heraldico-vermelho/10 text-heraldico-vermelho font-titulo inline-block rounded-full border px-3 py-1 text-[0.68rem] tracking-[0.15em] uppercase">
                {meta.duracao} de guerra
              </span>
            </div>

            <Ornamento className="mt-5" />
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

        <Revelar className="mt-8">
          <Pergaminho variante="cartao" borda={3} inclinacao="direita">
            <p className="text-tinta-700 text-center text-sm leading-relaxed">
              Cada local de Mitrael carrega alguma marca desta guerra. Alguns
              carregam mais do que outros.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <BotaoLink
                href="/locais/putrefados/"
                variante="primario"
                className="text-xs"
              >
                A Terra dos Putrefados
              </BotaoLink>
              <BotaoLink href="/eventos/" variante="secundario" className="text-xs">
                Voltar aos eventos
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>
      </main>

      <Rodape />
    </>
  );
}
