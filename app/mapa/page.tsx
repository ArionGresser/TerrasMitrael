import type { Metadata } from "next";
import Link from "next/link";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { MARCADORES_LOCAIS, LUGARES_SEM_PAGINA } from "@/lib/marcadores";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloCapitulo,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Mapa",
  description:
    "O mapa do continente de Mitrael: os mares Bazáltico, de Qän e Leviano, as Terras de Askar seladas a oeste e os reinos de Mitrael a leste.",
};

export default function PaginaMapa() {
  return (
    <>
      <main className="mx-auto max-w-4xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={1}>
          <header className="text-center">
            <Sobretitulo>O continente inteiro</Sobretitulo>
            <TituloBrasao className="mt-4">Mapa de Mitrael</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-sm leading-relaxed italic sm:text-base">
              Toque nos pontos vermelhos para abrir cada local. Use os botões
              para aproximar e arraste para percorrer o mapa.
            </p>
          </header>

          <div className="mt-8">
            <MapaInterativo />
          </div>

          <p className="text-tinta-500 mt-4 text-center text-xs">
            Mapa criado por Lucas Monteiro
          </p>
        </Pergaminho>

        {/* Lista dos locais marcados, alternativa ao mapa */}
        <Revelar className="mt-8">
          <Pergaminho variante="cartao" borda={2} inclinacao="direita">
            <TituloCapitulo className="text-center">
              Locais marcados no mapa
            </TituloCapitulo>
            <p className="text-tinta-500 mx-auto mt-2 max-w-md text-center text-xs leading-relaxed">
              Os mesmos seis pontos, em lista, para quem preferir navegar assim
            </p>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {MARCADORES_LOCAIS.map((marcador) => (
                <li key={marcador.slug}>
                  <Link
                    href={`/locais/${marcador.slug}/`}
                    className="border-dourado-600/25 hover:bg-dourado-400/15 hover:border-dourado-600/50 flex min-h-11 items-center gap-2.5 rounded-sm border px-3 py-2 transition-colors"
                  >
                    <span
                      aria-hidden
                      className="bg-heraldico-vermelho ring-pergaminho-300 size-2.5 shrink-0 rounded-full ring-2"
                    />
                    <span className="font-titulo text-tinta-900 text-sm font-semibold">
                      {marcador.nome}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Pergaminho>
        </Revelar>

        {/* O que ainda não tem página */}
        <Revelar className="mt-8">
          <Pergaminho variante="cartao" borda={3} inclinacao="esquerda">
            <TituloCapitulo className="text-center">
              Desenhados no mapa, ainda sem página
            </TituloCapitulo>
            <p className="text-tinta-500 mx-auto mt-2 max-w-lg text-center text-xs leading-relaxed">
              Lugares que aparecem nas histórias dos personagens e nas crônicas
              da guerra, e que já estão no mapa esperando a sua vez
            </p>

            <ul className="mt-5 space-y-2.5">
              {LUGARES_SEM_PAGINA.map((lugar) => (
                <li
                  key={lugar.nome}
                  className="border-dourado-600/20 flex flex-wrap items-baseline gap-x-2 border-b border-dashed pb-2 last:border-0"
                >
                  <span className="font-titulo text-tinta-900 text-sm font-semibold">
                    {lugar.nome}
                  </span>
                  <span className="text-tinta-500 text-xs">{lugar.contexto}</span>
                </li>
              ))}
            </ul>
          </Pergaminho>
        </Revelar>
      </main>

      <Rodape />
    </>
  );
}
