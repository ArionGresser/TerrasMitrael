"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import { SECOES } from "@/lib/navegacao";
import { Selo } from "@/components/ui/Selo";
import { tocar } from "@/lib/som";

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
  const [carimbadas, setCarimbadas] = useState(0);
  const seloRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const caminho = usePathname();
  const cera = useAnimationControls();
  const semMovimento = useReducedMotion();

  /**
   * O gesto de carimbar: o selo desce com força, gira um nada ao encostar,
   * e volta com um respiro. É o mesmo movimento de quem bate um lacre na
   * mesa, e é curto de proposito, porque o menu precisa abrir junto.
   */
  function carimbar() {
    tocar(aberto ? "fecharMenu" : "abrirMenu");
    setAberto((v) => !v);

    if (semMovimento) return;

    setCarimbadas((n) => n + 1);
    cera.start({
      scale: [1, 0.82, 1.07, 0.98, 1],
      rotate: [0, -7, 3, -1, 0],
      transition: { duration: 0.52, times: [0, 0.16, 0.42, 0.7, 1] },
    });
  }

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
        // O som e a troca de estado ficam fora do atualizador: o React pode
        // executar a função de atualização mais de uma vez, e o som sairia
        // em dobro.
        onClick={carimbar}
        aria-expanded={aberto}
        aria-controls="menu-pergaminho"
        aria-label={aberto ? "Fechar o menu" : "Abrir o menu de navegação"}
        className="fixed top-4 left-4 z-50 grid size-14 place-items-center sm:top-6 sm:left-6 sm:size-16"
      >
        {/* A onda de cera que escapa por baixo no instante da batida */}
        {carimbadas > 0 ? (
          <motion.span
            key={carimbadas}
            aria-hidden
            initial={{ scale: 0.7, opacity: 0.5 }}
            animate={{ scale: 1.85, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="border-dourado-400/70 pointer-events-none absolute inset-0 rounded-full border"
          />
        ) : null}

        <motion.span
          animate={cera}
          whileHover={semMovimento ? undefined : { scale: 1.06 }}
          className="relative block size-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]"
        >
          {/* Com o menu aberto a cera aparece partida, que é o que acontece
              com um lacre depois que a carta foi aberta. O M continua ali,
              porque é a marca da casa e some se for coberto. */}
          <Selo
            variante="cera"
            rompido={aberto}
            id="selo-menu"
            className="size-full"
          />
        </motion.span>
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
