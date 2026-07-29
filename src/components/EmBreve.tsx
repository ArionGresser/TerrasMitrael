import { Pergaminho } from "@/components/ui/Pergaminho";
import { BotaoLink } from "@/components/ui/Botao";
import { TituloSecao, Sobretitulo, Ornamento } from "@/components/ui/Titulo";
import { Rodape } from "@/components/Rodape";

/**
 * Marcador temporário para as seções ainda não construídas.
 * Some conforme cada fase entrega a página de verdade.
 */
export function EmBreve({
  titulo,
  descricao,
  fase,
}: {
  titulo: string;
  descricao: string;
  fase: string;
}) {
  return (
    <>
      <main className="mx-auto max-w-2xl px-4 pt-24 pb-8 sm:px-6 sm:pt-32">
        <Pergaminho inclinacao="esquerda" borda={2}>
          <div className="text-center">
            <Sobretitulo>Terras de Mitrael</Sobretitulo>
            <TituloSecao className="mt-3">{titulo}</TituloSecao>
            <Ornamento className="mt-5" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-md text-sm leading-relaxed sm:text-base">
              {descricao}
            </p>
            <p className="text-tinta-500 mt-5 text-xs">
              Esta seção está sendo escrita na {fase}.
            </p>
            <div className="mt-7">
              <BotaoLink href="/" variante="secundario">
                Voltar ao início
              </BotaoLink>
            </div>
          </div>
        </Pergaminho>
      </main>
      <Rodape />
    </>
  );
}
