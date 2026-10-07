"""
Junta a tradução do equipamento em content/regras/equipamento.md:
a base (moedas, armas, armaduras, ferramentas), o equipamento de aventura
em ordem alfabética, com preço e peso embaixo do nome, e o final
(montarias, custo de vida, itens mágicos, fabricação).

    python3 scripts/regras/montar-equipamento.py
"""

import re
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
PT = Path(__file__).resolve().parent / "pt"


def chave(texto):
    return unicodedata.normalize("NFD", texto).encode("ascii", "ignore").decode().lower()


itens = []
for bloco in re.split(r"^## ", (PT / "equipamento-itens.md").read_text(), flags=re.M)[1:]:
    cabeca, corpo = bloco.split("\n", 1)
    nome, preco, peso = [c.strip() for c in cabeca.split("|")]
    itens.append((nome, preco, peso, corpo.strip()))
itens.sort(key=lambda i: chave(i[0]))

saida = [(PT / "equipamento-base.md").read_text().strip(), "", "# Equipamento de Aventura", ""]
saida += [
    "O equipamento que os aventureiros costumam achar útil, em ordem alfabética, com o preço e o peso de cada item.",
    "",
]
for nome, preco, peso, corpo in itens:
    saida += [f"## {nome}", "", f"_{preco} · {peso}_" if peso != "–" else f"_{preco}_", "", corpo, ""]
saida += [(PT / "equipamento-final.md").read_text().strip(), ""]

(RAIZ / "content/regras/equipamento.md").write_text("\n".join(saida))
print(len(itens), "itens de aventura")
