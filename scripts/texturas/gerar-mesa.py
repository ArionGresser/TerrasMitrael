"""
Gera a textura do tampo da mesa: public/images/mesa.webp.

Tábuas largas de madeira escura, inteiras de ponta a ponta, correndo na
vertical (no sentido da rolagem), cada uma com o seu tom e o seu veio, e
alguns nós. A imagem fecha nas quatro bordas, para repetir sem costura.

Tudo sai de ruído com semente fixa: rodar de novo gera a mesma imagem. Para
mudar a mesa, mexa nos números de cima e rode:

    python3 -m venv /tmp/venv && /tmp/venv/bin/pip install numpy pillow
    /tmp/venv/bin/python scripts/texturas/gerar-mesa.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

SEMENTE = 7
LARGURA = 1280  # soma das tábuas
ALTURA = 2400
TABUAS = [304, 338, 316, 322]  # larguras, em pixels
QUALIDADE = 72

# Do veio mais escuro ao mais claro: nogueira envelhecida
ESCURO = np.array([22, 13, 7], dtype=float)
MEDIO = np.array([58, 36, 19], dtype=float)
CLARO = np.array([96, 63, 35], dtype=float)

SAIDA = Path(__file__).resolve().parents[2] / "public" / "images" / "mesa.webp"

rng = np.random.default_rng(SEMENTE)


def ruido(altura, largura, escala_y, escala_x):
    """Ruído suave que fecha nas bordas (filtrado no espaço de frequências).

    escala_y maior que escala_x estica o ruído na vertical, como fibra."""
    branco = rng.standard_normal((altura, largura))
    fy = np.fft.fftfreq(altura)[:, None]
    fx = np.fft.fftfreq(largura)[None, :]
    filtro = np.exp(-((fy * escala_y) ** 2 + (fx * escala_x) ** 2))
    campo = np.real(np.fft.ifft2(np.fft.fft2(branco) * filtro))
    return (campo - campo.mean()) / (campo.std() + 1e-9)


def tabua(largura):
    """Uma tábua: veio ondulado ao longo do comprimento, fibra fina e manchas."""
    y, x = np.mgrid[0:ALTURA, 0:largura].astype(float)

    # O desenho dos anéis: listras na vertical que entortam devagar
    entorta = ruido(ALTURA, largura, 3600, 160) * 2.6 + ruido(ALTURA, largura, 500, 40) * 0.9
    # O miolo do tronco passeia de um lado a outro ao longo da tábua: onde
    # ele entra na tábua, os anéis fecham em arco
    passeio = ruido(ALTURA, 1, 3200, 1)[:, 0]
    centro = (rng.uniform(0.1, 0.9) + passeio[:, None] * 0.13) * largura
    frequencia = rng.uniform(0.15, 0.21)
    distancia = np.abs(x - centro) + entorta
    # Os anéis ficam mais largos perto do miolo e mais juntos longe dele
    fase = np.sign(distancia) * np.abs(distancia) ** 0.82 * frequencia
    aneis = (np.sin(fase * np.pi) + 1) / 2
    aneis = aneis**3  # anéis finos e escuros sobre a madeira mais clara

    # Fibra: riscos finos e compridos
    fibra = ruido(ALTURA, largura, 160, 1.0)
    # Manchas largas, de uso e de luz
    mancha = ruido(ALTURA, largura, 500, 160)

    t = 0.56 - aneis * 0.22 + fibra * 0.08 + mancha * 0.07
    tom = rng.uniform(-0.11, 0.09)  # cada tábua de um tom
    t = np.clip(t + tom, 0, 1)

    # Nós: um ou nenhum por tábua, com os anéis desviando em volta
    for _ in range(rng.integers(0, 2)):
        ny, nx = rng.uniform(0, ALTURA), rng.uniform(0.25, 0.75) * largura
        ry, rx = rng.uniform(16, 26), rng.uniform(7, 12)
        dy = (y - ny + ALTURA / 2) % ALTURA - ALTURA / 2  # fecha em cima e embaixo
        d = np.sqrt((dy / ry) ** 2 + ((x - nx) / rx) ** 2)
        miolo = np.exp(-(d**2) * 1.6)
        halo = np.sin(d * 5.0) * np.exp(-d * 0.55) * 0.12
        t = np.clip(t - miolo * 0.42 + halo, 0, 1)

    return t


def cor(t):
    """Leva o valor 0..1 para as três cores da madeira."""
    t = t[..., None]
    baixo = ESCURO + (MEDIO - ESCURO) * np.clip(t / 0.5, 0, 1)
    return np.where(t < 0.5, baixo, MEDIO + (CLARO - MEDIO) * np.clip((t - 0.5) / 0.5, 0, 1))


def montar():
    assert sum(TABUAS) == LARGURA
    colunas = []
    for largura in TABUAS:
        rgb = cor(tabua(largura))

        # Chanfro nas bordas compridas: a luz pega a esquerda, a direita afunda
        sombra = np.ones(largura)
        sombra[:2] = [0.35, 0.7]
        sombra[2:5] = [1.18, 1.12, 1.05]
        sombra[-4:] = [0.92, 0.82, 0.62, 0.3]
        colunas.append(rgb * sombra[None, :, None])

    imagem = np.concatenate(colunas, axis=1)
    # Um pouco de grão para o fundo não ficar liso demais
    imagem += rng.normal(0, 1.4, imagem.shape[:2])[..., None]
    return np.clip(imagem, 0, 255).astype(np.uint8)


if __name__ == "__main__":
    Image.fromarray(montar()).save(SAIDA, "WEBP", quality=QUALIDADE, method=6)
    print(f"{SAIDA} ({SAIDA.stat().st_size // 1024} KB)")
