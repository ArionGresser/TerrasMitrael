import { PERSONAGENS_ATUAIS } from "@/lib/personagens";
import { ancora } from "@/lib/regras-ancora";
import type { PersonagemDoCombate } from "@/components/combate/GeradorDeEncontros";

const numero = (texto: string | undefined) => Number.parseInt((texto ?? "").replace(/[^\d-]/g, ""), 10) || 0;

/** As armas que usam Destreza (acuidade ou à distância), pelo nome. */
const DE_DESTREZA = /adaga|arco|besta|rapieira|cimitarra|espada curta|chicote|dardo|funda|zarabatana|azagaia/i;

type Ficha = NonNullable<(typeof PERSONAGENS_ATUAIS)[number]["meta"]["ficha"]>;

/**
 * "1d12 cortante" vira dados, tipo e o modificador do atributo; "1d4+1"
 * e "1d4 + Força" também. O bônus de ataque é proficiência mais o
 * atributo (Força, ou Destreza nas armas de acuidade e à distância).
 */
function armasDa(ficha: Ficha) {
  const mod = (nome: string) => numero(ficha.atributos.find((a) => a.nome === nome)?.modificador);
  const prof = numero(ficha.combate.bonusProficiencia);
  return (ficha.armas ?? []).flatMap((a) => {
    if (!a.dano) return [];
    const atributo = DE_DESTREZA.test(a.nome) ? Math.max(mod("Força"), mod("Destreza")) : mod("Força");
    const improvisada = /improvisad/i.test(a.observacoes ?? "");
    const dados = a.dano.match(/\d+d\d+/)?.[0] ?? "";
    const fixo = a.dano.match(/[+−-]\s*(\d+)(?!d)/);
    const tipo = a.dano.match(/(\p{L}+)\s*$/u)?.[1]?.toLowerCase() ?? "";
    return [
      {
        nome: a.nome,
        bonus: atributo + (improvisada ? 0 : prof),
        dados,
        mod: fixo ? Number(fixo[1]) * (fixo[0].startsWith("+") ? 1 : -1) : atributo,
        tipo,
        nota: a.observacoes,
      },
    ];
  });
}

/** O atributo de conjuração, com o valor da ficha, para a mesa somar os ajustes. */
function conjuracaoDa(ficha: Ficha) {
  const c = ficha.conjuracao;
  if (!c) return undefined;
  const valor = numero(ficha.atributos.find((a) => a.nome === c.atributo)?.valor);
  return { atributo: c.atributo, valor: valor || 10, mod: numero(c.modificador), cd: numero(c.cd), ataque: numero(c.ataque) };
}

/** Os personagens de 2024 com o que o encontro e o combate precisam. */
export function personagensDoCombate(): PersonagemDoCombate[] {
  return PERSONAGENS_ATUAIS.filter((p) => p.meta.ficha).map(({ meta }) => ({
    slug: meta.slug,
    nome: meta.nome,
    nivel: Math.max(1, numero(meta.ficha!.nivel)),
    ca: numero(meta.ficha!.combate.ca),
    iniciativa: numero(meta.ficha!.combate.iniciativa),
    pvMaximo: numero(meta.ficha!.combate.pv),
    imagem: meta.imagem,
    armas: armasDa(meta.ficha!),
    conjuracao: conjuracaoDa(meta.ficha!),
    atributos: meta.ficha!.atributos.map((a) => ({ nome: a.nome, valor: numero(a.valor) })),
    classe: ancora(meta.ficha!.classe),
    conhecidas: meta.ficha!.magias,
  }));
}
