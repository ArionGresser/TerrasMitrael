import Image from "next/image";
import type { FichaAtual as Ficha } from "@/lib/personagens";
import Link from "next/link";
import { buscarHabilidade, type HabilidadeNaFicha } from "@/lib/habilidades";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { Ornamento } from "@/components/ui/Titulo";
import { Selo } from "@/components/ui/Selo";
import { Secao } from "@/components/personagens/Painel";

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

function Caixa({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`border-dourado-600/30 bg-pergaminho-50/40 rounded-sm border px-2 py-2 text-center ${
        destaque ? "border-heraldico-vermelho/40" : ""
      }`}
    >
      <p className="text-tinta-500 text-[0.58rem] leading-tight tracking-[0.1em] uppercase">
        {rotulo}
      </p>
      <p
        className={`font-titulo mt-0.5 leading-none font-bold ${
          destaque
            ? "text-heraldico-vermelho text-2xl"
            : "text-tinta-900 text-xl"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

/**
 * O corpo de uma aba.
 *
 * A primeira seção perde a margem de cima, porque logo acima dela já está o
 * ornamento do cabeçalho. Fica na classe em vez de virar uma propriedade
 * para cada seção não precisar saber se é a primeira: elas aparecem e somem
 * conforme o personagem tem ou não aquilo.
 */
function CorpoDaAba({ children }: { children: React.ReactNode }) {
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

/**
 * Os dois números que mais se olham numa luta, em forma de emblema: a
 * Classe de Armadura num escudo, os Pontos de Vida num coração.
 */
function Emblema({
  forma,
  rotulo,
  valor,
}: {
  forma: "escudo" | "coracao";
  rotulo: string;
  valor: string;
}) {
  const contorno =
    forma === "escudo"
      ? "M40 4 L73 14 V44 C73 65 59 79 40 88 C21 79 7 65 7 44 V14 Z"
      : "M40 84 C19 67 5 53 5 33 C5 19 15 9 28 9 C34 9 38 13 40 17 C42 13 46 9 52 9 C65 9 75 19 75 33 C75 53 61 67 40 84 Z";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[5.25rem] w-[4.5rem] sm:h-24 sm:w-[5.25rem]">
        <svg
          viewBox="0 0 80 92"
          aria-hidden
          focusable="false"
          className="absolute inset-0 size-full drop-shadow-[0_2px_3px_rgba(90,60,25,0.3)]"
        >
          <defs>
            <radialGradient id={`emblema-${forma}`} cx="40%" cy="30%" r="75%">
              <stop offset="0" stopColor="#fbf6e9" />
              <stop offset="1" stopColor="#e6d4ab" />
            </radialGradient>
          </defs>
          <path
            d={contorno}
            fill={`url(#emblema-${forma})`}
            stroke="#96741f"
            strokeWidth="2.2"
          />
          <path
            d={contorno}
            fill="none"
            stroke="#b8912c"
            strokeOpacity="0.45"
            strokeWidth="1"
            transform="translate(40 46) scale(0.86) translate(-40 -46)"
          />
        </svg>
        <span
          className={`font-titulo text-heraldico-vermelho absolute inset-x-0 text-center text-3xl leading-none font-bold sm:text-[2.1rem] ${
            forma === "escudo" ? "top-[38%]" : "top-[32%]"
          } -translate-y-1/2`}
        >
          {valor}
        </span>
      </div>
      <p className="font-titulo text-tinta-500 mt-1.5 text-center text-[0.58rem] leading-tight tracking-[0.12em] uppercase">
        {rotulo}
      </p>
    </div>
  );
}

export function FichaAtualNumeros({ ficha }: { ficha: Ficha }) {
  const combate = ficha.combate;

  return (
    <CorpoDaAba>
      <Secao titulo="Em combate">
        <div className="flex items-start justify-center gap-8 sm:gap-12">
          <Emblema
            forma="escudo"
            rotulo="Classe de Armadura"
            valor={combate.ca}
          />
          <Emblema forma="coracao" rotulo="Pontos de Vida" valor={combate.pv} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Caixa rotulo="Iniciativa" valor={combate.iniciativa} />
          <Caixa rotulo="Proficiência" valor={combate.bonusProficiencia} />
          <Caixa rotulo="Deslocamento" valor={combate.deslocamento} />
          <Caixa rotulo="Percepção passiva" valor={combate.percepcaoPassiva} />
          <Caixa rotulo="Tamanho" valor={combate.tamanho} />
          <Caixa rotulo="Alinhamento" valor={ficha.alinhamento} />
        </div>
      </Secao>

      <Secao titulo="Atributos">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {ficha.atributos.map((a) => (
            <li
              key={a.nome}
              className="border-dourado-600/25 bg-pergaminho-50/50 flex flex-col items-center rounded-sm border px-2 pt-2.5 pb-3 text-center"
            >
              <p className="font-titulo text-tinta-700 text-[0.62rem] font-semibold tracking-[0.12em] uppercase">
                {a.nome}
              </p>
              <span className="medalhao mt-2 grid size-14 place-items-center rounded-full">
                <span className="font-titulo text-tinta-900 text-2xl leading-none font-bold">
                  {a.modificador}
                </span>
              </span>
              <span className="border-dourado-600/50 bg-pergaminho-100 font-titulo text-tinta-700 relative -mt-2 rounded-full border px-2 text-[0.66rem] leading-relaxed">
                {a.valor}
              </span>
              <p
                className={`mt-2 text-[0.64rem] ${
                  a.proficiente
                    ? "text-heraldico-vermelho font-semibold"
                    : "text-tinta-500"
                }`}
              >
                {a.proficiente ? "✦ " : ""}salvaguarda {a.salvaguarda}
              </p>
            </li>
          ))}
        </ul>
      </Secao>

      {ficha.pericias.length > 0 ? (
        <Secao titulo="Perícias">
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {ficha.pericias.map((p) => (
              <li
                key={p.nome}
                className="border-dourado-600/20 flex items-baseline justify-between gap-3 border-b border-dashed py-1.5"
              >
                <span
                  className={`text-sm ${
                    p.proficiente
                      ? "text-tinta-900 font-semibold"
                      : "text-tinta-700"
                  }`}
                >
                  {p.proficiente ? "✦ " : ""}
                  {p.nome}
                </span>
                <span className="font-titulo text-tinta-900 text-sm">
                  {p.bonus}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      ) : null}

      {ficha.conjuracao ? (
        <Secao titulo="Conjuração">
          <div className="grid grid-cols-3 gap-2">
            <Caixa rotulo="Atributo" valor={ficha.conjuracao.atributo} />
            <Caixa rotulo="CD da magia" valor={ficha.conjuracao.cd} />
            <Caixa rotulo="Ataque mágico" valor={ficha.conjuracao.ataque} />
          </div>
        </Secao>
      ) : null}

      <Ornamento className="mt-9" />

      <p className="text-tinta-500 mt-4 text-center text-xs italic">
        Experiência: {ficha.experiencia}
      </p>
    </CorpoDaAba>
  );
}

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
