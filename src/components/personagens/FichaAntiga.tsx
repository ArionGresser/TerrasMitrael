import Image from "next/image";
import type { ItemAntigo, MetaPersonagem } from "@/lib/personagens";
import { Selo } from "@/components/ui/Selo";
import { Secao } from "@/components/personagens/Painel";

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
      <dt className="text-tinta-500 shrink-0 text-xs tracking-wide">
        {rotulo}
      </dt>
      <dd className="text-tinta-900 text-right text-sm">{valor}</dd>
    </div>
  );
}

/**
 * As fichas antigas nasceram todas com os mesmos campos, mas o tipo os deixa
 * opcionais porque os personagens de 2024 não os têm. Esta guarda separa os
 * dois casos num lugar só, em vez de espalhar checagem por toda a página.
 */
export function temFichaAntiga(meta: MetaPersonagem): boolean {
  return Boolean(
    meta.identidade && meta.pontos && meta.personalidade && meta.atributos,
  );
}

/* ============================================================
   Aba "Ficha": quem ele é e quanto tem de cada coisa
   ============================================================ */

export function FichaAntigaRegistro({ meta }: { meta: MetaPersonagem }) {
  const { identidade, pontos, personalidade, atributos } = meta;

  if (!identidade || !pontos || !personalidade || !atributos) return null;

  return (
    <div className="mt-7 [&>section:first-child]:mt-4">
      <Secao titulo="Registro">
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
      </Secao>

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
          {personalidade.temperamento ? (
            <Linha rotulo="Temperamento" valor={personalidade.temperamento} />
          ) : null}
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
    <ul className="mt-7 space-y-3">
      {habilidades.map((habilidade) => (
        <li
          key={habilidade.nome}
          className="painel-ficha flex gap-3 p-3 sm:gap-4 sm:p-4"
        >
          {habilidade.imagem ? (
            <div className="border-madeira-800/25 relative size-16 shrink-0 overflow-hidden rounded-sm border sm:size-20">
              <Image
                src={habilidade.imagem}
                alt=""
                fill
                sizes="80px"
                className="object-cover sepia-[0.15]"
              />
            </div>
          ) : (
            <span
              title="A imagem desta habilidade ainda está sendo desenhada"
              className="border-dourado-600/25 bg-pergaminho-200/50 flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-sm border border-dashed sm:size-20"
            >
              <Selo
                variante="marca"
                aria-hidden
                className="size-7 opacity-25"
              />
              <span className="font-titulo text-tinta-500 text-[0.45rem] leading-none tracking-[0.08em] uppercase">
                em obra
              </span>
            </span>
          )}
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

/* ============================================================
   Aba "Mochila": o que ele carrega
   ============================================================ */

function ListaDeItens({ itens }: { itens: ItemAntigo[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {itens.map((item) => (
        <li
          key={item.nome}
          className="border-dourado-600/20 border-b border-dashed pb-2.5 last:border-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-tinta-900 text-sm font-semibold">
              {item.nome}
            </span>
            {item.valores ? (
              <span className="text-tinta-700 text-sm">{item.valores}</span>
            ) : null}
          </div>
          {item.descricao ? (
            <p className="text-tinta-700 mt-1 text-sm leading-snug">
              {item.descricao}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function temMochilaAntiga(meta: MetaPersonagem): boolean {
  const m = meta.mochila;
  return Boolean(
    m &&
    (m.armas?.length ||
      m.equipamento?.length ||
      m.inventario?.length ||
      m.moedas?.length),
  );
}

export function FichaAntigaMochila({ meta }: { meta: MetaPersonagem }) {
  const { mochila } = meta;
  if (!mochila) return null;

  return (
    <div className="mt-7 [&>section:first-child]:mt-4">
      {mochila.armas?.length ? (
        <Secao titulo="Armas">
          <ListaDeItens itens={mochila.armas} />
        </Secao>
      ) : null}

      {mochila.equipamento?.length ? (
        <Secao titulo="Equipamento">
          <ListaDeItens itens={mochila.equipamento} />
        </Secao>
      ) : null}

      {mochila.inventario?.length ? (
        <Secao titulo="Inventário">
          <ul className="text-tinta-900 mt-3 space-y-1 text-sm">
            {mochila.inventario.map((item) => (
              <li key={item} className="marker:text-dourado-600 ml-4 list-disc">
                {item}
              </li>
            ))}
          </ul>
        </Secao>
      ) : null}

      {mochila.moedas?.length ? (
        <Secao titulo="Bolsa">
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {mochila.moedas.map((moeda) => (
              <li key={moeda.nome} className="text-sm">
                <span className="font-titulo text-tinta-900 font-bold">
                  {moeda.quantidade}
                </span>
                <span className="text-tinta-700 ml-1">{moeda.nome}</span>
                {moeda.metal ? (
                  <span className="text-tinta-500 ml-1 text-xs">
                    ({moeda.metal})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Secao>
      ) : null}
    </div>
  );
}
