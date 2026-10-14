/**
 * Montar um combate a partir de um encontro: as criaturas (com PV na média
 * ou rolados), o loot de cada uma e os personagens presentes. Serve ao
 * gerador (na hora) e aos encontros prontos (preparados antes e guardados
 * no banco, ver supabase/0010-encontros-prontos.sql).
 */

import { cliente } from "@/lib/conta";
import { pvMaximoComAjustes } from "@/lib/ajustes-da-ficha";
import { comecarCombate, quantosCombates, registrar, rolarDados, versaoDaMesa, type EstadoDoCombate, type LootDaCriatura, type Lutador } from "@/lib/combate";
import { lerTodasAsFichas } from "@/lib/ficha-viva";
import { abrir, CATEGORIAS_MAGICAS, type Conteudo } from "@/lib/bau-sorteio";
import { armaDoItem } from "@/lib/ataques";
import type { CriaturaDeCombate, Grupo } from "@/lib/encontros";
import type { Sorteado } from "@/lib/encontros-fora";
import { tesouroDoBau } from "@/components/ficha-viva/DistribuirTesouro";
import type { PersonagemDoCombate } from "@/components/combate/GeradorDeEncontros";

export type ConfigDoLoot = { ligado: boolean; qualidade: number; moedas: string[]; comuns: boolean; magicos: boolean };

/** O que um encontro pronto guarda. */
export type DadosDoEncontro = {
  grupos: { slug: string; quantas: number }[];
  loot: ConfigDoLoot;
  rolarPv: boolean;
  /** O loot já sorteado e fixo: por grupo, um por criatura (null: não carrega nada). */
  lootFixo?: (LootDaCriatura | null)[][];
  dificuldade?: string;
  comoComeca?: string;
  /** Um encontro fora de combate guardado. */
  fora?: Sorteado;
};

export type EncontroPronto = { id: number; nome: string; notas: string; dados: DadosDoEncontro; criado_em: string; usado_em: string | null };

const patamarDo = (niveis: number[]) => {
  const medio = niveis.length ? niveis.reduce((a, b) => a + b, 0) / niveis.length : 1;
  return medio <= 4 ? "1-4" : medio <= 10 ? "5-10" : medio <= 16 ? "11-16" : "17-20";
};

/**
 * O loot de cada criatura, pelas faixas do Baú (o d20 é a qualidade). Fera
 * não tem bolso: só quem carrega coisas ganha loot. Uma arma do loot já
 * leva os dados dela, para trocar o ataque parecido da criatura.
 */
export async function sortearLoots(grupos: Grupo[], loot: ConfigDoLoot, niveis: number[]): Promise<(LootDaCriatura | null)[][]> {
  let conteudo: Conteudo | null = null;
  if (loot.ligado) {
    try {
      conteudo = (await (await fetch("/bau/conteudo.json")).json()) as Conteudo;
    } catch {
      conteudo = null;
    }
  }
  const armas = conteudo?.mundanos.filter((m) => m.grupo === "arma") ?? [];
  const patamar = patamarDo(niveis);
  const lootDe = (c: CriaturaDeCombate): LootDaCriatura | null => {
    if (!conteudo || c.carrega === false) return null;
    const r = abrir(
      {
        recipiente: "algibeira",
        moedas: loot.moedas,
        comuns: loot.comuns ? ["arma", "armadura", "aventura", "ferramenta"] : [],
        magicos: loot.magicos ? [...CATEGORIAS_MAGICAS] : [],
        nivel: patamar,
        d20: loot.qualidade || 1 + Math.floor(Math.random() * 20),
      },
      conteudo,
      true
    );
    const t = tesouroDoBau(r);
    return { moedas: t.moedas, itens: t.itens.map((nome) => ({ nome, arma: armaDoItem(nome, armas) })) };
  };
  return grupos.map((g) => Array.from({ length: g.quantas }, () => lootDe(g.criatura)));
}

/** Começa o combate na arena. Devolve o erro, ou null. */
export async function comecarEncontro({
  grupos,
  presentes,
  rolarPv,
  loots,
  dificuldade,
  comoComeca,
}: {
  grupos: Grupo[];
  presentes: PersonagemDoCombate[];
  rolarPv: boolean;
  loots: (LootDaCriatura | null)[][];
  dificuldade?: string;
  comoComeca?: string;
}): Promise<string | null> {
  const lutadores: Lutador[] = [];
  grupos.forEach((g, k) => {
    for (let i = 1; i <= g.quantas; i++) {
      const pv = rolarPv && g.criatura.pvDados ? rolarDados(g.criatura.pvDados) : g.criatura.pv;
      lutadores.push({
        id: `${g.criatura.slug}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        tipo: "criatura",
        slug: g.criatura.slug,
        nome: g.quantas > 1 ? `${g.criatura.nome} ${i}` : g.criatura.nome,
        iniciativa: null,
        bonusIniciativa: g.criatura.iniciativa,
        ca: g.criatura.ca,
        pv,
        pvMaximo: pv,
        xp: g.criatura.xp,
        condicoes: [],
        imagem: g.criatura.imagem,
        loot: loots[k]?.[i - 1] ?? undefined,
      });
    }
  });
  for (const p of presentes) {
    lutadores.push({
      id: p.slug,
      tipo: "personagem",
      slug: p.slug,
      nome: p.nome,
      iniciativa: null,
      bonusIniciativa: p.iniciativa,
      ca: p.ca,
      pv: 0,
      pvMaximo: p.pvMaximo,
      xp: 0,
      condicoes: [],
      imagem: p.imagem,
    });
  }
  const numero = (await quantosCombates()) + 1;
  // Rodada 0: todo mundo rola a iniciativa antes de alguém agir
  const inicio: EstadoDoCombate = { numero, rodada: 0, vez: null, lutadores, dificuldade };
  const inimigos = grupos.map((g) => (g.quantas > 1 ? `${g.quantas} ${g.criatura.nome}` : g.criatura.nome)).join(", ");
  let estado = { ...inicio, historico: registrar(inicio, `O combate começou: ${inimigos}.`) };
  if (comoComeca) estado = { ...estado, historico: registrar(estado, comoComeca) };
  // Os presentes já vêm com o PV máximo da mesa (usePersonagensDaMesa)
  const fichas = await lerTodasAsFichas();
  const pvs = Object.fromEntries(
    fichas.map((f) => [f.personagem, [f.pv, presentes.find((p) => p.slug === f.personagem)?.pvMaximo ?? pvMaximoComAjustes(f.pv, f.ajustes)] as [number, number]])
  );
  return comecarCombate(estado, versaoDaMesa(estado, pvs));
}

/** Os grupos de um encontro pronto, com as criaturas do Bestiário de volta. */
export function gruposDoPronto(dados: DadosDoEncontro, criaturas: CriaturaDeCombate[]): Grupo[] {
  return dados.grupos.flatMap((g) => {
    const criatura = criaturas.find((c) => c.slug === g.slug);
    return criatura ? [{ criatura, quantas: g.quantas }] : [];
  });
}

// ---------- No banco ----------

function erro(e: { message?: string } | null): string | null {
  return e ? e.message || "Algo deu errado." : null;
}

export async function lerEncontrosProntos(): Promise<EncontroPronto[]> {
  const sb = await cliente();
  const { data } = await sb.from("encontros_prontos").select("*").order("id", { ascending: false });
  return (data as EncontroPronto[] | null) ?? [];
}

export async function salvarEncontroPronto(nome: string, notas: string, dados: DadosDoEncontro, id?: number): Promise<string | null> {
  const sb = await cliente();
  const linha = { nome: nome.trim().slice(0, 80), notas: notas.slice(0, 4000), dados };
  const { error } = id ? await sb.from("encontros_prontos").update(linha).eq("id", id) : await sb.from("encontros_prontos").insert(linha);
  return erro(error);
}

export async function apagarEncontroPronto(id: number): Promise<string | null> {
  const sb = await cliente();
  const { error } = await sb.from("encontros_prontos").delete().eq("id", id);
  return erro(error);
}

export async function marcarProntoUsado(id: number): Promise<void> {
  const sb = await cliente();
  await sb.from("encontros_prontos").update({ usado_em: new Date().toISOString() }).eq("id", id);
}
