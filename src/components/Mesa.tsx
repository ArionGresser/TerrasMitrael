import { Cabecalho } from "@/components/Cabecalho";
import { SeloMenu } from "@/components/navegacao/SeloMenu";
import { ControleSom } from "@/components/som/ControleSom";
import { AmbienteSonoro } from "@/components/som/AmbienteSonoro";

/**
 * A mesa de madeira sobre a qual todo o site acontece:
 * o tampo, a luz de vela e a navegação por selo.
 *
 * Envolve todas as páginas.
 */
export function Mesa({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Vinheta: a luz de vela cai no centro da mesa e some nas bordas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-20 bg-[radial-gradient(ellipse_at_50%_38%,transparent_28%,rgba(0,0,0,0.5)_88%)]"
      />

      <SeloMenu />
      <ControleSom />
      <AmbienteSonoro />

      {/* Atalho para quem navega por teclado pular direto ao conteúdo */}
      <a
        href="#conteudo"
        className="bg-pergaminho-100 text-tinta-900 focus:ring-dourado-400 sr-only z-60 rounded-sm px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-24 focus:ring-2"
      >
        Pular para o conteúdo
      </a>

      <div id="conteudo" className="relative z-10">
        <Cabecalho />
        {children}
      </div>
    </>
  );
}
