"""
O mapa novo: cada continente pintado à parte, no máximo de resolução, e as
camadas que vão por cima e por baixo (o oceano, as nuvens).

Os continentes vêm sem água em volta, num fundo magenta liso: o importador
recorta o magenta, faz a faixa de água rasa da costa e monta tudo sobre o
oceano, na mesma posição do mapa de hoje. Assim os três ficam do mesmo
tamanho e no mesmo traço, e o mapa final pode ter muitos mil pixels sem que
o celular baixe tudo: ele é servido em ladrilhos, só o pedaço da tela.

Os prompts saem prontos (o guia não acrescenta o estilo geral das
ilustrações): mapa tem estilo próprio.

O que é sugestão minha, e não do Arion, está marcado com ✦.
"""

PASTA = "mapa/novo"

ESTILO = (
    "Style: a hand-drawn fantasy atlas map seen from directly above, like the classic maps in "
    "fantasy novels and D&D sourcebooks, painted in rich but slightly muted colors. Tiny "
    "illustrated mountains in relief with fine ink outlines, forests drawn as clusters of many "
    "small individual trees, rivers in blue ink that get wider toward the sea, a coastline with "
    "a fine inked edge, and towns, villages and castles drawn as tiny detailed buildings seen "
    "from a slight three-quarter view. Light comes from the top left. Very fine detail "
    "everywhere, because the map will be zoomed in a lot on the website."
)

SEM_AGUA = (
    "Avoid: any text, labels, names, letters, numbers or runes; compass rose, scale bar, legend, "
    "grid or rhumb lines; border, frame or parchment edges; ships and sea creatures. And no "
    "water around the land: the land sits on a perfectly flat, solid magenta #FF00FF background "
    "that reaches every edge, so it can be cut out cleanly. Lakes and rivers inside the land "
    "stay as water."
)

REFERENCIA = (
    "References: I attached (1) my color guide for this land, made in the map tool of my site: "
    "follow its outline, its proportions and the position of every painted area and symbol "
    "exactly. Colors: dark blue = open sea, dark green = dense forest, light green = grassland and farmland, brown = "
    "mountains, white = snow and ice, sand = desert and salt, olive = swamp, purple-brown = "
    "cursed land with dead trees, red = volcanic land and lava, light blue = lakes and rivers, "
    "tan lines = roads, pink line = a colossal stone wall; ● = a large walled city, • = a small "
    "village, ■ = castle or fortress, ▼ = harbor town, ✚ = temple, ▲ = lone tower, ✕ = ruins. "
    "(2) A crop of the old map of the same land, only to remember what is there; do not copy "
    "its drawing style or its text."
)

MESMO_TRACO = (
    "Consistency: this is one of three continents of the same world map. If the finished map "
    "of Mitrael is attached, match its drawing style, line weight, colors, tree and mountain "
    "symbols and scale exactly, as if the same artist drew both on the same day."
)

FORMATO_CONTINENTE = (
    "Format: landscape, 1536 x 1024 px, north at the top. The land fills most of the image, "
    "with a little magenta margin on every side."
)


def continente(assunto):
    return "\n".join(
        [
            'Create ONE image: a continent for the world map of the tabletop RPG setting '
            '"Terras de Mitrael".',
            f"Subject: {assunto}",
            REFERENCIA,
            MESMO_TRACO,
            FORMATO_CONTINENTE,
            ESTILO,
            SEM_AGUA,
        ]
    )


MITRAEL = continente(
    "the continent of Mitrael, the human kingdom. Its northern half is Sovara Mithr, a vast, "
    "ancient magical forest, much bigger and denser than any other woodland on the map, with "
    "one colossal sacred tree rising high above the canopy near its center. A long rocky "
    "mountain ridge runs diagonally through the middle of the land, with a tall lone peak on "
    "its eastern side and a dark chasm in the hills to the east. A river comes down from the "
    "forest and crosses the central plains, which are full of farmland, small villages, lakes "
    "and roads. On the east coast stand a city of sorcerers with arcane towers and a great "
    "temple city of clerics. On the southeastern coast lies Razavar, the royal capital: a huge, "
    "very dense walled city with many districts, towers, a royal palace on high ground and a "
    "harbor full of docks, surrounded by farmland and villages. In the south there is a wide "
    "swamp. The southwestern peninsula is Undaryus, a cursed, rotten land of dead black forest "
    "and grey ash. A colossal fortified stone wall, with watchtowers along it, crosses the land "
    "from coast to coast and seals Undaryus off from the rest of the continent."
)

ASKAR = continente(
    "the continent of Askar, homeland of the orcs: a hostile land of red rock, ash and lava, "
    "cracked and glowing in places. A great active volcano stands on its southern coast with "
    "lava rivers running from it. Long jagged mountain ranges cross the land. Near the center "
    "rises a huge stone colossus statue, and not far from it a vast arena city. Forges with "
    "smoke columns are spread through the land. A grim orc fortress city stands on the eastern "
    "coast, a dark forest of red-leaved trees lies in the southeast, and a scorched plain opens "
    "in the south. The northeastern peninsula is mountainous, with dragon nests on its peaks, "
    "and a long thin peninsula reaches out to the west."
)

NORTE = continente(
    "the northern continent. In the west, the Fingers of the Tundra: long frozen peninsulas "
    "like fingers of snow and ice, with dark rocky mountains, ancient giant-sized castles and "
    "a fortified mountain pass of ice. In the center, Tungel: wide golden grassland plains with "
    "a large lake in the middle, wooded hills and a river in the northeast, a sacred standing "
    "stone monument on the plains, and a long tongue-shaped peninsula reaching to the "
    "southwest. In the east, Marily: a white salt desert of salt flats and low dunes, with a "
    "castle of portal-tamers and glowing violet portals in its far northeast corner. Follow the "
    "color guide to know where Marily touches Tungel and where the sea separates them."
)

ILHAS = continente(
    "the islands of the same world, each one separate on the sheet, with magenta between "
    "them: a kingdom of green islands with a sea-castle city on the largest one; a rocky "
    "island crowned by a huge walled fortress; a small forested island; a tiny island with a "
    "lone observatory tower; and a few small uninhabited islands."
)

OCEANO = "\n".join(
    [
        'Create ONE image: the sea texture for the world map of the tabletop RPG setting '
        '"Terras de Mitrael".',
        "Subject: deep teal and blue water seen from directly above, painted in the same "
        "hand-drawn fantasy atlas style as the continents: soft painted color variation and "
        "small hand-drawn wave strokes, with a faint paper grain.",
        "Format: square, 1024 x 1024 px, a seamless tileable texture: the left edge must "
        "continue into the right edge and the top into the bottom. Even, flat lighting with no "
        "vignette and no big shapes, so the tiles join invisibly.",
        "Avoid: land, islands, ships, creatures, text, compass, lines, border, frame.",
    ]
)


def nuvem(forma):
    return "\n".join(
        [
            'Create ONE image: a cloud layer for the world map of the tabletop RPG setting '
            '"Terras de Mitrael". It floats above the map and fades away as you zoom in.',
            f"Subject: {forma}, seen from directly above, painted in a soft hand-painted fantasy "
            "style, white with a pale golden light from the top left and soft blue-grey shade, "
            "edges that dissolve into wisps.",
            "Format: PNG with a fully transparent background, landscape 1536 x 1024 px. Only "
            "the cloud, nothing else.",
            "Avoid: ground, sea, sky color, shadow on the ground, text, border, frame.",
        ]
    )


def detalhe(o_que):
    return "\n".join(
        [
            'Create ONE image: a small decoration for the sea of the world map of the tabletop '
            'RPG setting "Terras de Mitrael".',
            f"Subject: {o_que}, seen from above at a slight angle, drawn in the same hand-drawn "
            "fantasy atlas style as the map, with fine ink outlines.",
            "Format: PNG with a fully transparent background, square 1024 x 1024 px. Only the "
            "object, centered.",
            "Avoid: water around it, text, border, frame.",
        ]
    )


ARTES = [
    ("mapa-mitrael", "Continente: Mitrael", "mapa", "o mapa, embaixo de tudo", MITRAEL),
    ("mapa-askar", "Continente: Askar", "mapa", "o mapa, embaixo de tudo", ASKAR),
    ("mapa-norte", "Continente do norte (Dedos da Tundra, Tungel e Marily)", "mapa", "o mapa, embaixo de tudo", NORTE),
    ("mapa-ilhas", "As ilhas (Gtry, Enclausurador, Pondor, Observatório) ✦", "mapa", "o mapa, embaixo de tudo", ILHAS),
    ("mapa-oceano", "O mar (textura que se repete)", "textura", "o fundo do mapa inteiro", OCEANO),
    ("mapa-nuvem-1", "Nuvem grande", "transparente", "por cima do mapa, some ao aproximar", nuvem("one big, dense cluster of clouds")),
    ("mapa-nuvem-2", "Nuvens finas e compridas", "transparente", "por cima do mapa, some ao aproximar", nuvem("long thin streaks of wispy clouds")),
    ("mapa-nuvem-3", "Nuvenzinhas soltas", "transparente", "por cima do mapa, some ao aproximar", nuvem("a few small scattered cloud puffs")),
    ("mapa-navio", "Navio no mar ✦", "transparente-quadrado", "no mar, entre os continentes", detalhe("a medieval sailing ship with white sails")),
    ("mapa-serpente", "Serpente marinha ✦", "transparente-quadrado", "no mar, entre os continentes", detalhe("a great sea serpent with coils rising out of the water")),
]

EXPLICA = """
<strong>Como fazer o mapa novo</strong>
<ol>
  <li><strong>Pinte o guia de cada continente</strong> em <code>/mestre/pintar-mapa/</code>, por cima do mapa de hoje: a forma da terra, as florestas (Sovara Mithr maior), as cidades e vilas novas com os símbolos e o muro de Undaryus com o pincel <em>Muro</em>. Baixe a <em>Referência</em> (só as cores) e, na Pré-visualização do Mac, recorte só aquele continente, com um pouco de mar em volta e perto de 3:2. Recorte o mesmo pedaço do mapa antigo.</li>
  <li><strong>Mitrael primeiro.</strong> Numa conversa nova do ChatGPT, anexe os dois recortes e cole o prompt. Peça ajustes até ficar do jeito que você quer: ele vira o padrão dos outros.</li>
  <li><strong>Askar, o norte e as ilhas:</strong> anexe também o Mitrael pronto. O prompt já pede o mesmo traço.</li>
  <li><strong>Resolução:</strong> passe cada continente pronto no <em>Upscaler</em> do Magnific, em 4x (1536 vira 6144 px de largura), com criatividade baixa (0 a 2) e semelhança alta, para ele só afinar o traço sem inventar coisa nova. Se ficar bom, mais 2x. Salve em PNG.</li>
  <li><strong>Oceano, nuvens e detalhes</strong> não precisam de guia: é colar o prompt. As nuvens e os detalhes vêm com fundo transparente.</li>
  <li><strong>Entregue</strong> em <code>Documents/Artes prontas</code> com o nome de cada uma. Eu recorto o magenta, faço a água rasa da costa, monto tudo sobre o oceano na posição do mapa de hoje e corto em ladrilhos por nível de zoom: o celular baixa só o pedaço da tela, então dá para ter o máximo de resolução sem pesar.</li>
</ol>
<p><strong>Sem nomes no desenho:</strong> os nomes passam a ser do site, que mostra cada um no zoom certo (os reinos de longe, as vilas de perto) e pode traduzir ou trocar sem gerar a arte de novo.</p>
"""
