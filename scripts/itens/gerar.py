"""
Monta content/itens/itens.json, a lista de itens mágicos que o site lê.

Junta duas coisas:
  1. srd-5.2.1-itens-en.json: os itens mágicos do SRD 5.2.1 em inglês,
     extraídos por extrair-srd.py. Material da Wizards of the Coast sob
     licença Creative Commons Attribution 4.0 (CC-BY-4.0).
  2. traducao/parte-N.txt: a tradução para o português, escrita à mão.

A categoria, as raridades e a sintonia saem da linha em inglês ("Wondrous
Item, Rare (Requires Attunement)"), para os filtros nunca dependerem de
como a frase foi traduzida. A linha em português ("tipo:") é a que aparece
na página.

Formato de traducao/parte-N.txt:

    === Nome em inglês | Nome em português
    tipo: Item Maravilhoso, Raro (exige Sintonia)
    Texto do item em markdown...

Uso:  python3 scripts/itens/gerar.py
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

PASTA = Path(__file__).parent
RAIZ = PASTA.parent.parent
SAIDA = RAIZ / "content" / "itens" / "itens.json"

CATEGORIAS = {
    "Armor": "Armadura",
    "Potion": "Poção",
    "Ring": "Anel",
    "Rod": "Cetro",
    "Scroll": "Pergaminho",
    "Staff": "Cajado",
    "Wand": "Varinha",
    "Weapon": "Arma",
    "Wondrous Item": "Item Maravilhoso",
}

# Da mais comum para a mais rara; a ordem importa para o filtro
RARIDADES = [
    ("Very Rare", "Muito Raro"),
    ("Uncommon", "Incomum"),
    ("Common", "Comum"),
    ("Rare", "Raro"),
    ("Legendary", "Lendário"),
    ("Artifact", "Artefato"),
]
ORDEM = ["Comum", "Incomum", "Raro", "Muito Raro", "Lendário", "Artefato"]

# Nomes no singular que aparecem em itálico nos textos e devem levar ao item
APELIDOS = {
    "Anéis de Invocar Gênio": "Anel de Invocar Gênio",
    "Anéis de Proteção": "Anel de Proteção",
    "Arma +3": "Arma +1, +2 ou +3",
    "Armadura +1": "Armadura +1, +2 ou +3",
    "Bota de Passos Largos e Saltos": "Botas de Passos Largos e Saltos",
    "Bota Élfica": "Botas Élficas",
    "Contas de Energia": "Conta de Energia",
    "Espada Longa +2": "Arma +1, +2 ou +3",
    "Lança de Cavalaria +1": "Arma +1, +2 ou +3",
    "Munição +3": "Munição +1, +2 ou +3",
    "Pedras Ioun": "Pedra Ioun",
    "Pergaminhos de Magia": "Pergaminho de Magia",
    "Poção de Cura": "Poções de Cura",
}


def slug(nome: str) -> str:
    sem_acento = unicodedata.normalize("NFD", nome)
    sem_acento = "".join(c for c in sem_acento if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")


def raridades(texto: str) -> list[str]:
    """Todas as raridades citadas num trecho em inglês, na ordem de ORDEM."""
    # "can speak Common" é o idioma, não a raridade
    texto = re.sub(r"\b(speaks?|understands?|knows?) Common\b", "", texto)
    achadas = set()
    for en, pt in RARIDADES:
        if re.search(rf"\b{en}\b", texto):
            achadas.add(pt)
            texto = re.sub(rf"\b{en}\b", "", texto)
    return [r for r in ORDEM if r in achadas]


def ler_traducao() -> dict[str, dict]:
    itens = {}
    for arquivo in sorted(PASTA.glob("traducao/parte-*.txt")):
        blocos = re.split(r"^=== ", arquivo.read_text(encoding="utf-8"), flags=re.M)
        for bloco in blocos[1:]:
            cabeca, _, resto = bloco.partition("\n")
            original, _, nome = (p.strip() for p in cabeca.partition("|"))
            linha_tipo, _, texto = resto.partition("\n")
            if not linha_tipo.startswith("tipo: "):
                sys.exit(f"{arquivo.name}: '{original}' sem a linha 'tipo:'")
            if original in itens:
                sys.exit(f"{arquivo.name}: '{original}' traduzido duas vezes")
            itens[original] = {
                "nome": nome,
                "tipo": linha_tipo[6:].strip(),
                "texto": texto.strip(),
            }
    return itens


def main() -> None:
    srd = json.loads((PASTA / "srd-5.2.1-itens-en.json").read_text(encoding="utf-8"))
    traducao = ler_traducao()

    faltando = [i["nome"] for i in srd if i["nome"] not in traducao]
    sobrando = set(traducao) - {i["nome"] for i in srd}
    if faltando or sobrando:
        sys.exit(f"Faltam: {faltando}\nSobram: {sorted(sobrando)}")

    saida = []
    for item in srd:
        pt = traducao[item["nome"]]
        linha = item["linha"]
        categoria = CATEGORIAS[linha.split(",")[0].split(" (")[0]]
        # "Rarity Varies": a raridade de cada versão está na tabela do texto
        lista = raridades(item["texto"] if "Rarity Varies" in linha else linha)
        if not lista:
            sys.exit(f"Sem raridade: {item['nome']}")
        if "—" in pt["texto"] or "—" in pt["nome"]:
            sys.exit(f"Travessão em {item['nome']}")
        saida.append(
            {
                "slug": slug(pt["nome"]),
                "nome": pt["nome"],
                "original": item["nome"],
                "categoria": categoria,
                "raridades": lista,
                "variavel": "Rarity Varies" in linha or len(lista) > 1,
                "sintonia": "Requires Attunement" in linha,
                "tipo": pt["tipo"],
                "texto": pt["texto"],
            }
        )

    slugs = [i["slug"] for i in saida]
    repetidos = {s for s in slugs if slugs.count(s) > 1}
    if repetidos:
        sys.exit(f"Slugs repetidos: {repetidos}")

    nomes = {i["nome"] for i in saida}
    for apelido, alvo in APELIDOS.items():
        if alvo not in nomes:
            sys.exit(f"Apelido aponta para item que não existe: {alvo}")

    saida.sort(key=lambda i: slug(i["nome"]))
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(
        json.dumps({"itens": saida, "apelidos": APELIDOS}, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )
    print(f"{len(saida)} itens em {SAIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
