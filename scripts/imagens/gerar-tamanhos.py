"""
Gera as versões menores das imagens do site, para o celular não baixar a
arte inteira quando ela aparece pequena.

Para cada imagem de public/images com mais de 300 px de largura, grava em
public/tamanhos/ (mesmo caminho) cópias em WebP com 256, 384, 480, 828 e 1280 px
de largura, só as que forem bem menores que a original (até 80% dela). Se a original não for
WebP (JPG ou PNG), grava também uma cópia em WebP do tamanho dela, que
costuma ter metade do peso.

No fim, escreve src/lib/tamanhos-das-imagens.json: a lista de larguras de
cada imagem. É dela que src/lib/carregador-de-imagem.ts escolhe o arquivo
certo para cada tela. Imagem sem entrada na lista sai como sempre saiu.

Só refaz o que mudou: se a cópia é mais nova que a original, fica.

Uso, depois de pôr imagens novas em public/images:
    python3 scripts/imagens/gerar-tamanhos.py
(precisa do Pillow: pip install pillow)
"""

import json
import os
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
ORIGEM = RAIZ / "public" / "images"
DESTINO = RAIZ / "public" / "tamanhos" / "images"
LISTA = RAIZ / "src" / "lib" / "tamanhos-das-imagens.json"

LARGURAS = [256, 384, 480, 828, 1280]
MINIMA = 300
QUALIDADE = 78
# As miniaturas dos itens já são pequenas de propósito
PULAR = {"mini"}
# Os retratos dos personagens são desenho a nanquim, de traço fino: na
# qualidade de sempre a compressão borra as linhas e enche de blocos. Saem
# com mais qualidade e ganham também a cópia de 828 px, para a lista no
# computador não precisar baixar a de 1024.
NITIDAS = {"personagens"}
QUALIDADE_NITIDA = 88


def main() -> None:
    lista: dict[str, list[int]] = {}
    gravadas: set[Path] = set()
    feitas = antes = depois = 0
    for raiz, pastas, arquivos in os.walk(ORIGEM):
        pastas[:] = [p for p in pastas if p not in PULAR]
        for nome in sorted(arquivos):
            if not nome.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            original = Path(raiz) / nome
            try:
                imagem = Image.open(original)
                largura, altura = imagem.size
            except Exception as erro:  # arquivo quebrado: segue sem ele
                print(f"pulei {original}: {erro}", file=sys.stderr)
                continue
            if largura <= MINIMA:
                continue

            relativo = original.relative_to(ORIGEM)
            ehwebp = nome.lower().endswith(".webp")
            nitida = relativo.parts[0] in NITIDAS
            qualidade = QUALIDADE_NITIDA if nitida else QUALIDADE
            # Só vale a cópia que fica bem menor: 480 px de uma arte de 512 quase
            # não economiza e só ocupa espaço
            alvos = [w for w in LARGURAS if w <= largura * (0.82 if nitida else 0.8)]
            if not ehwebp:
                alvos.append(largura)
            if not alvos:
                continue

            for w in alvos:
                saida = DESTINO / relativo.parent / f"{relativo.stem}.w{w}.webp"
                gravadas.add(saida)
                if not (saida.exists() and saida.stat().st_mtime >= original.stat().st_mtime):
                    saida.parent.mkdir(parents=True, exist_ok=True)
                    copia = imagem.convert("RGBA" if imagem.mode in ("RGBA", "LA", "P") else "RGB")
                    if w != largura:
                        copia = copia.resize((w, round(altura * w / largura)), Image.LANCZOS)
                    copia.save(saida, "WEBP", quality=qualidade, method=6)
                    feitas += 1
            antes += original.stat().st_size
            depois += min((DESTINO / relativo.parent / f"{relativo.stem}.w{w}.webp").stat().st_size for w in alvos)
            lista["/images/" + relativo.as_posix()] = alvos

    # As cópias de imagens que saíram ou de tamanhos que não valem mais
    sobras = [f for f in DESTINO.rglob("*.webp") if f not in gravadas]
    for f in sobras:
        f.unlink()
    for pasta in sorted(DESTINO.rglob("*"), reverse=True):
        if pasta.is_dir() and not any(pasta.iterdir()):
            pasta.rmdir()
    if sobras:
        print(f"{len(sobras)} cópias antigas apagadas")

    LISTA.write_text(json.dumps(lista, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n")
    print(f"{len(lista)} imagens com versões menores ({feitas} arquivos novos)")
    print(f"menor versão de cada uma somada: {depois // 1024} KB, contra {antes // 1024} KB das originais")


if __name__ == "__main__":
    main()
