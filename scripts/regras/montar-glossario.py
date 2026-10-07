"""
Junta a tradução do glossário (scripts/regras/pt/glossario-*.md) em
content/regras/glossario.md, em ordem alfabética, separada por letra, e
transforma cada "Veja também" em links para os verbetes citados.

    python3 scripts/regras/montar-glossario.py
"""

import re
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
AQUI = Path(__file__).resolve().parent


def sem_acento(texto):
    return unicodedata.normalize("NFD", texto).encode("ascii", "ignore").decode()


def ancora(texto):
    return re.sub(r"[^a-z0-9]+", "-", sem_acento(texto).lower()).strip("-")


verbetes = []
for arquivo in sorted((AQUI / "pt").glob("glossario-*.md")):
    for bloco in re.split(r"^## ", arquivo.read_text(), flags=re.M)[1:]:
        titulo, corpo = bloco.split("\n", 1)
        verbetes.append((titulo.strip(), corpo.strip()))

# O nome de cada verbete sem a marca [Condição], [Ação]...
nomes = {re.sub(r"\s*\[.*\]$", "", t): ancora(t) for t, _ in verbetes}


def ligar(lista):
    partes = re.split(r"(, | e )", lista.rstrip("."))
    saida = []
    for parte in partes:
        nome = parte.strip()
        saida.append(f"[{nome}](#{nomes[nome]})" if nome in nomes else parte)
    return "".join(saida) + "."


def com_links(corpo):
    return re.sub(r"_Veja também_ ([^\n]+)", lambda m: "_Veja também_ " + ligar(m.group(1)), corpo)


verbetes.sort(key=lambda v: sem_acento(v[0]).lower())
saida = [(RAIZ / "scripts/regras/pt/glossario-abertura.md").read_text().strip(), ""]
letra = None
for titulo, corpo in verbetes:
    inicial = sem_acento(titulo)[0].upper()
    if inicial != letra:
        letra = inicial
        saida += [f"# {letra}", ""]
    saida += [f"## {titulo}", "", com_links(corpo), ""]

(RAIZ / "content/regras/glossario.md").write_text("\n".join(saida))
faltando = sorted({n for _, c in verbetes for n in re.findall(r"_Veja também_ ([^\n]+)", c)})
print(len(verbetes), "verbetes")
for linha in faltando:
    for nome in re.split(r", | e ", linha.rstrip(".")):
        if nome.strip() not in nomes:
            print("sem verbete:", nome)
