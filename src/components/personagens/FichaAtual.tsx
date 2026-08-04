import Image from "next/image";
import type { FichaAtual as Ficha } from "@/lib/personagens";
import { buscarHabilidade, type Habilidade } from "@/lib/habilidades";
import { Ornamento } from "@/components/ui/Titulo";
import { Selo } from "@/components/ui/Selo";

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
          destaque ? "text-heraldico-vermelho text-2xl" : "text-tinta-900 text-xl"
        }`}
      >
        {valor}
      </p>
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
 * O corpo de uma aba.
 *
 * A primeira seção perde a margem de cima, porque logo acima dela já está o
 * ornamento do cabeçalho. Fica na classe em vez de virar uma propriedade
 * para cada seção não precisar saber se é a primeira: elas aparecem e somem
 * conforme o personagem tem ou não aquilo.
 */
function CorpoDaAba({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 [&>section:first-child]:mt-0">{children}</div>;
}

/** O selo em branco que segura o lugar do ícone que ainda não chegou. */
function IconeDaHabilidade({ habilidade }: { habilidade: Habilidade }) {
  if (habilidade.icone) {
    return (
      <Image
        src={habilidade.icone}
        alt=""
        width={52}
        height={52}
        className="border-dourado-600/30 size-13 shrink-0 rounded-sm border object-cover"
      />
    );
  }

  return (
    <span
      title="O ícone desta habilidade ainda está sendo desenhado"
      className="border-dourado-600/25 bg-pergaminho-200/50 flex size-13 shrink-0 flex-col items-center justify-center gap-0.5 rounded-sm border border-dashed"
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
          <li key={chave} className="flex gap-3">
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

              <p className="text-tinta-700 mt-1 text-sm leading-snug">
                {h.descricao}
              </p>

              {h.anotacao ? (
                <p className="text-tinta-500 mt-1 text-xs italic">
                  Anotado na ficha: {h.anotacao}
                </p>
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

export function FichaAtualNumeros({ ficha }: { ficha: Ficha }) {
  return (
    <CorpoDaAba>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <Caixa rotulo="CA: Classe de Armadura" valor={ficha.combate.ca} destaque />
        <Caixa rotulo="Vida" valor={ficha.combate.pv} destaque />
        <Caixa rotulo="Iniciativa" valor={ficha.combate.iniciativa} />
        <Caixa rotulo="Proficiência" valor={ficha.combate.bonusProficiencia} />
        <Caixa rotulo="Deslocamento" valor={ficha.combate.deslocamento} />
        <Caixa rotulo="Tamanho" valor={ficha.combate.tamanho} />
        <Caixa
          rotulo="Percepção passiva"
          valor={ficha.combate.percepcaoPassiva}
        />
        <Caixa rotulo="Alinhamento" valor={ficha.alinhamento} />
      </div>

      <Secao titulo="Atributos">
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ficha.atributos.map((a) => (
            <li
              key={a.nome}
              className="border-dourado-600/25 bg-pergaminho-50/30 rounded-sm border px-3 py-2 text-center"
            >
              <p className="text-tinta-500 text-[0.6rem] tracking-[0.1em] uppercase">
                {a.nome}
              </p>
              <p className="font-titulo text-tinta-900 mt-0.5 text-2xl leading-none font-bold">
                {a.modificador}
              </p>
              <p className="text-tinta-500 mt-1 text-[0.6rem]">
                valor {a.valor}
              </p>
              <p
                className={`mt-1 text-[0.6rem] ${
                  a.proficiente
                    ? "text-heraldico-vermelho font-semibold"
                    : "text-tinta-500"
                }`}
              >
                salvaguarda {a.salvaguarda}
                {a.proficiente ? " ✦" : ""}
              </p>
            </li>
          ))}
        </ul>
      </Secao>

      {ficha.pericias.length > 0 ? (
        <Secao titulo="Perícias">
          <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
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
          <div className="mt-3 grid grid-cols-3 gap-2">
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

      <Ornamento className="mt-9" />

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-titulo text-tinta-500 text-[0.66rem] tracking-[0.2em] uppercase">
            Treinamento
          </h3>
          <dl className="mt-2 space-y-1.5 text-sm">
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
          </dl>
        </div>

        <div>
          <h3 className="font-titulo text-tinta-500 text-[0.66rem] tracking-[0.2em] uppercase">
            Idiomas
          </h3>
          <p className="text-tinta-900 mt-2 text-sm leading-relaxed">
            {ficha.idiomas.join(", ")}
          </p>
        </div>
      </div>
    </CorpoDaAba>
  );
}
