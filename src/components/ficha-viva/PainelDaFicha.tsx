"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import {
  TIPOS_DE_MOEDA,
  curaDaPocao,
  moedasPorExtenso,
  rolar,
  type FichaViva,
  type ItemDaMochila,
  type Moedas,
  type MudancaNaFicha,
  type Pedido,
} from "@/lib/ficha-viva";
import { BOTAO, BOTAO_CHEIO, CAMPO } from "@/components/conta/MinhaConta";
import { XP_DO_NIVEL } from "@/lib/xp";
import { BotaoDeRegra, Janela } from "./Janela";

type Resposta = Promise<string | null>;

export type AcoesDaFicha = {
  mudar: (m: MudancaNaFicha) => Resposta;
  tirar: (item: string, quantidade: number) => Resposta;
  gastar: (moedas: Moedas) => Resposta;
  pedirItem: (item: string, quantidade: number, motivo: string) => Resposta;
  pedirMoedas: (moedas: Moedas, motivo: string) => Resposta;
  desistir: (id: number) => Resposta;
  /** Só o Mestre recebe estas. */
  resolver?: (id: number, aprovar: boolean, resposta: string) => Resposta;
  mestre?: MaosDoMestre;
};

/** O que só o Mestre faz na ficha. Cada uma avisa o jogador. */
export type MaosDoMestre = {
  pv: (delta: number) => Resposta;
  item: (nome: string, quantidade: number) => Resposta;
  moedas: (moedas: Moedas) => Resposta;
  xp: (xp: number) => Resposta;
  inspiracao: (tem: boolean) => Resposta;
  recado: (texto: string) => Resposta;
};

/** As regras do glossário já formatadas, pela âncora ("descanso-curto"). */
export type RegrasDaFicha = Record<string, ReactNode>;

const CIRCULO = (c: string) => `${c}º círculo`;

/**
 * A ficha viva: o que muda durante o jogo, com um botão para cada coisa que
 * acontece na mesa. Não fala com o banco: recebe a ficha e as ações prontas
 * (ver FichaVivaDoPersonagem), e mostra o resultado de cada rolagem.
 */
export function PainelDaFicha({
  ficha,
  base,
  pedidos,
  acoes,
  regras,
  mestre,
}: {
  ficha: FichaViva;
  base: BaseDaFicha;
  pedidos: Pedido[];
  acoes: AcoesDaFicha;
  regras: RegrasDaFicha;
  mestre: boolean;
}) {
  const [aviso, setAviso] = useState<{ erro: boolean; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  /** Roda uma ação e mostra o resultado (ou o erro) na faixa de aviso. */
  async function fazer(acao: () => Resposta, sucesso?: string) {
    setOcupado(true);
    const erro = await acao();
    setOcupado(false);
    if (erro) setAviso({ erro: true, texto: erro });
    else if (sucesso) setAviso({ erro: false, texto: sucesso });
    return !erro;
  }

  const dvLivres = Math.max(0, base.dadosDeVida - ficha.dados_de_vida_gastos);

  return (
    <section
      aria-labelledby="titulo-ficha-viva"
      className="border-heraldico-vermelho/30 bg-pergaminho-50/60 mb-8 rounded-sm border-2 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="titulo-ficha-viva" className="font-titulo text-tinta-900 text-xl font-bold">
          Ficha viva
        </h3>
        <p className="text-tinta-500 text-xs">
          {mestre ? "Você está vendo como Mestre" : "Só você e o Mestre veem esta parte"}
        </p>
      </div>

      <p aria-live="polite" className="min-h-6 mt-2 text-sm">
        {aviso ? (
          <span className={aviso.erro ? "text-heraldico-vermelho" : "text-tinta-700"}>{aviso.texto}</span>
        ) : null}
      </p>

      <div className="mt-2 grid gap-5 sm:grid-cols-2">
        <PontosDeVida ficha={ficha} base={base} regras={regras} ocupado={ocupado} fazer={fazer} acoes={acoes} />

        <div className="space-y-5">
          <Bloco titulo="Descansos" regra={<BotaoDeRegra titulo="Descanso Curto" ancora="descanso-curto" regra={regras["descanso-curto"]} />}>
            <p className="text-tinta-700 text-sm">
              Dados de Vida: <strong className="text-tinta-900">{dvLivres}</strong> de {base.dadosDeVida} (d{base.dadoDeVida})
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <DescansoCurto ficha={ficha} base={base} fazer={fazer} acoes={acoes} ocupado={ocupado} />
              <DescansoLongo ficha={ficha} base={base} fazer={fazer} acoes={acoes} ocupado={ocupado} regra={regras["descanso-longo"]} />
            </div>
          </Bloco>

          <Inspiracao ficha={ficha} mestre={mestre} fazer={fazer} acoes={acoes} ocupado={ocupado} regra={regras["inspiracao-heroica"]} />
        </div>
      </div>

      <Experiencia ficha={ficha} base={base} fazer={fazer} acoes={acoes} ocupado={ocupado} />

      {Object.keys(base.espacos).length ? (
        <EspacosDeMagia ficha={ficha} base={base} fazer={fazer} acoes={acoes} ocupado={ocupado} />
      ) : null}

      <Mochila ficha={ficha} base={base} fazer={fazer} acoes={acoes} ocupado={ocupado} setAviso={setAviso} />

      <Bolsa ficha={ficha} fazer={fazer} acoes={acoes} ocupado={ocupado} />

      <Pedidos pedidos={pedidos} fazer={fazer} acoes={acoes} ocupado={ocupado} mestre={mestre} />

      {acoes.mestre ? <Recado fazer={fazer} acoes={acoes} ocupado={ocupado} /> : null}
    </section>
  );
}

type Comum = {
  fazer: (acao: () => Resposta, sucesso?: string) => Promise<boolean>;
  acoes: AcoesDaFicha;
  ocupado: boolean;
};

function Bloco({ titulo, regra, children }: { titulo: string; regra?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h4 className="font-titulo text-tinta-500 text-xs font-semibold tracking-[0.16em] uppercase">{titulo}</h4>
        {regra}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

// ---------- Pontos de Vida ----------

function PontosDeVida({ ficha, base, regras, ocupado, fazer, acoes }: Comum & { ficha: FichaViva; base: BaseDaFicha; regras: RegrasDaFicha }) {
  const [valor, setValor] = useState("");
  const id = useId();
  const quanto = Math.max(0, Math.floor(Number(valor) || 0));
  const fracao = base.pvMaximo ? Math.min(1, ficha.pv / base.pvMaximo) : 0;

  async function dano() {
    if (!quanto) return;
    if (acoes.mestre) {
      if (await fazer(() => acoes.mestre!.pv(-quanto), `${quanto} de dano. O jogador foi avisado.`)) setValor("");
      return;
    }
    // O dano tira primeiro dos PV temporários
    const dosTemporarios = Math.min(ficha.pv_temporarios, quanto);
    const pv = Math.max(0, ficha.pv - (quanto - dosTemporarios));
    const ok = await fazer(
      () => acoes.mudar({ pv, pv_temporarios: ficha.pv_temporarios - dosTemporarios }),
      pv === 0 ? `${quanto} de dano. Você caiu a 0 PV.` : `${quanto} de dano.`
    );
    if (ok) setValor("");
  }

  async function cura() {
    if (!quanto) return;
    if (acoes.mestre) {
      if (await fazer(() => acoes.mestre!.pv(quanto), `+${quanto} PV. O jogador foi avisado.`)) setValor("");
      return;
    }
    const pv = Math.min(base.pvMaximo, ficha.pv + quanto);
    const ok = await fazer(() => acoes.mudar({ pv }), `+${pv - ficha.pv} PV.`);
    if (ok) setValor("");
  }

  async function temporarios() {
    if (!quanto) return;
    // PV temporários não se somam: fica o maior
    const ok = await fazer(
      () => acoes.mudar({ pv_temporarios: Math.max(ficha.pv_temporarios, quanto) }),
      quanto > ficha.pv_temporarios ? `Agora você tem ${quanto} PV temporários.` : "Os PV temporários que você já tinha eram mais."
    );
    if (ok) setValor("");
  }

  return (
    <Bloco titulo="Pontos de Vida" regra={<BotaoDeRegra titulo="Pontos de Vida" ancora="pontos-de-vida" regra={regras["pontos-de-vida"]} />}>
      <p className="font-titulo text-tinta-900 text-4xl font-bold tabular-nums">
        {ficha.pv}
        <span className="text-tinta-500 text-xl font-semibold"> / {base.pvMaximo}</span>
        {ficha.pv_temporarios ? (
          <span className="text-dourado-600 ml-2 text-base font-semibold">+{ficha.pv_temporarios} temp.</span>
        ) : null}
      </p>
      <div
        role="meter"
        aria-label="Pontos de Vida"
        aria-valuemin={0}
        aria-valuemax={base.pvMaximo}
        aria-valuenow={ficha.pv}
        className="bg-madeira-800/15 mt-2 h-2.5 overflow-hidden rounded-full"
      >
        <div
          className={`h-full rounded-full transition-[width] ${fracao > 0.5 ? "bg-[#3f7d3a]" : fracao > 0.25 ? "bg-[#c58a1c]" : "bg-heraldico-vermelho"}`}
          style={{ width: `${fracao * 100}%` }}
        />
      </div>
      {ficha.pv === 0 ? (
        <p className="text-heraldico-vermelho mt-2 text-sm">
          Com 0 PV você fica Inconsciente e faz as salvaguardas contra a morte.
        </p>
      ) : null}

      <div className="mt-3">
        <label htmlFor={id} className="text-tinta-700 text-xs">
          Quanto?
        </label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className={`${CAMPO} mt-1`}
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button type="button" disabled={ocupado || !quanto} onClick={() => void dano()} className={BOTAO}>
            Dano
          </button>
          <button type="button" disabled={ocupado || !quanto} onClick={() => void cura()} className={BOTAO}>
            Cura
          </button>
          <button type="button" disabled={ocupado || !quanto} onClick={() => void temporarios()} className={`${BOTAO} px-2`}>
            Temp.
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-tinta-500 text-xs">PV temporários</span>
        <BotaoDeRegra titulo="Pontos de Vida Temporários" ancora="pontos-de-vida-temporarios" regra={regras["pontos-de-vida-temporarios"]} />
      </div>
    </Bloco>
  );
}

// ---------- Descansos ----------

function DescansoCurto({ ficha, base, fazer, acoes, ocupado }: Comum & { ficha: FichaViva; base: BaseDaFicha }) {
  const [aberta, setAberta] = useState(false);
  const [rolagens, setRolagens] = useState<string[]>([]);
  const livres = Math.max(0, base.dadosDeVida - ficha.dados_de_vida_gastos);

  async function gastarUm() {
    const r = rolar(`1d${base.dadoDeVida}`);
    const cura = Math.max(1, r.total + base.modConstituicao);
    const pv = Math.min(base.pvMaximo, ficha.pv + cura);
    const sinal = base.modConstituicao >= 0 ? "+" : "-";
    const ok = await fazer(() => acoes.mudar({ pv, dados_de_vida_gastos: ficha.dados_de_vida_gastos + 1 }));
    if (ok)
      setRolagens((l) => [
        ...l,
        `d${base.dadoDeVida}: ${r.total} ${sinal} ${Math.abs(base.modConstituicao)} (Constituição) = ${cura} PV${pv - ficha.pv < cura ? `, mas só faltavam ${pv - ficha.pv}` : ""}`,
      ]);
  }

  async function terminar() {
    // Magia de Pacto: os espaços voltam também no Descanso Curto
    if (base.pacto && Object.values(ficha.espacos_gastos).some((n) => n > 0)) {
      await fazer(() => acoes.mudar({ espacos_gastos: {} }), "Descanso curto feito. Os espaços da Magia de Pacto voltaram.");
    } else {
      await fazer(async () => null, "Descanso curto feito.");
    }
    setAberta(false);
  }

  return (
    <>
      <button
        type="button"
        disabled={ocupado || ficha.pv === 0}
        onClick={() => {
          setRolagens([]);
          setAberta(true);
        }}
        className={BOTAO}
      >
        Descanso curto
      </button>
      <Janela aberta={aberta} aoFechar={() => setAberta(false)} titulo="Descanso curto">
        <p className="text-tinta-700 text-sm leading-relaxed">
          Uma hora de pausa. Para cada Dado de Vida que gastar, role o d{base.dadoDeVida} e some a Constituição (
          {base.modConstituicao >= 0 ? "+" : ""}
          {base.modConstituicao}). Dá para decidir depois de cada rolagem.
        </p>
        <p className="font-titulo text-tinta-900 mt-3 text-lg">
          {ficha.pv} / {base.pvMaximo} PV · {livres} {livres === 1 ? "Dado de Vida livre" : "Dados de Vida livres"}
        </p>
        {rolagens.length ? (
          <ul className="text-tinta-700 mt-2 space-y-1 text-sm" aria-live="polite">
            {rolagens.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={ocupado || !livres || ficha.pv >= base.pvMaximo}
            onClick={() => void gastarUm()}
            className={BOTAO_CHEIO}
          >
            Gastar um Dado de Vida
          </button>
          <button type="button" disabled={ocupado} onClick={() => void terminar()} className={BOTAO}>
            Terminar o descanso
          </button>
        </div>
      </Janela>
    </>
  );
}

function DescansoLongo({ ficha, base, fazer, acoes, ocupado, regra }: Comum & { ficha: FichaViva; base: BaseDaFicha; regra?: ReactNode }) {
  const [aberta, setAberta] = useState(false);

  async function descansar() {
    const ok = await fazer(
      () => acoes.mudar({ pv: base.pvMaximo, pv_temporarios: 0, dados_de_vida_gastos: 0, espacos_gastos: {} }),
      "Descanso longo feito: PV cheios, Dados de Vida e espaços de magia de volta."
    );
    if (ok) setAberta(false);
  }

  return (
    <>
      <button type="button" disabled={ocupado || ficha.pv === 0} onClick={() => setAberta(true)} className={BOTAO}>
        Descanso longo
      </button>
      <Janela aberta={aberta} aoFechar={() => setAberta(false)} titulo="Descanso longo">
        <p className="text-tinta-700 text-sm leading-relaxed">Ao terminar as 8 horas de descanso:</p>
        <ul className="text-tinta-700 mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>os PV voltam ao máximo ({base.pvMaximo});</li>
          <li>todos os Dados de Vida gastos voltam;</li>
          {Object.keys(base.espacos).length ? <li>todos os espaços de magia voltam;</li> : null}
          <li>os PV temporários acabam.</li>
        </ul>
        {regra ? <div className="border-dourado-600/30 text-tinta-900 mt-4 border-t pt-3">{regra}</div> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={ocupado} onClick={() => void descansar()} className={BOTAO_CHEIO}>
            Terminar o descanso longo
          </button>
          <button type="button" onClick={() => setAberta(false)} className={BOTAO}>
            Ainda não
          </button>
        </div>
      </Janela>
    </>
  );
}

// ---------- Inspiração Heroica ----------

function Inspiracao({ ficha, mestre, fazer, acoes, ocupado, regra }: Comum & { ficha: FichaViva; mestre: boolean; regra?: ReactNode }) {
  return (
    <Bloco titulo="Inspiração Heroica" regra={<BotaoDeRegra titulo="Inspiração Heroica" ancora="inspiracao-heroica" regra={regra} />}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden
          className={`grid size-10 place-items-center rounded-full border-2 text-lg ${
            ficha.inspiracao ? "border-dourado-600 bg-dourado-400/30 text-dourado-600" : "border-tinta-500/30 text-tinta-500/40"
          }`}
        >
          ✦
        </span>
        <span className="text-tinta-700 text-sm">{ficha.inspiracao ? "Você tem uma." : "Nenhuma no momento."}</span>
        {ficha.inspiracao ? (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => void fazer(() => acoes.mudar({ inspiracao: false }), "Inspiração Heroica gasta: role de novo.")}
            className={BOTAO}
          >
            Gastar
          </button>
        ) : mestre ? (
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              void fazer(
                () => (acoes.mestre ? acoes.mestre.inspiracao(true) : acoes.mudar({ inspiracao: true })),
                "Inspiração Heroica dada."
              )
            }
            className={BOTAO}
          >
            Dar (Mestre)
          </button>
        ) : null}
      </div>
    </Bloco>
  );
}

// ---------- Espaços de magia ----------

function EspacosDeMagia({ ficha, base, fazer, acoes, ocupado }: Comum & { ficha: FichaViva; base: BaseDaFicha }) {
  function mudar(circulo: string, delta: number) {
    const gastos = { ...ficha.espacos_gastos, [circulo]: (ficha.espacos_gastos[circulo] ?? 0) + delta };
    return fazer(() => acoes.mudar({ espacos_gastos: gastos }));
  }

  return (
    <div className="mt-6">
      <Bloco titulo={base.pacto ? "Espaços da Magia de Pacto" : "Espaços de magia"}>
        <ul className="space-y-3">
          {Object.entries(base.espacos).map(([circulo, total]) => {
            const gastos = Math.min(total, ficha.espacos_gastos[circulo] ?? 0);
            const livres = total - gastos;
            return (
              <li key={circulo} className="flex flex-wrap items-center gap-3">
                <span className="font-titulo text-tinta-900 w-24 text-sm font-semibold">{CIRCULO(circulo)}</span>
                <span className="flex gap-1.5" aria-label={`${livres} de ${total} livres`} role="img">
                  {Array.from({ length: total }, (_, i) => (
                    <span
                      key={i}
                      className={`size-5 rounded-full border-2 ${
                        i < livres ? "border-[#4b3a8f] bg-[#6b55c9]" : "border-tinta-500/40 bg-transparent"
                      }`}
                    />
                  ))}
                </span>
                <span className="ml-auto flex gap-2">
                  <button
                    type="button"
                    disabled={ocupado || !livres}
                    onClick={() => void mudar(circulo, 1)}
                    aria-label={`Gastar um espaço de ${CIRCULO(circulo)}`}
                    className={`${BOTAO} px-3`}
                  >
                    Gastar
                  </button>
                  <button
                    type="button"
                    disabled={ocupado || !gastos}
                    onClick={() => void mudar(circulo, -1)}
                    aria-label={`Devolver um espaço de ${CIRCULO(circulo)}`}
                    className={`${BOTAO} px-3`}
                  >
                    Devolver
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-tinta-500 mt-2 text-xs">
          {base.pacto
            ? "Os espaços da Magia de Pacto voltam no Descanso Curto e no Longo."
            : "Os espaços voltam no Descanso Longo. Truques não gastam espaço."}
        </p>
      </Bloco>
    </div>
  );
}

// ---------- Mochila ----------

function Mochila({
  ficha,
  base,
  fazer,
  acoes,
  ocupado,
  setAviso,
}: Comum & { ficha: FichaViva; base: BaseDaFicha; setAviso: (a: { erro: boolean; texto: string }) => void }) {
  const [tirando, setTirando] = useState<ItemDaMochila | null>(null);
  const [quantos, setQuantos] = useState(1);

  async function beber(item: ItemDaMochila, dados: string) {
    const r = rolar(dados);
    const pv = Math.min(base.pvMaximo, ficha.pv + r.total);
    const ok = await fazer(() => acoes.mudar({ pv }));
    if (!ok) return;
    const erro = await acoes.tirar(item.id, 1);
    setAviso(
      erro
        ? { erro: true, texto: erro }
        : {
            erro: false,
            texto: `${item.nome} (${dados}): os dados deram ${r.dados.join(", ")}, mais ${r.bonus}, total ${r.total}. +${pv - ficha.pv} PV.`,
          }
    );
  }

  return (
    <div className="mt-6">
      <Bloco titulo="Mochila">
        {ficha.inventario.length ? (
          <ul className="divide-dourado-600/20 divide-y">
            {ficha.inventario.map((item) => {
              const pocao = curaDaPocao(item.nome);
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-2 py-2">
                  <span className="text-tinta-900 min-w-0 flex-1 text-sm">
                    {item.quantidade > 1 ? <strong>{item.quantidade}× </strong> : null}
                    {item.nome}
                    {pocao ? (
                      <Link href="/itens/pocoes-de-cura/" className="text-tinta-500 ml-1 text-xs underline">
                        cura {pocao}
                      </Link>
                    ) : null}
                  </span>
                  {pocao ? (
                    <button type="button" disabled={ocupado} onClick={() => void beber(item, pocao)} className={`${BOTAO} px-3`}>
                      Beber
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => {
                      setQuantos(1);
                      setTirando(item);
                    }}
                    className={`${BOTAO} px-3`}
                  >
                    Tirar
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-tinta-500 text-sm italic">A mochila está vazia.</p>
        )}
        {acoes.mestre ? (
          <PorNaMochila fazer={fazer} acoes={acoes} ocupado={ocupado} />
        ) : (
          <p className="text-tinta-500 mt-2 text-xs">Para pôr um item na mochila, peça ao Mestre lá embaixo.</p>
        )}
      </Bloco>

      <Janela aberta={Boolean(tirando)} aoFechar={() => setTirando(null)} titulo="Tirar da mochila">
        {tirando ? (
          <>
            <p className="text-tinta-700 text-sm">
              {tirando.nome}
              {tirando.quantidade > 1 ? ` (você tem ${tirando.quantidade})` : ""}. Item tirado só volta com um pedido ao Mestre.
            </p>
            {tirando.quantidade > 1 ? (
              <label className="text-tinta-700 mt-3 block text-xs">
                Quantos?
                <input
                  type="number"
                  min={1}
                  max={tirando.quantidade}
                  value={quantos}
                  onChange={(e) => setQuantos(Math.max(1, Math.min(tirando.quantidade, Math.floor(Number(e.target.value) || 1))))}
                  className={`${CAMPO} mt-1`}
                />
              </label>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={ocupado}
                onClick={async () => {
                  const ok = await fazer(() => acoes.tirar(tirando.id, quantos), `Tirado: ${quantos}× ${tirando.nome}.`);
                  if (ok) setTirando(null);
                }}
                className={BOTAO_CHEIO}
              >
                Tirar
              </button>
              <button type="button" onClick={() => setTirando(null)} className={BOTAO}>
                Deixar
              </button>
            </div>
          </>
        ) : null}
      </Janela>
    </div>
  );
}

// ---------- Bolsa ----------

function CamposDeMoedas({ valores, mudar }: { valores: Moedas; mudar: (m: Moedas) => void }) {
  const id = useId();
  return (
    <div className="grid grid-cols-5 gap-2">
      {TIPOS_DE_MOEDA.map((t) => (
        <label key={t.chave} htmlFor={`${id}-${t.chave}`} className="text-tinta-700 text-center text-xs">
          <abbr title={t.nome} className="font-titulo font-semibold no-underline">
            {t.chave.toUpperCase()}
          </abbr>
          <input
            id={`${id}-${t.chave}`}
            type="number"
            inputMode="numeric"
            min={0}
            value={valores[t.chave] ?? ""}
            onChange={(e) => mudar({ ...valores, [t.chave]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
            className={`${CAMPO} mt-1 px-1 text-center`}
            aria-label={t.nome}
          />
        </label>
      ))}
    </div>
  );
}

function Bolsa({ ficha, fazer, acoes, ocupado }: Comum & { ficha: FichaViva }) {
  const [gastando, setGastando] = useState(false);
  const [valores, setValores] = useState<Moedas>({});

  async function gastar(e: FormEvent) {
    e.preventDefault();
    const ok = await fazer(() => acoes.gastar(valores), `Gasto: ${moedasPorExtenso(valores)}.`);
    if (ok) {
      setValores({});
      setGastando(false);
    }
  }

  return (
    <div className="mt-6">
      <Bloco titulo="Bolsa">
        <ul className="flex flex-wrap gap-2">
          {TIPOS_DE_MOEDA.map((t) => (
            <li key={t.chave} className="border-dourado-600/30 rounded-sm border px-3 py-1.5 text-center">
              <span className="font-titulo text-tinta-900 block text-lg font-bold tabular-nums">{ficha.moedas[t.chave] ?? 0}</span>
              <abbr title={t.nome} className="text-tinta-500 text-xs no-underline">
                {t.chave.toUpperCase()}
              </abbr>
            </li>
          ))}
        </ul>
        {acoes.mestre ? <MexerNaBolsa fazer={fazer} acoes={acoes} ocupado={ocupado} /> : null}
        {acoes.mestre ? null : gastando ? (
          <form onSubmit={gastar} className="mt-3">
            <CamposDeMoedas valores={valores} mudar={setValores} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="submit" disabled={ocupado} className={BOTAO_CHEIO}>
                Gastar
              </button>
              <button type="button" onClick={() => setGastando(false)} className={BOTAO}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setGastando(true)} className={`${BOTAO} mt-3`}>
            Gastar moedas
          </button>
        )}
      </Bloco>
    </div>
  );
}

// ---------- Pedidos ao Mestre ----------

const ESTADO = {
  pendente: { texto: "esperando o Mestre", cor: "text-[#a8701c]" },
  aprovado: { texto: "aprovado", cor: "text-[#3f7d3a]" },
  recusado: { texto: "recusado", cor: "text-heraldico-vermelho" },
} as const;

function Pedidos({ pedidos, fazer, acoes, ocupado, mestre }: Comum & { pedidos: Pedido[]; mestre: boolean }) {
  const [tipo, setTipo] = useState<"item" | "moedas">("item");
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [moedas, setMoedas] = useState<Moedas>({});
  const [motivo, setMotivo] = useState("");
  const id = useId();

  async function pedir(e: FormEvent) {
    e.preventDefault();
    const ok = await fazer(
      () => (tipo === "item" ? acoes.pedirItem(item, quantidade, motivo) : acoes.pedirMoedas(moedas, motivo)),
      "Pedido enviado ao Mestre."
    );
    if (ok) {
      setItem("");
      setQuantidade(1);
      setMoedas({});
      setMotivo("");
    }
  }

  return (
    <div className="mt-6">
      <Bloco titulo="Pedidos ao Mestre">
        {!mestre ? (
          <form onSubmit={pedir} className="border-dourado-600/30 space-y-3 rounded-sm border p-3">
            <div className="flex gap-1" role="group" aria-label="O que pedir">
              {(["item", "moedas"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tipo === t}
                  onClick={() => setTipo(t)}
                  className={`font-titulo min-h-11 flex-1 rounded-sm px-3 text-sm font-semibold ${
                    tipo === t ? "bg-madeira-800 text-pergaminho-50" : "text-tinta-700 hover:bg-dourado-400/15"
                  }`}
                >
                  {t === "item" ? "Um item" : "Moedas"}
                </button>
              ))}
            </div>
            {tipo === "item" ? (
              <div className="grid grid-cols-[1fr_5rem] gap-2">
                <label htmlFor={`${id}-item`} className="text-tinta-700 text-xs">
                  Item
                  <input id={`${id}-item`} value={item} maxLength={80} onChange={(e) => setItem(e.target.value)} className={`${CAMPO} mt-1`} />
                </label>
                <label htmlFor={`${id}-qtd`} className="text-tinta-700 text-xs">
                  Quantos
                  <input
                    id={`${id}-qtd`}
                    type="number"
                    min={1}
                    max={999}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className={`${CAMPO} mt-1`}
                  />
                </label>
              </div>
            ) : (
              <CamposDeMoedas valores={moedas} mudar={setMoedas} />
            )}
            <label htmlFor={`${id}-motivo`} className="text-tinta-700 block text-xs">
              De onde veio? (opcional)
              <input
                id={`${id}-motivo`}
                value={motivo}
                maxLength={300}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Comprei na loja de Portela do Véu"
                className={`${CAMPO} mt-1`}
              />
            </label>
            <button type="submit" disabled={ocupado} className={BOTAO_CHEIO}>
              Pedir ao Mestre
            </button>
          </form>
        ) : null}

        {pedidos.length ? (
          <ul className="mt-3 space-y-2">
            {pedidos.map((p) => (
              <LinhaDoPedido key={p.id} pedido={p} fazer={fazer} acoes={acoes} ocupado={ocupado} mestre={mestre} />
            ))}
          </ul>
        ) : (
          <p className="text-tinta-500 mt-3 text-sm italic">Nenhum pedido ainda.</p>
        )}
      </Bloco>
    </div>
  );
}

export function LinhaDoPedido({
  pedido: p,
  fazer,
  acoes,
  ocupado,
  mestre,
  quem,
}: Comum & { pedido: Pedido; mestre: boolean; quem?: string }) {
  const [resposta, setResposta] = useState("");
  const oQue = p.tipo === "item" ? `${p.quantidade}× ${p.item}` : moedasPorExtenso(p.moedas);
  return (
    <li className="border-dourado-600/20 rounded-sm border px-3 py-2 text-sm">
      <p className="text-tinta-900">
        {quem ? <strong>{quem}: </strong> : null}
        {oQue} <span className={`text-xs ${ESTADO[p.estado].cor}`}>· {ESTADO[p.estado].texto}</span>
      </p>
      {p.motivo ? <p className="text-tinta-500 text-xs">{p.motivo}</p> : null}
      {p.resposta ? <p className="text-tinta-700 text-xs italic">Mestre: {p.resposta}</p> : null}
      {p.estado === "pendente" ? (
        mestre && acoes.resolver ? (
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <input
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              placeholder="Resposta (opcional)"
              aria-label="Resposta ao pedido"
              maxLength={300}
              className={`${CAMPO} min-w-0 flex-1`}
            />
            <button
              type="button"
              disabled={ocupado}
              onClick={() => void fazer(() => acoes.resolver!(p.id, true, resposta), "Pedido aprovado: já está na ficha.")}
              className={`${BOTAO} px-3`}
            >
              Aprovar
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => void fazer(() => acoes.resolver!(p.id, false, resposta), "Pedido recusado.")}
              className={`${BOTAO} px-3`}
            >
              Recusar
            </button>
          </div>
        ) : !mestre ? (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => void fazer(() => acoes.desistir(p.id), "Pedido desfeito.")}
            className="text-tinta-500 hover:text-tinta-900 mt-1 min-h-8 text-xs underline"
          >
            Desistir do pedido
          </button>
        ) : null
      ) : null}
    </li>
  );
}

// ---------- Só do Mestre ----------

function Experiencia({ ficha, base, fazer, acoes, ocupado }: Comum & { ficha: FichaViva; base: BaseDaFicha }) {
  const [valor, setValor] = useState("");
  const id = useId();
  const total = base.experiencia + (ficha.experiencia_ganha ?? 0);
  // O começo da barra é o XP do nível atual
  const anterior = XP_DO_NIVEL[base.nivel - 1] ?? 0;
  const fracao = base.proximoNivel ? Math.min(1, Math.max(0, (total - anterior) / (base.proximoNivel - anterior))) : 1;
  const quanto = Math.floor(Number(valor) || 0);

  return (
    <div className="mt-6">
      <Bloco titulo="Experiência">
        <p className="text-tinta-700 text-sm">
          <strong className="font-titulo text-tinta-900 text-lg tabular-nums">{total.toLocaleString("pt-BR")} XP</strong>
          {base.proximoNivel ? (
            total >= base.proximoNivel ? (
              <span className="text-dourado-600 ml-2 font-semibold">Pronto para o nível {base.nivel + 1}!</span>
            ) : (
              <span className="ml-2">
                faltam {(base.proximoNivel - total).toLocaleString("pt-BR")} para o nível {base.nivel + 1}
              </span>
            )
          ) : (
            <span className="ml-2">nível máximo</span>
          )}
        </p>
        <div className="bg-madeira-800/15 mt-2 h-2 overflow-hidden rounded-full" aria-hidden>
          <div className="bg-dourado-600 h-full rounded-full" style={{ width: `${fracao * 100}%` }} />
        </div>
        {acoes.mestre ? (
          <div className="mt-3 flex items-end gap-2">
            <label htmlFor={id} className="text-tinta-700 flex-1 text-xs">
              XP (negativo tira)
              <input id={id} type="number" inputMode="numeric" value={valor} onChange={(e) => setValor(e.target.value)} className={`${CAMPO} mt-1`} />
            </label>
            <button
              type="button"
              disabled={ocupado || !quanto}
              onClick={async () => {
                if (await fazer(() => acoes.mestre!.xp(quanto), `${quanto > 0 ? "+" : ""}${quanto} XP.`)) setValor("");
              }}
              className={BOTAO}
            >
              Dar XP
            </button>
          </div>
        ) : null}
      </Bloco>
    </div>
  );
}


function PorNaMochila({ fazer, acoes, ocupado }: Comum) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const id = useId();

  async function por(e: FormEvent) {
    e.preventDefault();
    if (await fazer(() => acoes.mestre!.item(nome, quantidade), `Na mochila: ${quantidade}× ${nome.trim()}.`)) {
      setNome("");
      setQuantidade(1);
    }
  }

  return (
    <form onSubmit={por} className="border-dourado-600/30 mt-3 grid grid-cols-[1fr_4.5rem] items-end gap-2 rounded-sm border p-3">
      <label htmlFor={`${id}-nome`} className="text-tinta-700 text-xs">
        Pôr na mochila (Mestre)
        <input id={`${id}-nome`} value={nome} maxLength={80} onChange={(e) => setNome(e.target.value)} className={`${CAMPO} mt-1`} />
      </label>
      <label htmlFor={`${id}-qtd`} className="text-tinta-700 text-xs">
        Quantos
        <input
          id={`${id}-qtd`}
          type="number"
          min={1}
          max={999}
          value={quantidade}
          onChange={(e) => setQuantidade(Math.max(1, Math.min(999, Math.floor(Number(e.target.value) || 1))))}
          className={`${CAMPO} mt-1`}
        />
      </label>
      <button type="submit" disabled={ocupado || !nome.trim()} className={`${BOTAO_CHEIO} col-span-2`}>
        Pôr na mochila
      </button>
    </form>
  );
}

function MexerNaBolsa({ fazer, acoes, ocupado }: Comum) {
  const [valores, setValores] = useState<Moedas>({});

  async function mexer(sinal: 1 | -1) {
    const deltas = Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, (v ?? 0) * sinal])) as Moedas;
    const texto = `${sinal > 0 ? "Posto na bolsa" : "Tirado da bolsa"}: ${moedasPorExtenso(valores)}.`;
    if (await fazer(() => acoes.mestre!.moedas(deltas), texto)) setValores({});
  }

  const vazio = !Object.values(valores).some((v) => (v ?? 0) > 0);
  return (
    <div className="border-dourado-600/30 mt-3 rounded-sm border p-3">
      <p className="text-tinta-700 mb-1 text-xs">Mexer na bolsa (Mestre)</p>
      <CamposDeMoedas valores={valores} mudar={setValores} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" disabled={ocupado || vazio} onClick={() => void mexer(1)} className={BOTAO_CHEIO}>
          Pôr
        </button>
        <button type="button" disabled={ocupado || vazio} onClick={() => void mexer(-1)} className={BOTAO}>
          Tirar
        </button>
      </div>
    </div>
  );
}

function Recado({ fazer, acoes, ocupado }: Comum) {
  const [texto, setTexto] = useState("");
  const id = useId();
  return (
    <div className="mt-6">
      <Bloco titulo="Recado para o jogador">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await fazer(() => acoes.mestre!.recado(texto), "Recado enviado.")) setTexto("");
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor={id} className="sr-only">
            Recado
          </label>
          <input
            id={id}
            value={texto}
            maxLength={260}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Aparece na tela dele na hora"
            className={`${CAMPO} flex-1`}
          />
          <button type="submit" disabled={ocupado || !texto.trim()} className={BOTAO}>
            Enviar
          </button>
        </form>
      </Bloco>
    </div>
  );
}
