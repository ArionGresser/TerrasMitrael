import Link from "next/link";
import type { ReactNode } from "react";
import { SECOES, COMUNIDADE } from "@/lib/navegacao";
import { Ferragem } from "@/components/Cabecalho";
import { Selo } from "@/components/ui/Selo";

const REPOSITORIO = "https://github.com/ArionGresser/TerrasMitrael";

/**
 * O pé da mesa: uma tábua grossa atravessada embaixo, par da viga do topo,
 * com as mesmas ferragens nas pontas e o selo de cera lacrado no meio.
 * Por cima dela, o nome do mundo, as seções e os caminhos da comunidade.
 */
export function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="tabua-rodape relative mt-24 pt-14 pb-8 sm:pt-16">
      {/* As ferragens que prendem a tábua, descendo da borda de cima */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex h-20 justify-between px-6 sm:h-24 sm:px-24"
      >
        <Ferragem />
        <Ferragem />
      </div>

      {/* O selo de cera do império, lacrado na borda da tábua */}
      <Selo
        variante="cera"
        id="selo-rodape"
        className="absolute top-0 left-1/2 size-[4rem] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_4px_5px_rgba(0,0,0,0.6)] sm:size-[4.75rem]"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="font-brasao text-pergaminho-100 text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)] sm:text-4xl">
          Terras de Mitrael
        </p>
        <p className="font-titulo text-dourado-400/90 mt-2 text-[0.66rem] tracking-[0.3em] uppercase">
          Cenário autoral de RPG de mesa · desde 2020
        </p>

        <nav aria-label="Rodapé" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 sm:gap-x-1">
            {SECOES.map((secao, i) => (
              <li key={secao.href} className="flex items-center">
                {i > 0 ? (
                  <span aria-hidden className="text-dourado-600/70 hidden px-1.5 text-[0.55rem] sm:inline">
                    ✦
                  </span>
                ) : null}
                <Link
                  href={secao.href}
                  className="font-titulo text-pergaminho-200 hover:text-dourado-300 focus-visible:text-dourado-300 inline-block px-1 py-2 text-xs tracking-[0.12em] uppercase transition-colors"
                >
                  {secao.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Comunidade href={COMUNIDADE.discord} nome="Discord" descricao="Servidor no Discord">
            <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
          </Comunidade>
          <Comunidade href={COMUNIDADE.youtube} nome="YouTube" descricao="Canal no YouTube">
            <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
          </Comunidade>
        </div>
      </div>

      {/* O friso entalhado que separa a assinatura */}
      <div aria-hidden className="friso-rodape mx-auto mt-9 h-[3px] max-w-3xl" />

      <p className="text-pergaminho-300/75 relative mx-auto mt-5 max-w-3xl px-4 text-center text-xs leading-relaxed sm:px-6">
        Criado e mestrado por{" "}
        <a
          href="https://github.com/ArionGresser"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-dourado-300 underline underline-offset-2 transition-colors"
        >
          Arion Gresser
        </a>{" "}
        · {ano}
        <br />
        Projeto sem fins lucrativos, com{" "}
        <a
          href={REPOSITORIO}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-dourado-300 underline underline-offset-2 transition-colors"
        >
          código aberto no GitHub
        </a>
      </p>
    </footer>
  );
}

/** Um caminho para a comunidade: placa de ferro com o ícone e o nome. */
function Comunidade({
  href,
  nome,
  descricao,
  children,
}: {
  href: string;
  nome: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${descricao} (abre em nova aba)`}
      className="placa-comunidade text-pergaminho-200 hover:text-dourado-300 focus-visible:text-dourado-300 inline-flex min-h-11 items-center gap-2.5 rounded-sm px-4 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
        {children}
      </svg>
      <span className="font-titulo text-xs tracking-[0.12em] uppercase">{nome}</span>
    </a>
  );
}
