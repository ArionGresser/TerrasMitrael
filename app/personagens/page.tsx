import type { Metadata } from "next";
import Image from "next/image";
import {
  ORIGIN_HEROES,
  PERSONAGENS_ATUAIS,
  FORA_DE_CATEGORIA,
  type Personagem,
} from "@/lib/personagens";
import {
  SeloOriginHero,
  ExplicacaoOriginHero,
} from "@/components/personagens/SeloOriginHero";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloSecao,
  TituloCapitulo,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Personagens",
  description:
    "Os heróis que caminharam pelas Terras de Mitrael, com suas origens, suas escolhas e as marcas que deixaram no mundo.",
};

function CartaoPersonagem({
  personagem,
  indice,
}: {
  personagem: Personagem;
  indice: number;
}) {
  const { meta } = personagem;

  return (
    <Revelar
      atraso={(indice % 2) * 0.08}
      direcao={indice % 2 === 0 ? "esquerda" : "direita"}
    >
      <Pergaminho
        variante="cartao"
        borda={((indice % 3) + 1) as 1 | 2 | 3}
        inclinacao={indice % 2 === 0 ? "esquerda" : "direita"}
        className="flex h-full flex-col"
      >
        <div className="border-madeira-800/25 relative aspect-[4/5] w-full overflow-hidden rounded-sm border">
          <Image
            src={meta.imagem}
            alt={meta.imagemAlt}
            fill
            sizes="(max-width: 640px) 100vw, 340px"
            className="object-cover object-top sepia-[0.12]"
          />
        </div>

        {meta.originHero ? (
          <div className="mt-3">
            <SeloOriginHero tamanho="pequeno" />
          </div>
        ) : null}

        <TituloCapitulo className="mt-2">{meta.nome}</TituloCapitulo>
        <p className="text-tinta-500 mt-0.5 text-xs tracking-wide">
          {meta.epiteto}
        </p>

        <p className="text-tinta-700 mt-3 grow text-sm leading-relaxed">
          {meta.resumo}
        </p>

        <div className="mt-4">
          <BotaoLink
            href={`/personagens/${meta.slug}/`}
            variante="secundario"
            className="text-xs"
          >
            Ler a história
          </BotaoLink>
        </div>
      </Pergaminho>
    </Revelar>
  );
}

export default function PaginaPersonagens() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho inclinacao="esquerda" borda={1}>
          <header className="text-center">
            <Sobretitulo>Quem caminhou por Mitrael</Sobretitulo>
            <TituloBrasao className="mt-4">Personagens</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Cada um deles chegou aqui por um caminho diferente. Nenhum chegou
              inteiro.
            </p>
          </header>
        </Pergaminho>

        {/* Personagens atuais, quando existirem */}
        {PERSONAGENS_ATUAIS.length > 0 ? (
          <>
            <Revelar className="mt-14">
              <div className="text-center">
                <TituloSecao tom="claro">Personagens atuais</TituloSecao>
                <p className="text-pergaminho-300/80 mt-2 text-sm">
                  Fichas construídas sob as regras de D&amp;D 5.5e
                </p>
              </div>
            </Revelar>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {PERSONAGENS_ATUAIS.map((personagem, i) => (
                <CartaoPersonagem
                  key={personagem.meta.slug}
                  personagem={personagem}
                  indice={i}
                />
              ))}
            </div>
          </>
        ) : null}

        {/* Primeira geração */}
        <Revelar className="mt-14">
          <div className="text-center">
            <TituloSecao tom="claro">A primeira geração</TituloSecao>
            <p className="text-pergaminho-300/80 mx-auto mt-2 max-w-md text-sm leading-relaxed">
              Os heróis que abriram caminho em Mitrael, do primeiro ano de mesa
              em diante
            </p>
          </div>
        </Revelar>

        <Revelar className="mt-6">
          <Pergaminho variante="cartao" borda={2}>
            <ExplicacaoOriginHero />
          </Pergaminho>
        </Revelar>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ORIGIN_HEROES.map((personagem, i) => (
            <CartaoPersonagem
              key={personagem.meta.slug}
              personagem={personagem}
              indice={i}
            />
          ))}
        </div>

        {/* O Mestre */}
        {FORA_DE_CATEGORIA.map((personagem) => (
          <Revelar key={personagem.meta.slug} className="mt-14">
            <Pergaminho variante="cartao" borda={3} inclinacao="direita">
              <div className="flex items-center gap-4">
                <div className="border-madeira-800/25 relative size-20 shrink-0 overflow-hidden rounded-sm border sm:size-24">
                  <Image
                    src={personagem.meta.imagem}
                    alt={personagem.meta.imagemAlt}
                    fill
                    sizes="96px"
                    className="object-cover sepia-[0.12]"
                  />
                </div>
                <div className="min-w-0">
                  <TituloCapitulo>{personagem.meta.nome}</TituloCapitulo>
                  <p className="text-tinta-500 mt-0.5 text-xs tracking-wide">
                    {personagem.meta.epiteto}
                  </p>
                  <p className="text-tinta-700 mt-2 text-sm leading-relaxed">
                    {personagem.meta.resumo}
                  </p>
                  <div className="mt-3">
                    <BotaoLink
                      href={`/personagens/${personagem.meta.slug}/`}
                      variante="discreto"
                      className="text-xs"
                    >
                      Ver mesmo assim
                    </BotaoLink>
                  </div>
                </div>
              </div>
            </Pergaminho>
          </Revelar>
        ))}
      </main>

      <Rodape />
    </>
  );
}
