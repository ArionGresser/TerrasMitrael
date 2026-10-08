"""
Traz artes prontas de uma pasta qualquer para o site, já no tamanho certo.

    python3 scripts/arte/importar.py "/Users/.../Downloads/Artes prontas"

O nome do arquivo diz o que ele é. Por enquanto, as magias do Grimório:

    bola-de-fogo.png     → ícone (quadrado): 512 px, mais a miniatura de 128 px
                            que a lista do Grimório usa
    bola-de-fogo-1.png   → ilustração de uso (até -3): 1600 × 900

Os originais ficam onde estão; o site recebe a versão em WebP, bem mais leve.
Importar de novo um arquivo com o mesmo nome substitui a versão antiga.
No fim, a lista de artes do Grimório é atualizada.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
ICONES = RAIZ / "public/images/magias/icones"
MINIATURAS = ICONES / "mini"
ILUSTRACOES = RAIZ / "public/images/magias/ilustracoes"
ENTRADAS = {".png", ".jpg", ".jpeg", ".webp"}

MAGIAS = {m["slug"] for m in json.loads((RAIZ / "content/magias/magias.json").read_text())}


def salvar(imagem, destino, largura, altura, qualidade):
    """Corta no centro para a proporção pedida e salva em WebP."""
    w, h = imagem.size
    alvo = largura / altura
    if w / h > alvo:
        novo = round(h * alvo)
        imagem = imagem.crop(((w - novo) // 2, 0, (w - novo) // 2 + novo, h))
    elif w / h < alvo:
        novo = round(w / alvo)
        imagem = imagem.crop((0, (h - novo) // 2, w, (h - novo) // 2 + novo))
    destino.parent.mkdir(parents=True, exist_ok=True)
    imagem.resize((largura, altura), Image.LANCZOS).save(
        destino, "WEBP", quality=qualidade, method=6
    )


def importar(pasta):
    icones, ilustracoes, desconhecidos, avisos = [], [], [], []
    for arquivo in sorted(pasta.iterdir()):
        if arquivo.suffix.lower() not in ENTRADAS:
            continue
        nome = arquivo.stem.strip().lower()
        imagem = Image.open(arquivo).convert("RGB")
        w, h = imagem.size
        cena = re.fullmatch(r"(.+)-([123])", nome)

        if nome in MAGIAS:
            if abs(w - h) > max(w, h) * 0.05:
                avisos.append(f"{arquivo.name}: ícone não é quadrado ({w}×{h}), cortei o centro")
            salvar(imagem, ICONES / f"{nome}.webp", 512, 512, 82)
            salvar(imagem, MINIATURAS / f"{nome}.webp", 128, 128, 80)
            icones.append(nome)
        elif cena and cena.group(1) in MAGIAS:
            if w / h < 1.5:
                avisos.append(f"{arquivo.name}: ilustração não é larga ({w}×{h}), cortei para 16:9")
            salvar(imagem, ILUSTRACOES / f"{nome}.webp", 1600, 900, 80)
            ilustracoes.append(nome)
        else:
            desconhecidos.append(arquivo.name)

    print(f"Ícones: {len(icones)}  ·  Ilustrações: {len(ilustracoes)}")
    for aviso in avisos:
        print("  aviso:", aviso)
    if desconhecidos:
        print("Não reconheci estes nomes (nenhuma magia com esse endereço):")
        for d in desconhecidos:
            print("  ", d)

    subprocess.run([sys.executable, str(RAIZ / "scripts/magias/arte/gerar-lista.py")], check=True)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    importar(Path(sys.argv[1]).expanduser())
