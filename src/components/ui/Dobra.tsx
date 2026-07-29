"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { tocar } from "@/lib/som";

/**
 * Texto longo recolhido, com botão para abrir.
 *
 * O texto inteiro está sempre no HTML da página, mesmo fechado. Só fica
 * escondido pelo recorte visual. Isso importa por dois motivos: os buscadores
 * continuam lendo a lore completa, e quem abre não espera carregamento nenhum.
 *
 * Enquanto está fechado, o trecho recortado recebe `inert`. Sem isso, um link
 * que caísse na parte cortada continuaria alcançável pelo teclado sem aparecer
 * na tela, e a pessoa navegando por Tab perderia o foco de vista.
 */

type Previa = "recorte" | "nenhuma";

export function Dobra({
  titulo,
  children,
  previa = "recorte",
  rotuloAbrir = "Leia mais",
  rotuloFechar = "Recolher",
  className = "",
}: {
  /** Quando existe, vira o cabeçalho clicável do bloco. */
  titulo?: ReactNode;
  children: ReactNode;
  /** "recorte" mostra as primeiras linhas esmaecendo. "nenhuma" esconde tudo. */
  previa?: Previa;
  rotuloAbrir?: string;
  rotuloFechar?: string;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);

  function alternar() {
    const abrindo = !aberto;
    setAberto(abrindo);
    tocar(abrindo ? "abrirMenu" : "fecharMenu");

    // Ao recolher um capítulo comprido, o topo dele costuma ficar acima da
    // tela e a pessoa acaba olhando para o bloco seguinte sem entender.
    if (!abrindo && raiz.current) {
      const topo = raiz.current.getBoundingClientRect().top;
      if (topo < 0) raiz.current.scrollIntoView({ block: "start" });
    }
  }

  const corpo = (
    <div
      id={id}
      inert={!aberto || undefined}
      className={
        aberto
          ? "[&>*:first-child]:mt-0"
          : previa === "nenhuma"
            ? "hidden"
            : "dobra-recorte max-h-24 overflow-hidden [&>*:first-child]:mt-0"
      }
    >
      {children}
    </div>
  );

  // Com título, o bloco vira um capítulo fechado: cabeçalho clicável em cima,
  // prévia embaixo.
  if (titulo) {
    return (
      <section
        ref={raiz}
        className={`border-dourado-600/25 hover:border-dourado-600/50 scroll-mt-20 rounded-sm border transition-colors ${className}`}
      >
        <button
          type="button"
          onClick={alternar}
          aria-expanded={aberto}
          aria-controls={id}
          className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="font-titulo text-tinta-900 text-lg leading-snug font-semibold sm:text-xl">
            {titulo}
          </span>
          <span
            aria-hidden
            className={`text-dourado-600 shrink-0 text-sm transition-transform duration-200 ${
              aberto ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>

        <div className="px-4 pb-4">
          {corpo}
          {!aberto ? (
            <p className="text-tinta-500 font-titulo mt-2 text-[0.7rem] tracking-[0.15em] uppercase">
              {rotuloAbrir}
            </p>
          ) : (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={alternar}
                aria-expanded={aberto}
                aria-controls={id}
                className="text-tinta-500 hover:text-tinta-900 font-titulo min-h-11 px-3 text-[0.7rem] tracking-[0.15em] uppercase transition-colors"
              >
                {rotuloFechar}
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Sem título, o bloco é só a continuação de um texto que já começou.
  return (
    <div ref={raiz} className={`scroll-mt-20 ${className}`}>
      {corpo}
      <div className={aberto ? "mt-6 text-center" : "mt-4 text-center"}>
        <button
          type="button"
          onClick={alternar}
          aria-expanded={aberto}
          aria-controls={id}
          className="font-titulo text-tinta-900 border-dourado-600/60 hover:bg-dourado-400/20 hover:border-dourado-600 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98]"
        >
          {aberto ? rotuloFechar : rotuloAbrir}
          <span
            aria-hidden
            className={`text-dourado-600 text-xs transition-transform duration-200 ${
              aberto ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
      </div>
    </div>
  );
}
