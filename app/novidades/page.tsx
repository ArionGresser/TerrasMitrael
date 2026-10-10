import type { Metadata } from "next";
import { todasAsNovidades } from "@/lib/novidades";
import { ListaDeNovidades, ListaEmBreve } from "@/components/Novidades";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { SeloDeVolta } from "@/components/navegacao/SeloDeVolta";

export const metadata: Metadata = {
  title: "Novidades",
  description:
    "Tudo o que entrou em Terras de Mitrael, do mais novo para o mais antigo: episódios das Crônicas, personagens, abas e mudanças no site.",
};

export default function PaginaNovidades() {
  const itens = todasAsNovidades();

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <SeloDeVolta href="/" rotulo="Início" />

          <header className="text-center">
            <Sobretitulo>O mural da taverna</Sobretitulo>
            <TituloBrasao className="mt-4">Novidades</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic">
              Tudo o que já chegou à mesa, do mais novo para o mais antigo.
              {` ${itens.length} até agora.`}
            </p>
          </header>
        </Pergaminho>

        <section aria-labelledby="em-breve" className="mt-10">
          <h2 id="em-breve" className="font-titulo text-dourado-400 mb-3 text-center text-xs tracking-[0.3em] uppercase">
            A caminho da mesa
          </h2>
          <ListaEmBreve />
        </section>

        <section aria-labelledby="ja-chegou" className="mt-10">
          <h2 id="ja-chegou" className="font-titulo text-dourado-400 mb-3 text-center text-xs tracking-[0.3em] uppercase">
            Já chegou
          </h2>
          <ListaDeNovidades itens={itens} />
        </section>

        <div className="mt-8 text-center">
          <BotaoLink href="/" variante="primario">
            Voltar ao início
          </BotaoLink>
        </div>
      </main>

      <Rodape />
    </>
  );
}
