/**
 * O cursor de mão do site: as variantes e a escolha guardada.
 *
 * Os desenhos saem de scripts/cursores/gerar-cursores.py, e o CSS que liga
 * cada um fica no fim de app/globals.css. Aqui só se decide qual vale: o
 * nome dele vai no atributo data-cursor do <html>.
 */

export type Cursor = { chave: string; nome: string };

export const CURSORES: Cursor[] = [
  { chave: "couro", nome: "Luva de couro" },
  { chave: "nua", nome: "Sem luva" },
  { chave: "sem-dedos", nome: "Luva sem dedos" },
  { chave: "manopla", nome: "Manopla de aço" },
  { chave: "goblin", nome: "Mão de goblin" },
  { chave: "esqueleto", nome: "Mão de esqueleto" },
  { chave: "draconato", nome: "Garra de draconato" },
  { chave: "mago", nome: "Luva de mago" },
  { chave: "sistema", nome: "Cursor normal" },
];

const CHAVE = "mitrael:cursor";
const PADRAO = "couro";

export function cursorSalvo(): string {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo && CURSORES.some((c) => c.chave === salvo)) return salvo;
  } catch {
    // Sem armazenamento: fica o padrão
  }
  return PADRAO;
}

export function aplicarCursor(chave: string, guardar = true) {
  const raiz = document.documentElement;
  if (chave === "sistema") raiz.removeAttribute("data-cursor");
  else raiz.setAttribute("data-cursor", chave);
  if (!guardar) return;
  try {
    localStorage.setItem(CHAVE, chave);
  } catch {
    // Navegação privada: vale até fechar a aba
  }
}
