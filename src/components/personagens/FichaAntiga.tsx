import Image from "next/image";
import type { MetaPersonagem } from "@/lib/personagens";
import { TituloCapitulo } from "@/components/ui/Titulo";

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="border-dourado-600/20 flex items-baseline justify-between gap-3 border-b border-dashed py-1.5 last:border-0">
      <dt className="text-tinta-500 shrink-0 text-xs tracking-wide">{rotulo}</dt>
      <dd className="text-tinta-900 text-right text-sm">{valor}</dd>
    </div>
  );
}

/**
 * A ficha do sistema caseiro, preservada como registro histórico.
 * O aviso no topo deixa claro que nada aqui vale como regra hoje.
 */
export function FichaAntiga({ meta }: { meta: MetaPersonagem }) {
  const { identidade, pontos, personalidade, atributos, habilidades } = meta;

  return (
    <section aria-labelledby={`ficha-${meta.slug}`}>
      <div className="text-center">
        <TituloCapitulo as="h2" className="" >
          <span id={`ficha-${meta.slug}`}>Ficha de registro</span>
        </TituloCapitulo>
        {meta.originHero ? (
          <p className="text-tinta-500 mx-auto mt-2 max-w-md text-xs leading-relaxed">
            Registro histórico do sistema de regras próprio da casa. Não vale
            como regra no sistema atual.
          </p>
        ) : null}
      </div>

      {/* Identidade e pontos */}
      <div className="mt-6 grid gap-x-8 gap-y-1 sm:grid-cols-2">
        <dl>
          <Linha rotulo="Idade" valor={identidade.idade} />
          <Linha rotulo="Altura" valor={identidade.altura} />
          <Linha rotulo="Gênero" valor={identidade.genero} />
          <Linha rotulo="Classe" valor={identidade.classe} />
          <Linha rotulo="Raça" valor={identidade.raca} />
        </dl>
        <dl>
          <Linha rotulo="Vida" valor={pontos.vida} />
          <Linha rotulo="Nível" valor={pontos.nivel} />
          <Linha rotulo="Experiência" valor={pontos.experiencia} />
          <Linha rotulo="Sanidade" valor={pontos.sanidade} />
        </dl>
      </div>

      {/* Personalidade */}
      <div className="mt-8">
        <h3 className="font-titulo text-tinta-500 text-[0.68rem] tracking-[0.2em] uppercase">
          Personalidade
        </h3>
        <dl className="mt-2">
          <Linha rotulo="Alinhamento" valor={personalidade.alinhamento} />
          <Linha rotulo="Motivações" valor={personalidade.motivacoes} />
          <Linha rotulo="Inspirações" valor={personalidade.inspiracoes} />
          <Linha rotulo="Defeitos" valor={personalidade.defeitos} />
          {personalidade.adoracao ? (
            <Linha rotulo="Adoração" valor={personalidade.adoracao} />
          ) : null}
        </dl>
        <p className="text-tinta-700 mt-3 text-sm leading-relaxed">
          <span className="text-tinta-500 text-xs tracking-wide">Objetivo: </span>
          {personalidade.objetivo}
        </p>
      </div>

      {/* Atributos */}
      <div className="mt-8">
        <h3 className="font-titulo text-tinta-500 text-[0.68rem] tracking-[0.2em] uppercase">
          Atributos
        </h3>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {atributos.map((atributo) => (
            <li
              key={atributo.nome}
              className="border-dourado-600/25 rounded-sm border px-3 py-2 text-center"
            >
              <p className="text-tinta-500 text-[0.62rem] tracking-[0.1em] uppercase">
                {atributo.nome}
              </p>
              <p className="font-titulo text-tinta-900 mt-0.5 text-xl font-bold">
                {atributo.valor}
              </p>
              <p className="text-tinta-500 text-[0.62rem]">
                {atributo.modificador ? `mod ${atributo.modificador}` : " "}
                {atributo.raca ? ` · raça ${atributo.raca}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Habilidades */}
      {habilidades.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-titulo text-tinta-500 text-[0.68rem] tracking-[0.2em] uppercase">
            Habilidades
          </h3>
          <ul className="mt-3 space-y-4">
            {habilidades.map((habilidade) => (
              <li key={habilidade.nome} className="flex gap-3">
                <div className="border-madeira-800/25 relative size-16 shrink-0 overflow-hidden rounded-sm border sm:size-20">
                  <Image
                    src={habilidade.imagem}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover sepia-[0.15]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-titulo text-tinta-900 text-sm font-semibold">
                    {habilidade.nome}
                  </p>
                  <p className="text-tinta-500 text-[0.68rem] tracking-wide">
                    {habilidade.tipo}
                  </p>
                  <p className="text-tinta-700 mt-1 text-sm leading-snug">
                    {habilidade.descricao}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
