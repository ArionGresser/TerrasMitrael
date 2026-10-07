"""
Monta content/magias/magias.json, o grimório que o site lê.

Junta duas coisas:
  1. srd-5.2.1-magias-en.json: as magias do SRD 5.2.1 em inglês, extraídas
     por extrair-srd.py. Material da Wizards of the Coast sob licença
     Creative Commons Attribution 4.0 (CC-BY-4.0).
  2. traducao/nivel-N.txt: a tradução para o português, escrita à mão.

O que se repete em toda magia (escola, classes, tempo, alcance, duração) é
traduzido aqui, por tabela, para sair sempre igual. A tradução à mão cuida
do nome, do material e do texto.

Formato de traducao/nivel-N.txt:

    === Nome em inglês | Nome em português
    material: o componente material traduzido
    tempo: (só quando o tempo de conjuração tem texto próprio)
    componentes: (só quando o SRD escreve os componentes de outro jeito)
    Texto da magia em markdown...

Uso:  python3 scripts/magias/gerar.py
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

PASTA = Path(__file__).parent
RAIZ = PASTA.parent.parent
SAIDA = RAIZ / "content" / "magias" / "magias.json"

ESCOLAS = {
    "Abjuration": "Abjuração",
    "Conjuration": "Conjuração",
    "Divination": "Adivinhação",
    "Enchantment": "Encantamento",
    "Evocation": "Evocação",
    "Illusion": "Ilusão",
    "Necromancy": "Necromancia",
    "Transmutation": "Transmutação",
}

CLASSES = {
    "Bard": "Bardo",
    "Cleric": "Clérigo",
    "Druid": "Druida",
    "Paladin": "Paladino",
    "Ranger": "Patrulheiro",
    "Sorcerer": "Feiticeiro",
    "Warlock": "Bruxo",
    "Wizard": "Mago",
}

TEMPOS = {
    "Action": "Ação",
    "Bonus Action": "Ação Bônus",
    "Action or Ritual": "Ação ou Ritual",
    "1 minute": "1 minuto",
    "1 minute or Ritual": "1 minuto ou Ritual",
    "10 minutes": "10 minutos",
    "10 minutes or Ritual": "10 minutos ou Ritual",
    "1 hour": "1 hora",
    "1 hour or Ritual": "1 hora ou Ritual",
    "8 hours": "8 horas",
    "12 hours": "12 horas",
    "24 hours": "24 horas",
}

# Cada 1,5 metro equivale a um quadrado de 5 pés, como nos livros em português
PES = {
    5: "1,5 metro",
    10: "3 metros",
    15: "4,5 metros",
    20: "6 metros",
    30: "9 metros",
    60: "18 metros",
    90: "27 metros",
    100: "30 metros",
    120: "36 metros",
    150: "45 metros",
    300: "90 metros",
    500: "150 metros",
}

ALCANCES = {
    "Self": "Pessoal",
    "Touch": "Toque",
    "Special": "Especial",
    "Sight": "Visão",
    "Unlimited": "Ilimitado",
    "1 mile": "1,5 quilômetro",
    "500 miles": "750 quilômetros",
}

DURACOES = {
    "Instantaneous": "Instantânea",
    "Until dispelled": "Até ser dissipada",
    "Until dispelled or triggered": "Até ser dissipada ou ativada",
    "Special": "Especial",
    "1 round": "1 rodada",
}

UNIDADES = {
    "minute": ("minuto", "minutos"),
    "hour": ("hora", "horas"),
    "day": ("dia", "dias"),
    "round": ("rodada", "rodadas"),
}


def traduzir_tempo_de_duracao(texto: str) -> str:
    m = re.fullmatch(r"(\d+) (minute|hour|day|round)s?", texto)
    if not m:
        raise ValueError(f"duração desconhecida: {texto}")
    n = int(m.group(1))
    singular, plural = UNIDADES[m.group(2)]
    return f"{n} {singular if n == 1 else plural}"


def traduzir_duracao(texto: str) -> str:
    if texto in DURACOES:
        return DURACOES[texto]
    m = re.fullmatch(r"Concentration, up to (.+)", texto)
    if m:
        return f"Concentração, até {traduzir_tempo_de_duracao(m.group(1))}"
    m = re.fullmatch(r"Up to (.+)", texto)
    if m:
        return f"Até {traduzir_tempo_de_duracao(m.group(1))}"
    return traduzir_tempo_de_duracao(texto)


def traduzir_alcance(texto: str) -> str:
    if texto in ALCANCES:
        return ALCANCES[texto]
    m = re.fullmatch(r"(\d+) feet", texto)
    if m and int(m.group(1)) in PES:
        return PES[int(m.group(1))]
    raise ValueError(f"alcance desconhecido: {texto}")


def fatiar(nome: str) -> str:
    sem_acento = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")


def ler_traducoes() -> dict:
    traducoes = {}
    for arquivo in sorted((PASTA / "traducao").glob("nivel-*.txt")):
        blocos = arquivo.read_text(encoding="utf-8").split("\n=== ")
        blocos[0] = blocos[0].removeprefix("=== ")
        for bloco in blocos:
            if not bloco.strip():
                continue
            cabeca, _, corpo = bloco.partition("\n")
            original, _, nome = cabeca.partition(" | ")
            campos = {}
            linhas = corpo.split("\n")
            while linhas and re.match(r"^(material|tempo|componentes|alcance|duracao): ", linhas[0]):
                chave, _, valor = linhas.pop(0).partition(": ")
                campos[chave] = valor.strip()
            traducoes[original.strip()] = {
                "nome": nome.strip(),
                "texto": "\n".join(linhas).strip(),
                **campos,
            }
    return traducoes


def main() -> None:
    srd = json.loads((PASTA / "srd-5.2.1-magias-en.json").read_text(encoding="utf-8"))
    traducoes = ler_traducoes()
    conhecidas = {m["name"] for m in srd}

    for original in traducoes:
        if original not in conhecidas:
            sys.exit(f"Tradução sem magia correspondente no SRD: {original}")

    magias = []
    for m in srd:
        t = traducoes.get(m["name"])
        if not t:
            continue

        componentes = t.get("componentes")
        if not componentes:
            if not m["componentes"]:
                sys.exit(f"{m['name']}: o SRD não tem componentes; escreva 'componentes:'")
            if m["componentes"] == "None":
                componentes = "Nenhum"
            else:
                componentes = re.sub(r"\s*\(.*\)", "", m["componentes"])
                if "M" in componentes.split(", "):
                    if "material" not in t:
                        sys.exit(f"{m['name']}: falta a linha 'material:'")
                    componentes = f"{componentes} ({t['material']})"

        tempo = t.get("tempo") or TEMPOS.get(m["tempo"])
        if not tempo:
            sys.exit(f"{m['name']}: tempo com texto próprio, escreva 'tempo:'")

        magias.append(
            {
                "slug": fatiar(t["nome"]),
                "nome": t["nome"],
                "original": m["name"],
                "nivel": m["nivel"],
                "escola": ESCOLAS[m["escola"]],
                "classes": sorted(CLASSES[c] for c in m["classes"]),
                "tempo": tempo,
                "alcance": t.get("alcance") or traduzir_alcance(m["alcance"]),
                "componentes": componentes,
                "duracao": t.get("duracao") or traduzir_duracao(m["duracao"]),
                "concentracao": m["duracao"].startswith("Concentration"),
                "ritual": "Ritual" in m["tempo"],
                "texto": t["texto"],
            }
        )

    slugs = [m["slug"] for m in magias]
    repetidos = {s for s in slugs if slugs.count(s) > 1}
    if repetidos:
        sys.exit(f"Nomes repetidos: {repetidos}")

    magias.sort(key=lambda m: fatiar(m["nome"]))
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(magias, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(magias)} de {len(srd)} magias traduzidas em {SAIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
