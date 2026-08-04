/**
 * O catálogo de magias, traços, talentos e características de classe.
 *
 * Cada coisa existe aqui uma vez só. As fichas dos personagens não copiam
 * descrição nem imagem: elas apontam para a chave daqui. Duas pessoas com
 * Dobre a Finados leem exatamente o mesmo texto, e corrigir um erro corrige
 * em todas as fichas de uma vez.
 *
 * Para acrescentar o ícone de uma magia, preencha `icone` com o caminho do
 * arquivo em public/images/magias/. Enquanto estiver vazio, a ficha mostra
 * um selo em branco no lugar, sem buraco no layout.
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
  /** Caminho da imagem em public/images/magias/, quando existir. */
  icone?: string;
  descricao: string;
  /** O que o jogador anotou de próprio punho na ficha. */
  anotacao?: string;
};

export const HABILIDADES: Record<string, Habilidade> = {
  // ---------- Truques ----------

  resistencia: {
    nome: "Resistência",
    tipo: "truque",
    circulo: 0,
    escola: "Abjuração",
    tempo: "1 ação",
    alcance: "Toque",
    duracao: "Concentração, até 1 minuto",
    descricao:
      "Toca uma criatura disposta e a abençoa contra o que vier. Uma vez antes da magia acabar, ela pode rolar 1d4 e somar o resultado a uma salvaguarda que esteja fazendo.",
  },

  orientacao: {
    nome: "Orientação",
    tipo: "truque",
    circulo: 0,
    escola: "Adivinhação",
    tempo: "1 ação",
    alcance: "Toque",
    duracao: "Concentração, até 1 minuto",
    descricao:
      "Toca uma criatura disposta e guia a mão dela. Uma vez antes da magia acabar, ela pode rolar 1d4 e somar o resultado a um teste de habilidade.",
  },

  "chama-sagrada": {
    nome: "Chama Sagrada",
    tipo: "truque",
    circulo: 0,
    escola: "Evocação",
    tempo: "1 ação",
    alcance: "18 metros",
    duracao: "Instantânea",
    descricao:
      "Um clarão de fogo divino desce sobre a criatura escolhida. Ela faz uma salvaguarda de Destreza e, se falhar, sofre 1d8 de dano radiante. Cobertura não protege de uma luz que vem de cima.",
    anotacao: "1d8 radiante",
  },

  "dobre-a-finados": {
    nome: "Dobre a Finados",
    tipo: "truque",
    circulo: 0,
    escola: "Necromancia",
    tempo: "1 ação",
    alcance: "18 metros",
    duracao: "Instantânea",
    descricao:
      "O som de um sino de funeral ecoa em volta da criatura escolhida, e só ela escuta. Salvaguarda de Sabedoria ou 1d8 de dano necrótico. Se a criatura já estiver ferida, o dado vira 1d12.",
    anotacao: "1d8 necromante, vida máxima 1d12",
  },

  "ilusao-menor": {
    nome: "Ilusão Menor",
    tipo: "truque",
    circulo: 0,
    escola: "Ilusão",
    tempo: "1 ação",
    alcance: "9 metros",
    duracao: "1 minuto",
    descricao:
      "Cria um som ou a imagem de um objeto, do tamanho de um cubo de metro e meio. Quem desconfiar pode gastar uma ação estudando a ilusão: acertando um teste de Investigação contra a CD da magia, percebe a farsa.",
    anotacao: "1 minuto",
  },

  // ---------- Magias de 1º círculo ----------

  "curar-ferimentos": {
    nome: "Curar Ferimentos",
    tipo: "magia",
    circulo: 1,
    escola: "Abjuração",
    tempo: "1 ação",
    alcance: "Toque",
    duracao: "Instantânea",
    descricao:
      "Toca uma criatura e fecha o que estava aberto. Ela recupera pontos de vida iguais à rolagem mais o modificador de conjuração. Não funciona em mortos-vivos nem em construtos.",
    anotacao: "1d8",
  },

  bencao: {
    nome: "Bênção",
    tipo: "magia",
    circulo: 1,
    escola: "Encantamento",
    tempo: "1 ação",
    alcance: "9 metros",
    duracao: "Concentração, até 1 minuto",
    descricao:
      "Abençoa até três criaturas ao alcance. Enquanto durar, cada uma delas soma 1d4 às jogadas de ataque e às salvaguardas que fizer.",
  },

  "bracos-de-hadar": {
    nome: "Braços de Hadar",
    tipo: "magia",
    circulo: 1,
    escola: "Conjuração",
    tempo: "1 ação",
    alcance: "3 metros (a partir de si)",
    duracao: "Instantânea",
    descricao:
      "Tentáculos rasgam o ar em volta do conjurador e alcançam tudo que estiver perto. Cada criatura na área faz uma salvaguarda de Força: falhando, sofre 2d6 de dano necrótico e não consegue usar reações até o próximo turno dela.",
    anotacao: "Ao redor, 2d6, prende, tentáculo",
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

  // ---------- Talentos ----------

  "iniciado-em-magia-clerigo": {
    nome: "Iniciado em Magia: Clérigo",
    tipo: "talento",
    descricao:
      "Aprendeu dois truques e uma magia de 1º círculo da lista de clérigo. A magia pode ser conjurada uma vez por descanso longo sem gastar espaço.",
  },

  habilidoso: {
    nome: "Habilidoso",
    tipo: "talento",
    descricao:
      "Três proficiências a mais, escolhidas entre perícias e ferramentas. Serve tanto para quem estudou muito quanto para quem mentiu bem sobre isso.",
  },
};

/** Busca uma habilidade pela chave, avisando alto quando a chave não existe. */
export function buscarHabilidade(chave: string): Habilidade {
  const habilidade = HABILIDADES[chave];
  if (!habilidade) {
    throw new Error(
      `A habilidade "${chave}" não existe em src/lib/habilidades.ts. Cadastre-a lá antes de usar numa ficha.`
    );
  }
  return habilidade;
}

/** Todas as magias e truques que ainda estão sem ícone. */
export function magiasSemIcone(): { chave: string; habilidade: Habilidade }[] {
  return Object.entries(HABILIDADES)
    .filter(([, h]) => !h.icone)
    .map(([chave, habilidade]) => ({ chave, habilidade }));
}
