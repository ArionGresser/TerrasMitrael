"""
Prepara os efeitos sonoros do vídeo.

No site os efeitos tocam baixinho, na altura do pergaminho, porque estão
embaixo da leitura. No vídeo eles disputam com a música, então saem bem
mais fortes, todos igualados pelo volume que o ouvido percebe (curva A).
Os dois sons que o site monta na hora, o sopro do zoom e o brilho mágico,
são refeitos aqui com a mesma receita de src/lib/sintese.ts.

Uso:  /tmp/venv-arte/bin/python preparar-sons.py
Sai:  public/sons/<efeito>.wav
"""

import subprocess
import wave
from pathlib import Path

import numpy as np

AQUI = Path(__file__).parent
SITE = AQUI.parent / "public/sons"
SAIDA = AQUI / "public/sons"
TMP = AQUI / "tmp"
SR = 48000
ALVO = -20.0  # dB (curva A): logo acima da música, que fica em volta de -24

ARQUIVOS = {
    "pergaminho": "pergaminho-abrir.mp3",
    "virarPagina": "virar-pagina.m4a",
    "capa": "capa.m4a",
    "aba": "aba.m4a",
    "marcador": "marcador.m4a",
    "trinco": "trinco.m4a",
    "moedas": "moedas.m4a",
    "feitico": "feitico.m4a",
    "rugido": "rugido.m4a",
}
# Alguns pedem um pouco mais ou menos que o alvo
AJUSTE = {"rugido": 3.0, "marcador": -2.0, "aba": -2.0, "virarPagina": -1.0}


def ler(caminho: Path) -> np.ndarray:
    wav = TMP / (caminho.stem + "-sfx.wav")
    subprocess.run(["afconvert", "-f", "WAVE", "-d", f"LEI16@{SR}", "-c", "1", str(caminho), str(wav)], check=True)
    # O afconvert às vezes grava o cabeçalho estendido, que o módulo wave não
    # lê: basta achar o bloco de dados, que é PCM de 16 bits do mesmo jeito
    bruto = wav.read_bytes()
    i = bruto.index(b"data") + 8
    return np.frombuffer(bruto[i : i + (len(bruto) - i) // 2 * 2], dtype=np.int16).astype(float) / 32768


def peso_a(f):
    f2 = f**2
    r = (12194**2 * f2**2) / ((f2 + 20.6**2) * np.sqrt((f2 + 107.7**2) * (f2 + 737.9**2)) * (f2 + 12194**2))
    return r / r[np.argmin(np.abs(f - 1000))]


def percebido(s):
    jan = int(SR * 0.01)
    n = len(s) // jan
    rms = np.sqrt((s[: n * jan].reshape(n, jan) ** 2).mean(1))
    ativo = s[: n * jan].reshape(n, jan)[rms > rms.max() * 0.1].ravel()  # só a parte que soa
    e = np.abs(np.fft.rfft(ativo)) ** 2
    f = np.fft.rfftfreq(len(ativo), 1 / SR)
    return 10 * np.log10((e * peso_a(np.maximum(f, 1)) ** 2).sum() / len(ativo) ** 2 * 2 + 1e-12)


def recortar(a):
    jan = int(SR * 0.005)
    n = len(a) // jan
    db = 20 * np.log10(np.sqrt((a[: n * jan].reshape(n, jan) ** 2).mean(1)) + 1e-9)
    ini = max(0, np.argmax(db > db.max() - 35) - 1) * jan
    fim = min(len(a), (n - np.argmax(db[::-1] > db.max() - 45) + 6) * jan)
    s = a[ini:fim].copy()
    fo = min(int(0.02 * SR), len(s) // 4)
    s[-fo:] *= np.linspace(1, 0, fo)
    return s


def bandpass(x, f0s, q):
    """Biquad passa-banda (o mesmo da Web Audio), com a frequência andando."""
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        w0 = 2 * np.pi * f0s[i] / SR
        alpha = np.sin(w0) / (2 * q)
        b0, b2 = alpha, -alpha
        a0, a1, a2 = 1 + alpha, -2 * np.cos(w0), 1 - alpha
        yi = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1, y2, y1 = x1, x[i], y1, yi
        y[i] = yi
    return y


def envelope(t, pontos):
    """Rampas exponenciais entre (tempo, valor), como exponentialRampToValueAtTime."""
    e = np.full_like(t, pontos[-1][1])
    for (t0, v0), (t1, v1) in zip(pontos, pontos[1:]):
        m = (t >= t0) & (t < t1)
        e[m] = v0 * (v1 / v0) ** ((t[m] - t0) / (t1 - t0))
    e[t < pontos[0][0]] = 0
    return e


def sopro(perto=True):
    t = np.arange(int(SR * 0.4)) / SR
    de, para = (320, 1500) if perto else (1500, 320)
    f = np.where(t < 0.32, de * (para / de) ** (t / 0.32), para)
    rng = np.random.default_rng(7)
    y = bandpass(rng.uniform(-1, 1, len(t)), f, 1.4)
    return y * envelope(t, [(0, 1e-4), (0.07, 0.6), (0.36, 1e-4)])


PENTA = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093]


def brilho(n):
    t = np.arange(int(SR * 1.6)) / SR
    y = np.zeros_like(t)
    for i in range(n):
        q = i * 0.075
        freq = PENTA[i + (1 if n >= 4 else 0)]
        for r, p, qd in [(1, 1, 1), (2.76, 0.45, 0.55), (5.4, 0.22, 0.35), (8.93, 0.1, 0.2)]:
            fim = q + 0.9 * qd
            y += np.sin(2 * np.pi * freq * r * t) * envelope(t, [(q, 1e-4), (q + 0.006, 0.02 * p), (fim, 1e-4)]) * (t < fim + 0.02)
    return y


def main():
    TMP.mkdir(exist_ok=True)
    SAIDA.mkdir(parents=True, exist_ok=True)
    sons = {nome: recortar(ler(SITE / arq)) for nome, arq in ARQUIVOS.items()}
    sons["zoomPerto"] = sopro(True)
    for n in range(1, 6):
        sons[f"brilho{n}"] = brilho(n)
    for nome, s in sons.items():
        s = s * 10 ** ((ALVO + AJUSTE.get(nome, 0) - percebido(s)) / 20)
        pico = np.abs(s).max()
        if pico > 0.97:
            s *= 0.97 / pico
        # Som de pico alto e corpo fraco, como o rugido: uma saturação suave
        # engorda o corpo sem estourar, e num rugido ainda soa como garganta
        for _ in range(4):
            if percebido(s) > ALVO + AJUSTE.get(nome, 0) - 3:
                break
            s = np.tanh(2.5 * s / np.abs(s).max()) / np.tanh(2.5) * 0.97
        w = wave.open(str(SAIDA / f"{nome}.wav"), "wb")
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((s * 32767).astype(np.int16).tobytes())
        w.close()
        print(f"{nome:12s} {len(s) / SR:.2f}s  pico {20 * np.log10(np.abs(s).max()):5.1f} dB  percebido {percebido(s):5.1f}")


if __name__ == "__main__":
    main()
