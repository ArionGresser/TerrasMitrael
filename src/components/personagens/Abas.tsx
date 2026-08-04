"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { tocar } from "@/lib/som";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { TituloCapitulo, Ornamento } from "@/components/ui/Titulo";

/**
 * O dossiê de um personagem, dividido em linguetas.
 *
 * A história de alguém pode ter seis capítulos e a ficha pode ter cinquenta
 * linhas. Empilhar tudo numa folha só obrigava a rolar meia tela de texto
 * para chegar na classe de armadura. Aqui cada parte fica atrás da própria
 * lingueta e a pessoa escolhe o que quer ler.
 *
 * Todo o conteúdo continua no HTML da página, mesmo o das abas fechadas.
 * São dois motivos: os buscadores leem a ficha e a lore inteiras, e trocar
 * de aba não espera carregamento nenhum.
 */

export type Aba = {
  /** Aparece no endereço, depois do "#". Sem acento e sem espaço. */
  chave: string;
  rotulo: string;
  icone: ReactNode;
  conteudo: ReactNode;
};

/** O cabeçalho que abre cada aba, igual em todas. */
export function CabecalhoDaAba({
  titulo,
  legenda,
}: {
  titulo: string;
  legenda?: string;
}) {
  return (
    <header className="text-center">
      <TituloCapitulo as="h2">{titulo}</TituloCapitulo>
      {legenda ? (
        <p className="text-tinta-500 mx-auto mt-1.5 max-w-md text-xs leading-relaxed">
          {legenda}
        </p>
      ) : null}
      <Ornamento className="mt-5" />
    </header>
  );
}

export function Abas({
  abas,
  className = "",
}: {
  abas: Aba[];
  className?: string;
}) {
  const [ativa, setAtiva] = useState(0);
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const precisaVoltar = useRef(false);

  /**
   * Trocar de aba com a página rolada lá embaixo joga a pessoa no meio de um
   * texto que ela nunca viu começar. As linguetas voltam para a vista.
   *
   * A rolagem espera o painel novo estar montado. Feita junto com o clique,
   * ela mirava na altura do painel antigo: se o novo fosse mais curto, a
   * página encolhia embaixo dos pés e a conta saía errada.
   */
  useEffect(() => {
    if (!precisaVoltar.current) return;
    precisaVoltar.current = false;
    raiz.current?.scrollIntoView({ block: "start" });
  }, [ativa]);

  function escolher(indice: number, comFoco = false) {
    if (indice === ativa) return;

    const topo = raiz.current?.getBoundingClientRect().top ?? 0;
    precisaVoltar.current = topo < 0;

    setAtiva(indice);
    tocar("virarPagina");

    if (comFoco) botoes.current[indice]?.focus({ preventScroll: true });
  }

  function navegarPeloTeclado(evento: React.KeyboardEvent) {
    const passo =
      evento.key === "ArrowRight" ? 1 : evento.key === "ArrowLeft" ? -1 : 0;

    if (passo !== 0) {
      evento.preventDefault();
      escolher((ativa + passo + abas.length) % abas.length, true);
      return;
    }

    if (evento.key === "Home") {
      evento.preventDefault();
      escolher(0, true);
    }

    if (evento.key === "End") {
      evento.preventDefault();
      escolher(abas.length - 1, true);
    }
  }

  return (
    <div ref={raiz} className={`scroll-mt-24 ${className}`}>
      <div
        role="tablist"
        aria-label="Partes do personagem"
        onKeyDown={navegarPeloTeclado}
        className="relative z-10 flex items-stretch gap-1 px-2 sm:gap-1.5 sm:px-6"
      >
        {abas.map((aba, i) => {
          const aberta = i === ativa;

          return (
            <button
              key={aba.chave}
              ref={(elemento) => {
                botoes.current[i] = elemento;
              }}
              type="button"
              role="tab"
              id={`${id}-aba-${aba.chave}`}
              aria-selected={aberta}
              aria-controls={`${id}-painel-${aba.chave}`}
              tabIndex={aberta ? 0 : -1}
              onClick={() => escolher(i)}
              // Largura travada no desktop: divisória de arquivo é uma
              // lingueta, não uma faixa esticada de ponta a ponta.
              className={`min-w-0 flex-1 transition-[margin] duration-200 sm:max-w-44 ${
                aberta ? "" : "mt-1.5"
              }`}
            >
              {/* O recorte da lingueta fica neste span, e não no botão, para
                  o anel de foco do teclado continuar aparecendo inteiro. */}
              <span
                className={`aba flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-2.5 transition-colors duration-200 ${
                  aberta ? "aba-aberta" : "aba-guardada"
                }`}
              >
                <span
                  className={
                    aberta ? "text-dourado-600" : "text-pergaminho-100/75"
                  }
                >
                  {aba.icone}
                </span>
                <span
                  className={`font-titulo text-[0.58rem] leading-none font-bold tracking-[0.1em] uppercase sm:text-[0.68rem] ${
                    aberta ? "text-tinta-900" : "text-pergaminho-100/85"
                  }`}
                >
                  {aba.rotulo}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Pergaminho borda={2}>
        {abas.map((aba, i) => (
          <div
            key={aba.chave}
            role="tabpanel"
            id={`${id}-painel-${aba.chave}`}
            aria-labelledby={`${id}-aba-${aba.chave}`}
            hidden={i !== ativa}
            tabIndex={0}
          >
            {aba.conteudo}
          </div>
        ))}
      </Pergaminho>
    </div>
  );
}

/* ============================================================
   Os símbolos das linguetas
   Traço simples, sem preenchimento, para ficarem legíveis a
   dezoito pixels no celular. Herdam a cor de quem os contém.
   ============================================================ */

function Simbolo({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className="size-[1.15rem] sm:size-5"
    >
      {children}
    </svg>
  );
}

/** Pena de escrever: a história. */
export function IconePena() {
  return (
    <Simbolo>
      <path d="M4 20c0 0 1.6-7.4 7.4-11.6C15 5.8 18.4 4.4 20 4c.2 1.7-.6 5.6-3.4 9.2C12.8 18 7.2 19.4 4 20Z" />
      <path d="M4.4 19.6 10 14" />
    </Simbolo>
  );
}

/** Escudo: os números que seguram o personagem de pé. */
export function IconeEscudo() {
  return (
    <Simbolo>
      <path d="M12 2.8 19.6 5.6v6c0 4.8-3.6 7.8-7.6 9.6-4-1.8-7.6-4.8-7.6-9.6v-6L12 2.8Z" />
      <path d="M12 8.4v5.6M9.4 11h5.2" />
    </Simbolo>
  );
}

/** Estrela de quatro pontas: o que ele sabe fazer e ninguém mais faz. */
export function IconeArcano() {
  return (
    <Simbolo>
      <path d="M12 2.4c.5 5 4.1 8.6 9.1 9.1-5 .5-8.6 4.1-9.1 9.1-.5-5-4.1-8.6-9.1-9.1 5-.5 8.6-4.1 9.1-9.1Z" />
    </Simbolo>
  );
}

/** Bolsa de couro: o que ele carrega. */
export function IconeMochila() {
  return (
    <Simbolo>
      <path d="M5.6 9h12.8l1.2 8.6a2.4 2.4 0 0 1-2.4 2.8H6.8a2.4 2.4 0 0 1-2.4-2.8L5.6 9Z" />
      <path d="M8.6 9V7a3.4 3.4 0 0 1 6.8 0v2" />
    </Simbolo>
  );
}
