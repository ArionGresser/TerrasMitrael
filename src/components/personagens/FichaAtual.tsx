import Image from "next/image";
import type { FichaAtual as Ficha } from "@/lib/personagens";
import Link from "next/link";
import { buscarHabilidade, type HabilidadeNaFicha } from "@/lib/habilidades";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { Selo } from "@/components/ui/Selo";
import { Secao } from "@/components/personagens/Painel";
export { FichaAtualNumeros } from "@/components/personagens/FichaAtualNumeros";

/**
 * A ficha nas regras de 2024, repartida entre as abas do personagem.
 *
 * São três blocos, e cada um responde a uma pergunta diferente:
 * os Números dizem o que decide um turno, os Poderes dizem o que ele sabe
 * fazer, e a Mochila diz o que ele carrega. Ninguém precisa passar por uma
 * lista de magias para conferir a classe de armadura.
 *
 * Magia, traço e talento nenhum tem texto escrito aqui dentro. Tudo vem do
 * catálogo, pela chave.
 */

/**
 * O corpo de uma aba.
 *
 * A primeira seção perde a margem de cima, porque logo acima dela já está o
 * ornamento do cabeçalho. Fica na classe em vez de virar uma propriedade
 * para cada seção não precisar saber se é a primeira: elas aparecem e somem
 * conforme o personagem tem ou não aquilo.
 */
export function CorpoDaAba({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 [&>section:first-child]:mt-4">{children}</div>;
}

/** O selo em branco que segura o lugar do ícone que ainda não chegou. */
function IconeDaHabilidade({ habilidade }: { habilidade: HabilidadeNaFicha }) {
  if (habilidade.icone) {
    return (
      <Image
        src={habilidade.icone}
        alt=""
        width={64}
        height={64}
        className="border-dourado-600/40 size-16 shrink-0 rounded-sm border object-cover shadow-[0_2px_6px_-2px_rgba(0,0,0,0.5)]"
      />
    );
  }

  return (
    <span
      title="O ícone desta habilidade ainda está sendo desenhado"
      className="border-dourado-600/25 bg-pergaminho-200/50 flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-sm border border-dashed"
    >
      <Selo variante="marca" aria-hidden className="size-6 opacity-25" />
      <span className="font-titulo text-tinta-500 text-[0.4rem] leading-none tracking-[0.08em] uppercase">
        em obra
      </span>
    </span>
  );
}

function ListaDeHabilidades({ chaves }: { chaves: string[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {chaves.map((chave) => {
        const h = buscarHabilidade(chave);
        const ehMagia = h.tipo === "truque" || h.tipo === "magia";

        return (
          <li
            key={chave}
            // No celular o texto desce para baixo do ícone e usa a largura
            // toda; ao lado dele, sobrava uma coluna estreita demais.
            className="border-dourado-600/25 grid grid-cols-[auto_1fr] items-center gap-x-3 border-b border-dashed pb-3 last:border-0 last:pb-0 sm:items-start sm:[&>*:first-child]:row-span-2"
          >
            <IconeDaHabilidade habilidade={h} />

            <div className="min-w-0">
              <p className="font-titulo text-tinta-900 text-sm font-semibold">
                {h.nome}
              </p>

              <p className="text-tinta-500 text-[0.66rem] tracking-wide">
                {ehMagia
                  ? [
                      h.circulo === 0 ? "Truque" : `${h.circulo}º círculo`,
                      h.escola,
                      h.tempo,
                      h.alcance,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : ROTULOS[h.tipo]}
              </p>
            </div>

            <div className="col-span-2 mt-2 sm:col-span-1 sm:col-start-2 sm:mt-1">
              {h.texto ? (
                <div className="text-tinta-700">
                  <TextoDeRegra texto={h.texto} compacto />
                </div>
              ) : (
                <p className="text-tinta-700 text-sm leading-snug">
                  {h.descricao}
                </p>
              )}

              {h.anotacao ? (
                <p className="text-tinta-500 mt-1 text-xs italic">
                  Anotado na ficha: {h.anotacao}
                </p>
              ) : null}

              {h.link ? (
                <Link
                  href={h.link.href}
                  className="text-tinta-700 hover:text-heraldico-vermelho decoration-dourado-600/60 mt-1.5 inline-block text-xs underline underline-offset-2 transition-colors"
                >
                  {h.link.rotulo} →
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const ROTULOS: Record<string, string> = {
  talento: "Talento",
  traco: "Traço de espécie",
  classe: "Característica de classe",
  invocacao: "Invocação mística",
  truque: "Truque",
  magia: "Magia",
};

const NOMES_DAS_MOEDAS: Record<string, string> = {
  pc: "Cobre",
  pp: "Prata",
  ce: "Electro",
  po: "Ouro",
  pl: "Platina",
};

/** A aba de poderes só existe quando há algum para mostrar. */
export function temPoderes(ficha: Ficha): boolean {
  return (
    ficha.magias.length > 0 ||
    ficha.caracteristicas.length > 0 ||
    ficha.tracos.length > 0 ||
    ficha.talentos.length > 0
  );
}

/** A linha que resume o personagem em quatro palavras, sob o título da aba. */
export function resumoDaFicha(ficha: Ficha): string {
  return `${ficha.especie} · ${ficha.classe} · ${ficha.antecedente} · Nível ${ficha.nivel}`;
}

/* ============================================================
   Aba "Ficha": o que decide um turno
   ============================================================ */

/* ============================================================
   Aba "Poderes": o que ele sabe fazer
   ============================================================ */

export function FichaAtualPoderes({ ficha }: { ficha: Ficha }) {
  return (
    <CorpoDaAba>
      {ficha.magias.length > 0 ? (
        <Secao titulo="Truques e magias">
          <ListaDeHabilidades chaves={ficha.magias} />
        </Secao>
      ) : null}

      {ficha.caracteristicas.length > 0 ? (
        <Secao titulo="Características de classe">
          <ListaDeHabilidades chaves={ficha.caracteristicas} />
        </Secao>
      ) : null}

      {ficha.tracos.length > 0 ? (
        <Secao titulo="Traços de espécie">
          <ListaDeHabilidades chaves={ficha.tracos} />
        </Secao>
      ) : null}

      {ficha.talentos.length > 0 ? (
        <Secao titulo="Talentos">
          <ListaDeHabilidades chaves={ficha.talentos} />
        </Secao>
      ) : null}
    </CorpoDaAba>
  );
}

/* ============================================================
   Aba "Mochila": o que ele carrega e o que sabe usar
   ============================================================ */

export function FichaAtualMochila({ ficha }: { ficha: Ficha }) {
  const moedas = Object.entries(ficha.moedas).filter(([, v]) => v);

  return (
    <CorpoDaAba>
      {ficha.armas.length > 0 ? (
        <Secao titulo="Armas">
          <ul className="mt-3 space-y-1">
            {ficha.armas.map((arma) => (
              <li
                key={arma.nome}
                className="border-dourado-600/20 flex flex-wrap items-baseline justify-between gap-x-3 border-b border-dashed py-1.5"
              >
                <span className="text-tinta-900 text-sm font-semibold">
                  {arma.nome}
                </span>
                <span className="text-tinta-700 text-sm">
                  {arma.dano}
                  {arma.observacoes ? ` · ${arma.observacoes}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      ) : null}

      <Secao titulo="Equipamento">
        {ficha.equipamento.length > 0 ? (
          <ul className="text-tinta-900 mt-3 space-y-1 text-sm">
            {ficha.equipamento.map((item) => (
              <li key={item} className="marker:text-dourado-600 ml-4 list-disc">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinta-500 mt-3 text-sm italic">
            A mochila está vazia. Por enquanto.
          </p>
        )}
      </Secao>

      {moedas.length > 0 ? (
        <Secao titulo="Bolsa">
          <ul className="mt-3 flex flex-wrap gap-4">
            {moedas.map(([sigla, valor]) => (
              <li key={sigla} className="text-sm">
                <span className="font-titulo text-tinta-900 font-bold">
                  {valor}
                </span>
                <span className="text-tinta-500 ml-1 text-xs">
                  {NOMES_DAS_MOEDAS[sigla]}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      ) : null}

      <Secao titulo="Treinamento e idiomas">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-tinta-500 text-xs">Armaduras</dt>
            <dd className="text-tinta-900">{ficha.treinamento.armaduras}</dd>
          </div>
          <div>
            <dt className="text-tinta-500 text-xs">Armas</dt>
            <dd className="text-tinta-900">{ficha.treinamento.armas}</dd>
          </div>
          {ficha.treinamento.ferramentas ? (
            <div>
              <dt className="text-tinta-500 text-xs">Ferramentas</dt>
              <dd className="text-tinta-900">
                {ficha.treinamento.ferramentas}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-tinta-500 text-xs">Idiomas</dt>
            <dd className="text-tinta-900">{ficha.idiomas.join(", ")}</dd>
          </div>
        </dl>
      </Secao>
    </CorpoDaAba>
  );
}
