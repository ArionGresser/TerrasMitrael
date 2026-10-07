"""
Separa o classes.md do SRD 5.2.1 em um arquivo por classe, em markdown
enxuto (tabelas com "|" em vez de HTML), para servir de base à tradução.

Fonte: https://github.com/downfallx/dnd-5e-srd-markdown (classes.md),
SRD 5.2.1 da Wizards of the Coast, licença Creative Commons Attribution 4.0.

Uso:  python3 scripts/classes/separar-srd.py classes.md

As listas de magias de cada classe ficam de fora: o site monta essas listas
a partir do grimório.
"""

import re
import sys
from html import unescape
from pathlib import Path

AQUI = Path(__file__).resolve().parent


def tabela(html):
    linhas = re.findall(r"<tr>(.*?)</tr>", html, re.S)
    saida = []
    for i, linha in enumerate(linhas):
        celulas = [unescape(re.sub(r"\s+", " ", c).strip())
                   for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", linha, re.S)]
        saida.append("| " + " | ".join(celulas) + " |")
        if i == 0:
            saida.append("|" + "---|" * len(celulas))
    return "\n".join(saida)


def main():
    texto = Path(sys.argv[1]).read_text()
    texto = re.sub(r"<table>.*?</table>", lambda m: tabela(m.group(0)), texto, flags=re.S)
    texto = texto.replace("• ", "- ")
    classes = re.split(r"^## ", texto, flags=re.M)[1:]
    for bloco in classes:
        nome = bloco.split("\n", 1)[0].strip()
        # Corta a lista de magias da classe, que vem do grimório
        bloco = re.sub(r"^### \w+ Spell List\n.*?(?=^### )", "", bloco, flags=re.S | re.M)
        arquivo = AQUI / "en" / f"{nome.lower()}.md"
        arquivo.write_text("## " + bloco.strip() + "\n")
        print(f"{arquivo.name}: {len(bloco)} caracteres")


if __name__ == "__main__":
    main()
