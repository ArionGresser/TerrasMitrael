"""
Desenha os cursores de mão do site, em SVG.

Uma mão só, apontando com o indicador, vestida de jeitos diferentes. Cada
variante sai em duas poses: `mao` (o ponteiro de sempre) e `toque` (a mesma
mão com um brilho dourado na ponta do dedo, para o que é clicável).

A mão é desenhada em pé, numa caixa de 64, e depois girada 25 graus para a
esquerda em volta da ponta do dedo, que vira o ponto exato do clique. O
traço escuro em volta de tudo garante que ela apareça tanto no pergaminho
claro quanto na madeira escura.

Uso:  python3 scripts/cursores/gerar-cursores.py
Sai:  public/cursores/<variante>-<pose>.svg
"""

from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "public/cursores"

TRACO = "#1e1208"
OURO = "#d6ad48"

# A ponta do indicador, no desenho em pé
PONTA = (19, 4)
# Onde a ponta fica no quadro final de 64 (no cursor de 32, é a metade)
ALVO = (12, 11)
GIRO = -25
ESCALA = 0.88

# As partes da mão, em pé. A ordem é a de pintura: o que vem depois cobre.
PUNHO = "M14 52 H46 L49 62 H11 Z"
PALMA = "M12 30 H48 V44 Q48 54 38 54 H22 Q12 54 12 44 Z"
DOBRADOS = [
    "M24 36 V22 a4.5 4.5 0 0 1 9 0 V36 Z",  # médio
    "M33 37 V24 a4 4 0 0 1 8 0 V37 Z",  # anelar
    "M41 38 V27 a3.5 3.5 0 0 1 7 0 V38 Z",  # mínimo
]
INDICADOR = "M14 36 V9 a5 5 0 0 1 10 0 V36 Z"
POLEGAR = "M13 41 Q6 39 7 31 Q8 26 13 27 Q19 29 23 33 Q26 37 22 40 Q18 42 13 41 Z"


def parte(d, cor, largura=2.4):
    return f'<path d="{d}" fill="{cor}" stroke="{TRACO}" stroke-width="{largura}" stroke-linejoin="round"/>'


def linha(d, cor, largura=1.6, opacidade=1.0):
    return (
        f'<path d="{d}" fill="none" stroke="{cor}" stroke-width="{largura}" '
        f'stroke-linecap="round" opacity="{opacidade}"/>'
    )


def couro():
    c, escuro, claro = "#7b4a26", "#5b3518", "#a46a3c"
    return "".join(
        [
            parte(PUNHO, escuro),
            linha("M13.5 56 H46.5", OURO, 2.2),
            parte(PALMA, c),
            *[parte(d, c) for d in DOBRADOS],
            parte(INDICADOR, c),
            linha("M17 12 V31", claro, 2, 0.8),
            linha("M21.5 14 V33", OURO, 1, 0.55),  # a costura dourada
            parte(POLEGAR, c),
            linha("M10 33 Q12 29 15 30", claro, 1.6, 0.7),
        ]
    )


def nua():
    pele, sombra, unha = "#eebf96", "#c9926b", "#f9e2cc"
    return "".join(
        [
            parte(PUNHO, "#7b2028"),
            linha("M13.5 56 H46.5", OURO, 2.2),
            parte(PALMA, pele),
            *[parte(d, pele) for d in DOBRADOS],
            parte(INDICADOR, pele),
            '<rect x="16.2" y="5.6" width="5.6" height="5.4" rx="2.4" fill="' + unha + '" stroke="' + sombra + '" stroke-width="0.9"/>',
            linha("M16.5 22 H21.5", sombra, 1.1, 0.8),
            parte(POLEGAR, pele),
            linha("M24 47 Q30 50 40 47", sombra, 1.2, 0.6),
        ]
    )


def sem_dedos():
    c, escuro, pele, sombra = "#6e4022", "#4f2d14", "#eebf96", "#c9926b"
    # O dedo inteiro em pele, e o couro por cima até a primeira junta
    luva_indicador = "M14 36 V21 H24 V36 Z"
    luvas_dobrados = [
        "M24 36 V25 H33 V36 Z",
        "M33 37 V27 H41 V37 Z",
        "M41 38 V29.5 H48 V38 Z",
    ]
    luva_polegar = "M13 41 Q8 40 8 35 L17 31 Q21 33 23 33 Q26 37 22 40 Q18 42 13 41 Z"
    return "".join(
        [
            parte(PUNHO, escuro),
            linha("M13.5 56 H46.5", OURO, 2.2),
            parte(PALMA, c),
            *[parte(d, pele) for d in DOBRADOS],
            *[parte(d, c) for d in luvas_dobrados],
            parte(INDICADOR, pele),
            parte(luva_indicador, c),
            linha("M15.5 21 H22.5", "#a46a3c", 1.2, 0.9),
            linha("M16.5 15 H21.5", sombra, 1.1, 0.7),
            parte(POLEGAR, pele),
            parte(luva_polegar, c),
        ]
    )


def manopla():
    aco, escuro, claro = "#9aa3ad", "#5d6670", "#d6dde4"
    return "".join(
        [
            parte(PUNHO, escuro),
            linha("M13.5 56 H46.5", OURO, 2.2),
            '<circle cx="18" cy="59" r="1.4" fill="' + OURO + '"/><circle cx="42" cy="59" r="1.4" fill="' + OURO + '"/>',
            parte(PALMA, aco),
            linha("M14 40 H46", escuro, 1.4, 0.9),
            *[parte(d, aco) for d in DOBRADOS],
            linha("M25 30 H32 M34 31 H40 M42 32 H47", escuro, 1.2, 0.9),
            parte(INDICADOR, aco),
            linha("M14.8 15 H23.2 M14.8 25 H23.2", escuro, 1.4),
            linha("M17 10 V13 M17 17 V23 M17 27 V33", claro, 1.6, 0.9),
            parte(POLEGAR, aco),
            linha("M10 33 Q12 29 15 30", claro, 1.6, 0.9),
        ]
    )


VARIANTES = {
    "couro": couro,
    "nua": nua,
    "sem-dedos": sem_dedos,
    "manopla": manopla,
}

# O brilho do toque: três raios dourados saindo da ponta do dedo
BRILHO = (
    f'<g stroke="{OURO}" stroke-width="2.6" stroke-linecap="round">'
    f'<path d="M{ALVO[0] - 4} {ALVO[1] - 4} L{ALVO[0] - 9} {ALVO[1] - 9}"/>'
    f'<path d="M{ALVO[0] + 2} {ALVO[1] - 6} L{ALVO[0] + 3} {ALVO[1] - 10}"/>'
    f'<path d="M{ALVO[0] - 6} {ALVO[1] + 2} L{ALVO[0] - 10} {ALVO[1] + 3}"/>'
    f"</g>"
    f'<circle cx="{ALVO[0]}" cy="{ALVO[1]}" r="3.2" fill="{OURO}" opacity="0.55"/>'
)


def svg(corpo, toque):
    giro = (
        f'<g transform="translate({ALVO[0]} {ALVO[1]}) rotate({GIRO}) '
        f'scale({ESCALA}) translate({-PONTA[0]} {-PONTA[1]})">{corpo}</g>'
    )
    # Uma borda clara fina em volta da mão, para ela aparecer na madeira
    # escura, e uma sombra curta embaixo, para descolar do pergaminho
    sombra = (
        '<filter id="s" x="-20%" y="-20%" width="140%" height="140%">'
        '<feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="gordo"/>'
        '<feFlood flood-color="#f4ead2" flood-opacity="0.9"/>'
        '<feComposite in2="gordo" operator="in" result="borda"/>'
        '<feGaussianBlur in="gordo" stdDeviation="1.3"/>'
        '<feOffset dx="1.5" dy="2" result="borrado"/>'
        '<feFlood flood-color="#000" flood-opacity="0.45"/>'
        '<feComposite in2="borrado" operator="in" result="sombra"/>'
        '<feMerge><feMergeNode in="sombra"/><feMergeNode in="borda"/><feMergeNode in="SourceGraphic"/></feMerge>'
        "</filter>"
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64">'
        f"<defs>{sombra}</defs>"
        f'<g filter="url(#s)">{giro}</g>'
        f"{BRILHO if toque else ''}"
        "</svg>\n"
    )


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    for nome, desenho in VARIANTES.items():
        corpo = desenho()
        (SAIDA / f"{nome}-mao.svg").write_text(svg(corpo, False))
        (SAIDA / f"{nome}-toque.svg").write_text(svg(corpo, True))
        print(nome)


if __name__ == "__main__":
    main()
