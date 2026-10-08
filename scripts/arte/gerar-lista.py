"""
Monta scripts/arte/LISTA-DE-ARTES.md: o caminho exato de cada arte do Livro
do Aventureiro (fora o Grimório, que tem a lista dele em scripts/magias/arte),
seção por seção, marcando o que já existe e o que falta.

    python3 scripts/arte/gerar-lista.py

Rode de novo depois de soltar artes novas, para a contagem atualizar.
As regras de quais itens de regra têm arte espelham src/lib/regras-arte.ts:
mudando lá, mude aqui também.
"""

import json
import re
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
PUBLICO = RAIZ / "public"
SAIDA = Path(__file__).resolve().parent / "LISTA-DE-ARTES.md"
FORMATOS = (".webp", ".jpg", ".png")

PRATELEIRAS = {
    "armas-simples-corpo-a-corpo",
    "armas-simples-a-distancia",
    "armas-marciais-corpo-a-corpo",
    "armas-marciais-a-distancia",
    "armaduras-leves",
    "armaduras-medias",
    "armaduras-pesadas",
    "escudo",
    "ferramentas-de-artesao",
    "outras-ferramentas",
    "montarias-e-carga",
    "bardas-e-selas",
    "veiculos-grandes",
}


def ancora(texto):
    """O mesmo de src/lib/regras.ts: "Dádiva do Destino" → "dadiva-do-destino"."""
    sem_acento = unicodedata.normalize("NFD", texto)
    sem_acento = "".join(c for c in sem_acento if not unicodedata.combining(c))
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()))


def existe(pasta, nome):
    return any((PUBLICO / "images" / pasta / f"{nome}{f}").exists() for f in FORMATOS)


def compendio():
    partes = [
        ("classes", "Classes"),
        ("especies", "Espécies"),
        ("antecedentes", "Antecedentes"),
        ("talentos", "Talentos"),
        ("magias", "Grimório"),
        ("equipamento", "Equipamento"),
        ("itens", "Itens Mágicos"),
        ("monstros", "Bestiário"),
        ("glossario", "Glossário de Regras"),
    ]
    return [(nome, "compendio", chave, "largo") for chave, nome in partes]


def especies():
    texto = (RAIZ / "src/lib/especies.ts").read_text()
    pares = re.findall(r'slug: "([^"]+)",\s*nome: "([^"]+)"', texto)
    return [(nome, "especies", slug, "largo") for slug, nome in pares]


def classes():
    linhas = []
    for arquivo in sorted((RAIZ / "content/classes").glob("*.md")):
        nome = re.search(r"^nome: (.+)$", arquivo.read_text(), re.M).group(1)
        linhas.append((nome, "classes", arquivo.stem, "largo"))
    return linhas


def itens():
    dados = json.loads((RAIZ / "content/itens/itens.json").read_text())
    return [(i["nome"], "itens", i["slug"], "quadrado") for i in dados["itens"]]


def monstros():
    dados = json.loads((RAIZ / "content/monstros/monstros.json").read_text())
    return [(m["nome"], "monstros", m["slug"], "largo") for m in dados]


def regras(documento):
    linhas = []
    grupo = None
    for linha in (RAIZ / f"content/regras/{documento}.md").read_text().split("\n"):
        if linha.startswith("# "):
            grupo = linha[2:].strip()
        elif linha.startswith("## "):
            titulo = linha[3:].strip()
            item = ancora(titulo)
            if documento in ("antecedentes", "talentos"):
                formato = "largo"
            elif grupo == "Equipamento de Aventura":
                formato = "quadrado"
            elif item in PRATELEIRAS:
                formato = "largo"
            else:
                continue
            linhas.append((titulo, f"regras/{documento}", item, formato))
    return linhas


SECOES = [
    ("Cartões do Livro do Aventureiro", compendio),
    ("Espécies", especies),
    ("Classes", classes),
    ("Antecedentes", lambda: regras("antecedentes")),
    ("Talentos", lambda: regras("talentos")),
    ("Equipamento", lambda: regras("equipamento")),
    ("Itens Mágicos", itens),
    ("Bestiário", monstros),
]

FORMATO = {"largo": "16:9", "quadrado": "quadrada"}


def montar():
    blocos = []
    resumo = []
    for titulo, fonte in SECOES:
        linhas = fonte()
        prontas = sum(existe(p, n) for _, p, n, _ in linhas)
        resumo.append(f"| {titulo} | {prontas} de {len(linhas)} |")
        tabela = [
            f"## {titulo}",
            "",
            "| | Nome | Arquivo | Formato |",
            "|---|---|---|---|",
        ]
        for nome, pasta, arquivo, formato in linhas:
            marca = "✅" if existe(pasta, arquivo) else "⬜"
            tabela.append(
                f"| {marca} | {nome} | `public/images/{pasta}/{arquivo}.webp` | {FORMATO[formato]} |"
            )
        blocos.append("\n".join(tabela))

    cabeca = f"""# Lista de artes do Livro do Aventureiro

Gerada por `scripts/arte/gerar-lista.py`. Não edite à mão: rode o script de
novo depois de soltar artes, para atualizar as marcas. As magias do Grimório
têm a lista delas em `scripts/magias/arte/LISTA-DE-ARTES.md`.

## Como entregar uma arte

1. Salve com o nome exato da coluna **Arquivo**. Pode ser `.webp`, `.jpg` ou `.png`.
2. **16:9:** imagem deitada, uns 1600 × 900.
3. **Quadrada:** 512 × 512 ou mais, com o objeto no centro.
4. Solte o arquivo na pasta indicada. O site acha sozinho no próximo build,
   sem mexer em código.

| Seção | Prontas |
|---|---|
{chr(10).join(resumo)}
"""
    return cabeca + "\n" + "\n\n".join(blocos) + "\n"


if __name__ == "__main__":
    SAIDA.write_text(montar())
    print(SAIDA)
