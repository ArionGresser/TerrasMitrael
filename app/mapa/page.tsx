import type { Metadata } from "next";
import Link from "next/link";
import {
  MapaDeMitrael,
  type LocalNoMapa,
  type RegiaoNoMapa,
} from "@/components/mapa/MapaDeMitrael";
import { MARCADORES_LOCAIS, LUGARES_SEM_PAGINA } from "@/lib/marcadores";
import { LOCAIS } from "@/lib/locais";
import { REGIOES } from "@/lib/regioes";
import { CONTORNOS } from "@/lib/regioes-do-mapa";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { Rodape } from "@/components/Rodape";
import { TituloCapitulo } from "@/components/ui/Titulo";

export const metadata: Metadata = {
  title: "Mapa",
  description:
    "O mapa interativo do continente de Mitrael: arraste, aproxime e abra cada lugar, dos mares Bazáltico, de Qän e Leviano às Terras de Askar seladas a oeste.",
};

export default function PaginaMapa() {
  // Cada marcador com o que o painel mostra: arte, subtítulo e resumo
  const locais: LocalNoMapa[] = MARCADORES_LOCAIS.flatMap((m) => {
    const local = LOCAIS.find((l) => l.meta.slug === m.slug);
    if (!local) return [];
    const { nome, subtitulo, resumo, imagem, imagemAlt } = local.meta;
    return [{ slug: m.slug, nome, subtitulo, resumo, imagem, imagemAlt, x: m.x, y: m.y, lado: m.lado }];
  });

  // Cada região com o contorno tirado do desenho e o texto do painel
  const regioes: RegiaoNoMapa[] = REGIOES.flatMap((r) => {
    const contorno = CONTORNOS.find((c) => c.chave === r.chave);
    if (!contorno) return [];
    return [{ ...r, d: contorno.d, centro: contorno.centro, caixa: contorno.caixa }];
  });

  return (
    <>
      <main className="pt-20 pb-8 sm:pt-24">
        {/* O mapa ocupa a mesa inteira, de ponta a ponta */}
        <section className="mx-auto w-full max-w-[1500px] px-2 sm:px-4">
          <MapaDeMitrael locais={locais} regioes={regioes} />
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Lista dos locais marcados, alternativa ao mapa */}
          <Revelar className="mt-10">
            <Pergaminho variante="cartao" borda={2} inclinacao="direita">
              <TituloCapitulo className="text-center">
                Locais marcados no mapa
              </TituloCapitulo>
              <p className="text-tinta-500 mx-auto mt-2 max-w-md text-center text-xs leading-relaxed">
                Os mesmos pontos do mapa, em lista, para quem preferir navegar
                assim
              </p>

              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {locais.map((local) => (
                  <li key={local.slug}>
                    <Link
                      href={`/locais/${local.slug}/`}
                      className="border-dourado-600/25 hover:bg-dourado-400/15 hover:border-dourado-600/50 flex min-h-11 items-center gap-2.5 rounded-sm border px-3 py-2 transition-colors"
                    >
                      <span
                        aria-hidden
                        className="border-madeira-950 size-2.5 shrink-0 rotate-45 border bg-[linear-gradient(135deg,#f3dc9a,#b8912c_55%,#7a5a14)]"
                      />
                      <span>
                        <span className="font-titulo text-tinta-900 block text-sm font-semibold">
                          {local.nome}
                        </span>
                        <span className="text-tinta-500 block text-xs italic">
                          {local.subtitulo}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Pergaminho>
          </Revelar>

          {/* O que ainda não tem página */}
          <Revelar className="mt-8">
            <Pergaminho variante="cartao" borda={3} inclinacao="esquerda">
              <TituloCapitulo className="text-center">
                Desenhados no mapa, ainda sem página
              </TituloCapitulo>
              <p className="text-tinta-500 mx-auto mt-2 max-w-lg text-center text-xs leading-relaxed">
                Lugares que aparecem nas histórias dos personagens e nas
                crônicas da guerra, e que já estão no mapa esperando a sua vez
              </p>

              <ul className="mt-5 space-y-2.5">
                {LUGARES_SEM_PAGINA.map((lugar) => (
                  <li
                    key={lugar.nome}
                    className="border-dourado-600/20 flex flex-wrap items-baseline gap-x-2 border-b border-dashed pb-2 last:border-0"
                  >
                    <span className="font-titulo text-tinta-900 text-sm font-semibold">
                      {lugar.nome}
                    </span>
                    <span className="text-tinta-500 text-xs">{lugar.contexto}</span>
                  </li>
                ))}
              </ul>
            </Pergaminho>
          </Revelar>
        </div>
      </main>

      <Rodape />
    </>
  );
}
