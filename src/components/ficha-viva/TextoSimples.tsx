import { Fragment, type ReactNode } from "react";
import Link from "next/link";

/**
 * O texto de uma regra, para o navegador: parágrafos, "#### " subtítulo,
 * listas com "- ", tabelas com "|", **negrito**, _itálico_ e [links](#x).
 *
 * É o primo leve do TextoDeRegra, que só roda no servidor porque busca o
 * Grimório, os itens e o Bestiário para pôr os links. Aqui os links das
 * magias vêm prontos em `magias` (nome → endereço), só os que a tela usa.
 */
export function TextoSimples({
  texto,
  magias = {},
  base = "",
}: {
  texto: string;
  /** Nome da magia → endereço, para o itálico virar link. */
  magias?: Record<string, string>;
  /** Para onde apontam os links "#ancora" do texto (ex.: "/classes/bruxo/"). */
  base?: string;
}) {
  const blocos = texto.trim().split(/\n\s*\n/);
  const linha = (t: string) => emLinha(t, magias, base);
  return (
    <div className="text-tinta-700 space-y-2 text-sm leading-relaxed">
      {blocos.map((b, i) => {
        const bloco = b.trim();
        if (bloco.startsWith("#### "))
          return (
            <h5 key={i} className="font-titulo text-tinta-900 pt-1 font-bold">
              {linha(bloco.slice(5))}
            </h5>
          );
        if (bloco.split("\n").every((l) => l.trim().startsWith("- ")))
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {bloco.split("\n").map((l, j) => (
                <li key={j}>{linha(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        if (bloco.startsWith("|")) {
          const linhas = bloco
            .split("\n")
            .filter((l) => !/^\|[\s|:-]+\|$/.test(l.trim()))
            .map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
          const [cabeca, ...corpo] = linhas;
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    {cabeca.map((c, j) => (
                      <th key={j} className="border-dourado-600/30 border-b px-2 py-1 font-semibold">
                        {linha(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corpo.map((r, j) => (
                    <tr key={j}>
                      {r.map((c, k) => (
                        <td key={k} className="border-dourado-600/15 border-b px-2 py-1">
                          {linha(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={i}>{linha(bloco.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}

function emLinha(texto: string, magias: Record<string, string>, base: string): ReactNode {
  const partes = texto.split(/(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g);
  return partes.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="text-tinta-900">{p.slice(2, -2)}</strong>;
    if (p.startsWith("_") && p.endsWith("_") && p.length > 2) {
      const nome = p.slice(1, -1);
      const href = magias[nome];
      return href ? (
        <Link key={i} href={href} className="text-heraldico-vermelho italic underline underline-offset-2">
          {nome}
        </Link>
      ) : (
        <em key={i}>{nome}</em>
      );
    }
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2].startsWith("#") ? `${base}${link[2]}` : link[2];
      return (
        <Link key={i} href={href} className="text-heraldico-vermelho underline underline-offset-2">
          {link[1]}
        </Link>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}
