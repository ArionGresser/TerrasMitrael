import { buscarDocumento, ancora } from "./regras";
import { ITENS } from "./itens";
import { MAGIAS } from "./magias";
import { arte } from "./arte";
import type { Achavel, MagicoNoBau, MagiaNoBau, Tamanho } from "./bau-sorteio";

/**
 * O que pode sair de um baú, tirado do próprio site: o equipamento do Livro
 * do Aventureiro (com peso e preço) e os itens mágicos. Nada é cadastrado à
 * mão. O que é feito aqui é medir cada coisa: o tamanho decide em que
 * recipiente ela cabe (uma Marreta não entra numa algibeira).
 *
 * Só roda no servidor, porque lê os arquivos de regra.
 */

/** "1,5 kg" → 1.5, "250 g" → 0.25, "–" → 0. */
function peso(texto: string): number {
  const m = texto.replace(/\./g, "").match(/([\d,]+)\s*(kg|g)/);
  if (!m) return 0;
  const n = Number(m[1].replace(",", "."));
  return m[2] === "g" ? n / 1000 : n;
}

/** "1.500 PO" → 1500, "5 PP" → 0.5, "4 PC" → 0.04. */
function preco(texto: string): number | undefined {
  const m = texto.replace(/\./g, "").match(/([\d,]+)\s*(PC|PP|PE|PO|PL)/);
  if (!m) return undefined;
  const valor = { PC: 0.01, PP: 0.1, PE: 0.5, PO: 1, PL: 10 }[m[2]]!;
  return Number(m[1].replace(",", ".")) * valor;
}

/** Do mais leve ao mais pesado: algibeira, caixa, baú médio, baú grande, arca. */
function pelopeso(kg: number): Tamanho {
  if (kg <= 0.5) return 0;
  if (kg <= 1.5) return 1;
  if (kg <= 5) return 2;
  if (kg <= 15) return 3;
  return 4;
}

/** Linhas de uma tabela markdown, já sem o cabeçalho, como listas de células. */
function tabela(texto: string): { colunas: string[]; linhas: string[][] } {
  const brutas = texto
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .map((l) => l.slice(1, -1).split("|").map((c) => c.trim()));
  return { colunas: brutas[0] ?? [], linhas: brutas.slice(2) };
}

// Armas compridas ou volumosas demais para o peso que têm
const ARMA_FORA_DO_PESO: Record<string, Tamanho> = {
  Dardo: 0,
  Funda: 0,
  Chicote: 1,
  Zarabatana: 2,
  Lança: 3,
  Azagaia: 3,
  Tridente: 3,
  Bordão: 3,
  "Lança de Cavalaria": 4,
};

// Equipamento comprido ou volumoso demais para o peso que tem
const OBJETO_FORA_DO_PESO: Record<string, Tamanho> = {
  Escada: 4,
  Vara: 4,
  Tenda: 3,
  Cesto: 3,
  "Talha e Polia": 3,
  "Aríete Portátil": 3,
  "Saco de Dormir": 2,
  Cobertor: 2,
};

// O que no equipamento já é item mágico: sai pela lista de itens mágicos
const MAGICOS_NO_EQUIPAMENTO = new Set(["Pergaminho de Magia", "Poção de Cura"]);

function tamanhoDaArma(nome: string, propriedades: string, kg: number): Tamanho {
  if (nome in ARMA_FORA_DO_PESO) return ARMA_FORA_DO_PESO[nome];
  if (/Alcance/.test(propriedades)) return 4;
  if (/Pesada|Duas Mãos/.test(propriedades)) return 3;
  if (/Leve/.test(propriedades)) return 1;
  return Math.max(2, pelopeso(kg)) as Tamanho;
}

function equipamento(): Achavel[] {
  const doc = buscarDocumento("equipamento");
  if (!doc) return [];
  const achados: Achavel[] = [];
  const link = (id: string) => `/regras/equipamento/#${id}`;

  for (const grupo of doc.grupos) {
    for (const item of grupo.itens) {
      // Armas: uma tabela por tipo (simples, marciais, corpo a corpo, à distância)
      if (grupo.titulo === "Armas" && /^Armas (Simples|Marciais)/.test(item.titulo)) {
        const simples = item.titulo.includes("Simples");
        const corpoACorpo = item.titulo.includes("Corpo a Corpo");
        for (const [nome, dano, propriedades, , p, v] of tabela(item.texto).linhas) {
          const kg = peso(p);
          achados.push({
            id: `arma-${ancora(nome)}`,
            nome,
            grupo: "arma",
            detalhe: `Arma ${simples ? "simples" : "marcial"} · ${dano}`,
            peso: kg,
            preco: preco(v) ?? 0,
            tamanho: tamanhoDaArma(nome, propriedades, kg),
            href: link(item.id),
            corpoACorpo,
          });
        }
      }

      // Armaduras: leves, médias, pesadas e o escudo
      if (grupo.titulo === "Armaduras" && /^(Armaduras|Escudo)/.test(item.titulo)) {
        const classe = item.titulo.includes("Leves")
          ? "leve"
          : item.titulo.includes("Médias")
            ? "media"
            : item.titulo.includes("Pesadas")
              ? "pesada"
              : "escudo";
        const tamanho: Tamanho = { leve: 2, media: 3, pesada: 4, escudo: 3 }[classe] as Tamanho;
        for (const [nome, ca, , , p, v] of tabela(item.texto).linhas) {
          achados.push({
            id: `armadura-${ancora(nome)}`,
            nome,
            grupo: "armadura",
            detalhe: `${classe === "escudo" ? "Escudo" : `Armadura ${{ leve: "leve", media: "média", pesada: "pesada" }[classe]}`} · CA ${ca}`,
            peso: peso(p),
            preco: preco(v) ?? 0,
            tamanho,
            href: link(item.id),
            classe,
          });
        }
      }

      // Ferramentas: "**Nome (X PO).** ... Peso: Y kg."
      if (grupo.titulo === "Ferramentas") {
        for (const m of item.texto.matchAll(/\*\*(.+?) \(([^)]+)\)\.\*\*.*?Peso: ([^.]+)\./g)) {
          const v = preco(m[2]);
          if (v === undefined) continue;
          const kg = peso(m[3]);
          achados.push({
            id: `ferramenta-${ancora(m[1])}`,
            nome: m[1],
            grupo: "ferramenta",
            detalhe: "Ferramenta",
            peso: kg,
            preco: v,
            tamanho: Math.max(1, pelopeso(kg)) as Tamanho,
            href: link(item.id),
          });
        }
      }

      // Equipamento de aventura: "_preço · peso_" logo abaixo do nome, ou uma
      // tabela de variações (Foco Arcano, Munição, Símbolo Sagrado)
      if (grupo.titulo === "Equipamento de Aventura" && item.titulo) {
        if (MAGICOS_NO_EQUIPAMENTO.has(item.titulo)) continue;
        const imagem = arte("regras/equipamento/mini", item.id) ?? arte("regras/equipamento", item.id);
        const linha = item.texto.match(/^_(.+?) · (.+?)_/);
        if (linha && preco(linha[1]) !== undefined) {
          const kg = peso(linha[2]);
          achados.push({
            id: `aventura-${item.id}`,
            nome: item.titulo,
            grupo: "aventura",
            detalhe: "Equipamento de aventura",
            peso: kg,
            preco: preco(linha[1])!,
            tamanho: OBJETO_FORA_DO_PESO[item.titulo] ?? pelopeso(kg),
            href: link(item.id),
            imagem,
          });
          continue;
        }
        const { colunas, linhas } = tabela(item.texto);
        const iPeso = colunas.indexOf("Peso");
        const iPreco = colunas.indexOf("Preço");
        const iQuantos = colunas.indexOf("Quantidade");
        if (iPeso < 0 || iPreco < 0) continue;
        for (const l of linhas) {
          const v = preco(l[iPreco]);
          if (v === undefined) continue;
          const kg = peso(l[iPeso]);
          const forma = l[0].replace(/\s*\(.*\)/, "");
          achados.push({
            id: `aventura-${item.id}-${ancora(forma)}`,
            nome: iQuantos >= 0 ? `${forma} (${l[iQuantos]})` : `${item.titulo} (${forma})`,
            grupo: "aventura",
            detalhe: iQuantos >= 0 ? "Munição" : "Equipamento de aventura",
            peso: kg,
            preco: v,
            tamanho: pelopeso(kg),
            href: link(item.id),
            imagem,
          });
        }
      }
    }
  }
  return achados;
}

// Itens Maravilhosos: o tamanho pelo começo do nome. O resto é pequeno.
const MARAVILHOSO: [Tamanho, string[]][] = [
  [
    0,
    [
      "Amuleto", "Broche", "Conta", "Gema", "Pérola", "Pedra", "Escaravelho",
      "Talismã", "Pingente", "Pó ", "Medalhão", "Olhos", "Óculos", "Colar",
      "Diadema", "Tiara", "Pena", "Solvente", "Cola", "Cubo", "Portal Cúbico",
      "Fortaleza Instantânea", "Estatueta", "Baralho", "Vela",
    ],
  ],
  [
    2,
    [
      "Botas", "Elmo", "Manual", "Tomo", "Bola de Cristal", "Trompa", "Tigela",
      "Jarra", "Lanterna", "Grilhões", "Ferraduras", "Corda", "Mochila",
    ],
  ],
  [3, ["Braseiro", "Tapete", "Vassoura"]],
  [4, ["Espelho", "Aparato do Caranguejo"]],
];

const POR_CATEGORIA: Record<string, Tamanho> = {
  Anel: 0,
  Poção: 0,
  Pergaminho: 0,
  Varinha: 1,
  Cetro: 2,
  Cajado: 3,
  "Item Maravilhoso": 1,
};

// Nunca sai de um baú: o Artefato e a Esfera da Aniquilação, que é um buraco
// no mundo, não um objeto
const FORA_DO_BAU = new Set(["esfera-da-aniquilacao"]);

/**
 * Para armas e armaduras mágicas: em que armas (ou armaduras) comuns ela
 * pode vir. "Arma (Glaive, Espada Grande ou Cimitarra)" → as três;
 * "qualquer simples ou marcial" → todas.
 */
function bases(tipo: string, mundanos: Achavel[]): string[] | undefined {
  const m = tipo.match(/^(Arma|Armadura) \((.+?)\)/);
  if (!m) return undefined;
  const [, categoria, dentro] = m;
  const armas = mundanos.filter((a) => a.grupo === "arma");
  const armaduras = mundanos.filter((a) => a.grupo === "armadura");
  if (categoria === "Arma") {
    if (dentro.includes("qualquer munição")) return ["Flechas", "Virotes", "Balas de funda", "Agulhas"];
    if (dentro.includes("qualquer arma corpo a corpo")) return armas.filter((a) => a.corpoACorpo).map((a) => a.nome);
    if (dentro.includes("qualquer")) return armas.map((a) => a.nome);
    return dentro.split(/, | ou /);
  }
  if (dentro.includes("qualquer")) {
    const classes = ["leve", "media", "pesada"].filter((c) =>
      dentro.includes({ leve: "leve", media: "média", pesada: "pesada" }[c]!),
    );
    const exceto = dentro.match(/exceto (.+)$/)?.[1];
    return armaduras.filter((a) => classes.includes(a.classe!) && a.nome !== exceto).map((a) => a.nome);
  }
  return dentro.split(/, | ou /);
}

function magicos(mundanos: Achavel[]): MagicoNoBau[] {
  return ITENS.filter((i) => !FORA_DO_BAU.has(i.slug) && !i.raridades.includes("Artefato")).map((i) => {
    const b = bases(i.tipo, mundanos);
    let tamanho = POR_CATEGORIA[i.categoria] ?? 1;
    if (i.categoria === "Item Maravilhoso") {
      for (const [t, comecos] of MARAVILHOSO) {
        if (comecos.some((c) => i.nome.startsWith(c))) tamanho = t;
      }
    }
    return {
      slug: i.slug,
      nome: i.nome,
      categoria: i.categoria,
      raridades: i.raridades,
      variavel: i.variavel,
      sintonia: i.sintonia,
      tipo: i.tipo,
      tamanho,
      bases: b,
      imagem: arte("itens/mini", i.slug) ?? arte("itens", i.slug),
    };
  });
}

/** Tudo o que o Baú do Mestre precisa, para mandar ao navegador. */
export function conteudoDoBau(): {
  mundanos: Achavel[];
  magicos: MagicoNoBau[];
  magias: MagiaNoBau[];
} {
  const mundanos = equipamento();
  return {
    mundanos,
    magicos: magicos(mundanos),
    magias: MAGIAS.map((m) => ({ slug: m.slug, nome: m.nome, nivel: m.nivel })),
  };
}
