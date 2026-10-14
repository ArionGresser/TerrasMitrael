# Estado da mesa (14/10/2026)

Tudo o que foi feito na leva da arena, da sessão e das ferramentas do Mestre,
o que você precisa fazer e o que ainda falta. **Nada disto foi commitado
ainda**, como você pediu. O build passou (1007 páginas).

## 1. O que você precisa fazer

1. **Rodar o SQL no Supabase.** Ele está no seu Cmd+V (245 linhas). No
   painel: SQL Editor, cole e clique em Run. Pode rodar de novo sem estragar
   nada. Sem ele, o mapa da mesa não marca e a arena nova, os encontros
   prontos e as sessões não salvam. São estes arquivos, juntos:
   - [0006-mapa-da-mesa.sql](../supabase/0006-mapa-da-mesa.sql) (o mapa nunca tinha sido rodado; é por isso que "não marcava")
   - [0008-ajustes-da-ficha.sql](../supabase/0008-ajustes-da-ficha.sql) (PV máximo e atributos)
   - [0009-arena-viva.sql](../supabase/0009-arena-viva.sql) (ações dos jogadores e a gravação do combate)
   - [0010-encontros-prontos.sql](../supabase/0010-encontros-prontos.sql)
   - [0011-sessoes.sql](../supabase/0011-sessoes.sql)
2. **Testar no site local** (Mestre e um jogador) e me dizer o que ajustar.
3. **Me dar o ok para commitar.** Eu faço commits pequenos, por etapa, na main,
   e você empurra pelo GitHub Desktop.
4. **Subir a pasta "Terras de Mitrael" da Mesa (Desktop) para o Drive** (Sempre
   Decorando). Quando estiver lá, me avise que eu confiro e mando para a
   Lixeira o que já está salvo. Esvaziar a Lixeira fica com você.
5. **Responder duas perguntas** (ver o item 4 deste documento).

## 2. O que foi feito e onde ver

### Sessão de hoje: [/sessao/](http://localhost:3000/sessao/)
- Quem está na mesa (você marca pelos retratos; fica salvo por dia).
- O combate em andamento, com o atalho para a arena.
- Atalhos: gerar encontro, mesa ao vivo, gerar nome, mapa da mesa, arena e
  anotações. O jogador vê a ficha e a mochila dele.
- **Encontros prontos**: um toque em "▶ Começar" e o combate abre na arena.
- **O caderno da sessão** (só você vê): título e anotações, que salvam
  sozinhos, mais os combates do dia, com o replay de cada um.
- **Sessões anteriores**, com as anotações de cada dia, para escrever as
  Crônicas depois.
- O mapa da mesa, embutido.
- Código: [SessaoDeHoje.tsx](../src/components/sessao/SessaoDeHoje.tsx), [sessao.ts](../src/lib/sessao.ts)

### A arena: [/combate/](http://localhost:3000/combate/)
- **Rodada 0 de iniciativa**: rolada pelo site ou digitada à mão, e a
  rodada 1 só começa quando todo mundo tem número.
- **Turnos guiados**: a ficha de quem está na vez abre sozinha, como sanfona
  (não é mais janela por cima).
- **Ataque guiado**: Atacar, escolher o alvo, digitar o total do d20 (ou
  rolar), e o site diz se acertou pela CA. Você pode corrigir na mão. Depois
  vem o dano (dobrado no crítico) e a condição que o golpe deixa.
- **Condições no cartão**, com "tentar sair" e o × para um aliado tirar.
- **O jogador age no turno dele**, e vale na hora. Você desfaz se precisar.
- **Animação de carta** (a carta salta no alvo) com som. Quem prefere menos
  movimento no aparelho não vê a animação.
- **Histórico** do lado, com tudo o que aconteceu.
- **Loot que troca a arma**: o esqueleto que pegou uma Besta Leve +1 ataca
  com a besta (+6, 1d8+4) no lugar do arco curto.
- **Fera não carrega nada** ✦ (regra da casa): lobo não tem bolso.
- **Fim do combate**: o espólio de quem caiu, dividido entre o grupo, com as
  moedas em partes iguais ou à mão.
- **Replay** de qualquer combate gravado: [/combate/replay/?id=1](http://localhost:3000/combate/replay/?id=1)
- Código: [Arena.tsx](../src/components/combate/Arena.tsx), [Palco.tsx](../src/components/combate/Palco.tsx), [PainelDoLutador.tsx](../src/components/combate/PainelDoLutador.tsx), [RolagemDoAtaque.tsx](../src/components/combate/RolagemDoAtaque.tsx), [Iniciativa.tsx](../src/components/combate/Iniciativa.tsx), [FimDoCombate.tsx](../src/components/combate/FimDoCombate.tsx), [ReplayDoCombate.tsx](../src/components/combate/ReplayDoCombate.tsx), [Historico.tsx](../src/components/combate/Historico.tsx), [combate.ts](../src/lib/combate.ts), [ataques.ts](../src/lib/ataques.ts)

### Gerador de encontros: [/mestre/encontros/](http://localhost:3000/mestre/encontros/)
- Três modos: **combate**, **fora de combate** (bom, neutro ou ruim, com a
  explicação) e **o dado decide**.
- "Como começa" (um d6 para o jeito que a luta começa).
- **Filtro por família**: só esqueletos, só criaturas do fogo, só diabos, e
  outras 22 famílias. Há também um campo "só criaturas com este nome". Os
  acompanhantes seguem a família.
- **Guardar para depois**: nome, notas e, se quiser, o loot já sorteado e fixo.
- A tabela de encontros fora de combate é minha ✦, genérica. Troque pelo que
  combinar com Mitrael.
- Código: [GeradorDeEncontros.tsx](../src/components/combate/GeradorDeEncontros.tsx), [EncontrosProntos.tsx](../src/components/combate/EncontrosProntos.tsx), [montar-combate.ts](../src/lib/montar-combate.ts), [encontros.ts](../src/lib/encontros.ts), [encontros-fora.ts](../src/lib/encontros-fora.ts)

### Gerador de nomes: [/mestre/nomes/](http://localhost:3000/mestre/nomes/) (novo)
- 14 povos: anão, elfo, humano, pequenino, gnomo, orc, goblin, draconato,
  tiefling, golias, leonino, centauro, fauno e tritão.
- O anão vem com clã ("Barba Cinzenta", "Barba Vermelha", "Martelo
  Rachado"...) e às vezes com apelido, ou só apelido e clã: "Pança Barba
  Cinzenta".
- Toque para copiar; a estrela guarda nos favoritos.
- Tudo inventado aqui ✦, nada copiado de outro gerador. Se mandar o link do
  site que você gosta, eu uso só como referência de estilo.
- Código: [nomes.ts](../src/lib/nomes.ts), [GeradorDeNomes.tsx](../src/components/mestre/GeradorDeNomes.tsx)

### Subir de nível (novo)
- Fica em "Editar ficha", no bloco **Nível**, logo abaixo da Experiência.
- O botão **⬆ Subir para o nível N** aparece quando o XP basta, ou quando você
  libera ("Liberar o nível N para o jogador", para quem sobe por marco). Você,
  como Mestre, pode subir qualquer um a qualquer hora.
- O passo a passo, igual para as 12 classes do SRD:
  1. O que chega no nível, com o texto da regra e o que muda na tabela.
  2. PV: média ou rolagem (que vale uma vez só), mais Constituição, mais 1
     para anão.
  3. As escolhas que o nível pede: subclasse, Aumento de Atributo ou talento,
     Estilo de Luta, invocações (com os pré-requisitos), truques e magias até
     o círculo certo. O que o site não sabe guiar ganha um campo de anotação.
  4. As trocas que a regra permite (uma invocação, um truque, uma magia).
- Ao confirmar, mudam sozinhos: o nível, o PV máximo e os atuais, o bônus de
  proficiência, os Dados de Vida e os espaços de magia. O que foi escolhido
  aparece em "Ganho na mesa", com os links.
- **↶ Desfazer** tira a última subida.
- Conta para o gerador de encontros (o orçamento de XP usa o nível novo) e
  para o PV na arena.
- Fica guardado nos ajustes da ficha: **não precisa de SQL novo**. Quando
  quiser, eu passo as subidas para a ficha fixa do site.
- O que já sabe do grupo no nível 2: o Johnny escolhe 2 invocações e 1
  magia; o Egon escolhe o Estilo de Luta e 1 magia; a Lily ganha 1 magia
  preparada; o Pyhmm e o Vrakyr só ganham características.
- Código: [SubirDeNivel.tsx](../src/components/ficha-viva/SubirDeNivel.tsx), [subir-de-nivel.ts](../src/lib/subir-de-nivel.ts), [dados-de-nivel.ts](../src/lib/dados-de-nivel.ts), [ajustes-da-ficha.ts](../src/lib/ajustes-da-ficha.ts)

### Magias na arena (novo)
- No painel de cada aventureiro (o seu e o do dono), a seção **Magias**: os
  espaços que restam (bolinhas) e as magias por círculo, cada uma com
  **Conjurar**. Entram as da ficha do site e as escolhidas ao subir de nível.
- **Ataque mágico** (Rajada Mística): vai para o ataque guiado, com o bônus
  de magia e o dano que cresce no nível 5, 11 e 17; os feixes ou raios a
  mais seguem um atrás do outro. A Explosão Agonizante soma o Carisma.
- **Salvaguarda** (Braços de Hadar, Bola de Fogo): o jogador marca quem está
  na área e rola o dano. Na sua tela chega um cartão com a CD: "⚄ Rolar as
  das criaturas" usa a salvaguarda de cada uma do Bestiário, e "Aplicar"
  dá o dano (metade para quem passou, quando a magia diz isso).
- **Cura e dano sem teste** (Curar Ferimentos, Mísseis Mágicos): valem na hora.
- **Concentração** fica marcada no lutador; conjurar outra troca a anterior.
- O espaço é gasto pela sua tela, então **o Desfazer devolve o espaço**.
- Código: [MagiasNaArena.tsx](../src/components/combate/MagiasNaArena.tsx), [magias-arena.ts](../src/lib/magias-arena.ts)

### CA pelas regras (novo)
- Em "Editar ficha", o bloco **Classe de Armadura**: escolher a armadura,
  o Escudo, o bônus mágico e a Armadura Arcana, e ver a conta ("Armadura de
  Couro 11 + 2 Destreza = 13"). O limite de Destreza das médias e a Defesa
  sem Armadura do Bárbaro e do Monge entram sozinhos.
- Só vale depois de **"Usar esta CA"**: aí a CA segue a Destreza sozinha,
  na ficha e na arena. A da Lily daria 9 pelas regras, contra 11 na ficha:
  confira com ela antes de usar.
- Código: [classe-de-armadura.ts](../src/lib/classe-de-armadura.ts), [CaDaFicha.tsx](../src/components/ficha-viva/CaDaFicha.tsx)

### Pintar o mapa: [/mestre/pintar-mapa/](http://localhost:3000/mestre/pintar-mapa/) (novo)
- Pincel com 11 terrenos, balde (enche a área de cor parecida no mapa de
  hoje), borracha, desfazer e marcas de lugar (cidade, vila, castelo, porto,
  templo, torre, ruína) com nome.
- Sai a **referência de cores** (sem nomes) e o **prompt em inglês** para o
  ChatGPT. Os nomes ficam com o site. "Baixar as marcas" guarda os lugares
  para eu pôr os nomes depois.
- Fica guardado neste aparelho.
- Código: [PintarMapa.tsx](../src/components/mapa/PintarMapa.tsx)

### A ficha
- "Ficha viva" agora se chama **Editar ficha** (e "Editando a ficha" quando
  está aberta).
- Na página do personagem, o dono vê a barra com os PV e o botão **✎ Editar**.
  Os outros não veem nada.
- **PV máximo e atributos** podem ser aumentados ou mudados na mesa (já
  commitado antes).
- **Anotações** e os atalhos em Minha conta (já commitado antes).

### Músicas
- A lista por episódio das Crônicas e por lugar do mapa:
  [MUSICAS-POR-EPISODIO-E-LUGAR.md](MUSICAS-POR-EPISODIO-E-LUGAR.md)

### Artes
- Prompts da arena (chão, carta, moldura do medalhão): `~/Desktop/Prompts da arena.txt`

## 3. Testado e não testado

**Testei aqui, com um Mestre e um jogador de mentira** (nada foi gravado no
banco de verdade): a arena inteira (iniciativa, ataque, desfazer, loot,
espólio, gravação e replay, a visão do jogador), o gerador nos três modos, o
filtro de família, a Sessão de hoje (também no tamanho de celular), o
gerador de nomes e o botão ✎ Editar.

**Só dá para testar depois do SQL, com contas de verdade:**
- dois aparelhos ao mesmo tempo (o jogador age e a tela do Mestre muda);
- guardar e começar um encontro pronto;
- o caderno da sessão salvando de verdade e as sessões anteriores;
- marcar no mapa da mesa.

## 4. O que falta fazer

**Combinado em 14/10:** só o SRD; o que não estiver nele, você dita a
mecânica e eu escrevo com as minhas palavras.

**Para fazer, nesta ordem:**
1. ~~Subir de nível guiado~~ (feito).
2. ~~Magias gastando espaço na arena~~ (feito).
3. ~~CA calculada pelas regras~~ (feito).
4. ~~Ferramenta de pintar o mapa~~ (feito).
5. **Design**: melhorar os botões e a tela de edição da ficha.
6. **Ligar as músicas** novas quando os arquivos chegarem.
7. **Capítulos das Crônicas**: você manda o texto e eu monto.
8. **Commitar**, quando você der o ok.
