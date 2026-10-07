import { Selo } from "@/components/ui/Selo";

/**
 * A viga de madeira que atravessa o topo da mesa, presa por ferragens de
 * ferro nas pontas, com a marca do selo imperial queimada no meio dela.
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

        {/* As ferragens que prendem a viga nas pontas */}
        <div className="absolute inset-x-0 top-0 flex h-full justify-between px-20 sm:px-24">
          <Ferragem />
          <Ferragem />
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

function Ferragem() {
  return (
    <span className="ferragem flex h-full w-5 flex-col items-center justify-between py-2 sm:w-7 sm:py-2.5">
      <span className="rebite block size-1.5 rounded-full sm:size-2" />
      <span className="rebite block size-1.5 rounded-full sm:size-2" />
    </span>
  );
}
