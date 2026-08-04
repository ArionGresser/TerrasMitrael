import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PERSONAGENS, buscarPersonagem, tagsDe } from "@/lib/personagens";
import { Fitas } from "@/components/personagens/Fitas";
import {
  Abas,
  CabecalhoDaAba,
  IconePena,
  IconeEscudo,
  IconeArcano,
  IconeMochila,
  type Aba,
} from "@/components/personagens/Abas";
import {
  FichaAntigaRegistro,
  FichaAntigaHabilidades,
  temFichaAntiga,
} from "@/components/personagens/FichaAntiga";
import {
  FichaAtualNumeros,
  FichaAtualPoderes,
  FichaAtualMochila,
  temPoderes,
  resumoDaFicha,
} from "@/components/personagens/FichaAtual";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Capitulos } from "@/components/ui/Capitulos";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Ilustracao } from "@/components/ui/Ilustracao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PERSONAGENS.map((p) => ({ slug: p.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const personagem = buscarPersonagem(slug);
  if (!personagem) return {};

  return {
    title: `${personagem.meta.nome}, ${personagem.meta.epiteto}`,
    description: personagem.meta.resumo,
  };
}

export default async function PaginaPersonagem({ params }: Props) {
  const { slug } = await params;
  const personagem = buscarPersonagem(slug);

  if (!personagem) notFound();

  const { meta, Historia } = personagem;

  /**
   * As linguetas do dossiê.
   *
   * A ordem é sempre a mesma em todo personagem, e cada uma só aparece se
   * tiver o que mostrar: quem não conjura não ganha aba de poderes vazia.
   */
  const abas: Aba[] = [
    {
      chave: "historia",
      rotulo: "História",
      icone: <IconePena />,
      conteudo: (
        <>
          <CabecalhoDaAba
            titulo="História"
            legenda={`De onde veio ${meta.nome} e o que ficou pelo caminho`}
          />

          {meta.audio ? (
            <div className="border-dourado-600/25 mt-7 rounded-sm border px-4 py-4">
              <p className="text-tinta-500 text-center text-xs tracking-[0.15em] uppercase">
                Narração da história
              </p>
              <audio
                controls
                preload="none"
                src={meta.audio}
                className="mt-3 w-full"
              >
                Seu navegador não consegue tocar este áudio.
              </audio>
            </div>
          ) : null}

          {meta.emConstrucao ? (
            <p className="border-dourado-600/40 text-tinta-700 mx-auto mt-7 max-w-md border border-dashed px-5 py-5 text-center text-sm leading-relaxed italic">
              {meta.emConstrucao}
            </p>
          ) : (
            <div className="mt-7">
              <Capitulos
                Texto={Historia}
                rotuloAbrir="Ler o capítulo"
                rotuloTexto="Ler a história"
              />
            </div>
          )}

          {meta.ilustracao ? (
            <Ilustracao src={meta.ilustracao} alt={meta.ilustracaoAlt ?? ""} />
          ) : null}

          {meta.citacoes.length > 0 ? (
            <>
              <Ornamento className="mt-10" />
              <div className="mt-8 space-y-5">
                {meta.citacoes.map((citacao) => (
                  <blockquote
                    key={citacao}
                    className="border-dourado-600/50 border-l-2 pl-4"
                  >
                    <p className="text-tinta-700 text-[0.95rem] leading-relaxed italic">
                      {citacao}
                    </p>
                    <footer className="font-titulo text-tinta-500 mt-1.5 text-xs tracking-wide">
                      {meta.nome}, {meta.epiteto}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </>
          ) : null}
        </>
      ),
    },
  ];

  if (meta.ficha) {
    abas.push({
      chave: "ficha",
      rotulo: "Ficha",
      icone: <IconeEscudo />,
      conteudo: (
        <>
          <CabecalhoDaAba
            titulo="Ficha de aventura"
            legenda={resumoDaFicha(meta.ficha)}
          />
          <FichaAtualNumeros ficha={meta.ficha} />
        </>
      ),
    });

    if (temPoderes(meta.ficha)) {
      abas.push({
        chave: "poderes",
        rotulo: "Poderes",
        icone: <IconeArcano />,
        conteudo: (
          <>
            <CabecalhoDaAba
              titulo="Poderes e traços"
              legenda="O que ele sabe fazer, e de onde cada coisa veio"
            />
            <FichaAtualPoderes ficha={meta.ficha} />
          </>
        ),
      });
    }

    abas.push({
      chave: "mochila",
      rotulo: "Mochila",
      icone: <IconeMochila />,
      conteudo: (
        <>
          <CabecalhoDaAba
            titulo="Armas e mochila"
            legenda="O que ele carrega, o que sabe usar e quanto sobrou na bolsa"
          />
          <FichaAtualMochila ficha={meta.ficha} />
        </>
      ),
    });
  } else if (temFichaAntiga(meta)) {
    abas.push({
      chave: "ficha",
      rotulo: "Ficha",
      icone: <IconeEscudo />,
      conteudo: (
        <>
          <CabecalhoDaAba
            titulo="Ficha de registro"
            legenda="Do sistema de regras próprio da casa. Nenhum número aqui vale como regra no sistema atual."
          />
          <FichaAntigaRegistro meta={meta} />
        </>
      ),
    });

    if (meta.habilidades && meta.habilidades.length > 0) {
      abas.push({
        chave: "poderes",
        rotulo: "Poderes",
        icone: <IconeArcano />,
        conteudo: (
          <>
            <CabecalhoDaAba
              titulo="Habilidades"
              legenda="Passivas, magias e golpes anotados na ficha antiga"
            />
            <FichaAntigaHabilidades meta={meta} />
          </>
        ),
      });
    }
  }

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        {/* A folha de rosto do dossiê: retrato, nome e fitas. Curta de
            propósito, para as abas caberem na primeira tela. */}
        <Pergaminho borda={1}>
          <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start sm:gap-8">
            <div className="border-madeira-800/25 shadow-pergaminho relative aspect-[4/5] w-full max-w-[14rem] shrink-0 overflow-hidden rounded-sm border sm:w-56 sm:max-w-none">
              <Image
                src={meta.imagem}
                alt={meta.imagemAlt}
                fill
                sizes="(max-width: 640px) 224px, 224px"
                className="object-cover object-top sepia-[0.12]"
                priority
              />
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <Sobretitulo>{meta.epiteto}</Sobretitulo>
              <TituloBrasao className="mt-2">{meta.nome}</TituloBrasao>

              <div className="mt-4">
                <Fitas chaves={tagsDe(meta)} alinhamento="cabecalho" />
              </div>

              <p className="text-tinta-700 mt-5 text-sm leading-relaxed italic sm:text-base">
                {meta.resumo}
              </p>
            </div>
          </div>
        </Pergaminho>

        <Abas abas={abas} className="mt-9" />

        <Revelar className="mt-8">
          <Pergaminho variante="cartao" borda={3} inclinacao="direita">
            <div className="flex flex-wrap justify-center gap-3">
              <BotaoLink
                href="/personagens/"
                variante="primario"
                className="text-xs"
              >
                Todos os personagens
              </BotaoLink>
              <BotaoLink href="/locais/" variante="secundario" className="text-xs">
                Explorar os locais
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>
      </main>

      <Rodape />
    </>
  );
}
