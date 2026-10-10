"use client";

import { useEffect, useState } from "react";
import { DADOS, DADO_PADRAO, dadoSalvo, escolherDado, type EstiloDeDado } from "@/lib/dados";
import { liberado, quemLibera } from "@/lib/conquistas";
import { tocar } from "@/lib/som";
import { Vitrine } from "@/components/escolhas/Vitrine";
import { useConquistas } from "@/components/TrocaCursor";

/** O d20 visto de frente, pintado nas cores do estilo. */
export function DesenhoDoDado({ estilo, tamanho = 40 }: { estilo: EstiloDeDado; tamanho?: number }) {
  const tinta = estilo.tinta[1];
  return (
    <svg viewBox="0 0 40 40" width={tamanho} height={tamanho} aria-hidden>
      <path d="M20 2.5 35.2 11.3v17.4L20 37.5 4.8 28.7V11.3Z" fill={estilo.fundo} stroke={tinta} strokeWidth="1.3" strokeLinejoin="round" />
      <path
        d="M20 9.5 29.5 25.5H10.5Z M20 2.5 20 9.5 M35.2 11.3 29.5 25.5 M4.8 11.3 10.5 25.5 M10.5 25.5 4.8 28.7 M29.5 25.5 35.2 28.7 M10.5 25.5 20 37.5 29.5 25.5"
        fill="none"
        stroke={tinta}
        strokeOpacity="0.65"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <text x="20" y="21.8" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={tinta} fontFamily="var(--fonte-titulo), serif">
        20
      </text>
    </svg>
  );
}

/**
 * O botão do dado, ao lado da mãozinha: escolhe a pintura do d20 da mesa.
 *
 * O de ônix e ouro vem com todo mundo; os outros se liberam com as
 * conquistas. Só aparece no computador de tela larga, que é onde a mesa 3D
 * existe.
 */
export function TrocaDado() {
  const [atual, setAtual] = useState<string | null>(null);
  const vez = useConquistas();

  useEffect(() => {
    const salvo = dadoSalvo();
    setAtual(liberado("dado", salvo) ? salvo : DADO_PADRAO);
  }, []);

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
    <div className="hidden xl:pointer-fine:block">
      <Vitrine
        titulo="O dado da mesa"
        rotulo={`Escolher o dado (agora: ${estilo.nome})`}
        itens={itens}
        atual={atual}
        aoEscolher={(chave) => {
          escolherDado(chave);
          setAtual(chave);
          tocar("madeira");
        }}
        icone={<DesenhoDoDado estilo={estilo} tamanho={26} />}
      />
    </div>
  );
}
