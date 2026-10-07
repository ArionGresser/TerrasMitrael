"""
Separa as fichas de monstros e animais do SRD 5.2.1 em dados.

Lê scripts/regras/en/monstros.md e animais.md (gerados por
scripts/regras/compactar-srd.py) e grava srd-5.2.1-monstros-en.json, uma
ficha por criatura: cabeçalho (CA, PV, deslocamento...), atributos e as
seções de traços e ações, cada uma com as suas entradas.

Material da Wizards of the Coast sob licença Creative Commons Attribution
4.0 (CC-BY-4.0).

Uso:  python3 scripts/monstros/extrair-srd.py
"""

import json
import re
from pathlib import Path

PASTA = Path(__file__).parent
EN = PASTA.parent / "regras" / "en"

SECOES = ["Traits", "Actions", "Bonus Actions", "Reactions", "Legendary Actions"]


def limpar(texto: str) -> str:
    """Tira o HTML que veio do SRD: <br>, &emsp; e <hr>."""
    texto = re.sub(r"\s*<br>\s*&emsp;", "\n\n", texto)
    texto = texto.replace("<br>", "").replace("<hr>", "").replace("&emsp;", "")
    return re.sub(r"\n{3,}", "\n\n", texto).strip()


def ficha(nome: str, grupo: str | None, fonte: str, corpo: str) -> dict:
    linhas = corpo.strip().split("\n")
    linha = linhas[0].strip().strip("_")

    # Cabeçalho até a tabela de atributos, campos até a primeira seção
    cab = corpo.split("|  |", 1)[0]
    tabela = re.findall(r"^\| (STR|INT) .*$", corpo, re.M)
    atributos = {}
    for t in re.findall(r"^\| (?:STR|INT) .*\|$", corpo, re.M):
        # Duas fichas do SRD têm a tabela torta ("DEX | DEX | 10 +0"); juntar
        # tudo numa linha só e tirar as repetições resolve as duas.
        linha_t = " ".join(c.strip() for c in t.strip("|").split("|"))
        linha_t = re.sub(r"\b(STR|DEX|CON|INT|WIS|CHA)((?: \d+)?) \1\2\b", r"\1\2", linha_t)
        # O Fogo-Fátuo veio sem o valor de Força: deduz pelo modificador
        linha_t = re.sub(
            r"\b(STR|DEX|CON|INT|WIS|CHA) ([+−-]\d+) ([+−-]\d+)",
            lambda m: f"{m[1]} {max(1, 10 + 2 * int(m[2].replace('−', '-')))} {m[2]} {m[3]}",
            linha_t,
        )
        for nome_a, valor, mod, save in re.findall(
            r"\b(STR|DEX|CON|INT|WIS|CHA) (\d+) ([+−-]\d+) ([+−-]?\d+)", linha_t
        ):
            if save[0].isdigit():
                save = mod[0] + save  # o Dragão Branco Jovem tem um "2" sem sinal
            atributos[nome_a] = {"valor": int(valor), "mod": mod, "save": save}
    assert len(atributos) == 6 and tabela, nome

    def campo(rotulo: str, onde: str) -> str | None:
        m = re.search(rf"\*\*{rotulo}\*\* (.*?)(?=\s*\*\*[A-Z][A-Za-z]*\*\*|<br>|\n|$)", onde)
        return m.group(1).strip() if m else None

    depois = corpo.split("|\n", 1)[-1]
    depois = re.split(r"^#{3,4} ", depois, maxsplit=1, flags=re.M)[0]

    dados = {
        "nome": nome,
        "grupo": grupo,
        "fonte": fonte,
        "linha": linha,
        "ca": campo("AC", cab),
        "iniciativa": campo("Initiative", cab),
        "pv": campo("HP", cab),
        "deslocamento": campo("Speed", cab),
        "atributos": atributos,
    }
    for rotulo in ["Skills", "Resistances", "Vulnerabilities", "Immunities", "Gear",
                   "Senses", "Languages", "CR"]:
        valor = campo(rotulo, depois)
        if valor is not None:
            dados[rotulo.lower()] = valor

    secoes = []
    partes = re.split(rf"^#{{3,4}} ({'|'.join(SECOES)})\s*$", corpo, flags=re.M)
    for titulo, texto in zip(partes[1::2], partes[2::2]):
        texto = limpar(texto)
        entradas = []
        intro = []
        for bloco in re.split(r"\n\s*\n(?=\*\*_)", texto):
            m = re.match(r"\*\*_(.+?)\._\*\*\s*(.*)", bloco, re.S)
            if m:
                entradas.append({"nome": m.group(1), "texto": m.group(2).strip()})
            elif entradas:
                entradas[-1]["texto"] += "\n\n" + bloco.strip()
            else:
                intro.append(bloco.strip())
        secoes.append({"titulo": titulo, "intro": "\n\n".join(intro), "entradas": entradas})
    dados["secoes"] = secoes
    return dados


def main() -> None:
    criaturas = []

    texto = (EN / "monstros.md").read_text(encoding="utf-8")
    grupos = re.split(r"^## (.+)$", texto, flags=re.M)
    for grupo, corpo in zip(grupos[1::2], grupos[2::2]):
        blocos = re.split(r"^### (.+)$", corpo, flags=re.M)
        nomes = blocos[1::2]
        for nome, sub in zip(nomes, blocos[2::2]):
            criaturas.append(ficha(nome.strip(), grupo.strip() if len(nomes) > 1 else None, "monstro", sub))

    texto = (EN / "animais.md").read_text(encoding="utf-8")
    blocos = re.split(r"^## (.+)$", texto, flags=re.M)
    for nome, corpo in zip(blocos[1::2], blocos[2::2]):
        criaturas.append(ficha(nome.strip(), None, "animal", corpo))

    saida = PASTA / "srd-5.2.1-monstros-en.json"
    saida.write_text(json.dumps(criaturas, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    entradas = sum(len(s["entradas"]) for c in criaturas for s in c["secoes"])
    print(f"{len(criaturas)} criaturas, {entradas} entradas em {saida.name}")


if __name__ == "__main__":
    main()
