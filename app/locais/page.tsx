import type { Metadata } from "next";
import Image from "next/image";
import { LOCAIS } from "@/lib/locais";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloCapitulo,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Locais",
  description:
    "As terras que formam o continente de Mitrael: capitais, florestas sagradas, redutos de magia e lugares onde ninguém quer pisar.",
};

export default function PaginaLocais() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho inclinacao="esquerda" borda={1}>
          <header className="text-center">
            <Sobretitulo>O continente</Sobretitulo>
            <TituloBrasao className="mt-4">Locais</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Seis terras que definem o mundo conhecido — e uma delas está
              selada do lado de fora.
            </p>
          </header>
        </Pergaminho>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {LOCAIS.map((local, i) => (
            <Revelar
              key={local.meta.slug}
              atraso={(i % 2) * 0.08}
              direcao={i % 2 === 0 ? "esquerda" : "direita"}
            >
              <Pergaminho
                variante="cartao"
                borda={((i % 3) + 1) as 1 | 2 | 3}
                inclinacao={i % 2 === 0 ? "esquerda" : "direita"}
                className="flex h-full flex-col"
              >
                <div className="border-madeira-800/25 relative aspect-[16/10] w-full overflow-hidden rounded-sm border">
                  <Image
                    src={local.meta.imagem}
                    alt={local.meta.imagemAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 340px"
                    className="object-cover sepia-[0.12]"
                  />
                </div>

                <TituloCapitulo className="mt-4">
                  {local.meta.nome}
                </TituloCapitulo>
                <p className="text-tinta-500 mt-0.5 text-xs tracking-wide">
                  {local.meta.subtitulo}
                </p>

                <p className="text-tinta-700 mt-3 grow text-sm leading-relaxed">
                  {local.meta.resumo}
                </p>

                <div className="mt-4">
                  <BotaoLink
                    href={`/locais/${local.meta.slug}/`}
                    variante="secundario"
                    className="text-xs"
                  >
                    Conhecer
                  </BotaoLink>
                </div>
              </Pergaminho>
            </Revelar>
          ))}
        </div>
      </main>

      <Rodape />
    </>
  );
}
