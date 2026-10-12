"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { lerAvisos, ouvirMesa, type Aviso } from "@/lib/ficha-viva";
import { useConta } from "@/components/conta/useConta";

const chave = (personagem: string) => `mitrael:sino:${personagem}`;

function lido(personagem: string): number {
  try {
    return Number(localStorage.getItem(chave(personagem)) ?? 0);
  } catch {
    return 0;
  }
}

/**
 * O sininho no canto da tela: guarda os últimos avisos da mesa (dano que o
 * Mestre deu, item que entrou na mochila, pedido aprovado, loot) e mostra
 * quantos chegaram desde a última vez que o jogador abriu.
 */
export function Sininho() {
  const conta = useConta();
  const personagem = conta.fase === "dentro" ? conta.perfil.personagem : null;
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ultimoLido, setUltimoLido] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!personagem) return;
    setUltimoLido(lido(personagem));
    void lerAvisos(personagem, 0, 20).then(setAvisos);
    return ouvirMesa(
      (_, linha) => {
        if (!linha.id) return;
        const a = linha as unknown as Aviso;
        setAvisos((l) => (l.some((x) => x.id === a.id) ? l : [...l, a].slice(-20)));
      },
      personagem,
      ["avisos"]
    );
  }, [personagem]);

  // Fecha ao tocar fora ou no Esc
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  if (!personagem) return null;
  const novos = avisos.filter((a) => a.id > ultimoLido).length;

  function abrir() {
    const maior = Math.max(0, ...avisos.map((a) => a.id));
    setAberto((v) => !v);
    if (maior && personagem) {
      try {
        localStorage.setItem(chave(personagem), String(maior));
      } catch {
        // Sem armazenamento: o número volta na próxima visita
      }
      setTimeout(() => setUltimoLido(maior), 1500);
    }
  }

  return (
    <div ref={caixa} className="fixed top-4 right-4 z-[56] sm:top-6 sm:right-6">
      <button
        type="button"
        onClick={abrir}
        aria-expanded={aberto}
        aria-label={novos ? `Avisos da mesa: ${novos} novos` : "Avisos da mesa"}
        className="border-dourado-400/70 bg-madeira-900/95 text-pergaminho-50 relative grid size-12 place-items-center rounded-full border shadow-xl"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-current">
          <path d="M12 2a6 6 0 0 0-6 6v3.6l-1.7 3.4A1 1 0 0 0 5.2 16.5h13.6a1 1 0 0 0 .9-1.5L18 11.6V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.8-2h-5.6A3 3 0 0 0 12 22Z" />
        </svg>
        {novos ? (
          <span className="bg-heraldico-vermelho text-pergaminho-50 absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full px-1 text-[0.65rem] font-bold">
            {novos}
          </span>
        ) : null}
      </button>
      {aberto ? (
        <div className="textura-pergaminho borda-envelhecida pergaminho-borda-1 absolute top-14 right-0 w-[min(86vw,22rem)] p-3 shadow-2xl">
          <p className="font-titulo text-tinta-900 text-sm font-bold">Avisos da mesa</p>
          {avisos.length ? (
            <ol className="mt-2 max-h-[60dvh] space-y-2 overflow-y-auto">
              {[...avisos].reverse().map((a) => (
                <li key={a.id} className={`text-sm leading-snug ${a.id > ultimoLido ? "text-tinta-900 font-semibold" : "text-tinta-700"}`}>
                  {a.texto}
                  <span className="text-tinta-500 block text-[0.7rem] font-normal">
                    {new Date(a.criado_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-tinta-500 mt-2 text-sm italic">Nada ainda. O que o Mestre mandar aparece aqui.</p>
          )}
          <Link href={`/personagens/${personagem}/`} className="text-heraldico-vermelho mt-2 inline-block text-xs underline">
            Abrir a minha ficha
          </Link>
        </div>
      ) : null}
    </div>
  );
}
