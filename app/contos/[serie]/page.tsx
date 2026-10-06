import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SERIES_DISPONIVEIS,
  buscarSerie,
  chaveDaTemporada,
  contagemDeEpisodios,
} from "@/lib/contos";
import { Cartaz } from "@/components/contos/Cartaz";
import { Elenco, Trilha } from "@/components/contos/Partes";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloSecao,
  TituloCapitulo,
  Sobretitulo,
} from "@/components/ui/Titulo";

type Props = { params: Promise<{ serie: string }> };

export function generateStaticParams() {
  return SERIES_DISPONIVEIS.map((serie) => ({ serie: serie.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const serie = buscarSerie((await params).serie);
  if (!serie) return {};
  return { title: serie.titulo, description: serie.sinopse };
}

export default async function PaginaSerie({ params }: Props) {
  const serie = buscarSerie((await params).serie);
  if (!serie) notFound();

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Trilha passos={[{ nome: "Contos", href: "/contos/" }, { nome: serie.titulo }]} />

        <Pergaminho borda={1} className="mt-5">
          <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start sm:gap-8">
            <div className="w-40 shrink-0 sm:w-48">
              <Cartaz serie={{ ...serie, disponivel: true }} prioridade />
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <Sobretitulo>{serie.selo}</Sobretitulo>
              <TituloBrasao className="mt-2">{serie.titulo}</TituloBrasao>
              <p className="text-tinta-700 mt-5 text-base leading-relaxed">
                {serie.sinopse}
              </p>
            </div>
          </div>
        </Pergaminho>

        <Revelar className="mt-14">
          <TituloSecao tom="claro" className="text-center">
            Escolha a temporada
          </TituloSecao>
        </Revelar>

        <ul className="mt-6 space-y-6">
          {serie.temporadas.map((temporada, i) => (
            <li key={temporada.numero}>
              <Revelar atraso={i * 0.08}>
                <Pergaminho
                  variante="cartao"
                  borda={((i % 3) + 1) as 1 | 2 | 3}
                  inclinacao={i % 2 === 0 ? "esquerda" : "direita"}
                  className="relative"
                >
                  <p className="font-titulo text-dourado-600 text-xs tracking-[0.25em] uppercase">
                    Temporada {temporada.numero}
                  </p>
                  <TituloCapitulo className="mt-1">
                    {/* O título inteiro do cartão é o link, e o cartão
                        todo responde ao toque por causa do after */}
                    <Link
                      href={`/contos/${serie.slug}/${chaveDaTemporada(temporada)}/`}
                      className="after:absolute after:inset-0 hover:underline"
                    >
                      {temporada.titulo}
                    </Link>
                  </TituloCapitulo>
                  <p className="text-tinta-700 mt-3 text-sm leading-relaxed">
                    {temporada.sinopse}
                  </p>

                  <div className="relative z-10 mt-5">
                    <Elenco slugs={temporada.elenco} tamanho="pequeno" />
                  </div>

                  <p className="text-tinta-500 mt-4 text-center text-xs tracking-wide">
                    {contagemDeEpisodios(temporada)}
                    <span aria-hidden className="text-dourado-600 ml-2">
                      →
                    </span>
                  </p>
                </Pergaminho>
              </Revelar>
            </li>
          ))}
        </ul>
      </main>

      <Rodape />
    </>
  );
}
