"""
As molduras das cartas: a magia, o item mágico, o equipamento e o monstro
abrem como uma carta no site e podem ser impressos.

A moldura vem vazia: sem nenhuma letra e com a janela da arte transparente.
O site escreve o nome, o tipo e as regras por cima, e põe a arte que a
magia ou o item já têm na janela. Por isso todas seguem o mesmo desenho de
áreas, descrito em LAYOUT: um HTML só posiciona o texto em qualquer uma.

O formato é o de carta de baralho, 5:7 (63 x 88 mm), para caber em sleeve.
"""

from historias import cena

LAYOUT = (
    "The card has the proportions of a standard playing card, 5:7 (63 x 88 mm), drawn upright "
    "and centered, with a fully transparent background around it. Inside the card, keep these "
    "areas EMPTY and in exactly these places, measured on the card itself: "
    "(1) a horizontal title plaque across the top, from 4% to 12% of the height and about 80% "
    "of the width, plain and empty; "
    "(2) a round empty socket or medallion at the top-left corner, overlapping the left end of "
    "the title plaque, about 15% of the card width; "
    "(3) a large art window from 14% to 55% of the height and from 8% to 92% of the width, "
    "rectangular with slightly rounded corners, completely empty and fully transparent (if "
    "transparency is impossible, fill the window with flat pure magenta #FF00FF); "
    "(4) a thin type ribbon centered just below the art window, from 56% to 61% of the height, "
    "about 70% of the width, plain and empty; "
    "(5) a large text panel from 63% to 89% of the height and from 9% to 91% of the width: a "
    "flat, light, warm parchment surface with only a very faint texture, so that small dark "
    "text printed on it stays perfectly readable; "
    "(6) a small plaque centered at the bottom, from 90% to 96% of the height, about 40% of "
    "the width, plain and empty. "
    "All the decoration lives in the border and frame around these areas, never inside them."
)

CARTAS = [
    cena(
        "carta-magia", "Moldura · magia", "a carta que abre ao clicar numa magia do Grimório (faça esta primeiro)",
        "an ornate empty card frame for a spell card: deep midnight blue and violet enamel with "
        "fine silver filigree, faint engraved arcane circles, stars and moon phases in the border, "
        "a small silver crescent ornament at the top center; the corner medallion is a round "
        "silver socket, empty, for the spell level",
        formato="carta",
        contexto="an empty printable card frame (a template) for the spell cards of the website",
    ),
    cena(
        "carta-item-magico", "Moldura · item mágico", "a carta dos itens mágicos (anexe a de magia como referência de layout)",
        "an ornate empty card frame for a magic item card: rich gold filigree over dark wine-red "
        "leather, small inset gemstones along the border, delicate engraved treasure motifs; the "
        "corner medallion is an empty golden gem setting with no stone in it, where the website "
        "will place a gem in the color of the item's rarity",
        formato="carta",
        contexto="an empty printable card frame (a template) for the magic item cards of the website",
    ),
    cena(
        "carta-equipamento", "Moldura · equipamento", "a carta das armas, armaduras e equipamento de aventura (anexe a de magia como referência de layout)",
        "a rugged empty card frame for an equipment card (weapons, armor and adventuring gear): "
        "forged dark iron and riveted steel plates over oiled wood and worn leather straps with "
        "buckles, a blacksmith's look; the corner medallion is an empty round iron shield boss",
        formato="carta",
        contexto="an empty printable card frame (a template) for the equipment cards of the website",
    ),
    cena(
        "carta-monstro", "Moldura · monstro", "a carta das criaturas do Bestiário (anexe a de magia como referência de layout)",
        "a savage empty card frame for a monster card: weathered bone, stitched dark hide and "
        "leather, small fangs and claws at the corners, scratch marks in the border; the corner "
        "medallion is an empty ring of bone, for the challenge rating",
        formato="carta",
        contexto="an empty printable card frame (a template) for the bestiary cards of the website",
    ),
    cena(
        "carta-verso", "Verso das cartas", "o verso das cartas impressas",
        "the back of a playing card for a fantasy tabletop RPG: a fully symmetrical design of "
        "deep red-brown leather with gold tooling, ornamental borders, and in the center a round "
        "red wax seal with an ornamental compass rose pressed into it, no letters; it fills the "
        "whole card, with rounded corners and a transparent background around the card",
        formato="carta",
        contexto="the back side of the printable cards of the website",
    ),
]


def secoes():
    return [("cartas", "Cartas", "cartas", CARTAS)]
