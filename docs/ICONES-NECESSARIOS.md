# Ícones das magias e habilidades

Lista completa do que falta de arte no catálogo. São **37 habilidades**, todas
sem ícone hoje.

**O site funciona normalmente sem elas.** Onde não há arte, a ficha mostra um
selo em branco tracejado com as palavras "em obra". Você pode enviar um ícone
de cada vez, na ordem que quiser, sem quebrar nada.

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

Uma fonte gratuita e boa para isso é **game-icons.net**: milhares de silhuetas
de fantasia, em SVG e PNG, com licença que permite uso livre desde que se
credite o autor. As palavras em inglês das tabelas foram escolhidas pensando
nesse acervo.

## Uma arte serve vários personagens

O catálogo guarda cada habilidade uma vez só, e as fichas apontam para a chave
em vez de copiar o conteúdo. Um ícone de **Dobre a Finados** aparece na ficha da
Lily e na do Johnny ao mesmo tempo. Você desenha uma vez e vale para todo
mundo, hoje e para quem entrar no grupo depois.

Duas chaves podem apontar para o mesmo arquivo. **Visão no Escuro** aparece
duas vezes na lista, uma do Johnny (18 m) e uma do Vrakyr (36 m), porque os
alcances são diferentes, mas o desenho pode ser o mesmo. Isso reduz o trabalho
real de 37 para **36 arquivos**.

## A primeira geração não precisa de nada

Howai, Levi, Filavandrel, Nero, Rargnos, Tyr e o Mestre usam o sistema caseiro
antigo, e as habilidades deles já têm imagem própria em `public/images/`. Esta
lista é só do catálogo de D&D 5.5e.

---

# Prioridade 1: truques, magias e invocações

As nove que aparecem com mais destaque, no bloco de poderes da ficha.

| Arquivo | Habilidade | Quem usa | O que faz | Ideia visual | Em inglês |
|---|---|---|---|---|---|
| `resistencia.png` | Resistência (truque, Abjuração) | Lily | Abençoa um aliado, que soma 1d4 a uma salvaguarda | Escudo simples com brilho suave, ou mão aberta sobre escudo | `shield`, `protection`, `divine shield` |
| `orientacao.png` | Orientação (truque, Adivinhação) | Lily | Guia a mão de um aliado, que soma 1d4 a um teste | Bússola, ou estrela de quatro pontas com raios curtos | `compass`, `guidance`, `north star` |
| `chama-sagrada.png` | Chama Sagrada (truque, Evocação) | Lily | Clarão de fogo divino, 1d8 radiante | Chama descendo de cima, ou feixe vertical caindo num ponto | `holy flame`, `sacred fire`, `divine light` |
| `dobre-a-finados.png` | Dobre a Finados (truque, Necromancia) | **Lily e Johnny** | Sino de funeral que só o alvo escuta, 1d8 necrótico e 1d12 se já ferido | Sino de frente com ondas sonoras curtas. Com caveira ou rachadura, melhor | `bell`, `death bell`, `funeral bell` |
| `ilusao-menor.png` | Ilusão Menor (truque, Ilusão) | Johnny | Cria um som ou a imagem de um objeto pequeno | Duas silhuetas sobrepostas e deslocadas, uma sólida e uma tracejada | `illusion`, `mirror image`, `phantom` |
| `curar-ferimentos.png` | Curar Ferimentos (1º círculo, Abjuração) | Lily | Toca uma criatura e devolve pontos de vida | Mão aberta com brilho no centro da palma, ou coração com raios | `heal`, `healing hands`, `life` |
| `bencao.png` | Bênção (1º círculo, Encantamento) | Lily | Até três aliados somam 1d4 a ataques e salvaguardas | Mão erguida com dois dedos, com halo ou raios em volta | `blessing`, `praying hands`, `halo` |
| `bracos-de-hadar.png` | Braços de Hadar (1º círculo, Conjuração) | Johnny | Tentáculos rasgam o ar em volta e prendem quem estiver perto, 2d6 necrótico | Vários tentáculos saindo de um ponto central para todos os lados | `tentacles`, `eldritch`, `dark grasp` |
| `armadura-das-sombras.png` | Armadura das Sombras (invocação mística) | Johnny | A escuridão veste o corpo, CA passa a 13 mais Destreza | Peitoral ou manto com a silhueta se desfazendo em fumaça nas bordas | `shadow armor`, `dark armor`, `cloak` |

# Prioridade 2: características de classe

Dez arquivos. Aparecem logo abaixo dos poderes.

| Arquivo | Habilidade | Quem usa | Ideia visual | Em inglês |
|---|---|---|---|---|
| `conjuracao.png` | Conjuração | Lily | Livro aberto com brilho, runas | `spellbook`, `magic book` |
| `ordem-divina-taumaturgo.png` | Ordem Divina: Taumaturgo | Lily | Símbolo sagrado, cálice, sol | `holy symbol`, `chalice` |
| `ataque-furtivo.png` | Ataque Furtivo | Pyhmm | Adaga nas costas, punhal pingando | `backstab`, `sneak attack` |
| `especialista.png` | Especialista | Pyhmm | Mão hábil, gazua, medalha | `expertise`, `lockpick` |
| `girias-de-ladrao.png` | Gírias de Ladrão | Pyhmm | Marca riscada em porta, sinal de mão | `thieves cant`, `secret sign` |
| `maestria-com-armas.png` | Maestria com Armas | **Pyhmm e Vrakyr** | Espadas cruzadas, alvo | `weapon mastery`, `crossed swords` |
| `defesa-sem-armadura.png` | Defesa sem Armadura | Vrakyr | Torso nu em posição de guarda, peito sem couraça | `unarmored`, `bare chest`, `barbarian` |
| `furia.png` | Fúria | Vrakyr | Cabeça gritando, veias saltadas, punhos cerrados | `rage`, `berserker`, `roar` |
| `invocacoes-misticas.png` | Invocações Místicas | Johnny | Olho arcano, runa flutuante | `eldritch`, `arcane rune`, `warlock` |
| `magia-de-pacto.png` | Magia de Pacto | Johnny | Mão selando acordo, contrato, corrente | `pact`, `contract`, `bound hands` |

# Prioridade 3: traços de espécie

Quinze na lista, catorze arquivos, porque as duas Visões no Escuro podem
compartilhar o desenho.

| Arquivo | Traço | Quem usa | Ideia visual | Em inglês |
|---|---|---|---|---|
| `investida.png` | Investida | Lily | Cavalo em disparada, chifres baixos | `charge`, `galloping horse` |
| `cascos.png` | Cascos | Lily | Casco, coice | `hoof`, `horse kick` |
| `afinidade-natural.png` | Afinidade Natural | Lily | Folha, pata sobre folha, broto | `nature`, `leaf`, `animal paw` |
| `agilidade-pequenina.png` | Agilidade Pequenina | Pyhmm | Figura pequena passando entre pernas | `dodge`, `nimble` |
| `coragem.png` | Coragem | Pyhmm | Coração com escudo, peito estufado | `brave`, `courage`, `heart shield` |
| `furtividade-natural.png` | Furtividade Natural | Pyhmm | Vulto escondido atrás de figura maior | `hide`, `stealth`, `hidden` |
| `sorte.png` | Sorte | Pyhmm | Dado, trevo, ferradura | `luck`, `dice`, `clover` |
| `furia-dos-pequenos.png` | Fúria dos Pequenos | Johnny | Punho pequeno, figura pequena atacando grande | `fury`, `small fist`, `giant slayer` |
| `fuga-agil.png` | Fuga Ágil | Johnny | Pés correndo, rastro de poeira | `run`, `escape`, `sprint` |
| `astucia-goblinoide.png` | Astúcia Goblinoide | Johnny | Cabeça de goblin, cérebro protegido | `goblin`, `cunning`, `mind shield` |
| `visao-no-escuro.png` | Visão no Escuro, 18 m | Johnny | Olho brilhando no escuro | `darkvision`, `glowing eye` |
| `visao-no-escuro.png` | Visão no Escuro, 36 m | Vrakyr | **Pode usar o mesmo arquivo acima** | |
| `resiliencia-ana.png` | Resiliência Anã | Vrakyr | Frasco de veneno riscado, escudo com gota | `poison resistance`, `antidote` |
| `tenacidade-ana.png` | Tenacidade Anã | Vrakyr | Anão firme de pé, bigorna, raiz agarrada na pedra | `tough`, `anvil`, `sturdy` |
| `conhecimento-de-pedras.png` | Conhecimento de Pedras | Vrakyr | Mão encostada em parede de rocha, ouvido na pedra, veio mineral | `stone sense`, `rock`, `mining` |

# Prioridade 4: talentos

Três arquivos.

| Arquivo | Talento | Quem usa | Ideia visual | Em inglês |
|---|---|---|---|---|
| `iniciado-em-magia-clerigo.png` | Iniciado em Magia: Clérigo | Lily | Símbolo sagrado com faísca | `magic initiate`, `holy spark` |
| `habilidoso.png` | Habilidoso | Johnny | Três ferramentas, mãos ocupadas | `skilled`, `tools`, `versatile` |
| `vigoroso.png` | Vigoroso | Vrakyr | Coração forte, pulmão, figura carregando peso | `endurance`, `stamina`, `strong heart` |

---

# Resumo por personagem

Se você preferir fechar uma ficha de cada vez em vez de seguir a prioridade:

| Personagem | Quantos ícones | Quais |
|---|---|---|
| **Lily Bouvardia** | 12 | resistencia, orientacao, chama-sagrada, dobre-a-finados, curar-ferimentos, bencao, conjuracao, ordem-divina-taumaturgo, investida, cascos, afinidade-natural, iniciado-em-magia-clerigo |
| **Johnny Bling Bling** | 11 | dobre-a-finados, ilusao-menor, bracos-de-hadar, armadura-das-sombras, invocacoes-misticas, magia-de-pacto, visao-no-escuro, furia-dos-pequenos, fuga-agil, astucia-goblinoide, habilidoso |
| **Pyhmm Phylimm** | 8 | ataque-furtivo, especialista, girias-de-ladrao, maestria-com-armas, agilidade-pequenina, coragem, furtividade-natural, sorte |
| **Vrakyr WindRose** | 8 | defesa-sem-armadura, furia, maestria-com-armas, visao-no-escuro, resiliencia-ana, tenacidade-ana, conhecimento-de-pedras, vigoroso |

Dobre a Finados conta para dois, e Maestria com Armas também, então a soma das
colunas passa de 36 sem que isso signifique arquivo a mais.

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

Só isso. A ficha de todo mundo que tem essa habilidade passa a mostrar o
desenho. Se você me mandar os arquivos, eu ligo todos de uma vez.
