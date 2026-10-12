"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BaseDaFicha } from "@/lib/ficha-viva-base";
import {
  criarFicha,
  desistirDoPedido,
  gastarMoedas,
  lerFicha,
  listarPedidos,
  mudarFicha,
  pedirItem,
  pedirMoedas,
  resolverPedido,
  tirarItem,
  type FichaViva,
  type Pedido,
} from "@/lib/ficha-viva";
import { useConta } from "@/components/conta/useConta";
import { BOTAO_CHEIO } from "@/components/conta/MinhaConta";
import { PainelDaFicha, type AcoesDaFicha, type RegrasDaFicha } from "./PainelDaFicha";

/**
 * A ficha viva na página do personagem. Só aparece para a conta ligada a
 * ele e para o Mestre; para o resto do mundo a página fica como sempre foi.
 *
 * Lê a ficha ao abrir e de novo quando a pessoa volta para a aba (assim um
 * pedido aprovado pelo Mestre aparece sem recarregar).
 */
export function FichaVivaDoPersonagem({
  slug,
  base,
  regras,
}: {
  slug: string;
  base: BaseDaFicha;
  regras: RegrasDaFicha;
}) {
  const conta = useConta();
  const mestre = conta.fase === "dentro" && conta.perfil.papel === "mestre";
  const dono = conta.fase === "dentro" && conta.perfil.personagem === slug;
  const pode = mestre || dono;

  const [ficha, setFicha] = useState<FichaViva | null | undefined>(undefined);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    const [f, p] = await Promise.all([lerFicha(slug), listarPedidos(slug)]);
    setFicha(f);
    setPedidos(p);
  }, [slug]);

  useEffect(() => {
    if (!pode) return;
    void recarregar();
    const aoVoltar = () => {
      if (document.visibilityState === "visible") void recarregar();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [pode, recarregar]);

  const acoes = useMemo<AcoesDaFicha>(() => {
    /** Faz a ação no banco e lê tudo de novo (o banco tem a última palavra). */
    const e = (acao: () => Promise<string | null>) => async () => {
      const problema = await acao();
      await recarregar();
      return problema;
    };
    return {
      mudar: async (m) => {
        // A tela muda na hora; se o banco recusar, volta ao que estava
        setFicha((f) => (f ? { ...f, ...m } : f));
        return e(() => mudarFicha(slug, m))();
      },
      tirar: (item, q) => e(() => tirarItem(slug, item, q))(),
      gastar: (m) => e(() => gastarMoedas(slug, m))(),
      pedirItem: (i, q, mot) => e(() => pedirItem(slug, i, q, mot))(),
      pedirMoedas: (m, mot) => e(() => pedirMoedas(slug, m, mot))(),
      desistir: (id) => e(() => desistirDoPedido(id))(),
      resolver: mestre ? (id, ok, r) => e(() => resolverPedido(id, ok, r))() : undefined,
    };
  }, [slug, mestre, recarregar]);

  if (!pode || ficha === undefined) return null;

  if (ficha === null) {
    return (
      <div className="border-heraldico-vermelho/30 mb-8 rounded-sm border-2 border-dashed p-4 text-center sm:p-6">
        <p className="font-titulo text-tinta-900 text-lg font-bold">Ficha viva</p>
        {mestre ? (
          <>
            <p className="text-tinta-700 mt-1 text-sm">
              Este personagem ainda não tem ficha viva. Ela começa com os PV cheios e com a mochila e a bolsa desta ficha.
            </p>
            <button
              type="button"
              onClick={async () => {
                const problema = await criarFicha(slug, base);
                if (problema) setErro(problema);
                await recarregar();
              }}
              className={`${BOTAO_CHEIO} mt-3`}
            >
              Abrir a ficha viva
            </button>
            {erro ? (
              <p role="alert" className="text-heraldico-vermelho mt-2 text-sm">
                {erro}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-tinta-700 mt-1 text-sm">
            O Mestre ainda não abriu a sua ficha viva. Quando abrir, aqui vão aparecer os seus PV, os espaços de magia, a
            mochila e a bolsa.
          </p>
        )}
      </div>
    );
  }

  return <PainelDaFicha ficha={ficha} base={base} pedidos={pedidos} acoes={acoes} regras={regras} mestre={mestre} />;
}
