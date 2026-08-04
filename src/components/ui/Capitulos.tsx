import {
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import { TituloDeCapitulo, SeparadorDeTexto } from "../../../mdx-components";
import { Dobra } from "@/components/ui/Dobra";

/**
 * Divide um texto da pasta content/ em capítulos recolhidos.
 *
 * O corte acontece sozinho, em cada título de segundo nível (as linhas que
 * começam com "## " nos arquivos .mdx). Quem escreve a lore não precisa marcar
 * nada: basta continuar usando títulos como sempre, e cada trecho novo já
 * nasce como um capítulo que a pessoa abre quando quiser.
 *
 * O que vier antes do primeiro título fica sempre aberto, servindo de abertura.
 *
 * Quando o arquivo não tem título nenhum, como acontece nas histórias dos
 * personagens, o texto vira um bloco só: o primeiro parágrafo aparece e o
 * resto fica atrás de um botão.
 */

type Bloco = { titulo: ReactNode; nos: ReactNode[] };

/**
 * Desce pelos fragmentos até chegar na lista de blocos do texto.
 *
 * As quebras de linha entre um bloco e outro chegam como texto solto e não
 * significam nada aqui, então saem do caminho.
 */
function achatar(no: ReactNode): ReactNode[] {
  if (Array.isArray(no)) return no.flatMap(achatar);
  if (isValidElement(no) && no.type === Fragment) {
    return achatar((no.props as { children?: ReactNode }).children);
  }
  if (no === null || no === undefined || typeof no === "boolean") return [];
  if (typeof no === "string" && no.trim() === "") return [];
  return [no];
}

/**
 * O "##" do arquivo .mdx não chega aqui como a etiqueta "h2": chega já como o
 * componente que mdx-components.tsx registrou no lugar dela. É por ele que
 * reconhecemos o começo de cada capítulo.
 */
function ehTitulo(no: ReactNode): no is ReactElement<{ children: ReactNode }> {
  return isValidElement(no) && no.type === TituloDeCapitulo;
}

/**
 * Um "---" logo antes do próximo título separava capítulos quando o texto era
 * corrido. Agora cada capítulo tem moldura própria e o ornamento sobrando só
 * pesa, então ele sai do fim de cada bloco.
 */
function semSeparadorNoFim(nos: ReactNode[]): ReactNode[] {
  const limpos = [...nos];
  while (
    limpos.length > 0 &&
    isValidElement(limpos[limpos.length - 1]) &&
    (limpos[limpos.length - 1] as ReactElement).type === SeparadorDeTexto
  ) {
    limpos.pop();
  }
  return limpos;
}

/** Reemite um pedaço do texto preservando a ordem original. */
function Trecho({ nos }: { nos: ReactNode[] }) {
  return nos.map((no, i) => <Fragment key={i}>{no}</Fragment>);
}

export function Capitulos({
  Texto,
  rotuloAbrir = "Ler capítulo",
  rotuloTexto,
}: {
  Texto: ComponentType;
  rotuloAbrir?: string;
  /** Quando o arquivo não tem capítulo nenhum, o botão único diz outra coisa. */
  rotuloTexto?: string;
}) {
  const nos = achatar((Texto as (props: object) => ReactNode)({}));

  const aberturaBruta: ReactNode[] = [];
  const capitulos: Bloco[] = [];

  for (const no of nos) {
    if (ehTitulo(no)) {
      capitulos.push({ titulo: no.props.children, nos: [] });
    } else if (capitulos.length > 0) {
      capitulos[capitulos.length - 1].nos.push(no);
    } else {
      aberturaBruta.push(no);
    }
  }

  const abertura = semSeparadorNoFim(aberturaBruta);

  // Texto corrido, sem capítulos: primeiro parágrafo à vista, resto guardado.
  if (capitulos.length === 0) {
    const [primeiro, ...resto] = abertura;
    return (
      <>
        {primeiro}
        {resto.length > 0 ? (
          <Dobra
            previa="nenhuma"
            className="mt-4"
            rotuloAbrir={rotuloTexto ?? rotuloAbrir}
          >
            <Trecho nos={resto} />
          </Dobra>
        ) : null}
      </>
    );
  }

  return (
    <>
      {abertura.length > 0 ? <Trecho nos={abertura} /> : null}

      <div className={abertura.length > 0 ? "mt-8 space-y-3" : "space-y-3"}>
        {capitulos.map((capitulo, i) => (
          <Dobra key={i} titulo={capitulo.titulo} rotuloAbrir={rotuloAbrir}>
            <Trecho nos={semSeparadorNoFim(capitulo.nos)} />
          </Dobra>
        ))}
      </div>
    </>
  );
}
