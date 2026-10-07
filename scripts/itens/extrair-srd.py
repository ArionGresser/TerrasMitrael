"""
Extrai os itens mágicos do SRD 5.2.1 (scripts/regras/en/itens-magicos.md,
gerado por scripts/regras/compactar-srd.py) para um JSON em inglês, base da
tradução em scripts/itens/traducao/.

    python3 scripts/itens/extrair-srd.py
"""

import json
import re
from pathlib import Path

AQUI = Path(__file__).resolve().parent
texto = (AQUI.parent / "regras/en/itens-magicos.md").read_text()
az = texto.split("## Magic Items A–Z", 1)[1]
itens = []
for bloco in re.split(r"^#### ", az, flags=re.M)[1:]:
    nome, corpo = bloco.split("\n", 1)
    corpo = corpo.strip()
    linha, _, resto = corpo.partition("\n")
    linha = linha.strip().strip("_")
    # Fichas de criatura dentro de um item (a Mosca Gigante da Estatueta,
    # o Avatar da Morte do Baralho) vêm como verbete solto: voltam para o item
    if re.match(r"(Tiny|Small|Medium|Large|Huge|Gargantuan) ", linha):
        itens[-1]["texto"] += f"\n\n#### {nome.strip()}\n\n_{linha}_\n\n{resto.strip()}"
        continue
    itens.append({"nome": nome.strip(), "linha": linha, "texto": resto.strip()})
(AQUI / "srd-5.2.1-itens-en.json").write_text(json.dumps(itens, ensure_ascii=False, indent=1))
print(len(itens), "itens")
print(sum(len(i["texto"]) for i in itens), "caracteres de texto")
