import { Selo } from "@/components/ui/Selo";

/**
 * A viga de madeira que atravessa o topo da mesa, com a marca do selo
 * imperial queimada no meio dela.
 *
 * Não é barra de navegação nem fica presa na tela: é adorno da mesa, então
 * sai de vista quando a pessoa rola. A navegação continua no selo de cera,
 * que é o único que precisa estar sempre à mão.
 *
 * Fica posicionada por cima do espaço que as páginas já reservam no topo,
 * então nenhuma página precisou mudar de medida por causa dela.
 */
export function Cabecalho() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center"
    >
      <div className="relative w-full">
        {/* A viga: madeira mais escura que o tampo, com o chanfro de cima
            pegando a luz da vela e o de baixo jogando sombra na mesa. */}
        <div className="viga-madeira h-14 w-full sm:h-[4.5rem]" />

        {/* Os pregos de ferro que prendem a viga nas pontas */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3 sm:px-6">
          <Prego />
          <Prego />
        </div>

        {/* A marca do ferro quente, mordendo a viga e a mesa abaixo dela */}
        <Selo
          variante="marca"
          className="absolute top-1/2 left-1/2 size-[3.9rem] -translate-x-1/2 -translate-y-1/2 opacity-90 sm:size-[4.75rem]"
        />
      </div>
    </div>
  );
}

function Prego() {
  return (
    <span className="from-madeira-500 to-madeira-950 block size-2.5 rounded-full bg-gradient-to-br shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.6)] sm:size-3" />
  );
}
