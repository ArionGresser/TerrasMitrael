import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SERIES_DISPONIVEIS,
  buscarEpisodio,
  buscarSerie,
  buscarTemporada,
  chaveDaTemporada,
  chaveDoEpisodio,
  type Episodio,
  type Serie,
  type Temporada,
} from "@/lib/contos";
import { Elenco, Trilha } from "@/components/contos/Partes";
import { Arte } from "@/components/contos/Cartaz";
import { BarraLeitura } from "@/components/contos/BarraLeitura";
import { Livro } from "@/components/contos/Livro";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { Ornamento } from "@/components/ui/Titulo";

type Props = {
  params: Promise<{ serie: string; temporada: string; episodio: string }>;
};

/**
 * Um endereço por episódio publicado.
 *
 * Enquanto nenhum existe, devolve um endereço reserva que cai em "página não
 * encontrada". Sem ele, o site estático nem constrói: o Next recusa página
 * de episódio com lista vazia. Ao publicar o primeiro episódio a reserva
 * some sozinha.
 */
export function generateStaticParams() {
  const enderecos = SERIES_DISPONIVEIS.flatMap((serie) =>
    serie.temporadas.flatMap((temporada) =>
      temporada.episodios.map((episodio) => ({
        serie: serie.slug,
        temporada: chaveDaTemporada(temporada),
        episodio: chaveDoEpisodio(episodio),
      }))
    )
  );
  if (enderecos.length > 0) return enderecos;

  const [serie] = SERIES_DISPONIVEIS;
  const [temporada] = serie.temporadas;
  return [
    {
      serie: serie.slug,
      temporada: chaveDaTemporada(temporada),
      episodio: "em-breve",
    },
  ];
}

async function resolver(params: Props["params"]) {
  const chaves = await params;
  const serie = buscarSerie(chaves.serie);
  const temporada = serie ? buscarTemporada(serie, chaves.temporada) : undefined;
  const episodio = temporada
    ? buscarEpisodio(temporada, chaves.episodio)
    : undefined;
  return { serie, temporada, episodio };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serie, temporada, episodio } = await resolver(params);
  if (!serie || !temporada || !episodio) return {};
  return {
    title: `${episodio.meta.titulo}, ${serie.titulo} T${temporada.numero}E${episodio.meta.numero}`,
    description: episodio.meta.resumo,
  };
}

/**
 * Quanto tempo leva para ler, contado no próprio arquivo do episódio na hora
 * de montar o site. Duzentas palavras por minuto é o ritmo de quem lê com
 * calma, que é como uma história deve ser lida.
 */
function minutosDeLeitura(serie: Serie, temporada: Temporada, episodio: Episodio) {
  const arquivo = join(
    process.cwd(),
    "content/contos",
    serie.slug,
    chaveDaTemporada(temporada),
    `episodio-${String(episodio.meta.numero).padStart(2, "0")}.mdx`
  );
  try {
    const texto = readFileSync(arquivo, "utf8")
      .replace(/export const meta[\s\S]*?\n};/, "")
      .replace(/<[^>]+>/g, "");
    const palavras = texto.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(palavras / 200));
  } catch {
    return undefined;
  }
}

export default async function PaginaEpisodio({ params }: Props) {
  const { serie, temporada, episodio } = await resolver(params);
  if (!serie || !temporada || !episodio) notFound();

  const base = `/contos/${serie.slug}/${chaveDaTemporada(temporada)}`;
  const indice = temporada.episodios.indexOf(episodio);
  const anterior = temporada.episodios[indice - 1];
  const proximo = temporada.episodios[indice + 1];
  const minutos = minutosDeLeitura(serie, temporada, episodio);
  const { Texto } = episodio;

  const trilha = (
    <Trilha
      passos={[
        { nome: "Crônicas", href: "/contos/" },
        { nome: serie.titulo, href: `/contos/${serie.slug}/` },
        { nome: `Temporada ${temporada.numero}`, href: `${base}/` },
        { nome: `Episódio ${episodio.meta.numero}` },
      ]}
    />
  );

  // A página corrida de sempre, para quem escolhe ler sem o livro
  const classico = (
    <>
      {/* O quanto já foi lido, num fio dourado no alto da tela. Em navegador
          que não sabe fazer isso, o fio simplesmente não aparece. */}
      <BarraLeitura />

      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Trilha
          passos={[
            { nome: "Crônicas", href: "/contos/" },
            { nome: serie.titulo, href: `/contos/${serie.slug}/` },
            { nome: `Temporada ${temporada.numero}`, href: `${base}/` },
            { nome: `Episódio ${episodio.meta.numero}` },
          ]}
        />

        {/* A capa, como a tela de abertura de um episódio de série */}
        <header className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-sm border border-black/40 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.85)] sm:aspect-[21/9]">
          <Capa episodio={episodio} />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-40% to-black/0"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
            <p className="font-titulo text-dourado-300 text-[0.62rem] tracking-[0.28em] uppercase drop-shadow sm:text-[0.7rem]">
              {serie.titulo} · T{temporada.numero} · Episódio{" "}
              {episodio.meta.numero}
            </p>
            <h1 className="font-brasao text-pergaminho-50 mt-2 text-3xl leading-[1.08] drop-shadow-lg sm:text-5xl">
              {episodio.meta.titulo}
            </h1>
            <p className="text-pergaminho-200/90 mt-2 text-xs tracking-wide">
              {minutos ? `${minutos} min de leitura` : null}
              {minutos && episodio.meta.sessao ? " · " : null}
              {episodio.meta.sessao ? `Jogado em ${episodio.meta.sessao}` : null}
            </p>
          </div>
        </header>

        <Pergaminho borda={1} className="mt-7">
          <p className="text-tinta-700 mx-auto max-w-[34rem] text-center text-[0.95rem] leading-relaxed italic sm:text-base">
            {episodio.meta.resumo}
          </p>

          {/* Quem estava na mesa. Ninguém precisa decorar o elenco para ler:
              cada rosto leva à ficha de quem é. */}
          <section aria-label="Personagens neste episódio" className="mt-7">
            <p className="font-titulo text-tinta-500 mb-3 text-center text-[0.66rem] tracking-[0.2em] uppercase">
              Neste episódio
            </p>
            <Elenco slugs={episodio.meta.elenco} prioridade />
          </section>

          <Ornamento className="mt-8" />

          <div className="leitura-conto mx-auto mt-10 max-w-[38rem]">
            <Texto />
          </div>

          <Ornamento className="mt-12" />
          <p className="font-titulo text-tinta-500 mt-4 text-center text-[0.66rem] tracking-[0.3em] uppercase">
            Fim do episódio {episodio.meta.numero}
          </p>

          <nav aria-label="Outros episódios" className="mt-8">
            {proximo ? (
              <ProximoEpisodio
                href={`${base}/${chaveDoEpisodio(proximo)}/`}
                episodio={proximo}
              />
            ) : (
              <div className="text-center">
                <p className="text-tinta-700 text-sm italic">
                  O próximo episódio ainda está sendo escrito.
                </p>
                <div className="mt-4">
                  <BotaoLink href={`${base}/`} variante="primario">
                    Voltar à temporada
                  </BotaoLink>
                </div>
              </div>
            )}

            {anterior ? (
              <p className="mt-6 text-center text-sm">
                <Link
                  href={`${base}/${chaveDoEpisodio(anterior)}/`}
                  className="text-tinta-700 hover:text-heraldico-vermelho underline decoration-dourado-600/60 underline-offset-4 transition-colors"
                >
                  ← Voltar ao episódio {anterior.meta.numero}:{" "}
                  {anterior.meta.titulo}
                </Link>
              </p>
            ) : null}
          </nav>
        </Pergaminho>
      </main>

    </>
  );

  return (
    <>
      <Livro
        chave={`${serie.slug}/${chaveDaTemporada(temporada)}/${chaveDoEpisodio(episodio)}`}
        titulo={`${episodio.meta.numero}. ${episodio.meta.titulo}`}
        cabecalho={trilha}
        antes={[
          <AberturaDoCapitulo
            key="abertura"
            serie={serie}
            temporada={temporada}
            episodio={episodio}
            minutos={minutos}
          />,
        ]}
        texto={<Texto />}
        depois={
          // Como num livro: o capítulo acaba e o seguinte começa na próxima
          // folha. A página de fim só aparece no último que já foi escrito.
          proximo ? [] : [<FimDaTemporada key="fim" base={base} episodio={episodio} />]
        }
        anterior={anterior ? `${base}/${chaveDoEpisodio(anterior)}/` : `${base}/`}
        rotuloAnterior={anterior ? `Episódio ${anterior.meta.numero}` : "Sumário"}
        proximo={proximo ? `${base}/${chaveDoEpisodio(proximo)}/` : undefined}
        rotuloProximo={proximo ? `Episódio ${proximo.meta.numero}` : "Avançar"}
        classico={classico}
      />
      <Rodape />
    </>
  );
}

/**
 * A primeira página do capítulo: a arte, o número, o título, quando foi
 * jogado e quem estava na mesa.
 */
function AberturaDoCapitulo({
  serie,
  temporada,
  episodio,
  minutos,
}: {
  serie: Serie;
  temporada: Temporada;
  episodio: Episodio;
  minutos?: number;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-madeira-800/30 relative aspect-[4/3] w-full overflow-hidden rounded-sm border shadow-[0_6px_14px_-8px_rgba(0,0,0,0.6)]">
        <Capa episodio={episodio} />
      </div>
      <p className="font-titulo text-dourado-600 mt-5 text-center text-[0.62rem] tracking-[0.3em] uppercase">
        {serie.titulo} · T{temporada.numero} · Capítulo {episodio.meta.numero}
      </p>
      <h1 className="font-brasao text-tinta-900 mt-2 text-center text-3xl leading-tight sm:text-4xl">
        {episodio.meta.titulo}
      </h1>
      <p className="text-tinta-500 mt-1.5 text-center text-xs tracking-wide">
        {minutos ? `${minutos} min de leitura` : null}
        {minutos && episodio.meta.sessao ? " · " : null}
        {episodio.meta.sessao ? `Jogado em ${episodio.meta.sessao}` : null}
      </p>
      <Ornamento className="mt-4" />
      <p className="text-tinta-700 mt-4 text-center text-sm leading-relaxed italic">
        {episodio.meta.resumo}
      </p>
      <div className="mt-auto pt-5">
        <p className="font-titulo text-tinta-500 mb-2 text-center text-[0.6rem] tracking-[0.2em] uppercase">
          Neste capítulo
        </p>
        <div className="flex justify-center">
          <Elenco slugs={episodio.meta.elenco} tamanho="pequeno" />
        </div>
      </div>
    </div>
  );
}

/** A última página do último capítulo escrito, que ainda não tem seguinte. */
function FimDaTemporada({ base, episodio }: { base: string; episodio: Episodio }) {
  return (
    <div className="flex min-h-full flex-col justify-center text-center">
      <Ornamento />
      <p className="font-titulo text-tinta-500 mt-4 text-[0.66rem] tracking-[0.3em] uppercase">
        Fim do capítulo {episodio.meta.numero}
      </p>
      <p className="text-tinta-700 mt-8 text-sm italic">
        O próximo capítulo ainda está sendo escrito.
      </p>
      <div className="mt-4">
        <BotaoLink href={`${base}/`} variante="primario">
          Voltar ao sumário
        </BotaoLink>
      </div>
    </div>
  );
}

/** A imagem do episódio, ou os rostos de quem jogou quando ele não tem uma. */
function Capa({
  episodio,
  pequena = false,
}: {
  episodio: Episodio;
  pequena?: boolean;
}) {
  if (episodio.meta.capa) {
    return (
      <Image
        src={episodio.meta.capa}
        alt={pequena ? "" : (episodio.meta.capaAlt ?? "")}
        fill
        priority={!pequena}
        sizes={pequena ? "160px" : "(max-width: 768px) 100vw, 720px"}
        className="object-cover sepia-[0.12]"
      />
    );
  }
  return (
    <Arte
      arte={{ tipo: "mosaico", personagens: episodio.meta.elenco }}
      prioridade={!pequena}
    />
  );
}

/**
 * O convite para o episódio seguinte, como a tela do fim de um episódio de
 * série: a capa do próximo, o título e a primeira linha do que vem.
 */
function ProximoEpisodio({
  href,
  episodio,
}: {
  href: string;
  episodio: Episodio;
}) {
  return (
    <Link
      href={href}
      className="group bg-madeira-900 border-dourado-600/40 flex flex-col overflow-hidden rounded-sm border shadow-[0_10px_28px_-12px_rgba(0,0,0,0.8)] transition-transform sm:flex-row motion-safe:hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-48">
        <Capa episodio={episodio} pequena />
        <div aria-hidden className="absolute inset-0 bg-black/20" />
      </div>
      <div className="flex flex-col justify-center p-4 sm:p-5">
        <p className="font-titulo text-dourado-400 text-[0.62rem] tracking-[0.25em] uppercase">
          Próximo episódio
        </p>
        <p className="font-brasao text-pergaminho-50 mt-1.5 text-2xl leading-tight">
          {episodio.meta.numero}. {episodio.meta.titulo}
        </p>
        <p className="text-pergaminho-200/90 mt-2 line-clamp-3 text-sm leading-relaxed">
          {episodio.meta.resumo}
        </p>
        <p className="text-dourado-300 mt-3 text-sm group-hover:underline">
          Continuar lendo →
        </p>
      </div>
    </Link>
  );
}
