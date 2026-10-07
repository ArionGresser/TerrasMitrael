import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { documentosDeRegra } from "@/lib/regras";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Livro do Aventureiro",
  description:
    "As regras de 2024 de D&D em português: classes, espécies, antecedentes, talentos, magias, itens mágicos, monstros e mais. Tradução livre do SRD 5.2.1.",
};

/** As partes do Livro do Aventureiro que têm página própria, fora de content/regras. */
const FIXAS = [
  {
    href: "/classes/",
    titulo: "Classes",
    original: "Classes",
    ordem: 1,
    resumo: "As doze classes, do nível 1 ao 20, cada uma com uma subclasse.",
  },
  {
    href: "/especies/",
    titulo: "Espécies",
    original: "Species",
    ordem: 2,
    resumo: "Os povos que as regras trazem prontos para criar um personagem.",
  },
  {
    href: "/magias/",
    titulo: "Grimório",
    original: "Spells",
    ordem: 5,
    resumo: "As 339 magias, com busca por nome, classe, círculo e escola.",
  },
  {
    href: "/itens/",
    titulo: "Itens Mágicos",
    original: "Magic Items",
    ordem: 7,
    resumo: "Os 258 itens mágicos, com busca por tipo, raridade e sintonia.",
  },
  {
    href: "/monstros/",
    titulo: "Bestiário",
    original: "Monsters & Animals",
    ordem: 8,
    resumo:
      "Os 330 monstros e animais, com busca por tipo, Nível de Desafio e tamanho.",
  },
];

/**
 * A imagem de cada cartão fica em public/images/compendio/, com o nome do
 * endereço da parte: classes.webp, magias.webp, glossario.webp... Basta pôr o
 * arquivo na pasta (webp, jpg ou png) e rodar o build. Enquanto não houver
 * arquivo, o cartão mostra só a moldura vazia, guardando o lugar.
 */
const PASTA_DAS_IMAGENS = "images/compendio";
const FORMATOS = ["webp", "jpg", "png"];

function imagemDaParte(href: string): string | null {
  const chave = href.split("/").filter(Boolean).pop();
  for (const formato of FORMATOS) {
    const arquivo = `${PASTA_DAS_IMAGENS}/${chave}.${formato}`;
    if (existsSync(path.join(process.cwd(), "public", arquivo))) {
      return `/${arquivo}`;
    }
  }
  return null;
}

export default function PaginaLivroDoAventureiro() {
  const partes = [
    ...FIXAS,
    ...documentosDeRegra()
      .filter((d) => !d.oculto)
      .map((d) => ({
        href: `/regras/${d.slug}/`,
        titulo: d.titulo,
        original: d.original,
        ordem: d.ordem,
        resumo: d.resumo,
      })),
  ]
    .sort((a, b) => a.ordem - b.ordem)
    .map((p) => ({ ...p, imagem: imagemDaParte(p.href) }));

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">Livro do Aventureiro</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              As regras que a mesa usa, em português, para criar um personagem
              ou tirar uma dúvida no meio da sessão.
            </p>
          </header>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {partes.map((p, i) => {
              // Com número ímpar de partes, a última ocupa a linha inteira
              const sozinha =
                i === partes.length - 1 && partes.length % 2 === 1;
              return (
                <li key={p.href} className={sozinha ? "sm:col-span-2" : ""}>
                  <Link
                    href={p.href}
                    className="group painel-ficha flex h-full flex-col px-4 pt-4 pb-3.5 transition-transform motion-safe:hover:-translate-y-0.5"
                  >
                    <span
                      className={`border-dourado-600/30 bg-pergaminho-200/50 relative mb-3 block aspect-[16/9] w-full overflow-hidden rounded-sm border ${
                        sozinha ? "sm:aspect-[21/7]" : ""
                      }`}
                    >
                      {p.imagem ? (
                        <Image
                          src={p.imagem}
                          alt=""
                          fill
                          sizes={
                            sozinha
                              ? "(max-width: 640px) 100vw, 700px"
                              : "(max-width: 640px) 100vw, 340px"
                          }
                          className="object-cover sepia-[0.12]"
                        />
                      ) : (
                        // Sem imagem ainda: só a moldura, com um enfeite no meio
                        <span
                          aria-hidden
                          className="border-dourado-600/35 text-dourado-600/50 absolute inset-2 grid place-items-center rounded-sm border border-dashed text-2xl"
                        >
                          ❦
                        </span>
                      )}
                    </span>
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-brasao text-tinta-900 text-2xl group-hover:underline">
                        {p.titulo}
                      </span>
                      <span className="text-tinta-500 text-xs italic" lang="en">
                        {p.original}
                      </span>
                    </span>
                    <span className="text-tinta-700 mt-2 text-sm leading-relaxed">
                      {p.resumo}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}
