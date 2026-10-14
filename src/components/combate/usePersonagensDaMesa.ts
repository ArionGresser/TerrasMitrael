"use client";

import { useEffect, useState } from "react";
import { lerTodasAsFichas } from "@/lib/ficha-viva";
import { caComAjustes, nivelComAjustes, pvMaximoComAjustes } from "@/lib/ajustes-da-ficha";
import type { PersonagemDoCombate } from "./GeradorDeEncontros";

/**
 * Os personagens com o nível e o PV máximo da mesa: quem subiu de nível na
 * ficha viva conta com o nível novo no orçamento de XP do encontro, antes
 * mesmo de a ficha do site ser atualizada.
 */
export function usePersonagensDaMesa(personagens: PersonagemDoCombate[]): PersonagemDoCombate[] {
  const [lista, setLista] = useState(personagens);

  useEffect(() => {
    let vivo = true;
    void lerTodasAsFichas().then((fichas) => {
      if (!vivo) return;
      const porSlug = new Map(fichas.map((f) => [f.personagem, f]));
      setLista(
        personagens.map((p) => {
          const f = porSlug.get(p.slug);
          return f
            ? {
                ...p,
                nivel: nivelComAjustes(p.nivel, f.ajustes),
                pvMaximo: pvMaximoComAjustes(p.pvMaximo, f.ajustes),
                ca: caComAjustes(p.ca, p.atributos ?? [], p.classe ?? null, f.ajustes),
              }
            : p;
        })
      );
    });
    return () => {
      vivo = false;
    };
  }, [personagens]);

  return lista;
}
