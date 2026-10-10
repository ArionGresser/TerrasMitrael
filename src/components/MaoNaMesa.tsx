"use client";

import { useEffect } from "react";
import { tocar } from "@/lib/som";
import { conquistar, contar } from "@/lib/conquistas";

/**
 * O que a mão faz ao clicar.
 *
 * Em qualquer lugar, enquanto o botão está apertado, o cursor troca para a
 * pose de empurrar o dedo (a classe `apertando` no <html>).
 *
 * Se o clique cai na madeira da mesa, e não num papel, botão ou imagem, a
 * mesa responde: um "toc" de madeira e umas lascas pulando do ponto. Se cai
 * numa das ferragens de ferro da viga ou do rodapé, é um "clang" e faíscas.
 *
 * Nas coisas da mesa 3D (src/lib/mesa3d/cena.ts), cada uma responde do seu
 * jeito: o d20 é pego e jogado, as moedas pulam e tilintam, a vela tremula
 * com um sopro e o pano abafa o golpe.
 *
 * As ferragens são enfeite e não recebem clique (o clique passa direto para
 * o tampo embaixo delas), então elas são achadas pela posição na tela.
 *
 * Como saber que é madeira: tudo o que está empilhado embaixo do ponto do
 * clique (não só o caminho até o <body>, porque um título pode estar por
 * cima de uma imagem que nem é parente dele) não pode ter fundo próprio,
 * ser imagem nem ser clicável. O rodapé é tábua de verdade, então conta
 * como mesa também. A viga do cabeçalho não recebe clique (deixa passar
 * para o tampo), então já cai na regra.
 */

const CLICAVEL = "a, button, input, select, textarea, label, summary, [role='button'], [role='tab'], [tabindex]:not([tabindex='-1'])";

function ehMadeira(x: number, y: number, alvo: EventTarget | null): boolean {
  if (!(alvo instanceof Element) || alvo.closest(CLICAVEL)) return false;
  for (const el of document.elementsFromPoint(x, y)) {
    if (el === document.body || el === document.documentElement) break;
    if (el.classList.contains("tabua-rodape")) return true;
    if (["IMG", "svg", "CANVAS", "VIDEO", "PICTURE"].includes(el.tagName)) return false;
    const estilo = getComputedStyle(el);
    if (estilo.backgroundImage !== "none") return false;
    const cor = estilo.backgroundColor.match(/[\d.]+/g);
    if (cor && (cor.length === 3 || Number(cor[3]) > 0.25)) return false;
  }
  return true;
}

function ehFerro(x: number, y: number): boolean {
  for (const el of document.querySelectorAll(".ferragem")) {
    const r = el.getBoundingClientRect();
    if (x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2) return true;
  }
  return false;
}

function lascas(x: number, y: number, ferro = false) {
  const batida = document.createElement("div");
  batida.className = ferro ? "batida-madeira batida-ferro" : "batida-madeira";
  batida.style.left = `${x}px`;
  batida.style.top = `${y}px`;
  for (let i = 0; i < 6; i++) {
    const lasca = document.createElement("span");
    lasca.className = "lasca";
    // Leque para cima, cada lasca num ângulo e numa distância diferentes
    const ang = -70 + i * 28 + (Math.random() * 14 - 7);
    lasca.style.setProperty("--ang", `${ang}deg`);
    lasca.style.setProperty("--dist", `${16 + Math.random() * 16}px`);
    lasca.style.setProperty("--giro", `${Math.random() * 360 - 180}deg`);
    batida.appendChild(lasca);
  }
  document.body.appendChild(batida);
  window.setTimeout(() => batida.remove(), 700);
}

/**
 * Quem pegou o dado em cima de um link não queria seguir o link: o clique
 * que vem logo depois de soltar é engolido.
 */
function engolirClique() {
  const engolir = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  window.addEventListener("click", engolir, { capture: true, once: true });
  window.setTimeout(() => window.removeEventListener("click", engolir, { capture: true }), 4000);
}

export function MaoNaMesa() {
  useEffect(() => {
    const raiz = document.documentElement;
    let ultima = 0;

    function aoApertar(e: PointerEvent) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      raiz.classList.add("apertando");
      const madeira = ehMadeira(e.clientX, e.clientY, e.target);

      // As coisas da mesa respondem primeiro, do seu jeito: o dado e as
      // moedas vêm para a pinça (até por cima do papel, onde eles rolam
      // também), a vela tremula e o pano abafa o golpe
      if (window.__mesa3d?.apertar(e.clientX, e.clientY, madeira)) {
        e.preventDefault();
        engolirClique();
        return;
      }

      if (!madeira) return;
      const agora = performance.now();
      if (agora - ultima < 80) return;
      ultima = agora;

      const ferro = ehFerro(e.clientX, e.clientY);
      tocar(ferro ? "metal" : "madeira");
      lascas(e.clientX, e.clientY, ferro);
      if (ferro) conquistar("ferro");
      else contar("batidas");
    }
    function aoSoltar() {
      raiz.classList.remove("apertando");
    }

    window.addEventListener("pointerdown", aoApertar);
    window.addEventListener("pointerup", aoSoltar);
    window.addEventListener("pointercancel", aoSoltar);
    window.addEventListener("blur", aoSoltar);
    return () => {
      window.removeEventListener("pointerdown", aoApertar);
      window.removeEventListener("pointerup", aoSoltar);
      window.removeEventListener("pointercancel", aoSoltar);
      window.removeEventListener("blur", aoSoltar);
    };
  }, []);

  return null;
}
