"""
Monta a Mesa de Sons: um HTML com todos os sons dos pacotes CC0 e a lista
de cada tela e ação do site, para escolher de ouvido qual som vai onde.

Os pacotes ficam em sons-kit/pacotes/ (fora do git):
  kenney/     RPG Audio, do Kenney (kenney.nl)
  rpg/        80 CC0 RPG SFX, de rubberduck (opengameart.org)
  criaturas/  80 CC0 creature SFX, de rubberduck (opengameart.org)

Cada som sai cortado no começo e no fim e igualado pelo volume que o ouvido
percebe (curva A), não pela energia bruta. Pela energia, um rugido grave
empata com uma folha de papel e some no alto-falante do notebook, que não
toca grave. O alvo é o pergaminho do site, que já soa na altura certa.

Uso:  /tmp/venv-arte/bin/python scripts/som/gerar-mesa.py
Sai:  sons-kit/MESA-DE-SONS.html
"""

import base64
import json
import re
import subprocess
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
KIT = RAIZ / "sons-kit"
PACOTES = KIT / "pacotes"
TMP = KIT / "tmp"
SR = 48000

FONTES = [
    ("K", "kenney", "Kenney · RPG Audio"),
    ("R", "rpg", "rubberduck · 80 CC0 RPG SFX"),
    ("C", "criaturas", "rubberduck · 80 CC0 creature SFX"),
]

# Nome em português e grupo, pelo começo do nome do arquivo (o mais longo vence)
NOMES = {
    "K": {
        "beltHandle": ("Fivela de cinto", "Couro e pano"),
        "bookClose": ("Livro fechando", "Papel e livros"),
        "bookFlip": ("Folha virando", "Papel e livros"),
        "bookOpen": ("Livro abrindo", "Papel e livros"),
        "bookPlace": ("Livro pousado na mesa", "Papel e livros"),
        "chop": ("Machadada", "Metal e armas"),
        "clothBelt": ("Pano e cinto", "Couro e pano"),
        "cloth": ("Pano", "Couro e pano"),
        "creak": ("Rangido", "Madeira e portas"),
        "doorClose": ("Porta fechando", "Madeira e portas"),
        "doorOpen": ("Porta abrindo", "Madeira e portas"),
        "drawKnife": ("Faca saindo da bainha", "Metal e armas"),
        "dropLeather": ("Couro caindo", "Couro e pano"),
        "footstep": ("Passo", "Passos"),
        "handleCoins": ("Punhado de moedas", "Moedas e pedras"),
        "handleSmallLeather": ("Alça de couro", "Couro e pano"),
        "knifeSlice": ("Corte de faca", "Metal e armas"),
        "metalClick": ("Clique de metal", "Metal e armas"),
        "metalLatch": ("Trinco de metal", "Metal e armas"),
        "metalPot": ("Panela de metal", "Metal e armas"),
    },
    "R": {
        "blade": ("Lâmina", "Metal e armas"),
        "book": ("Livro / folha", "Papel e livros"),
        "chain": ("Corrente", "Metal e armas"),
        "creature_die": ("Criatura morrendo", "Criaturas"),
        "creature_hurt": ("Criatura ferida", "Criaturas"),
        "creature_misc": ("Criatura", "Criaturas"),
        "creature_monster": ("Monstro", "Criaturas"),
        "creature_roar": ("Rugido", "Criaturas"),
        "creature_slime": ("Gosma", "Criaturas"),
        "item_coins": ("Moedas", "Moedas e pedras"),
        "item_gem": ("Pedra preciosa", "Moedas e pedras"),
        "item_misc": ("Objeto", "Diversos"),
        "item_stone": ("Pedra", "Moedas e pedras"),
        "item_wood": ("Objeto de madeira", "Madeira e portas"),
        "lock": ("Fechadura", "Metal e armas"),
        "metal": ("Metal", "Metal e armas"),
        "misc": ("Diversos", "Diversos"),
        "spell_fire": ("Feitiço de fogo", "Magia"),
        "spell": ("Feitiço", "Magia"),
        "stones": ("Pedras rolando", "Moedas e pedras"),
        "wood": ("Madeira", "Madeira e portas"),
    },
    "C": {
        "alien": ("Criatura estranha", "Criaturas"),
        "barking": ("Latido", "Criaturas"),
        "breath": ("Respiração", "Criaturas"),
        "bug": ("Inseto", "Criaturas"),
        "burble": ("Borbulhar", "Criaturas"),
        "burp": ("Arroto", "Criaturas"),
        "cough": ("Tosse", "Criaturas"),
        "cute": ("Bichinho fofo", "Criaturas"),
        "eat": ("Comendo", "Criaturas"),
        "grunt": ("Grunhido", "Criaturas"),
        "howl": ("Uivo", "Criaturas"),
        "hurt": ("Dor", "Criaturas"),
        "misc": ("Criatura (diversos)", "Criaturas"),
        "monster": ("Monstro", "Criaturas"),
        "nose": ("Fungada", "Criaturas"),
        "ooh": ("Ooh", "Criaturas"),
        "roar": ("Rugido", "Criaturas"),
        "scream": ("Grito", "Criaturas"),
        "snore": ("Ronco", "Criaturas"),
        "spit": ("Cuspe", "Criaturas"),
        "troll": ("Troll", "Criaturas"),
        "weird": ("Esquisito", "Criaturas"),
    },
}


def nome_de(pref: str, arquivo: str) -> tuple[str, str]:
    base = arquivo.rsplit(".", 1)[0]
    chaves = sorted(NOMES[pref], key=len, reverse=True)
    for c in chaves:
        if base.startswith(c):
            nome, grupo = NOMES[pref][c]
            num = re.findall(r"\d+", base[len(c):])
            return (f"{nome} {int(num[-1])}" if num else nome), grupo
    return base, "Diversos"


def ler(caminho: Path) -> np.ndarray:
    saida = TMP / (caminho.stem + "-" + caminho.parent.name + ".wav")
    subprocess.run(
        ["afconvert", "-f", "WAVE", "-d", f"LEI16@{SR}", "-c", "1", str(caminho), str(saida)],
        check=True,
        capture_output=True,
    )
    w = wave.open(str(saida))
    return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768


def peso_a(f: np.ndarray) -> np.ndarray:
    """A curva A: o quanto o ouvido escuta de cada frequência."""
    f2 = f**2
    r = (12194**2 * f2**2) / (
        (f2 + 20.6**2) * np.sqrt((f2 + 107.7**2) * (f2 + 737.9**2)) * (f2 + 12194**2)
    )
    return r / r[np.argmin(np.abs(f - 1000))]


def volume_percebido(s: np.ndarray) -> float:
    espectro = np.abs(np.fft.rfft(s)) ** 2
    f = np.fft.rfftfreq(len(s), 1 / SR)
    return 10 * np.log10((espectro * peso_a(np.maximum(f, 1)) ** 2).sum() / len(s) ** 2 + 1e-12)


def recortar(a: np.ndarray) -> np.ndarray:
    jan = int(SR * 0.005)
    n = len(a) // jan
    db = 20 * np.log10(np.sqrt((a[: n * jan].reshape(n, jan) ** 2).mean(1)) + 1e-9)
    pico = db.max()
    ini = max(0, np.argmax(db > pico - 35) - 2) * jan
    fim = min(len(a), (n - np.argmax(db[::-1] > pico - 45) + 5) * jan)
    s = a[ini:fim].copy()[: int(SR * 2.5)]
    fi, fo = int(0.003 * SR), min(int(0.02 * SR), len(s) // 4)
    s[:fi] *= np.linspace(0, 1, fi)
    s[-fo:] *= np.linspace(1, 0, fo)
    return s


def codificar(s: np.ndarray, nome: str) -> str:
    wav = TMP / f"{nome}.wav"
    m4a = TMP / f"{nome}.m4a"
    w = wave.open(str(wav), "wb")
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(s, -1, 1) * 32767).astype(np.int16).tobytes())
    w.close()
    subprocess.run(
        ["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", str(wav), str(m4a)],
        check=True,
        capture_output=True,
    )
    return base64.b64encode(m4a.read_bytes()).decode()


def main():
    TMP.mkdir(parents=True, exist_ok=True)

    # O alvo: o pergaminho do site, no trecho que ele toca
    pergaminho = recortar(ler(RAIZ / "public/sons/pergaminho-abrir.mp3"))
    alvo = volume_percebido(pergaminho)

    sons = []

    def adicionar(codigo, origem, arquivo, nome, grupo, a):
        s = recortar(a)
        s *= 10 ** ((alvo - volume_percebido(s)) / 20)
        pico = np.abs(s).max()
        if pico > 0.95:
            s *= 0.95 / pico
        sons.append(
            {
                "codigo": codigo,
                "origem": origem,
                "arquivo": arquivo,
                "nome": nome,
                "grupo": grupo,
                "dur": round(len(s) / SR, 2),
                "dados": codificar(s, codigo),
            }
        )

    for i, (arq, nome) in enumerate(
        [("pergaminho-abrir.mp3", "Pergaminho abrindo"), ("pergaminho-fechar.mp3", "Pergaminho fechando")], 1
    ):
        adicionar(f"P{i}", "site", arq, nome, "Papel e livros", ler(RAIZ / "public/sons" / arq))

    for pref, pasta, origem in FONTES:
        arquivos = sorted((PACOTES / pasta).glob("*.ogg"), key=lambda p: p.name.lower())
        for i, p in enumerate(arquivos, 1):
            nome, grupo = nome_de(pref, p.name)
            adicionar(f"{pref}{i:02d}", origem, p.name, nome, grupo, ler(p))
            print(f"{pref}{i:02d} {p.name}")

    html = (Path(__file__).parent / "mesa-modelo.html").read_text()
    html = html.replace("__SONS__", json.dumps(sons, ensure_ascii=False))
    destino = KIT / "MESA-DE-SONS.html"
    destino.write_text(html)
    print(f"{len(sons)} sons · {destino.stat().st_size / 1e6:.1f} MB → {destino}")


if __name__ == "__main__":
    main()
