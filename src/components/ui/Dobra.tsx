"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { tocar } from "@/lib/som";

/** Quanto do capítulo aparece com o pergaminho ainda enrolado, em pixels. */
const ALTURA_ENROLADO = 96;

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
  const reduzido = useReducedMotion();
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

  // O papel desenrola: a altura cresce até o fim do texto, e quem estiver
  // embaixo (o rolo da folha, o botão) desce junto, no mesmo ritmo. O texto
  // aparece um instante depois, como tinta que surge quando o papel abre.
  const corpo = (
    <motion.div
      initial={false}
      animate={{
        height: aberto ? "auto" : previa === "nenhuma" ? 0 : ALTURA_ENROLADO,
      }}
      transition={{ duration: reduzido ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={
        aberto || previa === "nenhuma"
          ? "overflow-hidden"
          : "dobra-recorte overflow-hidden"
      }
    >
      <motion.div
        id={id}
        inert={!aberto || undefined}
        initial={false}
        animate={
          previa === "nenhuma"
            ? { opacity: aberto ? 1 : 0, y: aberto ? 0 : -10 }
            : { opacity: 1, y: 0 }
        }
        transition={{
          duration: reduzido ? 0 : 0.6,
          delay: aberto && !reduzido ? 0.15 : 0,
          ease: "easeOut",
        }}
        className="[&>*:first-child]:mt-0"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  // Com título, o bloco vira um pergaminho enrolado: o rolo de cima leva o
  // nome do capítulo, e ao clicar o papel desce até o fim do texto, puxando
  // o rolo de baixo junto.
  if (titulo) {
    return (
      <section ref={raiz} className={`scroll-mt-20 ${className}`}>
        <button
          type="button"
          onClick={alternar}
          aria-expanded={aberto}
          aria-controls={id}
          className="rolo-capitulo flex min-h-12 w-full items-center justify-between gap-3 px-5 py-2.5 text-left"
        >
          <span className="font-titulo text-tinta-900 text-lg leading-snug font-semibold sm:text-xl">
            {titulo}
          </span>
          <span
            aria-hidden
            className={`text-tinta-700 shrink-0 text-sm transition-transform duration-300 ${
              aberto ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>

        <div className="folha-capitulo mx-2 px-4 pt-4 pb-2 sm:mx-3 sm:px-5">
          <motion.div
            initial={false}
            animate={{ height: aberto ? "auto" : ALTURA_ENROLADO }}
            transition={{
              duration: reduzido ? 0 : 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={aberto ? "overflow-hidden" : "dobra-recorte overflow-hidden"}
          >
            <div
              id={id}
              inert={!aberto || undefined}
              className="[&>*:first-child]:mt-0"
            >
              {children}
            </div>
          </motion.div>

          {/* O mesmo comando do rolo de cima, repetido embaixo da prévia, que
              é onde o dedo naturalmente vai depois de ler as primeiras linhas. */}
          <div className={aberto ? "mt-6 text-center" : "text-left"}>
            <button
              type="button"
              onClick={alternar}
              aria-expanded={aberto}
              aria-controls={id}
              className={`text-tinta-500 hover:text-tinta-900 font-titulo min-h-11 text-[0.7rem] tracking-[0.15em] uppercase transition-colors ${
                aberto ? "px-3" : "w-full pt-1 text-left"
              }`}
            >
              {aberto ? rotuloFechar : rotuloAbrir}
            </button>
          </div>
        </div>

        <span aria-hidden className="rolo-capitulo-base" />
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
