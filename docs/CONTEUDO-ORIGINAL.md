# Conteúdo Original — Terras de Mitrael (site v1)

> **Arquivo de backup e referência.** Este documento preserva, em texto puro, todo o
> conteúdo narrativo do site original antes da reconstrução completa (v2).
> Nada aqui deve ser apagado — é a fonte da verdade para a migração da lore.

| | |
|---|---|
| **Gerado em** | 28/07/2026 |
| **Commit de origem** | `212d74b` |
| **Tag do arquivo histórico** | `v1-arquivo-historico` |
| **Stack original** | HTML puro + Bootstrap 5.3 (CDN) + Google Fonts + AdSense |
| **Site no ar** | https://terrasmitrael.netlify.app/ |

O código HTML/CSS original permanece recuperável a qualquer momento com:

```bash
git checkout v1-arquivo-historico
```

---

## Sumário

1. [Decisões de migração](#decisões-de-migração)
2. [Páginas institucionais](#1-páginas-institucionais)
3. [Locais e eventos históricos](#2-locais-e-eventos-históricos)
4. [Personagens](#3-personagens)
5. [Inventário de mídia](#4-inventário-de-mídia)
6. [Glossário do mundo](#5-glossário-do-mundo)

---

## Decisões de migração

| Item | Decisão |
|---|---|
| Aba **Sistema** / Mitrael Master Book | ❌ **Não migrar.** Regras caseiras substituídas oficialmente pelos livros de D&D 5.5e. Menções ao Master Book dentro de textos narrativos podem permanecer como contexto histórico. |
| `characters/khaos.html` | ❌ **Descartado.** Cópia idêntica de `mestre.html` (apenas duas imagens trocadas). Não existe personagem chamado Khaos. |
| `downloads/fichaZerada.docx` | ❌ **Não migrar.** Ficha do sistema caseiro, obsoleta. |
| Google AdSense | ❌ **Removido** do site novo, por decisão do autor. |
| Estrutura de pastas, HTML, CSS | ❌ **Descartados.** Reconstrução completa. |
| Textos de lore, personagens, eventos | ✅ **Preservados e expandidos.** |
| Imagens, mapas e áudios | ✅ **Preservados**, com otimização de peso. |

**Erros de digitação e acentuação:** os textos originais contêm diversos erros
("pizaram", "conceguiam", "racas", "Putrefatos"/"Putredatos"/"Putrafados" alternando).
Na migração eles são corrigidos, preservando integralmente o sentido e o tom.

**Lacunas identificadas:** não existe página de "Jogadores" (as pessoas por trás dos
personagens) no site original — esse conteúdo precisa ser criado do zero.
Várias seções estão marcadas como "Em breve" e são candidatas naturais a expansão.

---

## 1. Páginas institucionais

### Home (index.html)

Desde o seu início em 2020, Terras de Mitrael tem cativado a
imaginação dos seus jogadores, mergulhando-os em um cenário
vibrante de Fantasia Medieval.

Com inúmeras histórias entremeadas e uma rica tapeçaria de
culturas, racas e lugares, Terras de Mitrael oferece uma
experiência única para cada jogador.

Seja você um nobre cavaleiro, um aprendiz de feiticeiro ou um
ladino mau-caráter, há um lugar para você neste mundo em constante
evolução.

Ao longo dos anos, vários jogadores já deixaram suas marcas nas
Terras de Mitrael, sejam em one-shots emocionantes ou em longas
jornadas repletas de desafios e reviravoltas.

2024 será um ano chave para o RPG e estamos empolgados em anunciar
uma nova fase para Terras de Mitrael.

Estamos trabalhando arduamente para desenvolver mecânicas
inovadoras e reformular histórias, tudo visando tornar o
jogo ainda mais envolvente e imersivo para nossos jogadores fieis.

Prepare-se para descobrir segredos antigos, enfrentar monstros
temíveis e forjar alianças improváveis enquanto exploramos novos
horizontes em Mitrael!

#### Trailer Primeira Temporada

#### Elenco

`[IMAGEM: images/howai.jpg]`

#### Howai

O Tigre Branco Ladino

`[IMAGEM: images/levi.jpg]`

#### Levi

O Fauno Bardo

`[IMAGEM: images/filvandrel.jpg]`

#### Filavandrel

O Humano Alquimista (e gay)

`[IMAGEM: images/reed-more.jpg]`

#### Clique para saber mais!

Imagine aqui várias historias emocionantes.

#### Junte-se a nossa comunidade!

#### Histórias

`[IMAGEM: images/story/guerra-leviana.jpg]`

#### A Grande Guerra Leviana

Conheça o evento mais importante dos últimos tempos.

`[IMAGEM: images/story/razavar.jpg]`

#### Razavar, O Palácio Real

A cidade que abriga a família imperial.

`[IMAGEM: images/story/askar.jpg]`

#### Terras de Askar

O continente vermelho.

`[IMAGEM: images/reed-more.jpg]`

#### Clique para saber mais!

Imagine aqui várias historias emocionantes.

#### Mapa

`[IMAGEM: images/map.jpg]`

---

### Índice de Histórias (story.html)

#### Histórias

`[IMAGEM: images/story/guerra-leviana.jpg]`

#### A Grande Guerra Leviana

Descubra os mistérios pode de trás desta Guerra sanguinária

`[IMAGEM: images/story/razavar.jpg]`

#### Razavar, O Palácio Real

Conheça melhor esta incrível capital, repleta de segredos ocultos.

`[IMAGEM: images/story/askar.jpg]`

#### Terras de askar

Se tiver coragem, se aprofunde nas lendas que cercam este lugar misteríoso!

`[IMAGEM: images/loc/vernaculo.jpg]`

#### Vernáculo dos Clérigos

Aprofunde-se nas mistícas curas e crenças de curandeiros.

`[IMAGEM: images/loc/arauto.jpg]`

#### Arauto dos Feiticeiros

Veja com seus próprios olhos, o quão real a magia pode ser.

`[IMAGEM: images/loc/sovara-mithr.jpg]`

#### Sovara Mithr - Sagrada Árvore

Explore esta enigmática floresta, cheia de seres místicos e harmonia com a natureza!

`[IMAGEM: images/loc/putrefados.jpg]`

#### Terra dos Putrefados

Oque sobrou de herança da Grande Guerra, esta terra ficou podre e definhou sob os inimagináveis feitiços e
rituais usadas neste local.

---

### Índice de Elenco (cast.html)

#### Elenco

`[IMAGEM: images/howai.jpg]`

#### Howai, O Ladino

Desvende os segredos do misterioso Howai, um Khajitt Ladino em sua
busca por glória e muitos pilas nas Terras de Mitrael.

`[IMAGEM: images/levi.jpg]`

#### Levi, O Bardo

Ouça a melodia do coração puro de Levi, um Fauno Bardo, em uma
jornada de harmonia e encantamento pelas Terras de Mitrael.

`[IMAGEM: images/filvandrel.jpg]`

#### Filavandrel, de Mithr

Mergulhe na mente alquímica de Filavandrel, o visionário viadinho,
cuja mente aguçada molda destinos nas Terras de Mitrael.

`[IMAGEM: images/baine.jpg]`

#### Baine, O Druida

Se aventure pela trilha de Baine, um elfo druida, que foi criado
por lobos em Sovara Mithr.

`[IMAGEM: images/nero.jpg]`

#### Nero, O Necromante

Aprofunde-se o caminho de Nero, um Drow corrompido pelas Terras
dos Putrefados e fiel seguidor da Deusa das Aranhas, Lolth.

`[IMAGEM: images/rarg.jpg]`

#### Rargnos, O Xamã

Descubra Rargnos Brass, um Curinqueã Xamã que busca por conhecer
melhor o seu passado e que vaga protegendo as florestas.

`[IMAGEM: images/tyr_vidar.jpg]`

#### Tyr, O Mais Forte

Nunca desafie as origens nórdicas de Tyr Vidar, um Aesiris Viking
em sua busca incansável pela força e paga o preço colossal da
matança.

`[IMAGEM: images/metro.jpg]`

#### Mestre, O Mestre

O mestre mestra todas as coisas, controla tudo e a todos, por muitos adorado como o Deus Criador e também conhecido como aquele que está acima de todos.

---

### Mapa (map.html)

`[IMAGEM: images/map.jpg]`

---

## 2. Locais e eventos históricos

Sete páginas narrativas. A **Grande Guerra Leviana** é o evento definidor da
linha do tempo e é referenciada por praticamente todas as outras páginas e
biografias — funciona como o eixo central do cenário.

### A Grande Guerra Leviana

*Evento histórico central da linha do tempo de Mitrael. Ano 614, 36 anos de guerra. 5 capítulos completos.*

`arquivo original: storys/levian_war.html`

`[IMAGEM: ../images/story/guerra-leviana.jpg]`

#### A Grande Guerra Leviana

O ano de 614 ficou marcado por aquilo que posteriormente seria conhecido como A Grande Guerra Leviana, conhecida
como a maior guerra de todos os tempos, marcou com brutalidade o solo de Mitrael.

• Capítulo 1 - A Expedição

Ao final do quinto século da Terceira Era as amarras de uma ditadura imperial
sanguinária
chegava ao fim.

As pessoas comuns tinham mais liberdade e a civilização com muito mais autonomia, a criação do livre
mercado fez com que o desenvolvimento crescesse exponencialmente.

`[IMAGEM: ../images/loc/askarImg1.jpg]`

Com novas tecnologias vindo a tona, liberdade de pensamento, algumas pessoas mais sabias e dotadas de
inteligencia comecaram a sentir sede de conhecimento e uma vontade natural em desbravar o desconhecido.

Um grupo conhecido como Os Expedicionários começou a se formar.

Composto por pesquisadores, cientistas, alquimistas e até mesmo feiticeiros, este grupo tinha como lema
desvendar todos os segredos e misterios por tras da natureza, da magia e do cosmos.

Cedo ou tarde outro grupo tambem atingiria o mesmo feito, porem, talvez por puro destino, estes homens e
mulheres foram escolhidos para realizar uma tarefa, da qual se arrependeriam amargamente depois.

O feito?

Eles reuniram as maiores e mais tecnologicas embarcações da epoca e queriam desbravar os oceanos, não
apenas para realizar novas descobertas e colonizar novas terras, mas também para confirmar diversas
teorias e exeperimentos, como
por exemplo se a terra era realmente redonda.

`[IMAGEM: ../images/loc/askarImg2.jpg]`

Desta maneira reuniram grande parte das mentes mais brilhantes e foram em uma frota de 16 embarcações,
sendo algumas delas servindo apenas como escolta.

• Capítulo 2 - Barro Vermelho

Apos 8 dias velejando sem ver terra alguma, avistaram no horizonte montanhas potiagudas e aparentemente
vermelhas.

Avistaram uma costa onde poderiam finalmente desembarcar por alguns dias, iniciar os estudos desta nova
terra era tudo oque tanto desejavam, porém conforme foram se
aproximando o calor aumentava insuportavelmente e também avistavam várias silhuetas grandes e largas ao
longe.

Ao se aproximarem o suficiente foram recebidos por salvas de flechas flamejantes.

Ao longe ouvia-se os gritos daquele povo que futuramente ficariam conhecidos como "Orc's".

Aquele seres proferiam ferozmente e em sintonia "Askar!, Askar!, Askar!" incessantemente.

As embarcações de escolta comandadas pelos soldados reais , como eram mais robustas devido sua alta taxa
de armadura, tomaram a frente, porém seria impossível desembarcarem, além das milhares de flechas
pegando fogo, centenas de pequenas embarcações começaram a surgir por de trás das rochas.

`[IMAGEM: ../images/loc/askarImg3.jpg]`

Os apítos de socorro soaram alto nas embarcações remanescentes, com isso o sinal era claro, recuar!

A cena de dezenas de embarcações sendo engolidas por fogo, cheia dos maiores cientistas e pesquisadores,
mais rápido do que nunca se deram conta que não estavam preparados para uma batalha de mesmo nível,
então decidiram retornar a Mitrael, só não contavam com um detalhe.

• Capítulo 3 - Trilha de Sangue

Apenas 4 embarcações retornaram com seus tripulantes, alguns feridos porém estavam a salvo.

Durante os 8 dias e noites de retorno foram atormentados pelas lembranças de verem seus semelhantes
serem queimados vivos, a expedição tinha se tornado uma catástrofe com perdas imensuráveis para Mitrael.

Um pequeno grupo de cidadãos visualizaram embarcações com as bandeiras dos Expedicionários, porém estranharam o retorno precoce e com tão poucas embarcações,
perceberam que havia algo de errado e a notícia se espalhou rápidamente.

Os poucos sobreviventes mal conceguiam falar por conta do trauma e gemiam por conta de delírios, mas,
aqueles que ainda tinham um pingo de sânidade, tentaram explicar que foram dizimados por uma raça
desconhecida e que havia um risco de uma nova guerra surgir.

O sossego levou apenas 2 dias após a sua chegada para que acabasse por 36 anos.

Uma pequena embarcação oriunda das Terras de Askar desembarcou um pequeno grupo
de 6 Orc's, próximo a um vilarejo, mas foi o suficiente para causar a morte de centenas de pessoas que
não estavam esperando tal visita.

Devido ser um lugar isolado, onde ocorreu o primeiro ataque, levou alguns dias para que alguém
conseguisse espalhar a notícia.

Oque potenciamentel resultou na morte de milhares de inocentes que mal sabiam oque estava acontecendo.

Desta maneira se iniciou uma guerra que moldaria o futuro da vida de milhões de cidadões de milhares de
raças.

• Capítulo 4 - A Grande Guerra Leviana

Cada vez maiores embarcações vindas de Askar chegavam à costa de Mitrael, trazendo mais e mais Orc’s
sedentos por sangue.

Além dos Orcs’s, algumas outras raças também começaram a peregrinar em direção às Terras de Mitrael,
muitas delas eram aliadas dos Orc’s e trabalhavam em conjunto, ficando assim conhecidos como “Exército
Vermelho”.

No início desta “migração”, com certa dificuldade, começaram a serem abatidos e controlados pelos
soldados reais e mercenários das redondezas, porém, ao passar dos dias, o número de criaturas aumentava
de maneira que parecia ser exponencial.

Sempre que alguém era brutalmente assassinado por eles, todas as criaturas gritavam: Askar, Askar!!

Sendo assim apelidaram aquele continente vermelho de “Terras de Askar”.

Passados 50 dias de batalhas incessantes, os Cavaleiros de Elite Reais que compunham uma imponente alça
do “Batalhão de Elite” do exército real, foram requisitados e enviados a frente de batalha com a
esperança de expurgarem estas criaturas de Mitrael de uma vez por todas.

Sem surtir nenhum efeito significativo o império começará a sentir que poderia realmente perder o
controle da situação e se tornar uma guerra sem precedentes.

Essas pequenas batalhas duraram vários anos, até que os Orc’s começassem a se aprimorar estrategicamente
e fossem em busca de mais e mais espaço.

Chegou a um ponto do exército real perder todo o território outrora conhecido como “Abarius” e
tornando-se assim uma espécie de base militar e estratégica para os “Arkeanos”.

As espadas e armaduras dos Orc’s tinham um aço de maior qualidade, um fio com melhor acuidade e uma
potência muito superior, um simples humano com espadas simples e armaduras muitas vezes de couro não
tinha chances contra um inimigo tão truculento.

O exército imperial não estava mais sendo eficaz conforme os Arkeanos se reuniam e se dispersavam cada
vez mais fundo no território de Mitrael.

Passados 10 anos de incessantes guerras e após inúmeras baixas e diversas batalhas perdidas o Rei
Surmellion 2º, “O Benevolente” com medo de ficar mal visto e falado pelo povo, decidiu por enviar um
chamado para qualquer povo destemido e até mesmo de cantos onde não se tinha muita afinidade, unindo
assim milhões de cidadãos dispostos a defender o seu lar de um inimigo tão “demoníaco”, eles ficariam
conhecidos como “Os Honrados Voluntários”.

• Capítulo 5 - Treze mil Trezentos e Trinta e Três Dias

Os Lendários Guerreiros e os povos das Terras de Tungel fizeram uma essencial diferença no campo de batalha e aguentaram ferozmente por um grande tempo os avanços do inimigo, apesar disso, não seria o suficiente, cada dia Mitrael se enfraquecia mais e mais.

Após 33 anos de pura guerra, centenas de milhares já haviam morrido em nome de Mitrael, uma quantidade
inimaginável de sangue foi derramada por aquele campo de batalha.

Muitos não conseguiam mais voltar ao campo de batalha após uma batalha, depois de presenciarem do que um
bruxo Orc era capaz, o nível de crueldade e perversão de suas magias era tamanha, que mesmo um bandido
sem compaixão ficava completamente louco.

Os poucos que voltaram com vida, voltavam sem sanidade alguma e com isso o medo se espalhava cada vez
mais sobre aqueles que ainda não haviam presenciado o que era a verdadeira guerra.

Os feiticeiros do Arauto, Os clérigos do Vernáculo e os guerreiros que ainda permaneciam defendendo
Mitrael, já estavam ficando esgotados de ver seus amigos e familiares serem destroçaados.

O povo já não tinha mais esperança e o Rei sentia uma vergonha completa.
A derrota era iminente e já se esperava o pior.

Foi então que em um ato de desespero e último suspiro, o Rei Surmellion, convocou, os “Lendários Magos”
e os misteriosos de Vérsia, que se uniram em uma
frente nunca antes vista.

Eles empunharam e vestiram equipamentos muitíssimos avançados e melhores que os convencionais,
utilizaram de segredos há muito tempo
esquecidos e sem medir qualquer consequência abusaram de magias e feitiços proibidos.

Apesar do campo de batalha já ter sido drasticamente afetado pelas batalhas, o poder utilizado de uma só
vez para acabar de uma vez por todas com este inimigo em comum, foi tamanho que devastou por completo e
apodreceu em maldições.

Agora conhecida como Undaryus e Floresta dos Putredatos, não restou um pingo de benevolência neste
lugar, esquecido por qualquer divindade ou entidade de luz, somente a sombra ficou perpetuada.

Após 36 anos. o esforço foi recompensado com uma vitória avassaladora sobre os inimigos vermelhos e um
gigantesco domo mágico foi evocado sobre as Terras de Askar, aprisionando para sempre aquelas criaturas
malignas e garantindo que Mitrael se reerguerá sobre glória e paz… por enquanto.

---

### Razavar, O Palácio Real

*Capital de Mitrael, sede da família real.*

`arquivo original: storys/razavar.html`

`[IMAGEM: ../images/story/razavar.jpg]`

#### Razavar, O Palácio Real

Razavar, a grande capital de Mitrael, perpetuando o poder da alta nobreza.

• A Grande Capital

Terra de Humanos, Elfos, Anões, Antropomorficos e muitas outras raças.

Todos tentam viver em paz entre sí, apesar das altas classes rejeitarem essa miscigenação, os povos mais humildes não ligam tanto para isso.

Conhecida pelas oportunidades de viver uma vida decente entre as terras outrora desoladas por conta da Grande Guerra, a cidade cresce em um ritmo alarmante, com milhares de imigrantes todos os dias.

Apesar de uma vida mais aparentemente mais justa, ainda assim a desigualdade começa a se mostrar um problema por conta da imigração desenfreada.

Uma cidade invejada pelo seus engenheiros, artesões, destemidos guerreiros e suas belissimas donzelas.

Razavar é o lar da família real, aonde se encontra o Rei de Mitrael.

• Cultura

Em breve..

• Capítulo 3 - Em breve..

Em breve..

---

### Terras de Askar

*O continente vermelho — Orcs, dragões, a Grande Barreira.*

`arquivo original: storys/askar.html`

`[IMAGEM: ../images/story/askar.jpg]`

#### Terras de Askar

Batizada de Terras de Askar, é o lugar mais temido de toda Mitrael.

• O lado vermelho do Mar

Terras dos Orc's, dragões e criaturas malignas.

Pouco se sabe de fato quais criaturas habitam, nem como o lugar se parece, pouquissímas pessoas viveram para contar a história deste lugar, muitas sendo julgadas como "Os Caídos" .

São temidos pela sua extrema violência e impiedade.

Exímios guerreiros e em sua maioria desnutridos de inteligência.

São movidos pela raiva, sede de sangue e violência extrema.

a maioria das criaturas deste lugar lutam entre sí até a morte em arenas para virarem lendas culturais.

Conhecidos pelos seus ledários ferreiros, suas armas são as mais potentes e bem trabalhadas já vistas em qualquer outro lugar de Mitrael.

As criaturas que ali habitam achavam que ASKAR era o planeta inteiro, sem saber da existência de outras civilizações até poucos anos atrás.

Ao final da guerra descobriram vestigios de que uma possível raça desconhecida e misteriosa domina e escraviza as vidas de ASKAR, tanto quanto os Orc's, os pouco chamados Filhos do Fogo, ninguém sabe o seu propózito, oque ou quem são, mas todos esperam nunca passar perto deles novamente.

• A Grande Barreira

Ao fim da Grande Guerra Leviana foi conjurado uma barreira impenetrável, para trancar todas as criaturas nesta Terra em que Mitrael jamais vai querer ver novamente.

A maneira em que a barreira foi ergida ainda é um mistério, mas algumas lendas sugerem que após um acordo com os Deuses, para se livrar de uma terra, precisaria dar outra.

Surgindo assim as Terras dos Putrafados

• Capítulo 3 - Em breve..

Em breve..

---

### Vernáculo dos Clérigos

*Berço da medicina, das poções e dos clérigos.*

`arquivo original: storys/vernaculo.html`

`[IMAGEM: ../images/loc/vernaculo.jpg]`

#### Vernáculo dos Clérigos

Conhecida pela sua medicina super avançada e por formar os mais competentes Clérigos de toda Mitrael.

• Um papel vitalício

Terra de crensas, bençãos e curas.

Conhecida por trabalharem muito bem com as preciosidades encontradas em Sovara Mithr.

É o berço dos maiores clérigos, paladinos, alquimistas e curandeiros encontrados em toda Mitrael.

Produzem as melhores poções, antídotos e métodos de cura que estas terras já viram.

As cidades dessa região estão sempre lotadas de feridos, pessoas com doenças raras e até mesmo amaldiçoados.

Responsáveis pela saúde do povo, sem eles a espectátiva de vida de todas as raças seria extremamente menor do que é hoje em dia.

• Bençãos

Em Breve...

• Capítulo 3 - Em breve..

Em breve..

---

### Arauto dos Feiticeiros

*Reduto dos magos e do conhecimento arcano.*

`arquivo original: storys/arauto.html`

`[IMAGEM: ../images/loc/arauto.jpg]`

#### Arauto dos Feiticeiros

Um lugar místico, aonde os maiores magos e feiticeiros já pizaram, estudaram e dela aula.

• Feitos Incriveis

Terras de magias e mistérios.

No Arauto dos Feiticeiros se encontram os lendários magos, que fizeram toda a diferença na Grande Guerra Leviana.

Um lugar recluso da civilização, não são todos que tem acesso a este lugar.

Comprometidos em guardar valisos conhecimentos, trabalham duro para garantir que este conhecimento não caia em mãos erradas.

As mais mistícas lendas repercutem por Mitrael, como as dos divinos magos lendários e um dos maiores mitos que já pizaram Mitrael, O Grandissimo Mago Divino, que teria tanto poder que dizimou o equivalente a um exército inteiro fácilmente sem ficar esgotado.

• Magias & Feitiços

Em Breve...

• Capítulo 3 - Em breve..

Em breve..

---

### Sovara Mithr — Sagrada Árvore

*A Sagrada Árvore, as fadas e a celebração anual da vida.*

`arquivo original: storys/sovara-mithr.html`

`[IMAGEM: ../images/loc/sovara-mithr.jpg]`

#### Sovara Mithr - Sagrada Árvore

Um lugar de muita diversidade e harmonia, o "pulmão" de Mitrael e maior fonte de suprimentos da região.

• Uma Árvore Divina

Terra das Fadas e de seres místicos, é conhecida pela sua natureza exótica, afrodisíaca e com grandes propriedades de curativas.

A Sagrada Árvore se encontra em Sovara Mithr e é cultuada como um presente dos Deuses, interpretando-a como uma ligação entre Mitrael e as Divindades.

Todo ano acontece uma celebração á vida e milhares, se não milhões, de pessoas se reúnem para adorar os Deuses, agradecer o dom da vida, relembrar os lendários guerreiros que defenderam as Terras de Mitrael e celebrar a vitória da Grande Guerra Leviana.

• Florestas Místicas

Em Breve...

• Capítulo 3 - Em breve..

Em breve..

---

### Terra dos Putrefados

*Terra amaldiçoada, herança direta da Grande Guerra Leviana.*

`arquivo original: storys/putrefados.html`

`[IMAGEM: ../images/loc/putrefados.jpg]`

#### Terra dos Putrefados

Neste local ninguém quer vir e mal fala sobre, um lugar esquecido pela luz e por todos.

• Maldições

Terra de maldições e condenações.

Fruto da Grande Guerra Leviana, ficou totalmente devastada e amaldiçada. Existem muitos seres que vagam sem rumo por essas terras.

Neste lugar a vida não faz sentido, não existe amor, a palavra Felicidade é um insulto.

Ninguém em sã conciência jamais pensaria em ir para este lugar.

Existem incontáveis lendas sobre este lugar, uma delas diz que as pessoas que ousarem retornar a este local, jamais voltarão, outra cita as terriveis criaturas que ainda podem ser encontradas vagando sem rumo..

Outra..

que mesmo após o fim da Grande Guerra Leviana acontecem os mais macabros rituais e magias de ocultismo de todo planeta.

Por fim tudo se resume em um grande mistério e um medo coletivo gigante que mantém todas as pessoas longe.

• Lendas

Em Breve...

• Capítulo 3 - Em breve..

Em breve..

---

## 3. Personagens

Oito personagens. **Todos** foram criados sob o sistema de regras caseiro
(*Mitrael Master Book*), anterior à adoção de D&D 5.5e — reconhecíveis pelos
campos *Sanidade %*, *Energia/Mana* e pelos bônus de raça em chaves.
Fichas retomadas precisarão de recalibração para as regras atuais.

### Howai

*Khajiit / Ladino*

`arquivo original: characters/howai.html`

`[IMAGEM: ../images/howai.jpg]`

#### Howai, O Tigre Ladino

Level: 4

EXP: 375 / 550 ↑

• Resumo

Howai e um Tigre Branco que após passar por muitas dificuldades em sua infância precisou
sobreviver
de uma maneira não muito honrosa, porem agora, renegado da Guilda dos Ladrões, busca a glória a
qualquer custo.

• Informações

#### Identidade

Nome: Howai

Idade: 27 Anos

Altura: 1.80 m

Gênero: Masculino

Classe: Ladino

Raça: Khajiit

#### Pontos de personagem

Vida: 51 HP

Level: 4

Experiência: 375 / 550

Sanidade: 75%

#### Personalidade

Mau-Neutro (Egoísta)

Motivaçoes: Glória e Pilas

Inspiraçoes: Família e Wabar

Defeitos: Cleptomaniaco

Objetivo: Construir uma reputação gloriosa como um ladino legendário e construir uma fortuna como
patrimônio.

• Atributos

Exemplos:

Modificador: [-X], [+X]

Bônus Raça: (X)

• FORÇA: 10 [0]

• CONSTITUIÇÃO: 6 [-3]

• DESTREZA: 18 {2} [+3]

• INTELIGÊNCIA: 4 [-3]

• SABEDORIA: 15 {1} [+2]
• CARISMA: 1 [-5]

• Habilidades

#### • Olho Nortuno

#### {Passiva} (Raça)

`[IMAGEM: ../images/tiger_eyes.jpg]`

Pode enxergar com facilidade na escuridão noturna.
Bônus de +1[SABEDORIA] durante a noite.

#### • Instinto Ladino

#### {Passiva}

`[IMAGEM: ../images/rogue_instinct.jpg]`

Enquanto Furtivo recebe bônus de +1[DESTREZA] E +1[SABEDORIA].

#### • Flechas Múltiplas Lvl 2

#### ?? Energia

`[IMAGEM: ../images/multiple_arrows.jpg]`

Atira 3 flechas ao mesmo tempo.

Pode acertar 3 alvos diferentes ou 3 flechas no mesmo alvo.

#### • Ataque Instântaneo Lvl 1

#### ?? Energia

`[IMAGEM: ../images/atack_evasive.jpg]`

Realiza um rápido ataque com uma arma que tenha acuidade.

Após o ataque permanece Furtivo.

#### • Evasão Lvl 1

#### 1 vez p/ dia

`[IMAGEM: ../images/interroga.jpg]`

Esquiva-se de um ataque e perde a furtividade.

`[IMAGEM: ../images/howai-wabar.jpg]`

#### Historia

Howai foi criado apenas por sua mãe, pois seu pai havia partido para lutar em ajuda a Mitrael na Grande Guerra Leviana, Howai e sua mãe viviam próximo à Passagem Golem de Gelo,
apesar de viverem em um lugar muito isolado, as notícias sobre a guerra chegaram e muitos peregrinaram em
direção aonde agora e conhecido como a Terra dos Putrefatos, um lugar que assim como seu pai,
muitos morreram.

Durante sua infância eram praticamente só os dois, Howai e sua mãe. Com ela aprendeu a caçar com arco e a
ser
furtivo.

Aos 16 anos Howai estava fortemente doente, então, não podia sair de casa para caçar, além disso, como
em todo inverno, a grande tempestade de neve estava por vir.

Eles estavam com pouquíssimos suprimentos para passarem a tempestade, então sua mãe decidiu sair sozinha
para
caçar.

Durante a caçada, ela tentou fazer uma travessia arriscada por um lago congelado, pois havia visto um
cervo do lado oposto.

O gelo em alguns pontos estava mais fino e durante a travessia se partiu.

Ela caiu na água e cortou a perna em um fragmento de gelo, porém, como ela era muito ágil, conseguiu
sair
do lago, mas, além de estar sangrando bastante, com muita dor e molhada, estava muito longe de casa para
voltar antes da tempestade chegar.

Inevitavelmente não conseguiu se salvar da tempestade, e ficou presa nela.

Após algumas horas, Howai já havia percebido que tinha alguma coisa errada, mas, já era tarde de mais, a
tempestade já tinha chegado e seria praticamente impossível encontrá-la em meio a nevasca, apesar destes
fatores, tomado por emoção, ele saiu determinado a encontrá-la.

Ele passou horas a fio a procurando, até ver uma silhueta em meio a tempestade, ao se aproximar percebeu
que era sua mãe e que estava morrendo de hipotermia, ele ainda não sabia, mas, neste ponto já não havia
mais nada a ser feito.

Howai ao ver esta cena, entrou em choque e já não sabia oque fazer, com muita sorte sua mãe ainda tinha
forças para falar algumas palavras, ela expressou todo o seu amor por Howai e disse que se tentasse
salva-lá em meio a essa tempestade, ele também iria morrer.

Completamente abalado e chorando muito, Howai conseguiu entender a situação, disse que também a amava e
começou a tentar voltar para casa.

Ele sabia que não tinha mais nada que o ligasse àquela casa, mas não havia outro lugar para ir, então
retornou para la.

Foram 3 dias e 3 noites intensos, mas ele sobreviveu.

Após isso resolveu tentar continuar a morar naquela casa e para sobreviver, caçava sua própria comida,
mas
muitas vezes não conseguia alimento, chegou a passar fome, realmente para Howai foram tempos difíceis.

Depois de alguns meses ele não estava mais aguentando ficar em um lugar que o lembrava constantemente de
seu passado, portanto, decidiu abandonar sua casa e tentar uma vida de andarilho, mas as coisas não
foram nada
fáceis para ele.

Em incontáveis vezes ele passou por dificuldades, mas para sobreviver foi obrigado a roubar e com o
tempo
ficou ótimo nisso, depois de 4 anos sozinho acabou roubando as pessoas erradas, uma guilda de ladrões,
que ao invés de se irritar com ele, se impressionou muito com suas habilidades e o recrutou.

Após isso ficou preso 6 anos nessa guilda, porem, aprendeu muito com eles, mas, já estava cansado
daquilo
tudo e queria ter uma vida normal agora.

Portanto, decidiu por sair da guilda, como já tinha a confiança de todos nela, apesar de muitos serem
contra a ideia, não foi tão difícil sair, alguns de companheiros da alta cúpula entenderam perfeitamente
seu lado e permitiram sua saída, com o acordo de que nunca mais retornaria para a Guilda dos Ladrões.

Entao foi tentar a sorte em Razavar, onde ele esta agora.

Não me importo o quão forte você é, se eu te enganar, eu ganhei.

O Ladino, Howai

Mais vale uma carteira na minha mão do que no bolso de alguém.

O Ladino, Howai

---

### Levi

*Fauno / Bardo*

`arquivo original: characters/levi.html`

🔊 Narração em áudio: `audios/levi.mp3`

`[IMAGEM: ../images/levi.jpg]`

#### Levi, O Fauno Bardo

Level: 3

EXP: 110 / 375 ↑

• Resumo

Levi, é um fauno bardo, orfão por conta da Grande Guerra Leviana,
ele cresceu sob a tutela de um taberneiro na pequena cidade de Entrerio.

Com talento natural para a magia e uma forte ligação com a natureza,
ele busca conhecer melhor sua história atraves de suas melodias e encantos.

• Informações

#### Identidade

Nome: Levi

Idade: 22 Anos

Altura: 1.65 m

Gênero: Masculino

Classe: Bardo

Raça: Fauno

#### Pontos de personagem

Vida: 54 HP

Level: 3

Experiêcia: 110 / 375

Sanidade: 60%

#### Personalidade

Bom-Neutro (Justo)

Motivações: Colar Misterioso, tocar sua Musica e o seu passado.

Inspirações: Velho Taberneiro.

Defeitos: Humor duvidoso e Festejador.

Ojetivo: Descobrir mais sobre o passado de sua familia e tornar-se um bardo muito famoso.

• Atributos

Exemplos:

Modificador: [-X], [+X]

Bonus Raça: (X)

• FORÇA: 6 [-2]

• CONTITUIÇÃO: 6 [-2]

• DESTREZA: 10 [0]

• AGILIDADE: 7 (1) [-2]

• INTELIGÊNCIA: 16 (2) [+3]

• CARISMA: 18 (+4)

• Habilidades

#### • Herança Genética

#### {Passiva} (Raça)

`[IMAGEM: ../images/magic_advantage.png]`

Esta raça foi reconhecida pela sua astuta habilidade em manipular encantamentos, principalmente
envolvendo o fator cura.

Bônus de +2 em qualquer item encantado que esteja portando.

⁕ +3 se for de cura.

⁕ Em uma floresta esse bônus é dobrado.

#### • Benção do Poeta Lvl 2

#### {Passiva}

`[IMAGEM: ../images/flauta.png]`

A música tocada pelo fauno cativa o coração dos aliados e adiciona o efeito
Benção
.

Some +4 ao resultado final da rolagem nas curas a si mesmo e aos aliados que a ouvirem.

#### • Marasmo Lvl 1

#### ◂ Magia de Ilusão ▸

#### 1 Carga p/ batalha

`[IMAGEM: ../images/flauta2.png]`

O majestoso som da flauta samponã pode deixar até 2 inimigos atordoados por 1 turno.

#### • Inimizade Lvl 1

#### ◂ Magia de Ilusão ▸

#### 2 Cargas p/ dia

`[IMAGEM: ../images/briga.png]`

Faz com que 2 inimigos briguem entre sí.

Caso tire um critico um dos inimigos torna-se um NPC Aliado.

#### • Ventos Revigorantes Lvl 1

#### ◂ Magia de Cura ▸

#### 2 Cargas p/ batalha

`[IMAGEM: ../images/cura.png]`

Cura 1 aliado rolando 1d6.

Caso tire 6 natural, o valor da cura é dobrado.

`[IMAGEM: ../images/flute.jpg]`

#### Historia

`[ÁUDIO: /audios/levi.mp3]`

Nasci na ilha de

Pondor do Aramate
, localizada no Mar Leviano, onde era o lar de diversas raças que viviam em plena paz e
harmonia com a natureza.

Uma delas eram os Faunos, conhecidos pelas suas pernas e chifres de bode.

Os Faunos passavam maior parte do seu dia fazendo cantigas, escrevendo contos, manipulando a magia de forma
harmônica e desde pequenos eram incentivados a tocar instrumentos.

Toda essa felicidade foi perdida... 22 anos atrás os Orcs invadiram e tomaram a ilha para si.

Assassinaram quase todos os habitantes e escravizaram os que sobraram.

Numa tentativa desesperada de salvar a espécie, os Faunos colocaram algumas crianças em canoas e as lançaram
no
Mar Leviano
em direção à costa de Mitrael na esperança de serem encontradas por alguém, uma delas era eu.

A maioria das canoas se perderam no caminho ou afundaram... foram poucos os que chegaram em algum lugar.

Um dos sortudos sobreviventes fui eu!

Minha canoa apareceu de manhã cedo numa praia de
Entrerrio.

Comigo eu carregava apenas 2 coisas, um colar encantadamente misterioso no pescoço e uma flauta
Samponã.

Obviamente eu não me lembro de nada disso, pois eu era um recém-nascido.

Quem sempre contou essa história era o velho que o resgatou.
Ele era um ex soldado da corte e com o dinheiro da aposentadoria montou uma taverna que sempre foi seu
sonho.

Esse velho alcoólatra me nomeou como "Levi" e me criou junto de seu filho biológico.
O velho já era viúvo há alguns anos... nossa pequena família de três integrantes até que se virava bem.

Nos dividíamos um pequeno quarto nos fundos da taverna, era apertado, mas gostávamos de morar ali.
Durante o dia o velho sempre nos ensinava alguma técnica de combate ou manuseio de espadas.

A noite, trabalhávamos na taverna, limpando vomito dos bêbados, atendendo as mesas, separando brigas...
Mas o que eu mais gostava era de assistir os artistas que ali se apresentavam.

Algo dentro de mim me dizia que era isso que eu deveria ser.

Eu sempre adquiria algum conhecimento artístico e musical dessas pessoas, com o tempo dominei a maioria
dos instrumentos.

A flauta samponã foi a que mais me aperfeiçoei e desenvolvi minha magia a partir dela.

Quanto mais me ligava a música e a arte... mais a curiosidade sobre meu passado desconhecido crescia
dentro de mim. Assim passei minha infância e adolescência.

Pouco após eu completar 17 anos, o velho foi assassinado brutalmente por um grupo de ladrões.

O filho biológico herdou a taverna e eu fiquei desolado com o ocorrido, decidi largar tudo e seguir
minha
voz interior, meu sentimento em relação à arte nunca mudou... eu tinha certeza de que isso era o certo a
se fazer!

Juntei meus poucos pertences, me despedi de meu "irmão" e segui meu rumo sem destino.

A partir daquele dia me apresento em todas as tavernas que encontro em meu caminho, esse é meu ganha
pão.

Tento usar minha magia só para o bem, por mais que a situação aperte de vez em quanto eu tenho que fazer
coisas que não me orgulho muito.

Minha curiosidade pelo meu passado só cresce com o passar dos anos e a saudade daquele velho e do seu
filho que me tratavam como família e enorme.

Já faz 5 anos que vago sozinho pelo mundo.

Escrevo minhas aventuras em meu caderno de bolso e as guardo com muito carinho.

Espero um dia poder contar essas histórias para muita gente!

Sobe o morro do perigo, não é mais do que ninguém,

vai subir com vinte e cinco

e vai descer com mais de cem.

O Bardo, Levi

Se navegar chegou, deixa navegar,

chegou deixa chegar.

O Fauno, Levi

---

### Filavandrel de Mithr

*Humano / Alquimista*

`arquivo original: characters/filavandrel.html`

🔊 Narração em áudio: `audios/filavandrelstory.mp3`

`[IMAGEM: ../images/filvandrel.jpg]`

#### Filavandrel, de Mithr

Level: 1

EXP: 0 / 150 ↑

• Resumo

Filavandrel, nascido em Sovara Mithr, gosta de beijar homens e estudar sobre tudo.

Conhecido por ser super dotado intelectualmente e pretender se tornar um alquimista renomado.

• Informações

#### Identidade

Nome: Filavandrel

Idade: 25 Anos

Altura: 1.50 m

Gênero: Homossexual

Classe: Alquimista

Raça: Humano

#### Pontos de personagem

Vida: 12 HP

Level: 1

Experiência: 0 / 150

Sanidade: 100%

#### Personalidade

Bom-Neutro (Bondoso)

Motivações: Equilibrar a desigualdade através

Inspiraçoes: Estudar química, matemática, física, biologia, cosmologia e astronomia.

Defeitos: Complexo de superioridade intelectual.

Objetivo: Tornar-se o maior alquimista matematico fisico biologo astronomico.

• Atributos

Exemplos:

Modificador: [-X], [+X]

Bônus Raça: (X)

• FORÇA: 3 [x]

• CONTITUIÇÃO: 3 [x]

• DESTREZA: 14 [x]

• AGILIZADE: 10 [x]

• INTELIGÊNCIA: 16 (1) [x]

• CARISMA: 14 (x)

• Habilidades

#### • Sabido

#### {Passiva} (Raça)

`[IMAGEM: ../images/book.jpg]`

Por ter um Q.I elevado, tem uma percepção aguçada, consegue desvendar mistérios e enigmas com
facilidade.

Bônus de +2 em dados de investigação, intuição e percepção.

#### • Alquimista Veterano Lvl 1

#### {Passiva}

`[IMAGEM: ../images/sabido.jpg]`

Para aprimorar seu conhecimento em alquimia, Filavandrel testou por anos as poções em sí
mesmo.

Ao consumir poções os efeitos são 25% maiores e recebe metade do dano de envenenamentos.

#### • Explosivos Instantâneos
Lvl 1

#### 3 Cargas p/ batalha

`[IMAGEM: ../images/explosivos.jpg]`

Roda 1d3 para criar:

1. Explosivo

Causa 1d6 de dano em 2 alvos.

2. Veneno

Envenena um inimigo causando 1d6 de dano venenoso por 2 turnos. (Não acumula)

3. Explosivos Ácidos

Causa 1d8 de dano explosivo e 1d8 de dano ácido por 2 tunos em até 2 alvos. (Não acumula)

#### • Alquitônico Lvl 1

#### 2 Carga p/ batalha

`[IMAGEM: ../images/pocao.jpg]`

Roda 1d3 para criar:

1. Poção de Cura

Cura 5 pontos de vida.

2. Elixir de Adrenalina

Aumenta +2 [AGI] por 2 turnos e cura 5 pontos de vida.

3. Tônico da Fúria

Roda +1 dado de dano e cura 10 pontos de vida.

`[IMAGEM: ../images/alquimico.png]`

#### Historia

`[ÁUDIO: /audios/filavandrelstory.mp3]`

Em um canto tranquilo de um vilarejo esquecido, Filavandrel emergiu como uma chama solitária em meio a
natureza de Sovara Mithr.

Filavandrel não conheceu seus avós, pois participariam, antes mesmo dele nascer, da expedição que marcaria
Mitrael para sempre e seria o provável estopim para A Grande Guerra
Leviana.

Antes de completar 1 ano, os seus pais se despediram pela última vez, pois iriam a luta contra os Orc's, em
vinganças aos avós de Filavandrel.

Desde então foi criado órfão por seus bisavós e primos quase da mesma idade que ele.

Desde criança perceberam que havia algo diferente em Filavandrel, pois começou a desenvolver a fala
precocemente, resolvia quebra-cabeças sem esforço algum, tendo apenas 2 anos.

Assim como o legado de sua família e também por estar em meio a natureza viva de Sovara
Mithr,
aprendeu a
manipular elixires e poções desde seus 4 anos.

Hoje em dia com apenas 25 anos e uma estatura modesta de 1,50m que esconde a grandiosidade de seu
espírito
e a
profundidade de sua mente.

Nascido na raça humana, ele não tinha asas mágicas ou olhos que brilhavam no escuro, mas sua mente é um
poço de conhecimento.

Aclamado por seu Q.I. inigualável de 182, ele era uma força a ser reconhecida, resolvendo enigmas que
fariam sábios antigos se ajoelharem em reverência.

Sua jornada como alquimista não foi escolhida por acaso.

É uma missão, uma paixão alimentada pelo desbravamento das maravilhas da química, matemática, física,
biologia e, mais profundamente, a cosmologia.

Seus olhos buscam os segredos do cosmos, enquanto suas mãos destilam a essência do mundo em seu
frascos.

Uma sombra se estendia sobre sua alma, um complexo de superioridade intelectual que muitas vezes o
impedia
de ver a verdadeira natureza das pessoas ao seu redor.

Seu coração, embora vasto em conhecimento, muitas vezes se mantinha distante, guardado por uma
desconfiança inata e uma certa frieza emocional.

A morte prematura de seu irmão gêmeo e seus pais, deixou uma cicatriz que nunca sarou.

Para Filavandrel, a vingança não
era apenas um desejo, mas uma necessidade.

Paralelamente, a batalha constante contra os danos das poções perigosas em seu corpo se tornou uma
cruzada
pessoal.

Ele sonha em se tornar o maior alquimista
matemático que já pisou na terra, não apenas para si, mas como um farol de esperança para todos
aqueles que sofrem pelas cicatrizes deixadas da guerra.

Filavandrel quando se trata de constituição é um fiasco, porém para contrabalancear esse problema, ele
fabricou diversos equipamentos para auxiliá-lo nas suas explorações.

Ele sempre anda com seu Punhal de Precisão, a sua Lupa Mágica e a sua Máscara
Anti-Peste para auxiliá-lo e protegê-lo dos perigos da
sua profissão

Filavandrel também começou a escrever um livro que contêm os segredos que ele vai descobrindo sobre os
mistérios do universo.

Estes equipamentos são muito mais do que simples ferramentas, são extensões de sua alma, símbolos de sua
busca interminável pelo conhecimento e pela justiça.

E assim, com um coração carregado de esperança e determinação, Filavandrel de Mithr marcha em direção ao
seu destino, pronto para escrever sua própria lenda nos anais da história.

Cada elixir é uma promessa

de um amanhã mais justo.

Diretamente de Mithr, Filavandrel

Se você parar para pensar,

você vai pensar parado.

O Alquimista, Filavandrel

---

### Baine Tempesfúria

*Elfo / Druida*

`arquivo original: characters/baine.html`

🔊 Narração em áudio: `audios/bainestorys.mp3`

`[IMAGEM: ../images/baine.jpg]`

#### Baine, O Elfo Druida

Level: 1

EXP: 00 / 150 ↑

• Resumo

Em breve..

• Informações

#### Identidade

Nome: Baine Tempesfúria

Idade: 21 anos

Altura: 1.60 m

Gênero: Masculino

Classe: Druida

Raça: Elfo

#### Pontos de personagem

Vida: ?? HP

Level: 1

Experiência: 00 / 150

Sanidade: 89%

#### Personalidade

Caótico e Bom (Íntegro)

• Personalidade: Explosivo, Instintivo.

• Inspiraçoes: Tempesfúria, Matilha, Natureza das Coisas.

• Defeitos: Ansioso, Alcoólatra e Fumante.

• Objetivo: Se tornar um com a natureza e descobrir mais sobre seus pais biológicos.

• Adoração: Allihanna.

• Atributos

Exemplos:

Modificador: [-X], [+X]

Bônus Raça: {X}

• FORÇA: 12 [+1]

• CONTITUIÇÃO: 16 {+2} [+3]

• DESTREZA: 8 {+1} [-1]

• INTELIGÊNCIA: 4 [-3]

• SABEDORIA: 8 [-1]

• CARISMA: 5 [-3]

• Habilidades

#### • Metamorfose Forçada

#### {Passiva} (Raça)

`[IMAGEM: ../images/metamorfoseforcada.jpg]`

Pode se metamorfar em uma Forma Animal.

+1d do primeiro dano causado ao se metamorfosear em um animal.

#### • Conexão Natural

#### {Passiva}

`[IMAGEM: ../images/conexao.jpg]`

Baine convoca Allihanna e consegue manipular o clima a seu favor evocando tempestades.

Bônus de +1 [FORÇA] enquanto energizado pelos raios de uma tempestade.

Em uma floresta este bônus é dobrado.

#### • Forma Animal Lvl 1

#### ? Energia/Mana

`[IMAGEM: ../images/formaanimal.jpg]`

Durante 3 turnos se tranforma em animal.

Lobo

Pontos de Vida: +10

Atributos: +2 {DESTREZA}

Bocada: Desfere uma mordida causando 2d6 de dano.
*Caso a diferença entre o teste de
agilidade seja = ou > 6, prende-se ao inimigo e rola novamente os dados de dano.

#### • Companheiro Animal Lvl 1

#### ? Energia/Mana

`[IMAGEM: ../images/companheiroanimal.jpg]`

Baine consegue se comunicar habilmente com a fauna ao seu redor.

Recebe +3 em [SABEDORIA] ao rolar a perícia Adestrar Animais.

Se forem Lobos este bônus é dobrado.

`[IMAGEM: ../images/bainefoto1.jpg]`

#### Historia

`[ÁUDIO: /audios/bainestorys.mp3]`

Nascido em algum lugar próximo à Sagrada Árvore localizada em Sovara Mithr, os pais biológicos de Baine tem o paradeiro desconhecido.

Baine nunca sequer os viu nem mesmo encontrou algum vestígio da existência deles.

Sendo assim o mesmo foi criado por Lobos da Floresta, desde seus primeiros respiros na terra.

Sua infância foi atípica, se alimentando de carnes cruas, tendo uma vida nômade completamente diferente de
qualquer outro elfo daquela época.

De alguma forma, desde muito pequeno, Baine conseguia se comunicar com os Lobos.

O pai adotivo de Baine se chamava Tempesfúria, ele também era o líder da matilha dos Lobos da Floresta.

Baine cresceu sem nenhum contato com a civilização nem mesmo sabia falar a língua dos humanos.

Ao completar 8 anos, um grupo de Necromantes, visando extrair a Energia da Árvore Sagrada, enfrentou a
matilha de tempesfúria e a devastou, restando pouquíssimos Lobos sobreviventes.

Tomado pela raiva e injustiça de ver sua família morrer em sua frente, Baine se transformou em um Lobo e
matou os Necromantes que ali estavam.

Após matá-los, notou que seu pai também estava morto. Meses se passaram e Baine havia esfolado o Pelego
de
seu pai Tempesfúria e a partir dali passou a usá-lo em sua cabeça como forma de receber parte da força
dele para si.

Baine se tornou o líder da matilha e já conseguia se comunicar com praticamente qualquer
animal e até mesmo se transformar por poucos minutos em um lobo.

Após 10 anos como líder da matilha(Neste momento Baine já tinha 18 anos e todos da matilha que o criaram
já haviam morrido por conta da idade)

Então Baine em respeito aos antepassados, decidiu que era o momento de perpetuar o ciclo de liderança
dos lobos e de conhecer mais sobre a civilização. Passou o cargo de Líder para seu irmão Storm
e se despediu deles dizendo que sairia em busca de conhecimento.

Baine sabia que não iria voltar porém
tinha certeza que os Lobos estariam em boas mãos com seu irmão.

Baine foi em direção a Guratan, onde viveu como um pedinte por 1 ano até que conseguiu emprego na loja A
Cornucópia Alquímica do renomado alquimista Filavandrel.

Filavandrel conheceu Baine vagando pelas vielas da cidade e ansiava compreender mais sobre o passado de
um elfo da floresta criado por lobos.

Foi Filavandrel quem o ensinou a falar a língua dos Humanos e os seus costumes.

Baine trabalhou por 2 anos como auxiliar de alquimista e sua especialidade era a biologia.

A partir deste momento Baine já sabia se comunicar tranquilamente com as pessoas e sempre após uma
aventura ia para uma Taverna próxima à região.

Foi aí que Baine conheceu o Hidromel e se tornou alcoólatra, também futuramente começaria com o
tabagismo, por se tratar de prazeres que nunca havia tido acesso antes.

Junto a Filavandrel, Baine se aprofundou em seus poderes de metamorfose, tornando-se muito mais forte do
que uma pessoa comum e criando uma reputação favorável a realizar trabalhos mais perigosos, porém melhor
remunerados.

Após receber diversas ofertas de missões, Baine se despediu do trabalho com Filavandrel e se tornou
mercenário.

Entre Tavernas e corpos mortos, Baine continua sua jornada a fim de conhecer mais sobre seus verdadeiros
pais, se reconectar novamente com o espírito da natureza e se livrar dos prazeres mundanos.

Não, eu não vou dar a patinha!!!

O Druida, Baine

Só as cachorras, wulf! wulf! wulf!

O Elfo, Howai

---

### Nero Greyrattus

*Drow / Necromante*

`arquivo original: characters/nero.html`

`[IMAGEM: ../images/nero.jpg]`

#### Nero, o Drow Necromante

Level: 2

EXP: 50 / 250 ↑

• Resumo

Em breve...

• Informações

#### Identidade

Nome: Nero Greyrattus

Idade: 18 Anos

Altura: 1.70 m

Gênero: Masculino

Classe: Necromante

Raça: Drow (Elfo Negro)

#### Pontos de personagem

Vida: 21 HP

Level: 2

Experiência: 50 / 550

Sanidade: 55%

#### Personalidade

Depressivo, vazio, vingativo.

Caótico e Neutro (??)

Motivaçoes: Abusos e violências sofridas na infância.

Inspiraçoes: Lolth, A Deusa das Aranhas

Defeitos: Necrófilo, Antissocial, não confia em ninguém.

Objetivo: Servir a Lolth com sua vida.

• Atributos

Exemplos:

Modificador: [-x] ou [+x]

Bônus Raça: {x}

• FORÇA: 1 (-5)

• CONTITUIÇÃO: 6 (-2)

• DESTREZA: 10 (0)

• INTELIGÊNCIA: 20 {2} (+5)

• SABEDORIA: 15 {1} (+2)

• CARISMA: 1 (-5)

• Habilidades

#### • Kyone Veldrin

#### {Passiva} (Raça)

`[IMAGEM: ../images/kyone.jpg]`

Os elfos negros estudam as artes das sombras para surpreender o inimigos.

Nero consegue sentir os locais e ações de seus inimigos, mesmo na escuridão total, e atacá-los sem
debuff, mesmo quando efetivamente cegos.

#### • Iron Maiden Lvl 1

#### {Passiva}

`[IMAGEM: ../images/ironmaiden.jpg]`

Aprisiona 1/4° do dano causado ao inimigo, prendendo as almas no pingente do seu colar,
consome-as para usar
ao seu favor.

A cada 25 Almas armazenadas, recebe 1 Ponto de Sobrevida.

2 Almas

Consome as almas para criar um escudo de energia vital que protege em 1 Pontos de Vida contra todos os tipos de dano. {Acumulativo}

16 Almas

Reduz 1 ponto de mana de todas as habilidades por 2 turnos.

32 Almas

Bonifica a próxima habilidade aumentando e +1 todos os dados rolados.

64 Almas

Reduz em 100% custo de mana da próxima habilidade utilizada.

120 Almas

Recebe permanentemente 5 Pontos de Vida.

#### • Invocação das Sombras
Lvl 1

#### ?? Mana

`[IMAGEM: ../images/invoca.jpg]`

Invoca um lobo de aspectos sombrios com investida.

Pontos de Vida: 1

Dano: 1d6

#### • Drenar Energia Vital Lvl 1

#### ?? Mana

`[IMAGEM: ../images/drena.jpg]`

O necromante suga parte da essência vital de um ser, usando para regenerar seu próprio
corpo.

Causa 1d8 de dano necrótico e recupera pontos de vida equivalente ao dano causado.

#### • Mãos Putrefadas Lvl 1

#### ?? Mana

`[IMAGEM: ../images/maos.jpg]`

Conjura das Terras dos Putrafados mãos de mortos-vivos que agarram as pernas de
1 alvo.

Duração: 1 turno.

`[IMAGEM: ../images/howai-wabar.jpg]`

#### Historia

Minha história começa ainda quando a Grande Guerra Leviana acontecia.

Nasci da necessidade de amor em uma época marcada por uma guerra devastadora.

O feiticeiro chamava-se Gustthav, enviado à guerra por ordens do Arauto dos Feiticeiros para escoltar
comboios de suprimentos à linha de frente.

Gustthav era um prodígio em feitiçaria, mestre em feitiços de alto nível, e ocupava o posto de vice-líder do
grupo.

Já Mikhai'la, minha mãe, era uma simples camponesa de Hosakku, um vilarejo estratégico para o império,
servindo como ponto de distribuição de suprimentos e abrigo médico.

Assim que o pelotão de feiticeiros chegou ao vilarejo, as camponesas os receberam, e assim meus pais se
conheceram.

Os dois começaram a se encontrar e conversar nos dias em que o feiticeiro estava no vilarejo.

Em uma dessas ocasiões, eu fui concebido, num momento em que eles se permitiram viver o amor, cientes da
incerteza do futuro devido à guerra.

Nasci em meio ao caos, mas por um breve período, minha família foi feliz.

Meu pai partia em missões perigosas, mas sempre retornava, até que um dia não voltou mais.

As notícias da frente de batalha eram escassas e confusas.

Mikhai'la, com o coração em pedaços, decidiu me criar sozinha, protegendo-me das incertezas do mundo
exterior.

Quando eu tinha cinco anos, a guerra chegou ao nosso vilarejo.

Soldados e criaturas das trevas invadiram Hosakku, eu e minha mãe ficamos escondidos em casa, porém de
nada adiantou.

Lembro-me de vê-la pela última vez, sua figura forte e determinada, antes que tudo se tornasse um borrão
de caos e destruição.

Fomos levados por forças além da minha compreensão para uma terra amaldiçoada, um lugar que um dia foi
fértil e cheio de vida, mas agora estava tomado pela putrefação e maldade.

A magia negra permeava o ar, transformando tudo ao seu redor.

Foi ali que minha humanidade começou a se esvair, e meu corpo e alma foram corrompidos.

Fui atraído pela Deusa das Aranhas, Lolth, cuja presença sentia em cada sombra e sussurro ao meu redor.

Cresci nas sombras de Menzoberranzan, adaptando-me ao novo mundo.

Com o tempo, descobri meus poderes necromânticos, uma habilidade que parecia inerente à escuridão que
agora me envolvia.

No começo eu achei que tudo isso era uma maldição, mas agora entendo que essa transformação, na verdade
é uma benção, concedida pela divindade Lolth que, por algum motivo, decidiu me acolher como um fiel
adorador me transformando em um Drow, um elfo negro.

Agora, após ter escapado das Terras dos Putrefados, vago
pelas Terras de Mitrael, em busca de aumentar meu poder, fortuna e espalhar a palavra de Lolth.

Não me importo o quão forte você é, se eu te enganar, eu ganhei.

O Ladino, Howai

Mais vale uma carteira na minha mão do que no bolso de alguém.

O Ladino, Howai

---

### Rargnos Brass

*Meio-Curinqueã / Xamã*

`arquivo original: characters/rargnos.html`

`[IMAGEM: ../images/rarg.jpg]`

#### Rargnos, O Curinqueã Xamã

Level: 1

EXP: 00 / 150 ↑

• Resumo

! Em Desenvolvimento !

• Informações

#### Identidade

Nome: Rargnos Brass

Idade: 19 Anos

Altura: 2,40 m

Gênero: Masculino

Classe: Xamã

Raça: Meio-Curinqueã

#### Pontos de personagem

Vida: ?? HP

Level: 1

Experiência: 00 / 150

Sanidade: 85%

#### Personalidade

Neutro-Neutro (Neutro Verdadeiro)

Personalidade: Leal, Sincero, Astuto e Esperançoso.

Inspirações: Contos dos antepassados e Histórias Antigas.

Defeitos: Vingativo e Teimoso.

Orientação: Hétero.

Objetivo: Conhecer a aldeia de sua mãe e buscar por suas origens.

Adoração: Allihanna.

• Atributos

Exemplos:

Modificador: [-X], [+X]

Bônus Raça: (X)

• FORÇA: 10 [0]

• CONTITUIÇÃO: 12 [+1]

• DESTREZA: 12 [+1]

• INTELIGÊNCIA: 1 [-5]

• SABEDORIA: 16 {2} [+3]

• CARISMA: 1 [-5]

• Habilidades

#### • Espírito Curinqueã

#### {Passiva} (Raça)

`[IMAGEM: ../images/espirito.jpg]`

Curinqueãns tem grande afinidade com o mundo espiritual.

Totens têm efeitos 50% melhores ao Rargnos.

#### • Amizade Espectral

#### {Passiva} Lvl 1

`[IMAGEM: ../images/amizade.jpg]`

Toda vez que Rargnos evocar um totem, um camaleão espectral é sumonado.

Camaleão Espectral:

#### • Totem

#### 4 Mana - 2 de mana para trocar - Lvl 1

`[IMAGEM: ../images/totem.jpg]`

Ragnos evoca um totem no campo de batalha e determina qual.

Totem padrão: Cura 1 ponto de vida a cada jogada de cada jogador aliado.

Totem Ar: Adiciona mais 1 de modificador em qualquer teste de destreza.

#### • Lança Arcanista

#### 2 Mana - Lvl 1

`[IMAGEM: ../images/lanca.jpg]`

Rargnos encanta sua lança com magia arcana aprimorando-a com algum elemento.

Ar: A lança causa +1d2 de dano e não pode ser esquivada pelo inimigo.

Fogo: A lança causa +1d2 de dano e causa 1d6 de dano de fogo por 2 turnos.

Gelo: A lança causa +1d4 de dano e causa debuff de -2 Destreza ao inimigo por 2 turnos.

`[IMAGEM: ../images/floresta2.png]`

#### Historia

Rargnos Brass conhecido como Rargnos (Xamã da Ecdise) Nasceu de uma Curinqueã chamada Agnar Liz com um grande Xamã Voliher Brass exilado de suas terras.

Com o sangue mestiço cresceu fora da aldeia de seus ancestrais, com sua mãe sempre contando as histórias da terra sagrada, e seu pai que passou seus conhecimentos sobre a magia e espiritualidade.

Com o início da grande guerra, as Curinqueãs da sagrada árvore se uniram com os povos da terra de Mitrael para ser parte da frente de batalha. Rargnos e seu pai ansiavam todos os dias pela volta de Liz e nunca perderam a esperança.

Após longos 15 anos e com o fim da guerra, a esperança da volta de Liz foi perdida, seu pai adoecido pelo uso da magia acabou falecendo poucos meses e Rargnos se viu sozinho com seus 17 anos.

Perdido nas profundezas da angústia e dor do luto, o mesmo vagou pelas terras de Sovara Mithr sozinho. Ansiava por conhecer a localização da aldeia de seus antepassados que sua mãe contara nas histórias.

Após 1 ano de procura, Rargnos se viu perdido no abismo da loucura de seus pensamentos e lembranças.

Em seus últimos passos de frenesi dentro da floresta frívola, Rargnos encontrou um animal desconhecido que tinha um intenso brilho que emanava de seu corpo, no mesmo momento teve um flash de lembrança de seu prelúdio onde lembrou de seu animal de estimação, um camaleão que havia se perdido na floresta.

Ao voltar a realidade se deparou com o brilho ofuscando seus olhos e o animal desconhecido se transformou em um camaleão dourado, a transformação do animal assustou Rargnos que sentiu o calor de seu corpo aumentar e por todo o corpo sentiu formigamentos que emanaram uma energia e desenharam em sua pele imagens arcanas desconhecidas.

Rargnos perdeu a consciência, ao acordar teve um imprinting de memória do seu pai e foi quando ele entendeu o que havia acontecido.

Rargnos enfrentou a ferocidade maléfica dos grandes animais caçadores para proteger as pessoas que adentrassem no labirinto de Sovara Mithr.

Por lá obteve conhecimento de sua magia, espiritualidade e como a controlar.

Hoje anda pelas grandes florestas da árvore sagrada e anseia pela busca da aldeia de sua mãe, sonha com as terras que ouvirá quando pequeno e os mistérios de sua raça.

Não me importo o quão forte você é, se eu te enganar, eu ganhei.

O Ladino, Howai

Mais vale uma carteira na minha mão do que no bolso de alguém.

O Ladino, Howai

---

### Tyr Vidar

*Aesiris / Viking*

`arquivo original: characters/tyr.html`

🔊 Narração em áudio: `audios/tyr-parte-1.mp3`

`[IMAGEM: ../images/tyr_vidar.jpg]`

#### Tyr, O Mais Forte

Level: 2

EXP: 50 / 250 ↑

• Resumo

Work in progress...

• Informações

#### Identidade

Nome: Tyr Vidar

Idade: 21 Anos

Altura: 2.15 m

Gênero: Masculino

Classe: Viking

Raça: Aesiris

#### Pontos de personagem

Vida: - HP

Level: 2

Experiência: 50 / 250

Sanidade: 100%

#### Personalidade

Caótico-Mau

Motivaçoes: Lutar e beber Hidromel

Inspiraçoes: Ele mesmo, Cerveja e Hidromel.

Defeitos: Imprevisível e esquentado.

Objetivo: Achar alguém mais forte que ele e achar seu pai.

• Atributos

Exemplos:

Modificador: [-X], [+X]

Bônus Raça: (X)

• FORÇA: 18 {+2} [+4]

• CONSTITUIÇÃO: 15 {+1} [+2]

• DESTREZA: 6 [-2]

• INTELIGÊNCIA: 8 [-1]

• SABEDORIA: 5 [-3]

• CARISMA: 1 [-5]

• Habilidades

#### • Chamado do Valhalla

#### {Passiva} (Raça)

`[IMAGEM: ../images/chamadodovalhalla.jpg]`

Uma vez por dia ao atingir menos que 1 Ponto de Vida, Tyr não morre.

Perde toda a Energia restante para rolar um Teste de Constituição e recuperar Pontos de Vida.

Recebe Investida e aumenta em +2[FORÇA] e +2[DESTREZA] até o final da batalha.

Após o primeiro ataque Tyr desmaia e precisa realizar um Teste de Constituição (Dificuldade 20) para acordar, para cada falha diminui em 1 a dificuldade.

#### • Fúria Viking

#### {Passiva}

`[IMAGEM: ../images/habilidadelobo.jpg]`

A cada 10 pontos de vida perdido, recebe +1[FORÇA] e +1[DESTREZA].

#### • Foco Absoluto

#### 2 Vezes p/ batalha

`[IMAGEM: ../images/jormungandr.jpg]`

Tyr foca em seu interior durante 1 turno para recuperar 1 Ponto de Energia e receber +1[DESTREZA] até o final da batalha.

#### • Niflheimr.

#### ----

`[IMAGEM: ../images/mjolnir.jpg]`

Tyr estende seu Mjolnir para o alto, fazendo com que um raio caia em sua ponta e energize o martelo.

----

#### • Musphelhein.

#### ----

`[IMAGEM: ../images/mulp.jpg]`

O tempo fecha, fazendo com que Tyr puxe para si raios do céu, energizando seu corpo.

`[IMAGEM: ../images/tyrface.jpg]`

#### Historia

`[ÁUDIO: /audios/tyr-parte-1.mp3]`

Localizado no norte, Dedos de Tundra é um ambiente congelante, primal e conhecido por seus renomados
guerreiros.

Em uma pequena aldeia nasce Tyr Vidar, um Aesiris que desde sua infância demonstra interesse por guerra e
batalhas.

Tyr, desde seu nascimento possuí uma runa no bíceps esquerdo e por conta disso alguns boatos corriam na boca
do povo sobre o garoto. Tyr também possuí dois corvos: Munin e Hugin.

Sua mãe e seu pai não se davam muito bem em casa, constantes agressões da parte de seu pai direcionadas
a sua mãe e a Tyr.

Astrid Trygve era uma mulher doce e simpática que cuidava muito bem de seu filho Tyr.

Astrid possui longos cabelos ruivos e olhos verdes cor de grama.

Gorm Trygve é o rei da aldeia, um
grande guerreiro muito alto e forte, cabelos pretos e olhos verdes.

Gorm trata seu filho Tyr com tanta
indiferença que parecem até desconhecidos.

Os três vivem numa casa muito grande, apesar de caótica.

Aos 12 anos, Tyr passava seus dias inteiros fora de casa, brigando na rua, treinando combate corpo a
corpo e armado, lutando com seus amigos e fazendo tudo que se possa imaginar, menos brincando.

Numa noite escura voltando pra casa a atenção de Tyr é desviada por um feixo de luz que brilha no meio
da nevasca: uma faca de caça quebrada e enferrujada, apenas sua ponta refletia a enorme lua cheia que
havia no céu.

Tyr pega a faca e esconde em seu casaco de pele, a mãe dele jamais toleraria uma arma dentro de casa.
Astrid repudiava a atitude de Tyr em treinar lutas e brigas, ela dizia que Tyr nasceu para ser gentil e
não para trazer a guerra.

Todos se reuniram no salão comunitário para comer o banquete que foi preparado para comemorar a grande
temporada de vendas, pesca e batalhas que acabara de passar.

Gorm sentado no meio da mesa em seu trono, Astrid ao seu lado e Tyr na ponta da mesa, perto dos demais
moradores.

Gorm vinha bebendo muito nesse dia por ser uma grande comemoração e acabou se recolhendo para os
aposentos mais cedo acompanhado de Astrid. Tyr no meio de seus amigos mostrava orgulhosamente sua faca
enferrujada e dizia a todos que ele era um guerreiro agora que possuia uma arma.

Gorm, fedendo a cerveja e hidromel começou a gritar com Astrid e se preparar para dar mais uma surra em
sua esposa.

O ambiente era selvagem.

Sangue pela parede, suor no chão, hematomas e cortes em Astrid.
Gorm bebâdo não diferenciava mais sua esposa de um guerreiro inimigo.

Sacou seu machado e partiu para
acabar com sua vida, quando foi interrompido pela porta abrindo.

Tyr também voltou mais cedo após ser
expulso por beber uma caneca de cerveja.

Gorm ri e diz que vai matar dois coelhos com uma cajadada só.

Apesar de bebâdo o álcool parecia apenas lhe dar mais força. Tyr vai para cima e é acertado pelo
antebraço de Gorm, fazendo com que ele fosse parar na parede.

Tyr está incrédulo. Ele estava acostumado a dar uma surra em pessoas de 17, 25 e 30 anos mesmo com sua
pouca idade, pois ele era o mais forte.

E ser lançado na parede com apenas um golpe era algo que ele
nunca tinha experienciado. Tyr se recompoe e os dois agora trocam socos e chutes, Gorm consegue
esfaquear Tyr 2 vezes na barriga enquanto sua mãe grita e chora.

Apesar da dor, Tyr continua a desferir
golpes em Gorm, que agora sente bem mais os golpes entrando.

Quando criança Tyr sempre venceu todas as brigas, pois ele era o mais forte. Aos 12 anos ainda não havia
sido derrotado, pois ele era o mais forte.

Com sua barriga sangrando e seu oponente marchando em sua
direção Tyr se pergunta se ele realmente era o mais forte. Tomado por ódio e fervendo de fúria Tyr
contorna Gorm e pula em suas costas.

Gorm não perde tempo e começa a balançar sua faca contra o garoto,
porém Tyr está sentindo dentro de si uma chama de batalha que cresce cada vez mais. Tyr toma outra
facada no braço, uma nas costas e uma no rosto.

Após o braço de Gorm cansar, Tyr aproveita a
oportunidade e enfia sua faca enferrujada com toda sua força no pescoço de Gorm, que lança o menino e
sua faca para o chão.

O sangue de Gorm espirra por todo lado, a casa agora é um grande quarto vermelho.

Tyr está gravemente ferido e quase desmaiando quando Gorm finalmente cai aos seus pés. Tyr pisa na
cabeça de seu oponente morto e com a pouca força que lhe resta, abre um sorriso. Tyr mais uma vez ganha,
pois ele É o mais forte.

Aos 13 anos Tyr é coroado o novo rei da aldeia após ter matado Gorm, antigo rei e seu pai. O chefe do
exército dá os parabéns a Tyr e também pergunta se ele vai querer coroar uma rainha ou viver sem uma,
apenas com uma escrava pessoal igual o rei anterior. O mundo de Tyr desaba com a revelação e corre para
sua mãe para tirar o resto de suas dúvidas. Astrid nunca foi rainha, era uma escrava de Gorm que sequer
era o pai de Tyr. O garoto agora reflete e percebe o tratamento que ambos recebiam do antigo rei.

Tyr renuncia a coroa e a entrega para sua mãe, tomado pela fúria do abandono, arruma suas coisas e parte
mundo a fora a procura de seu pai verdadeiro.

Tyr também almeja encontrar alguém que seja mais forte que ele, o mundo parece um lugar sem graça
habitado apenas por pessoas e monstros fracos.

Ele percorre o norte inteiro procurando por um oponente digno e falhando miseravelmente.

Agora, com 21 anos, Tyr termina de navegar o violento mar de Qän e chega em Terras de Mitrael. Com
grandes cabelos loiros trançados, olhos azuis, alta estatura, músculos e tatuagens tribais, agora já é
impossível passar despercebido nos lugares. Todos conhecem Tyr, O Mais Forte.

Dizem que se aprende muito apanhando. Se for verdade… Sou um baita professor.

O Mais Forte, Tyr

Ninguém nunca me venceu. Cê sabe, né?

O Mais Forte, Tyr

---

### Mestre

*Piada interna do grupo — o Mestre do jogo*

`arquivo original: characters/mestre.html`

🔊 Narração em áudio: `audios/mestre.mp3`

`[IMAGEM: ../images/metro.jpg]`

#### Mestre

Level: ∞

EXP: ∞ ↑

• Resumo

Work in progress...

• Informações

#### Identidade

Nome: Mestre

Idade: ∞

Altura: ∞m

Gênero: Máximo

Classe: Maestro

Raça: Mestre

#### Pontos de personagem

Vida: ∞

Level: ∞

Experiência: Todas

Sanidade: ∞%

#### Personalidade

∞-∞

Motivaçoes: Mestrar

Inspiraçoes: Ser O Mestre.

Defeitos: Nenhum.

Objetivo: Mestrar.

• Atributos

Exemplos:

Modificador: [-X], [+X]

Bônus Raça: (X)

• FORÇA: ∞ {∞} [∞]

• CONSTITUIÇÃO: ∞ {∞} [∞]

• DESTREZA: ∞ [∞]

• INTELIGÊNCIA: ∞ [∞]

• SABEDORIA: ∞ [∞]

• CARISMA: ∞ [∞]

• Habilidades

#### • Mestrar.

#### {Passiva} (Mestre)

`[IMAGEM: ../images/mestre.jpg]`

Ele Mestra.

#### • Mestrar 2.

#### {Passiva}

`[IMAGEM: ../images/mestre.jpg]`

Ele Mestra de novo.

#### • Mestrar 3.

#### (Mestre)

`[IMAGEM: ../images/mestre.jpg]`

Ele Mestra de novo.

(Mais uma vez.)

#### • Mestrar 4.

#### (Mestre)

`[IMAGEM: ../images/mestre.jpg]`

Você já sabe.

:]

#### • Mestrar 5.

#### (Mestre)

`[IMAGEM: ../images/mestre.jpg]`

Você já sabe, de novo.

`[IMAGEM: ../images/master.jpg]`

#### Historia

`[ÁUDIO: ../audios/mestre.mp3]`

Eu sou o Mestre, eu Mestro.

O Mestre, Mestre.

Eu Mestrarei.

O Mestre, Mestre.

---

## 4. Inventário de mídia

### Áudios (`audios/`)

| Arquivo | Tamanho | Uso original |
|---|---|---|
| `bainestorys.mp3` | 3.6 MB | Narração da história de Baine |
| `filavandrelstory.mp3` | 4.3 MB | Narração da história de Filavandrel |
| `levi.mp3` | 3.6 MB | Narração da história de Levi |
| `mestre.mp3` | 0.6 MB | Narração da página do Mestre |
| `tyr-parte-1.mp3` | 5.5 MB | Narração da história de Tyr — parte 1 |

### Imagens principais

| Arquivo | Uso |
|---|---|
| `images/map.jpg` | **Mapa oficial de Mitrael** — peça central da página de Mapa |
| `images/story/guerra-leviana.jpg` | Capa da Grande Guerra Leviana |
| `images/story/razavar.jpg` | Capa de Razavar |
| `images/story/askar.jpg` | Capa das Terras de Askar |
| `images/loc/askarImg1.jpg` | Ilustração — Guerra Leviana, cap. 1 |
| `images/loc/askarImg2.jpg` | Ilustração — Guerra Leviana, cap. 1 |
| `images/loc/askarImg3.jpg` | Ilustração — Guerra Leviana, cap. 2 |
| `images/loc/vernaculo.jpg` | Capa do Vernáculo dos Clérigos |
| `images/loc/arauto.jpg` | Capa do Arauto dos Feiticeiros |
| `images/loc/sovara-mithr.jpg` | Capa de Sovara Mithr |
| `images/loc/putrefados.jpg` | Capa da Terra dos Putrefados |
| `images/M.ico` | Favicon do site |

Retratos de personagens: `howai.jpg`, `levi.jpg`, `filvandrel.jpg`, `baine.jpg`,
`nero.jpg`, `rarg.jpg`/`rargnos.jpg`, `tyr_vidar.jpg`/`tyrface.jpg`, `metro.jpg`/`master.jpg`.

Ícones de habilidades (do sistema caseiro — reaproveitáveis como arte decorativa):
`tiger_eyes.jpg`, `rogue_instinct.jpg`, `multiple_arrows.jpg`, `atack_evasive.jpg`,
`magic_advantage.png`, `flauta.png`, `flauta2.png`, `briga.png`, `cura.png`, `book.jpg`,
`sabido.jpg`, `explosivos.jpg`, `pocao.jpg`, `alquimico.png`, `metamorfoseforcada.jpg`,
`conexao.jpg`, `formaanimal.jpg`, `companheiroanimal.jpg`, `kyone.jpg`, `ironmaiden.jpg`,
`invoca.jpg`, `drena.jpg`, `maos.jpg`, `espirito.jpg`, `amizade.jpg`, `totem.jpg`,
`lanca.jpg`, `chamadodovalhalla.jpg`, `habilidadelobo.jpg`, `jormungandr.jpg`,
`mjolnir.jpg`, `mulp.jpg`, `interroga.jpg`.

### Links externos do site original

| Destino | URL |
|---|---|
| Canal no YouTube | https://www.youtube.com/@TerrasMitrael |
| Servidor no Discord | https://discord.gg/SQuSnvxpdp |
| Trailer da 1ª Temporada | https://www.youtube.com/embed/1LHHXE8YNrE |
| GitHub do autor | https://github.com/ArionGresser |

---

## 5. Glossário do mundo

Nomes próprios citados na lore. Os marcados com ⭐ **não têm página própria** e são
candidatos a novas entradas de conteúdo.

### Lugares

| Nome | Contexto |
|---|---|
| Mitrael | O continente/mundo principal |
| Razavar | Capital real, sede do Rei |
| Terras de Askar | Continente vermelho dos Orcs, selado pela Grande Barreira |
| Sovara Mithr | Floresta da Sagrada Árvore |
| Vernáculo dos Clérigos | Região da medicina e da cura |
| Arauto dos Feiticeiros | Reduto arcano recluso |
| Terra dos Putrefados | Antigo campo de batalha, amaldiçoado |
| Undaryus ⭐ | Nome alternativo da região amaldiçoada, junto à Floresta dos Putrefados |
| Abarius ⭐ | Território perdido para os Arkeanos durante a guerra |
| Tungel ⭐ | Terras cujos povos foram decisivos no campo de batalha |
| Entrerrio ⭐ | Cidade costeira onde Levi foi criado, na taverna |
| Guratan ⭐ | Cidade onde Baine viveu e trabalhou com Filavandrel |
| Pondor do Aramate ⭐ | Ilha natal dos Faunos, no Mar Leviano, tomada pelos Orcs |
| Mar Leviano ⭐ | Mar que separa Mitrael de Askar — dá nome à Guerra |
| Passagem Golem de Gelo ⭐ | Região gelada e isolada, infância de Howai |
| Dedos de Tundra ⭐ | Norte congelante, terra natal de Tyr |
| Hosakku ⭐ | Vilarejo estratégico de suprimentos, terra de Mikhai'la |
| Vérsia ⭐ | Origem dos misteriosos aliados convocados no fim da guerra |

### Povos e organizações

| Nome | Contexto |
|---|---|
| Os Expedicionários | Grupo de pesquisadores cuja expedição desencadeou a guerra |
| Exército Vermelho / Arkeanos | Orcs e raças aliadas vindas de Askar |
| Os Caídos | Julgamento dado aos poucos que voltaram de Askar |
| Filhos do Fogo | Raça misteriosa que possivelmente escraviza Askar |
| Cavaleiros de Elite Reais | Alça do Batalhão de Elite do exército imperial |
| Os Honrados Voluntários | Milhões de civis convocados pelo Rei Surmellion 2º |
| Lendários Magos | Convocados no ato final e desesperado da guerra |
| Guilda dos Ladrões | Guilda que recrutou e depois liberou Howai |
| Curinqueãs | Povo espiritual da Sagrada Árvore — raça de Rargnos |
| Aesiris | Povo nórdico dos Dedos de Tundra — raça de Tyr |

### Figuras citadas

| Nome | Contexto |
|---|---|
| Rei Surmellion 2º, "O Benevolente" | Monarca de Mitrael durante a Grande Guerra Leviana |
| O Grandíssimo Mago Divino | Mito do Arauto — teria dizimado um exército inteiro sozinho |
| Allihanna | Divindade da natureza, adorada por Baine e Rargnos |
| Lolth | A Deusa das Aranhas, adorada por Nero |
| Tempesfúria | Lobo, pai adotivo de Baine e líder da matilha |
| Storm | Irmão de matilha de Baine, herdeiro da liderança |
| Gustthav | Feiticeiro do Arauto, pai de Nero |
| Mikhai'la | Camponesa de Hosakku, mãe de Nero |
| Voliher Brass e Agnar Liz | Pais de Rargnos — o xamã exilado e a Curinqueã |
| Gorm e Astrid Trygve | Pais de Tyr — o rei da aldeia e sua mãe |
| Munin e Hugin | Os dois corvos de Tyr |
| Wabar | Inspiração de Howai (retratado em `howai-wabar.jpg`) |
| Velho Taberneiro | Ex-soldado que resgatou e criou Levi em Entrerrio |

### Cronologia conhecida

| Marco | Referência |
|---|---|
| Fim do 5º século da Terceira Era | Queda da ditadura imperial, livre mercado, ascensão do conhecimento |
| **Ano 614** | A expedição parte — 16 embarcações rumo ao desconhecido |
| 8 dias depois | Chegada a Askar e o massacre da frota |
| +2 dias após o retorno | Primeiro desembarque Orc em Mitrael — início da guerra |
| +10 anos | Rei Surmellion 2º convoca Os Honrados Voluntários |
| +33 anos | Mitrael à beira da derrota; convocação dos Lendários Magos e de Vérsia |
| **36 anos / 13.333 dias** | Vitória, criação da Terra dos Putrefados e da Grande Barreira sobre Askar |

---

*Documento gerado automaticamente a partir do site v1 durante a Etapa 0 da reconstrução.*
