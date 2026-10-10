/**
 * A memória de onde a pessoa estava em cada tela.
 *
 * Quem desce o Grimório até "Bola de Fogo", abre a magia e volta pelo selo
 * do papel tem que cair de novo em "Bola de Fogo", com os mesmos filtros, e
 * não no topo da lista. Para isso, cada tela guarda aqui, enquanto a pessoa
 * rola, a altura em que ela está e os filtros do endereço (?classe=mago).
 *
 * Fica no sessionStorage: vale para esta aba, até ela fechar, e some
 * sozinho depois. Sem armazenamento (navegação privada antiga), vale só
 * enquanto a página não recarrega.
 */

export type Lugar = { y: number; busca: string };

const CHAVE = "mitrael:lugares";
let lugares: Record<string, Lugar> | null = null;
let pendente: { caminho: string; y: number } | null = null;

const normalizar = (caminho: string) => (caminho.endsWith("/") ? caminho : `${caminho}/`);

function todos(): Record<string, Lugar> {
  if (lugares) return lugares;
  try {
    lugares = JSON.parse(sessionStorage.getItem(CHAVE) ?? "{}") as Record<string, Lugar>;
  } catch {
    lugares = {};
  }
  return lugares;
}

let gravacao = 0;
/** Anota onde a pessoa está na tela de agora. */
export function anotarLugar() {
  const caminho = normalizar(window.location.pathname);
  todos()[caminho] = { y: Math.round(window.scrollY), busca: window.location.search };
  window.clearTimeout(gravacao);
  gravacao = window.setTimeout(() => {
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(todos()));
    } catch {
      // Fica só na memória da página
    }
  }, 250);
}

export function lugarGuardado(caminho: string): Lugar | null {
  if (typeof window === "undefined") return null;
  return todos()[normalizar(caminho)] ?? null;
}

/** Pede que, ao chegar em `caminho`, a tela desça até `y`. */
export function pedirVolta(caminho: string, y: number) {
  pendente = { caminho: normalizar(caminho), y };
}

/** A altura pedida para esta tela, uma vez só. */
export function voltaPendente(caminho: string): number | null {
  if (!pendente || pendente.caminho !== normalizar(caminho)) return null;
  const { y } = pendente;
  pendente = null;
  return y;
}
