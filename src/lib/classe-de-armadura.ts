/**
 * A Classe de Armadura pelas regras (SRD 5.2.1, tabela de Armaduras em
 * content/regras/equipamento.md): a armadura vestida, o Escudo, a Destreza
 * (com o limite das médias), a Defesa sem Armadura do Bárbaro e do Monge,
 * a Armadura Arcana e o bônus de um item mágico.
 *
 * Fica guardada nos ajustes da ficha viva (`ajustes.ca`): a escolha, não o
 * número. Assim a CA acompanha sozinha quando a Destreza sobe.
 */

export type TipoDeArmadura = "leve" | "média" | "pesada";

export const ARMADURAS: { nome: string; base: number; tipo: TipoDeArmadura }[] = [
  { nome: "Armadura Acolchoada", base: 11, tipo: "leve" },
  { nome: "Armadura de Couro", base: 11, tipo: "leve" },
  { nome: "Armadura de Couro Batido", base: 12, tipo: "leve" },
  { nome: "Gibão de Peles", base: 12, tipo: "média" },
  { nome: "Camisão de Malha", base: 13, tipo: "média" },
  { nome: "Brunea", base: 14, tipo: "média" },
  { nome: "Peitoral", base: 14, tipo: "média" },
  { nome: "Meia-Armadura", base: 15, tipo: "média" },
  { nome: "Cota de Anéis", base: 14, tipo: "pesada" },
  { nome: "Cota de Malha", base: 16, tipo: "pesada" },
  { nome: "Cota de Talas", base: 17, tipo: "pesada" },
  { nome: "Armadura de Placas", base: 18, tipo: "pesada" },
];

/** Como a ficha guarda a CA pelas regras. */
export type EscolhaDeCa = {
  /** O nome da armadura da tabela, ou null sem armadura. */
  armadura: string | null;
  escudo: boolean;
  /** O bônus mágico (+1, +2...) somado no total. */
  bonus: number;
  /** Armadura Arcana (ou Armadura das Sombras): 13 + Destreza sem armadura. */
  armaduraArcana?: boolean;
};

const semAcento = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** "Armadura de talas", "Armadura leve de couro", "Cota de Malha +1" → a da tabela. */
export function reconhecerArmadura(texto: string): { nome: string; bonus: number } | null {
  const t = semAcento(texto);
  const bonus = Number(t.match(/\+(\d)/)?.[1] ?? 0);
  const achar = (nome: string) => ({ nome, bonus });
  if (/placas/.test(t)) return achar("Armadura de Placas");
  if (/talas/.test(t)) return achar("Cota de Talas");
  if (/aneis/.test(t)) return achar("Cota de Anéis");
  if (/meia.?armadura/.test(t)) return achar("Meia-Armadura");
  if (/peitoral/.test(t)) return achar("Peitoral");
  if (/brunea/.test(t)) return achar("Brunea");
  if (/camisao/.test(t)) return achar("Camisão de Malha");
  if (/cota de malha/.test(t)) return achar("Cota de Malha");
  if (/peles|gibao/.test(t)) return achar("Gibão de Peles");
  if (/couro batido/.test(t)) return achar("Armadura de Couro Batido");
  if (/couro/.test(t) && /armadura/.test(t)) return achar("Armadura de Couro");
  if (/acolchoada/.test(t)) return achar("Armadura Acolchoada");
  return null;
}

const mod = (v: number) => Math.floor((v - 10) / 2);

/**
 * A CA e a conta por extenso ("Cota de Talas 17 + Escudo 2 = 19"). Os
 * atributos são os valores (não os modificadores), já com os ajustes.
 */
export function calcularCa(
  e: EscolhaDeCa,
  atributos: Record<string, number>,
  classe: string | null
): { ca: number; conta: string } {
  const des = mod(atributos.Destreza ?? 10);
  const partes: string[] = [];
  let ca: number;
  const armadura = e.armadura ? ARMADURAS.find((a) => a.nome === e.armadura) : undefined;
  const sinal = (n: number) => (n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`);

  if (armadura) {
    const d = armadura.tipo === "leve" ? des : armadura.tipo === "média" ? Math.min(des, 2) : 0;
    ca = armadura.base + d;
    partes.push(`${armadura.nome} ${armadura.base}`);
    if (armadura.tipo !== "pesada") partes.push(`${sinal(d)} Destreza${armadura.tipo === "média" && des > 2 ? " (máx. 2)" : ""}`);
  } else if (e.armaduraArcana) {
    ca = 13 + des;
    partes.push(`Armadura Arcana 13 ${sinal(des)} Destreza`);
  } else if (classe === "barbaro") {
    const con = mod(atributos.Constituição ?? 10);
    ca = 10 + des + con;
    partes.push(`Defesa sem Armadura 10 ${sinal(des)} Destreza ${sinal(con)} Constituição`);
  } else if (classe === "monge" && !e.escudo) {
    const sab = mod(atributos.Sabedoria ?? 10);
    ca = 10 + des + sab;
    partes.push(`Defesa sem Armadura 10 ${sinal(des)} Destreza ${sinal(sab)} Sabedoria`);
  } else {
    ca = 10 + des;
    partes.push(`Sem armadura 10 ${sinal(des)} Destreza`);
  }
  if (e.escudo) {
    ca += 2;
    partes.push("+ Escudo 2");
  }
  if (e.bonus) {
    ca += e.bonus;
    partes.push(`+ ${e.bonus} mágico`);
  }
  return { ca, conta: `${partes.join(" ")} = ${ca}` };
}

/** A escolha que combina com o equipamento da ficha (o primeiro item que parece armadura). */
export function escolhaDaFicha(equipamento: string[], conhecidas: string[]): EscolhaDeCa {
  let armadura: string | null = null;
  let bonus = 0;
  for (const item of equipamento) {
    const a = reconhecerArmadura(item);
    if (a) {
      armadura = a.nome;
      bonus = a.bonus;
      break;
    }
  }
  return {
    armadura,
    escudo: equipamento.some((i) => /\bescudo\b/i.test(i)),
    bonus,
    armaduraArcana: !armadura && conhecidas.includes("armadura-das-sombras"),
  };
}
