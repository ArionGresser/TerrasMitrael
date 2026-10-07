import { buscarPersonagem } from "./personagens";
import { chaveDaTemporada, chaveDoEpisodio, ultimoEpisodio } from "./contos";

/**
 * O mural de novidades da página inicial: o que entrou no site por último.
 *
 * Para anunciar algo novo, acrescente uma linha no começo de REGISTRO. O
 * episódio mais recente dos Contos não precisa de linha: ele aparece no topo
 * sozinho, sempre que um episódio novo é publicado.
 */

type Registro =
  | { tipo: "personagem"; data: string; slug: string; nota: string }
  | { tipo: "aviso"; data: string; titulo: string; texto: string; href: string; imagem: string };

const REGISTRO: Registro[] = [
  {
    tipo: "aviso",
    data: "2026-10-07",
    titulo: "Grimório",
    texto:
      "As 339 magias das regras de 2024 em português, com busca por nome, classe, círculo e escola.",
    href: "/magias/",
    imagem: "/images/book.jpg",
  },
  {
    tipo: "aviso",
    data: "2026-10-06",
    titulo: "Contos de Mitrael",
    texto:
      "Uma aba nova, onde cada sessão jogada vira episódio. A Temporada 2 já está no ar.",
    href: "/contos/",
    imagem: "/images/contos/cronicas/t2e2-saida.webp",
  },
  {
    tipo: "personagem",
    data: "2026-10-06",
    slug: "egon-vitriol",
    nota: "Entrou para o elenco atual",
  },
  {
    tipo: "personagem",
    data: "2026-10-06",
    slug: "bralzeg-lodbrok",
    nota: "Entrou para a primeira geração",
  },
];

export type Novidade = {
  chave: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  href: string;
  imagem: string;
  /** Onde fica o rosto na imagem, quando é retrato. */
  posicao?: string;
  data: string;
};

/** Tudo o que há de novo, do mais recente para o mais antigo. */
export function novidades(limite = 5): Novidade[] {
  const lista: Novidade[] = [];

  const novo = ultimoEpisodio();
  if (novo) {
    const { serie, temporada, episodio } = novo;
    lista.push({
      chave: "episodio",
      etiqueta: `Episódio novo · T${temporada.numero}E${episodio.meta.numero}`,
      titulo: episodio.meta.titulo,
      texto: episodio.meta.resumo,
      href: `/contos/${serie.slug}/${chaveDaTemporada(temporada)}/${chaveDoEpisodio(episodio)}/`,
      ...imagemDoEpisodio(episodio.meta.capa, episodio.meta.elenco),
      data: "",
    });
  }

  for (const item of REGISTRO) {
    if (item.tipo === "aviso") {
      lista.push({ chave: item.href, etiqueta: "Novo no site", ...item });
      continue;
    }
    const personagem = buscarPersonagem(item.slug);
    if (!personagem) continue;
    const { nome, imagem, rosto, resumo } = personagem.meta;
    lista.push({
      chave: item.slug,
      etiqueta: "Personagem novo",
      titulo: nome,
      texto: `${item.nota}. ${resumo}`,
      href: `/personagens/${item.slug}/`,
      imagem,
      posicao: rosto ? `${rosto.x * 100}% ${rosto.y * 100}%` : "top",
      data: item.data,
    });
  }

  return lista.slice(0, limite);
}

/** A capa do episódio, ou o rosto de quem abre o elenco quando não há capa. */
function imagemDoEpisodio(capa: string | undefined, elenco: string[]) {
  if (capa) return { imagem: capa };
  const primeiro = buscarPersonagem(elenco[0])?.meta;
  if (!primeiro) return { imagem: "/images/contos/cronicas/t2e2-saida.webp" };
  const { imagem, rosto } = primeiro;
  return {
    imagem,
    posicao: rosto ? `${rosto.x * 100}% ${rosto.y * 100}%` : "top",
  };
}
