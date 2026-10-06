"""
Gera docs/habilidades-cards.txt a partir do catálogo e das fichas.

O arquivo serve para mandar a outro projeto que monta cartas de recortar.
Nada nele é digitado à mão: as habilidades vêm de src/lib/habilidades.ts e
quem usa cada uma vem das fichas 5.5e em content/personagens/. Mudou o
catálogo ou entrou personagem novo, é só rodar de novo, da raiz do projeto:

    python3 scripts/gerar-cards.py
"""

import re
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "src/lib/habilidades.ts"
FICHAS = RAIZ / "content/personagens"
SAIDA = RAIZ / "docs/habilidades-cards.txt"

GRUPOS = [
    ("truque", "TRUQUES"),
    ("magia", "MAGIAS"),
    ("invocacao", "INVOCAÇÕES MÍSTICAS"),
    ("classe", "CARACTERÍSTICAS DE CLASSE"),
    ("traco", "TRAÇOS DE ESPÉCIE"),
    ("talento", "TALENTOS"),
]

LINHA = "=" * 70
FAIXA = "#" * 70


def ordem_alfabetica(texto):
    sem_acento = unicodedata.normalize("NFD", texto)
    return "".join(c for c in sem_acento if not unicodedata.combining(c)).lower()


def ler_catalogo():
    fonte = CATALOGO.read_text(encoding="utf-8")
    corpo = fonte.split("export const HABILIDADES", 1)[1]
    habilidades = {}
    for chave, bloco in re.findall(
        r'^  "?([a-z0-9-]+)"?: \{\n(.*?)^  \},', corpo, re.M | re.S
    ):
        campos = dict(re.findall(r'(\w+):\s*\n?\s*"((?:[^"\\]|\\.)*)"', bloco))
        circulo = re.search(r"circulo:\s*(\d+)", bloco)
        if circulo:
            campos["circulo"] = int(circulo.group(1))
        habilidades[chave] = campos
    return habilidades


def ler_fichas():
    fichas = []
    for arquivo in FICHAS.glob("*.mdx"):
        texto = arquivo.read_text(encoding="utf-8")
        if 'sistema: "5.5e"' not in texto:
            continue
        nome = re.search(r'^  nome: "([^"]+)"', texto, re.M).group(1)
        ordem = int(re.search(r"^  ordem: (\d+)", texto, re.M).group(1))
        chaves = []
        for lista in re.findall(
            r"(?:magias|caracteristicas|tracos|talentos):\s*\[(.*?)\]", texto, re.S
        ):
            chaves += re.findall(r'"([a-z0-9-]+)"', lista)
        fichas.append({"nome": nome, "ordem": ordem, "chaves": chaves})
    return sorted(fichas, key=lambda f: f["ordem"])


def tipo_legivel(h):
    tipo = h["tipo"]
    if tipo == "truque":
        return f"Truque de {h['escola']}"
    if tipo == "magia":
        return f"Magia de {h['circulo']}º Círculo, {h['escola']}"
    return {
        "invocacao": "Invocação Mística",
        "classe": "Característica de Classe",
        "traco": "Traço de Espécie",
        "talento": "Talento",
    }[tipo]


def bloco(h, quem):
    linhas = [LINHA, f"NOME: {h['nome']}", f"TIPO: {tipo_legivel(h)}"]
    if h.get("escola"):
        linhas.append(f"ESCOLA: {h['escola']}")
    if "circulo" in h:
        linhas.append(
            "CÍRCULO: Truque" if h["circulo"] == 0 else f"CÍRCULO: {h['circulo']}º"
        )
    for campo, rotulo in (("tempo", "TEMPO"), ("alcance", "ALCANCE"), ("duracao", "DURAÇÃO")):
        if h.get(campo):
            linhas.append(f"{rotulo}: {h[campo]}")
    linhas.append(f"DESCRIÇÃO: {h['descricao']}")
    if h.get("anotacao"):
        linhas.append(f"ANOTAÇÃO NA FICHA: {h['anotacao']}")
    linhas.append(f"QUEM USA: {', '.join(sorted(quem, key=ordem_alfabetica))}")
    return "\n".join(linhas)


def por_extenso(n):
    nomes = {2: "duas", 3: "três", 4: "quatro", 5: "cinco"}
    return nomes.get(n, str(n))


def main():
    habilidades = ler_catalogo()
    fichas = ler_fichas()

    quem_usa = {}
    for ficha in fichas:
        for chave in ficha["chaves"]:
            if chave not in habilidades:
                raise SystemExit(f"{ficha['nome']} aponta para '{chave}', que não existe no catálogo")
            quem_usa.setdefault(chave, []).append(ficha["nome"])

    total_cartas = sum(len(f["chaves"]) for f in fichas)
    repetidas = sorted(
        ((habilidades[c]["nome"], len(q)) for c, q in quem_usa.items() if len(q) > 1),
        key=lambda x: ordem_alfabetica(x[0]),
    )
    frases = [f"{nome} aparece em {por_extenso(n)} fichas" for nome, n in repetidas]
    repeticao = "; ".join(frases) + "." if frases else ""

    saida = [
        "HABILIDADES, MAGIAS E TALENTOS",
        "Terras de Mitrael, campanha de D&D 5.5e (regras de 2024)",
        "Cenário autoral de Arion Gresser. Site: https://terrasmitrael.netlify.app",
        "",
        f"{len(quem_usa)} habilidades distintas, usadas por {len(fichas)} personagens.",
        f"Se cada personagem tiver o próprio baralho, são {total_cartas} cartas no total.",
        repeticao,
        "",
        "COMO LER ESTE ARQUIVO",
        "Cada habilidade é um bloco separado por uma linha de sinais de igual.",
        "Os campos vêm rotulados e sempre na mesma ordem. Campo ausente quer",
        "dizer que não se aplica àquela habilidade.",
        "",
        "SUGESTÃO DE CARTA",
        "Frente: NOME em destaque e TIPO como subtítulo. Quando existirem, a faixa",
        "de TEMPO, ALCANCE e DURAÇÃO logo abaixo. Corpo: DESCRIÇÃO. A ANOTAÇÃO vem",
        "destacada e separada, porque é o que o jogador escreveu de próprio punho na",
        "ficha e na mesa vale mais que a regra geral.",
        "QUEM USA serve para separar os baralhos e não precisa ser impresso.",
        "Nos textos, não use travessão. Se a frase pedir um, reescreva a frase.",
        "",
    ]

    for tipo, titulo in GRUPOS:
        chaves = sorted(
            (c for c in quem_usa if habilidades[c]["tipo"] == tipo),
            key=lambda c: ordem_alfabetica(habilidades[c]["nome"]),
        )
        if not chaves:
            continue
        saida += ["", FAIXA, f"## {titulo}  ({len(chaves)})", FAIXA, ""]
        for chave in chaves:
            saida += [bloco(habilidades[chave], quem_usa[chave]), ""]

    saida += ["", FAIXA, "## BARALHO DE CADA PERSONAGEM", FAIXA, ""]
    for ficha in fichas:
        nomes = sorted((habilidades[c]["nome"] for c in ficha["chaves"]), key=ordem_alfabetica)
        saida.append(f"{ficha['nome']} ({len(nomes)} cartas)")
        saida += [f"  - {n}" for n in nomes]
        saida.append("")

    SAIDA.write_text("\n".join(saida).rstrip() + "\n", encoding="utf-8")
    print(f"{SAIDA.relative_to(RAIZ)}: {len(quem_usa)} habilidades, {total_cartas} cartas")


if __name__ == "__main__":
    main()
