"use client";

import { useState } from "react";
import { CHAVES_DAS_TAGS } from "@/lib/tags";
import { tocar } from "@/lib/som";
import { Fitas } from "./Fitas";

/** Quantas ficam à vista antes de alguém puxar o resto do mural. */
const A_VISTA = 6;

/**
 * O glossário das fitas, pregado no mural junto com os cartazes.
 *
 * As primeiras aparecem de cara, porque são as que a pessoa acabou de ver
 * nos cartazes acima. O resto existe mas não pesa na tela: fica atrás do
 * puxador, para quem tiver curiosidade de saber o que ainda pode aparecer.
 */
export function Glossario() {
  const [tudo, setTudo] = useState(false);

  const escondidas = CHAVES_DAS_TAGS.length - A_VISTA;
  const chaves = tudo ? CHAVES_DAS_TAGS : CHAVES_DAS_TAGS.slice(0, A_VISTA);

  return (
    <div>
      <Fitas chaves={chaves} />

      {escondidas > 0 ? (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setTudo((v) => !v);
              tocar(tudo ? "fecharMenu" : "abrirMenu");
            }}
            aria-expanded={tudo}
            className="font-titulo text-tinta-500 hover:text-tinta-900 group inline-flex min-h-11 items-center gap-2 px-3 text-[0.68rem] tracking-[0.18em] uppercase transition-colors"
          >
            {tudo
              ? "Recolher o pergaminho"
              : `Puxar o pergaminho: mais ${escondidas} fitas`}
            <span
              aria-hidden
              className={`transition-transform duration-300 ${
                tudo ? "rotate-180" : "group-hover:translate-y-0.5"
              }`}
            >
              ▾
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
