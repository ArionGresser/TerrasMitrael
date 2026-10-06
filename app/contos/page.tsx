import type { Metadata } from "next";
import { SERIES, type Serie } from "@/lib/contos";
import { Cartaz } from "@/components/contos/Cartaz";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloSecao,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Contos",
  description:
    "As sessões jogadas em Terras de Mitrael, contadas como história: a campanha principal, temporada por temporada, e o que mais vier por aí.",
};

export default function PaginaContos() {
  const emCartaz = SERIES.filter((serie) => serie.disponivel);
  const emProducao = SERIES.filter((serie) => !serie.disponivel);

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho inclinacao="direita" borda={2}>
          <header className="text-center">
            <Sobretitulo>O que aconteceu na mesa</Sobretitulo>
            <TituloBrasao className="mt-4">Contos de Mitrael</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Cada sessão vira um episódio. Nada aqui foi inventado depois:
              foi jogado, decidido nos dados e pago por alguém.
            </p>
          </header>
        </Pergaminho>

        <Revelar className="mt-14">
          <TituloSecao tom="claro" className="text-center">
            Em cartaz
          </TituloSecao>
        </Revelar>

        <ul className="mt-6 space-y-6">
          {emCartaz.map((serie, i) => (
            <li key={serie.slug}>
              <Revelar atraso={i * 0.08}>
                <Destaque serie={serie} prioridade={i === 0} />
              </Revelar>
            </li>
          ))}
        </ul>

        {emProducao.length > 0 ? (
          <>
            <Revelar className="mt-14">
              <div className="text-center">
                <TituloSecao tom="claro">Em produção</TituloSecao>
                <p className="text-pergaminho-300/80 mx-auto mt-2 max-w-md text-sm leading-relaxed">
                  Ainda na pena da escriba. Abrem quando o primeiro capítulo
                  estiver pronto
                </p>
              </div>
            </Revelar>

            <ul className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4 sm:gap-6">
              {emProducao.map((serie, i) => (
                <li key={serie.slug}>
                  <Revelar atraso={i * 0.08}>
                    <Cartaz serie={serie} />
                  </Revelar>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </main>

      <Rodape />
    </>
  );
}

/**
 * A série em cartaz ganha a faixa larga, como o destaque de um catálogo de
 * filmes: o cartaz de um lado, a sinopse e o convite do outro.
 */
function Destaque({
  serie,
  prioridade,
}: {
  serie: Serie;
  prioridade: boolean;
}) {
  const temporadas = serie.temporadas.length;

  return (
    <div className="border-dourado-600/30 bg-madeira-950/60 flex flex-col items-center gap-6 rounded-sm border p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:flex-row sm:items-stretch sm:p-6">
      <div className="w-44 shrink-0 sm:w-52">
        <Cartaz serie={serie} prioridade={prioridade} />
      </div>

      <div className="flex min-w-0 flex-col justify-center text-center sm:text-left">
        <p className="font-titulo text-dourado-400 text-[0.66rem] tracking-[0.25em] uppercase">
          {serie.selo}
          {temporadas > 0
            ? ` · ${temporadas} ${temporadas === 1 ? "temporada" : "temporadas"}`
            : ""}
        </p>
        <h3 className="font-brasao text-pergaminho-50 mt-2 text-3xl leading-tight sm:text-4xl">
          {serie.titulo}
        </h3>
        <p className="text-pergaminho-200 mt-4 text-sm leading-relaxed sm:text-base">
          {serie.sinopse}
        </p>
        <div className="mt-6">
          <BotaoLink href={`/contos/${serie.slug}/`} variante="primario">
            Escolher a temporada
          </BotaoLink>
        </div>
      </div>
    </div>
  );
}
