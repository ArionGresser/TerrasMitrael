"""
Traz artes prontas de uma pasta qualquer para o site, já no tamanho certo.

    python3 scripts/arte/importar.py "/Users/.../Downloads/Artes prontas"

O nome do arquivo diz o que ele é:

    bola-de-fogo.png     → ícone da magia: 512 px, mais a miniatura de 128 px
                            que a lista do Grimório usa (um número na frente,
                            como 106-bola-de-fogo.png, é ignorado)
    bola-de-fogo-1.png   → ilustração de uso da magia (até -3): 1600 × 900
    os nomes do GUIA-DE-ARTES.html (espécies, classes, itens, monstros...):
        16:9      → 1280 × 720, mais uma miniatura quadrada de 160 px
        cena      → 1600 × 900 (Saga, Guerra e locais), mais a miniatura
        carta     → 1400 de altura em WebP, com a transparência (molduras das cartas)
        quadrada  → 512 px, mais a miniatura de 160 px

Os originais ficam onde estão; o site recebe a versão em WebP, bem mais leve.
Importar de novo um arquivo com o mesmo nome substitui a versão antiga.
No fim, a lista do Grimório e o guia de artes são atualizados.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

from catalogo import catalogo

RAIZ = Path(__file__).resolve().parents[2]
ICONES = RAIZ / "public/images/magias/icones"
MINIATURAS = ICONES / "mini"
ILUSTRACOES = RAIZ / "public/images/magias/ilustracoes"
ENTRADAS = {".png", ".jpg", ".jpeg", ".webp"}

IMAGENS = RAIZ / "public/images"

MAGIAS = {m["slug"] for m in json.loads((RAIZ / "content/magias/magias.json").read_text())}

# O nome de entrega de cada arte do guia → a arte (pasta, slug, formato)
# (as magias têm tratamento próprio logo abaixo, por isso ficam de fora)
GUIA = {
    a["entrega"]: a
    for _, _, artes in catalogo()
    for a in artes
    if not a["secao"].startswith("magias/")
}


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


def salvar_carta(imagem, destino, avisos, nome):
    """A moldura de carta: tira a sobra transparente em volta e guarda em
    WebP com a transparência da janela da arte, com 1400 px de altura.

    A proporção fica a que veio, sem esticar (esticar deixa os medalhões
    ovais). O ChatGPT costuma entregar 2:3, que impresso com 88 mm de altura
    dá uma carta de 59 mm de largura, e ainda cabe no sleeve comum."""
    imagem = imagem.convert("RGBA")
    # Sem transparência, o prompt pede a janela da arte em magenta puro:
    # o que for magenta (e o fundo, se também vier assim) vira transparente
    magenta = [(r > 190 and g < 90 and b > 190) for r, g, b, _ in imagem.getdata()]
    if any(magenta):
        imagem.putdata([(0, 0, 0, 0) if m else px for m, px in zip(magenta, imagem.getdata())])
    if imagem.getextrema()[3][0] == 255:
        avisos.append(f"{nome}: veio sem transparência nem magenta; a janela da arte vai precisar de recorte")
    # O recorte olha só o que é carta de verdade: em volta costuma sobrar um
    # resto quase invisível de pintura, que não deve contar como carta
    caixa = imagem.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox()
    if caixa:
        imagem = imagem.crop(caixa)
    w, h = imagem.size
    destino.parent.mkdir(parents=True, exist_ok=True)
    imagem.resize((round(w * 1400 / h), 1400), Image.LANCZOS).save(
        destino.with_suffix(".webp"), "WEBP", quality=90, method=6
    )


def importar(pasta):
    icones, ilustracoes, guia, desconhecidos, avisos = [], [], [], [], []
    for arquivo in sorted(pasta.iterdir()):
        if arquivo.suffix.lower() not in ENTRADAS:
            continue
        # Um número na frente, como "106-espinho-mental", só serve para
        # ordenar a pasta: sai do nome
        nome = re.sub(r"^\d+-", "", arquivo.stem.strip().lower())
        original = Image.open(arquivo)
        imagem = original.convert("RGB")
        w, h = imagem.size
        cena = re.fullmatch(r"(.+)-([123])", nome)

        if nome in MAGIAS:
            if abs(w - h) > max(w, h) * 0.05:
                avisos.append(f"{arquivo.name}: ícone não é quadrado ({w}×{h}), cortei o centro")
            salvar(imagem, ICONES / f"{nome}.webp", 512, 512, 82)
            salvar(imagem, MINIATURAS / f"{nome}.webp", 128, 128, 80)
            icones.append(nome)
        elif nome in GUIA and GUIA[nome]["formato"] == "carta":
            salvar_carta(original, IMAGENS / GUIA[nome]["secao"] / f"{GUIA[nome]['slug']}.png", avisos, arquivo.name)
            guia.append(nome)
        elif nome in GUIA:
            a = GUIA[nome]
            pasta = IMAGENS / a["secao"]
            if a["formato"] in ("largo", "cena"):
                if w / h < 1.5:
                    avisos.append(f"{arquivo.name}: deveria ser deitada ({w}×{h}), cortei para 16:9")
                # As cenas das histórias ocupam a largura do texto: vão maiores
                largura, altura = (1600, 900) if a["formato"] == "cena" else (1280, 720)
                salvar(imagem, pasta / f"{a['slug']}.webp", largura, altura, 80)
            else:
                if abs(w - h) > max(w, h) * 0.05:
                    avisos.append(f"{arquivo.name}: deveria ser quadrada ({w}×{h}), cortei o centro")
                salvar(imagem, pasta / f"{a['slug']}.webp", 512, 512, 82)
            salvar(imagem, pasta / "mini" / f"{a['slug']}.webp", 160, 160, 80)
            guia.append(nome)
        elif cena and cena.group(1) in MAGIAS:
            if w / h < 1.5:
                avisos.append(f"{arquivo.name}: ilustração não é larga ({w}×{h}), cortei para 16:9")
            salvar(imagem, ILUSTRACOES / f"{nome}.webp", 1600, 900, 80)
            ilustracoes.append(nome)
        else:
            desconhecidos.append(arquivo.name)

    print(
        f"Magias: {len(icones)} ícones e {len(ilustracoes)} ilustrações"
        f"  ·  Livro do Aventureiro: {len(guia)} artes"
    )
    for aviso in avisos:
        print("  aviso:", aviso)
    if desconhecidos:
        print("Não reconheci estes nomes (confira no guia de artes):")
        for d in desconhecidos:
            print("  ", d)

    subprocess.run([sys.executable, str(RAIZ / "scripts/magias/arte/gerar-lista.py")], check=True)
    subprocess.run([sys.executable, str(RAIZ / "scripts/arte/gerar-guia.py")], check=True)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    importar(Path(sys.argv[1]).expanduser())
