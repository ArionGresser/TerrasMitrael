"""
Gera a lista de artes do Grimório: o nome de cada magia, o arquivo que o
site espera e um prompt pronto para pedir a uma IA de imagem.

    python3 scripts/magias/arte/gerar-lista.py

Escreve LISTA-DE-ARTES.md (para ler) e lista-de-artes.csv (para abrir em
planilha) nesta mesma pasta, e marca quais artes já chegaram.
"""

import csv
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
AQUI = Path(__file__).resolve().parent
PUBLICO = RAIZ / "public"

ESTILO_ICONE = (
    "fantasy RPG spell icon, {chave}, single centered emblem, painterly "
    "hand-painted style, rich colors, dark vignette background, {cor} glow, "
    "square, no text, no border"
)
ESTILO_CENA = (
    "medieval fantasy illustration of {quem} casting the spell {nome}: "
    "{chave}, dramatic lighting, painterly D&D book art, wide 16:9, no text"
)

# A cor de cada escola, para o conjunto de ícones ficar coeso.
COR = {
    "Abjuração": "pale blue",
    "Adivinhação": "silver and white",
    "Conjuração": "golden yellow",
    "Encantamento": "pink and magenta",
    "Evocação": "fiery orange and red",
    "Ilusão": "violet",
    "Necromancia": "sickly green and black",
    "Transmutação": "emerald green and amber",
}

QUEM = {
    "Bardo": "a bard",
    "Bruxo": "a warlock",
    "Clérigo": "a cleric",
    "Druida": "a druid",
    "Feiticeiro": "a sorcerer",
    "Mago": "a wizard",
    "Paladino": "a paladin",
    "Patrulheiro": "a ranger",
}


def ler_chaves():
    chaves = {}
    for linha in (AQUI / "palavras-chave.txt").read_text().splitlines():
        if linha.startswith("#") or "|" not in linha:
            continue
        nome, chave = (x.strip() for x in linha.split("|", 1))
        chaves[nome] = chave
    return chaves


def existe(base):
    return any((PUBLICO / f"{base}{ext}").exists() for ext in (".webp", ".jpg", ".png"))


def main():
    magias = json.loads((RAIZ / "content/magias/magias.json").read_text())
    chaves = ler_chaves()
    linhas = []
    for m in sorted(magias, key=lambda m: (m["nivel"], m["nome"])):
        chave = chaves[m["original"]]
        quem = QUEM.get(m["classes"][0], "a spellcaster") if m["classes"] else "a spellcaster"
        linhas.append({
            "circulo": "Truque" if m["nivel"] == 0 else f"{m['nivel']}º círculo",
            "nome": m["nome"],
            "ingles": m["original"],
            "escola": m["escola"],
            "icone": f"public/images/magias/icones/{m['slug']}.webp",
            "ilustracao": f"public/images/magias/ilustracoes/{m['slug']}-1.webp",
            "tem_icone": existe(f"images/magias/icones/{m['slug']}"),
            "tem_ilustracao": existe(f"images/magias/ilustracoes/{m['slug']}-1"),
            "palavras": chave,
            "prompt_icone": ESTILO_ICONE.format(chave=chave, cor=COR[m["escola"]]),
            "prompt_cena": ESTILO_CENA.format(quem=quem, nome=m["original"], chave=chave),
        })

    with open(AQUI / "lista-de-artes.csv", "w", newline="", encoding="utf-8") as f:
        campos = ["circulo", "nome", "ingles", "escola", "icone", "ilustracao",
                  "palavras", "prompt_icone", "prompt_cena"]
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(linhas)

    feitos_i = sum(l["tem_icone"] for l in linhas)
    feitos_c = sum(l["tem_ilustracao"] for l in linhas)
    md = [
        "# Lista de artes do Grimório",
        "",
        "Gerada por `scripts/magias/arte/gerar-lista.py`. Não edite à mão: as palavras-chave",
        "ficam em `palavras-chave.txt`, e o resto sai do grimório.",
        "",
        f"**Ícones prontos:** {feitos_i} de {len(linhas)} · **Ilustrações prontas:** {feitos_c} de {len(linhas)}",
        "",
        "## Como entregar uma arte",
        "",
        "1. Gere a imagem e salve com o nome exato da coluna **Arquivo** (o fim do caminho).",
        "2. **Ícone:** quadrado, 512 × 512, de preferência `.webp` (`.jpg` e `.png` também servem).",
        "3. **Ilustração de uso:** larga, 16:9, uns 1600 × 900. Cabem até três por magia:",
        "   `nome-da-magia-1.webp`, `-2.webp` e `-3.webp`.",
        "4. Solte o arquivo na pasta `public/images/magias/icones/` ou `public/images/magias/ilustracoes/`.",
        "   O site acha sozinho na próxima publicação, sem mexer em código.",
        "",
        "## Os prompts",
        "",
        "Cada magia tem **palavras-chave** em inglês (as IAs de imagem entendem melhor).",
        "Para buscar referência, as palavras-chave sozinhas já servem. Para pedir a uma IA,",
        "encaixe-as num dos modelos abaixo. A cor muda com a escola, para o conjunto ficar coeso.",
        "Os prompts já montados, um por magia, estão em `lista-de-artes.csv`, que abre no Excel",
        "ou no Google Planilhas.",
        "",
        "**Ícone:**",
        "",
        "```",
        ESTILO_ICONE.format(chave="<palavras-chave>", cor="<cor da escola>"),
        "```",
        "",
        "**Ilustração de uso:**",
        "",
        "```",
        ESTILO_CENA.format(quem="<a wizard, a cleric...>", nome="<nome em inglês>", chave="<palavras-chave>"),
        "```",
        "",
        "| Escola | Cor |",
        "|---|---|",
        *[f"| {e} | {c} |" for e, c in COR.items()],
        "",
    ]
    atual = None
    for l in linhas:
        if l["circulo"] != atual:
            atual = l["circulo"]
            md += ["", f"## {'Truques' if atual == 'Truque' else atual}", "",
                   "| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |",
                   "|---|---|---|---|---|---|"]
        marca = ("I" if l["tem_icone"] else "·") + ("C" if l["tem_ilustracao"] else "·")
        arquivo = Path(l["icone"]).stem
        md.append(f"| {marca} | {l['nome']} | {l['ingles']} | {l['escola']} | `{arquivo}` | {l['palavras']} |")
    md += ["", "Na coluna ✓, **I** quer dizer que o ícone já chegou e **C** que a ilustração já chegou.", ""]
    (AQUI / "LISTA-DE-ARTES.md").write_text("\n".join(md), encoding="utf-8")
    print(f"{len(linhas)} magias, {feitos_i} ícones e {feitos_c} ilustrações prontos.")


if __name__ == "__main__":
    main()
