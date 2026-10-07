"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * O fio dourado no alto da tela que mostra quanto do episódio já foi lido.
 *
 * Quem move o fio é o próprio CSS, pela rolagem (veja .barra-leitura em
 * globals.css). Este componente só existe para pendurar o fio direto no
 * corpo da página: dentro do conteúdo ele ficaria por baixo da luz de vela
 * e do selo, que estão numa camada acima.
 */
export function BarraLeitura() {
  const [corpo, setCorpo] = useState<HTMLElement | null>(null);
  useEffect(() => setCorpo(document.body), []);
  return corpo ? createPortal(<div aria-hidden className="barra-leitura" />, corpo) : null;
}
