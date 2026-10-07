/**
 * As espécies das regras de 2024, em português.
 *
 * Vêm do SRD 5.2.1 (Creative Commons Attribution 4.0), com as mesmas
 * convenções do grimório: metros no lugar de pés (1,5 m para cada 5 pés),
 * condições com maiúscula e nome de magia em itálico, que vira link.
 *
 * Mitrael tem outros povos além destes (leoninos, centauros, faunos...).
 * Aqui ficam só os que as regras trazem prontos.
 */

export type Especie = {
  slug: string;
  nome: string;
  /** O nome em inglês, como está no SRD. */
  original: string;
  tamanho: string;
  deslocamento: string;
  /** Os nomes dos traços, para o resumo na lista. */
  tracos: string[];
  /** O texto dos traços, no markdown curto do TextoDeRegra. */
  texto: string;
};

export const ESPECIES: Especie[] = [
  {
    slug: "anao",
    nome: "Anão",
    original: "Dwarf",
    tamanho: "Médio (cerca de 1,2 a 1,5 m de altura)",
    deslocamento: "9 metros",
    tracos: ["Visão no Escuro", "Resiliência Anã", "Robustez Anã", "Especialista em Rochas"],
    texto: `
_Visão no Escuro._ Você tem Visão no Escuro com alcance de 36 metros.

_Resiliência Anã._ Você tem Resistência a dano de veneno. Você também tem Vantagem nas salvaguardas que faz para evitar ou encerrar a condição Envenenado.

_Robustez Anã._ Seu máximo de Pontos de Vida aumenta em 1, e aumenta em 1 de novo sempre que você ganha um nível.

_Especialista em Rochas._ Com uma Ação Bônus, você ganha Sentido Sísmico com alcance de 18 metros por 10 minutos. Para usar esse Sentido Sísmico, você precisa estar sobre uma superfície de pedra ou tocando uma. A pedra pode ser natural ou trabalhada.

Você pode usar essa Ação Bônus um número de vezes igual ao seu Bônus de Proficiência, e recupera todos os usos gastos quando termina um Descanso Longo.
`,
  },
  {
    slug: "draconato",
    nome: "Draconato",
    original: "Dragonborn",
    tamanho: "Médio (cerca de 1,5 a 2,1 m de altura)",
    deslocamento: "9 metros",
    tracos: [
      "Ancestralidade Dracônica",
      "Arma de Sopro",
      "Resistência a Dano",
      "Visão no Escuro",
      "Voo Dracônico",
    ],
    texto: `
_Ancestralidade Dracônica._ Sua linhagem vem de um dragão ancestral. Escolha o tipo de dragão na tabela Ancestrais Dracônicos. Sua escolha afeta os traços Arma de Sopro e Resistência a Dano, além da sua aparência.

#### Ancestrais Dracônicos

| Dragão | Tipo de dano | Dragão | Tipo de dano |
|---|---|---|---|
| Azul | Elétrico | Bronze | Elétrico |
| Branco | Frio | Cobre | Ácido |
| Latão | Fogo | Ouro | Fogo |
| Preto | Ácido | Prata | Frio |
| Verde | Veneno | Vermelho | Fogo |

_Arma de Sopro._ Quando você usa a ação de Atacar no seu turno, pode substituir um dos ataques por um sopro de energia mágica, num Cone de 4,5 metros ou numa Linha de 9 metros de comprimento por 1,5 metro de largura (escolha o formato a cada vez). Cada criatura na área faz uma salvaguarda de Destreza (CD 8 + seu modificador de Constituição + seu Bônus de Proficiência). Se falhar, sofre 1d10 de dano do tipo definido pela sua Ancestralidade Dracônica. Se for bem-sucedida, sofre metade desse dano. O dano aumenta em 1d10 quando você chega aos níveis de personagem 5 (2d10), 11 (3d10) e 17 (4d10).

Você pode usar a Arma de Sopro um número de vezes igual ao seu Bônus de Proficiência, e recupera todos os usos gastos quando termina um Descanso Longo.

_Resistência a Dano._ Você tem Resistência ao tipo de dano definido pela sua Ancestralidade Dracônica.

_Visão no Escuro._ Você tem Visão no Escuro com alcance de 18 metros.

_Voo Dracônico._ Quando chega ao nível de personagem 5, você pode canalizar magia dracônica para voar por um tempo. Com uma Ação Bônus, asas espectrais brotam nas suas costas e duram 10 minutos, ou até você recolhê-las (sem precisar de ação) ou ficar com a condição Incapacitado. Durante esse tempo, você tem Deslocamento de Voo igual ao seu Deslocamento. As asas parecem feitas da mesma energia da sua Arma de Sopro. Depois de usar este traço, você só pode usá-lo de novo quando terminar um Descanso Longo.
`,
  },
  {
    slug: "elfo",
    nome: "Elfo",
    original: "Elf",
    tamanho: "Médio (cerca de 1,5 a 1,8 m de altura)",
    deslocamento: "9 metros",
    tracos: ["Visão no Escuro", "Linhagem Élfica", "Ancestralidade Feérica", "Sentidos Aguçados", "Transe"],
    texto: `
_Visão no Escuro._ Você tem Visão no Escuro com alcance de 18 metros.

_Linhagem Élfica._ Você faz parte de uma linhagem que lhe concede habilidades sobrenaturais. Escolha uma linhagem na tabela Linhagens Élficas. Você ganha o benefício de nível 1 dessa linhagem.

Quando chega aos níveis de personagem 3 e 5, você aprende uma magia de círculo mais alto, como mostra a tabela. Você sempre tem essa magia preparada. Pode conjurá-la uma vez sem gastar espaço de magia, e recupera essa capacidade quando termina um Descanso Longo. Também pode conjurá-la usando qualquer espaço de magia do círculo adequado que tiver.

Inteligência, Sabedoria ou Carisma é o seu atributo de conjuração para as magias deste traço (escolha o atributo quando escolher a linhagem).

#### Linhagens Élficas

| Linhagem | Nível 1 | Nível 3 | Nível 5 |
|---|---|---|---|
| Drow | O alcance da sua Visão no Escuro aumenta para 36 metros. Você também conhece o truque _Globos de Luz_. | _Fogo das Fadas_ | _Escuridão_ |
| Alto Elfo | Você conhece o truque _Prestidigitação_. Sempre que termina um Descanso Longo, pode trocar esse truque por outro da lista de magias de Mago. | _Detectar Magia_ | _Passo Nebuloso_ |
| Elfo da Floresta | Seu Deslocamento aumenta para 10,5 metros. Você também conhece o truque _Arte Druídica_. | _Passos Largos_ | _Passos sem Pegadas_ |

_Ancestralidade Feérica._ Você tem Vantagem nas salvaguardas que faz para evitar ou encerrar a condição Enfeitiçado.

_Sentidos Aguçados._ Você tem proficiência na perícia Intuição, Percepção ou Sobrevivência.

_Transe._ Você não precisa dormir, e magia não pode fazer você dormir. Você pode terminar um Descanso Longo em 4 horas se passar esse tempo numa meditação parecida com um transe, durante a qual continua consciente.
`,
  },
  {
    slug: "gnomo",
    nome: "Gnomo",
    original: "Gnome",
    tamanho: "Pequeno (cerca de 0,9 a 1,2 m de altura)",
    deslocamento: "9 metros",
    tracos: ["Visão no Escuro", "Astúcia Gnômica", "Linhagem Gnômica"],
    texto: `
_Visão no Escuro._ Você tem Visão no Escuro com alcance de 18 metros.

_Astúcia Gnômica._ Você tem Vantagem nas salvaguardas de Inteligência, Sabedoria e Carisma.

_Linhagem Gnômica._ Você faz parte de uma linhagem que lhe concede habilidades sobrenaturais. Escolha uma das opções abaixo. Seja qual for a escolhida, Inteligência, Sabedoria ou Carisma é o seu atributo de conjuração para as magias deste traço (escolha o atributo quando escolher a linhagem).

**Gnomo da Floresta.** Você conhece o truque _Ilusão Menor_. Você também sempre tem a magia _Falar com Animais_ preparada. Pode conjurá-la sem gastar espaço de magia um número de vezes igual ao seu Bônus de Proficiência, e recupera todos os usos gastos quando termina um Descanso Longo. Também pode usar qualquer espaço de magia que tiver para conjurá-la.

**Gnomo das Rochas.** Você conhece os truques _Consertar_ e _Prestidigitação_. Além disso, pode passar 10 minutos conjurando _Prestidigitação_ para criar um mecanismo de engrenagens Miúdo (CA 5, 1 PV), como um brinquedo, um acendedor ou uma caixinha de música. Ao criar o mecanismo, você define a função dele escolhendo um efeito de _Prestidigitação_. O mecanismo produz esse efeito sempre que você ou outra criatura usa uma Ação Bônus para ativá-lo com um toque. Se o efeito escolhido tiver opções, você escolhe uma delas para o mecanismo ao criá-lo. Por exemplo, se escolher o efeito de acender ou apagar, decide se o mecanismo acende ou apaga o fogo, e ele não faz as duas coisas. Você pode ter até três mecanismos ao mesmo tempo. Cada um se desmancha 8 horas depois de criado, ou quando você o desmonta com um toque usando a ação de Usar.
`,
  },
  {
    slug: "golias",
    nome: "Golias",
    original: "Goliath",
    tamanho: "Médio (cerca de 2,1 a 2,4 m de altura)",
    deslocamento: "10,5 metros",
    tracos: ["Ancestralidade Gigante", "Forma Grande", "Constituição Poderosa"],
    texto: `
_Ancestralidade Gigante._ Você descende de gigantes. Escolha um dos benefícios abaixo, uma dádiva sobrenatural da sua ancestralidade. Você pode usar o benefício escolhido um número de vezes igual ao seu Bônus de Proficiência, e recupera todos os usos gastos quando termina um Descanso Longo.

**Salto das Nuvens (Gigante das Nuvens).** Com uma Ação Bônus, você se teletransporta magicamente até 9 metros para um espaço desocupado que consiga ver.

**Queimadura do Fogo (Gigante do Fogo).** Quando você acerta um alvo com uma jogada de ataque e causa dano a ele, também pode causar 1d10 de dano de fogo a esse alvo.

**Arrepio do Gelo (Gigante do Gelo).** Quando você acerta um alvo com uma jogada de ataque e causa dano a ele, também pode causar 1d6 de dano de frio a esse alvo e reduzir o Deslocamento dele em 3 metros até o início do seu próximo turno.

**Tombo das Colinas (Gigante das Colinas).** Quando você acerta uma criatura Grande ou menor com uma jogada de ataque e causa dano a ela, pode deixá-la com a condição Caído.

**Resistência da Pedra (Gigante de Pedra).** Quando você sofre dano, pode usar uma Reação para rolar 1d12. Some seu modificador de Constituição ao resultado e reduza o dano nesse total.

**Trovão da Tempestade (Gigante da Tempestade).** Quando você sofre dano de uma criatura a até 18 metros de você, pode usar uma Reação para causar 1d8 de dano trovejante a essa criatura.

_Forma Grande._ A partir do nível de personagem 5, você pode mudar seu tamanho para Grande com uma Ação Bônus, se estiver num espaço amplo o bastante. A transformação dura 10 minutos ou até você encerrá-la (sem precisar de ação). Durante esse tempo, você tem Vantagem nos testes de Força, e seu Deslocamento aumenta em 3 metros. Depois de usar este traço, você só pode usá-lo de novo quando terminar um Descanso Longo.

_Constituição Poderosa._ Você tem Vantagem em qualquer teste de atributo que fizer para encerrar a condição Agarrado. Você também conta como um tamanho maior para calcular quanto peso consegue carregar.
`,
  },
  {
    slug: "humano",
    nome: "Humano",
    original: "Human",
    tamanho:
      "Médio (cerca de 1,2 a 2,1 m de altura) ou Pequeno (cerca de 0,6 a 1,2 m de altura), escolhido junto com a espécie",
    deslocamento: "9 metros",
    tracos: ["Engenhoso", "Habilidoso", "Versátil"],
    texto: `
_Engenhoso._ Você ganha Inspiração Heroica sempre que termina um Descanso Longo.

_Habilidoso._ Você ganha proficiência em uma perícia à sua escolha.

_Versátil._ Você ganha um talento de Origem à sua escolha. O recomendado é Habilidoso.
`,
  },
  {
    slug: "orc",
    nome: "Orc",
    original: "Orc",
    tamanho: "Médio (cerca de 1,8 a 2,1 m de altura)",
    deslocamento: "9 metros",
    tracos: ["Surto de Adrenalina", "Visão no Escuro", "Resistência Implacável"],
    texto: `
_Surto de Adrenalina._ Você pode usar a ação de Disparada como Ação Bônus. Quando faz isso, ganha Pontos de Vida Temporários iguais ao seu Bônus de Proficiência.

Você pode usar este traço um número de vezes igual ao seu Bônus de Proficiência, e recupera todos os usos gastos quando termina um Descanso Curto ou Longo.

_Visão no Escuro._ Você tem Visão no Escuro com alcance de 36 metros.

_Resistência Implacável._ Quando seus Pontos de Vida caem a 0 mas você não morre na hora, pode ficar com 1 Ponto de Vida em vez disso. Depois de usar este traço, você só pode usá-lo de novo quando terminar um Descanso Longo.
`,
  },
  {
    slug: "pequenino",
    nome: "Pequenino",
    original: "Halfling",
    tamanho: "Pequeno (cerca de 0,6 a 0,9 m de altura)",
    deslocamento: "9 metros",
    tracos: ["Bravura", "Agilidade Pequenina", "Sorte", "Furtividade Natural"],
    texto: `
_Bravura._ Você tem Vantagem nas salvaguardas que faz para evitar ou encerrar a condição Amedrontado.

_Agilidade Pequenina._ Você pode atravessar o espaço de qualquer criatura que seja de um tamanho maior que o seu, mas não pode parar no mesmo espaço.

_Sorte._ Quando tira 1 no d20 de um Teste de D20, você pode rolar o dado de novo, e precisa usar o novo resultado.

_Furtividade Natural._ Você pode usar a ação de Esconder mesmo quando está encoberto só por uma criatura pelo menos um tamanho maior que você.
`,
  },
  {
    slug: "tiefling",
    nome: "Tiefling",
    original: "Tiefling",
    tamanho:
      "Médio (cerca de 1,2 a 2,1 m de altura) ou Pequeno (cerca de 0,9 a 1,2 m de altura), escolhido junto com a espécie",
    deslocamento: "9 metros",
    tracos: ["Visão no Escuro", "Legado Ínfero", "Presença de Outro Mundo"],
    texto: `
_Visão no Escuro._ Você tem Visão no Escuro com alcance de 18 metros.

_Legado Ínfero._ Você recebeu um legado que lhe concede habilidades sobrenaturais. Escolha um legado na tabela Legados Ínferos. Você ganha o benefício de nível 1 desse legado.

Quando chega aos níveis de personagem 3 e 5, você aprende uma magia de círculo mais alto, como mostra a tabela. Você sempre tem essa magia preparada. Pode conjurá-la uma vez sem gastar espaço de magia, e recupera essa capacidade quando termina um Descanso Longo. Também pode conjurá-la usando qualquer espaço de magia do círculo adequado que tiver.

Inteligência, Sabedoria ou Carisma é o seu atributo de conjuração para as magias deste traço (escolha o atributo quando escolher o legado).

#### Legados Ínferos

| Legado | Nível 1 | Nível 3 | Nível 5 |
|---|---|---|---|
| Abissal | Você tem Resistência a dano de veneno. Você também conhece o truque _Rajada de Veneno_. | _Raio Adoecedor_ | _Imobilizar Pessoa_ |
| Ctônico | Você tem Resistência a dano necrótico. Você também conhece o truque _Toque Arrepiante_. | _Vida Falsa_ | _Raio do Enfraquecimento_ |
| Infernal | Você tem Resistência a dano de fogo. Você também conhece o truque _Raio de Fogo_. | _Repreensão Infernal_ | _Escuridão_ |

_Presença de Outro Mundo._ Você conhece o truque _Taumaturgia_. Quando o conjura com este traço, a magia usa o mesmo atributo de conjuração do seu Legado Ínfero.
`,
  },
];

export function buscarEspecie(slug: string): Especie | undefined {
  return ESPECIES.find((e) => e.slug === slug);
}
