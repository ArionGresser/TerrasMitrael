"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { MesaAPI, ResultadoDoDado } from "@/lib/mesa3d/cena";
import { DADOS, DADO_PADRAO, dadoSalvo, escolherDado } from "@/lib/dados";
import { liberado, quemLibera } from "@/lib/conquistas";
import { tocar } from "@/lib/som";
import { Vitrine } from "@/components/escolhas/Vitrine";
import { useConquistas } from "@/components/TrocaCursor";
import { DesenhoDoDado } from "@/components/TrocaDado";

declare global {
  interface Window {
    __dadoNoCelular?: MesaAPI | null;
  }
}

/** Onde a mesa do computador existe: lá o d20 já mora na bandeja. */
const MESA_DO_COMPUTADOR = "(min-width: 1280px) and (pointer: fine)";

/**
 * O d20 de quem não tem a mesa do computador (celular, tablet, janela
 * estreita): um botão na barra do canto abre a vitrine dos dados, e escolher
 * um deles abre a mesa em tela cheia, com o dado caindo nela.
 *
 * Na mesa, o dado se pega com o dedo e se joga arrastando e soltando, com a
 * mesma física do computador. O botão "Jogar" faz a mesma coisa para quem
 * não consegue arrastar. As rolagens contam para as conquistas igual.
 *
 * A cena 3D só é baixada quando a mesa abre, e é desmontada ao fechar.
 */
export function DadoNoCelular() {
  const [disponivel, setDisponivel] = useState(false);
  const [atual, setAtual] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const vez = useConquistas();

  useEffect(() => {
    const tela = window.matchMedia(MESA_DO_COMPUTADOR);
    const decidir = () => setDisponivel(!tela.matches);
    decidir();
    tela.addEventListener("change", decidir);
    return () => tela.removeEventListener("change", decidir);
  }, []);

  useEffect(() => {
    const salvo = dadoSalvo();
    setAtual(liberado("dado", salvo) ? salvo : DADO_PADRAO);
  }, []);

  if (!disponivel) return null;

  const itens = DADOS.map((d) => {
    const quem = quemLibera("dado", d.chave);
    return {
      chave: d.chave,
      nome: d.nome,
      liberado: vez >= 0 && liberado("dado", d.chave),
      comoLiberar: quem ? `conquiste "${quem.nome}" (${quem.descricao.replace(/\.$/, "")}).` : undefined,
      desenho: <DesenhoDoDado estilo={d} />,
    };
  });
  const estilo = DADOS.find((d) => d.chave === atual) ?? DADOS[0];

  return (
    <>
      <Vitrine
        titulo="Escolha o seu d20"
        rotulo={`Jogar o d20 (agora: ${estilo.nome})`}
        itens={itens}
        atual={atual}
        aoEscolher={(chave) => {
          escolherDado(chave);
          setAtual(chave);
          tocar("madeira");
          setAberto(true);
        }}
        icone={<DesenhoDoDado estilo={estilo} tamanho={26} />}
      />
      {aberto ? <MesaDoDado aoFechar={() => setAberto(false)} /> : null}
    </>
  );
}

function MesaDoDado({ aoFechar }: { aoFechar(): void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const mesa = useRef<MesaAPI | null>(null);
  const caminho = usePathname();
  const inicio = useRef(caminho);
  const [resultado, setResultado] = useState<(ResultadoDoDado & { vez: number }) | null>(null);
  const [falhou, setFalhou] = useState(false);

  // Trocou de página: a mesa se recolhe
  useEffect(() => {
    if (caminho !== inicio.current) aoFechar();
  }, [caminho, aoFechar]);

  // A página para de rolar por baixo, e o Esc fecha
  useEffect(() => {
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", tecla);
    return () => {
      raiz.style.overflow = antes;
      window.removeEventListener("keydown", tecla);
    };
  }, [aoFechar]);

  useEffect(() => {
    let cancelado = false;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Os números do d20 são pintados na fonte dos títulos
    const fonte = getComputedStyle(document.documentElement).getPropertyValue("--fonte-titulo").trim();
    const fontePronta = fonte ? document.fonts.load(`700 80px ${fonte}`).catch(() => null) : null;
    Promise.all([import("@/lib/mesa3d/cena"), fontePronta])
      .then(([{ criarMesa }]) => {
        if (cancelado || !canvas.current) return;
        const teste = document.createElement("canvas");
        if (!teste.getContext("webgl2") && !teste.getContext("webgl")) {
          setFalhou(true);
          return;
        }
        mesa.current = criarMesa(
          canvas.current,
          { resultado: (r) => setResultado((a) => ({ ...r, vez: (a?.vez ?? 0) + 1 })) },
          reduzido,
          "dado",
        );
        // Como o __mesa3d do computador: deixa os testes acharem o dado
        window.__dadoNoCelular = mesa.current;
      })
      .catch(() => setFalhou(true));
    return () => {
      cancelado = true;
      mesa.current?.destruir();
      mesa.current = null;
      delete window.__dadoNoCelular;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mesa do d20"
      className="textura-madeira fixed inset-0 z-[70] touch-none select-none"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        if (mesa.current?.apertar(e.clientX, e.clientY, true)) e.preventDefault();
      }}
    >
      {/* A luz da vela no meio da mesa, e as bordas no escuro */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,170,90,0.16),transparent_55%),radial-gradient(ellipse_at_50%_45%,transparent_35%,rgba(0,0,0,0.6)_100%)]"
      />
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

      {resultado ? (
        <div
          key={resultado.vez}
          aria-hidden
          className="resultado-dado pointer-events-none absolute -translate-x-1/2"
          style={{ left: resultado.x, top: resultado.y - window.scrollY - 70 }}
        >
          <span className={`numero ${resultado.valor === 20 ? "divino" : resultado.valor === 1 ? "falha" : ""}`}>
            {resultado.valor}
          </span>
          {resultado.valor === 20 ? <span className="legenda">Vinte natural!</span> : null}
          {resultado.valor === 1 ? <span className="legenda falha">Falha crítica</span> : null}
        </div>
      ) : null}

      {falhou ? (
        <p className="text-pergaminho-100 absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm">
          Este aparelho não conseguiu montar a mesa 3D.
        </p>
      ) : (
        // A dica, que vira o último resultado depois da primeira jogada (e
        // fica, para não sumir junto com o número que sobe do dado)
        <p
          role="status"
          className="font-titulo text-pergaminho-200/80 pointer-events-none absolute inset-x-0 top-5 text-center text-[0.65rem] tracking-[0.2em] uppercase"
        >
          {resultado ? (
            <>
              Saiu{" "}
              <span className={`text-base ${resultado.valor === 20 ? "text-dourado-300" : resultado.valor === 1 ? "text-heraldico-vermelho" : "text-pergaminho-50"}`}>
                {resultado.valor}
              </span>
            </>
          ) : (
            "Arraste o dado e solte para jogar"
          )}
        </p>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => mesa.current?.jogar()}
          className="border-dourado-400/70 bg-madeira-900/90 font-titulo text-pergaminho-50 min-h-12 rounded-full border px-6 text-sm tracking-[0.15em] uppercase shadow-lg"
        >
          Jogar
        </button>
        <button
          ref={fechar}
          type="button"
          onClick={() => {
            tocar("fecharMenu");
            aoFechar();
          }}
          className="border-madeira-600/70 bg-madeira-900/90 text-pergaminho-200 min-h-12 rounded-full border px-5 text-sm shadow-lg"
        >
          Guardar o dado
        </button>
      </div>
    </div>
  );
}
