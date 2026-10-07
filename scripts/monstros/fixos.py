"""
As partes fixas das fichas de monstros, traduzidas por tabela.

Tudo o que se repete igual em centenas de fichas (tamanho, tipo, tendência,
deslocamento, sentidos, idiomas, perícias, danos, condições e os ataques
simples) sai daqui, para ficar sempre igual. O texto livre dos traços e das
ações é traduzido à mão em traducao/parte-N.txt.
"""

import re

TAMANHOS = {
    "Tiny": "Miúdo",
    "Small": "Pequeno",
    "Medium": "Médio",
    "Large": "Grande",
    "Huge": "Enorme",
    "Gargantuan": "Imenso",
}

TIPOS = {
    "Aberration": "Aberração",
    "Beast": "Fera",
    "Celestial": "Celestial",
    "Construct": "Constructo",
    "Dragon": "Dragão",
    "Elemental": "Elemental",
    "Fey": "Fada",
    "Fiend": "Ínfero",
    "Giant": "Gigante",
    "Humanoid": "Humanoide",
    "Monstrosity": "Monstruosidade",
    "Ooze": "Gosma",
    "Plant": "Planta",
    "Undead": "Morto-Vivo",
}

TIPOS_PLURAL = {"Beasts": "Feras Miúdas", "Undead": "Mortos-Vivos Miúdos"}

ETIQUETAS = {
    "Angel": "Anjo",
    "Chromatic": "Cromático",
    "Cleric": "Clérigo",
    "Demon": "Demônio",
    "Devil": "Diabo",
    "Dinosaur": "Dinossauro",
    "Druid": "Druida",
    "Genie": "Gênio",
    "Goblinoid": "Goblinoide",
    "Lycanthrope": "Licantropo",
    "Metallic": "Metálico",
    "Titan": "Titã",
    "Wizard": "Mago",
}

TENDENCIAS = {
    "Unaligned": "Sem Tendência",
    "Neutral": "Neutro",
    "Lawful Good": "Leal e Bom",
    "Neutral Good": "Neutro e Bom",
    "Chaotic Good": "Caótico e Bom",
    "Lawful Neutral": "Leal e Neutro",
    "Chaotic Neutral": "Caótico e Neutro",
    "Lawful Evil": "Leal e Mau",
    "Neutral Evil": "Neutro e Mau",
    "Chaotic Evil": "Caótico e Mau",
}

DANOS = {
    "Acid": "Ácido",
    "Bludgeoning": "Contundente",
    "Cold": "Frio",
    "Fire": "Fogo",
    "Force": "Energia",
    "Lightning": "Elétrico",
    "Necrotic": "Necrótico",
    "Piercing": "Perfurante",
    "Poison": "Veneno",
    "Psychic": "Psíquico",
    "Radiant": "Radiante",
    "Slashing": "Cortante",
    "Thunder": "Trovejante",
}

# "de dano ácido", "de dano de fogo": o jeito de escrever no meio da frase
DANO_FRASE = {
    "Acid": "dano ácido",
    "Bludgeoning": "dano contundente",
    "Cold": "dano de frio",
    "Fire": "dano de fogo",
    "Force": "dano de energia",
    "Lightning": "dano elétrico",
    "Necrotic": "dano necrótico",
    "Piercing": "dano perfurante",
    "Poison": "dano de veneno",
    "Psychic": "dano psíquico",
    "Radiant": "dano radiante",
    "Slashing": "dano cortante",
    "Thunder": "dano trovejante",
}

CONDICOES = {
    "Blinded": "Cego",
    "Charmed": "Enfeitiçado",
    "Deafened": "Surdo",
    "Exhaustion": "Exaustão",
    "Frightened": "Amedrontado",
    "Grappled": "Agarrado",
    "Incapacitated": "Incapacitado",
    "Invisible": "Invisível",
    "Paralyzed": "Paralisado",
    "Petrified": "Petrificado",
    "Poisoned": "Envenenado",
    "Prone": "Caído",
    "Restrained": "Contido",
    "Stunned": "Atordoado",
    "Unconscious": "Inconsciente",
}

PERICIAS = {
    "Acrobatics": "Acrobacia",
    "Animal Handling": "Lidar com Animais",
    "Arcana": "Arcanismo",
    "Athletics": "Atletismo",
    "Deception": "Enganação",
    "History": "História",
    "Insight": "Intuição",
    "Intimidation": "Intimidação",
    "Investigation": "Investigação",
    "Medicine": "Medicina",
    "Nature": "Natureza",
    "Perception": "Percepção",
    "Performance": "Atuação",
    "Persuasion": "Persuasão",
    "Religion": "Religião",
    "Sleight of Hand": "Prestidigitação",
    "Stealth": "Furtividade",
    "Survival": "Sobrevivência",
}

IDIOMAS = {
    "Common Sign Language": "Língua de Sinais Comum",
    "Common": "Comum",
    "Deep Speech": "Fala Profunda",
    "Draconic": "Dracônico",
    "Druidic": "Druídico",
    "Dwarvish": "Anão",
    "Elvish": "Élfico",
    "Giant": "Gigante",
    "Gnomish": "Gnômico",
    "Halfling": "Pequenino",
    "Orc": "Orc",
    "Abyssal": "Abissal",
    "Celestial": "Celestial",
    "Infernal": "Infernal",
    "Primordial": "Primordial",
    "Sylvan": "Silvestre",
    "Thieves' Cant": "Gíria de Ladrão",
    "Undercommon": "Subcomum",
    "Blink Dog": "Cão Teleportador",
    "Worg": "Worg",
}

EQUIPAMENTO = {
    "Battleaxe": "Machado de Batalha",
    "Breastplate": "Peitoral",
    "Chain Mail": "Cota de Malha",
    "Chain Shirt": "Camisão de Malha",
    "Club": "Clava",
    "Component Pouch": "Bolsa de Componentes",
    "Daggers": "Adagas",
    "Greataxe": "Machado Grande",
    "Greatclub": "Clava Grande",
    "Greatsword": "Espada Grande",
    "Half Plate Armor": "Meia-Armadura",
    "Hand Crossbow": "Besta de Mão",
    "Handaxes": "Machadinhas",
    "Heavy Crossbow": "Besta Pesada",
    "Hide Armor": "Gibão de Peles",
    "Holy Symbol": "Símbolo Sagrado",
    "Javelins": "Azagaias",
    "Leather Armor": "Armadura de Couro",
    "Light Crossbow": "Besta Leve",
    "Light Hammers": "Martelos Leves",
    "Longbow": "Arco Longo",
    "Longsword": "Espada Longa",
    "Mace": "Maça",
    "Morningstar": "Maça Estrela",
    "Pike": "Pique",
    "Pistol": "Pistola",
    "Plate Armor": "Armadura de Placas",
    "Rapier": "Rapieira",
    "Scimitar": "Cimitarra",
    "Shield": "Escudo",
    "Shortbow": "Arco Curto",
    "Shortsword": "Espada Curta",
    "Sickle": "Foice Curta",
    "Spear": "Lança",
    "Spears": "Lanças",
    "Splint Armor": "Cota de Talas",
    "Studded Leather Armor": "Armadura de Couro Batido",
    "Thieves' Tools": "Ferramentas de Ladrão",
    "Wand": "Varinha",
    "Warhammer": "Martelo de Guerra",
}


def metros(pes: int) -> str:
    """5 pés viram 1,5 m: 30 cm por pé, com vírgula."""
    m = pes * 0.3
    texto = f"{m:.1f}".replace(".", ",")
    return texto[:-2] if texto.endswith(",0") else texto


def trocar(texto: str, tabela: dict[str, str]) -> str:
    """Troca as palavras inteiras da tabela, das mais longas para as curtas."""
    for en in sorted(tabela, key=len, reverse=True):
        texto = re.sub(rf"(?<![A-Za-z]){re.escape(en)}(?![a-z])", tabela[en], texto)
    return texto


def linha(en: str) -> str:
    """'Large Aberration, Lawful Evil' → 'Aberração Grande, Leal e Mau'."""
    corpo, tendencia = en.rsplit(", ", 1)
    m = re.match(r"(Tiny|Small|Medium|Large|Huge|Gargantuan)(?: or (Small|Medium))? (.+)", corpo)
    tamanho = TAMANHOS[m[1]] + (f" ou {TAMANHOS[m[2]]}" if m[2] else "")
    resto = m[3]
    enxame = re.match(r"Swarm of Tiny (\w+)", resto)
    if enxame:
        tipo = f"Enxame de {TIPOS_PLURAL[enxame[1]]}"
        return f"{tipo} {tamanho}, {TENDENCIAS[tendencia]}"
    t = re.match(r"(\w+)(?: \((\w+)\))?", resto)
    tipo = TIPOS[t[1]] + (f" ({ETIQUETAS[t[2]]})" if t[2] else "")
    if TIPOS[t[1]] in FEMININOS:
        tamanho = re.sub(r"o\b", "a", tamanho)
    return f"{tipo} {tamanho}, {TENDENCIAS[tendencia]}"


FEMININOS = {"Aberração", "Fera", "Fada", "Monstruosidade", "Gosma", "Planta"}


def deslocamento(en: str) -> str:
    texto = re.sub(r"(\d+) ft\.", lambda m: f"{metros(int(m[1]))} m", en)
    texto = trocar(
        texto,
        {
            "Climb or Fly": "Escalada ou Voo",
            "Burrow": "Escavação",
            "Climb": "Escalada",
            "Fly": "Voo",
            "Swim": "Natação",
            "(hover)": "(pairar)",
            "(GM's choice)": "(escolha do Mestre)",
        },
    )
    return re.sub(
        r"\((\w+) form only\)",
        lambda m: f"(só na forma de {ANIMAIS_FORMA[m[1]]})",
        texto,
    )


ANIMAIS_FORMA = {"bear": "urso", "boar": "javali", "rat": "rato", "tiger": "tigre", "wolf": "lobo"}


def sentidos(en: str) -> str:
    texto = re.sub(r"(\d+) ft\.", lambda m: f"{metros(int(m[1]))} m", en)
    return trocar(
        texto,
        {
            "Passive Perception": "Percepção Passiva",
            "Darkvision": "Visão no Escuro",
            "Blindsight": "Percepção às Cegas",
            "Truesight": "Visão Verdadeira",
            "Tremorsense": "Sentido Sísmico",
            "(unimpeded by magical Darkness)": "(a Escuridão mágica não atrapalha)",
        },
    )


def idiomas(en: str) -> str:
    texto = re.sub(r"(\d+) ft\.", lambda m: f"{metros(int(m[1]))} m", en)
    frases = {
        "Understands commands given in any language but can't speak": "entende ordens dadas em qualquer idioma, mas não fala",
        "but can't speak them": "mas não os fala",
        "but can't speak": "mas não fala",
        "Understands": "Entende",
        "understands": "entende",
        "(can't speak in bear form)": "(não fala na forma de urso)",
        "(can't speak in boar form)": "(não fala na forma de javali)",
        "(can't speak in rat form)": "(não fala na forma de rato)",
        "(can't speak in tiger form)": "(não fala na forma de tigre)",
        "(can't speak in wolf form)": "(não fala na forma de lobo)",
        "(works only with creatures that understand Abyssal)": "(só funciona com criaturas que entendem Abissal)",
        "(doesn't allow the receiving creature to respond telepathically)": "(quem recebe não consegue responder por telepatia)",
        "plus one other language": "e mais um idioma",
        "plus two other languages": "e mais dois idiomas",
        "plus three other languages": "e mais três idiomas",
        "plus five other languages": "e mais cinco idiomas",
        "telepathy": "telepatia",
        "None": "nenhum",
        "All": "todos",
    }
    texto = re.sub(r",? and ", " e ", texto)
    texto = trocar(texto, frases)
    texto = re.sub(r" (mas não)", r", \1", texto)
    return trocar(texto, IDIOMAS)


def lista_de_danos(en: str) -> str:
    """'Poison, Thunder; Exhaustion, Poisoned' → danos e condições."""
    texto = trocar(en, {**DANOS, **CONDICOES})
    texto = texto.replace(
        "Damage type chosen for the Draconic Origin trait below",
        "o tipo de dano escolhido no traço Origem Dracônica, abaixo",
    )
    texto = texto.replace("(with _Mind Blank_)", "(com _Mente Vazia_)")
    texto = texto.replace("(except from its vampire master)", "(menos pelo vampiro mestre)")
    return re.sub(
        r"Perfurante damage from weapons wielded by creatures under the effect of a _Bless_ spell",
        "Perfurante de armas empunhadas por criaturas sob o efeito da magia _Bênção_",
        texto,
    )


def pericias(en: str) -> str:
    return trocar(en, PERICIAS)


def equipamento(en: str) -> str:
    return trocar(en, EQUIPAMENTO)


def nd(en: str) -> tuple[str, str, str]:
    """'10 (XP 5,900, or 7,200 in lair; PB +4)' → ('10', '5.900 ou 7.200 no covil', '+4')."""
    # Quatro fichas escrevem "(700 XP; PB +2)" em vez de "(XP 700; PB +2)"
    en = re.sub(r"\(([\d,]+) XP;", r"(XP \1;", en)
    m = re.match(r"(\S+) \(XP ([\d,]+)(?:, or ([\d,]+) in lair)?; PB ([+−-]\d+)\)", en)
    xp = m[2].replace(",", ".")
    if m[3]:
        xp += f" (ou {m[3].replace(',', '.')} no covil)"
    return m[1], xp, m[4]


# Ataques simples: "_Melee Attack Roll:_ +9, reach 15 ft. _Hit:_ 12 (2d6 + 5) Bludgeoning damage."
_TIPO = "|".join(DANOS)
_DADO = rf"(\d+(?: \(\d+d\d+(?: [+−-] \d+)?\))?) ({_TIPO}) damage"
_ALCANCE = r"(reach (\d+) ft\.|range (\d+)/(\d+) ft\.|reach (\d+) ft\. or range (\d+)/(\d+) ft\.)"
ATAQUE = re.compile(
    rf"_(Melee|Ranged|Melee or Ranged) Attack Roll:_ ([+−-]\d+), {_ALCANCE}"
    rf"( \(with Advantage if the target has the (\w+) condition\))? _Hit:_ {_DADO}"
    rf"(?:,? (plus|and) {_DADO})?\."
)
TIPOS_ATAQUE = {
    "Melee": "Corpo a Corpo",
    "Ranged": "à Distância",
    "Melee or Ranged": "Corpo a Corpo ou à Distância",
}


def ataque(m: re.Match) -> str:
    if m[4]:
        alc = f"alcance {metros(int(m[4]))} m"
    elif m[5]:
        alc = f"alcance {metros(int(m[5]))}/{metros(int(m[6]))} m"
    else:
        alc = f"alcance {metros(int(m[7]))} m ou {metros(int(m[8]))}/{metros(int(m[9]))} m"
    texto = f"_Jogada de Ataque {TIPOS_ATAQUE[m[1]]}:_ {m[2]}, {alc}"
    if m[10]:
        texto += f" (com Vantagem se o alvo estiver com a condição {CONDICOES[m[11]]})"
    texto += f". _Acerto:_ {m[12]} de {DANO_FRASE[m[13]]}"
    if m[14]:
        texto += f" mais {m[15]} de {DANO_FRASE[m[16]]}"
    return texto + "."


def ataque_simples(en: str) -> str | None:
    """Traduz a entrada se ela for só um ataque simples; se não, None."""
    m = ATAQUE.fullmatch(en)
    return ataque(m) if m else None


def rascunho(en: str) -> str:
    """Adianta o que é fixo, para servir de base à tradução à mão."""
    texto = ATAQUE.sub(ataque, en)
    texto = re.sub(r"(\d+)-foot", lambda m: f"[{metros(int(m[1]))} m]", texto)
    texto = re.sub(r"(\d+) (?:feet|ft\.)", lambda m: f"[{metros(int(m[1]))} m]", texto)
    return texto
