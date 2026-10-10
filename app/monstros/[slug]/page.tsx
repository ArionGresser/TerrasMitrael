import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MONSTROS, buscarMonstro } from "@/lib/monstros";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { CreditoSrd } from "@/components/magias/CreditoSrd";
import { Secao } from "@/components/personagens/Painel";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { QuadroDeArte } from "@/components/ui/QuadroDeArte";
import { arte } from "@/lib/arte";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MONSTROS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = buscarMonstro((await params).slug);
  if (!m) return {};
  return {
    title: `${m.nome}, ficha`,
    description: `${m.linha}. ND ${m.nd}, CA ${m.ca}, ${m.pv.split(" ")[0]} Pontos de Vida.`,
  };
}

export default async function PaginaMonstro({ params }: Props) {
  const m = buscarMonstro((await params).slug);
  if (!m) notFound();

  const combate = [
    { rotulo: "Classe de Armadura", valor: m.ca },
    { rotulo: "Iniciativa", valor: m.iniciativa },
    { rotulo: "Pontos de Vida", valor: m.pv },
    { rotulo: "Deslocamento", valor: m.deslocamento },
  ];

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={1}>
          <SeloDeVolta href="/monstros/" rotulo="Bestiário" />

          <header className="text-center">
            <Sobretitulo>Nível de Desafio {m.nd}</Sobretitulo>
            <TituloBrasao className="mt-4">{m.nome}</TituloBrasao>
            <p className="text-tinta-500 mt-2 text-sm italic" lang="en">
              {m.original}
            </p>
            <p className="text-tinta-700 mt-3 text-sm italic">{m.linha}</p>
            <Ornamento className="mt-6" />
          </header>

          <div className="mx-auto max-w-[38rem]">
            <QuadroDeArte
              src={arte("monstros", m.slug)}
              alt={`Ilustração: ${m.nome}`}
              className="mt-2"
            />

            <Secao titulo="Em combate">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {combate.map((c) => (
                  <div key={c.rotulo}>
                    <dt className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.14em] uppercase">
                      {c.rotulo}
                    </dt>
                    <dd className="text-tinta-900 mt-0.5 font-semibold">
                      {c.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            </Secao>

            <Secao titulo="Atributos">
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {m.atributos.map((a) => {
                  const proficiente = a.save !== a.mod;
                  return (
                    <li
                      key={a.sigla}
                      className="border-dourado-600/25 bg-pergaminho-50/50 flex flex-col items-center rounded-sm border px-1 pt-2 pb-2.5 text-center"
                    >
                      <p className="font-titulo text-tinta-700 text-[0.62rem] font-semibold tracking-[0.12em] uppercase">
                        {a.sigla}
                      </p>
                      <span className="medalhao mt-1.5 grid size-12 place-items-center rounded-full">
                        <span className="font-titulo text-tinta-900 text-xl leading-none font-bold">
                          {a.mod}
                        </span>
                      </span>
                      <span className="border-dourado-600/50 bg-pergaminho-100 font-titulo text-tinta-700 relative -mt-2 rounded-full border px-2 text-[0.66rem] leading-relaxed">
                        {a.valor}
                      </span>
                      <p
                        className={`mt-1.5 text-[0.62rem] leading-tight ${
                          proficiente
                            ? "text-heraldico-vermelho font-semibold"
                            : "text-tinta-500"
                        }`}
                      >
                        {proficiente ? "✦ " : ""}resist. {a.save}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Secao>

            <Secao titulo="Detalhes">
              <dl className="space-y-2 text-sm">
                {m.campos.map((c) => (
                  <div
                    key={c.rotulo}
                    className="grid gap-x-3 sm:grid-cols-[9rem_1fr]"
                  >
                    <dt className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.14em] uppercase sm:pt-0.5">
                      {c.rotulo}
                    </dt>
                    <dd className="text-tinta-900">
                      <TextoDeRegra texto={c.valor} />
                    </dd>
                  </div>
                ))}
                <div className="grid gap-x-3 sm:grid-cols-[9rem_1fr]">
                  <dt className="font-titulo text-tinta-500 text-[0.62rem] tracking-[0.14em] uppercase sm:pt-0.5">
                    Desafio
                  </dt>
                  <dd className="text-tinta-900">
                    ND {m.nd} · {m.xp} XP · Bônus de Proficiência {m.bp}
                  </dd>
                </div>
              </dl>
            </Secao>

            {m.secoes.map((s) => (
              <section key={s.titulo} className="mt-9">
                <h2 className="font-titulo text-tinta-900 border-dourado-600/40 border-b pb-1 text-lg font-bold">
                  {s.titulo}
                </h2>
                <div className="mt-3">
                  <TextoDeRegra texto={s.texto} />
                </div>
              </section>
            ))}

            <Ornamento className="mt-10" />

            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              <li>
                <Link
                  href={`/monstros/?tipo=${encodeURIComponent(m.tipo)}`}
                  className="border-dourado-600/50 text-tinta-900 hover:bg-dourado-400/20 inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors"
                >
                  Mais do tipo {m.tipo}
                </Link>
              </li>
              <li>
                <Link
                  href={`/monstros/?nd=${encodeURIComponent(m.nd)}`}
                  className="border-dourado-600/50 text-tinta-900 hover:bg-dourado-400/20 inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors"
                >
                  Outras de ND {m.nd}
                </Link>
              </li>
            </ul>

            <div className="mt-9 text-center">
              <BotaoLink href="/monstros/" variante="primario">
                Voltar ao bestiário
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
