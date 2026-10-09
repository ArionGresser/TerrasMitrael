/**
 * As regras do Baú do Mestre: o que cabe em cada recipiente, o que cada
 * faixa do d20 rende e como o nível do grupo limita a raridade.
 *
 * São regras da casa, não do SRD: o Livro do Jogador e o Guia do Mestre têm
 * tabelas próprias de tesouro, e esta não copia nenhuma delas. Os itens que
 * saem é que são todos do site (equipamento e itens mágicos).
 *
 * Roda no navegador, por isso não lê arquivo nenhum: recebe o conteúdo
 * pronto de bau.ts.
 */

/** Do menor ao maior: o que cabe numa algibeira até o que só cabe num covil. */
export type Tamanho = 0 | 1 | 2 | 3 | 4;

export type Achavel = {
  id: string;
  nome: string;
  grupo: "arma" | "armadura" | "aventura" | "ferramenta";
  /** A linha de baixo do nome, como "Arma marcial · 1d8 cortante". */
  detalhe: string;
  peso: number;
  /** Em peças de ouro. */
  preco: number;
  tamanho: Tamanho;
  href: string;
  imagem?: string;
  corpoACorpo?: boolean;
  classe?: "leve" | "media" | "pesada" | "escudo";
};

export type MagicoNoBau = {
  slug: string;
  nome: string;
  categoria: string;
  raridades: string[];
  variavel: boolean;
  sintonia: boolean;
  tipo: string;
  tamanho: Tamanho;
  /** Arma ou armadura mágica: em quais comuns ela pode vir. */
  bases?: string[];
  imagem?: string;
};

export type MagiaNoBau = { slug: string; nome: string; nivel: number };

export type Conteudo = {
  mundanos: Achavel[];
  magicos: MagicoNoBau[];
  magias: MagiaNoBau[];
};

// ---------- As tabelas ----------

export const TAMANHOS = ["minúsculo", "pequeno", "médio", "grande", "enorme"];

export type Recipiente = {
  chave: string;
  nome: string;
  exemplo: string;
  /** O que de maior cabe, para dar a ideia. */
  cabe: string;
  tamanho: Tamanho;
  /** Quantos achados, no máximo. */
  vagas: number;
  /** Multiplica as moedas: um covil guarda mais que uma algibeira. */
  moedas: number;
};

export const RECIPIENTES: Recipiente[] = [
  {
    chave: "algibeira",
    nome: "Algibeira",
    exemplo: "Bolsa de cinto, bolso de um cadáver",
    cabe: "anéis, poções, gemas",
    tamanho: 0,
    vagas: 2,
    moedas: 0.25,
  },
  {
    chave: "caixa",
    nome: "Caixa pequena",
    exemplo: "Porta-joias, cofre de mão, gaveta",
    cabe: "adagas, varinhas, ferramentas",
    tamanho: 1,
    vagas: 3,
    moedas: 0.5,
  },
  {
    chave: "medio",
    nome: "Baú médio",
    exemplo: "Baú de viagem, caixote",
    cabe: "espadas, armaduras leves",
    tamanho: 2,
    vagas: 5,
    moedas: 1,
  },
  {
    chave: "grande",
    nome: "Baú grande",
    exemplo: "Arca, armário, sarcófago",
    cabe: "machados grandes, escudos, cajados",
    tamanho: 3,
    vagas: 7,
    moedas: 1.5,
  },
  {
    chave: "covil",
    nome: "Tesouro de covil",
    exemplo: "Sala do tesouro, pilha de um dragão",
    cabe: "armaduras pesadas, armas de haste",
    tamanho: 4,
    vagas: 10,
    moedas: 3,
  },
];

export type Faixa = {
  de: number;
  ate: number;
  nome: string;
  texto: string;
  /** Quantos achados, de tanto a tanto (antes do limite do recipiente). */
  achados: [number, number];
  /** Quantos deles são mágicos. */
  magicos: [number, number];
  /** O preço do equipamento comum que sai, em PO: de tanto a tanto. */
  preco: [number, number];
  /** O valor das moedas em PO, antes do nível e do recipiente. */
  moedas: [number, number];
};

export const FAIXAS: Faixa[] = [
  {
    de: 1,
    ate: 1,
    nome: "Vazio",
    texto: "Poeira, teia de aranha e o que sobrou de algum rato.",
    achados: [0, 1],
    magicos: [0, 0],
    preco: [0, 1],
    moedas: [0, 0.1],
  },
  {
    de: 2,
    ate: 5,
    nome: "Pobre",
    texto: "Umas moedas soltas e alguma coisa que alguém esqueceu.",
    achados: [1, 1],
    magicos: [0, 0],
    preco: [0, 5],
    moedas: [0.5, 5],
  },
  {
    de: 6,
    ate: 10,
    nome: "Modesto",
    texto: "Nada de lenda, mas coisa que vale levar.",
    achados: [1, 2],
    magicos: [0, 1],
    preco: [1, 25],
    moedas: [5, 30],
  },
  {
    de: 11,
    ate: 15,
    nome: "Bom",
    texto: "Alguém guardou isto com cuidado.",
    achados: [2, 3],
    magicos: [1, 1],
    preco: [5, 100],
    moedas: [30, 150],
  },
  {
    de: 16,
    ate: 19,
    nome: "Rico",
    texto: "O brilho escapa pela fresta antes de a tampa abrir.",
    achados: [2, 4],
    magicos: [1, 2],
    preco: [25, 500],
    moedas: [100, 400],
  },
  {
    de: 20,
    ate: 20,
    nome: "Lendário",
    texto: "Um tesouro que a mesa vai lembrar por muito tempo.",
    achados: [3, 5],
    magicos: [2, 2],
    preco: [100, Infinity],
    moedas: [300, 1000],
  },
];

export const RARIDADES = ["Comum", "Incomum", "Raro", "Muito Raro", "Lendário"];

export type Patamar = {
  chave: string;
  nome: string;
  /** Multiplica o valor das moedas. */
  moedas: number;
  /** A raridade de cada faixa, na ordem de FAIXAS (null: nada mágico). */
  raridade: (string | null)[];
};

export const PATAMARES: Patamar[] = [
  { chave: "1-4", nome: "Níveis 1 a 4", moedas: 1, raridade: [null, null, "Comum", "Incomum", "Incomum", "Raro"] },
  { chave: "5-10", nome: "Níveis 5 a 10", moedas: 5, raridade: [null, null, "Comum", "Incomum", "Raro", "Muito Raro"] },
  { chave: "11-16", nome: "Níveis 11 a 16", moedas: 25, raridade: [null, null, "Incomum", "Raro", "Muito Raro", "Lendário"] },
  { chave: "17-20", nome: "Níveis 17 a 20", moedas: 100, raridade: [null, null, "Raro", "Muito Raro", "Lendário", "Lendário"] },
];

/** Sem limite de nível, só o dado manda. */
export const SO_O_DADO: Patamar = {
  chave: "dado",
  nome: "Só o dado",
  moedas: 1,
  raridade: [null, null, "Comum", "Incomum", "Raro", "Lendário"],
};

export const MOEDAS = [
  { chave: "PC", nome: "Cobre", valor: 0.01 },
  { chave: "PP", nome: "Prata", valor: 0.1 },
  { chave: "PE", nome: "Electro", valor: 0.5 },
  { chave: "PO", nome: "Ouro", valor: 1 },
  { chave: "PL", nome: "Platina", valor: 10 },
];

// Que moedas aparecem em cada faixa: cobre no fundo do baú, platina no topo
const PESO_DAS_MOEDAS = [
  [1, 0, 0, 0, 0],
  [3, 3, 0, 1, 0],
  [1, 3, 1, 3, 0],
  [0, 1, 1, 4, 1],
  [0, 0, 1, 4, 2],
  [0, 0, 0, 3, 3],
];

export const GRUPOS_COMUNS = [
  { chave: "arma", nome: "Armas" },
  { chave: "armadura", nome: "Armaduras" },
  { chave: "aventura", nome: "Aventura" },
  { chave: "ferramenta", nome: "Ferramentas" },
] as const;

export const CATEGORIAS_MAGICAS = [
  "Anel",
  "Arma",
  "Armadura",
  "Cajado",
  "Cetro",
  "Item Maravilhoso",
  "Pergaminho",
  "Poção",
  "Varinha",
];

// ---------- O sorteio ----------

export type Pedido = {
  recipiente: string;
  moedas: string[];
  comuns: string[];
  magicos: string[];
  /** A chave do patamar, ou "dado" para só o dado mandar. */
  nivel: string;
  d20: number;
};

/** O que aparece na tela: um achado já decidido. */
export type Achado = {
  chave: string;
  nome: string;
  detalhe: string;
  raridade?: string;
  sintonia?: boolean;
  href: string;
  imagem?: string;
  /** O Pergaminho de Magia leva junto a magia escrita nele. */
  magia?: { nome: string; href: string };
};

/** Um espaço do baú: o que pode cair nele e, quando decidido, o que caiu. */
export type Vaga = {
  tipo: "magico" | "comum";
  opcoes: Opcao[];
  /** O dado da tabela, no modo de dois dados. */
  dado: number;
  escolhido?: Achado;
  aviso?: string;
};

/** Uma linha da tabela do segundo dado: de tanto a tanto, tal coisa. */
export type Opcao = { de: number; ate: number; nome: string; resolver: () => Achado };

export type Resultado = {
  faixa: Faixa;
  recipiente: Recipiente;
  moedas: { chave: string; nome: string; quantidade: number }[];
  vagas: Vaga[];
};

const entre = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const algum = <T,>(lista: T[]) => lista[Math.floor(Math.random() * lista.length)];
const embaralhar = <T,>(lista: T[]) => [...lista].sort(() => Math.random() - 0.5);

export function faixaDo(d20: number): Faixa {
  return FAIXAS.find((f) => d20 >= f.de && d20 <= f.ate) ?? FAIXAS[0];
}

/** O menor dado que dá conta da lista: d4, d6, d8, d10, d12, d20 ou d100. */
function dadoPara(n: number): number {
  return [4, 6, 8, 10, 12, 20, 100].find((d) => d >= n) ?? 100;
}

/** Divide o dado entre as opções, sem sobrar número: 1–2, 3, 4–5... */
function tabelar(nomes: { nome: string; resolver: () => Achado }[], dado: number): Opcao[] {
  const n = nomes.length;
  return nomes.map((o, i) => ({
    ...o,
    de: Math.floor((i * dado) / n) + 1,
    ate: Math.floor(((i + 1) * dado) / n),
  }));
}

export function opcaoDoDado(vaga: Vaga, valor: number): Opcao | undefined {
  return vaga.opcoes.find((o) => valor >= o.de && valor <= o.ate);
}

function moedas(pedido: Pedido, faixa: Faixa, recipiente: Recipiente, patamar: Patamar) {
  const escolhidas = MOEDAS.filter((m) => pedido.moedas.includes(m.chave));
  if (!escolhidas.length) return [];
  const iFaixa = FAIXAS.indexOf(faixa);
  const valor =
    (faixa.moedas[0] + Math.random() * (faixa.moedas[1] - faixa.moedas[0])) *
    patamar.moedas *
    recipiente.moedas;
  if (valor <= 0) return [];

  let pesos = escolhidas.map((m) => PESO_DAS_MOEDAS[iFaixa][MOEDAS.indexOf(m)]);
  if (pesos.every((p) => p === 0)) pesos = escolhidas.map(() => 1);
  const partes = pesos.map((p) => p * (0.6 + Math.random() * 0.8));
  const soma = partes.reduce((a, b) => a + b, 0);

  const saida = escolhidas
    .map((m, i) => ({
      chave: m.chave,
      nome: m.nome,
      quantidade: Math.round((valor * partes[i]) / soma / m.valor),
    }))
    .filter((m) => m.quantidade > 0);
  // Pouco demais para a moeda escolhida: sai pelo menos uma da mais barata
  if (!saida.length) {
    const barata = escolhidas[0];
    saida.push({ chave: barata.chave, nome: barata.nome, quantidade: Math.max(1, Math.round(valor / barata.valor)) });
  }
  return saida;
}

function achadoComum(a: Achavel): Achado {
  return {
    chave: a.id,
    nome: a.nome,
    detalhe: `${a.detalhe} · ${precoEscrito(a.preco)}${a.peso ? ` · ${pesoEscrito(a.peso)}` : ""}`,
    href: a.href,
    imagem: a.imagem,
  };
}

export function precoEscrito(po: number): string {
  if (po >= 1) return `${po.toLocaleString("pt-BR")} PO`;
  if (po >= 0.1) return `${Math.round(po * 10)} PP`;
  return `${Math.round(po * 100)} PC`;
}

function pesoEscrito(kg: number): string {
  return kg < 1 ? `${Math.round(kg * 1000)} g` : `${kg.toLocaleString("pt-BR")} kg`;
}

const CURAS: Record<string, string> = {
  Comum: "Poção de Cura",
  Incomum: "Poção de Cura (maior)",
  Raro: "Poção de Cura (superior)",
  "Muito Raro": "Poção de Cura (suprema)",
};

// "versão rara", não "versão raro"
const NO_FEMININO: Record<string, string> = {
  Raro: "rara",
  "Muito Raro": "muito rara",
  Lendário: "lendária",
};

const CIRCULOS_DO_PERGAMINHO: Record<string, number[]> = {
  Comum: [0, 1],
  Incomum: [2, 3],
  Raro: [4, 5],
  "Muito Raro": [6, 7, 8],
  Lendário: [9],
};

/** As armas ou armaduras comuns em que a mágica pode vir e que cabem ali. */
function basesQueCabem(item: MagicoNoBau, conteudo: Conteudo, tamanho: Tamanho): Achavel[] {
  if (!item.bases) return [];
  return conteudo.mundanos.filter(
    (a) =>
      (a.grupo === "arma" || a.grupo === "armadura" || a.detalhe === "Munição") &&
      item.bases!.some((b) => a.nome === b || a.nome.startsWith(`${b} (`)) &&
      a.tamanho <= tamanho,
  );
}

function cabe(item: MagicoNoBau, conteudo: Conteudo, tamanho: Tamanho): boolean {
  return item.bases ? basesQueCabem(item, conteudo, tamanho).length > 0 : item.tamanho <= tamanho;
}

/** Decide a versão do item: a arma de base, o +1/+2/+3, a magia do pergaminho. */
function achadoMagico(item: MagicoNoBau, raridade: string, conteudo: Conteudo, tamanho: Tamanho): Achado {
  let nome = item.nome;
  const base = item.bases ? algum(basesQueCabem(item, conteudo, tamanho)) : undefined;
  const nivel = item.raridades.indexOf(raridade) + 1;
  let magia: Achado["magia"];

  if (/\+1, \+2 ou \+3/.test(nome)) {
    const mais = `+${nivel}`;
    if (base && /^(Arma|Armadura|Munição) /.test(nome)) {
      const [nomeBase, quantos] = base.nome.split(" (");
      nome = `${nomeBase} ${mais}${quantos ? ` (${quantos}` : ""}`;
    } else {
      nome = nome.replace("+1, +2 ou +3", mais);
    }
  } else if (item.slug.startsWith("pocoes-de-cura")) {
    nome = CURAS[raridade] ?? nome;
  } else if (item.categoria === "Pergaminho") {
    const circulos = CIRCULOS_DO_PERGAMINHO[raridade] ?? [1];
    const m = algum(conteudo.magias.filter((g) => circulos.includes(g.nivel)));
    if (m) {
      nome = `Pergaminho de Magia: ${m.nome}`;
      magia = { nome: m.nome, href: `/magias/${m.slug}/` };
    }
  } else if (base) {
    nome = `${nome} (${base.nome})`;
  } else if (item.variavel) {
    nome = `${nome} (versão ${NO_FEMININO[raridade] ?? raridade.toLowerCase()})`;
  }

  const sintonia = item.sintonia ? " · exige Sintonia" : "";
  return {
    chave: `${item.slug}-${raridade}`,
    nome,
    detalhe: `${item.categoria}, ${raridade}${sintonia}`,
    raridade,
    sintonia: item.sintonia,
    href: `/itens/${item.slug}/`,
    imagem: item.imagem,
    magia,
  };
}

/** As opções de uma vaga mágica: da raridade pedida, ou a mais perto abaixo. */
function vagaMagica(pedido: Pedido, raridade: string, conteudo: Conteudo, tamanho: Tamanho): Vaga | undefined {
  const i = RARIDADES.indexOf(raridade);
  for (let r = i; r >= 0; r--) {
    const alvo = RARIDADES[r];
    const lista = conteudo.magicos.filter(
      (m) => pedido.magicos.includes(m.categoria) && m.raridades.includes(alvo) && cabe(m, conteudo, tamanho),
    );
    if (!lista.length) continue;
    const aviso =
      r < i ? `Nada ${raridade.toLowerCase()} cabia aqui, então saiu algo ${alvo.toLowerCase()}.` : undefined;
    return montarVaga("magico", lista.map((m) => ({ nome: m.nome, resolver: () => achadoMagico(m, alvo, conteudo, tamanho) })), aviso);
  }
  return undefined;
}

function vagaComum(pedido: Pedido, faixa: Faixa, conteudo: Conteudo, tamanho: Tamanho): Vaga | undefined {
  const cabem = conteudo.mundanos.filter((a) => pedido.comuns.includes(a.grupo) && a.tamanho <= tamanho);
  // Dentro do preço da faixa; se nada couber, vale qualquer coisa até o teto
  let lista = cabem.filter((a) => a.preco >= faixa.preco[0] && a.preco <= faixa.preco[1]);
  if (!lista.length) lista = cabem.filter((a) => a.preco <= faixa.preco[1]);
  if (!lista.length) return undefined;
  return montarVaga("comum", lista.map((a) => ({ nome: a.nome, resolver: () => achadoComum(a) })));
}

function montarVaga(tipo: Vaga["tipo"], nomes: { nome: string; resolver: () => Achado }[], aviso?: string): Vaga {
  // Lista maior que um d100: a tabela leva 100 delas, sorteadas
  let lista = nomes;
  if (lista.length > 100) {
    lista = embaralhar(lista).slice(0, 100);
    aviso = [aviso, `Eram ${nomes.length} opções; a tabela traz 100 delas, sorteadas.`].filter(Boolean).join(" ");
  }
  lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const dado = dadoPara(lista.length);
  return { tipo, opcoes: tabelar(lista, dado), dado, aviso };
}

/** Abre o baú: decide as moedas e as vagas. No modo de um dado, já sorteia tudo. */
export function abrir(pedido: Pedido, conteudo: Conteudo, umDado: boolean): Resultado {
  const recipiente = RECIPIENTES.find((r) => r.chave === pedido.recipiente) ?? RECIPIENTES[2];
  const faixa = faixaDo(pedido.d20);
  const patamar = PATAMARES.find((p) => p.chave === pedido.nivel) ?? SO_O_DADO;
  const raridade = patamar.raridade[FAIXAS.indexOf(faixa)];

  const total = Math.min(entre(...faixa.achados), recipiente.vagas);
  const querMagicos = raridade && pedido.magicos.length ? Math.min(entre(...faixa.magicos), total) : 0;

  const vagas: Vaga[] = [];
  for (let i = 0; i < total; i++) {
    const vaga =
      (i < querMagicos && raridade ? vagaMagica(pedido, raridade, conteudo, recipiente.tamanho) : undefined) ??
      vagaComum(pedido, faixa, conteudo, recipiente.tamanho);
    if (vaga) vagas.push(vaga);
  }
  if (umDado) {
    // Um dado: o site escolhe, sem repetir o mesmo item no mesmo baú. O aviso
    // da tabela de 100 não faz sentido aqui, porque não há tabela à vista.
    const ja = new Set<string>();
    for (const v of vagas) {
      const livres = v.opcoes.filter((o) => !ja.has(o.nome));
      const o = algum(livres.length ? livres : v.opcoes);
      ja.add(o.nome);
      v.escolhido = o.resolver();
      v.aviso = v.aviso?.replace(/ ?Eram \d+ opções; a tabela traz 100 delas, sorteadas\./, "") || undefined;
    }
  }
  return { faixa, recipiente, moedas: moedas(pedido, faixa, recipiente, patamar), vagas };
}

/** O texto para colar no Discord. */
export function textoDoResultado(r: Resultado, d20: number): string {
  const linhas = [`**${r.recipiente.nome}** · d20: ${d20} (${r.faixa.nome})`];
  if (r.moedas.length) linhas.push(`Moedas: ${r.moedas.map((m) => `${m.quantidade.toLocaleString("pt-BR")} ${m.chave}`).join(", ")}`);
  for (const v of r.vagas) {
    if (v.escolhido) linhas.push(`• ${v.escolhido.nome} (${v.escolhido.detalhe.split(" · ")[0]})`);
  }
  if (linhas.length === 1) linhas.push("Nada além de poeira.");
  return linhas.join("\n");
}
