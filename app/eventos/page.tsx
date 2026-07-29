import type { Metadata } from "next";
import Image from "next/image";
import { EVENTOS } from "@/lib/eventos";
import { LinhaDoTempo } from "@/components/LinhaDoTempo";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloSecao,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "A linha do tempo de Mitrael, das expedições que partiram sem saber o que encontrariam às guerras que redesenharam o mapa do continente.",
};

export default function PaginaEventos() {
  const principal = EVENTOS[0];

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho inclinacao="esquerda" borda={1}>
          <header className="text-center">
            <Sobretitulo>A história do continente</Sobretitulo>
            <TituloBrasao className="mt-4">Eventos</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Tudo o que Mitrael é hoje foi decidido em trinta e seis anos que
              ninguém escolheu viver.
            </p>
          </header>
        </Pergaminho>

        {/* Evento em destaque */}
        <Revelar className="mt-8">
          <Pergaminho inclinacao="direita" borda={2}>
            <div className="border-madeira-800/25 shadow-pergaminho relative aspect-[16/9] w-full overflow-hidden rounded-sm border">
              <Image
                src={principal.meta.imagem}
                alt={principal.meta.imagemAlt}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover sepia-[0.14]"
                priority
              />
            </div>

            <div className="mt-6 text-center">
              <Sobretitulo>{principal.meta.subtitulo}</Sobretitulo>
              <TituloSecao className="mt-2">{principal.meta.nome}</TituloSecao>
            </div>

            <p className="text-tinta-700 mt-5 text-[0.95rem] leading-[1.8] sm:text-base">
              {principal.meta.resumo}
            </p>

            <div className="mt-6 text-center">
              <BotaoLink
                href={`/eventos/${principal.meta.slug}/`}
                variante="primario"
              >
                Ler os cinco capítulos
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>

        {/* Cronologia */}
        <Revelar className="mt-8">
          <Pergaminho borda={3} inclinacao="esquerda">
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
      </main>

      <Rodape />
    </>
  );
}
