import Image from "next/image";
import type { MetaPersonagem } from "@/lib/personagens";

/**
 * A ficha do sistema caseiro, preservada como registro histórico.
 *
 * Vale a mesma divisão da ficha nova: o Registro guarda quem o personagem é
 * e quanto ele tem de cada coisa, e as Habilidades guardam o que ele faz.
 * Nenhum número daqui vale como regra hoje, e a aba avisa isso.
 */

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="border-dourado-600/20 flex items-baseline justify-between gap-3 border-b border-dashed py-1.5 last:border-0">
      <dt className="text-tinta-500 shrink-0 text-xs tracking-wide">{rotulo}</dt>
      <dd className="text-tinta-900 text-right text-sm">{valor}</dd>
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h3 className="font-titulo text-tinta-500 border-dourado-600/25 border-b pb-1.5 text-[0.66rem] tracking-[0.2em] uppercase">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

/**
 * As fichas antigas nasceram todas com os mesmos campos, mas o tipo os deixa
 * opcionais porque os personagens de 2024 não os têm. Esta guarda separa os
 * dois casos num lugar só, em vez de espalhar checagem por toda a página.
 */
export function temFichaAntiga(meta: MetaPersonagem): boolean {
  return Boolean(
    meta.identidade && meta.pontos && meta.personalidade && meta.atributos
  );
}

/* ============================================================
   Aba "Ficha": quem ele é e quanto tem de cada coisa
   ============================================================ */

export function FichaAntigaRegistro({ meta }: { meta: MetaPersonagem }) {
  const { identidade, pontos, personalidade, atributos } = meta;

  if (!identidade || !pontos || !personalidade || !atributos) return null;

  return (
    <div className="mt-7">
      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
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

      <Secao titulo="Atributos">
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {atributos.map((atributo) => (
            <li
              key={atributo.nome}
              className="border-dourado-600/25 bg-pergaminho-50/30 rounded-sm border px-3 py-2 text-center"
            >
              <p className="text-tinta-500 text-[0.6rem] tracking-[0.1em] uppercase">
                {atributo.nome}
              </p>
              <p className="font-titulo text-tinta-900 mt-0.5 text-2xl leading-none font-bold">
                {atributo.valor}
              </p>
              <p className="text-tinta-500 mt-1 text-[0.6rem]">
                {atributo.modificador ? `mod ${atributo.modificador}` : " "}
                {atributo.raca ? ` · raça ${atributo.raca}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Personalidade">
        <dl className="mt-3">
          <Linha rotulo="Alinhamento" valor={personalidade.alinhamento} />
          <Linha rotulo="Motivações" valor={personalidade.motivacoes} />
          <Linha rotulo="Inspirações" valor={personalidade.inspiracoes} />
          <Linha rotulo="Defeitos" valor={personalidade.defeitos} />
          {personalidade.adoracao ? (
            <Linha rotulo="Adoração" valor={personalidade.adoracao} />
          ) : null}
        </dl>
        <p className="text-tinta-700 mt-4 text-sm leading-relaxed">
          <span className="text-tinta-500 text-xs tracking-wide">
            Objetivo:{" "}
          </span>
          {personalidade.objetivo}
        </p>
      </Secao>
    </div>
  );
}

/* ============================================================
   Aba "Poderes": o que ele faz
   ============================================================ */

export function FichaAntigaHabilidades({ meta }: { meta: MetaPersonagem }) {
  const { habilidades } = meta;

  if (!habilidades || habilidades.length === 0) return null;

  return (
    <ul className="mt-7 space-y-5">
      {habilidades.map((habilidade) => (
        <li key={habilidade.nome} className="flex gap-3 sm:gap-4">
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
  );
}
