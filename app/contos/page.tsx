import type { Metadata } from "next";
import { SERIES } from "@/lib/contos";
import { EVENTOS } from "@/lib/eventos";
import { Cartaz, Poster } from "@/components/contos/Cartaz";
import { Revelar } from "@/components/ui/Revelar";
import { Rodape } from "@/components/Rodape";
import { Capa } from "@/components/ui/Capa";
import {
  TituloSecao,
} from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Crônicas",
  description:
    "As sessões jogadas em Terras de Mitrael, contadas como história, e os eventos que moldaram o continente, como a Grande Guerra Leviana.",
};

export default function PaginaContos() {
  const emCartaz = SERIES.filter((serie) => serie.disponivel);
  const emProducao = SERIES.filter((serie) => !serie.disponivel);

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Capa
          imagem="/images/contos/cronicas-cartao.webp"
          sobretitulo="O que aconteceu na mesa"
          titulo="Crônicas de Mitrael"
        >
          <p>
            As sessões jogadas, contadas episódio por episódio, e a história
            que o continente carregava antes delas.
          </p>
        </Capa>

        <Revelar className="mt-14">
          <TituloSecao tom="claro" className="text-center">
            Em cartaz
          </TituloSecao>
        </Revelar>

        {/* A estante do que já pode ser lido: as séries e os grandes
            eventos da história, todos no mesmo formato de cartaz */}
        <ul className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4 sm:gap-6">
          {emCartaz.map((serie, i) => (
            <li key={serie.slug}>
              <Revelar atraso={i * 0.08}>
                <Cartaz serie={serie} prioridade={i === 0} />
              </Revelar>
            </li>
          ))}
          {EVENTOS.map(({ meta }, i) => (
            <li key={meta.slug}>
              <Revelar atraso={(emCartaz.length + i) * 0.08}>
                <Poster
                  arte={{
                    tipo: "imagem",
                    imagem: meta.imagem,
                    alt: meta.imagemAlt,
                    posicao: "center",
                  }}
                  selo="Evento histórico"
                  titulo={meta.nome}
                  chamada={meta.subtitulo}
                  href={`/eventos/${meta.slug}/`}
                />
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
