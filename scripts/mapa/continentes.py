"""
As peças do mapa novo: cada continente (ou grupo de ilhas) que vai ser
repintado sozinho no ChatGPT e depois volta para o seu lugar.

Cada peça junta uma ou mais regiões de gerar-regioes.py e, se for o caso,
ilhas soltas que nenhuma região cobre (achadas por um ponto perto delas).
O texto de cada peça descreve só o que está desenhado ali, para o prompt.
"""

ESTILO = (
    "Repaint this piece of a hand-drawn fantasy world map at much higher detail and "
    "quality, as a top-down painted atlas illustration in the style of a premium "
    "fantasy game world map (painterly, rich textures, crisp linework, individual "
    "tree canopies, sculpted mountain ridges, winding rivers). "
    "KEEP EXACTLY the same coastline, outline, proportions and the position of every "
    "mountain, forest, river, lake, road and building: this piece must fit back into "
    "the full map. Do not add or remove land. "
    "Lighting: soft, even daylight from the top-left (northwest), the same on every "
    "piece; no glow, no vignette, no colored light, no dramatic shadows, no color "
    "grading. "
    "REMOVE all text, names, labels, banners, round emblem badges and icons; keep the "
    "drawn buildings, castles and landmarks themselves. "
    "Land only: everything outside the land must be fully TRANSPARENT (no sea, no "
    "water around the coast, no frame, no paper). Inner lakes and rivers stay painted. "
    "Same aspect ratio as the input image."
)

# x, y em pixels do mapa de 1600 x 1132: um ponto perto de cada ilha solta
PECAS = [
    {
        "chave": "tundra",
        "nome": "Os Dedos da Tundra",
        "regioes": ["tundra"],
        "ilhas": [],
        "descricao": (
            "A frozen northern tundra: snow-covered land with long icy fingers of "
            "land reaching south into the sea, dark rocky crags, a few stone "
            "fortresses and castles on the snow, and a mountain pass in the east."
        ),
    },
    {
        "chave": "tungel",
        "nome": "Terras de Tungel",
        "regioes": ["tungel"],
        "ilhas": [],
        "descricao": (
            "Wide golden-green grassy plains, rolling hills and scattered woods, a "
            "large lake in the middle, rivers from the northern hills, dense green "
            "forests to the north-east, brown mountains in the north, and a stepped "
            "stone temple on the plains south of the lake."
        ),
    },
    {
        "chave": "marily",
        "nome": "Marily",
        "regioes": ["marily"],
        "ilhas": [(1416, 325), (1421, 357), (1376, 360)],
        "descricao": (
            "A pale salt desert: cracked white and grey salt flats, low dunes, a "
            "walled city with towers in the far north, and a few small rocky islets "
            "off the southern coast."
        ),
    },
    {
        "chave": "gtry",
        "nome": "Reinado de Gtry",
        "regioes": ["gtry"],
        "ilhas": [],
        "descricao": (
            "A group of green islands of a maritime kingdom: forested hills, a tall "
            "castle with towers by the coast of the main island, and smaller wooded "
            "islands to the west and east."
        ),
    },
    {
        "chave": "askar",
        "nome": "Terras de Askar",
        "regioes": ["askar"],
        "ilhas": [],
        "descricao": (
            "A harsh red volcanic continent: rust-red earth, dark red pine forests, "
            "jagged brown mountain ranges, an inner sea with a small volcanic island, "
            "an erupting volcano in the south, a great round arena and a walled city "
            "in the west, and a brown rocky mountain realm in the north."
        ),
    },
    {
        "chave": "ilhas-leviano",
        "nome": "Ilhas do Mar Leviano",
        "regioes": ["pondor"],
        "ilhas": [(639, 648), (745, 1030), (696, 949)],
        "descricao": (
            "Four separate small green islands spread over the sea: a forested island, "
            "a small island with a stone observatory tower, a larger wooded island in "
            "the south, and a tiny islet. Keep them as separate islands in the same "
            "places."
        ),
    },
    {
        "chave": "enclausurador",
        "nome": "Enclausurador",
        "regioes": ["enclausurador"],
        "ilhas": [],
        "descricao": (
            "A rugged island with brown cliffs and green forests, crowned by a large "
            "walled stone fortress in its center."
        ),
    },
    {
        "chave": "mitrael",
        "nome": "Terras de Mitrael",
        "regioes": ["mitrael"],
        "ilhas": [(1213, 1007)],
        "descricao": (
            "The eastern kingdoms: a vast dense green forest in the north with a "
            "great sacred tree, a long brown mountain ridge running north to south, "
            "golden plains with rivers, small lakes, roads and towns in the "
            "south-east, a royal palace city on the south-east coast, and a dark, "
            "dead grey-black forest and swamp in the south-west."
        ),
    },
]
