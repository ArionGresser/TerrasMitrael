import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documentosDeRegra, buscarDocumento, type ItemDeRegra } from "@/lib/regras";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Dobra } from "@/components/ui/Dobra";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, TituloSecao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return documentosDeRegra().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = buscarDocumento((await params).slug);
  if (!doc) return {};
  return { title: doc.titulo, description: `${doc.resumo} Regras de 2024, em português.` };
}

export default async function PaginaDocumento({ params }: Props) {
  const doc = buscarDocumento((await params).slug);
  if (!doc) notFound();

  const todos = doc.grupos.flatMap((g) => g.itens).filter((i) => i.titulo);

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <nav aria-label="Caminho" className="text-center text-xs">
          <Link
            href="/regras/"
            className="text-pergaminho-300/80 hover:text-pergaminho-100 underline-offset-4 hover:underline"
          >
            ← Compêndio
          </Link>
        </nav>

        <Pergaminho borda={1} className="mt-5">
          <header className="text-center">
            <Sobretitulo>Compêndio · Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">{doc.titulo}</TituloBrasao>
            <p className="text-tinta-500 mt-2 text-sm italic" lang="en">
              {doc.original}
            </p>
            <Ornamento className="mt-6" />
          </header>

          <div className="mx-auto max-w-[40rem]">
            {doc.abertura ? (
              <div className="mt-2">
                <TextoDeRegra texto={doc.abertura} />
              </div>
            ) : null}

            {/* Com muitos itens abertos, um índice no alto leva direto a cada um */}
            {doc.estilo === "aberto" && todos.length > 12 ? (
              <nav aria-label={`Índice de ${doc.titulo}`} className="painel-ficha mt-8 px-4 py-3">
                <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {todos.map((i) => (
                    <li key={i.id}>
                      <a
                        href={`#${i.id}`}
                        className="text-tinta-700 hover:text-heraldico-vermelho inline-block py-0.5 underline-offset-2 hover:underline"
                      >
                        {i.titulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            {doc.grupos.map((grupo, g) => (
              <section key={g} aria-label={grupo.titulo} className="mt-10">
                {grupo.titulo ? (
                  <TituloSecao className="mb-6 text-center">{grupo.titulo}</TituloSecao>
                ) : null}
                <div className={doc.estilo === "aberto" ? "space-y-7" : "space-y-5"}>
                  {grupo.itens.map((item) =>
                    !item.titulo ? (
                      <TextoDeRegra key={item.id + "-abertura"} texto={item.texto} />
                    ) : doc.estilo === "aberto" ? (
                      <Aberto key={item.id} item={item} />
                    ) : (
                      <div key={item.id} id={item.id} className="scroll-mt-24">
                        <Dobra titulo={item.titulo}>
                          <TextoDeRegra texto={item.texto} />
                        </Dobra>
                      </div>
                    )
                  )}
                </div>
              </section>
            ))}

            <div className="mt-12 text-center">
              <BotaoLink href="/regras/" variante="primario">
                Voltar ao Compêndio
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

function Aberto({ item }: { item: ItemDeRegra }) {
  return (
    <article id={item.id} className="border-dourado-600/25 scroll-mt-24 border-b border-dashed pb-6 last:border-0">
      <h3 className="font-titulo text-tinta-900 text-lg font-bold">{item.titulo}</h3>
      <div className="mt-2">
        <TextoDeRegra texto={item.texto} />
      </div>
    </article>
  );
}
