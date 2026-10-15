# Artes das cartas: prompts para o ChatGPT

Lista de 14/10/2026. O resto das artes do site (ícones, cenas, espécies,
classes, monstros) continua no `scripts/arte/GUIA-DE-ARTES.html`.

## O problema

A janela da arte na carta é **larga**, quase 3:2. Medi nas quatro molduras:

| Carta | Janela (largura ÷ altura) | Arte que ela usa hoje |
|---|---|---|
| Magia | 1,52 | o ícone quadrado (512 × 512) |
| Item mágico | 1,55 | o ícone quadrado |
| Equipamento | 1,58 | o ícone quadrado |
| Monstro | 1,47 | a arte 16:9 (1280 × 720), que já serve |

Hoje o ícone quadrado fica no meio da janela, com uma cópia desfocada dele
preenchendo as laterais. Funciona, mas fica com cara de remendo. A solução
é uma **arte de carta em paisagem 3:2**, que no ChatGPT é o tamanho
**1536 × 1024**.

O ícone quadrado continua: é ele que aparece nas listas (Grimório, itens).
A arte de carta é só para a carta aberta e para a página da magia.

## Regras para todas

- Formato **paisagem 3:2 (1536 × 1024)**. Se o ChatGPT perguntar, peça
  "landscape".
- **O principal no centro.** A moldura cobre um pouco das bordas, então nada
  importante nos 15% de cada lado.
- **Sem moldura, sem borda, sem texto.** A moldura é a da carta.
- **Fundo até as bordas**, escuro e com clima, para a moldura dourada
  destacar.

## Jeito 1: esticar o ícone que já existe (o melhor)

Assim a carta fica igual ao ícone da lista, e o conjunto continua coeso.
Os ícones estão em `public/images/magias/icones/` (e os de itens em
`public/images/itens/`).

1. Abra uma conversa nova no ChatGPT e **anexe o ícone** (ex.:
   `bola-de-fogo.webp`).
2. Cole este prompt:

```
Extend this image into a wide landscape 3:2 composition, 1536x1024. Keep the central subject exactly as it is, with the same painterly style, colors and lighting. Only continue the background and the magical effect to the left and to the right, so the scene fills the whole image naturally and reaches every edge. Keep everything important inside the central 70%. No frame, no border, no text, no watermark.
```

3. Se ele mudar demais o desenho do meio, responda:
   `Keep the center identical to the image I sent, change only the sides.`

## Jeito 2: gerar do zero

Para as magias, o prompt de cada uma já está pronto no arquivo
[PROMPTS-CARTAS-MAGIAS.txt](PROMPTS-CARTAS-MAGIAS.txt): uma linha por magia,
com o nome do arquivo e o prompt. Ele usa a mesma descrição e a mesma cor de
escola dos ícones, para combinar.

O molde, se quiser escrever um seu:

```
Fantasy RPG card illustration for the spell <NOME EM INGLÊS>: <O QUE SE VÊ>. Wide landscape 3:2 composition, 1536x1024. Keep the main subject inside the central 70% of the image, the edges will be covered by an ornate card frame. Painterly hand-painted style, rich colors, dramatic lighting, <COR DA ESCOLA> glow, dark atmospheric background that reaches every edge, no frame, no border, no text, no watermark.
```

As cores das escolas: Abjuração `pale blue`, Adivinhação `silver and white`,
Conjuração `golden yellow`, Encantamento `pink and magenta`, Evocação
`fiery orange and red`, Ilusão `violet`, Necromancia `sickly green and
black`, Transmutação `emerald green and amber`.

### Item mágico

```
Fantasy RPG card illustration of the magic item <NOME EM INGLÊS>, shown as the hero object resting on <UM LUGAR: an altar, a dungeon floor, a velvet cloth, a treasure pile>, softly glowing with <COR DA RARIDADE> light. Wide landscape 3:2 composition, 1536x1024. Keep the item inside the central 70% of the image, the edges will be covered by an ornate card frame. Painterly hand-painted style, rich colors, dramatic lighting, dark atmospheric background that reaches every edge, no frame, no border, no text, no watermark.
```

A cor da raridade, para combinar com a pedra da carta: Comum `soft white`,
Incomum `green`, Raro `blue`, Muito Raro `purple`, Lendário `orange gold`,
Artefato `deep red`.

### Equipamento

```
Fantasy RPG card illustration of a <NOME EM INGLÊS> on a weathered wooden workbench in a medieval armory, warm lantern light. Wide landscape 3:2 composition, 1536x1024. Keep the object inside the central 70% of the image, the edges will be covered by an ornate card frame. Painterly hand-painted style, rich colors, no frame, no border, no text, no watermark.
```

## Por onde começar

Magias que o grupo usa (das fichas do site e da arena): vale fazer estas
primeiro, porque são as cartas que vão abrir na mesa.

| Magia | Arquivo |
|---|---|
| Bênção | `bencao.png` |
| Chama Sagrada | `chama-sagrada.png` |
| Curar Ferimentos | `curar-ferimentos.png` |
| Destruição Divina | `destruicao-divina.png` |
| Ilusão Menor | `ilusao-menor.png` |
| Orientação | `orientacao.png` |
| Resistência | `resistencia.png` |
| Rajada Mística | `rajada-mistica.png` |
| Bruxaria | `bruxaria.png` |

Depois, as clássicas que todo mundo procura no Grimório: Bola de Fogo,
Mísseis Mágicos, Escudo Arcano, Relâmpago, Palavra Curativa.

## Como entregar

Coloque tudo numa pasta, com o nome do arquivo da tabela (o slug), e me
diga onde está:

```
Artes das cartas/
  magias/bola-de-fogo.png
  itens/espada-vorpal.png
  equipamento/corda-de-canhamo.png
```

Pode ser PNG ou JPG; eu converto para WebP e deixo leve.

## O que eu ajusto no site quando chegarem as primeiras

1. **A importação** (`scripts/arte/importar.py`) passa a aceitar a pasta das
   cartas e guarda cada arte em 3:2, sem cortar para 16:9.
2. **A carta** (`Carta.tsx`) usa a arte de carta preenchendo a janela
   inteira; sem ela, continua com o ícone e o desfoque, como hoje.
3. **A página da magia** mostra a arte de carta no lugar da ilustração vazia.
