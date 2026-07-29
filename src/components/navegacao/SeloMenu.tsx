"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SECOES } from "@/lib/navegacao";

/**
 * A navegação do site: um selo de cera que, ao ser tocado, desenrola
 * um pergaminho com as seções.
 *
 * Acessibilidade: é um <button> de verdade com aria-expanded, fecha no Esc,
 * devolve o foco ao selo ao fechar e trava o foco dentro do menu aberto.
 * O tema não pode custar a navegação de quem usa teclado ou leitor de tela.
 */
export function SeloMenu() {
  const [aberto, setAberto] = useState(false);
  const seloRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const caminho = usePathname();

  // Fecha o menu ao trocar de página
  useEffect(() => {
    setAberto(false);
  }, [caminho]);

  // Esc fecha; Tab circula dentro do menu enquanto ele está aberto
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
        seloRef.current?.focus();
        return;
      }

      if (evento.key !== "Tab" || !menuRef.current) return;

      const focaveis = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  // Leva o foco para dentro do menu assim que ele abre
  useEffect(() => {
    if (!aberto) return;
    const primeiroLink = menuRef.current?.querySelector<HTMLElement>("a[href]");
    primeiroLink?.focus();
  }, [aberto]);

  return (
    <>
      <button
        ref={seloRef}
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="menu-pergaminho"
        aria-label={aberto ? "Fechar o menu" : "Abrir o menu de navegação"}
        className="selo-cera bg-heraldico-vermelho fixed top-4 left-4 z-50 grid size-14 place-items-center transition-transform duration-200 hover:scale-105 active:scale-95 sm:top-6 sm:left-6 sm:size-16"
      >
        {/* O selo mostra o M do brasão; aberto, vira um X claro de "fechar".
            Girar o M só o deixava irreconhecível. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={aberto ? "fechar" : "brasao"}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
            className={`text-pergaminho-100 leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] select-none ${
              aberto
                ? "text-xl font-light sm:text-2xl"
                : "font-brasao text-2xl sm:text-3xl"
            }`}
            aria-hidden
          >
            {aberto ? "✕" : "M"}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {aberto && (
          <>
            {/* Escurece a mesa atrás do pergaminho aberto */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setAberto(false)}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
              aria-hidden
            />

            <motion.div
              ref={menuRef}
              id="menu-pergaminho"
              role="dialog"
              aria-modal="true"
              aria-label="Navegação do site"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top center" }}
              className="fixed top-20 left-4 z-50 w-[min(20rem,calc(100vw-2rem))] origin-top sm:top-24 sm:left-6"
            >
              {/* O rolo de madeira no topo do pergaminho */}
              <div
                aria-hidden
                className="from-madeira-700 via-madeira-500 to-madeira-700 h-2.5 w-full rounded-full bg-gradient-to-b shadow-md"
              />

              <nav className="textura-pergaminho borda-envelhecida pergaminho-borda-2 shadow-pergaminho-alto px-2 py-3">
                <ul>
                  {SECOES.map((secao, i) => {
                    const ativo =
                      secao.href === "/"
                        ? caminho === "/"
                        : caminho.startsWith(secao.href);

                    return (
                      <motion.li
                        key={secao.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18 + i * 0.055, duration: 0.35 }}
                      >
                        <Link
                          href={secao.href}
                          aria-current={ativo ? "page" : undefined}
                          className="hover:bg-dourado-400/15 group block rounded-sm px-3 py-2.5 transition-colors"
                        >
                          <span className="flex items-baseline gap-2">
                            <span
                              aria-hidden
                              className={`text-dourado-600 text-xs transition-opacity ${
                                ativo ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                              }`}
                            >
                              ✦
                            </span>
                            <span
                              className={`font-titulo text-tinta-900 text-sm tracking-wide ${
                                ativo ? "font-bold" : "font-semibold"
                              }`}
                            >
                              {secao.nome}
                            </span>
                          </span>
                          <span className="text-tinta-500 mt-0.5 block pl-5 text-xs leading-snug">
                            {secao.descricao}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* O rolo de madeira na base */}
              <div
                aria-hidden
                className="from-madeira-700 via-madeira-500 to-madeira-700 h-2.5 w-full rounded-full bg-gradient-to-b shadow-md"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
