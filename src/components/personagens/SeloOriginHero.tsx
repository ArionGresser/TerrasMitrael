/**
 * Marca a primeira geração de jogadores, cujas fichas nasceram sob o
 * sistema de regras caseiro, anterior à adoção de D&D 5.5e.
 */
export function SeloOriginHero({
  tamanho = "normal",
}: {
  tamanho?: "normal" | "pequeno";
}) {
  const pequeno = tamanho === "pequeno";

  return (
    <span
      className={`border-dourado-500/70 from-dourado-400/25 to-dourado-600/15 text-dourado-600 font-titulo inline-flex items-center gap-1.5 rounded-full border bg-gradient-to-br font-semibold tracking-[0.14em] uppercase ${
        pequeno ? "px-2.5 py-0.5 text-[0.6rem]" : "px-3.5 py-1 text-[0.68rem]"
      }`}
    >
      <span aria-hidden className={pequeno ? "text-[0.65rem]" : "text-xs"}>
        ✦
      </span>
      Origin Hero
    </span>
  );
}

/**
 * Explicação do selo. Aparece uma vez por página, junto do primeiro grupo
 * de personagens que o carrega.
 */
export function ExplicacaoOriginHero() {
  return (
    <div className="border-dourado-600/30 bg-dourado-400/8 rounded-sm border px-4 py-4">
      <div className="flex justify-center">
        <SeloOriginHero />
      </div>
      <p className="text-tinta-700 mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed">
        Este selo marca a primeira geração de jogadores de Mitrael. As fichas
        deles foram criadas sob o sistema de regras próprio da casa, anterior à
        adoção de D&amp;D 5.5e, e por isso trazem campos que não existem mais,
        como Sanidade e Energia.
      </p>
      <p className="text-tinta-500 mx-auto mt-2 max-w-lg text-center text-xs leading-relaxed">
        As fichas ficam preservadas abaixo como registro histórico. Nenhuma
        delas vale como regra hoje: qualquer personagem que voltar à mesa
        precisa ser recalibrado para o sistema atual.
      </p>
    </div>
  );
}
