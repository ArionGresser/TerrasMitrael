import fs from "node:fs";
import path from "node:path";

/**
 * Os documentos de regra do Compêndio: antecedentes, talentos, glossário,
 * equipamento... Cada um é um arquivo em content/regras/, traduzido do SRD
 * 5.2.1 (Creative Commons Attribution 4.0).
 *
 * O arquivo tem um cabeçalho e o texto em markdown curto:
 *
 *   ---
 *   titulo: Talentos
 *   original: Feats
 *   ordem: 4              posição na lista do Compêndio
 *   resumo: ...           uma linha para o cartão do Compêndio
 *   estilo: aberto        opcional: itens abertos em vez de pergaminhos
 *   oculto: sim           opcional: tem página, mas não aparece na lista do
 *                         Compêndio (é aberto a partir de outra seção)
 *   ---
 *   texto de abertura
 *   # Grupo               opcional, separa os itens em grupos
 *   ## Item               cada item vira um pergaminho (ou um bloco aberto)
 *
 * Só roda no servidor, porque lê o disco.
 */

const PASTA = path.join(process.cwd(), "content/regras");

export type ItemDeRegra = { id: string; titulo: string; texto: string };
export type GrupoDeRegra = { titulo?: string; itens: ItemDeRegra[] };

export type DocumentoDeRegra = {
  slug: string;
  titulo: string;
  original: string;
  ordem: number;
  resumo: string;
  estilo: "pergaminhos" | "aberto";
  oculto: boolean;
  abertura: string;
  grupos: GrupoDeRegra[];
};

/** "Dádiva do Destino" → "dadiva-do-destino", para os endereços com #. */
export function ancora(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ler(slug: string): DocumentoDeRegra | undefined {
  const arquivo = path.join(PASTA, `${slug}.md`);
  if (!fs.existsSync(arquivo)) return undefined;
  const bruto = fs.readFileSync(arquivo, "utf8");
  const [, cabecalho, corpo] = bruto.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  const campos = Object.fromEntries(
    cabecalho.split("\n").map((linha) => {
      const i = linha.indexOf(":");
      return [linha.slice(0, i).trim(), linha.slice(i + 1).trim()];
    })
  );

  const grupos: GrupoDeRegra[] = [];
  let abertura = "";
  let grupo: GrupoDeRegra | undefined;
  let item: ItemDeRegra | undefined;

  for (const linha of corpo.split("\n")) {
    if (linha.startsWith("# ")) {
      grupo = { titulo: linha.slice(2).trim(), itens: [] };
      grupos.push(grupo);
      item = undefined;
    } else if (linha.startsWith("## ")) {
      if (!grupo) {
        grupo = { itens: [] };
        grupos.push(grupo);
      }
      const titulo = linha.slice(3).trim();
      item = { id: ancora(titulo), titulo, texto: "" };
      grupo.itens.push(item);
    } else if (item) {
      item.texto += linha + "\n";
    } else if (grupo) {
      // Texto solto logo depois de um "# Grupo" vira a abertura do grupo
      grupo.itens.push((item = { id: ancora(grupo.titulo ?? ""), titulo: "", texto: linha + "\n" }));
    } else {
      abertura += linha + "\n";
    }
  }

  return {
    slug,
    titulo: campos.titulo,
    original: campos.original,
    ordem: Number(campos.ordem ?? 99),
    resumo: campos.resumo ?? "",
    estilo: campos.estilo === "aberto" ? "aberto" : "pergaminhos",
    oculto: campos.oculto === "sim",
    abertura: abertura.trim(),
    grupos: grupos.map((g) => ({
      ...g,
      itens: g.itens.map((i) => ({ ...i, texto: i.texto.trim() })),
    })),
  };
}

export function documentosDeRegra(): DocumentoDeRegra[] {
  return fs
    .readdirSync(PASTA)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ler(f.replace(/\.md$/, ""))!)
    .sort((a, b) => a.ordem - b.ordem);
}

export function buscarDocumento(slug: string): DocumentoDeRegra | undefined {
  return ler(slug);
}
