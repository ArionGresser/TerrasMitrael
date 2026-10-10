import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EVENTOS, CRONOLOGIA, buscarEvento } from "@/lib/eventos";
import { Livro } from "@/components/contos/Livro";
import { Trilha } from "@/components/contos/Partes";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Capitulos } from "@/components/ui/Capitulos";
import { LinhaDoTempo } from "@/components/LinhaDoTempo";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloSecao,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

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

  const trilha = (
    <Trilha passos={[{ nome: "Crônicas", href: "/contos/" }, { nome: meta.nome }]} />
  );

  // A capa de couro: a cena da guerra num quadro, e o nome gravado em ouro
  const capa = (
    <div className="absolute inset-0 flex flex-col items-center px-8 pt-12 pb-10 text-center">
      <p className="font-titulo text-dourado-300/90 text-[0.6rem] tracking-[0.35em] uppercase">
        {meta.subtitulo}
      </p>
      <p className="font-brasao text-dourado-200 mt-3 text-4xl leading-tight [text-shadow:0_1px_0_rgb(0_0_0/0.6)]">
        {meta.nome}
      </p>
      <div className="border-dourado-400/60 relative mt-6 aspect-square w-3/4 overflow-hidden rounded-sm border-2 shadow-[0_6px_16px_rgba(0,0,0,0.6)]">
        <Image src={meta.imagem} alt="" fill sizes="300px" className="object-cover sepia-[0.2]" priority />
      </div>
      <p className="font-titulo text-dourado-300/80 mt-5 text-[0.62rem] tracking-[0.3em] uppercase">
        {meta.duracao} de guerra
      </p>
      <p className="font-titulo text-dourado-300/80 mt-auto pt-3 text-[0.62rem] tracking-[0.3em] uppercase">
        Toque para abrir
      </p>
    </div>
  );

  // A folha de rosto
  const rosto = (
    <div className="flex min-h-full flex-col justify-center text-center">
      <Sobretitulo>{meta.subtitulo}</Sobretitulo>
      <TituloBrasao className="mt-4">{meta.nome}</TituloBrasao>
      <Ornamento className="mt-6" />
      <p className="text-tinta-700 mt-6 text-[0.95rem] leading-relaxed">{meta.resumo}</p>
      <p className="text-tinta-500 mt-4 text-sm italic">{meta.chamada}</p>
    </div>
  );

  // A última folha: para onde a história continua
  const fim = (
    <div className="flex min-h-full flex-col justify-center text-center">
      <Ornamento />
      <p className="text-tinta-700 mt-6 text-sm leading-relaxed">
        Cada local de Mitrael carrega alguma marca desta guerra. Alguns
        carregam mais do que outros.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <BotaoLink href="/mapa/?local=putrefados" variante="primario" className="text-xs">
          A Terra dos Putrefados
        </BotaoLink>
        <BotaoLink href="/contos/" variante="secundario" className="text-xs">
          Voltar às Crônicas
        </BotaoLink>
      </div>
    </div>
  );

  // A página corrida de sempre, para quem escolhe ler sem o livro
  const classico = (
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
            <Capitulos Texto={Conteudo} rotuloAbrir="Ler capítulo" />
          </div>
        </Pergaminho>

        {/* A cronologia da Terceira Era, que antes morava na página de
            Eventos: é a linha do tempo desta mesma guerra */}
        <Revelar className="mt-8">
          <Pergaminho borda={3}>
            <div className="text-center">
              <Sobretitulo>Terceira Era</Sobretitulo>
              <TituloSecao className="mt-2">Cronologia</TituloSecao>
              <p className="text-tinta-500 mx-auto mt-3 max-w-md text-sm leading-relaxed">
                Reconstruída a partir das crônicas. Os marcos em vermelho são os
                que mudaram o continente de vez.
              </p>
            </div>

            <div className="mt-9">
              <LinhaDoTempo />
            </div>
          </Pergaminho>
        </Revelar>

        <Revelar className="mt-8">
          <Pergaminho variante="cartao" borda={2} inclinacao="direita">
            <p className="text-tinta-700 text-center text-sm leading-relaxed">
              Cada local de Mitrael carrega alguma marca desta guerra. Alguns
              carregam mais do que outros.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <BotaoLink
                href="/mapa/?local=putrefados"
                variante="primario"
                className="text-xs"
              >
                A Terra dos Putrefados
              </BotaoLink>
              <BotaoLink href="/contos/" variante="secundario" className="text-xs">
                Voltar às Crônicas
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>
      </main>
    </>
  );

  return (
    <>
      <Livro
        chave={`eventos/${meta.slug}`}
        titulo={meta.nome}
        cabecalho={trilha}
        capa={capa}
        antes={[<Fragment key="rosto">{rosto}</Fragment>]}
        texto={
          <>
            <Conteudo />
            <CronologiaNoLivro />
          </>
        }
        depois={[<Fragment key="fim">{fim}</Fragment>]}
        anterior="/contos/"
        rotuloAnterior="Crônicas"
        capitulosEmPagina
        classico={classico}
      />
      <Rodape />
    </>
  );
}

/**
 * A cronologia da Terceira Era como o último capítulo do livro: corre pelas
 * páginas junto com o texto, cada marco inteiro numa página só.
 */
function CronologiaNoLivro() {
  return (
    <>
      <h2>Cronologia da Terceira Era</h2>
      <p>
        Reconstruída a partir das crônicas. Os marcos em vermelho são os que
        mudaram o continente de vez.
      </p>
      <ol className="mt-4 list-none p-0">
        {CRONOLOGIA.map((marco) => (
          <li
            key={`${marco.ano}-${marco.titulo}`}
            className="border-dourado-600/40 mt-4 border-l-2 pl-4 [break-inside:avoid]"
            style={marco.peso === "grave" ? { borderColor: "var(--color-heraldico-vermelho)" } : undefined}
          >
            <p className="font-titulo text-tinta-500 !mt-0 text-[0.68rem] tracking-[0.2em] uppercase">
              {marco.ano}
            </p>
            <p className="font-titulo text-tinta-900 !mt-0.5 font-semibold">{marco.titulo}</p>
            <p className="!mt-1">{marco.texto}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
