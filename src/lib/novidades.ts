import { buscarPersonagem } from "./personagens";
import { SERIES_DISPONIVEIS, chaveDaTemporada, chaveDoEpisodio } from "./contos";
import type { Icone } from "./conquistas";

/**
 * O mural de novidades: tudo o que entrou no site, do mais novo para o mais
 * antigo. A página inicial mostra as primeiras; /novidades/ mostra todas.
 *
 * Os episódios das Crônicas entram sozinhos, pela data `publicado` da meta de
 * cada um. O resto (personagens, abas novas) vai em REGISTRO, com data e
 * hora no fuso de Brasília. A ordem do arquivo não importa: a lista sai
 * sempre ordenada pela data.
 */

type Registro =
  | { tipo: "personagem"; data: string; slug: string; nota: string }
  | {
      tipo: "aviso";
      data: string;
      titulo: string;
      texto: string;
      href: string;
      /** Sem imagem, a miniatura mostra o `icone` gravado na madeira. */
      imagem?: string;
      icone?: Icone;
      /** Onde fica o assunto na imagem, quando ela é cortada. */
      posicao?: string;
    };

const REGISTRO: Registro[] = [
  {
    tipo: "personagem",
    data: "2026-10-06T13:51-03:00",
    slug: "egon-vitriol",
    nota: "Entrou para o elenco atual",
  },
  {
    tipo: "personagem",
    data: "2026-10-06T20:29-03:00",
    slug: "bralzeg-lodbrok",
    nota: "Entrou para a primeira geração",
  },
  {
    tipo: "aviso",
    data: "2026-10-06T20:47-03:00",
    titulo: "Crônicas de Mitrael",
    texto:
      "Uma aba nova, onde cada sessão jogada vira episódio, temporada por temporada.",
    href: "/contos/",
    imagem: "/images/contos/cronicas-cartao.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T11:10-03:00",
    titulo: "Mitrael de cara nova",
    texto:
      "O mapa do continente na entrada, a viga e o selo redesenhados, pergaminhos que se desenrolam e fichas organizadas em quadros.",
    href: "/personagens/",
    imagem: "/images/heroi-mapa-alto.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T11:36-03:00",
    titulo: "Grimório",
    texto:
      "As 339 magias das regras de 2024 em português, com busca por nome, classe, círculo e escola.",
    href: "/magias/",
    imagem: "/images/compendio/magias.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T12:34-03:00",
    titulo: "Espécies",
    texto:
      "Anão, draconato, elfo, gnomo, golias, humano, orc, pequenino e tiefling, com os traços de cada povo das regras de 2024.",
    href: "/especies/",
    imagem: "/images/compendio/especies.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T12:49-03:00",
    titulo: "Classes",
    texto:
      "As doze classes em português, do nível 1 ao 20, cada nível num pergaminho e cada classe com uma subclasse.",
    href: "/classes/",
    imagem: "/images/compendio/classes.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T16:01-03:00",
    titulo: "Johnny de retrato novo",
    texto:
      "O goblin ganhou um retrato mais nítido e mais fiel a ele, na ficha, na lista de personagens e nas Crônicas.",
    href: "/personagens/johnny-bling-bling/",
    imagem: "/images/personagens/johnny-bling-bling-retrato.jpg",
    posicao: "40% 14%",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T16:13-03:00",
    titulo: "Itens Mágicos",
    texto:
      "Os 258 itens mágicos das regras, com busca por tipo, raridade e sintonia, e as regras de cargas, maldições e fabricação.",
    href: "/itens/",
    imagem: "/images/compendio/itens.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T16:38-03:00",
    titulo: "Bestiário",
    texto:
      "Os 330 monstros e animais, cada um com a ficha completa, filtros por tipo e Nível de Desafio e um guia de como ler uma ficha.",
    href: "/monstros/",
    imagem: "/images/compendio/monstros.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-07T18:11-03:00",
    titulo: "Livro do Aventureiro",
    texto:
      "As regras de 2024 reunidas num lugar só: classes, espécies, antecedentes, talentos, equipamento, magias, itens, monstros e o Glossário de Regras.",
    href: "/regras/",
    imagem: "/images/livro-cartao.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-08T14:00-03:00",
    titulo: "Mapa interativo",
    texto:
      "Arraste, aproxime e clique: cada região acende e cada lugar abre a sua história inteira ali mesmo, no canto do mapa.",
    href: "/mapa/",
    imagem: "/images/map-cartao.jpg",
  },
  {
    tipo: "aviso",
    data: "2026-10-09T09:00-03:00",
    titulo: "Baú do Mestre",
    texto:
      "Na hora do saque: o mestre escolhe o baú e o que pode ter, o jogador rola o d20 e saem moedas, equipamento e itens mágicos do Livro.",
    href: "/bau/",
    imagem: "/images/regras/equipamento/bau.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-09T10:30-03:00",
    titulo: "As Crônicas viraram livro",
    texto:
      "Cada temporada é um livro de capa de couro: as páginas viram com o clique, as setas ou o dedo, e a fita marca onde você parou.",
    href: "/contos/cronicas/temporada-2/",
    imagem: "/images/contos/cronicas/t2-capa.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-10T00:05-03:00",
    titulo: "A mesa ganhou vida",
    texto:
      "No computador, as laterais da página viraram mesa de verdade: role o d20 na bandeja, jogue moedas pela madeira e bata nela para ouvir o toc.",
    href: "/conquistas/",
    icone: "vela",
  },
  {
    tipo: "aviso",
    data: "2026-10-10T00:07-03:00",
    titulo: "Conquistas",
    texto:
      "26 feitos para cumprir pelo site, em bronze, prata e ouro. Os mais difíceis liberam 7 luvas novas para o cursor e 6 d20 novos para a mesa.",
    href: "/conquistas/",
    icone: "mao",
  },
  {
    tipo: "aviso",
    data: "2026-10-10T00:47-03:00",
    titulo: "Bestiário e equipamento ilustrados",
    texto:
      "Os 330 monstros ganharam arte, cada um na própria ficha e na lista, e as 94 peças de equipamento também.",
    href: "/monstros/",
    imagem: "/images/monstros/dragao-vermelho-anciao.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-10T02:20-03:00",
    titulo: "Retratos novos para todos",
    texto:
      "Os doze personagens, dos atuais à primeira geração, no mesmo estilo de pintura. E na ficha, setas para passar ao anterior e ao próximo.",
    href: "/personagens/",
    imagem: "/images/personagens/elenco-reunido.webp",
  },
  {
    tipo: "aviso",
    data: "2026-10-10T02:25-03:00",
    titulo: "A Saga de Mitrael",
    texto:
      "Os Contos agora se chamam Crônicas, a série principal virou A Saga de Mitrael e ela e cada temporada ganharam capa própria.",
    href: "/contos/cronicas/",
    imagem: "/images/contos/cronicas/saga-capa.webp",
  },
];

/**
 * O que ainda está a caminho. Aparece no topo de /novidades/, sem link e
 * sem data, e sai daqui quando vira novidade de verdade no REGISTRO.
 */
export const EM_BREVE: { titulo: string; texto: string; icone: Icone }[] = [
  {
    titulo: "Conta de jogador",
    texto:
      "Entrar com a sua conta para levar conquistas, luvas e dados para qualquer aparelho. Hoje eles ficam guardados só no navegador onde foram conquistados.",
    icone: "chave",
  },
  {
    titulo: "Conquistas no celular",
    texto:
      "15 dos 26 feitos pedem a mesa, que por enquanto só aparece no computador. A ideia é o celular também poder rolar o d20 e jogar moedas.",
    icone: "dado",
  },
  {
    titulo: "Mais artes",
    texto:
      "As ilustrações grandes das 339 magias, as artes dos antecedentes e dos talentos e as três classes que ainda estão sem pintura.",
    icone: "livro",
  },
];

export type Novidade = {
  chave: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  href: string;
  imagem?: string;
  /** Sem imagem, a miniatura mostra este desenho. */
  icone?: Icone;
  /** Onde fica o rosto na imagem, quando é retrato. */
  posicao?: string;
  /** Data e hora com fuso, como "2026-10-07T11:36-03:00". */
  data: string;
};

function episodios(): Novidade[] {
  return SERIES_DISPONIVEIS.flatMap((serie) =>
    serie.temporadas.flatMap((temporada) =>
      temporada.episodios.flatMap((episodio) => {
        const { meta } = episodio;
        if (!meta.publicado) return [];
        return [
          {
            chave: `${serie.slug}-t${temporada.numero}e${meta.numero}`,
            etiqueta: `Episódio novo · T${temporada.numero}E${meta.numero}`,
            titulo: meta.titulo,
            texto: meta.resumo,
            href: `/contos/${serie.slug}/${chaveDaTemporada(temporada)}/${chaveDoEpisodio(episodio)}/`,
            ...imagemDoEpisodio(meta.capa ?? meta.vitrine, meta.elenco),
            data: meta.publicado,
          },
        ];
      })
    )
  );
}

function registrados(): Novidade[] {
  return REGISTRO.flatMap((item): Novidade[] => {
    if (item.tipo === "aviso") {
      const { tipo: _tipo, ...resto } = item;
      return [{ chave: item.href + item.data, etiqueta: "Novo no site", ...resto }];
    }
    const personagem = buscarPersonagem(item.slug);
    if (!personagem) return [];
    const { nome, imagem, rosto, resumo } = personagem.meta;
    return [
      {
        chave: item.slug,
        etiqueta: "Personagem novo",
        titulo: nome,
        texto: `${item.nota}. ${resumo}`,
        href: `/personagens/${item.slug}/`,
        imagem,
        posicao: rosto ? `${rosto.x * 100}% ${rosto.y * 100}%` : "top",
        data: item.data,
      },
    ];
  });
}

/** Tudo o que há de novo, do mais recente para o mais antigo. */
export function todasAsNovidades(): Novidade[] {
  return [...episodios(), ...registrados()].sort(
    (a, b) => Date.parse(b.data) - Date.parse(a.data)
  );
}

/** As mais recentes, para a página inicial. */
export function novidades(limite = 3): Novidade[] {
  return todasAsNovidades().slice(0, limite);
}

const FORMATO = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "07/10/2026 · 11:36", sempre no horário de Brasília. */
export function quando(data: string): string {
  const partes = Object.fromEntries(
    FORMATO.formatToParts(new Date(data)).map((p) => [p.type, p.value])
  );
  return `${partes.day}/${partes.month}/${partes.year} · ${partes.hour}:${partes.minute}`;
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
