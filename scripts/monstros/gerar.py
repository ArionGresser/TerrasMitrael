"""
Monta content/monstros/monstros.json, o bestiário que o site lê.

Junta três coisas:
  1. srd-5.2.1-monstros-en.json: as fichas do SRD 5.2.1 em inglês, separadas
     por extrair-srd.py. Material da Wizards of the Coast sob licença
     Creative Commons Attribution 4.0 (CC-BY-4.0).
  2. fixos.py: a tradução por tabela do que se repete em toda ficha.
  3. traducao/nomes.txt e traducao/parte-N.txt: a tradução à mão.

Formato de traducao/parte-N.txt, uma criatura depois da outra:

    === Nome em inglês
    + Nome da entrada em português
    Texto da entrada...
    + :intro
    Texto que abre a seção (as Ações Lendárias têm um)
    + Mordida

As entradas vêm na mesma ordem do SRD. Uma entrada sem texto é um ataque
simples, que fixos.py traduz sozinho.

Uso:  python3 scripts/monstros/gerar.py
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

import fixos

PASTA = Path(__file__).parent
RAIZ = PASTA.parent.parent
SAIDA = RAIZ / "content" / "monstros" / "monstros.json"

SECOES = {
    "Traits": "Traços",
    "Actions": "Ações",
    "Bonus Actions": "Ações Bônus",
    "Reactions": "Reações",
    "Legendary Actions": "Ações Lendárias",
}

ATRIBUTOS = {"STR": "For", "DEX": "Des", "CON": "Con", "INT": "Int", "WIS": "Sab", "CHA": "Car"}


def slug(nome: str) -> str:
    sem_acento = unicodedata.normalize("NFD", nome)
    sem_acento = "".join(c for c in sem_acento if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")


def ler_nomes() -> dict[str, str]:
    nomes = {}
    for linha in (PASTA / "traducao" / "nomes.txt").read_text(encoding="utf-8").splitlines():
        if linha.strip() and not linha.startswith("#"):
            en, pt = (p.strip() for p in linha.split("|"))
            nomes[en] = pt
    return nomes


def ler_traducao() -> dict[str, list[tuple[str, str]]]:
    criaturas = {}
    for arquivo in sorted(PASTA.glob("traducao/parte-*.txt"), key=lambda p: int(re.findall(r"\d+", p.name)[0])):
        for bloco in re.split(r"^=== ", arquivo.read_text(encoding="utf-8"), flags=re.M)[1:]:
            nome, _, corpo = bloco.partition("\n")
            entradas = []
            for parte in re.split(r"^\+ ", corpo, flags=re.M)[1:]:
                titulo, _, texto = parte.partition("\n")
                entradas.append((titulo.strip(), texto.strip()))
            if nome.strip() in criaturas:
                sys.exit(f"{arquivo.name}: '{nome}' traduzido duas vezes")
            criaturas[nome.strip()] = entradas
    return criaturas


def numero_nd(nd: str) -> float:
    if "/" in nd:
        a, b = nd.split("/")
        return int(a) / int(b)
    return float(nd)


def montar(en: dict, pt_nome: str, traducao: list[tuple[str, str]]) -> dict:
    erros = []
    fila = list(traducao)
    secoes = []
    for secao in en["secoes"]:
        partes = []
        if secao["intro"]:
            if not fila or fila[0][0] != ":intro":
                erros.append(f"falta o :intro de {secao['titulo']}")
            else:
                partes.append(fila.pop(0)[1])
        for entrada in secao["entradas"]:
            if not fila:
                erros.append(f"faltam entradas a partir de '{entrada['nome']}'")
                break
            titulo, texto = fila.pop(0)
            if titulo == ":intro":
                erros.append(f":intro sobrando antes de '{entrada['nome']}'")
                continue
            if not texto:
                texto = fixos.ataque_simples(entrada["texto"])
                if texto is None:
                    erros.append(f"'{entrada['nome']}' não é ataque simples e veio sem texto")
                    continue
            # O texto continua em outros parágrafos: o nome só vai no primeiro
            partes.append(f"**_{titulo}._** {texto}")
        secoes.append({"titulo": SECOES[secao["titulo"]], "texto": "\n\n".join(partes)})
    if fila:
        erros.append(f"entradas sobrando: {[t for t, _ in fila]}")
    if erros:
        raise ValueError(f"{en['nome']}: " + "; ".join(erros))

    linha = fixos.linha(en["linha"])
    tamanho = re.match(r"Enxame|\S+", linha)[0]
    tipo_base = re.match(r"(Enxame|[\wÀ-ú-]+)", linha)[1]
    nd, xp, bp = fixos.nd(en["cr"])

    iniciativa = en["iniciativa"]
    if not iniciativa:
        # O Súcubo veio sem Iniciativa: é o modificador de Destreza
        mod = int(en["atributos"]["DEX"]["mod"].replace("−", "-"))
        iniciativa = f"{mod:+d} ({10 + mod})"

    campos = []
    for chave, rotulo, traduzir in [
        ("skills", "Perícias", fixos.pericias),
        ("vulnerabilities", "Vulnerabilidades", fixos.lista_de_danos),
        ("resistances", "Resistências", fixos.lista_de_danos),
        ("immunities", "Imunidades", fixos.lista_de_danos),
        ("gear", "Equipamento", fixos.equipamento),
        ("senses", "Sentidos", fixos.sentidos),
        ("languages", "Idiomas", fixos.idiomas),
    ]:
        if en.get(chave):
            campos.append({"rotulo": rotulo, "valor": traduzir(en[chave])})

    return {
        "slug": slug(pt_nome),
        "nome": pt_nome,
        "original": en["nome"],
        "fonte": en["fonte"],
        "linha": linha,
        "tipo": tipo_base,
        "tamanho": en["linha"].split(" ")[0],
        "ca": en["ca"],
        "iniciativa": iniciativa.replace("-", "−"),
        "pv": en["pv"],
        "deslocamento": fixos.deslocamento(en["deslocamento"]),
        "atributos": [
            {"sigla": ATRIBUTOS[k], "valor": v["valor"], "mod": v["mod"], "save": v["save"]}
            for k, v in en["atributos"].items()
        ],
        "campos": campos,
        "nd": nd,
        "ndNumero": numero_nd(nd),
        "xp": xp,
        "bp": bp,
        "secoes": secoes,
    }


def main() -> None:
    srd = json.loads((PASTA / "srd-5.2.1-monstros-en.json").read_text(encoding="utf-8"))
    nomes = ler_nomes()
    traducao = ler_traducao()

    saida, faltando, erros = [], [], []
    for en in srd:
        if en["nome"] not in traducao:
            faltando.append(en["nome"])
            continue
        try:
            saida.append(montar(en, nomes[en["nome"]], traducao[en["nome"]]))
        except ValueError as erro:
            erros.append(str(erro))

    sobrando = set(traducao) - {c["nome"] for c in srd}
    if erros or sobrando:
        sys.exit("\n".join(erros + [f"Sobram: {sorted(sobrando)}"] if sobrando else erros))

    for c in saida:
        texto = json.dumps({**c, "original": ""}, ensure_ascii=False)
        if "—" in texto:
            sys.exit(f"Travessão em {c['original']}")
        restos = re.findall(r"\b(the|and|of|with|feet|ft\.)\b", texto)
        if restos:
            sys.exit(f"Inglês sobrando em {c['original']}: {restos[:5]}")

    slugs = [c["slug"] for c in saida]
    repetidos = {s for s in slugs if slugs.count(s) > 1}
    if repetidos:
        sys.exit(f"Slugs repetidos: {repetidos}")

    saida.sort(key=lambda c: c["slug"])
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    aviso = f" (faltam {len(faltando)})" if faltando else ""
    print(f"{len(saida)} criaturas em {SAIDA.relative_to(RAIZ)}{aviso}")


if __name__ == "__main__":
    main()
