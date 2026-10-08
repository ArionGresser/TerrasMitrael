import type { Metadata } from "next";
import Link from "next/link";
import { TODAS_AS_CLASSES, buscarClasse, traco } from "@/lib/classes";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { QuadroDeArte } from "@/components/ui/QuadroDeArte";
import { arte } from "@/lib/arte";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "As classes das regras de 2024 de D&D, em português, com as características de cada nível e uma subclasse. Tradução livre do SRD 5.2.1.",
};

export default function PaginaClasses() {
  const classes = TODAS_AS_CLASSES.map((c) => ({ ...c, classe: buscarClasse(c.slug) }));

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">Classes</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              O que cada aventureiro sabe fazer, do primeiro ao vigésimo
              nível. Cada classe traz uma subclasse das regras.
            </p>
          </header>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {classes.map(({ slug, nome, original, classe }) => (
              <li key={slug}>
                {classe ? (
                  <Link
                    href={`/classes/${slug}/`}
                    className="group painel-ficha flex h-full flex-col px-4 pt-4 pb-3.5 transition-transform motion-safe:hover:-translate-y-0.5"
                  >
                    <QuadroDeArte
                      src={arte("classes", slug)}
                      alt=""
                      compacto
                      sizes="(max-width: 640px) 100vw, 340px"
                      className="mb-3"
                    />
                    <Cabeca nome={nome} original={original} />
                    <span className="text-tinta-500 mt-1 text-xs">
                      {traco(classe, "Atributo principal")} ·{" "}
                      {traco(classe, "Dado de Pontos de Vida")?.split(" ")[0]}
                    </span>
                    <span className="text-tinta-700 mt-2.5 text-sm leading-relaxed">
                      Subclasse: {classe.subclasse.nome}
                    </span>
                  </Link>
                ) : (
                  <div className="painel-ficha flex h-full flex-col px-4 pt-4 pb-3.5 opacity-55">
                    <Cabeca nome={nome} original={original} />
                    <span className="font-titulo text-tinta-500 mt-2.5 text-[0.62rem] tracking-[0.2em] uppercase">
                      Em tradução
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <CreditoSrd className="mt-12" />
        </Pergaminho>
      </main>

      <Rodape />
    </>
  );
}

function Cabeca({ nome, original }: { nome: string; original: string }) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="font-brasao text-tinta-900 text-2xl group-hover:underline">{nome}</span>
      <span className="text-tinta-500 text-xs italic" lang="en">
        {original}
      </span>
    </span>
  );
}
