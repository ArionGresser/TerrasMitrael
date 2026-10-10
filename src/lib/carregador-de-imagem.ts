import tamanhos from "./tamanhos-das-imagens.json";

/**
 * Escolhe o arquivo de cada imagem conforme o tamanho em que ela aparece.
 *
 * O site é estático, então não há servidor para encolher imagem na hora. As
 * versões menores são feitas antes, por scripts/imagens/gerar-tamanhos.py,
 * e moram em public/tamanhos/ com o mesmo caminho da original. O Next pede
 * uma largura para cada densidade de tela, e aqui sai a menor cópia que
 * ainda cobre essa largura. Num celular, a faixa de retrato do cartaz dos
 * Contos baixava o retrato inteiro de 280 KB; agora baixa uma cópia de uns
 * 20 KB.
 *
 * Imagem que ainda não passou pelo script sai como sempre saiu. O "#" no
 * fim não muda o arquivo baixado (o navegador ignora o que vem depois dele)
 * e só serve para o Next não achar que este carregador esqueceu a largura.
 */
const LISTA = tamanhos as Record<string, number[]>;

export default function carregarImagem({ src, width }: { src: string; width: number; quality?: number }) {
  const larguras = LISTA[src];
  if (!larguras) return `${src}#`;
  const copia = larguras.find((w) => w >= width) ?? (src.endsWith(".webp") ? undefined : larguras[larguras.length - 1]);
  if (!copia) return `${src}#`;
  return `/tamanhos${src.replace(/\.\w+$/, "")}.w${copia}.webp`;
}
