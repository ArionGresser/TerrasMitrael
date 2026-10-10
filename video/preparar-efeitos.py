"""
Prepara os efeitos e a trilha do trailer, a partir do que o Arion baixou em
Documents/Artes prontas/sons/video/.

Cada efeito é cortado de modo que o instante que importa (a batida, o topo
do riser, o pico do whoosh) caia num ponto conhecido do arquivo, anotado em
`efeitos.json` como `marca`. O vídeo encaixa a marca no tempo do roteiro,
não o começo do arquivo.

Depois cada um é igualado pelo trecho mais alto (janela de 100 ms), com o
pico limitado em -1 dB. O volume final de cada um, em relação à música, é
decidido no Trailer.tsx.

Também copia as imagens da montagem, em JPG de boa qualidade.

Python puro (só o Pillow para as imagens); o áudio passa pelo afconvert do Mac.

Uso:  python3 preparar-efeitos.py
"""

import array
import json
import math
import shutil
import struct
import subprocess
import wave
from pathlib import Path

from PIL import Image

AQUI = Path(__file__).resolve().parent
ORIGEM = Path.home() / "Documents/Artes prontas"
SONS = ORIGEM / "sons/video"
SAIDA_SONS = AQUI / "public/sons/trailer"
SAIDA_MUSICA = AQUI / "public/musica"
SAIDA_IMAGENS = AQUI / "public/imagens/montagem"
TMP = AQUI / "tmp"
SR = 48000
ALVO = -14.0
TETO = -1.0

# arquivo de origem, onde cortar (s), onde fica a marca no corte (s)
EFEITOS = {
    "hit-grave": ("hitgrave.mp3", 1.40, 4.50, 0.02),
    "impact": ("impact.mp3", 0.70, 4.20, 0.60),
    "riser": ("riser", 1.15, 3.95, 2.80),
    "subdrop": ("subdrop.mp3", 1.09, 4.30, 0.02),
    "whoosh": ("whoosh1.mp3", 1.70, 2.15, 0.14),
}

IMAGENS = {
    "saga-capa": "contos/cronicas/saga-capa.png",
    "dragao": "monstros/dragao-vermelho-anciao.png",
    "pyhmm": "personagens/pyhmm-phylimm-retrato.png",
    "johnny": "personagens/johnny-bling-bling-retrato.png",
    "lily": "personagens/lily-bouvardia-retrato.png",
    "egon": "personagens/egon-vitriol-pergaminho.png",
    "vrakyr": "personagens/vrakyr-windrose-retrato.png",
}


def ler(caminho: Path) -> list[float]:
    tmp = TMP / "efeito.wav"
    subprocess.run(["afconvert", "-f", "WAVE", "-d", f"LEI16@{SR}", "-c", "1", str(caminho), str(tmp)], check=True)
    b = tmp.read_bytes()
    i = 12
    while True:
        cid = b[i:i + 4]
        sz = struct.unpack("<I", b[i + 4:i + 8])[0]
        if cid == b"data":
            dados = b[i + 8:i + 8 + sz]
            break
        i += 8 + sz + (sz & 1)
    a = array.array("h")
    a.frombytes(dados[: len(dados) // 2 * 2])
    return [x / 32768 for x in a]


def gravar(x: list[float], destino: Path):
    a = array.array("h", (max(-32767, min(32767, int(v * 32767))) for v in x))
    with wave.open(str(destino), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(a.tobytes())


def igualar(x: list[float]) -> list[float]:
    w = int(SR * 0.1)
    maior = max(
        math.sqrt(sum(v * v for v in x[i:i + w]) / len(x[i:i + w]))
        for i in range(0, max(1, len(x) - w), w // 2)
    )
    g = 10 ** (ALVO / 20) / maior
    pico = max(abs(v) for v in x) * g
    if pico > 10 ** (TETO / 20):
        g *= 10 ** (TETO / 20) / pico
    return [v * g for v in x]


def rampas(x: list[float], entrada=0.003, saida=0.025) -> list[float]:
    n1, n2 = int(SR * entrada), int(SR * saida)
    for k in range(n1):
        x[k] *= k / n1
    for k in range(n2):
        x[len(x) - n2 + k] *= 1 - k / n2
    return x


def main():
    for pasta in (SAIDA_SONS, SAIDA_MUSICA, SAIDA_IMAGENS, TMP):
        pasta.mkdir(parents=True, exist_ok=True)

    marcas = {}
    for nome, (arquivo, de, ate, marca) in EFEITOS.items():
        x = ler(SONS / arquivo)
        x = rampas(x[int(de * SR):int(ate * SR)])
        gravar(igualar(x), SAIDA_SONS / f"{nome}.wav")
        marcas[nome] = {"marca": marca, "duracao": round(len(x) / SR, 3)}
        print(f"{nome}: {len(x) / SR:.2f}s, marca em {marca}s")
    (SAIDA_SONS / "efeitos.json").write_text(json.dumps(marcas, indent=2))

    trilha = SONS / "trilha-gta-v.mp3"
    shutil.copyfile(trilha, SAIDA_MUSICA / "gta-v.mp3")
    print("trilha copiada")

    for nome, rel in IMAGENS.items():
        im = Image.open(ORIGEM / rel).convert("RGB")
        im.save(SAIDA_IMAGENS / f"{nome}.jpg", quality=92)
    print(f"{len(IMAGENS)} imagens")


if __name__ == "__main__":
    main()
