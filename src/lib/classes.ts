import fs from "node:fs";
import path from "node:path";

/**
 * As classes das regras de 2024, em português.
 *
 * Vêm do SRD 5.2.1 (Creative Commons Attribution 4.0). Cada classe é um
 * arquivo em content/classes/, traduzido a partir da base em inglês que
 * scripts/classes/separar-srd.py gera. O arquivo tem um cabeçalho com o nome
 * e quatro partes, cada uma aberta por "## ":
 *
 *   ## Traços                    tabela "| rótulo | valor |", sem cabeçalho
 *   ## Tornando-se um ...        como entrar na classe
 *   ## Características de classe a tabela por nível e cada característica
 *   ## Subclasse: ...            a subclasse que o SRD traz
 *
 * Cada característica começa com "#### Nível N: Nome". A lista de magias
 * não fica no arquivo: sai do grimório, pela classe de cada magia.
 *
 * Só roda no servidor, porque lê o disco.
 */

const PASTA = path.join(process.cwd(), "content/classes");

/** As doze classes, na ordem da lista. As que ainda não têm arquivo aparecem como "em tradução". */
export const TODAS_AS_CLASSES = [
  { slug: "barbaro", nome: "Bárbaro", original: "Barbarian" },
  { slug: "bardo", nome: "Bardo", original: "Bard" },
  { slug: "bruxo", nome: "Bruxo", original: "Warlock" },
  { slug: "clerigo", nome: "Clérigo", original: "Cleric" },
  { slug: "druida", nome: "Druida", original: "Druid" },
  { slug: "feiticeiro", nome: "Feiticeiro", original: "Sorcerer" },
  { slug: "guerreiro", nome: "Guerreiro", original: "Fighter" },
  { slug: "ladino", nome: "Ladino", original: "Rogue" },
  { slug: "mago", nome: "Mago", original: "Wizard" },
  { slug: "monge", nome: "Monge", original: "Monk" },
  { slug: "paladino", nome: "Paladino", original: "Paladin" },
  { slug: "patrulheiro", nome: "Patrulheiro", original: "Ranger" },
];

export type Traco = { rotulo: string; valor: string };

/** As características que chegam num mesmo nível, num bloco só. */
export type Patamar = { nivel: number; nomes: string[]; texto: string };

export type Classe = {
  slug: string;
  nome: string;
  original: string;
  tracos: Traco[];
  tornandoSe: { titulo: string; texto: string };
  /** O parágrafo antes da tabela e a tabela por nível, em markdown. */
  introducao: string;
  tabela: string;
  patamares: Patamar[];
  subclasse: {
    nome: string;
    lema: string;
    texto: string;
    patamares: Patamar[];
  };
};

function lerCabecalho(bruto: string) {
  const [, cabecalho, corpo] = bruto.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  if (!cabecalho) throw new Error("Arquivo de classe sem cabeçalho");
  const campos = Object.fromEntries(
    cabecalho.split("\n").map((linha) => {
      const i = linha.indexOf(":");
      return [linha.slice(0, i).trim(), linha.slice(i + 1).trim()];
    })
  );
  return { campos, corpo };
}

/** Separa o texto pelos "#### Nível N: Nome" e junta os do mesmo nível. */
function emPatamares(texto: string): { antes: string; patamares: Patamar[] } {
  const partes = texto.split(/^(?=#### Nível \d+: )/m);
  const antes = partes[0].startsWith("#### Nível ") ? "" : partes.shift()!;
  const patamares: Patamar[] = [];
  for (const parte of partes) {
    const [, nivel, nome] = parte.match(/^#### Nível (\d+): (.+)$/m)!;
    const corpo = parte.replace(/^#### Nível \d+: .+$/m, `#### ${nome}`);
    const ultimo = patamares.at(-1);
    if (ultimo && ultimo.nivel === Number(nivel)) {
      ultimo.nomes.push(nome);
      ultimo.texto += "\n\n" + corpo.trim();
    } else {
      patamares.push({ nivel: Number(nivel), nomes: [nome], texto: corpo.trim() });
    }
  }
  // Com uma característica só, o nome já está no título do pergaminho
  for (const p of patamares) {
    if (p.nomes.length === 1) p.texto = p.texto.replace(/^#### .+\n+/, "");
  }
  return { antes: antes.trim(), patamares };
}

function lerClasse(slug: string): Classe | undefined {
  const arquivo = path.join(PASTA, `${slug}.md`);
  if (!fs.existsSync(arquivo)) return undefined;
  const { campos, corpo } = lerCabecalho(fs.readFileSync(arquivo, "utf8"));

  const secoes = Object.fromEntries(
    corpo
      .split(/^## /m)
      .slice(1)
      .map((secao) => {
        const quebra = secao.indexOf("\n");
        return [secao.slice(0, quebra).trim(), secao.slice(quebra + 1).trim()];
      })
  );
  const titulo = (inicio: string) => Object.keys(secoes).find((t) => t.startsWith(inicio))!;

  const tracos = secoes["Traços"]
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .map((l) => {
      const [rotulo, valor] = l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      return { rotulo, valor };
    });

  // A tabela por nível é o bloco de linhas com "|"; o que vem antes é a introdução
  const caracteristicas = emPatamares(secoes["Características de classe"]);
  const blocos = caracteristicas.antes.split(/\n\s*\n/);
  const tabela = blocos.filter((b) => b.trim().startsWith("|")).join("\n\n");
  const introducao = blocos.filter((b) => !b.trim().startsWith("|")).join("\n\n");

  const tituloSubclasse = titulo("Subclasse: ");
  const subclasse = emPatamares(secoes[tituloSubclasse]);
  const [lema, ...resto] = subclasse.antes.split(/\n\s*\n/);

  return {
    slug,
    nome: campos.nome,
    original: campos.original,
    tracos,
    tornandoSe: { titulo: titulo("Tornando-se"), texto: secoes[titulo("Tornando-se")] },
    introducao,
    tabela,
    patamares: caracteristicas.patamares,
    subclasse: {
      nome: tituloSubclasse.replace("Subclasse: ", ""),
      lema: lema.replace(/^_|_$/g, ""),
      texto: resto.join("\n\n"),
      patamares: subclasse.patamares,
    },
  };
}

/** As classes que já têm tradução, na ordem da lista. */
export function classesTraduzidas(): Classe[] {
  return TODAS_AS_CLASSES.flatMap((c) => lerClasse(c.slug) ?? []);
}

export function buscarClasse(slug: string): Classe | undefined {
  return lerClasse(slug);
}

/** Um traço pelo começo do rótulo, como "Dado de Pontos de Vida". */
export function traco(classe: Classe, rotulo: string): string | undefined {
  return classe.tracos.find((t) => t.rotulo.startsWith(rotulo))?.valor;
}
