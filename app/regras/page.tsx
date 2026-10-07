import type { Metadata } from "next";
import Link from "next/link";
import { documentosDeRegra } from "@/lib/regras";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Compêndio",
  description:
    "As regras de 2024 de D&D em português: classes, espécies, antecedentes, talentos, magias e mais. Tradução livre do SRD 5.2.1.",
};

/** As partes do Compêndio que têm página própria, fora de content/regras. */
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
];

export default function PaginaCompendio() {
  const partes = [
    ...FIXAS,
    ...documentosDeRegra().map((d) => ({
      href: `/regras/${d.slug}/`,
      titulo: d.titulo,
      original: d.original,
      ordem: d.ordem,
      resumo: d.resumo,
    })),
  ].sort((a, b) => a.ordem - b.ordem);

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">Compêndio</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              As regras que a mesa usa, em português, para criar um
              personagem ou tirar uma dúvida no meio da sessão.
            </p>
          </header>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {partes.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group painel-ficha flex h-full flex-col px-4 pt-4 pb-3.5 transition-transform motion-safe:hover:-translate-y-0.5"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-brasao text-tinta-900 text-2xl group-hover:underline">
                      {p.titulo}
                    </span>
                    <span className="text-tinta-500 text-xs italic" lang="en">
                      {p.original}
                    </span>
                  </span>
                  <span className="text-tinta-700 mt-2 text-sm leading-relaxed">{p.resumo}</span>
                </Link>
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
