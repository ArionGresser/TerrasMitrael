import { buscarClasse, traco } from "@/lib/classes";
import { ancora } from "@/lib/regras";
import { XP_DO_NIVEL } from "@/lib/xp";
import { HABILIDADES } from "@/lib/habilidades";
import { MAGIAS } from "@/lib/magias";
import { danoDaMagia, type MagiaDaClasse } from "@/lib/subir-de-nivel";
import type { FichaAtual } from "@/lib/personagens";

/**
 * O que a ficha viva tira da ficha do site: os máximos (PV, Dados de Vida,
 * espaços de magia por círculo) e os valores de partida (a mochila e a bolsa
 * de quando o Mestre abre a ficha viva).
 *
 * Roda só no servidor, porque a tabela de cada classe vem do disco
 * (content/classes). O banco guarda só o que muda durante o jogo.
 */

export type ItemDaMochila = { id: string; nome: string; quantidade: number };
export type Moedas = Partial<Record<"pc" | "pp" | "ce" | "po" | "pl", number>>;

export type BaseDaFicha = {
  pvMaximo: number;
  nivel: number;
  /** O XP da ficha do site (o ganho na mesa soma por cima, no banco). */
  experiencia: number;
  /** O XP do próximo nível, ou null no 20. */
  proximoNivel: number | null;
  /** O lado do Dado de Vida da classe: 8 para d8. */
  dadoDeVida: number;
  dadosDeVida: number;
  modConstituicao: number;
  /** Os valores de atributo da ficha do site, para a mesa poder ajustar. */
  atributos: { nome: string; valor: number }[];
  /** Espaços de magia por círculo: {"1": 2}. Vazio para quem não conjura. */
  espacos: Record<string, number>;
  /** Magia de Pacto (Bruxo): os espaços voltam também no Descanso Curto. */
  pacto: boolean;
  /** Os espaços de magia de cada nível, do 1 ao 20, para a subida de nível. */
  espacosPorNivel: { espacos: Record<string, number>; pacto: boolean }[];
  /** A classe pelo endereço ("bruxo"), ou null se não for do SRD. */
  classe: string | null;
  especie: string;
  /** As chaves de magias e características da ficha do site. */
  conhecidas: string[];
  /** As magias da ficha que não estão no Grimório (fora do SRD), para a subida contar com elas. */
  proprias: MagiaDaClasse[];
  /** A CA da ficha do site (a mesa pode calcular pelas regras, em ajustes.ca). */
  ca: number;
  /** O equipamento da ficha do site, para achar a armadura. */
  equipamento: string[];
  inicial: { pv: number; pvTemporarios: number; inventario: ItemDaMochila[]; moedas: Moedas };
};

const numero = (texto: string | undefined) => {
  const n = Number.parseInt((texto ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/** As células de uma linha "| a | b |" da tabela da classe. */
const celulas = (linha: string) =>
  linha
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

function espacosDaClasse(tabela: string, nivel: number): { espacos: Record<string, number>; pacto: boolean } {
  const linhas = tabela.split("\n").filter((l) => l.trim().startsWith("|"));
  const cabecalho = celulas(linhas[0] ?? "");
  const linha = linhas.map(celulas).find((c) => c[0] === String(nivel));
  if (!linha) return { espacos: {}, pacto: false };

  // Bruxo: "Espaços de magia" e "Círculo dos espaços", todos do mesmo círculo
  const iPacto = cabecalho.indexOf("Espaços de magia");
  const iCirculo = cabecalho.indexOf("Círculo dos espaços");
  if (iPacto >= 0 && iCirculo >= 0) {
    const quantos = numero(linha[iPacto]);
    const circulo = numero(linha[iCirculo]);
    return { espacos: quantos && circulo ? { [circulo]: quantos } : {}, pacto: true };
  }

  // Os outros: uma coluna por círculo, "1º" a "9º"
  const espacos: Record<string, number> = {};
  cabecalho.forEach((titulo, i) => {
    const circulo = titulo.match(/^(\d)º$/)?.[1];
    const quantos = numero(linha[i]);
    if (circulo && quantos > 0) espacos[circulo] = quantos;
  });
  return { espacos, pacto: false };
}

/** "3 rações" vira 3 de "rações"; "Corda de cânhamo, 15 m" vira 1. */
function itemDaLinha(linha: string, i: number): ItemDaMochila {
  const m = linha.match(/^(\d+)\s+(.+)$/);
  return {
    id: `inicial-${i}-${ancora(linha).slice(0, 30)}`,
    nome: m ? m[2] : linha,
    quantidade: m ? Number(m[1]) : 1,
  };
}


export function baseDaFicha(ficha: FichaAtual): BaseDaFicha {
  const nivel = Math.max(1, numero(ficha.nivel));
  const classe = buscarClasse(ancora(ficha.classe));
  const dadoDeVida = numero(classe ? traco(classe, "Dado de Pontos de Vida")?.match(/d(\d+)/)?.[0] : "") || 8;
  const { espacos, pacto } = classe ? espacosDaClasse(classe.tabela, nivel) : { espacos: {}, pacto: false };
  const constituicao = ficha.atributos.find((a) => a.nome === "Constituição");
  const pvMaximo = numero(ficha.combate.pv);

  const moedas: Moedas = {};
  for (const [tipo, valor] of Object.entries(ficha.moedas)) {
    const n = numero(valor);
    if (n > 0) moedas[tipo as keyof Moedas] = n;
  }

  return {
    pvMaximo,
    nivel,
    experiencia: numero(ficha.experiencia),
    proximoNivel: XP_DO_NIVEL[nivel] ?? null,
    dadoDeVida,
    dadosDeVida: nivel,
    modConstituicao: numero(constituicao?.modificador),
    atributos: ficha.atributos.map((a) => ({ nome: a.nome, valor: numero(a.valor) })),
    espacos,
    pacto,
    espacosPorNivel: classe ? Array.from({ length: 20 }, (_, i) => espacosDaClasse(classe.tabela, i + 1)) : [],
    classe: classe?.slug ?? null,
    especie: ficha.especie,
    conhecidas: [...ficha.magias, ...ficha.caracteristicas, ...ficha.talentos],
    ca: numero(ficha.combate.ca),
    equipamento: ficha.equipamento,
    proprias: ficha.magias.flatMap((slug) => {
      const h = HABILIDADES[slug];
      if (!h || MAGIAS.some((m) => m.slug === slug) || (h.tipo !== "truque" && h.tipo !== "magia")) return [];
      const texto = h.descricao ?? "";
      return [{ slug, nome: h.nome, nivel: h.circulo ?? (h.tipo === "truque" ? 0 : 1), ...danoDaMagia(texto) }];
    }),
    inicial: {
      pv: pvMaximo,
      pvTemporarios: numero(ficha.combate.pvTemporarios),
      inventario: ficha.equipamento.map(itemDaLinha),
      moedas,
    },
  };
}
