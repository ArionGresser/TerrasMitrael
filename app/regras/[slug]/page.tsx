import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { documentosDeRegra, buscarDocumento, nomesDoItem, type DocumentoDeRegra, type ItemDeRegra } from "@/lib/regras";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Dobra } from "@/components/ui/Dobra";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, TituloSecao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { QuadroDeArte, Miniatura, GRADE_DE_CARTOES } from "@/components/ui/QuadroDeArte";
import { arteDoItemDeRegra, type ArteDeRegra } from "@/lib/regras-arte";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";
import { Capa } from "@/components/ui/Capa";
import { arte } from "@/lib/arte";
import { BuscaNoDocumento, Filtravel, ItemComArte, TopicoRecolhido } from "@/components/regras/Recolhido";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return documentosDeRegra().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = buscarDocumento((await params).slug);
  if (!doc) return {};
  return {
    title: doc.titulo,
    description: `${doc.resumo} Regras de 2024, em português.`,
  };
}

export default async function PaginaDocumento({ params }: Props) {
  const doc = buscarDocumento((await params).slug);
  if (!doc) notFound();

  const todos = doc.grupos.flatMap((g) => g.itens).filter((i) => i.titulo);
  // A arte do cartão no Livro do Aventureiro vira a capa, quando existe
  const capa = arte("compendio", doc.slug);

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        {capa ? (
          <Capa
            imagem={capa}
            sobretitulo="Livro do Aventureiro · Regras de 2024"
            titulo={doc.titulo}
            original={doc.original}
            volta={{ href: "/regras/", rotulo: "Livro do Aventureiro" }}
          />
        ) : null}

        <Pergaminho borda={1} className={capa ? "mt-8" : ""}>
          {capa ? null : (
            <>
              <SeloDeVolta href="/regras/" rotulo="Livro do Aventureiro" />
              <header className="text-center">
                <Sobretitulo>Livro do Aventureiro · Regras de 2024</Sobretitulo>
                <TituloBrasao className="mt-4">{doc.titulo}</TituloBrasao>
                <p className="text-tinta-500 mt-2 text-sm italic" lang="en">
                  {doc.original}
                </p>
                <Ornamento className="mt-6" />
              </header>
            </>
          )}

          <div className="mx-auto max-w-[40rem]">
            {doc.abertura ? (
              <div className="mt-2">
                <TextoDeRegra texto={doc.abertura} />
              </div>
            ) : null}

            {/* Com muitos itens abertos, um índice no alto leva direto a
                cada um, separado pelos grupos do documento */}
            {doc.estilo === "aberto" && todos.length > 12 ? (
              <Indice doc={doc} className="painel-ficha mt-8 px-4 py-3" />
            ) : null}

            {doc.estilo === "recolhido" ? <DocumentoRecolhido doc={doc} /> : null}

            {doc.estilo === "recolhido"
              ? null
              : doc.grupos.map((grupo, g) => (
                  <section key={g} aria-label={grupo.titulo} className="mt-10">
                    {grupo.titulo ? <TituloSecao className="mb-6 text-center">{grupo.titulo}</TituloSecao> : null}
                    <div className={doc.estilo === "aberto" ? "space-y-7" : "space-y-5"}>
                      {grupo.itens.map((item) => {
                        if (!item.titulo) {
                          return <TextoDeRegra key={item.id + "-abertura"} texto={item.texto} />;
                        }
                        const arte = arteDoItemDeRegra(doc.slug, grupo.titulo, item.id);
                        return doc.estilo === "aberto" ? (
                          <Aberto key={item.id} item={item} arte={arte} />
                        ) : (
                          <div key={item.id} id={item.id} className="scroll-mt-24">
                            <Dobra titulo={item.titulo}>
                              {/* A arte flutua à direita, para o texto começar
                              logo no alto e aparecer na prévia recolhida */}
                              <div className="flow-root">
                                {arte ? (
                                  <div className="float-right mb-2 ml-4 w-32 sm:w-48">
                                    <QuadroDeArte
                                      src={arte.src}
                                      alt={`Ilustração: ${item.titulo}`}
                                      compacto
                                      sizes="192px"
                                    />
                                  </div>
                                ) : null}
                                <TextoDeRegra texto={item.texto} />
                              </div>
                            </Dobra>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}

            <div className="mt-12 text-center">
              <BotaoLink href="/regras/" variante="primario">
                Voltar ao Livro do Aventureiro
              </BotaoLink>
            </div>

            <CreditoSrd className="mt-10" />
          </div>
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}

function Aberto({ item, arte }: { item: ItemDeRegra; arte?: ArteDeRegra }) {
  // Os objetos (quadrado) ficam numa miniatura ao lado do nome; as
  // prateleiras (largo) num quadro inteiro logo abaixo dele.
  const objeto = arte?.formato === "quadrado";
  return (
    <article id={item.id} className="border-dourado-600/25 scroll-mt-24 border-b border-dashed pb-6 last:border-0">
      <div className={objeto ? "flex items-start gap-4" : ""}>
        {objeto ? <Miniatura src={arte.src} tamanho="bloco" /> : null}
        <div className="min-w-0 flex-1">
          <h3 className="font-titulo text-tinta-900 text-lg font-bold">{item.titulo}</h3>
          {arte && !objeto ? (
            <QuadroDeArte src={arte.src} alt={`Ilustração: ${item.titulo}`} className="mt-3 mb-1" />
          ) : null}
          <div className="mt-2">
            <TextoDeRegra texto={item.texto} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Indice({ doc, className = "" }: { doc: DocumentoDeRegra; className?: string }) {
  return (
    <nav aria-label={`Índice de ${doc.titulo}`} className={`space-y-2 ${className}`}>
      {doc.grupos.map((grupo, g) => {
        const itens = grupo.itens.filter((i) => i.titulo);
        if (itens.length === 0) return null;
        return (
          <div key={g} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
            {grupo.titulo ? (
              <span className="font-titulo text-tinta-900 text-xs font-bold tracking-wide">{grupo.titulo}</span>
            ) : null}
            {itens.map((i) => (
              <a
                key={i.id}
                href={`#${i.id}`}
                className="text-tinta-700 hover:text-heraldico-vermelho inline-block py-0.5 underline-offset-2 hover:underline"
              >
                {i.titulo}
              </a>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * O documento longo, como o Equipamento: o índice e cada regra enrolados em
 * pergaminhos, e os objetos (com arte quadrada) em cartões de duas colunas,
 * com a busca por nome logo acima deles. No celular, quem chega vê os
 * títulos e escolhe o que ler, em vez de rolar tudo.
 */
function DocumentoRecolhido({ doc }: { doc: DocumentoDeRegra }) {
  return (
    <>
      <div className="mt-8">
        <Dobra titulo="Índice">
          <Indice doc={doc} />
        </Dobra>
      </div>

      {doc.grupos.map((grupo, g) => {
        const abertura = grupo.itens.filter((i) => !i.titulo);
        const itens = grupo.itens.filter((i) => i.titulo);
        const artes = itens.map((i) => arteDoItemDeRegra(doc.slug, grupo.titulo, i.id));
        const objetos = artes.some((a) => a?.formato === "quadrado");
        return (
          <section key={g} aria-label={grupo.titulo} className="mt-10">
            {grupo.titulo ? <TituloSecao className="mb-6 text-center">{grupo.titulo}</TituloSecao> : null}
            {abertura.map((item) => (
              <TextoDeRegra key={item.id + "-abertura"} texto={item.texto} />
            ))}

            {objetos ? (
              <BuscaNoDocumento
                itens={itens.map(nomesDoItem)}
                rotulo={`Procurar em ${grupo.titulo}`}
                dica="Corda, tocha, poção de cura..."
              >
                <ul className={`mt-4 ${GRADE_DE_CARTOES}`}>
                  {itens.map((item, i) => {
                    // O preço e o peso ("_25 PO · 0,5 kg_") sobem para o cartão
                    const preco = item.texto.match(/^_([^_\n]+)_\s*/);
                    return (
                      <Filtravel as="li" key={item.id} nomes={nomesDoItem(item)}>
                        <ItemComArte id={item.id} titulo={item.titulo} detalhe={preco?.[1]} arte={artes[i]?.src}>
                          <TextoDeRegra texto={preco ? item.texto.slice(preco[0].length) : item.texto} />
                        </ItemComArte>
                      </Filtravel>
                    );
                  })}
                </ul>
              </BuscaNoDocumento>
            ) : (
              <div className="mt-5 space-y-5">
                {itens.map((item, i) => (
                  <TopicoRecolhido key={item.id} id={item.id} titulo={item.titulo}>
                    {artes[i]?.src ? (
                      <QuadroDeArte src={artes[i].src} alt={`Ilustração: ${item.titulo}`} className="mb-4" />
                    ) : null}
                    <TextoDeRegra texto={item.texto} />
                  </TopicoRecolhido>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
