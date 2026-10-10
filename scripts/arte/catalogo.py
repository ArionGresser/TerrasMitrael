"""
O catálogo de todas as artes do site: o que é cada uma, com que nome o
arquivo deve ser salvo, para onde vai no site e o prompt para gerar.
As magias usam as palavras-chave e os modelos de scripts/magias/arte.

É usado pelo gerar-guia.py (a página com a lista) e pelo importar.py (que
traz as artes prontas para o site). Quais itens de regra têm arte espelha
src/lib/regras-arte.ts: mudando lá, mude aqui também.
"""

import importlib.util
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import cartas
import historias

RAIZ = Path(__file__).resolve().parents[2]
AQUI = Path(__file__).resolve().parent
PUBLICO = RAIZ / "public"
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

# ---------- Os prompts ----------
# Um estilo comum a todos, para o conjunto ficar coeso com os ícones das magias.

PINTURA = "painterly hand-painted style, rich colors, dramatic lighting, no text, no watermark"
LARGO = "wide 16:9 composition"
ICONE = (
    "single centered object, painterly hand-painted style, rich colors, "
    "dark vignette background, square, no text, no border"
)

TIPOS = {
    "Aberração": "aberration",
    "Celestial": "celestial",
    "Constructo": "construct",
    "Dragão": "dragon",
    "Elemental": "elemental",
    "Enxame": "swarm",
    "Fada": "fey creature",
    "Fera": "beast",
    "Gigante": "giant",
    "Gosma": "ooze",
    "Humanoide": "humanoid",
    "Ínfero": "fiend",
    "Monstruosidade": "monstrosity",
    "Morto-Vivo": "undead",
    "Planta": "plant creature",
}

CATEGORIAS = {
    "Anel": "magic ring",
    "Arma": "magic weapon",
    "Armadura": "magic armor",
    "Cajado": "magic staff",
    "Cetro": "magic rod",
    "Item Maravilhoso": "wondrous item",
    "Pergaminho": "magic scroll",
    "Poção": "magic potion",
    "Varinha": "magic wand",
}

# A cor do brilho segue a raridade, como nos jogos
BRILHO = {
    "Comum": "soft white",
    "Incomum": "green",
    "Raro": "blue",
    "Muito Raro": "purple",
    "Lendário": "orange and gold",
    "Artefato": "crimson and gold",
}


def um(texto):
    """O artigo certo em inglês: "an aboleth", "a dragon"."""
    return ("an " if texto[0].lower() in "aeiou" else "a ") + texto


def prompt_cena(assunto):
    return f"medieval fantasy illustration, {assunto}, D&D book art, {LARGO}, {PINTURA}"


# ---------- As fontes ----------


def ancora(texto):
    """O mesmo de src/lib/regras.ts: "Dádiva do Destino" → "dadiva-do-destino"."""
    t = unicodedata.normalize("NFD", texto)
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", t.lower()))


def descricoes():
    tabela, secao = {}, None
    for linha in (AQUI / "descricoes.txt").read_text().split("\n"):
        if linha.startswith("## "):
            secao = linha[3:].strip()
        elif "|" in linha and not linha.startswith("#"):
            nome, texto = (p.strip() for p in linha.split("|", 1))
            tabela[(secao, nome)] = texto
    return tabela


def arte(secao, slug, nome, formato, prompt):
    return {
        "secao": secao,
        "slug": slug,
        "nome": nome,
        "formato": formato,
        "prompt": prompt,
    }


def livro(d):
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
        ("bau", "Baú do Mestre"),
    ]
    return [
        arte("compendio", chave, nome, "largo", prompt_cena(d[("compendio", chave)]))
        for chave, nome in partes
    ]


def especies():
    texto = (RAIZ / "src/lib/especies.ts").read_text()
    trios = re.findall(r'slug: "([^"]+)",\s*nome: "([^"]+)",\s*original: "([^"]+)"', texto)
    return [
        arte(
            "especies",
            slug,
            nome,
            "largo",
            prompt_cena(
                f"portrait of {um(original.lower())} adventurer, a D&D species, "
                "three-quarter view, detailed face and attire, standing in a fitting landscape"
            ),
        )
        for slug, nome, original in trios
    ]


def classes():
    linhas = []
    for arquivo in sorted((RAIZ / "content/classes").glob("*.md")):
        texto = arquivo.read_text()
        nome = re.search(r"^nome: (.+)$", texto, re.M).group(1)
        original = re.search(r"^original: (.+)$", texto, re.M).group(1)
        linhas.append(
            arte(
                "classes",
                arquivo.stem,
                nome,
                "largo",
                prompt_cena(
                    f"a D&D {original.lower()} hero in an iconic action pose, "
                    "showing the gear and powers of the class"
                ),
            )
        )
    return linhas


def regras(documento, d):
    linhas, grupo = [], None
    for linha in (RAIZ / f"content/regras/{documento}.md").read_text().split("\n"):
        if linha.startswith("# "):
            grupo = linha[2:].strip()
            continue
        if not linha.startswith("## "):
            continue
        titulo = linha[3:].strip()
        slug = ancora(titulo)
        descricao = d.get((f"regras/{documento}", slug))
        if documento == "equipamento" and grupo == "Equipamento de Aventura":
            prompt = f"medieval fantasy adventuring gear icon, {descricao}, warm candlelight, {ICONE}"
            linhas.append(arte(f"regras/{documento}", slug, titulo, "quadrado", prompt))
        elif documento != "equipamento" or slug in PRATELEIRAS:
            linhas.append(arte(f"regras/{documento}", slug, titulo, "largo", prompt_cena(descricao)))
    return linhas


def itens():
    dados = json.loads((RAIZ / "content/itens/itens.json").read_text())["itens"]
    return [
        arte(
            "itens",
            i["slug"],
            i["nome"],
            "quadrado",
            f"fantasy RPG magic item icon, {i['original']}, {um(CATEGORIAS[i['categoria']])}, "
            f"{ICONE}, {BRILHO[i['raridades'][0]]} magical glow",
        )
        for i in dados
    ]


def monstros():
    linhas = []
    for m in json.loads((RAIZ / "content/monstros/monstros.json").read_text()):
        tamanho = m["tamanho"].lower()
        if m["fonte"] == "animal":
            assunto = (
                f"naturalist illustration of {um(m['original'].lower())}, a {tamanho} animal, "
                "full body, in its natural habitat"
            )
        else:
            assunto = (
                f"bestiary illustration of {um(m['original'])}, a {tamanho} "
                f"{TIPOS[m['tipo']]} from D&D, full body, in its lair or habitat"
            )
        linhas.append(arte("monstros", m["slug"], m["nome"], "largo", prompt_cena(assunto)))
    return linhas


def grimorio():
    """Os modelos e as palavras-chave das magias, do gerador delas."""
    caminho = RAIZ / "scripts/magias/arte/gerar-lista.py"
    spec = importlib.util.spec_from_file_location("lista_das_magias", caminho)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def artes_das_magias():
    """Duas listas: os ícones e as ilustrações de uso, por círculo."""
    g = grimorio()
    chaves = g.ler_chaves()
    todas = json.loads((RAIZ / "content/magias/magias.json").read_text())
    icones, cenas = [], []
    for m in sorted(todas, key=lambda m: (m["nivel"], m["nome"])):
        circulo = "truque" if m["nivel"] == 0 else f"{m['nivel']}º círculo"
        nome = f"{m['nome']} ({circulo})"
        chave = chaves[m["original"]]
        quem = g.QUEM.get(m["classes"][0], "a spellcaster") if m["classes"] else "a spellcaster"
        icones.append(
            arte(
                "magias/icones",
                m["slug"],
                nome,
                "quadrado",
                g.ESTILO_ICONE.format(chave=chave, cor=g.COR[m["escola"]]),
            )
        )
        cenas.append(
            arte(
                "magias/ilustracoes",
                f"{m['slug']}-1",
                nome,
                "largo",
                g.ESTILO_CENA.format(quem=quem, nome=m["original"], chave=chave),
            )
        )
    return icones, cenas


ROTULO_DA_HABILIDADE = {
    "truque": "truque fora do SRD",
    "magia": "magia fora do SRD",
    "talento": "talento",
    "traco": "traço de espécie",
    "classe": "característica de classe",
    "invocacao": "invocação mística",
}


def fichas(d):
    """O que aparece nas fichas e não tem arte em outra seção do site.

    Espelha o buscarHabilidade de src/lib/habilidades.ts: a magia que está no
    Grimório usa o ícone de lá, o talento que está no Livro usa a arte de lá,
    e o resto procura em public/images/habilidades/<chave>.webp."""
    texto = (RAIZ / "src/lib/habilidades.ts").read_text()
    corpo = texto[texto.index("export const HABILIDADES") :]
    entradas = re.findall(
        r'\n  "?([a-z0-9-]+)"?: \{\n    nome: "([^"]+)",\n    tipo: "([a-z]+)",(.*?)\n  \},',
        corpo,
        re.S,
    )
    no_grimorio = {m["nome"] for m in json.loads((RAIZ / "content/magias/magias.json").read_text())}
    talentos = {
        ancora(l[3:].strip())
        for l in (RAIZ / "content/regras/talentos.md").read_text().split("\n")
        if l.startswith("## ")
    }
    linhas = []
    for chave, nome, tipo, resto in entradas:
        if tipo in ("truque", "magia") and nome in no_grimorio:
            continue
        regra = re.search(r'regra: "([^"]+)"', resto)
        if tipo == "talento" and (regra.group(1) if regra else chave) in talentos:
            continue
        prompt = f"fantasy RPG ability icon, {d[('habilidades', chave)]}, {ICONE}"
        linhas.append(
            arte("habilidades", chave, f"{nome} ({ROTULO_DA_HABILIDADE[tipo]})", "quadrado", prompt)
        )
    return linhas


SECOES = [
    ("livro", "Livro", lambda d: livro(d)),
    ("especies", "Espécies", lambda d: especies()),
    ("classes", "Classes", lambda d: classes()),
    ("antecedentes", "Antecedentes", lambda d: regras("antecedentes", d)),
    ("talentos", "Talentos", lambda d: regras("talentos", d)),
    ("equipamento", "Equipamento", lambda d: regras("equipamento", d)),
    ("itens", "Itens Mágicos", lambda d: itens()),
    ("monstros", "Monstros", lambda d: monstros()),
    ("fichas", "Fichas", lambda d: fichas(d)),
]

# O prefixo do nome de entrega, quando ele precisa de um
PREFIXO = {
    "compendio": "livro",
    "especies": "especie",
    "classes": "classe",
    "regras/antecedentes": "antecedente",
    "regras/talentos": "talento",
    "regras/equipamento": "equipamento",
    "itens": "item",
    "monstros": "monstro",
    "habilidades": "ficha",
}


def existe(pasta, slug):
    return any((PUBLICO / "images" / pasta / f"{slug}{f}").exists() for f in FORMATOS)


def catalogo():
    """As seções com as artes, cada uma já com o nome de entrega e se está pronta.

    O nome de entrega é o nome do arquivo que você salva. Em geral é o próprio
    endereço da página; quando dois se repetem (o Druida classe e o Druida
    monstro), os dois ganham o prefixo da seção. Os cartões do Livro sempre
    ganham, porque "classes" ou "itens" sozinhos não dizem nada."""
    d = descricoes()
    secoes = [(chave, titulo, fonte(d)) for chave, titulo, fonte in SECOES]

    magias = {m["slug"] for m in json.loads((RAIZ / "content/magias/magias.json").read_text())}
    contagem = Counter(a["slug"] for _, _, artes in secoes for a in artes)
    for _, _, artes in secoes:
        for a in artes:
            repetido = contagem[a["slug"]] > 1 or a["slug"] in magias
            if repetido or a["secao"] == "compendio":
                a["entrega"] = f"{PREFIXO[a['secao']]}-{a['slug']}"
            else:
                a["entrega"] = a["slug"]
            a["pronta"] = existe(a["secao"], a["slug"])

    # As magias entram com o próprio endereço: o ícone é "bola-de-fogo" e a
    # ilustração, "bola-de-fogo-1", que é como o importar.py reconhece.
    icones, cenas = artes_das_magias()
    for a in icones + cenas:
        a["entrega"] = a["slug"]
        a["pronta"] = existe(a["secao"], a["slug"])
    secoes = [
        ("magias-icones", "Magias: ícones", icones),
        ("magias-ilustracoes", "Magias: ilustrações", cenas),
    ] + secoes

    # As histórias (Saga, Guerra, locais): o nome de entrega é o próprio
    # endereço, que já nasce único ("t2e1-capa", "razavar-feira")
    for chave, titulo, pasta, lista in historias.secoes() + cartas.secoes():
        artes = []
        for c in lista:
            a = arte(pasta, c["slug"], c["nome"], c["formato"], historias.assunto_completo(c))
            a["entrega"] = c["slug"]
            a["pronta"] = existe(pasta, c["slug"])
            a["onde"] = c["onde"]
            a["anexar"] = historias.anexos(c)
            a["contexto"] = c["contexto"]
            artes.append(a)
        secoes.append((chave, titulo, artes))

    entregas = Counter(a["entrega"] for _, _, artes in secoes for a in artes)
    repetidas = [e for e, n in entregas.items() if n > 1]
    assert not repetidas, f"nomes de entrega repetidos: {repetidas}"
    return secoes
