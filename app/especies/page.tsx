import type { Metadata } from "next";
import Link from "next/link";
import { ESPECIES } from "@/lib/especies";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { QuadroDeArte } from "@/components/ui/QuadroDeArte";
import { arte } from "@/lib/arte";

export const metadata: Metadata = {
  title: "Espécies",
  description:
    "As espécies das regras de 2024 de D&D, em português: anão, draconato, elfo, gnomo, golias, humano, orc, pequenino e tiefling. Tradução livre do SRD 5.2.1.",
};

export default function PaginaEspecies() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>Regras de 2024</Sobretitulo>
            <TituloBrasao className="mt-4">Espécies</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Os povos que as regras trazem prontos para criar um personagem.
              Mitrael tem muitos outros, mas é por estes que a ficha começa.
            </p>
          </header>

          <div className="text-tinta-900 mx-auto mt-8 max-w-[38rem] space-y-3.5 text-[0.95rem] leading-[1.75] sm:text-base">
            <p>
              A espécie define o tipo de criatura, o tamanho, o Deslocamento e
              os traços especiais do personagem, que vêm do corpo ou da magia
              daquele povo. Todas as espécies daqui são Humanoides. Algumas
              deixam escolher entre o tamanho Pequeno e o Médio.
            </p>
            <p>
              A maioria dos povos vive cerca de 80 anos, e todos chegam à
              idade adulta mais ou menos na mesma época. O personagem pode ter
              qualquer idade dentro da vida normal da sua espécie.
            </p>
          </div>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {ESPECIES.map((especie) => (
              <li key={especie.slug}>
                <Link
                  href={`/especies/${especie.slug}/`}
                  className="group painel-ficha flex h-full flex-col px-4 pt-4 pb-3.5 transition-transform motion-safe:hover:-translate-y-0.5"
                >
                  <QuadroDeArte
                    src={arte("especies", especie.slug)}
                    alt=""
                    compacto
                    sizes="(max-width: 640px) 100vw, 340px"
                    className="mb-3"
                  />
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-brasao text-tinta-900 text-2xl group-hover:underline">
                      {especie.nome}
                    </span>
                    <span className="text-tinta-500 text-xs italic" lang="en">
                      {especie.original}
                    </span>
                  </span>
                  <span className="text-tinta-500 mt-1 text-xs">
                    {especie.tamanho.split(" (")[0]}
                    {especie.tamanho.includes(" ou ") ? " ou Pequeno" : ""} ·{" "}
                    {especie.deslocamento}
                  </span>
                  <span className="text-tinta-700 mt-2.5 text-sm leading-relaxed">
                    {especie.tracos.join(" · ")}
                  </span>
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
