/**
 * O que o "Subir de nível" precisa saber de uma classe, montado no servidor
 * a partir de content/classes e do Grimório. Sai num arquivo por classe
 * (/classes/<slug>/niveis.json), baixado só quando alguém abre a subida:
 * a página do personagem não carrega nada disto.
 */

import { buscarClasse, traco } from "@/lib/classes";
import { MAGIAS } from "@/lib/magias";
import { buscarDocumento } from "@/lib/regras";
import { danoDaMagia, type DadosDeNivel, type OpcaoDeInvocacao, type TalentoDaLista } from "@/lib/subir-de-nivel";

const celulas = (linha: string) =>
  linha
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

/** As opções de um bloco "#### Nome" (como as Invocações Místicas). */
function invocacoes(texto: string): OpcaoDeInvocacao[] {
  return texto
    .split(/^(?=#### )/m)
    .filter((b) => b.startsWith("#### "))
    .map((b) => {
      const nome = b.match(/^#### (.+)$/m)![1].trim();
      const corpo = b.replace(/^#### .+\n+/, "").trim();
      const pre = corpo.match(/^Pré-requisito: (.+)$/m)?.[1].replace(/\.$/, "") ?? null;
      const nivelMinimo = Number(pre?.match(/nível (\d+)/)?.[1] ?? 1);
      // "invocação Pacto do Tomo" ou "invocação Pacto da Lâmina ou Pacto da Corrente"
      const exige = pre?.match(/invocação (.+)$/)?.[1].split(/,| ou /).map((s) => s.trim()).filter(Boolean) ?? [];
      return {
        nome,
        prerequisito: pre,
        nivelMinimo,
        exige,
        truqueDeDano: !!pre?.includes("truque de Bruxo que cause dano"),
        truqueDeAtaque: !!pre?.includes("jogada de ataque"),
        repetivel: /_Repetível\._/.test(corpo),
        texto: corpo.replace(/^Pré-requisito: .+\n+/m, ""),
      };
    });
}

function talentos(): TalentoDaLista[] {
  const doc = buscarDocumento("talentos");
  if (!doc) return [];
  return doc.grupos.flatMap((g) =>
    // Só os talentos de verdade: a abertura de cada categoria não tem a linha "_Talento ..._"
    g.itens.filter((i) => /^_Talento /m.test(i.texto)).map((i) => {
      const pre = i.texto.match(/Pré-requisito: ([^)\n]+)/)?.[1] ?? null;
      // "característica Estilo de Luta" é o que todo estilo pede: não precisa aparecer
      return {
        id: i.id,
        nome: i.titulo,
        categoria: (g.titulo ?? "").replace(/^Talentos (de |do |da )?/, ""),
        prerequisito: pre?.startsWith("característica Estilo de Luta") ? null : pre,
        nivelMinimo: Number(pre?.match(/[Nn]ível (\d+)/)?.[1] ?? 1),
        texto: i.texto,
      };
    })
  );
}

export function dadosDeNivel(slug: string): DadosDeNivel | null {
  const classe = buscarClasse(slug);
  if (!classe) return null;
  const linhas = classe.tabela.split("\n").filter((l) => l.trim().startsWith("|"));
  const colunas = celulas(linhas[0] ?? "");
  const porNivel = linhas
    .map(celulas)
    .filter((c) => /^\d+$/.test(c[0]))
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const extraDeInvocacao = classe.extras.find((e) => e.titulo.startsWith("Opções de Invocação"));
  const magias = MAGIAS.filter((m) => m.classes.includes(classe.nome)).map((m) => ({
    slug: m.slug,
    nome: m.nome,
    nivel: m.nivel,
    ...danoDaMagia(m.texto),
  }));

  return {
    slug,
    nome: classe.nome,
    dadoDeVida: Number(traco(classe, "Dado de Pontos de Vida")?.match(/d(\d+)/)?.[1] ?? 8),
    colunas,
    linhas: porNivel,
    patamares: classe.patamares,
    subclasse: { nome: classe.subclasse.nome, lema: classe.subclasse.lema, patamares: classe.subclasse.patamares },
    invocacoes: extraDeInvocacao ? invocacoes(extraDeInvocacao.texto) : [],
    magias: magias.sort((a, b) => a.nivel - b.nivel || a.nome.localeCompare(b.nome, "pt-BR")),
    talentos: talentos(),
  };
}
