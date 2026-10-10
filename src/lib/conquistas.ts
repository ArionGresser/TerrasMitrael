/**
 * As conquistas: pequenos feitos que dá para realizar pelo site.
 *
 * Por enquanto tudo fica guardado só neste navegador (localStorage). Quando
 * existir conta, é daqui que as conquistas sobem para ela: a lista e as
 * datas já estão no formato de levar.
 *
 * Muitas vêm em degraus, bronze, prata e ouro: bater na madeira uma vez,
 * depois 30, depois 300. Os degraus de um feito dividem o mesmo contador
 * (`contador`), e cada um só aparece quando o anterior foi conquistado
 * (`requer`). O que já foi contado antes vale: quem bateu 40 vezes ganha o
 * bronze e a prata de uma vez.
 *
 * As mais difíceis trazem prêmio (`premio`): uma luva nova para o cursor
 * ou um d20 novo para a mesa. Sem a conquista, a luva e o dado ficam
 * trancados (ver `liberado`).
 *
 * Três jeitos de conquistar:
 * - `conquistar(chave)`: o feito é um instante (rolar o dado na bandeja);
 * - `contar(contador)`: o feito é repetir até o alvo (rolar 25 vezes);
 * - `marcar(contador, item)`: o feito é juntar coisas diferentes até o alvo
 *   (abrir 5 lugares do mapa, ler 3 livros das Crônicas).
 *
 * Quem conquista avisa a página com o evento `mitrael:conquista`, e o aviso
 * na tela (AvisoDeConquista) mostra e toca o som. Quem chama não precisa
 * saber de nada disso.
 */

export type Icone = "dado" | "moeda" | "vela" | "mao" | "livro" | "mapa" | "bau" | "martelo" | "adaga" | "chave";
export type Nivel = "bronze" | "prata" | "ouro";
export type Premio = { tipo: "mao" | "dado"; chave: string };

export type Conquista = {
  chave: string;
  nome: string;
  descricao: string;
  icone: Icone;
  nivel: Nivel;
  /** O contador que este feito divide com os outros degraus dele. */
  contador?: string;
  /** Quantas vezes ou quantas coisas diferentes, no contador. */
  alvo?: number;
  /** O degrau anterior: este só aparece depois dele. */
  requer?: string;
  /** Só dá para fazer na mesa das laterais, que existe no computador. O
   *  d20 não entra aqui: ele também rola na mesa do celular. */
  mesa?: boolean;
  premio?: Premio;
};

export const CONQUISTAS: Conquista[] = [
  // Bater na madeira
  { chave: "batidas-bronze", nome: "Toc", descricao: "Bata na madeira da mesa.", icone: "mao", nivel: "bronze", contador: "batidas", alvo: 1 },
  { chave: "batidas", nome: "Toc, toc", descricao: "Bata na madeira da mesa 30 vezes.", icone: "mao", nivel: "prata", contador: "batidas", alvo: 30, requer: "batidas-bronze", premio: { tipo: "mao", chave: "nua" } },
  { chave: "batidas-ouro", nome: "Marceneiro", descricao: "Bata na madeira da mesa 300 vezes.", icone: "mao", nivel: "ouro", contador: "batidas", alvo: 300, requer: "batidas", premio: { tipo: "mao", chave: "manopla" } },

  // Rolar o d20
  { chave: "primeiro-dado", nome: "Os dados estão lançados", descricao: "Role o d20 da mesa.", icone: "dado", nivel: "bronze", contador: "rolador", alvo: 1 },
  { chave: "rolador", nome: "Rolador compulsivo", descricao: "Role o d20 da mesa 25 vezes.", icone: "dado", nivel: "prata", contador: "rolador", alvo: 25, requer: "primeiro-dado", premio: { tipo: "dado", chave: "osso" } },
  { chave: "rolador-ouro", nome: "Viciado em dados", descricao: "Role o d20 da mesa 100 vezes.", icone: "dado", nivel: "ouro", contador: "rolador", alvo: 100, requer: "rolador", premio: { tipo: "dado", chave: "ametista" } },

  // Vinte natural
  { chave: "vinte-natural", nome: "Vinte natural", descricao: "Tire 20 no d20 da mesa.", icone: "dado", nivel: "bronze", contador: "vintes", alvo: 1, premio: { tipo: "dado", chave: "esmeralda" } },
  { chave: "vinte-natural-prata", nome: "Abençoado", descricao: "Tire 20 no d20 da mesa 3 vezes.", icone: "dado", nivel: "prata", contador: "vintes", alvo: 3, requer: "vinte-natural" },
  { chave: "vinte-natural-ouro", nome: "Escolhido do destino", descricao: "Tire 20 no d20 da mesa 10 vezes.", icone: "dado", nivel: "ouro", contador: "vintes", alvo: 10, requer: "vinte-natural-prata", premio: { tipo: "dado", chave: "magma" } },

  // Falha crítica
  { chave: "falha-critica", nome: "Falha crítica", descricao: "Tire 1 no d20 da mesa. Acontece com os melhores.", icone: "dado", nivel: "bronze", contador: "uns", alvo: 1 },
  { chave: "falha-critica-prata", nome: "Amaldiçoado", descricao: "Tire 1 no d20 da mesa 5 vezes.", icone: "dado", nivel: "prata", contador: "uns", alvo: 5, requer: "falha-critica", premio: { tipo: "mao", chave: "esqueleto" } },

  // Jogar moedas
  { chave: "moedas-bronze", nome: "Cara ou coroa", descricao: "Pegue uma moeda da mesa e jogue.", icone: "moeda", nivel: "bronze", contador: "moedas", alvo: 1, mesa: true },
  { chave: "moedas", nome: "Mão aberta", descricao: "Jogue 20 moedas pela mesa.", icone: "moeda", nivel: "prata", contador: "moedas", alvo: 20, requer: "moedas-bronze", mesa: true, premio: { tipo: "mao", chave: "sem-dedos" } },
  { chave: "moedas-ouro", nome: "Chuva de ouro", descricao: "Jogue 100 moedas pela mesa.", icone: "moeda", nivel: "ouro", contador: "moedas", alvo: 100, requer: "moedas", mesa: true, premio: { tipo: "dado", chave: "rubi" } },

  // Ler os Contos
  { chave: "leitor", nome: "Até a última página", descricao: "Leia um livro das Crônicas até a última página.", icone: "livro", nivel: "bronze", contador: "leitor", alvo: 1 },
  { chave: "leitor-prata", nome: "Rato de biblioteca", descricao: "Leia 3 livros das Crônicas até a última página.", icone: "livro", nivel: "prata", contador: "leitor", alvo: 3, requer: "leitor", premio: { tipo: "dado", chave: "safira" } },
  { chave: "leitor-ouro", nome: "Cronista de Mitrael", descricao: "Leia 6 livros das Crônicas até a última página.", icone: "livro", nivel: "ouro", contador: "leitor", alvo: 6, requer: "leitor-prata" },

  // Explorar o mapa
  { chave: "explorador-bronze", nome: "Primeiro passo", descricao: "Abra um lugar ou uma região no mapa.", icone: "mapa", nivel: "bronze", contador: "explorador", alvo: 1 },
  { chave: "explorador", nome: "Explorador", descricao: "Abra 5 lugares ou regiões diferentes no mapa.", icone: "mapa", nivel: "prata", contador: "explorador", alvo: 5, requer: "explorador-bronze" },
  { chave: "explorador-ouro", nome: "Cartógrafo", descricao: "Abra 12 lugares ou regiões diferentes no mapa.", icone: "mapa", nivel: "ouro", contador: "explorador", alvo: 12, requer: "explorador", premio: { tipo: "mao", chave: "draconato" } },

  // Os de um passo só
  { chave: "na-bandeja", nome: "Dentro da bandeja", descricao: "Faça o d20 parar dentro da bandeja de dados.", icone: "dado", nivel: "bronze", mesa: true },
  { chave: "sopro", nome: "Sopro na vela", descricao: "Faça a chama de uma vela tremer.", icone: "vela", nivel: "bronze", mesa: true },
  { chave: "adaga", nome: "Curiosidade mórbida", descricao: "Mexa na adaga ensanguentada.", icone: "adaga", nivel: "bronze", mesa: true },
  { chave: "ferro", nome: "Ferro batido", descricao: "Bata numa das ferragens de ferro da mesa.", icone: "martelo", nivel: "bronze" },
  { chave: "bau-vinte", nome: "Sorte de saqueador", descricao: "Tire 20 no Baú do Mestre com o botão de rolar.", icone: "bau", nivel: "prata", premio: { tipo: "mao", chave: "goblin" } },
  { chave: "moeda-em-pe", nome: "Equilíbrio impossível", descricao: "Deixe uma moeda parada em pé, de lado, na mesa.", icone: "moeda", nivel: "ouro", mesa: true, premio: { tipo: "mao", chave: "mago" } },
];

/** O que todo mundo tem desde o começo, sem conquista nenhuma. */
const DE_GRACA: Record<Premio["tipo"], string[]> = { mao: ["couro", "sistema"], dado: ["preto"] };

const CHAVE_FEITAS = "mitrael:conquistas";
const CHAVE_CONTAS = "mitrael:contadores";
const CHAVE_MARCAS = "mitrael:marcas";
export const EVENTO = "mitrael:conquista";

function ler<T>(chave: string, vazio: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : vazio;
  } catch {
    return vazio;
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Navegação privada ou armazenamento cheio: vale até fechar a aba
  }
}

/** As conquistas já feitas, com a data (ISO) de cada uma. */
export function conquistadas(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return ler<Record<string, string>>(CHAVE_FEITAS, {});
}

/** Quanto já foi feito: a contagem ou o número de coisas diferentes juntadas. */
export function progresso(chave: string): number {
  if (typeof window === "undefined") return 0;
  const contador = CONQUISTAS.find((c) => c.chave === chave)?.contador ?? chave;
  const marcas = ler<Record<string, string[]>>(CHAVE_MARCAS, {});
  if (marcas[contador]) return marcas[contador].length;
  return ler<Record<string, number>>(CHAVE_CONTAS, {})[contador] ?? 0;
}

/** Um degrau só aparece depois do anterior. */
export function visivel(c: Conquista, feitas: Record<string, string>) {
  return !c.requer || Boolean(feitas[c.requer]);
}

/** Se a luva ou o dado já está liberado para quem está no site. */
export function liberado(tipo: Premio["tipo"], chave: string): boolean {
  if (DE_GRACA[tipo].includes(chave)) return true;
  if (typeof window === "undefined") return false;
  const feitas = conquistadas();
  return CONQUISTAS.some((c) => c.premio?.tipo === tipo && c.premio.chave === chave && feitas[c.chave]);
}

/** A conquista que libera uma luva ou um dado. */
export function quemLibera(tipo: Premio["tipo"], chave: string): Conquista | undefined {
  return CONQUISTAS.find((c) => c.premio?.tipo === tipo && c.premio.chave === chave);
}

export function conquistar(chave: string) {
  if (typeof window === "undefined") return;
  const conquista = CONQUISTAS.find((c) => c.chave === chave);
  if (!conquista) return;
  const feitas = conquistadas();
  if (feitas[chave]) return;
  feitas[chave] = new Date().toISOString();
  gravar(CHAVE_FEITAS, feitas);
  window.dispatchEvent(new CustomEvent<Conquista>(EVENTO, { detail: conquista }));
}

/** Confere os degraus de um contador, do mais fácil ao mais difícil. */
function conferir(contador: string, quanto: number) {
  const degraus = CONQUISTAS.filter((c) => c.contador === contador).sort((a, b) => (a.alvo ?? 1) - (b.alvo ?? 1));
  for (const c of degraus) {
    if (quanto < (c.alvo ?? 1)) break;
    if (c.requer && !conquistadas()[c.requer]) break;
    conquistar(c.chave);
  }
}

export function contar(contador: string) {
  if (typeof window === "undefined") return;
  const contas = ler<Record<string, number>>(CHAVE_CONTAS, {});
  contas[contador] = (contas[contador] ?? 0) + 1;
  gravar(CHAVE_CONTAS, contas);
  conferir(contador, contas[contador]);
}

export function marcar(contador: string, item: string) {
  if (typeof window === "undefined") return;
  const marcas = ler<Record<string, string[]>>(CHAVE_MARCAS, {});
  const lista = marcas[contador] ?? [];
  if (!lista.includes(item)) {
    lista.push(item);
    marcas[contador] = lista;
    gravar(CHAVE_MARCAS, marcas);
  }
  conferir(contador, lista.length);
}
