import type { Metadata } from "next";
import {
  MapaDeMitrael,
  type LocalNoMapa,
  type RegiaoNoMapa,
} from "@/components/mapa/MapaDeMitrael";
import { MARCADORES_LOCAIS } from "@/lib/marcadores";
import { LOCAIS } from "@/lib/locais";
import { REGIOES } from "@/lib/regioes";
import { CONTORNOS } from "@/lib/regioes-do-mapa";
import { Capitulos } from "@/components/ui/Capitulos";
import { Rodape } from "@/components/Rodape";

export const metadata: Metadata = {
  title: "Mapa",
  description:
    "O mapa interativo do continente de Mitrael: arraste, aproxime e abra cada lugar para ler a sua história, de Razavar e Sovara Mithr às Terras de Askar seladas a oeste.",
};

export default function PaginaMapa() {
  // Cada marcador com o que o painel mostra: a arte, o subtítulo e a
  // história inteira do lugar, que vem de content/locais/ em capítulos
  const locais: LocalNoMapa[] = MARCADORES_LOCAIS.flatMap((m) => {
    const local = LOCAIS.find((l) => l.meta.slug === m.slug);
    if (!local) return [];
    const { nome, subtitulo, resumo, chamada, imagem, imagemAlt } = local.meta;
    const historia = <Capitulos Texto={local.Conteudo} rotuloAbrir="Ler mais" />;
    return [
      { slug: m.slug, nome, subtitulo, resumo, chamada, historia, imagem, imagemAlt, x: m.x, y: m.y, lado: m.lado },
    ];
  });

  // Cada região com o contorno tirado do desenho e o texto do painel
  const regioes: RegiaoNoMapa[] = REGIOES.flatMap((r) => {
    const contorno = CONTORNOS.find((c) => c.chave === r.chave);
    if (!contorno) return [];
    return [{ ...r, d: contorno.d, centro: contorno.centro, caixa: contorno.caixa }];
  });

  return (
    <>
      {/* O mapa ocupa a tela inteira, da viga ao pé da janela, como o mapa
          do universo de League of Legends. O rodapé fica logo abaixo. */}
      <main className="pt-14 sm:pt-[4.5rem]">
        <MapaDeMitrael locais={locais} regioes={regioes} />
      </main>

      <Rodape />
    </>
  );
}
