# Ícones das magias e habilidades

O catálogo de habilidades já está pronto em `src/lib/habilidades.ts`. Falta só
a arte de cada uma.

**O site funciona normalmente sem os ícones.** Onde ainda não há arte, a ficha
mostra um selo em branco tracejado com as palavras "em obra". Você pode enviar
um ícone de cada vez, na ordem que quiser, sem quebrar nada.

## Onde colocar

Crie a pasta `public/images/magias/` e salve os arquivos lá, com exatamente os
nomes desta lista.

## Especificação

| | |
|---|---|
| **Formato** | PNG com fundo transparente |
| **Tamanho** | Quadrado, 256 x 256 pixels |
| **Peso** | Até 30 KB por arquivo |
| **Estilo** | Silhueta ou desenho simples, uma cor só ou duas. Precisa ser legível a 52 pixels, que é o tamanho em que aparece na ficha |
| **Não deve ter** | Moldura, fundo colorido, texto, assinatura |

Uma fonte gratuita e boa para isso é **game-icons.net**: são milhares de
silhuetas de fantasia, todas em SVG e PNG, com licença que permite uso livre
desde que se credite o autor. As palavras-chave em inglês da tabela abaixo
foram escolhidas pensando nesse acervo.

## Por que a mesma magia serve para vários personagens

O catálogo guarda cada habilidade uma vez só. As fichas apontam para a chave,
não copiam o conteúdo. Então **um ícone de Dobre a Finados aparece na ficha da
Lily e na do Johnny ao mesmo tempo**. Você desenha uma vez, vale para todo
mundo, hoje e para quem entrar no grupo depois.

---

# Prioridade 1: truques e magias

São estas nove que aparecem com mais destaque nas fichas.

### 1. `resistencia.png`

| | |
|---|---|
| **Magia** | Resistência, truque de Abjuração |
| **Quem usa** | Lily |
| **O que faz** | Toca um aliado e o abençoa. Uma vez, ele soma 1d4 a uma salvaguarda |
| **Buscar por** | escudo, aura protetora, mão sobre ombro, benção defensiva |
| **Em inglês** | `shield`, `protection`, `divine shield`, `aura` |
| **Ideia visual** | Um escudo simples com um brilho suave em volta, ou uma mão aberta sobre um escudo |

### 2. `orientacao.png`

| | |
|---|---|
| **Magia** | Orientação, truque de Adivinhação |
| **Quem usa** | Lily |
| **O que faz** | Toca um aliado e guia a mão dele. Uma vez, ele soma 1d4 a um teste |
| **Buscar por** | bússola, estrela guia, olho aberto, caminho |
| **Em inglês** | `compass`, `guidance`, `north star`, `guiding light` |
| **Ideia visual** | Uma bússola, ou uma estrela de quatro pontas com raios curtos |

### 3. `chama-sagrada.png`

| | |
|---|---|
| **Magia** | Chama Sagrada, truque de Evocação |
| **Quem usa** | Lily |
| **O que faz** | Um clarão de fogo divino desce sobre o alvo. 1d8 de dano radiante |
| **Buscar por** | chama sagrada, coluna de luz, fogo divino, raio de luz vertical |
| **Em inglês** | `holy flame`, `sacred fire`, `light beam`, `divine light` |
| **Ideia visual** | Uma chama descendo de cima, ou um feixe de luz vertical caindo sobre um ponto |

### 4. `dobre-a-finados.png` **(usado por dois personagens)**

| | |
|---|---|
| **Magia** | Dobre a Finados, truque de Necromancia |
| **Quem usa** | Lily **e** Johnny |
| **O que faz** | O som de um sino de funeral ecoa, e só o alvo escuta. 1d8 necrótico, 1d12 se já estiver ferido |
| **Buscar por** | sino de igreja, sino rachado, sino com caveira, badalo |
| **Em inglês** | `bell`, `death bell`, `funeral bell`, `tolling bell` |
| **Ideia visual** | Um sino visto de frente, com ondas sonoras curtas nas laterais. Se achar um com caveira ou rachadura, melhor ainda |

### 5. `ilusao-menor.png`

| | |
|---|---|
| **Magia** | Ilusão Menor, truque de Ilusão |
| **Quem usa** | Johnny |
| **O que faz** | Cria um som ou a imagem de um objeto pequeno |
| **Buscar por** | máscara, silhueta dupla, vulto, fumaça tomando forma |
| **Em inglês** | `illusion`, `mirror image`, `mask`, `phantom` |
| **Ideia visual** | Duas silhuetas sobrepostas e deslocadas, uma sólida e uma tracejada |

### 6. `curar-ferimentos.png`

| | |
|---|---|
| **Magia** | Curar Ferimentos, 1º círculo, Abjuração |
| **Quem usa** | Lily |
| **O que faz** | Toca uma criatura e ela recupera pontos de vida |
| **Buscar por** | coração com brilho, mãos curando, cruz de cura, folha e coração |
| **Em inglês** | `heal`, `healing hands`, `life`, `heart plus` |
| **Ideia visual** | Uma mão aberta com um brilho no centro da palma, ou um coração com raios |

### 7. `bencao.png`

| | |
|---|---|
| **Magia** | Bênção, 1º círculo, Encantamento |
| **Quem usa** | Lily |
| **O que faz** | Até três aliados somam 1d4 a ataques e salvaguardas |
| **Buscar por** | mão erguida em benção, três figuras, halo, pomba |
| **Em inglês** | `blessing`, `praying hands`, `halo`, `holy symbol` |
| **Ideia visual** | Uma mão erguida com dois dedos, com um halo ou raios em volta |

### 8. `bracos-de-hadar.png`

| | |
|---|---|
| **Magia** | Braços de Hadar, 1º círculo, Conjuração |
| **Quem usa** | Johnny |
| **O que faz** | Tentáculos rasgam o ar em volta do conjurador e prendem quem estiver perto. 2d6 necrótico |
| **Buscar por** | tentáculos, garras saindo do chão, braços sombrios, polvo |
| **Em inglês** | `tentacles`, `eldritch`, `dark grasp`, `writhing arms` |
| **Ideia visual** | Vários tentáculos ou braços saindo de um ponto central, para todos os lados |

### 9. `armadura-das-sombras.png`

| | |
|---|---|
| **Habilidade** | Armadura das Sombras, invocação mística |
| **Quem usa** | Johnny |
| **O que faz** | A escuridão veste o corpo. Classe de Armadura passa a ser 13 mais Destreza |
| **Buscar por** | armadura escura, peitoral sombrio, manto de sombra, couraça |
| **Em inglês** | `shadow armor`, `dark armor`, `cloak`, `breastplate` |
| **Ideia visual** | Um peitoral ou manto com a silhueta se desfazendo em fumaça nas bordas |

---

# Prioridade 2: características, traços e talentos

Estes aparecem mais abaixo na ficha, em blocos menores. Se você quiser parar
na prioridade 1, a ficha já fica boa: estes continuam mostrando "em obra" sem
prejudicar a leitura.

## Características de classe

| Arquivo | Habilidade | Buscar por | Em inglês |
|---|---|---|---|
| `conjuracao.png` | Conjuração | livro aberto com brilho, runas | `spellbook`, `magic book` |
| `ordem-divina-taumaturgo.png` | Ordem Divina: Taumaturgo | símbolo sagrado, cálice, sol | `holy symbol`, `chalice` |
| `ataque-furtivo.png` | Ataque Furtivo | adaga nas costas, punhal pingando | `backstab`, `sneak attack`, `dagger` |
| `especialista.png` | Especialista | mão hábil, gazua, medalha | `expertise`, `skill`, `lockpick` |
| `girias-de-ladrao.png` | Gírias de Ladrão | marca riscada em porta, sinal de mão | `thieves cant`, `secret sign` |
| `maestria-com-armas.png` | Maestria com Armas | espadas cruzadas, alvo | `weapon mastery`, `crossed swords` |
| `invocacoes-misticas.png` | Invocações Místicas | olho arcano, runa flutuante | `eldritch`, `arcane rune`, `warlock` |
| `magia-de-pacto.png` | Magia de Pacto | mão selando acordo, contrato, corrente | `pact`, `contract`, `bound hands` |

## Traços de espécie

| Arquivo | Traço | Quem usa | Buscar por | Em inglês |
|---|---|---|---|---|
| `investida.png` | Investida | Lily | cavalo em disparada, chifres baixos | `charge`, `galloping horse` |
| `cascos.png` | Cascos | Lily | casco, coice | `hoof`, `horse kick` |
| `afinidade-natural.png` | Afinidade Natural | Lily | folha, pata e folha, broto | `nature`, `leaf`, `animal paw` |
| `agilidade-pequenina.png` | Agilidade Pequenina | Pyhmm | figura pequena passando entre pernas | `dodge`, `nimble`, `small figure` |
| `coragem.png` | Coragem | Pyhmm | coração com escudo, peito estufado | `brave`, `courage`, `heart shield` |
| `furtividade-natural.png` | Furtividade Natural | Pyhmm | vulto escondido atrás de figura maior | `hide`, `stealth`, `hidden` |
| `sorte.png` | Sorte | Pyhmm | dado, trevo, ferradura | `luck`, `dice`, `clover` |
| `visao-no-escuro.png` | Visão no Escuro | Johnny | olho brilhando no escuro | `darkvision`, `glowing eye`, `night eye` |
| `furia-dos-pequenos.png` | Fúria dos Pequenos | Pyhmm | punho pequeno, figura pequena atacando grande | `fury`, `small fist`, `giant slayer` |
| `fuga-agil.png` | Fuga Ágil | Johnny | pés correndo, rastro de poeira | `run`, `escape`, `sprint` |
| `astucia-goblinoide.png` | Astúcia Goblinoide | Johnny | cabeça de goblin, cérebro protegido | `goblin`, `cunning`, `mind shield` |

## Talentos

| Arquivo | Talento | Buscar por | Em inglês |
|---|---|---|---|
| `iniciado-em-magia-clerigo.png` | Iniciado em Magia: Clérigo | símbolo sagrado com faísca | `magic initiate`, `holy spark` |
| `habilidoso.png` | Habilidoso | três ferramentas, mãos ocupadas | `skilled`, `tools`, `versatile` |

---

## Como ligar um ícone depois de salvar o arquivo

Em `src/lib/habilidades.ts`, ache a habilidade e acrescente a linha `icone`:

```ts
"dobre-a-finados": {
  nome: "Dobre a Finados",
  tipo: "truque",
  icone: "/images/magias/dobre-a-finados.png",
  // o resto continua igual
},
```

Só isso. A ficha de todo mundo que tem essa magia passa a mostrar o desenho.
