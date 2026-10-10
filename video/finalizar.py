"""
O último passo do trailer: acerta o volume geral e põe um limitador.

Mede o som do vídeo que o Remotion soltou do jeito que o YouTube e o
Instagram medem (ITU BS.1770: o filtro K, blocos de 400 ms e os dois
portões) e leva tudo a -14 LUFS. Depois passa um limitador com 5 ms de
antecipação e teto em -1,5 dB: o auge, onde a música volta e o impacto bate
junto, não estoura. A imagem passa sem ser mexida.

O ffmpeg que vem com o Remotion não tem o ebur128 nem o alimiter, então as
contas são feitas aqui, em Python puro.

Uso:  python3 finalizar.py
Lê:   out/terras-de-mitrael-2-bruto.mp4
Sai:  out/terras-de-mitrael-2.mp4
"""

import array
import math
import os
import struct
import subprocess
import wave
from pathlib import Path

AQUI = Path(__file__).resolve().parent
PASTA_FFMPEG = AQUI / "node_modules/.pnpm/node_modules/@remotion/compositor-darwin-arm64"
FFMPEG = str(PASTA_FFMPEG / "ffmpeg")
AMBIENTE = {**os.environ, "DYLD_LIBRARY_PATH": str(PASTA_FFMPEG)}
BRUTO = AQUI / "out/terras-de-mitrael-2-bruto.mp4"
FINAL = AQUI / "out/terras-de-mitrael-2.mp4"
TMP = AQUI / "tmp"
SR = 48000
ALVO = -14.0
TETO = 10 ** (-1.5 / 20)
ANTECIPA = int(SR * 0.005)
SOLTA = math.exp(-1 / (SR * 0.08))


def ler(caminho: Path) -> tuple[list[float], list[float]]:
    b = caminho.read_bytes()
    i = 12
    while True:
        cid = b[i:i + 4]
        sz = struct.unpack("<I", b[i + 4:i + 8])[0]
        if cid == b"data":
            dados = b[i + 8:i + 8 + sz]
            break
        i += 8 + sz + (sz & 1)
    a = array.array("h")
    a.frombytes(dados[: len(dados) // 4 * 4])
    return [x / 32768 for x in a[0::2]], [x / 32768 for x in a[1::2]]


def biquad(x, b, a):
    y = [0.0] * len(x)
    x1 = x2 = y1 = y2 = 0.0
    b0, b1, b2 = b
    _, a1, a2 = a
    for n, v in enumerate(x):
        r = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, v, y1, r
        y[n] = r
    return y


def loudness(esq, dir_) -> float:
    """Volume integrado (LUFS), pela BS.1770, para 48 kHz."""
    k1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
    k2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])
    canais = [biquad(biquad(c, *k1), *k2) for c in (esq, dir_)]
    bloco, passo = int(SR * 0.4), int(SR * 0.1)
    energias = []
    for i in range(0, len(esq) - bloco, passo):
        z = sum(sum(v * v for v in c[i:i + bloco]) / bloco for c in canais)
        energias.append(z)
    lufs = lambda z: -0.691 + 10 * math.log10(z) if z > 0 else -200
    vale = [z for z in energias if lufs(z) > -70]
    relativo = lufs(sum(vale) / len(vale)) - 10
    vale = [z for z in vale if lufs(z) > relativo]
    return lufs(sum(vale) / len(vale))


def limitar(esq, dir_):
    n = len(esq)
    pede = [min(1.0, TETO / max(abs(esq[i]), abs(dir_[i]), 1e-9)) for i in range(n)]
    # Antecipa: o ganho começa a descer antes do pico, em rampa
    for i in range(n - 2, -1, -1):
        pede[i] = min(pede[i], pede[i + 1] + 1 / ANTECIPA)
    # E solta devagar depois dele
    g = 1.0
    for i in range(n):
        g = min(pede[i], 1 - (1 - g) * SOLTA)
        esq[i] *= g
        dir_[i] *= g
    return esq, dir_


def gravar(esq, dir_, destino: Path):
    a = array.array("h", [0] * (2 * len(esq)))
    a[0::2] = array.array("h", (max(-32767, min(32767, round(v * 32767))) for v in esq))
    a[1::2] = array.array("h", (max(-32767, min(32767, round(v * 32767))) for v in dir_))
    with wave.open(str(destino), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(a.tobytes())


def main():
    TMP.mkdir(exist_ok=True)
    entrada = TMP / "final-entrada.wav"
    saida = TMP / "final-saida.wav"
    subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", str(BRUTO), "-vn", "-ac", "2", "-ar", str(SR), "-f", "wav", str(entrada)], env=AMBIENTE, check=True)
    esq, dir_ = ler(entrada)

    antes = loudness(esq, dir_)
    ganho = 10 ** ((ALVO - antes) / 20)
    print(f"antes: {antes:.1f} LUFS; ganho {ALVO - antes:+.1f} dB")
    esq = [v * ganho for v in esq]
    dir_ = [v * ganho for v in dir_]
    pico_antes = 20 * math.log10(max(max(map(abs, esq)), max(map(abs, dir_))))
    esq, dir_ = limitar(esq, dir_)
    depois = loudness(esq, dir_)
    pico = 20 * math.log10(max(max(map(abs, esq)), max(map(abs, dir_))))
    print(f"pico antes do limitador {pico_antes:+.1f} dB; depois: {depois:.1f} LUFS, pico {pico:+.1f} dB")

    gravar(esq, dir_, saida)
    subprocess.run(
        [FFMPEG, "-loglevel", "error", "-y", "-i", str(BRUTO), "-i", str(saida), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", str(FINAL)],
        env=AMBIENTE,
        check=True,
    )
    print(f"pronto: {FINAL}")


if __name__ == "__main__":
    main()
