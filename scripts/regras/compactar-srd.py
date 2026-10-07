"""
Converte um arquivo do SRD 5.2.1 em markdown enxuto (tabelas com "|" em vez
de HTML), para servir de base à tradução de content/regras/.

Fonte: https://github.com/downfallx/dnd-5e-srd-markdown
SRD 5.2.1 da Wizards of the Coast, licença Creative Commons Attribution 4.0.

Uso:  python3 scripts/regras/compactar-srd.py rules-glossary.md glossario.md
"""

import re
import sys
from html import unescape
from pathlib import Path


def tabela(html):
    linhas = re.findall(r"<tr>(.*?)</tr>", html, re.S)
    saida = []
    for i, linha in enumerate(linhas):
        celulas = [unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", c)).strip())
                   for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", linha, re.S)]
        saida.append("| " + " | ".join(celulas) + " |")
        if i == 0:
            saida.append("|" + "---|" * len(celulas))
    return "\n".join(saida)


texto = Path(sys.argv[1]).read_text()
texto = re.sub(r"<table>.*?</table>", lambda m: tabela(m.group(0)), texto, flags=re.S)
texto = texto.replace("• ", "- ")
destino = Path(__file__).resolve().parent / "en" / sys.argv[2]
destino.write_text(texto)
print(destino.name, len(texto))
