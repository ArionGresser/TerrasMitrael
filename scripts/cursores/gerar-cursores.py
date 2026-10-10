"""
Desenha os cursores de mão do site, em SVG.

Uma mão só, apontando com o indicador, vestida de jeitos diferentes. Cada
variante sai em três poses:
  mao     o ponteiro de sempre;
  toque   a mesma mão com raios dourados na ponta do dedo, para o que é
          clicável;
  aperta  a mão empurrando o dedo para baixo, enquanto o botão do mouse está
          apertado.

A mão é desenhada em pé, numa caixa de 64, e depois girada para a esquerda
em volta da ponta do dedo, que vira o ponto exato do clique. Cada parte tem
luz e sombra num degradê só, que atravessa a mão inteira do mesmo jeito, e
o indicador ganha um degradê próprio de lado a lado, que dá a ele volume de
dedo, e não de recorte de papel.

Uso:  python3 scripts/cursores/gerar-cursores.py
      node scripts/cursores/rasterizar.mjs   (a cópia em PNG)
Sai:  public/cursores/<variante>-<pose>.svg
"""

from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "public/cursores"

TRACO = "#1e1208"
OURO = "#d6ad48"
OURO_CLARO = "#f3d982"

PONTA = (19, 3.6)  # a ponta do indicador, no desenho em pé
ALVO = (12, 11)  # onde a ponta fica no quadro de 64
# O tamanho do cursor na tela. Com 40 o ponto do clique fica em 7 7; a cópia
# em PNG sai com 32 (ponto em 6 5), para o Chrome, que recusa cursor maior
# que 32 encostado na borda da janela e então cai nela.
TAMANHO = 40
POSES = {
    "mao": {"giro": -25, "escala": 0.88},
    "toque": {"giro": -25, "escala": 0.88},
    # Apertando: o dedo fica mais em pé e a mão encolhe um pouco, como quem
    # empurra a ponta contra a mesa
    "aperta": {"giro": -12, "escala": 0.82},
    # A pinça fica mais baixa no quadro, porque a mão sobe acima do ponto
    # de pegar: no cursor de 40, o ponto é 9 15
    "pinca": {"giro": -25, "escala": 0.9, "alvo": (14, 24)},
}

# ---------- A mão, em pé ----------

PUNHO = "M14 52 H46 L49 62 H11 Z"
PALMA = "M12 30 Q12 28 14 28 H46 Q48 28 48 31 V44 Q48 54 38 54 H22 Q12 54 12 44 Z"
DOBRADOS = [
    "M24 37 V22 Q24 17.5 28.5 17.5 Q33 17.5 33 22 V37 Z",  # médio
    "M33 38 V24 Q33 20 37 20 Q41 20 41 24 V38 Z",  # anelar
    "M41 39 V27 Q41 23.5 44.5 23.5 Q48 23.5 48 27 V39 Z",  # mínimo
]
INDICADOR = "M14 37 L14.6 10 Q14.8 3.6 19 3.6 Q23.2 3.6 23.4 10 L24 37 Z"
INDICADOR_FINO = "M15.4 37 L15.8 10 Q16 3.6 19 3.6 Q22 3.6 22.2 10 L22.6 37 Z"
POLEGAR = "M13 41 Q6 39 7 31 Q8 26 13 27 Q19 29 23 33 Q26 37 22 40 Q18 42 13 41 Z"
# As dobras das juntas nos dedos dobrados
JUNTAS = "M25.5 27 Q28.5 25.5 31.5 27 M34.5 29 Q37 27.6 39.5 29 M42.5 31.5 Q44.5 30.2 46.5 31.5"


def parte(d, cor, largura=2.4):
    return (
        f'<path d="{d}" fill="{cor}" stroke="{TRACO}" stroke-width="{largura}" '
        'stroke-linejoin="round"/>'
    )


def linha(d, cor, largura=1.6, opacidade=1.0, tracejado=None):
    extra = f' stroke-dasharray="{tracejado}"' if tracejado else ""
    return (
        f'<path d="{d}" fill="none" stroke="{cor}" stroke-width="{largura}" '
        f'stroke-linecap="round" stroke-linejoin="round" opacity="{opacidade}"{extra}/>'
    )


def degrades(claro, base, escuro):
    """O degradê da mão (luz de cima e da esquerda) e o do dedo (cilindro)."""
    return (
        '<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="8" y1="6" x2="50" y2="58">'
        f'<stop offset="0" stop-color="{claro}"/><stop offset="0.45" stop-color="{base}"/>'
        f'<stop offset="1" stop-color="{escuro}"/></linearGradient>'
        '<linearGradient id="d" gradientUnits="userSpaceOnUse" x1="14" y1="0" x2="24" y2="0">'
        f'<stop offset="0" stop-color="{base}"/><stop offset="0.3" stop-color="{claro}"/>'
        f'<stop offset="0.65" stop-color="{base}"/><stop offset="1" stop-color="{escuro}"/></linearGradient>'
    )


# O punho da última variante desenhada, que a pinça reaproveita
_punho = ""


def mao_basica(punho, *, dedo=INDICADOR, sobre_dedo="", sobre_palma="", sobre_dobrados="", sobre_polegar=""):
    """A ordem de pintura de toda mão: punho, palma, dedos dobrados, indicador, polegar."""
    global _punho
    _punho = punho
    return "".join(
        [
            punho,
            parte(PALMA, "url(#g)"),
            sobre_palma,
            *[parte(d, "url(#g)") for d in DOBRADOS],
            sobre_dobrados,
            parte(dedo, "url(#d)"),
            sobre_dedo,
            parte(POLEGAR, "url(#g)"),
            sobre_polegar,
        ]
    )


# ---------- As variantes ----------


def couro():
    defs = degrades("#b67a48", "#8a5530", "#4f2c14")
    punho = (
        parte("M13 50 H47 L51 62 H9 Z", "#5b3518")
        + linha("M11.5 56 H48.5", OURO, 2.4)
        + linha("M12 59.5 H48", OURO_CLARO, 0.8, 0.8, "1.6 1.4")
    )
    corpo = mao_basica(
        punho,
        sobre_dedo=linha("M16.6 10 L16.2 33", "#d9a274", 1.6, 0.55)
        + linha("M21.6 9 L22.2 34", OURO, 0.9, 0.85, "1.8 1.5"),
        sobre_palma=linha("M15 44 Q30 48 45 44", OURO, 0.9, 0.7, "1.8 1.5"),
        sobre_dobrados=linha(JUNTAS, "#3a200e", 1.1, 0.6),
        sobre_polegar=linha("M10 33 Q12 29 15.5 30", "#d9a274", 1.5, 0.6),
    )
    return defs, corpo


def nua():
    defs = degrades("#fde3c8", "#f0c49e", "#c98f66")
    punho = (
        parte("M13 50 H47 L50 62 H10 Z", "#8a2430")
        + linha("M11 55.5 H49", OURO, 2.4)
        + linha("M20 52 L19 61 M30 52 V61 M40 52 L41 61", "#5a121b", 1, 0.6)
    )
    unha = (
        '<path d="M16.4 10.5 Q16.4 6 19 6 Q21.6 6 21.6 10.5 Q19 12 16.4 10.5 Z" '
        'fill="#fbe9da" stroke="#c98f66" stroke-width="0.9"/>'
    )
    corpo = mao_basica(
        punho,
        sobre_dedo=unha
        + linha("M16.2 20 Q19 21.2 21.8 20 M16 29 Q19 30.2 22 29", "#b77d55", 1, 0.75),
        sobre_palma=linha("M20 46 Q30 50 41 46", "#c98f66", 1, 0.55),
        sobre_dobrados=linha(JUNTAS, "#b77d55", 1, 0.8),
    )
    return defs, corpo


def sem_dedos():
    defs = degrades("#a86c3e", "#744321", "#432410")
    pele = "#f0c49e"
    luva_dedo = "M14 37 L14.3 21 H23.7 L24 37 Z"
    luvas_dobrados = [
        "M24 37 V25.5 H33 V37 Z",
        "M33 38 V27.5 H41 V38 Z",
        "M41 39 V30 H48 V39 Z",
    ]
    luva_polegar = "M13 41 Q8 40 8 35 L17 31 Q21 33 23 33 Q26 37 22 40 Q18 42 13 41 Z"
    punho = parte("M13 50 H47 L50 62 H10 Z", "#4a2a12") + linha("M11 56 H49", OURO, 2.2)
    global _punho
    _punho = punho
    corpo = "".join(
        [
            punho,
            parte(PALMA, "url(#g)"),
            linha("M15 44 Q30 48 45 44", "#c89a5a", 0.9, 0.7, "1.8 1.5"),
            *[parte(d, pele) for d in DOBRADOS],
            *[parte(d, "url(#g)") for d in luvas_dobrados],
            linha("M25 25.5 H32 M34 27.5 H40 M42 30 H47", "#c48a52", 1.1, 0.9),
            parte(INDICADOR, pele),
            '<path d="M16.4 10.5 Q16.4 6 19 6 Q21.6 6 21.6 10.5 Q19 12 16.4 10.5 Z" fill="#fbe9da" stroke="#c98f66" stroke-width="0.9"/>',
            linha("M16.2 15.5 Q19 16.7 21.8 15.5", "#b77d55", 1, 0.75),
            parte(luva_dedo, "url(#d)"),
            linha("M15.3 21 H22.7", "#c48a52", 1.2, 0.95),
            parte(POLEGAR, pele),
            parte(luva_polegar, "url(#g)"),
        ]
    )
    return defs, corpo


def manopla():
    defs = degrades("#eef2f6", "#a3acb6", "#555e68")
    punho = (
        parte("M12 49 H48 L52 62 H8 Z", "#6c7580")
        + linha("M10.5 55 H49.5", OURO, 2.4)
        + "".join(f'<circle cx="{x}" cy="58.7" r="1.3" fill="{OURO}" stroke="{TRACO}" stroke-width="0.6"/>' for x in (16, 24, 32, 40))
    )
    placas_dedo = (
        parte("M14.2 26 L24 26 L24 37 L14 37 Z", "url(#d)")
        + parte("M14.5 15.5 L23.5 15.5 L23.8 27 L14.2 27 Z", "url(#d)")
        + linha("M16.6 9 V13 M16.5 18 V24 M16.4 29 V35", "#ffffff", 1.4, 0.8)
    )
    corpo = mao_basica(
        punho,
        sobre_dedo=placas_dedo,
        sobre_palma=linha("M13 40 H47", "#4a525c", 1.4, 0.9)
        + "".join(f'<circle cx="{x}" cy="47" r="1.2" fill="{OURO}" stroke="{TRACO}" stroke-width="0.5"/>' for x in (20, 30, 40)),
        sobre_dobrados=linha("M24.5 30 H32.5 M33.5 31 H40.5 M41.5 32.5 H47.5", "#4a525c", 1.3, 0.9),
        sobre_polegar=linha("M10 33 Q12 29 15.5 30", "#ffffff", 1.4, 0.8),
    )
    return defs, corpo


def goblin():
    defs = degrades("#c2df8a", "#8db35a", "#4f6f2a")
    garra = '<path d="M16.6 7.5 Q19 -4 21.4 7.5 Q19 9 16.6 7.5 Z" fill="#2c2416" stroke="' + TRACO + '" stroke-width="1"/>'
    garrinhas = "".join(
        f'<path d="M{x - 2.2} {y + 1.2} Q{x} {y - 4.5} {x + 2.2} {y + 1.2} Z" fill="#2c2416" stroke="{TRACO}" stroke-width="0.8"/>'
        for x, y in ((28.5, 17.6), (37, 20.1), (44.5, 23.6))
    )
    verrugas = "".join(
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="#6f8f3f" stroke="#4f6f2a" stroke-width="0.6"/>'
        for x, y, r in ((33, 45, 1.5), (21, 49, 1.1), (18.8, 22, 0.9), (40, 42, 0.8))
    )
    # Um trapo amarrado no pulso, com a barra rasgada
    punho = (
        parte("M13 50 H47 L49 58 L46 61 L43 58.5 L39 62 L35 58.5 L31 62 L27 58.5 L23 62 L19 58.5 L15 61 L11 58 Z", "#6b5233")
        + linha("M12.5 54 Q30 56.5 47.5 54", "#3f2e1a", 1.6, 0.9)
    )
    corpo = mao_basica(
        punho,
        dedo=INDICADOR_FINO,
        sobre_dedo=garra + linha("M17 17 Q19 18.3 21 17 M16.8 27 Q19 28.3 21.2 27", "#4f6f2a", 1.1, 0.9),
        sobre_palma=verrugas,
        sobre_dobrados=garrinhas + linha(JUNTAS, "#4f6f2a", 1.1, 0.9),
    )
    # Quem clica é a ponta da garra, um pouco acima do dedo
    return defs, corpo, (19, -3.5)


def esqueleto():
    defs = degrades("#fffaf0", "#e6dcc3", "#a99b78")
    vao = "#2a2018"
    # A manga rasgada de uma túnica velha
    punho = parte("M13 50 H47 L48 57 L44 62 L40 58 L35 62 L30 58 L25 62 L20 58 L15 62 L12 57 Z", "#2c2433")
    corpo = mao_basica(
        punho,
        # As três falanges, separadas por juntas escuras
        sobre_dedo=linha("M15 14.5 H23.2 M14.8 25.5 H23.6", vao, 2.2)
        + linha("M17 7 V12 M16.8 17.5 V23 M16.7 28.5 V35", "#ffffff", 1.2, 0.8),
        # Os ossos da mão aparecendo no dorso, e uma rachadura
        sobre_palma=linha("M20 33 L21 50 M28 34 L28.5 51 M36 35 L36 51 M43 36 L42 49", "#a99b78", 1.2, 0.9)
        + linha("M33 41 L35.5 44 L34 46.5", vao, 0.9, 0.9),
        sobre_dobrados=linha("M24.5 28 H32.5 M33.5 30 H40.5 M41.5 32 H47.5", vao, 1.8),
        sobre_polegar=linha("M14.8 30.5 L13.2 39", vao, 1.6),
    )
    return defs, corpo


def draconato():
    defs = degrades("#e98552", "#b4462b", "#5f1c10")
    escamas = "".join(
        f'<path d="M{x - 2} {y} Q{x} {y + 2.6} {x + 2} {y}" fill="none" stroke="#5f1c10" stroke-width="0.9" opacity="0.75"/>'
        for x, y in [(18, 33), (22, 33), (26, 33), (30, 33), (34, 33), (38, 33), (42, 33), (46, 34),
                     (16, 38), (20, 38), (24, 38), (28, 38), (32, 38), (36, 38), (40, 38), (44, 38),
                     (18, 43), (22, 43), (26, 43), (30, 43), (34, 43), (38, 43), (42, 43),
                     (21, 48), (25, 48), (29, 48), (33, 48), (37, 48), (41, 48)]
    )
    escamas_dedo = "".join(
        f'<path d="M{x - 2} {y} Q{x} {y + 2.4} {x + 2} {y}" fill="none" stroke="#5f1c10" stroke-width="0.8" opacity="0.75"/>'
        for x, y in [(17, 14), (21, 14), (17, 19), (21, 19), (17, 24), (21, 24), (17, 29), (21, 29), (19, 33)]
    )
    garra = '<path d="M16 9 Q19 -5 22 9 Q19 7.5 16 9 Z" fill="#241510" stroke="' + TRACO + '" stroke-width="1"/>'
    garrinhas = "".join(
        f'<path d="M{x - 2.4} {y + 1.4} Q{x} {y - 5} {x + 2.4} {y + 1.4} Z" fill="#241510" stroke="{TRACO}" stroke-width="0.8"/>'
        for x, y in ((28.5, 17.6), (37, 20.1), (44.5, 23.6))
    )
    punho = (
        parte("M12 49 H48 L51 62 H9 Z", "#b8912c")
        + linha("M12 53 H48 M11 57.5 H49", "#7a5c14", 1.2, 0.9)
        + f'<path d="M30 52.5 L33 55.3 L30 58.1 L27 55.3 Z" fill="#c4352a" stroke="{TRACO}" stroke-width="0.7"/>'
    )
    corpo = mao_basica(
        punho,
        sobre_dedo=escamas_dedo + garra,
        sobre_palma=escamas,
        sobre_dobrados=garrinhas,
    )
    return defs, corpo, (19, -4.5)


def mago():
    defs = degrades("#9a74d6", "#5b3a8c", "#2a1748")
    runa = (
        f'<circle cx="31" cy="43" r="5.2" fill="none" stroke="{OURO}" stroke-width="1.1"/>'
        f'<path d="M31 37.8 L33 43 L31 48.2 L29 43 Z M25.8 43 H36.2" fill="none" stroke="{OURO}" stroke-width="0.9"/>'
    )
    punho = (
        parte("M12 49 H48 L52 62 H8 Z", "#3a2160")
        + linha("M10.5 54 H49.5 M9.5 59.5 H50.5", OURO, 1.6)
        + f'<circle cx="30" cy="57" r="3" fill="#4aa3e0" stroke="{TRACO}" stroke-width="0.9"/>'
        + '<circle cx="29" cy="56" r="1" fill="#e6f5ff"/>'
    )
    corpo = mao_basica(
        punho,
        sobre_dedo=linha("M16.6 10 L16.2 33", "#c4a6f0", 1.4, 0.55)
        + linha("M14.5 30 H23.5", OURO, 1.1, 0.9),
        sobre_palma=runa,
        sobre_dobrados=linha(JUNTAS, "#1c0f33", 1, 0.6),
        sobre_polegar=linha("M10 33 Q12 29 15.5 30", "#c4a6f0", 1.4, 0.6),
    )
    return defs, corpo


VARIANTES = {
    "couro": couro,
    "nua": nua,
    "sem-dedos": sem_dedos,
    "manopla": manopla,
    "goblin": goblin,
    "esqueleto": esqueleto,
    "draconato": draconato,
    "mago": mago,
}

# ---------- A pinça ----------
# A mão que segura o dado ou a moeda: o indicador dobra para a frente e o
# polegar sobe até encontrar a ponta dele. O ponto do clique é o meio da
# pinça, onde a coisa fica presa.

PINCA_PONTA = (5.4, 22.4)
INDICADOR_BASE = "M14 37 L14.3 22 Q14.5 17 19 17 Q23.5 17 23.7 22 L24 37 Z"
INDICADOR_PONTA = "M22 21 Q22 15.4 16.5 15.4 L8.6 15.8 Q4.4 16.1 4.5 19.9 Q4.7 23.6 8.7 23.6 L17.5 24.2 Q22 24.2 22 21 Z"
POLEGAR_PINCA = "M13 41 Q7 40 6 34 Q5 29 5.6 27 Q6.4 24.4 9 25 Q11.4 25.6 11.8 29 Q12.4 33 17 35.5 Q15.5 40 13 41 Z"
GARRA_INDICADOR = '<path d="M6 17.6 Q-2 19.8 6 22.2 Q5 19.9 6 17.6 Z" fill="#241510" stroke="#1e1208" stroke-width="0.9"/>'
GARRA_POLEGAR = '<path d="M6.4 26.6 Q3.5 22 8.6 24.9 Q7.2 25.4 6.4 26.6 Z" fill="#241510" stroke="#1e1208" stroke-width="0.8"/>'

PINCA = {
    # variante: (cor da ponta dos dedos, enfeite por cima)
    "couro": (None, ""),
    "nua": (None, ""),
    "sem-dedos": ("#f0c49e", ""),
    "manopla": (None, ""),
    "goblin": (None, GARRA_INDICADOR + GARRA_POLEGAR),
    "esqueleto": (None, ""),
    "draconato": (None, GARRA_INDICADOR + GARRA_POLEGAR),
    "mago": (None, ""),
}


def pinca(nome, punho):
    ponta, enfeite = PINCA[nome]
    dedo = ponta or "url(#d)"
    polegar = ponta or "url(#g)"
    return "".join(
        [
            punho,
            parte(PALMA, "url(#g)"),
            *[parte(d, "url(#g)") for d in DOBRADOS],
            parte(INDICADOR_BASE, "url(#d)"),
            parte(INDICADOR_PONTA, dedo),
            parte(POLEGAR_PINCA, polegar),
            enfeite,
        ]
    )


# ---------- As poses ----------

BRILHO = (
    f'<g stroke="{OURO}" stroke-width="2.6" stroke-linecap="round">'
    f'<path d="M{ALVO[0] - 4} {ALVO[1] - 4} L{ALVO[0] - 9} {ALVO[1] - 9}"/>'
    f'<path d="M{ALVO[0] + 2} {ALVO[1] - 6} L{ALVO[0] + 3} {ALVO[1] - 10}"/>'
    f'<path d="M{ALVO[0] - 6} {ALVO[1] + 2} L{ALVO[0] - 10} {ALVO[1] + 3}"/>'
    f"</g>"
    f'<circle cx="{ALVO[0]}" cy="{ALVO[1]}" r="3.2" fill="{OURO_CLARO}" opacity="0.6"/>'
)

# A batida: dois arquinhos curtos em volta da ponta do dedo
BATIDA = (
    f'<g fill="none" stroke="{OURO_CLARO}" stroke-width="2" stroke-linecap="round" opacity="0.9">'
    f'<path d="M{ALVO[0] - 7} {ALVO[1] + 1} Q{ALVO[0] - 7} {ALVO[1] - 7} {ALVO[0] + 1} {ALVO[1] - 7}"/>'
    f"</g>"
)

FILTRO = (
    # Uma borda clara fina em volta da mão, para ela aparecer na madeira
    # escura, e uma sombra curta embaixo, para descolar do pergaminho
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


def svg(defs, corpo, pose, ponta=PONTA):
    p = POSES[pose]
    if pose == "pinca":
        ponta = PINCA_PONTA
    # A garra deixa a mão mais comprida: encolhe na mesma conta, para caber
    escala = p["escala"] * (PONTA[1] + 58) / (ponta[1] * -1 + PONTA[1] + 58) if ponta not in (PONTA, PINCA_PONTA) else p["escala"]
    alvo = p.get("alvo", ALVO)
    giro = (
        f'<g transform="translate({alvo[0]} {alvo[1]}) rotate({p["giro"]}) '
        f'scale({escala:.3f}) translate({-ponta[0]} {-ponta[1]})">{corpo}</g>'
    )
    extra = BRILHO if pose == "toque" else BATIDA if pose == "aperta" else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{TAMANHO}" height="{TAMANHO}" viewBox="0 0 64 64">'
        f"<defs>{FILTRO}{defs}</defs>"
        f'<g filter="url(#s)">{giro}</g>'
        f"{extra}"
        "</svg>\n"
    )


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    for antigo in SAIDA.glob("*.svg"):
        antigo.unlink()
    for antigo in SAIDA.glob("*.png"):
        antigo.unlink()
    for nome, desenho in VARIANTES.items():
        defs, corpo, *ponta = desenho()
        for pose in POSES:
            desenho_da_pose = pinca(nome, _punho) if pose == "pinca" else corpo
            (SAIDA / f"{nome}-{pose}.svg").write_text(svg(defs, desenho_da_pose, pose, *ponta))
        print(nome)


if __name__ == "__main__":
    main()
