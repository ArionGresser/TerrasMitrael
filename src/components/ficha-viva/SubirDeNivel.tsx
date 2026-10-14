"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import type { FichaViva } from "@/lib/ficha-viva";
import { ancora } from "@/lib/regras-ancora";
import { ATRIBUTOS, atributoDasSubidas, modificador, type AjustesDaFicha } from "@/lib/ajustes-da-ficha";
import { rolarDados } from "@/lib/combate";
import {
  aMais,
  atributosDoTalento,
  circuloMaximo,
  invocacoesQueTem,
  magiasQueTem,
  mudancasDaTabela,
  oQueChega,
  pedemEscolhaLivre,
  porQueNao,
  proficienciaDo,
  pvMedio,
  type DadosDeNivel,
  type Escolha,
  type SubidaDeNivel,
  type Troca,
} from "@/lib/subir-de-nivel";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import { Janela } from "./Janela";
import { TextoSimples } from "./TextoSimples";
import type { AcoesDaFicha } from "./PainelDaFicha";

type Comum = {
  fazer: (acao: () => Promise<string | null>, sucesso?: string) => Promise<boolean>;
  acoes: AcoesDaFicha;
  ocupado: boolean;
};

const ROTULO = "font-titulo text-tinta-900 text-sm font-semibold";
const SECAO = "border-dourado-600/30 border-t pt-4";

/**
 * O bloco "Nível" da ficha: diz se dá para subir, abre o passo a passo,
 * mostra o que cada subida deu e desfaz a última. O jogador sobe quando o
 * XP basta ou o Mestre libera; o Mestre sobe quando quiser.
 */
export function NivelDaFicha({ ficha, base, mestre, fazer, acoes, ocupado }: Comum & { ficha: FichaViva; base: BaseDaFicha; mestre: boolean }) {
  const [aberta, setAberta] = useState(false);
  const [desfazendo, setDesfazendo] = useState(false);
  const ajustes: AjustesDaFicha = ficha.ajustes ?? {};
  const subidas = ajustes.niveis ?? [];
  const total = base.experiencia + (ficha.experiencia_ganha ?? 0);
  const proximo = base.nivel + 1;
  const porXp = base.proximoNivel !== null && total >= base.proximoNivel;
  const liberado = (ajustes.liberado ?? 0) >= proximo;
  const podeSubir = base.nivel < 20 && !!base.classe && (porXp || liberado || mestre);
  const ultima = subidas.at(-1);

  async function liberar() {
    await fazer(() => acoes.mudar({ ajustes: { ...ajustes, liberado: proximo } }), `O nível ${proximo} está liberado para o jogador.`);
  }

  async function desfazer() {
    if (!ultima) return;
    const pvMaximo = base.pvMaximo - ultima.pv;
    const ok = await fazer(
      () => acoes.mudar({ ajustes: { ...ajustes, niveis: subidas.slice(0, -1) }, pv: Math.min(ficha.pv, pvMaximo) }),
      `A subida para o nível ${ultima.nivel} foi desfeita.`
    );
    if (ok) setDesfazendo(false);
  }

  async function salvar(subida: SubidaDeNivel) {
    const ok = await fazer(
      () => acoes.mudar({ ajustes: { ...ajustes, niveis: [...subidas, subida] }, pv: ficha.pv + subida.pv }),
      `Nível ${subida.nivel}! +${subida.pv} PV máximo, e os PV atuais subiram junto.`
    );
    if (ok) setAberta(false);
  }

  let situacao: string;
  if (base.nivel >= 20) situacao = "Nível máximo.";
  else if (!base.classe) situacao = "A classe desta ficha não está no SRD. Suba pelo \"Ajustar PV máximo e atributos\" e anote o resto.";
  else if (porXp) situacao = `O XP já dá para o nível ${proximo}.`;
  else if (liberado) situacao = `O Mestre liberou o nível ${proximo}.`;
  else if (mestre) situacao = `Pelo XP, ainda não. Você pode subir assim mesmo ou liberar para o jogador.`;
  else situacao = `Ainda não: falta XP, ou o Mestre libera o nível ${proximo}.`;

  return (
    <div className="mt-6">
      <h4 className="font-titulo text-tinta-500 text-xs font-semibold tracking-[0.16em] uppercase">Nível</h4>
      <p className="text-tinta-700 mt-2 text-sm">
        <strong className="font-titulo text-tinta-900 text-lg">Nível {base.nivel}</strong>
        <span className="ml-2">{situacao}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {podeSubir ? (
          <button type="button" disabled={ocupado} onClick={() => setAberta(true)} className={BOTAO_CHEIO}>
            ⬆ Subir para o nível {proximo}
          </button>
        ) : null}
        {mestre && !porXp && !liberado && base.nivel < 20 && base.classe ? (
          <button type="button" disabled={ocupado} onClick={() => void liberar()} className={BOTAO}>
            Liberar o nível {proximo} para o jogador
          </button>
        ) : null}
      </div>

      {subidas.length ? (
        <div className="mt-4">
          <GanhoNaMesa subidas={subidas} classe={base.classe} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {desfazendo ? (
              <>
                <span className="text-tinta-700 text-sm">Desfazer a subida para o nível {ultima!.nivel}?</span>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => void desfazer()}
                  className={`${BOTAO} border-heraldico-vermelho text-heraldico-vermelho min-h-10 px-3 text-xs`}
                >
                  Sim, desfazer
                </button>
                <button type="button" onClick={() => setDesfazendo(false)} className={`${BOTAO} min-h-10 px-3 text-xs`}>
                  Não
                </button>
              </>
            ) : (
              <button type="button" disabled={ocupado} onClick={() => setDesfazendo(true)} className={`${BOTAO} min-h-10 px-3 text-xs`}>
                ↶ Desfazer a subida para o nível {ultima!.nivel}
              </button>
            )}
          </div>
        </div>
      ) : null}

      <Janela aberta={aberta} aoFechar={() => setAberta(false)} titulo={`Subir para o nível ${proximo}`} larga>
        {base.classe ? (
          <PassoAPasso ficha={ficha} base={base} mestre={mestre} ocupado={ocupado} salvar={salvar} cancelar={() => setAberta(false)} />
        ) : null}
      </Janela>
    </div>
  );
}

/** O que cada subida da mesa deu, para quem olha a ficha. */
export function GanhoNaMesa({ subidas, classe }: { subidas: SubidaDeNivel[]; classe: string | null }) {
  return (
    <div>
      <p className={ROTULO}>Ganho na mesa</p>
      <ol className="mt-1 space-y-1.5 text-sm">
        {subidas.map((s) => (
          <li key={s.nivel} className="text-tinta-700">
            <strong className="text-tinta-900">Nível {s.nivel}:</strong> +{s.pv} PV ({s.dado === "media" ? "média" : "rolado"})
            {s.atributos
              ? Object.entries(s.atributos).map(([a, v]) => (
                  <span key={a}>
                    , {a} +{v}
                  </span>
                ))
              : null}
            {s.escolhas.map((e, i) => (
              <span key={i}>
                , <NomeDaEscolha e={e} classe={classe} />
              </span>
            ))}
            {(s.trocas ?? []).map((t, i) => (
              <span key={`t${i}`}>
                , trocou {t.de} por {t.para}
              </span>
            ))}
            <span className="text-tinta-500 text-xs">
              {" "}
              · {s.por === "mestre" ? "pelo Mestre" : "pelo jogador"}, {new Date(s.em).toLocaleDateString("pt-BR")}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function NomeDaEscolha({ e, classe }: { e: Escolha; classe: string | null }) {
  const link = "text-heraldico-vermelho underline underline-offset-2";
  switch (e.tipo) {
    case "invocacao":
      return (
        <>
          invocação{" "}
          <Link href={`/classes/${classe ?? "bruxo"}/#${ancora(e.nome)}`} className={link}>
            {e.nome}
          </Link>
          {e.truque ? ` (${e.truque})` : ""}
        </>
      );
    case "truque":
    case "magia":
      return (
        <>
          {e.tipo === "truque" ? "truque" : "magia"}{" "}
          <Link href={`/magias/${e.slug}/`} className={`${link} italic`}>
            {e.nome}
          </Link>
        </>
      );
    case "talento":
      return (
        <>
          talento{" "}
          <Link href={`/regras/talentos/#${e.id}`} className={link}>
            {e.nome}
          </Link>
          {e.atributo ? ` (+1 ${e.atributo})` : ""}
        </>
      );
    case "subclasse":
      return <>subclasse {e.nome}</>;
    case "nota":
      return (
        <>
          {e.titulo}: <em>{e.texto}</em>
        </>
      );
  }
}

// ---------- O passo a passo ----------

type ModoAsi = "dois" | "um-um" | "talento";

function PassoAPasso({
  ficha,
  base,
  mestre,
  ocupado,
  salvar,
  cancelar,
}: {
  ficha: FichaViva;
  base: BaseDaFicha;
  mestre: boolean;
  ocupado: boolean;
  salvar: (s: SubidaDeNivel) => Promise<void>;
  cancelar: () => void;
}) {
  const id = useId();
  const [dados, setDados] = useState<DadosDeNivel | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch(`/classes/${base.classe}/niveis.json`)
      .then((r) => (r.ok ? (r.json() as Promise<DadosDeNivel>) : Promise.reject()))
      .then((d) => vivo && setDados(d))
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
    };
  }, [base.classe]);

  const N = base.nivel + 1;
  const subidas = useMemo(() => ficha.ajustes?.niveis ?? [], [ficha.ajustes]);

  // Escolhas
  const [dado, setDado] = useState<"media" | "rolado">("media");
  const [rolagem, setRolagem] = useState<number | null>(null);
  const [invs, setInvs] = useState<string[]>([]);
  const [truqueDaInv, setTruqueDaInv] = useState<Record<string, string>>({});
  const [truques, setTruques] = useState<string[]>([]);
  const [magias, setMagias] = useState<string[]>([]);
  const [subclasse, setSubclasse] = useState("");
  const [subclasseOutra, setSubclasseOutra] = useState("");
  const [asi, setAsi] = useState<{ modo: ModoAsi; a1: string; a2: string; talento: string; atributo: string }>({
    modo: "dois",
    a1: "",
    a2: "",
    talento: "",
    atributo: "",
  });
  const [estilo, setEstilo] = useState({ talento: "", outra: "" });
  const [epica, setEpica] = useState({ talento: "", atributo: "" });
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [notaGeral, setNotaGeral] = useState("");
  const [trocas, setTrocas] = useState<Record<Troca["tipo"], { de: string; para: string }>>({
    invocacao: { de: "", para: "" },
    truque: { de: "", para: "" },
    magia: { de: "", para: "" },
  });

  if (erro) return <p className="text-heraldico-vermelho text-sm">Não deu para abrir as regras da classe. Confira a internet e tente de novo.</p>;
  if (!dados) return <p className="text-tinta-500 text-sm italic">Abrindo as regras da classe…</p>;

  // ---------- O que este nível pede ----------
  const subDoSrd = subidas.some((s) => s.escolhas.some((e) => e.tipo === "subclasse" && e.nome === dados.subclasse.nome));
  const chega = oQueChega(dados, N, subDoSrd || subclasse === dados.subclasse.nome);
  const nomes = chega.flatMap((p) => p.nomes).join(" · ");
  const precisaSub = /Subclasse de/.test(nomes);
  const precisaAsi = /Aumento no Valor de Atributo/.test(nomes);
  const precisaEstilo = /(^|· )Estilo de Luta($| ·)/.test(nomes);
  const precisaEpica = /Dádiva Épica/.test(nomes);
  const livres = chega.filter(pedemEscolhaLivre);
  const nInv = aMais(dados, N, "Invocações");
  const nTru = aMais(dados, N, "Truques");
  const nMag = aMais(dados, N, "Magias preparadas");
  const circ = circuloMaximo(dados, N);
  const mudancas = mudancasDaTabela(dados, N);
  const linksDasMagias = Object.fromEntries(dados.magias.map((m) => [m.nome, `/magias/${m.slug}/`]));

  const temInv = invocacoesQueTem(dados, base.conhecidas, subidas);
  // As magias próprias da ficha (fora do SRD) contam como as da classe
  const proprias = base.proprias.filter((m) => !dados.magias.some((x) => x.slug === m.slug));
  const todas = [...dados.magias, ...proprias];
  const temTru = [...proprias.filter((m) => m.nivel === 0).map((m) => m.slug), ...magiasQueTem(dados, base.conhecidas, subidas, true)];
  const temMag = [...proprias.filter((m) => m.nivel > 0).map((m) => m.slug), ...magiasQueTem(dados, base.conhecidas, subidas, false)];
  const truquesAgora = [...temTru, ...truques];
  const truquesDeDano = todas.filter((m) => m.nivel === 0 && m.dano && truquesAgora.includes(m.slug));
  const truquesDeAtaque = truquesDeDano.filter((m) => m.ataque);
  const nomeDaMagia = (slug: string) => todas.find((m) => m.slug === slug)?.nome ?? slug;

  // ---------- Atributos e PV ----------
  const valorAgora = (nome: string) =>
    (ficha.ajustes?.atributos?.[nome] ?? base.atributos.find((a) => a.nome === nome)?.valor ?? 10) + atributoDasSubidas(ficha.ajustes, nome);
  const talentoEscolhido = dados.talentos.find((t) => t.id === asi.talento);
  const epicaEscolhida = dados.talentos.find((t) => t.id === epica.talento);
  const aumentos: Record<string, number> = {};
  const somar = (a: string, v: number) => {
    if (a) aumentos[a] = (aumentos[a] ?? 0) + v;
  };
  if (precisaAsi) {
    if (asi.modo === "dois") somar(asi.a1, 2);
    else if (asi.modo === "um-um") {
      somar(asi.a1, 1);
      somar(asi.a2, 1);
    } else if (talentoEscolhido && asi.atributo) somar(asi.atributo, 1);
  }
  if (precisaEpica && epicaEscolhida && epica.atributo) somar(epica.atributo, 1);
  const estoura = Object.entries(aumentos).find(([a, v]) => valorAgora(a) + v > (precisaEpica ? 30 : 20));

  const conAntes = valorAgora("Constituição");
  const modConDepois = modificador(conAntes + (aumentos["Constituição"] ?? 0));
  const retroativo = (modConDepois - modificador(conAntes)) * (N - 1);
  const anao = /^Anã?o/i.test(base.especie) ? 1 : 0;
  const valorDoDado = dado === "media" ? pvMedio(dados.dadoDeVida) : (rolagem ?? 0);
  const pvGanho = Math.max(1, valorDoDado + modConDepois) + anao + retroativo;

  // ---------- Listas ----------
  const opcoesDeInv = dados.invocacoes.map((o) => ({
    o,
    motivo: invs.includes(o.nome) ? null : porQueNao(o, N, [...temInv, ...invs], truquesDeDano.length, truquesDeAtaque.length),
  }));
  const podeInv = opcoesDeInv.filter((x) => !x.motivo);
  const naoPodeInv = opcoesDeInv.filter((x) => x.motivo);
  const truquesNovos = dados.magias.filter((m) => m.nivel === 0 && !temTru.includes(m.slug));
  const magiasNovas = dados.magias.filter((m) => m.nivel >= 1 && m.nivel <= circ && !temMag.includes(m.slug));
  const gerais = dados.talentos.filter((t) => t.categoria === "Gerais" && t.nivelMinimo <= N && t.nome !== "Aumento no Valor de Atributo");
  const estilos = dados.talentos.filter((t) => t.categoria === "Estilo de Luta");
  const epicas = dados.talentos.filter((t) => t.categoria === "Dádiva Épica");

  // ---------- Está tudo escolhido? ----------
  const faltas: string[] = [];
  if (dado === "rolado" && rolagem === null) faltas.push("rolar o dado de vida");
  if (precisaSub && (!subclasse || (subclasse === "outra" && !subclasseOutra.trim()))) faltas.push("a subclasse");
  if (precisaAsi) {
    if (asi.modo === "dois" && !asi.a1) faltas.push("o atributo que sobe 2");
    if (asi.modo === "um-um" && (!asi.a1 || !asi.a2 || asi.a1 === asi.a2)) faltas.push("os dois atributos que sobem 1");
    if (asi.modo === "talento" && (!talentoEscolhido || (atributosDoTalento(talentoEscolhido.texto).length > 0 && !asi.atributo)))
      faltas.push("o talento");
  }
  if (precisaEstilo && !estilo.talento && !estilo.outra.trim()) faltas.push("o Estilo de Luta");
  if (precisaEpica && (!epicaEscolhida || (atributosDoTalento(epicaEscolhida.texto).length > 0 && !epica.atributo))) faltas.push("a Dádiva Épica");
  if (estoura) faltas.push(`${estoura[0]} passaria do máximo`);
  const quantasInv = Math.min(nInv, podeInv.length + invs.length);
  if (invs.length !== quantasInv) faltas.push(`${quantasInv - invs.length} invocação(ões)`);
  for (const nome of invs) {
    const o = dados.invocacoes.find((x) => x.nome === nome);
    if ((o?.truqueDeDano || o?.truqueDeAtaque) && !truqueDaInv[nome]) faltas.push(`o truque da ${nome}`);
  }
  const quantosTru = Math.min(nTru, truquesNovos.length);
  if (truques.length !== quantosTru) faltas.push(`${quantosTru - truques.length} truque(s)`);
  const quantasMag = Math.min(nMag, magiasNovas.length);
  if (magias.length !== quantasMag) faltas.push(`${quantasMag - magias.length} magia(s)`);

  function confirmar() {
    if (faltas.length) return;
    const escolhas: Escolha[] = [];
    if (precisaSub)
      escolhas.push({ tipo: "subclasse", nome: subclasse === "outra" ? subclasseOutra.trim().slice(0, 80) : subclasse });
    if (precisaAsi && asi.modo === "talento" && talentoEscolhido)
      escolhas.push({ tipo: "talento", id: talentoEscolhido.id, nome: talentoEscolhido.nome, atributo: asi.atributo || undefined });
    if (precisaAsi && asi.modo !== "talento") escolhas.push({ tipo: "talento", id: "aumento-no-valor-de-atributo", nome: "Aumento no Valor de Atributo" });
    if (precisaEstilo) {
      const t = estilos.find((x) => x.id === estilo.talento);
      if (t) escolhas.push({ tipo: "talento", id: t.id, nome: t.nome });
      else escolhas.push({ tipo: "nota", titulo: "Estilo de Luta", texto: estilo.outra.trim().slice(0, 300) });
    }
    if (precisaEpica && epicaEscolhida)
      escolhas.push({ tipo: "talento", id: epicaEscolhida.id, nome: epicaEscolhida.nome, atributo: epica.atributo || undefined });
    for (const nome of invs) escolhas.push({ tipo: "invocacao", nome, truque: truqueDaInv[nome] ? nomeDaMagia(truqueDaInv[nome]) : undefined });
    for (const slug of truques) escolhas.push({ tipo: "truque", slug, nome: nomeDaMagia(slug) });
    for (const slug of magias) escolhas.push({ tipo: "magia", slug, nome: nomeDaMagia(slug) });
    for (const p of livres) {
      const t = (notas[p.nomes.join(", ")] ?? "").trim();
      if (t) escolhas.push({ tipo: "nota", titulo: p.nomes.join(", "), texto: t.slice(0, 500) });
    }
    if (notaGeral.trim()) escolhas.push({ tipo: "nota", titulo: "Anotação", texto: notaGeral.trim().slice(0, 500) });

    const feitas: Troca[] = [];
    for (const tipo of ["invocacao", "truque", "magia"] as const) {
      const t = trocas[tipo];
      if (!t.de || !t.para) continue;
      if (tipo === "invocacao") feitas.push({ tipo, de: t.de, para: t.para });
      else feitas.push({ tipo, de: t.de, para: nomeDaMagia(t.para), slug: t.para });
    }

    void salvar({
      nivel: N,
      pv: pvGanho,
      dado,
      atributos: Object.keys(aumentos).length ? aumentos : undefined,
      escolhas,
      trocas: feitas.length ? feitas : undefined,
      por: mestre ? "mestre" : "jogador",
      em: new Date().toISOString(),
    });
  }

  const alternar = (lista: string[], set: (l: string[]) => void, v: string, max: number) =>
    set(lista.includes(v) ? lista.filter((x) => x !== v) : lista.length < max ? [...lista, v] : lista);

  return (
    // O pergaminho é claro: sem isto, o navegador em modo escuro pinta caixas e textos claros
    <div className="text-tinta-900 space-y-5" style={{ colorScheme: "light" }}>
      {/* 1. O que chega */}
      <section>
        <h3 className="font-titulo text-tinta-900 font-bold">1. O que chega no nível {N}</h3>
        {mudancas.length ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {mudancas.map((m) => (
              <li key={m.coluna} className="border-dourado-600/40 rounded-sm border px-2 py-1 text-xs">
                {m.coluna}: {m.antes} → <strong>{m.depois}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        {proficienciaDo(N) !== proficienciaDo(N - 1) ? (
          <p className="text-tinta-700 mt-2 text-sm">O bônus de proficiência sobe para +{proficienciaDo(N)}.</p>
        ) : null}
        <div className="mt-2 space-y-2">
          {chega.map((p) => (
            <details key={p.nomes.join()} className="border-dourado-600/30 rounded-sm border px-3 py-2" open={chega.length === 1}>
              <summary className={`${ROTULO} min-h-9 cursor-pointer`}>{p.nomes.join(", ")}</summary>
              <div className="mt-2">
                <TextoSimples texto={p.texto} magias={linksDasMagias} base={`/classes/${dados.slug}/`} />
              </div>
            </details>
          ))}
          {!chega.length ? <p className="text-tinta-700 text-sm">Nenhuma característica nova neste nível, só o que muda na tabela.</p> : null}
        </div>
      </section>

      {/* 2. PV */}
      <section className={SECAO}>
        <h3 className="font-titulo text-tinta-900 font-bold">2. Pontos de Vida</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="flex min-h-10 items-center gap-2 text-sm">
            <input type="radio" name={`${id}-dado`} checked={dado === "media"} onChange={() => setDado("media")} />
            Média ({pvMedio(dados.dadoDeVida)})
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm">
            <input type="radio" name={`${id}-dado`} checked={dado === "rolado"} onChange={() => setDado("rolado")} />
            Rolar 1d{dados.dadoDeVida}
          </label>
          {dado === "rolado" ? (
            <button
              type="button"
              disabled={rolagem !== null}
              onClick={() => setRolagem(rolarDados(`1d${dados.dadoDeVida}`))}
              className={`${BOTAO} min-h-10 px-3 text-xs`}
            >
              {rolagem === null ? "⚄ Rolar" : `Saiu ${rolagem}`}
            </button>
          ) : null}
        </div>
        <p className="text-tinta-700 mt-2 text-sm">
          {dado === "media" ? pvMedio(dados.dadoDeVida) : (rolagem ?? "?")} {modConDepois >= 0 ? "+" : "−"} {Math.abs(modConDepois)} (Constituição)
          {anao ? " + 1 (Robustez Anã)" : ""}
          {retroativo ? ` + ${retroativo} (a Constituição subiu e vale para os níveis anteriores)` : ""} ={" "}
          <strong className="text-tinta-900">+{dado === "rolado" && rolagem === null ? "?" : pvGanho} PV máximo</strong>
        </p>
        {dado === "rolado" ? <p className="text-tinta-500 mt-1 text-xs">A rolagem vale uma vez só, como na mesa.</p> : null}
      </section>

      {/* 3. Escolhas */}
      {precisaSub || precisaAsi || precisaEstilo || precisaEpica || nInv || nTru || nMag || livres.length ? (
        <section className={`${SECAO} space-y-4`}>
          <h3 className="font-titulo text-tinta-900 font-bold">3. Escolhas</h3>

          {precisaSub ? (
            <fieldset>
              <legend className={ROTULO}>Subclasse</legend>
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input type="radio" name={`${id}-sub`} checked={subclasse === dados.subclasse.nome} onChange={() => setSubclasse(dados.subclasse.nome)} />
                {dados.subclasse.nome} <span className="text-tinta-500 text-xs">(a do SRD)</span>
              </label>
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input type="radio" name={`${id}-sub`} checked={subclasse === "outra"} onChange={() => setSubclasse("outra")} />
                Outra
              </label>
              {subclasse === "outra" ? (
                <input
                  value={subclasseOutra}
                  maxLength={80}
                  onChange={(e) => setSubclasseOutra(e.target.value)}
                  placeholder="Nome da subclasse (o Mestre dita as regras)"
                  aria-label="Nome da outra subclasse"
                  className={`${CAMPO} mt-1`}
                />
              ) : null}
            </fieldset>
          ) : null}

          {precisaAsi ? (
            <fieldset>
              <legend className={ROTULO}>Aumento no Valor de Atributo ou talento</legend>
              <div className="mt-1 flex flex-wrap gap-x-4">
                {(
                  [
                    ["dois", "+2 em um atributo"],
                    ["um-um", "+1 em dois atributos"],
                    ["talento", "Um talento geral"],
                  ] as const
                ).map(([modo, rotulo]) => (
                  <label key={modo} className="flex min-h-10 items-center gap-2 text-sm">
                    <input type="radio" name={`${id}-asi`} checked={asi.modo === modo} onChange={() => setAsi({ ...asi, modo })} />
                    {rotulo}
                  </label>
                ))}
              </div>
              {asi.modo !== "talento" ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  <SeletorDeAtributo valor={asi.a1} mudar={(a1) => setAsi({ ...asi, a1 })} valorAgora={valorAgora} rotulo="Atributo" />
                  {asi.modo === "um-um" ? (
                    <SeletorDeAtributo valor={asi.a2} mudar={(a2) => setAsi({ ...asi, a2 })} valorAgora={valorAgora} rotulo="Outro atributo" />
                  ) : null}
                </div>
              ) : (
                <EscolhaDeTalento
                  lista={gerais}
                  valor={asi.talento}
                  atributo={asi.atributo}
                  mudar={(talento, atributo) => setAsi({ ...asi, talento, atributo })}
                  valorAgora={valorAgora}
                />
              )}
            </fieldset>
          ) : null}

          {precisaEstilo ? (
            <fieldset>
              <legend className={ROTULO}>Estilo de Luta</legend>
              <EscolhaDeTalento lista={estilos} valor={estilo.talento} atributo="" mudar={(talento) => setEstilo({ ...estilo, talento })} valorAgora={valorAgora} />
              <input
                value={estilo.outra}
                maxLength={300}
                onChange={(e) => setEstilo({ ...estilo, outra: e.target.value })}
                placeholder="Ou a outra opção que a classe dá (escreva)"
                aria-label="Outra opção no lugar do Estilo de Luta"
                className={`${CAMPO} mt-2`}
              />
            </fieldset>
          ) : null}

          {precisaEpica ? (
            <fieldset>
              <legend className={ROTULO}>Dádiva Épica</legend>
              <EscolhaDeTalento
                lista={epicas}
                valor={epica.talento}
                atributo={epica.atributo}
                mudar={(talento, atributo) => setEpica({ talento, atributo })}
                valorAgora={valorAgora}
              />
            </fieldset>
          ) : null}

          {nInv ? (
            <fieldset>
              <legend className={ROTULO}>
                Invocações Místicas: escolha {quantasInv} ({invs.length} de {quantasInv})
              </legend>
              {temInv.length ? <p className="text-tinta-500 text-xs">Já tem: {temInv.join(", ")}.</p> : null}
              <ul className="mt-2 space-y-1.5">
                {podeInv.map(({ o }) => (
                  <li key={o.nome} className="border-dourado-600/30 rounded-sm border px-3 py-2">
                    <label className="flex min-h-9 items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={invs.includes(o.nome)}
                        onChange={() => alternar(invs, setInvs, o.nome, quantasInv)}
                      />
                      <span>
                        <strong className="text-tinta-900">{o.nome}</strong>
                        {o.prerequisito ? <span className="text-tinta-500 block text-xs">Pré-requisito: {o.prerequisito}</span> : null}
                      </span>
                    </label>
                    {invs.includes(o.nome) && (o.truqueDeDano || o.truqueDeAtaque) ? (
                      <select
                        value={truqueDaInv[o.nome] ?? ""}
                        onChange={(e) => setTruqueDaInv({ ...truqueDaInv, [o.nome]: e.target.value })}
                        aria-label={`Truque da ${o.nome}`}
                        className={`${CAMPO} mt-2`}
                      >
                        <option value="">Qual truque?</option>
                        {(o.truqueDeAtaque ? truquesDeAtaque : truquesDeDano).map((m) => (
                          <option key={m.slug} value={m.slug}>
                            {m.nome}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <details className="mt-1">
                      <summary className="text-tinta-500 min-h-8 cursor-pointer text-xs">Ler a regra</summary>
                      <div className="mt-1">
                        <TextoSimples texto={o.texto} magias={linksDasMagias} base={`/classes/${dados.slug}/`} />
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
              {naoPodeInv.length ? (
                <details className="mt-2">
                  <summary className="text-tinta-500 min-h-9 cursor-pointer text-xs">Ainda não dá ({naoPodeInv.length})</summary>
                  <ul className="text-tinta-500 mt-1 space-y-0.5 text-xs">
                    {naoPodeInv.map(({ o, motivo }) => (
                      <li key={o.nome}>
                        {o.nome}: {motivo}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </fieldset>
          ) : null}

          {nTru ? (
            <ListaDeMagias
              titulo={`Truques: escolha ${quantosTru}`}
              lista={truquesNovos}
              escolhidas={truques}
              alternar={(slug) => alternar(truques, setTruques, slug, quantosTru)}
            />
          ) : null}

          {nMag ? (
            <ListaDeMagias
              titulo={`Magias: escolha ${quantasMag} (até o ${circ}º círculo)`}
              lista={magiasNovas}
              escolhidas={magias}
              alternar={(slug) => alternar(magias, setMagias, slug, quantasMag)}
            />
          ) : null}

          {livres.map((p) => {
            const chave = p.nomes.join(", ");
            return (
              <label key={chave} className="block">
                <span className={ROTULO}>{chave}: a sua escolha</span>
                <input
                  value={notas[chave] ?? ""}
                  maxLength={500}
                  onChange={(e) => setNotas({ ...notas, [chave]: e.target.value })}
                  placeholder="O que você escolheu (fica anotado na ficha)"
                  className={`${CAMPO} mt-1`}
                />
              </label>
            );
          })}
        </section>
      ) : null}

      {/* 4. Trocas */}
      {temInv.length || nTru || temTru.length || temMag.length ? (
        <details className={SECAO}>
          <summary className="font-titulo text-tinta-900 min-h-10 cursor-pointer font-bold">4. Trocas (opcional)</summary>
          <p className="text-tinta-500 mt-1 text-xs">Ao subir de nível, a regra deixa trocar uma de cada.</p>
          <div className="mt-2 space-y-3">
            {temInv.length && dados.invocacoes.length ? (
              <TrocaDeUma
                rotulo="Invocação"
                de={temInv.map((n) => ({ valor: n, nome: n }))}
                para={podeInv.filter(({ o }) => !invs.includes(o.nome)).map(({ o }) => ({ valor: o.nome, nome: o.nome }))}
                atual={trocas.invocacao}
                mudar={(t) => setTrocas({ ...trocas, invocacao: t })}
              />
            ) : null}
            {temTru.length ? (
              <TrocaDeUma
                rotulo="Truque"
                de={temTru.map((s) => ({ valor: s, nome: nomeDaMagia(s) }))}
                para={truquesNovos.filter((m) => !truques.includes(m.slug)).map((m) => ({ valor: m.slug, nome: m.nome }))}
                atual={trocas.truque}
                mudar={(t) => setTrocas({ ...trocas, truque: t })}
              />
            ) : null}
            {temMag.length ? (
              <TrocaDeUma
                rotulo="Magia"
                de={temMag.map((s) => ({ valor: s, nome: nomeDaMagia(s) }))}
                para={magiasNovas.filter((m) => !magias.includes(m.slug)).map((m) => ({ valor: m.slug, nome: m.nome }))}
                atual={trocas.magia}
                mudar={(t) => setTrocas({ ...trocas, magia: t })}
              />
            ) : null}
          </div>
        </details>
      ) : null}

      {/* 5. Confirmar */}
      <section className={SECAO}>
        <label className="block">
          <span className={ROTULO}>Anotação (opcional)</span>
          <textarea
            value={notaGeral}
            maxLength={500}
            rows={2}
            onChange={(e) => setNotaGeral(e.target.value)}
            placeholder="Algo que o Mestre combinou, uma regra da casa…"
            className={`${CAMPO} mt-1 py-2`}
          />
        </label>
        {faltas.length ? (
          <p className="text-tinta-700 mt-3 text-sm" aria-live="polite">
            Falta escolher: {faltas.join(", ")}.
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={ocupado || faltas.length > 0} onClick={confirmar} className={BOTAO_CHEIO}>
            ⬆ Subir para o nível {N}
          </button>
          <button type="button" onClick={cancelar} className={BOTAO}>
            Agora não
          </button>
        </div>
      </section>
    </div>
  );
}

function SeletorDeAtributo({
  valor,
  mudar,
  valorAgora,
  rotulo,
}: {
  valor: string;
  mudar: (v: string) => void;
  valorAgora: (nome: string) => number;
  rotulo: string;
}) {
  return (
    <select value={valor} onChange={(e) => mudar(e.target.value)} aria-label={rotulo} className={`${CAMPO} w-auto`}>
      <option value="">{rotulo}…</option>
      {ATRIBUTOS.map((a) => (
        <option key={a} value={a}>
          {a} ({valorAgora(a)})
        </option>
      ))}
    </select>
  );
}

function EscolhaDeTalento({
  lista,
  valor,
  atributo,
  mudar,
  valorAgora,
}: {
  lista: { id: string; nome: string; prerequisito: string | null; texto: string }[];
  valor: string;
  atributo: string;
  mudar: (talento: string, atributo: string) => void;
  valorAgora: (nome: string) => number;
}) {
  const escolhido = lista.find((t) => t.id === valor);
  const atributos = escolhido ? atributosDoTalento(escolhido.texto) : [];
  return (
    <div className="mt-1">
      <select value={valor} onChange={(e) => mudar(e.target.value, "")} aria-label="Talento" className={CAMPO}>
        <option value="">Escolha o talento…</option>
        {lista.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome}
            {t.prerequisito ? ` (${t.prerequisito})` : ""}
          </option>
        ))}
      </select>
      {escolhido ? (
        <div className="border-dourado-600/30 mt-2 rounded-sm border px-3 py-2">
          <TextoSimples texto={escolhido.texto} />
          {atributos.length ? (
            <select value={atributo} onChange={(e) => mudar(valor, e.target.value)} aria-label="Atributo que sobe 1" className={`${CAMPO} mt-2 w-auto`}>
              <option value="">Qual atributo sobe 1?</option>
              {atributos.map((a) => (
                <option key={a} value={a}>
                  {a} ({valorAgora(a)})
                </option>
              ))}
            </select>
          ) : null}
          <p className="text-tinta-500 mt-1 text-xs">O pré-requisito de atributo fica com você e o Mestre.</p>
        </div>
      ) : null}
    </div>
  );
}

function ListaDeMagias({
  titulo,
  lista,
  escolhidas,
  alternar,
}: {
  titulo: string;
  lista: { slug: string; nome: string; nivel: number }[];
  escolhidas: string[];
  alternar: (slug: string) => void;
}) {
  return (
    <fieldset>
      <legend className={ROTULO}>
        {titulo} ({escolhidas.length} escolhida{escolhidas.length === 1 ? "" : "s"})
      </legend>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {lista.map((m) => (
          <li key={m.slug} className="flex items-center gap-2 text-sm">
            <input
              id={`magia-${m.slug}`}
              type="checkbox"
              checked={escolhidas.includes(m.slug)}
              onChange={() => alternar(m.slug)}
              className="size-4"
            />
            <label htmlFor={`magia-${m.slug}`} className="min-h-9 flex-1 py-1.5">
              {m.nome} {m.nivel ? <span className="text-tinta-500 text-xs">{m.nivel}º</span> : null}
            </label>
            <Link href={`/magias/${m.slug}/`} target="_blank" className="text-heraldico-vermelho text-xs underline">
              ler
            </Link>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

function TrocaDeUma({
  rotulo,
  de,
  para,
  atual,
  mudar,
}: {
  rotulo: string;
  de: { valor: string; nome: string }[];
  para: { valor: string; nome: string }[];
  atual: { de: string; para: string };
  mudar: (t: { de: string; para: string }) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <select value={atual.de} onChange={(e) => mudar({ ...atual, de: e.target.value })} aria-label={`${rotulo} que sai`} className={CAMPO}>
        <option value="">{rotulo} que sai…</option>
        {de.map((x) => (
          <option key={x.valor} value={x.valor}>
            {x.nome}
          </option>
        ))}
      </select>
      <select value={atual.para} onChange={(e) => mudar({ ...atual, para: e.target.value })} aria-label={`${rotulo} que entra`} className={CAMPO}>
        <option value="">{rotulo} que entra…</option>
        {para.map((x) => (
          <option key={x.valor} value={x.valor}>
            {x.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
