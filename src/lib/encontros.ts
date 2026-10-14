/**
 * Montar encontros de combate pelas regras de 2024 (SRD 5.2.1).
 *
 * Cada personagem do grupo traz um orçamento de XP pelo nível e pela
 * dificuldade (Baixa, Moderada ou Alta). A soma é o orçamento do encontro, e
 * a soma do XP das criaturas não deve passar dele. Nas regras de 2024 não
 * existe mais o multiplicador pela quantidade de criaturas.
 *
 * Roda no navegador: recebe a lista resumida das criaturas pronta
 * (ver monstrosParaEncontros em monstros-combate.ts).
 */

export type Dificuldade = "baixa" | "moderada" | "alta";

export const DIFICULDADES: { chave: Dificuldade; nome: string; texto: string }[] = [
  { chave: "baixa", nome: "Baixa", texto: "Dá trabalho, mas o grupo sai inteiro." },
  { chave: "moderada", nome: "Moderada", texto: "Pode custar recursos e deixar alguém caído." },
  { chave: "alta", nome: "Alta", texto: "Pode matar um ou mais personagens." },
];

/** XP por personagem, por nível (1 a 20): [Baixa, Moderada, Alta]. */
const ORCAMENTO_POR_NIVEL: [number, number, number][] = [
  [50, 75, 100],
  [100, 150, 200],
  [150, 225, 400],
  [250, 375, 500],
  [500, 750, 1100],
  [600, 1000, 1400],
  [750, 1300, 1700],
  [1000, 1700, 2100],
  [1300, 2000, 2600],
  [1600, 2300, 3100],
  [1900, 2900, 4100],
  [2200, 3700, 4700],
  [2600, 4200, 5400],
  [2900, 4900, 6200],
  [3300, 5400, 7800],
  [3800, 6100, 9800],
  [4500, 7200, 11700],
  [5000, 8700, 14200],
  [5500, 10700, 17200],
  [6400, 13200, 22000],
];

const INDICE: Record<Dificuldade, 0 | 1 | 2> = { baixa: 0, moderada: 1, alta: 2 };

export function orcamento(niveis: number[], dificuldade: Dificuldade): number {
  return niveis.reduce((soma, n) => soma + (ORCAMENTO_POR_NIVEL[Math.min(20, Math.max(1, n)) - 1]?.[INDICE[dificuldade]] ?? 0), 0);
}

/** Onde um total de XP cai para este grupo: abaixo de Baixa, Baixa, Moderada, Alta ou acima. */
export function dificuldadeDe(xp: number, niveis: number[]): { nome: string; acima: boolean } {
  const [b, m, a] = (["baixa", "moderada", "alta"] as const).map((d) => orcamento(niveis, d));
  if (xp > a) return { nome: "Acima de Alta", acima: true };
  if (xp > m) return { nome: "Alta", acima: false };
  if (xp > b) return { nome: "Moderada", acima: false };
  if (xp > 0) return { nome: "Baixa", acima: false };
  return { nome: "Vazio", acima: false };
}

/** Uma criatura do bestiário com o que o combate precisa. */
export type CriaturaDeCombate = {
  slug: string;
  nome: string;
  tipo: string;
  fonte: "monstro" | "animal";
  nd: string;
  ndNumero: number;
  xp: number;
  ca: number;
  pv: number;
  /** "20d10 + 40", para rolar os PV em vez de usar a média. */
  pvDados: string;
  iniciativa: number;
  imagem?: string;
  /**
   * Se a criatura carrega coisas (✦ regra da casa): quem tem Equipamento na
   * ficha ou pensa (Inteligência 5 ou mais, fora feras, enxames, gosmas e
   * plantas) leva moedas e itens; o resto só vale o XP. Um lobo não tem bolso.
   */
  carrega?: boolean;
};

export type Filtros = {
  tipos: string[];
  /** Uma família (ver FAMILIAS): só esqueletos, só o que é do fogo. */
  familia?: string;
  /** Um pedaço do nome: "zumbi", "dragão vermelho". */
  nomeContem?: string;
  /** Só monstros, só animais ou os dois. */
  fonte: "todos" | "monstro" | "animal";
  ndMaximo: number;
  /** Quantas criaturas, no máximo. */
  maximo: number;
};

/**
 * Famílias de criaturas que atravessam os tipos do Bestiário: dentro de
 * Morto-Vivo há esqueletos, zumbis e espíritos; "do fogo" junta elemental,
 * salamandra, efreeti e magmin. Pelo nome, para valer em qualquer tipo.
 */
export const FAMILIAS: { nome: string; padrao: RegExp }[] = [
  { nome: "Esqueletos", padrao: /Esqueleto/ },
  { nome: "Zumbis", padrao: /Zumbi/ },
  { nome: "Vampiros", padrao: /Vampir/ },
  { nome: "Múmias", padrao: /Múmia/ },
  { nome: "Espíritos", padrao: /Aparição|Espectro|Fantasma|Sombra|Fogo-Fátuo/ },
  { nome: "Carniçais", padrao: /Carniçal|Lívido/ },
  { nome: "Do fogo", padrao: /Fogo|Magma|Magmin|Salamandra|Efreeti|Azer|Infernal|Vermelho/ },
  { nome: "Do gelo", padrao: /Gelo|Inverno|Branco/ },
  { nome: "Da água", padrao: /Água|Vapor|Tritão|Mar\b|Sahuagin|Merrow|Kraken/ },
  { nome: "Do ar", padrao: /Elemental do Ar|Djinni|Perseguidor Invisível|Mefite do Pó|Azul/ },
  { nome: "Da terra", padrao: /Terra|Gárgula|Xorn|Pedra/ },
  { nome: "Diabos", padrao: /Diabo|Diabrete|Lêmure|Erínia/ },
  { nome: "Demônios", padrao: /Balor|Dretch|Glabrezu|Hezrou|Marilith|Nalfeshnee|Quasit|Vrock/ },
  { nome: "Dragões", padrao: /Dragão|Serpe/ },
  { nome: "Goblinoides", padrao: /Goblin|Bugbear/ },
  { nome: "Gigantes e trolls", padrao: /Gigante|Troll|Ogro|Ettin/ },
  { nome: "Golens e animados", padrao: /Golem|Animad|Guardião Escudo/ },
  { nome: "Licantropos", padrao: /Homem-|Lobisomem/ },
  { nome: "Bandidos e piratas", padrao: /Bandido|Pirata|Brutamontes/ },
  { nome: "Cultistas", padrao: /Cultista|Sacerdote/ },
  { nome: "Soldados e guardas", padrao: /Guarda|Cavaleiro|Infantaria|Veterano|Gladiador|Soldado/ },
  { nome: "Lobos", padrao: /Lobo|Worg|Chacal/ },
  { nome: "Aranhas e insetos", padrao: /Aranha|Escorpião|Centopeia|Vespa|Besouro|Ettercap|Drider/ },
  { nome: "Ursos", padrao: /Urso/ },
  { nome: "Serpentes", padrao: /Serpente|Cobra|Víbora|Naga/ },
];

const normal = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Se a criatura passa no filtro de família e de nome. */
export function passaNoNome(c: { nome: string }, filtros: Pick<Filtros, "familia" | "nomeContem">): boolean {
  const familia = filtros.familia ? FAMILIAS.find((f) => f.nome === filtros.familia) : undefined;
  if (familia && !familia.padrao.test(c.nome)) return false;
  const pedaco = filtros.nomeContem?.trim();
  return !pedaco || normal(c.nome).includes(normal(pedaco));
}

/** Uma linha do encontro: a criatura e quantas vêm. */
export type Grupo = { criatura: CriaturaDeCombate; quantas: number };

export const xpDoEncontro = (grupos: Grupo[]) => grupos.reduce((s, g) => s + g.criatura.xp * g.quantas, 0);

const algum = <T>(lista: T[]) => lista[Math.floor(Math.random() * lista.length)];

/**
 * Sorteia um encontro que use entre 70% e 100% do orçamento. Escolhe uma
 * criatura principal e às vezes acompanhantes mais fracos do mesmo tipo, repetindo a
 * mesma criatura em grupo (como uma matilha) em vez de misturar dez tipos.
 * Tenta algumas vezes e fica com o que chegou mais perto.
 */
export function sortearEncontro(todas: CriaturaDeCombate[], limite: number, filtros: Filtros): Grupo[] {
  const cabem = todas.filter(
    (c) =>
      c.xp > 0 &&
      c.xp <= limite &&
      c.ndNumero <= filtros.ndMaximo &&
      (filtros.fonte === "todos" || c.fonte === filtros.fonte) &&
      (!filtros.tipos.length || filtros.tipos.includes(c.tipo)) &&
      passaNoNome(c, filtros)
  );
  if (!cabem.length || limite <= 0) return [];

  let melhor: Grupo[] = [];
  let melhorXp = 0;
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    const grupos: Grupo[] = [];
    let resto = limite;
    let total = 0;

    // A principal: de preferência uma que gaste boa parte do orçamento
    const fortes = cabem.filter((c) => c.xp >= limite * 0.25);
    const principal = algum(fortes.length && Math.random() < 0.7 ? fortes : cabem);
    const quantas = Math.max(1, Math.min(filtros.maximo, Math.floor(resto / principal.xp), 1 + Math.floor(Math.random() * 4)));
    grupos.push({ criatura: principal, quantas });
    resto -= principal.xp * quantas;
    total += quantas;

    // Acompanhantes, se sobrar orçamento e couber mais gente
    for (let i = 0; i < 2 && total < filtros.maximo; i++) {
      // Do mesmo tipo da principal: mortos-vivos andam com mortos-vivos
      // Com família escolhida, a família já manda: esqueletos andam com esqueletos
      const menores = cabem.filter(
        (c) => c.xp <= resto && c.slug !== principal.slug && c.xp < principal.xp && (filtros.familia || c.tipo === principal.tipo)
      );
      if (!menores.length || resto < limite * 0.15 || Math.random() < 0.4) break;
      const c = algum(menores);
      const q = Math.max(1, Math.min(filtros.maximo - total, Math.floor(resto / c.xp), 1 + Math.floor(Math.random() * 3)));
      grupos.push({ criatura: c, quantas: q });
      resto -= c.xp * q;
      total += q;
    }

    const xp = limite - resto;
    if (xp > melhorXp) {
      melhor = grupos;
      melhorXp = xp;
    }
    if (xp >= limite * 0.7) break;
  }
  return melhor;
}

// ---------- Para o combate ----------

/** "+7 (17)" → 7; "150 (20d10 + 40)" → 150 e "20d10 + 40"; "5.900 (ou ...)" → 5900. */
export const lerNumero = (texto: string) => {
  const m = texto.replace(/−/g, "-").match(/^[+-]?[\d.]+/);
  return m ? Number(m[0].replace(/\./g, "")) : 0;
};

export const lerDadosDePv = (texto: string) => texto.match(/\(([^)]+)\)/)?.[1] ?? "";

/** O estado que os jogadores veem, sem número de PV das criaturas. */
export function estadoDosPv(pv: number, maximo: number): "Ileso" | "Ferido" | "Muito ferido" | "Caído" {
  if (pv <= 0) return "Caído";
  if (pv >= maximo) return "Ileso";
  return pv > maximo / 2 ? "Ferido" : "Muito ferido";
}
