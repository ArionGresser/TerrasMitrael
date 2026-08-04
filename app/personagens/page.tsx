import type { Metadata } from "next";
import Image from "next/image";
import {
  ORIGIN_HEROES,
  PERSONAGENS_ATUAIS,
  FORA_DE_CATEGORIA,
  tagsDe,
  type Personagem,
} from "@/lib/personagens";
import { FitasMudas } from "@/components/personagens/Fita";
import { Glossario } from "@/components/personagens/Glossario";
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

/** O quadro de tábuas onde os cartazes ficam pregados. */
function Mural({
  children,
  className = "",
  colunas = 2,
}: {
  children: React.ReactNode;
  className?: string;
  /** O glossário ocupa a tábua inteira; os cartazes se dividem em duas. */
  colunas?: 1 | 2;
}) {
  return (
    <div
      className={`mural border-madeira-950/70 relative rounded-sm border-4 p-3 sm:p-5 ${className}`}
    >
      {/* Os quatro parafusos que prendem o quadro na parede */}
      {[
        "top-1.5 left-1.5",
        "top-1.5 right-1.5",
        "bottom-1.5 left-1.5",
        "bottom-1.5 right-1.5",
      ].map((posicao) => (
        <span
          key={posicao}
          aria-hidden
          className={`tachinha absolute ${posicao} size-2.5 rounded-full`}
        />
      ))}

      <div className={`grid gap-5 ${colunas === 2 ? "sm:grid-cols-2" : ""}`}>
        {children}
      </div>
    </div>
  );
}

/** Um cartaz solto pregado na tábua, sem ser o de um personagem. */
function Cartaz({ children }: { children: React.ReactNode }) {
  return (
    <Revelar className="relative pt-2">
      <span
        aria-hidden
        className="tachinha absolute top-0 left-1/2 z-10 size-3 -translate-x-1/2 rounded-full"
      />
      <Pergaminho variante="cartao" borda={2}>
        {children}
      </Pergaminho>
    </Revelar>
  );
}

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
      className="relative pt-2"
    >
      {/* A tachinha que segura o cartaz na tábua */}
      <span
        aria-hidden
        className="tachinha absolute top-0 left-1/2 z-10 size-3 -translate-x-1/2 rounded-full"
      />

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

        <TituloCapitulo className="mt-3">{meta.nome}</TituloCapitulo>
        <p className="text-tinta-500 mt-0.5 text-xs tracking-wide">
          {meta.epiteto}
        </p>

        <div className="mt-2.5">
          <FitasMudas chaves={tagsDe(meta)} />
        </div>

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

        {/* O glossário das fitas, antes dos cartazes: quem chega aprende a
            ler as fitas primeiro e depois reconhece cada uma nos murais */}
        <Revelar className="mt-14">
          <div className="text-center">
            <TituloSecao tom="claro">O glossário das fitas</TituloSecao>
            <p className="text-pergaminho-300/80 mx-auto mt-2 max-w-md text-sm leading-relaxed">
              Toda ficha carrega as suas. Toque numa fita para saber o que ela
              quer dizer
            </p>
          </div>
        </Revelar>

        <Mural className="mt-6" colunas={1}>
          <Cartaz>
            <Glossario />
          </Cartaz>
        </Mural>

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

            <Mural className="mt-6">
              {PERSONAGENS_ATUAIS.map((personagem, i) => (
                <CartaoPersonagem
                  key={personagem.meta.slug}
                  personagem={personagem}
                  indice={i}
                />
              ))}
            </Mural>
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

        <Mural className="mt-6">
          {ORIGIN_HEROES.map((personagem, i) => (
            <CartaoPersonagem
              key={personagem.meta.slug}
              personagem={personagem}
              indice={i}
            />
          ))}
        </Mural>

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
