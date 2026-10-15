# O mapa novo

Plano de 15/10/2026. Os prompts e o passo a passo estão no Guia de Artes
(`scripts/arte/GUIA-DE-ARTES.html`), na aba **Mapa novo**.

O que é sugestão minha está marcado com ✦. O resto foi pedido do Arion.

## As peças

| Peça | Arquivo | Como vem |
|---|---|---|
| Mitrael | `mapa-mitrael.png` | 1536 × 1024, fundo magenta, depois 4x no Magnific |
| Askar | `mapa-askar.png` | idem |
| Continente do norte (Dedos da Tundra, Tungel, Marily) | `mapa-norte.png` | idem |
| As ilhas ✦ | `mapa-ilhas.png` | idem, cada ilha separada |
| O mar | `mapa-oceano.png` | quadrado, sem emenda |
| Nuvens | `mapa-nuvem-1` a `3.png` | fundo transparente |
| Navio e serpente marinha ✦ | `mapa-navio.png`, `mapa-serpente.png` | fundo transparente |

Mitrael sai primeiro e vira o padrão de traço: Askar, o norte e as ilhas
são gerados com ele anexado.

## O que muda no desenho

Pedidos do Arion:

- **Sovara Mithr maior**, ocupando a metade norte de Mitrael, com a Sagrada
  Árvore aparecendo acima da copa.
- **Razavar mais densa**: a capital murada, com bairros, palácio no alto,
  porto e vilas em volta.
- **Um muro gigante** atravessando a terra de costa a costa, separando
  Undaryus (a Terra dos Putrefados) do resto de Mitrael. Na ferramenta de
  pintar, é o pincel **Muro** (rosa).
- **Cidades e vilas novas**: ele marca na ferramenta com os símbolos.

Sugestões ✦ para ele decidir:

- **O nome e a história do muro.** Não existe na lore ainda: ele dita
  quem ergueu, quando e por quê, e eu escrevo. A Guerra Leviana termina com
  Undaryus apodrecida "do lado de cá", então o muro conversa bem com isso.
- **Os lugares das Crônicas no mapa**: Portela do Véu (o vilarejo do
  pedágio, num vale com rio), a mina de Varek, o moinho e, quando o grupo
  chegar, Altavela e o Campo dos Mil Elmos. Ele marca onde ficam.
- **Estradas ligando as cidades**, com as vilas ao longo delas: o mapa fica
  com cara de lugar habitado e explica por que Portela vive de pedágio.
- **O domo de Askar como efeito do site**, e não pintado: um brilho
  translúcido em volta do continente, que pulsa devagar. Fica mais bonito e
  dá para apagar ou mudar sem gerar a arte de novo.
- **Nomes por nível de zoom**: de longe, só os continentes e os mares; mais
  perto, as regiões; bem perto, cidades e vilas.
- **O caminho do grupo**: uma linha tracejada com a rota das Crônicas, que
  cresce a cada episódio publicado.
- **Névoa no que ninguém viu**: as terras que a campanha ainda não visitou
  ficam veladas para os jogadores, e o Mestre revela.

## No site, quando as artes chegarem

- **Montagem**: recortar o magenta, fazer a faixa de água rasa da costa,
  posicionar os continentes sobre o mar (na posição do mapa de hoje) e
  cortar em ladrilhos por nível de zoom. O celular baixa só o pedaço da
  tela.
- **Nuvens**: uma camada por cima, que se move devagar e some conforme o
  zoom aproxima.
- **Nomes**: passam a ser do site (em `src/lib/regioes-do-mapa.ts`, a
  opção de mapa sem nomes pintados).
- **Marcadores**: reposicionar os lugares no desenho novo.
- **O zoom**: hoje, rolar o mouse para baixo no mínimo de zoom prende a
  página no mapa e não deixa descer até o rodapé. No mínimo de zoom, a
  rolagem tem que voltar a descer a página.
