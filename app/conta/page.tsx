import type { Metadata } from "next";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Rodape } from "@/components/Rodape";
import { TituloBrasao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { MinhaConta } from "@/components/conta/MinhaConta";
import { PERSONAGENS } from "@/lib/personagens";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Entre ou crie a sua conta para guardar as conquistas e ter a ficha do seu personagem à mão.",
  robots: { index: false },
};

export default function PaginaConta() {
  const personagens = PERSONAGENS.map((p) => ({ slug: p.meta.slug, nome: p.meta.nome }));
  return (
    <>
      <main className="mx-auto max-w-2xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        <Pergaminho borda={2}>
          <header className="text-center">
            <Sobretitulo>O livro de registros</Sobretitulo>
            <TituloBrasao className="mt-4">Minha conta</TituloBrasao>
            <Ornamento className="mt-6" />
          </header>
          <div className="mt-8">
            <MinhaConta personagens={personagens} />
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
