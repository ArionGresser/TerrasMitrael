import { arte } from "./arte";
import { magiaPeloNome } from "./magias";
import { miniaturaDaMagia } from "./magias-arte";
import { buscarDocumento } from "./regras";

/**
 * O catálogo de magias, traços, talentos e características de classe.
 *
 * Cada coisa existe aqui uma vez só. As fichas dos personagens não copiam
 * descrição nem imagem: elas apontam para a chave daqui. Duas pessoas com
 * Bênção leem exatamente o mesmo texto, e corrigir um erro corrige em todas
 * as fichas de uma vez.
 *
 * E o que já existe no site vem de lá, sozinho:
 *   - a magia que está no Grimório traz de lá o nome, o círculo, a escola,
 *     o tempo, o alcance, a duração, o texto e o ícone. Aqui fica só o que o
 *     jogador anotou na ficha;
 *   - o talento que está no Livro do Aventureiro traz de lá a arte e o link
 *     para a regra (`regra` é a âncora dele lá, quando difere da chave);
 *   - o resto (traços, características, magias de fora do SRD) procura o
 *     ícone em public/images/habilidades/<chave>.webp.
 * Enquanto não há imagem, a ficha mostra o selo de "em obra" no lugar.
 */

export type TipoDeHabilidade =
  | "truque"
  | "magia"
  | "talento"
  | "traco"
  | "classe"
  | "invocacao";

export type Habilidade = {
  nome: string;
  tipo: TipoDeHabilidade;
  /** Só para truques e magias. Zero é truque. */
  circulo?: number;
  escola?: string;
  tempo?: string;
  alcance?: string;
  duracao?: string;
  /** O texto próprio, para o que não vem do Grimório. */
  descricao?: string;
  /** O que o jogador anotou de próprio punho na ficha. */
  anotacao?: string;
  /** No talento, a âncora dele no Livro, quando não é a própria chave. */
  regra?: string;
};

/** A habilidade como a ficha mostra: com o que veio do Grimório e do Livro. */
export type HabilidadeNaFicha = Habilidade & {
  icone?: string;
  /** O texto do Grimório, em markdown curto, quando a magia está lá. */
  texto?: string;
  link?: { href: string; rotulo: string };
};

export const HABILIDADES: Record<string, Habilidade> = {
  // ---------- Truques ----------

  resistencia: {
    nome: "Resistência",
    tipo: "truque",
  },

  orientacao: {
    nome: "Orientação",
    tipo: "truque",
  },

  "chama-sagrada": {
    nome: "Chama Sagrada",
    tipo: "truque",
    anotacao: "1d8 radiante",
  },

  "dobre-a-finados": {
    nome: "Dobre a Finados",
    tipo: "truque",
    circulo: 0,
    escola: "Necromancia",
    tempo: "Ação",
    alcance: "18 metros",
    duracao: "Instantânea",
    descricao:
      "O som de um sino de funeral ecoa em volta da criatura escolhida, e só ela escuta. Salvaguarda de Sabedoria ou 1d8 de dano necrótico. Se a criatura já estiver ferida, o dado vira 1d12.",
    anotacao: "1d8 necromante, vida máxima 1d12",
  },

  "ilusao-menor": {
    nome: "Ilusão Menor",
    tipo: "truque",
    anotacao: "1 minuto",
  },

  // ---------- Magias de 1º círculo ----------

  "curar-ferimentos": {
    nome: "Curar Ferimentos",
    tipo: "magia",
    anotacao: "1d8",
  },

  bencao: {
    nome: "Bênção",
    tipo: "magia",
  },

  "bracos-de-hadar": {
    nome: "Braços de Hadar",
    tipo: "magia",
    circulo: 1,
    escola: "Conjuração",
    tempo: "Ação",
    alcance: "3 metros (a partir de si)",
    duracao: "Instantânea",
    descricao:
      "Tentáculos rasgam o ar em volta do conjurador e alcançam tudo que estiver perto. Cada criatura na área faz uma salvaguarda de Força: falhando, sofre 2d6 de dano necrótico e não consegue usar reações até o próximo turno dela.",
    anotacao: "Ao redor, 2d6, prende, tentáculo",
  },

  "destruicao-divina": {
    nome: "Destruição Divina",
    tipo: "magia",
    anotacao: "Ação bônus, toque, só voz",
  },

  "duelo-compelido": {
    nome: "Duelo Compelido",
    tipo: "magia",
    circulo: 1,
    escola: "Encantamento",
    tempo: "Ação Bônus",
    alcance: "9 metros",
    duracao: "Concentração, até 1 minuto",
    descricao:
      "Aponta uma criatura e a chama para a briga. Ela faz uma salvaguarda de Sabedoria: falhando, tem desvantagem para atacar qualquer um que não seja o conjurador e não consegue se afastar dele mais de nove metros por vontade própria. Acaba antes se o conjurador atacar outro, mirar magia em outro inimigo, terminar o turno longe demais do alvo ou se um aliado ferir o desafiado.",
    anotacao: "Ação bônus, 1 minuto, 9 m, só voz",
  },

  // ---------- Invocações místicas ----------

  "armadura-das-sombras": {
    nome: "Armadura das Sombras",
    tipo: "invocacao",
    descricao:
      "A escuridão se assenta sobre o corpo como um tecido. Permite conjurar Armadura Arcana em si mesmo à vontade, sem gastar espaço de magia. Enquanto durar, a Classe de Armadura passa a ser 13 mais o modificador de Destreza.",
    anotacao: "Custo 0, armadura 15",
  },

  // ---------- Características de classe ----------

  conjuracao: {
    nome: "Conjuração",
    tipo: "classe",
    descricao:
      "Sabe puxar magia para o mundo. Prepara suas magias a cada descanso longo e as conjura gastando espaços de magia, do círculo correspondente ou acima.",
  },

  "ordem-divina-taumaturgo": {
    nome: "Ordem Divina: Taumaturgo",
    tipo: "classe",
    descricao:
      "Escolheu servir estudando o milagre em vez de empunhar a espada. Conhece um truque de clérigo a mais e soma o modificador de Sabedoria aos testes de Religião.",
  },

  "ataque-furtivo": {
    nome: "Ataque Furtivo",
    tipo: "classe",
    descricao:
      "Sabe onde a armadura não cobre. Uma vez por turno, acrescenta 1d6 de dano a um ataque feito com vantagem, ou com um aliado ao lado do alvo, desde que a arma seja sutil ou de longo alcance.",
    anotacao: "+1d6",
  },

  especialista: {
    nome: "Especialista",
    tipo: "classe",
    descricao:
      "Duas perícias deixaram de ser ofício e viraram vício: o bônus de proficiência conta em dobro nelas.",
    anotacao: "+2 em Furtividade e Prestidigitação",
  },

  "girias-de-ladrao": {
    nome: "Gírias de Ladrão",
    tipo: "classe",
    descricao:
      "Conhece o código que corre por baixo das cidades: palavras, sinais e marcas riscadas em portas que só quem é do meio entende.",
  },

  "maestria-com-armas": {
    nome: "Maestria com Armas",
    tipo: "classe",
    descricao:
      "Domina a propriedade de maestria de duas armas escolhidas, e pode trocar essa escolha a cada descanso longo.",
  },

  "defesa-sem-armadura": {
    nome: "Defesa sem Armadura",
    tipo: "classe",
    descricao:
      "Sem armadura no corpo, a Classe de Armadura passa a ser 10 mais Destreza mais Constituição. Escudo pode. Armadura atrapalha mais do que protege quem aprendeu a confiar no próprio couro.",
  },

  furia: {
    nome: "Fúria",
    tipo: "classe",
    descricao:
      "Entra em fúria com uma ação bônus. Enquanto dura: vantagem em testes e salvaguardas de Força, dano extra em ataques corpo a corpo de Força, e resistência a dano contundente, cortante e perfurante. Não conjura nem se concentra em magia nenhuma. Dura um minuto, e acaba antes se o turno terminar sem ter atacado ninguém nem levado dano.",
    anotacao: "+2 de dano, duas vezes por descanso longo",
  },

  "invocacoes-misticas": {
    nome: "Invocações Místicas",
    tipo: "classe",
    descricao:
      "Fragmentos de conhecimento arrancados do próprio pacto, que ficam ligados ao corpo em vez de precisarem ser conjurados.",
  },

  "magia-de-pacto": {
    nome: "Magia de Pacto",
    tipo: "classe",
    descricao:
      "A magia não vem de estudo nem de fé, vem do acordo. Os espaços de magia são poucos, sempre do círculo mais alto que se possa lançar, e voltam já num descanso curto.",
  },

  "maos-consagradas": {
    nome: "Mãos Consagradas",
    tipo: "classe",
    descricao:
      "Carrega no toque uma reserva de cura que enche de novo a cada descanso longo, igual a cinco vezes o nível. Com uma ação bônus, encosta a mão numa criatura e gasta dessa reserva quantos pontos quiser. Gastando cinco de uma vez, pode em vez disso arrancar dela um veneno.",
  },

  // ---------- Traços de espécie ----------

  investida: {
    nome: "Investida",
    tipo: "traco",
    descricao:
      "Corpo de cavalo, e ele sabe o que fazer. Ao se mover pelo menos nove metros em linha reta e acertar um ataque corpo a corpo no mesmo turno, o golpe leva dano extra.",
  },

  cascos: {
    nome: "Cascos",
    tipo: "traco",
    descricao:
      "Os cascos traseiros são arma natural. O ataque desarmado com eles causa 1d4 mais o modificador de Força em dano contundente.",
    anotacao: "1d4 + Força",
  },

  "afinidade-natural": {
    nome: "Afinidade Natural",
    tipo: "traco",
    descricao:
      "Proficiência em uma perícia à escolha entre Natureza, Sobrevivência, Lidar com Animais, Medicina e Adestrar Animais.",
  },

  "agilidade-pequenina": {
    nome: "Agilidade Pequenina",
    tipo: "traco",
    descricao:
      "Atravessa o espaço de qualquer criatura que seja de tamanho maior que o seu, sem precisar pedir licença.",
  },

  coragem: {
    nome: "Coragem",
    tipo: "traco",
    descricao:
      "Custa fazer um pequenino recuar. Vantagem em salvaguardas contra a condição amedrontado.",
  },

  "furtividade-natural": {
    nome: "Furtividade Natural",
    tipo: "traco",
    descricao:
      "Some atrás de qualquer criatura que seja pelo menos um tamanho maior, e continua escondido enquanto ela estiver ali.",
  },

  sorte: {
    nome: "Sorte",
    tipo: "traco",
    descricao:
      "Quando tira 1 num d20 de ataque, teste de habilidade ou salvaguarda, rola de novo e usa o segundo resultado.",
  },

  "visao-no-escuro": {
    nome: "Visão no Escuro",
    tipo: "traco",
    descricao:
      "Enxerga na penumbra como se fosse luz plena até dezoito metros, e no escuro completo como se fosse penumbra, ainda que só em tons de cinza.",
    anotacao: "18 metros",
  },

  "furia-dos-pequenos": {
    nome: "Fúria dos Pequenos",
    tipo: "traco",
    descricao:
      "Quem é pequeno aprende a bater onde dói. Ao acertar uma criatura de tamanho maior que o seu, acrescenta dano extra ao golpe. Recarrega no descanso.",
    anotacao: "+2 de dano, duas vezes",
  },

  "fuga-agil": {
    nome: "Fuga Ágil",
    tipo: "traco",
    descricao:
      "Sabe a hora de sair. Pode Desengajar ou Esconder usando uma ação bônus, sem abrir mão do turno.",
    anotacao: "Ação bônus, duas vezes",
  },

  "astucia-goblinoide": {
    nome: "Astúcia Goblinoide",
    tipo: "traco",
    descricao:
      "Cabeça difícil de invadir. Vantagem em salvaguardas contra ser enfeitiçado e contra magia que force movimento.",
  },

  /**
   * A visão anã enxerga o dobro da dos outros povos, então precisa de
   * entrada própria: o alcance faz parte da explicação, não da anotação
   * de um personagem só.
   */
  "visao-no-escuro-anao": {
    nome: "Visão no Escuro",
    tipo: "traco",
    descricao:
      "Enxerga na penumbra como se fosse luz plena até trinta e seis metros, e no escuro completo como se fosse penumbra. Quem nasce debaixo da montanha enxerga mais longe no escuro do que quase todo mundo enxerga na luz.",
    anotacao: "36 metros",
  },

  "resiliencia-ana": {
    nome: "Resiliência Anã",
    tipo: "traco",
    descricao:
      "Resistência a dano de veneno e vantagem em salvaguardas para não ser envenenado. Gerações bebendo o que escorre da rocha acabam deixando marca no sangue.",
  },

  "tenacidade-ana": {
    nome: "Tenacidade Anã",
    tipo: "traco",
    descricao:
      "O corpo aguenta mais do que a conta dizia que aguentaria: o máximo de pontos de vida sobe em um a cada nível.",
  },

  "conhecimento-de-pedras": {
    nome: "Conhecimento de Pedras",
    tipo: "traco",
    descricao:
      "Com uma ação bônus, e desde que os pés estejam em pedra, ganha sentido sísmico até dezoito metros por dez minutos. É enxergar pela vibração o que está do outro lado da parede. Recarrega no descanso longo.",
    anotacao: "Vezes iguais ao bônus de proficiência",
  },

  "instinto-cacador": {
    nome: "Instinto Caçador",
    tipo: "traco",
    descricao:
      "Proficiência numa perícia, escolhida entre Atletismo, Intimidação, Percepção e Sobrevivência. Quem cresce num bando aprende cedo a ler o terreno antes de pisar nele.",
  },

  "rugido-aterrador": {
    nome: "Rugido Aterrador",
    tipo: "traco",
    descricao:
      "Com uma ação bônus, solta um rugido. Cada criatura escolhida a até três metros que consiga ouvir faz uma salvaguarda de Sabedoria, com CD 8 mais Constituição mais proficiência: falhando, fica amedrontada até o fim do próximo turno do leonino. Recarrega num descanso curto ou longo.",
  },

  // ---------- Talentos ----------

  "iniciado-em-magia-clerigo": {
    nome: "Iniciado em Magia: Clérigo",
    tipo: "talento",
    regra: "iniciado-em-magia",
    descricao:
      "Aprendeu dois truques e uma magia de 1º círculo da lista de clérigo. A magia pode ser conjurada uma vez por descanso longo sem gastar espaço.",
  },

  habilidoso: {
    nome: "Habilidoso",
    tipo: "talento",
    descricao:
      "Três proficiências a mais, escolhidas entre perícias e ferramentas. Serve tanto para quem estudou muito quanto para quem mentiu bem sobre isso.",
  },

  vigoroso: {
    nome: "Vigoroso",
    tipo: "talento",
    descricao:
      "O máximo de pontos de vida sobe no dobro do nível. É o talento de quem apanhou muito e continuou de pé, e a ficha registra isso em número.",
  },

  "atacante-selvagem": {
    nome: "Atacante Selvagem",
    tipo: "talento",
    descricao:
      "Uma vez por turno, ao acertar com uma arma, rola os dados de dano dela duas vezes e fica com o resultado que preferir. É o talento de quem aprendeu a lutar onde não existe segunda chance.",
  },
};

/** As âncoras dos talentos que o Livro do Aventureiro tem. */
const TALENTOS_DO_LIVRO = new Set(
  (buscarDocumento("talentos")?.grupos ?? []).flatMap((g) =>
    g.itens.filter((i) => i.titulo).map((i) => i.id),
  ),
);

/** Busca uma habilidade pela chave, avisando alto quando a chave não existe. */
export function buscarHabilidade(chave: string): HabilidadeNaFicha {
  const h = HABILIDADES[chave];
  if (!h) {
    throw new Error(
      `A habilidade "${chave}" não existe em src/lib/habilidades.ts. Cadastre-a lá antes de usar numa ficha.`
    );
  }

  if (h.tipo === "truque" || h.tipo === "magia") {
    const m = magiaPeloNome(h.nome);
    if (m) {
      return {
        ...h,
        nome: m.nome,
        circulo: m.nivel,
        escola: m.escola,
        // "Ação Bônus, que você usa logo depois..." vira só "Ação Bônus"
        tempo: m.tempo.split(",")[0],
        alcance: m.alcance,
        duracao: m.duracao,
        texto: m.texto,
        icone: miniaturaDaMagia(m.slug),
        link: { href: `/magias/${m.slug}/`, rotulo: "Regra completa no Grimório" },
      };
    }
  }

  if (h.tipo === "talento") {
    const ancora = h.regra ?? chave;
    if (TALENTOS_DO_LIVRO.has(ancora)) {
      return {
        ...h,
        icone: arte("regras/talentos/mini", ancora) ?? arte("regras/talentos", ancora),
        link: {
          href: `/regras/talentos/#${ancora}`,
          rotulo: "Regra completa no Livro do Aventureiro",
        },
      };
    }
  }

  return {
    ...h,
    icone: arte("habilidades/mini", chave) ?? arte("habilidades", chave),
  };
}
