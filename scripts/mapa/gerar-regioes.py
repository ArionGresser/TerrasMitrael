"""
Tira do mapa pintado (public/images/map.jpg) o contorno de cada região, em
vetor, e escreve src/lib/regioes-do-mapa.ts. É a camada que o mapa
interativo usa para acender a região sob o mouse e abrir o painel dela.

    python3 -m venv /tmp/venv && /tmp/venv/bin/pip install numpy opencv-python-headless
    /tmp/venv/bin/python scripts/mapa/gerar-regioes.py

Como funciona:
1. Mar e terra se separam pela cor: o mar é verde-azulado escuro.
2. Saem da conta a moldura, a rosa dos ventos e as faixas dos nomes, que
   ligariam um continente ao outro.
3. Cada região é o pedaço de terra que contém o ponto-semente dela. A massa
   do norte se divide pela cor: neve a oeste (Tundra), sal a leste (Marily),
   o resto é Tungel.
4. Os contornos saem simplificados, em pixels da imagem de 1600 x 1132.
   Se o mapa for trocado por um desenho novo, rode de novo com ele.
"""

import json
from pathlib import Path

import cv2
import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "src/lib/regioes-do-mapa.ts"

im = cv2.imread(str(RAIZ / "public/images/map.jpg"))
H, W = im.shape[:2]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
h, s, v = [hsv[:, :, i].astype(int) for i in range(3)]
xs = np.arange(W)[None, :].repeat(H, 0)
ys = np.arange(H)[:, None].repeat(W, 1)

ROSA = (797, 567)  # o centro da rosa dos ventos
FAIXAS = [  # os rolos de papel com os nomes, em (x0, y0, x1, y1)
    (225, 316, 416, 354),
    (698, 122, 838, 157),
    (1296, 660, 1484, 702),
    (360, 1010, 527, 1050),
    (640, 8, 930, 64),
]


def elipse(k):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))


def terra():
    mar = ((h >= 55) & (h <= 105) & (s < 120) & (v < 150)) | ((v < 42) & (s < 70))
    t = 255 - cv2.medianBlur(mar.astype(np.uint8) * 255, 7)
    t = cv2.morphologyEx(t, cv2.MORPH_OPEN, elipse(9))
    t = cv2.morphologyEx(t, cv2.MORPH_CLOSE, elipse(9))
    m = 22
    t[:m, :] = 0
    t[-m:, :] = 0
    t[:, :m] = 0
    t[:, -m:] = 0
    # A rosa dos ventos sai num círculo. Do lado de Mitrael o brilho amarelo
    # dela se espalha mais e engana a cor: ali, um pouco além, só vale o
    # verde da floresta de Sovara.
    perto = (xs - ROSA[0]) ** 2 + (ys - ROSA[1]) ** 2
    t[perto < 126**2] = 0
    verde = (h >= 35) & (h <= 60) & (s > 90)
    t[(perto < 168**2) & (xs > 870) & ~verde] = 0
    for x0, y0, x1, y1 in FAIXAS:
        t[y0:y1, x0:x1] = 0
    return t


T = terra()
_, ROTULO = cv2.connectedComponents(T)


def pedacos(*pontos):
    m = np.zeros_like(T)
    for x, y in pontos:
        c = ROTULO[y, x]
        assert c, f"o ponto {x},{y} caiu no mar"
        m[ROTULO == c] = 255
    return m


def suavizar(m, semente, k=21, buracos=3000):
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, elipse(k))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, elipse(k))
    _, r = cv2.connectedComponents(m)
    c = r[semente[1], semente[0]]
    assert c, semente
    m = ((r == c) * 255).astype(np.uint8)
    # Tapa os buracos pequenos (nomes, ícones), mas mantém os lagos
    n, r, st, _ = cv2.connectedComponentsWithStats(255 - m)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < buracos:
            m[r == i] = 255
    return m


def remendar(m, caixa, k=45):
    """Fecha o dente que uma faixa de nome abriu no litoral, só ali."""
    x0, y0, x1, y1 = caixa
    fechado = cv2.morphologyEx(m, cv2.MORPH_CLOSE, elipse(k))
    m[y0 - 30 : y1 + 12, x0 - 12 : x1 + 12] = fechado[y0 - 30 : y1 + 12, x0 - 12 : x1 + 12]
    return m


claro = ((s < 78) & (v > 110)).astype(np.uint8) * 255
norte = pedacos((800, 260))
tundra = cv2.bitwise_and(norte, claro)
tundra[xs >= 760] = 0
marily = cv2.bitwise_and(norte, claro)
marily[xs <= 1080] = 0
tundra = suavizar(tundra, (380, 110))
marily = suavizar(marily, (1350, 250))
tungel = cv2.bitwise_and(norte, cv2.bitwise_not(cv2.bitwise_or(tundra, marily)))
tungel = suavizar(tungel, (800, 260), k=13)

askar = pedacos((200, 650), (347, 713))
askar[ys > 1062] = 0
askar = remendar(askar, FAIXAS[3])
askar = suavizar(askar, (200, 650), k=5, buracos=1500)
# O Colosso de Askar é uma ilha no mar de dentro: volta a fazer parte
askar = cv2.bitwise_or(askar, pedacos((347, 713)))
askar[ys > 1062] = 0

gtry = cv2.morphologyEx(pedacos((350, 400), (155, 470), (455, 425)), cv2.MORPH_CLOSE, elipse(5))

REGIOES = {
    "tundra": tundra,
    "tungel": tungel,
    "marily": marily,
    "gtry": gtry,
    "askar": askar,
    "pondor": suavizar(pedacos((670, 770)), (670, 770), k=5),
    "enclausurador": suavizar(pedacos((1380, 470)), (1380, 470), k=5),
    "mitrael": suavizar(pedacos((1250, 800)), (1250, 800), k=5, buracos=1500),
}


def caminho(m):
    """O contorno em SVG, com os lagos como furos (regra evenodd)."""
    contornos, _ = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    partes = []
    for c in contornos:
        if cv2.contourArea(c) < 60:
            continue
        c = cv2.approxPolyDP(c, 1.1, True)
        pts = c[:, 0, :]
        partes.append("M" + "L".join(f"{x} {y}" for x, y in pts) + "Z")
    return "".join(partes)


def centro(m):
    """O ponto mais fundo dentro da região, longe das bordas: onde o nome cabe."""
    d = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    y, x = np.unravel_index(np.argmax(d), d.shape)
    return int(x), int(y)


dados = []
for chave, m in REGIOES.items():
    x, y, w, hh = cv2.boundingRect(m)
    cx, cy = centro(m)
    dados.append(
        {"chave": chave, "d": caminho(m), "centro": [cx, cy], "caixa": [x, y, w, hh]}
    )

SAIDA.write_text(
    "/**\n"
    " * Gerado por scripts/mapa/gerar-regioes.py a partir de public/images/map.jpg.\n"
    " * Não edite à mão: o contorno de cada região, em pixels da imagem de\n"
    " * 1600 x 1132, com o centro (onde o nome cabe) e a caixa que a envolve.\n"
    " */\n\n"
    "export type ContornoDeRegiao = {\n"
    "  chave: string;\n"
    "  d: string;\n"
    "  centro: [number, number];\n"
    "  caixa: [number, number, number, number];\n"
    "};\n\n"
    f"export const LARGURA_BASE = {W};\nexport const ALTURA_BASE = {H};\n\n"
    "export const CONTORNOS: ContornoDeRegiao[] = "
    + json.dumps(dados, ensure_ascii=False, indent=2)
    + ";\n"
)
print(SAIDA, round(SAIDA.stat().st_size / 1024), "KB")

if __name__ == "__main__":
    vis = im.copy()
    for m in REGIOES.values():
        cs, _ = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(vis, cs, -1, (0, 230, 255), 3)
    cv2.imwrite("/tmp/regioes-vis.jpg", cv2.resize(vis, (1200, 849)))
