import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { magiaPeloNome } from "@/lib/magias";

/**
 * Transforma o texto de uma magia em HTML.
 *
 * O texto das regras é curto e previsível, então basta um pedaço pequeno de
 * markdown: parágrafos, _itálico_ (o nome de cada opção, como "Aprimoramento
 * de Truque."), **negrito**, listas com "- ", subtítulos com "#### " e
 * tabelas com "|". Fazer isso aqui evita carregar um interpretador de
 * markdown inteiro só para isso.
 *
 * Quando o itálico é o nome de outra magia do grimório, ele vira link para
 * a página dela.
 */
export function TextoDeRegra({ texto }: { texto: string }) {
  const blocos = texto.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-3.5 text-[0.95rem] leading-[1.75] sm:text-base">
      {blocos.map((bloco, i) => (
        <Bloco key={i} bloco={bloco.trim()} />
      ))}
    </div>
  );
}

function Bloco({ bloco }: { bloco: string }) {
  if (bloco.startsWith("#### ")) {
    return (
      <h3 className="font-titulo text-tinta-900 pt-3 text-base font-bold tracking-wide">
        {emLinha(bloco.slice(5))}
      </h3>
    );
  }

  const linhas = bloco.split("\n");

  if (linhas.every((l) => l.startsWith("|"))) {
    return <Tabela linhas={linhas} />;
  }

  if (linhas.every((l) => /^[-*] /.test(l))) {
    return (
      <ul className="space-y-1.5">
        {linhas.map((l, i) => (
          <li key={i} className="marker:text-dourado-600 ml-5 list-disc pl-1">
            {emLinha(l.slice(2))}
          </li>
        ))}
      </ul>
    );
  }

  return <p>{emLinha(linhas.join(" "))}</p>;
}

function Tabela({ linhas }: { linhas: string[] }) {
  const celulas = (linha: string) =>
    linha
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());

  const [cabecalho, , ...corpo] = linhas;

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-dourado-600/50 border-b-2">
            {celulas(cabecalho).map((c, i) => (
              <th
                key={i}
                scope="col"
                className="font-titulo text-tinta-700 px-2 py-1.5 text-xs font-bold tracking-wide"
              >
                {emLinha(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {corpo.map((linha, i) => (
            <tr key={i} className="border-dourado-600/20 border-b even:bg-pergaminho-200/30">
              {celulas(linha).map((c, j) => (
                <td key={j} className="px-2 py-1.5 align-top">
                  {emLinha(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Negrito e itálico dentro de uma linha. */
function emLinha(texto: string): ReactNode {
  const pedacos = texto.split(/(\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g);
  return pedacos.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="text-tinta-900 font-semibold">
          {emLinha(p.slice(2, -2))}
        </strong>
      );
    }
    if ((p.startsWith("_") && p.endsWith("_")) || (p.startsWith("*") && p.endsWith("*") && p.length > 2)) {
      // Nome de magia em itálico vira link para a página dela
      const citada = magiaPeloNome(p.slice(1, -1));
      if (citada) {
        return (
          <Link
            key={i}
            href={`/magias/${citada.slug}/`}
            className="decoration-dourado-600/60 hover:text-heraldico-vermelho italic underline underline-offset-2 transition-colors"
          >
            {citada.nome}
          </Link>
        );
      }
      return (
        <em key={i} className="text-tinta-900 font-semibold">
          {p.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}
