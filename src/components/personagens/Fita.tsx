import type { CSSProperties } from "react";
import { buscarTag, type Tag } from "@/lib/tags";

/**
 * O visual da fita, separado do comportamento.
 *
 * Este arquivo não é cliente de propósito. A fita muda do cartaz não abre
 * nada, então não precisa de nenhum javascript no navegador: o mural do
 * mural de personagens sai do build já pronto. Só o glossário e a ficha,
 * onde a fita abre, carregam o componente interativo de Fitas.tsx.
 */

export function estiloDaFita(tag: Tag): CSSProperties {
  return {
    backgroundColor: tag.cor.fita,
    color: tag.cor.letra,
    boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.22), inset 0 -2px 4px ${tag.cor.sombra}, 0 2px 4px rgb(0 0 0 / 0.4)`,
  };
}

/** A linha de costura que corre pela fita, rente à borda esquerda. */
export function Costura({ tag }: { tag: Tag }) {
  return (
    <span
      aria-hidden
      className="absolute inset-y-1 left-1.5 w-px border-l border-dashed opacity-50"
      style={{ borderColor: tag.cor.letra }}
    />
  );
}

/**
 * As fitas do cartaz no mural: pequenas, só para identificar de relance.
 *
 * Não abrem. Quem quiser saber o que cada uma quer dizer tem o glossário
 * logo abaixo no mesmo mural, e a ficha do personagem, onde elas abrem.
 */
export function FitasMudas({ chaves }: { chaves: string[] }) {
  if (chaves.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {chaves.map((chave) => {
        const tag = buscarTag(chave);

        return (
          <li key={chave}>
            <span
              className="fita font-titulo relative flex items-center py-0.5 pr-3.5 pl-2.5 text-[0.55rem] font-bold tracking-[0.1em] uppercase"
              style={estiloDaFita(tag)}
            >
              <Costura tag={tag} />
              {tag.nome}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
