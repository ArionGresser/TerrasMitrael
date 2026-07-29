import Link from "next/link";
import { SECOES, COMUNIDADE } from "@/lib/navegacao";

export function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-madeira-700/60 mt-20 border-t px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {SECOES.map((secao) => (
              <li key={secao.href}>
                <Link
                  href={secao.href}
                  className="font-titulo text-pergaminho-300 hover:text-dourado-300 inline-block py-1 text-xs tracking-wide transition-colors"
                >
                  {secao.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-7 flex justify-center gap-4">
          <a
            href={COMUNIDADE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="border-madeira-600 text-pergaminho-300 hover:border-dourado-500 hover:text-dourado-300 grid size-11 place-items-center rounded-full border transition-colors"
            aria-label="Servidor no Discord (abre em nova aba)"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
            </svg>
          </a>

          <a
            href={COMUNIDADE.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="border-madeira-600 text-pergaminho-300 hover:border-dourado-500 hover:text-dourado-300 grid size-11 place-items-center rounded-full border transition-colors"
            aria-label="Canal no YouTube (abre em nova aba)"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
            </svg>
          </a>
        </div>

        <p className="text-pergaminho-400/60 mt-8 text-center text-xs leading-relaxed">
          Terras de Mitrael, cenário autoral de RPG de mesa
          <br />
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
        </p>
      </div>
    </footer>
  );
}
