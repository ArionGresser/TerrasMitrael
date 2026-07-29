import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PERSONAGENS, buscarPersonagem } from "@/lib/personagens";
import { SeloOriginHero } from "@/components/personagens/SeloOriginHero";
import { FichaAntiga } from "@/components/personagens/FichaAntiga";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Ilustracao } from "@/components/ui/Ilustracao";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloCapitulo,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PERSONAGENS.map((p) => ({ slug: p.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const personagem = buscarPersonagem(slug);
  if (!personagem) return {};

  return {
    title: `${personagem.meta.nome}, ${personagem.meta.epiteto}`,
    description: personagem.meta.resumo,
  };
}

export default async function PaginaPersonagem({ params }: Props) {
  const { slug } = await params;
  const personagem = buscarPersonagem(slug);

  if (!personagem) notFound();

  const { meta, Historia } = personagem;

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={1}>
          <header className="text-center">
            <Sobretitulo>{meta.epiteto}</Sobretitulo>
            <TituloBrasao className="mt-3">{meta.nome}</TituloBrasao>

            {meta.originHero ? (
              <div className="mt-4 flex justify-center">
                <SeloOriginHero />
              </div>
            ) : null}

            <Ornamento className="mt-5" />
          </header>

          <div className="border-madeira-800/25 shadow-pergaminho relative mx-auto mt-8 aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm border">
            <Image
              src={meta.imagem}
              alt={meta.imagemAlt}
              fill
              sizes="(max-width: 640px) 100vw, 384px"
              className="object-cover object-top sepia-[0.12]"
              priority
            />
          </div>

          <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-center text-sm leading-relaxed italic sm:text-base">
            {meta.resumo}
          </p>

          {/* Narração, quando existir */}
          {meta.audio ? (
            <div className="border-dourado-600/25 mt-8 rounded-sm border px-4 py-4">
              <p className="text-tinta-500 text-center text-xs tracking-[0.15em] uppercase">
                Narração da história
              </p>
              <audio
                controls
                preload="none"
                src={meta.audio}
                className="mt-3 w-full"
              >
                Seu navegador não consegue tocar este áudio.
              </audio>
            </div>
          ) : null}

          <Ornamento className="mt-10" />

          {/* A história */}
          <div className="mt-8">
            <TituloCapitulo as="h2" className="text-center">
              História
            </TituloCapitulo>
            <div className="mt-4">
              <Historia />
            </div>
          </div>

          {meta.ilustracao ? (
            <Ilustracao src={meta.ilustracao} alt={meta.ilustracaoAlt ?? ""} />
          ) : null}

          {/* Citações */}
          {meta.citacoes.length > 0 ? (
            <div className="mt-10 space-y-5">
              {meta.citacoes.map((citacao) => (
                <blockquote
                  key={citacao}
                  className="border-dourado-600/50 border-l-2 pl-4"
                >
                  <p className="text-tinta-700 text-[0.95rem] leading-relaxed italic">
                    {citacao}
                  </p>
                  <footer className="font-titulo text-tinta-500 mt-1.5 text-xs tracking-wide">
                    {meta.nome}, {meta.epiteto}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : null}

          <Ornamento className="mt-10" />

          {/* A ficha antiga */}
          <div className="mt-8">
            <FichaAntiga meta={meta} />
          </div>
        </Pergaminho>

        <Revelar className="mt-8">
          <Pergaminho variante="cartao" borda={3} inclinacao="direita">
            <div className="flex flex-wrap justify-center gap-3">
              <BotaoLink href="/personagens/" variante="primario" className="text-xs">
                Todos os personagens
              </BotaoLink>
              <BotaoLink href="/locais/" variante="secundario" className="text-xs">
                Explorar os locais
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>
      </main>

      <Rodape />
    </>
  );
}
