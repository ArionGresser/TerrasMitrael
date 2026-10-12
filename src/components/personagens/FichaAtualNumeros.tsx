import type { FichaAtual as Ficha } from "@/lib/personagens";
import { Ornamento } from "@/components/ui/Titulo";
import { Secao } from "@/components/personagens/Painel";

/*
 * A aba "Ficha": os números que decidem um turno. Fica num arquivo à parte,
 * sem nada que leia o disco, para a ficha viva poder redesenhar estes
 * números no navegador quando a mesa ajusta PV ou atributos.
 */

export function Caixa({
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
            // O centro do desenho, não o da caixa: o escudo pesa em cima e
            // afina embaixo; o coração pesa nos dois lóbulos de cima
            forma === "escudo" ? "top-[47%]" : "top-[44%]"
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

