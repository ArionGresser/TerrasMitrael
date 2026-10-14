"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { iniciarConta } from "@/lib/conta";
import { lerMesaDoCombate, ouvirCombate, type MesaDoCombate } from "@/lib/combate";
import { useConta } from "@/components/conta/useConta";
import { MapaDaMesa } from "@/components/mapa/MapaDaMesa";
import type { PersonagemDoCombate } from "@/components/combate/GeradorDeEncontros";
import { CHAVE_DOS_PRESENTES, combatesDoDia, diaDeHoje, lerSessoes, presentesGuardados, salvarSessao, type CombateDoDia, type Sessao } from "@/lib/sessao";
import { BOTAO, CAMPO } from "@/components/conta/MinhaConta";
import { EncontrosProntos } from "@/components/combate/EncontrosProntos";

/**
 * A sessão de hoje, num lugar só: quem está na mesa, o combate em
 * andamento, o mapa da mesa e os atalhos do dia (encontros, arena,
 * anotações, a própria ficha).
 */
export function SessaoDeHoje({ personagens }: { personagens: PersonagemDoCombate[] }) {
  const conta = useConta();
  const ehMestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const meu = conta.fase === "dentro" ? conta.perfil.personagem : null;
  const [presentes, setPresentes] = useState<string[]>([]);
  const [mesa, setMesa] = useState<MesaDoCombate | null>(null);
  const [sessoes, setSessoes] = useState<Sessao[] | null>(null);
  const hojeDia = diaDeHoje();

  useEffect(() => {
    void iniciarConta();
    setPresentes(presentesGuardados() ?? personagens.map((p) => p.slug));
  }, [personagens]);

  // O Mestre: a sessão de hoje e as passadas, guardadas no banco
  useEffect(() => {
    if (!ehMestre) return;
    void lerSessoes().then((l) => {
      setSessoes(l);
      const hoje = l.find((x) => x.dia === hojeDia);
      if (hoje?.presentes.length) setPresentes(hoje.presentes);
    });
  }, [ehMestre, hojeDia]);

  useEffect(() => {
    if (conta.fase !== "dentro") return;
    const ler = () => void lerMesaDoCombate().then(setMesa);
    ler();
    return ouvirCombate(ler);
  }, [conta.fase]);

  function marcar(slug: string) {
    setPresentes((p) => {
      const novo = p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug];
      try {
        localStorage.setItem(CHAVE_DOS_PRESENTES, JSON.stringify(novo));
      } catch {
        // sem armazenamento: vale só nesta tela
      }
      void salvarSessao(hojeDia, { presentes: novo });
      return novo;
    });
  }

  if (conta.fase === "carregando") return <p className="text-tinta-700 py-10 text-center italic">Arrumando a mesa…</p>;
  if (conta.fase === "fora")
    return (
      <p className="text-tinta-700 py-10 text-center">
        A sessão é para quem joga.{" "}
        <Link href="/conta/" className="text-heraldico-vermelho underline">
          Entre na sua conta
        </Link>
        .
      </p>
    );

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const daVez = mesa?.ordem.find((l) => l.id === mesa.vez);
  const meuPersonagem = personagens.find((p) => p.slug === meu);

  return (
    <div className="space-y-8">
      <p className="text-tinta-700 text-center text-sm first-letter:uppercase">{hoje}</p>

      {/* O combate, se houver */}
      {mesa ? (
        <Link
          href="/combate/"
          className="border-heraldico-vermelho bg-heraldico-vermelho text-pergaminho-50 hover:bg-heraldico-vermelho/90 flex items-center justify-between gap-3 rounded-sm border-2 px-4 py-3 shadow-md"
        >
          <span>
            <span className="font-titulo block text-lg font-bold">⚔ Combate{mesa.numero ? ` nº ${mesa.numero}` : ""} em andamento</span>
            <span className="text-sm opacity-90">
              {mesa.rodada === 0 ? "Rolando a iniciativa" : `Rodada ${mesa.rodada}${daVez ? ` · vez de ${daVez.nome}` : ""}`}
            </span>
          </span>
          <span aria-hidden className="text-2xl">
            ›
          </span>
        </Link>
      ) : null}

      {/* Quem está na mesa */}
      <section>
        <h2 className="font-titulo text-tinta-900 text-lg font-bold">Quem está na mesa</h2>
        {ehMestre ? <p className="text-tinta-500 text-xs">Toque para marcar quem veio. O gerador de encontros já começa com essa lista.</p> : null}
        <ul className="mt-2 flex flex-wrap gap-3">
          {personagens.map((p) => {
            const veio = presentes.includes(p.slug);
            const conteudo = (
              <>
                <span className={`relative block size-16 overflow-hidden rounded-full border-4 ${veio ? "border-dourado-500" : "border-tinta-500/30 grayscale"}`}>
                  {p.imagem ? <Image src={p.imagem} alt="" fill sizes="64px" className="object-cover object-top" /> : null}
                </span>
                <span className={`mt-1 block text-xs font-semibold ${veio ? "text-tinta-900" : "text-tinta-500"}`}>{p.nome.split(" ")[0]}</span>
              </>
            );
            return (
              <li key={p.slug} className="w-20 text-center">
                {ehMestre ? (
                  <button type="button" aria-pressed={veio} onClick={() => marcar(p.slug)} className="block w-full">
                    {conteudo}
                  </button>
                ) : (
                  conteudo
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Atalhos do dia */}
      <nav aria-label="Atalhos da sessão">
        <h2 className="font-titulo text-tinta-900 text-lg font-bold">Atalhos</h2>
        <ul className={`mt-2 grid grid-cols-2 gap-2 ${ehMestre ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
          {ehMestre ? (
            <>
              <Atalho href="/mestre/encontros/" icone="⚄" titulo="Gerar encontro" texto="Combate ou fora dele" />
              <Atalho href="/mestre/" icone="♛" titulo="Mesa ao vivo" texto="PV, itens, pedidos" />
              <Atalho href="/mestre/nomes/" icone="✒" titulo="Gerar nome" texto="Para um NPC na hora" />
              <Atalho href="/mapa-da-mesa/" icone="⌖" titulo="Mapa da mesa" texto="Em tela cheia" />
            </>
          ) : meuPersonagem ? (
            <>
              <Atalho href={`/personagens/${meuPersonagem.slug}/#ficha`} icone="⛨" titulo="Minha ficha" texto={meuPersonagem.nome.split(" ")[0]} />
              <Atalho href={`/personagens/${meuPersonagem.slug}/#mochila`} icone="⚖" titulo="Mochila" texto="Itens e moedas" />
            </>
          ) : null}
          <Atalho href="/combate/" icone="⚔" titulo="Arena" texto={mesa ? "Combate agora!" : "Nenhum combate"} />
          <Atalho href="/anotacoes/" icone="✎" titulo="Anotações" texto="O caderno" />
        </ul>
      </nav>

      {ehMestre ? (
        <>
          <section>
            <h2 className="font-titulo text-tinta-900 text-lg font-bold">Encontros prontos</h2>
            <div className="mt-2">
              <EncontrosProntos personagens={personagens} />
            </div>
          </section>

          <section>
            <h2 className="font-titulo text-tinta-900 text-lg font-bold">O caderno da sessão</h2>
            <p className="text-tinta-500 text-xs">Só você lê. O que aconteceu hoje, para escrever as Crônicas depois. Salva sozinho.</p>
            {sessoes === null ? (
              <p className="text-tinta-500 mt-2 text-sm italic">Abrindo…</p>
            ) : (
              <CadernoDaSessao dia={hojeDia} inicial={sessoes.find((x) => x.dia === hojeDia)} personagens={personagens} />
            )}
          </section>
        </>
      ) : null}

      {/* O mapa */}
      <section>
        <h2 className="font-titulo text-tinta-900 mb-2 text-lg font-bold">Mapa da mesa</h2>
        <MapaDaMesa />
      </section>

      {ehMestre && sessoes?.some((x) => x.dia !== hojeDia) ? (
        <section>
          <h2 className="font-titulo text-tinta-900 text-lg font-bold">Sessões anteriores</h2>
          <ul className="mt-2 space-y-2">
            {sessoes
              .filter((x) => x.dia !== hojeDia)
              .map((x) => (
                <li key={x.dia}>
                  <details className="border-dourado-600/30 rounded-sm border">
                    <summary className="text-tinta-900 min-h-11 cursor-pointer px-3 py-3 text-sm">
                      <strong className="font-titulo">{dataBonita(x.dia)}</strong>
                      {x.titulo ? ` · ${x.titulo}` : ""}
                      <span className="text-tinta-500 text-xs"> · {x.presentes.length} na mesa</span>
                    </summary>
                    <div className="px-3 pb-3">
                      <CadernoDaSessao dia={x.dia} inicial={x} personagens={personagens} />
                    </div>
                  </details>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

const dataBonita = (dia: string) => new Date(`${dia}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

/** O título e as anotações de um dia, com os combates dele. Salva sozinho. */
function CadernoDaSessao({ dia, inicial, personagens }: { dia: string; inicial?: Sessao; personagens: PersonagemDoCombate[] }) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [notas, setNotas] = useState(inicial?.notas ?? "");
  const [estado, setEstado] = useState<"salvo" | "mudou" | "salvando" | string>("salvo");
  const [combates, setCombates] = useState<CombateDoDia[] | null>(null);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendente = useRef<{ titulo: string; notas: string } | null>(null);

  useEffect(() => {
    void combatesDoDia(dia).then(setCombates);
  }, [dia]);

  // Fechar a tela não perde o último pedaço escrito
  useEffect(
    () => () => {
      if (pendente.current) void salvarSessao(dia, pendente.current);
    },
    [dia]
  );

  function mudar(campos: { titulo?: string; notas?: string }) {
    const novo = { titulo: campos.titulo ?? titulo, notas: campos.notas ?? notas };
    if (campos.titulo !== undefined) setTitulo(campos.titulo);
    if (campos.notas !== undefined) setNotas(campos.notas);
    pendente.current = novo;
    setEstado("mudou");
    if (espera.current) clearTimeout(espera.current);
    espera.current = setTimeout(async () => {
      const agora = pendente.current;
      pendente.current = null;
      if (!agora) return;
      setEstado("salvando");
      const erro = await salvarSessao(dia, agora);
      setEstado(erro ? `Não salvou: ${erro}` : "salvo");
    }, 900);
  }

  const nomes = (inicial?.presentes ?? []).map((s) => personagens.find((p) => p.slug === s)?.nome.split(" ")[0] ?? s);

  return (
    <div className="mt-2 space-y-2">
      {nomes.length ? <p className="text-tinta-700 text-xs">Na mesa: {nomes.join(", ")}</p> : null}
      <input
        value={titulo}
        maxLength={120}
        onChange={(e) => mudar({ titulo: e.target.value })}
        placeholder="Título da sessão (opcional)"
        aria-label="Título da sessão"
        className={CAMPO}
      />
      <textarea
        value={notas}
        maxLength={40000}
        rows={8}
        onChange={(e) => mudar({ notas: e.target.value })}
        placeholder="O que aconteceu, quem disse o quê, ganchos para a próxima…"
        aria-label="Anotações da sessão"
        className={`${CAMPO} py-2 leading-relaxed`}
      />
      <p role="status" className={`text-xs ${estado.startsWith("Não") ? "text-heraldico-vermelho" : "text-tinta-500"}`}>
        {estado === "salvo" ? "Salvo" : estado === "mudou" ? "Escrevendo…" : estado === "salvando" ? "Salvando…" : estado}
      </p>
      <div>
        <p className="font-titulo text-tinta-500 text-xs font-semibold tracking-[0.16em] uppercase">Combates do dia</p>
        {combates === null ? (
          <p className="text-tinta-500 text-sm italic">Procurando…</p>
        ) : combates.length ? (
          <ul className="mt-1 space-y-1 text-sm">
            {combates.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-tinta-900">
                  Combate nº {c.mesa.numero ?? c.id}
                  {c.ativo ? " · em andamento" : c.mesa.resumo ? ` · ${c.mesa.resumo.rodadas} rodadas · contra ${c.mesa.resumo.inimigos.join(", ")}` : ""}
                </span>
                <Link href={`/combate/replay/?id=${c.id}`} className={`${BOTAO} min-h-9 px-3 text-xs`}>
                  Assistir
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinta-500 text-sm italic">Nenhum combate neste dia.</p>
        )}
      </div>
    </div>
  );
}

function Atalho({ href, icone, titulo, texto }: { href: string; icone: string; titulo: string; texto: ReactNode }) {
  return (
    <li>
      <Link href={href} className="border-dourado-600/30 hover:bg-dourado-400/15 flex h-full min-h-16 items-start gap-3 rounded-sm border p-3 transition-colors">
        <span aria-hidden className="text-dourado-600 font-titulo text-xl leading-none">
          {icone}
        </span>
        <span className="min-w-0">
          <span className="font-titulo text-tinta-900 block text-sm font-semibold">{titulo}</span>
          <span className="text-tinta-700 block text-xs leading-snug">{texto}</span>
        </span>
      </Link>
    </li>
  );
}

