"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink, Botao } from "@/components/ui/Botao";
import {
  TituloBrasao,
  TituloSecao,
  TituloCapitulo,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

/**
 * Página de demonstração da Fase 2.
 * Mostra o design system inteiro em uso, para validação.
 * Será substituída pela Home real na Fase 4.
 */

const CORES = [
  { nome: "Madeira", classe: "bg-madeira-800", texto: "text-pergaminho-100" },
  { nome: "Pergaminho", classe: "bg-pergaminho-200", texto: "text-tinta-900" },
  { nome: "Dourado", classe: "bg-dourado-500", texto: "text-madeira-950" },
  { nome: "Vermelho", classe: "bg-heraldico-vermelho", texto: "text-pergaminho-50" },
  { nome: "Verde", classe: "bg-heraldico-verde", texto: "text-pergaminho-50" },
];

export default function Demonstracao() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      {/* ---------- Abertura ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <Pergaminho inclinacao="esquerda" borda={1}>
          <header className="text-center">
            <Sobretitulo>Terceira Era</Sobretitulo>
            <TituloBrasao className="mt-4">Terras de Mitrael</TituloBrasao>
            <Ornamento className="mt-6" />
            <p className="text-tinta-700 mx-auto mt-6 max-w-md text-base leading-relaxed italic">
              Um mundo construído mesa após mesa, história após história.
            </p>
          </header>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <BotaoLink href="/" variante="primario">
              Botão principal
            </BotaoLink>
            <BotaoLink href="/" variante="secundario">
              Botão secundário
            </BotaoLink>
            <Botao variante="discreto">Botão discreto</Botao>
          </div>
        </Pergaminho>
      </motion.div>

      {/* ---------- Tipografia ---------- */}
      <Revelar className="mt-10">
        <Pergaminho inclinacao="direita" borda={2}>
          <Sobretitulo>Fase 2 — Design system</Sobretitulo>
          <TituloSecao className="mt-3">A Grande Guerra Leviana</TituloSecao>
          <p className="text-tinta-500 mt-1 text-xs">
            ↑ Cinzel: aguenta títulos longos sem perder clareza
          </p>

          <TituloCapitulo className="mt-7">Capítulo 1 — A Expedição</TituloCapitulo>
          <p className="mt-3 text-[0.95rem] leading-[1.75] sm:text-base">
            Ao final do quinto século da Terceira Era, as amarras de uma ditadura
            imperial sanguinária chegavam ao fim. As pessoas comuns tinham mais
            liberdade e a civilização, muito mais autonomia; a criação do livre
            mercado fez com que o desenvolvimento crescesse exponencialmente.
          </p>
          <p className="text-tinta-500 mt-2 text-xs">
            ↑ Lora: a fonte de leitura, confortável em textos longos
          </p>

          <Ornamento className="mt-8" />

          <blockquote className="border-dourado-600/50 mt-8 border-l-2 pl-4">
            <p className="text-tinta-700 text-[0.95rem] leading-relaxed italic sm:text-base">
              Não me importo o quão forte você é. Se eu te enganar, eu ganhei.
            </p>
            <footer className="font-titulo text-tinta-500 mt-2 text-xs tracking-wide">
              — Howai, o Ladino
            </footer>
          </blockquote>
        </Pergaminho>
      </Revelar>

      {/* ---------- Paleta ---------- */}
      <Revelar className="mt-10" atraso={0.05}>
        <Pergaminho borda={3} variante="cartao">
          <TituloCapitulo className="text-center">A paleta</TituloCapitulo>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {CORES.map((cor) => (
              <div
                key={cor.nome}
                className={`${cor.classe} ${cor.texto} font-titulo grid h-16 place-items-center rounded-sm border border-black/20 text-[0.7rem] font-semibold shadow-inner`}
              >
                {cor.nome}
              </div>
            ))}
          </div>
        </Pergaminho>
      </Revelar>

      {/* ---------- Cartões lado a lado ---------- */}
      <Revelar className="mt-10">
        <TituloCapitulo className="text-pergaminho-200 text-center">
          Folhas espalhadas sobre a mesa
        </TituloCapitulo>
      </Revelar>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          { t: "Razavar", d: "A capital que abriga a família imperial.", b: 1 as const, i: "esquerda" as const },
          { t: "Sovara Mithr", d: "A Sagrada Árvore e o pulmão de Mitrael.", b: 2 as const, i: "direita" as const },
        ].map((item, n) => (
          <Revelar key={item.t} atraso={n * 0.1} direcao={n === 0 ? "esquerda" : "direita"}>
            <Pergaminho variante="cartao" borda={item.b} inclinacao={item.i} className="h-full">
              <TituloCapitulo>{item.t}</TituloCapitulo>
              <p className="text-tinta-700 mt-2 text-sm leading-relaxed">{item.d}</p>
              <div className="mt-4">
                <BotaoLink href="/" variante="secundario" className="text-xs">
                  Ler mais
                </BotaoLink>
              </div>
            </Pergaminho>
          </Revelar>
        ))}
      </div>

      {/* ---------- Mapa ---------- */}
      <Revelar className="mt-10">
        <Pergaminho borda={1} variante="cartao">
          <TituloCapitulo className="text-center">O mapa de Mitrael</TituloCapitulo>
          <div className="border-madeira-800/30 shadow-pergaminho relative mt-4 overflow-hidden rounded-sm border">
            <Image
              src="/images/map.jpg"
              alt="Mapa do continente de Mitrael"
              width={1600}
              height={1067}
              className="h-auto w-full"
              priority
            />
          </div>
        </Pergaminho>
      </Revelar>

      <p className="text-pergaminho-400/70 mt-12 text-center text-xs">
        Página de demonstração · toque no selo ✦ no canto superior esquerdo para
        abrir o menu
      </p>
    </main>
  );
}
