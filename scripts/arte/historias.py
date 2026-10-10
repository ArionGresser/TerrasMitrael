"""
As artes das histórias: as capas e as cenas da Saga, da Grande Guerra
Leviana e dos locais do mapa. Entra no catálogo junto com as do Livro.

Cada cena saiu do texto que já está no site: nada aqui acontece que não
tenha acontecido na mesa ou na história escrita. O campo "onde" diz em que
ponto do texto a imagem entra, para quem for encaixá-la depois.

Os personagens das cenas pedem referência: o guia mostra quais retratos
anexar, e eles ficam em Documents/Artes prontas/_referencias-para-prompts.
"""

from pathlib import Path

REFERENCIAS = Path.home() / "Documents/Artes prontas/_referencias-para-prompts"
CAPAS = REFERENCIAS / "referencias-capa-personagens"

# A imagem de estilo das cenas e a fila com o nome de cada um
ESTILO_DAS_CENAS = "00-estilo-grupo-nas-ruinas.jpg"
TODOS_JUNTOS = "00-todos-juntos.jpg"

# Quem é quem, para o prompt e para saber que retrato anexar
PERSONAGENS = {
    "lily": (
        "09-lily-bouvardia.jpg",
        "Lily Bouvardia, a young centaur cleric with long wavy bright pink hair, dark deer "
        "antlers, big blue eyes, freckles and a warm brown horse body with a long pink tail",
    ),
    "pyhmm": (
        "10-pyhmm-phylimm.jpg",
        "Pyhmm Phylimm, a small grumpy halfling rogue with wild spiky white hair, heavy brows "
        "and a scowl",
    ),
    "johnny": (
        "08-johnny-bling-bling.jpg",
        "Johnny Bling Bling Money, a green-skinned goblin warlock with messy black hair, a smug "
        "grin and a metal grill on his teeth",
    ),
    "vrakyr": (
        "11-vrakyr-windrose.jpg",
        "Vrakyr WindRose, a stocky bald dwarf with dark rune tattoos on his head and a long "
        "braided black beard",
    ),
    "egon": (
        "12-egon-vitriol.jpg",
        "Egon Vitriol, a tall leonine paladin with dark brown fur, a pale cream-white mane, "
        "ivory plate armor and a rune-engraved double-bladed battle axe",
    ),
}

# Como cada um está vestido em cada trecho da temporada
SEM_NADA = (
    "They were captured and stripped of all their gear: no armor, no weapons, no crown, only "
    "ragged scraps of cloth, and each wears a cold iron collar around the neck"
)
COM_EQUIPAMENTO = "They wear their usual outfits and gear, as in the reference images"


def cena(slug, nome, onde, assunto, quem=(), formato="cena", roupa=None, contexto=None):
    return {
        "slug": slug,
        "nome": nome,
        "onde": onde,
        "assunto": assunto,
        "quem": list(quem),
        "formato": formato,
        "roupa": roupa,
        "contexto": contexto,
    }


# ---------- A Saga: temporada 2 ----------
# Lily, Pyhmm e Johnny acordam presos na mina de Varek; Vrakyr chega no 2,
# Egon no 4. No 1 e no começo do 2 eles estão sem nada; recuperam tudo na
# "linha de montagem" do episódio 2.

EP = "contos/cronicas"

SAGA_T2 = [
    # Episódio 1: Ferro Frio
    cena(
        "t2e1-capa", "Ep. 1 · capa: o salto sobre o ácido", "capa do episódio 1",
        "Lily the centaur leaping across a deep chasm in an underground dungeon; far below, a "
        "river of glowing green acid bubbles and sends green smoke up around her hooves; beside "
        "her hangs a flimsy rope-and-plank bridge patched many times; on the far ledge Pyhmm and "
        "Johnny watch her jump; the whole stone dungeon is lit from below by the green glow",
        quem=("lily", "pyhmm", "johnny"), roupa=SEM_NADA,
    ),
    cena(
        "t2e1-despertar", "Ep. 1 · o despertar acorrentado", "seção \"Ferro no pescoço\", antes do mapa",
        "three prisoners waking up chained in dark dungeon cells, iron collars on their necks "
        "linked by iron chains to the stone wall; outside the cells two decrepit, slow skeletons "
        "drag a limp hooded prisoner toward a patched rope bridge; green smoke and an eerie green "
        "glow rise from the chasm under the bridge",
        quem=("lily", "pyhmm", "johnny"), roupa=SEM_NADA,
    ),
    cena(
        "t2e1-fuga", "Ep. 1 · a fuga das celas", "seção \"A fuga\"",
        "a chaotic prison break: Lily, still chained by the neck, kicks a decrepit skeleton apart "
        "with her hooves while an iron cell door lies broken on the floor; Pyhmm smashes another "
        "skeleton with a thigh bone; Johnny conjures a harmless illusion of a skeleton casually "
        "waving, which distracts two more skeletons arriving on the rope bridge",
        quem=("lily", "pyhmm", "johnny"), roupa=SEM_NADA,
    ),
    cena(
        "t2e1-salao-dos-ossos", "Ep. 1 · o acampamento de ossos", "seção \"O acampamento dos ossos\", antes do mapa",
        "seen from the top of a stairway: a huge amphitheater carved inside the earth, its walls "
        "covered in old pickaxe marks, filled with a camp of tattered tents whose cloth shows the "
        "shadows of skeletons standing still inside; two armored skeleton warriors guard a great "
        "wooden gate; a skeletal wolf is tied near the stairs; in the middle stands a Baneguard, "
        "a much bigger skeleton in armor holding a weapon, with an unsettling, thinking gaze; the "
        "three heroes peek from the stairway holding torches",
        quem=("lily", "pyhmm", "johnny"), roupa=SEM_NADA,
    ),
    cena(
        "t2e1-emboscada", "Ep. 1 · o Baneguard roubado na queda", "seção \"A emboscada\"",
        "a comic action moment at a dungeon doorway: the big armored Baneguard skeleton trips on "
        "a rope stretched across the door and is caught mid-fall, while Pyhmm, with impossibly "
        "fast hands, strips him of his weapon, armor pieces and a ring of keys before he even "
        "hits the floor; Lily and Johnny wait beside the door holding torches and thigh bones, "
        "ready to strike",
        quem=("lily", "pyhmm", "johnny"), roupa=SEM_NADA,
    ),
    # Episódio 2: O Que o Rio Leva
    cena(
        "t2e2-capa", "Ep. 2 · capa: o sigilo nas costas da centaura", "capa do episódio 2",
        "Lily the centaur walks calmly through a camp full of skeletons inside a huge cavern, "
        "holding up a small glowing sigil that makes the dim-witted undead ignore her; Johnny "
        "and Pyhmm hide flat on her horse back, trying not to be seen; skeletons pass right by "
        "without noticing; tattered tents and torches all around",
        quem=("lily", "pyhmm", "johnny"), roupa=SEM_NADA,
    ),
    cena(
        "t2e2-comboio", "Ep. 2 · o comboio de prisioneiros", "seção \"O comboio\", antes do mapa",
        "the great gate of an underground skeleton camp opens and a convoy of wooden carts rolls "
        "in, escorted by armored skeleton warriors; the carts carry covered bodies, dead animals "
        "and chained living prisoners, among them a bald dwarf with rune tattoos and a braided "
        "black beard; from a stairway in the foreground, the three heroes watch in hiding",
        quem=("lily", "pyhmm", "johnny", "vrakyr"), roupa=SEM_NADA,
    ),
    cena(
        "t2e2-pedra", "Ep. 2 · Vrakyr lê a pedra", "seção \"O que a pedra conta\"",
        "Vrakyr the dwarf kneels with his palm pressed flat on the stone floor of a cavern, eyes "
        "closed, feeling the vibrations of dozens of skeletons moving around; faint ripples "
        "spread through the rock from his hand; the cavern walls show the precise pickaxe "
        "patterns and broken arches of an ancient dwarven mine; his companions watch him in "
        "silence",
        quem=("vrakyr", "lily", "pyhmm", "johnny"), roupa=SEM_NADA,
    ),
    cena(
        "t2e2-lobo", "Ep. 2 · o lobo esqueleto se solta", "seção \"Pela esquerda\"",
        "a skeletal wolf snaps its rope and lunges at Pyhmm the halfling, who meets it with one "
        "precise strike that bursts the wolf into a cloud of flying bones; tents and torchlight "
        "of the skeleton camp behind",
        quem=("pyhmm",), roupa=SEM_NADA,
    ),
    cena(
        "t2e2-linha-de-montagem", "Ep. 2 · a linha de montagem de Varek", "seção \"A linha de montagem\"",
        "a grim view of a necromancer's assembly line deep inside a mine: a river of glowing "
        "green acid runs through a tunnel, and downstream only clean white bones drift with the "
        "current toward a dark opening where green necromantic light waits; on a rocky ledge "
        "above, the heroes, now wearing their recovered gear again, look down at it in horror",
        quem=("lily", "pyhmm", "johnny", "vrakyr"), roupa=COM_EQUIPAMENTO,
    ),
    # Episódio 3: Aventureiros!
    cena(
        "t2e3-capa", "Ep. 3 · capa: chegada a Portela do Véu", "capa do episódio 3",
        "early evening arrival at Portela do Véu, a small toll village of stone houses with dark "
        "roofs by a river: the heroes cross a stone bridge, the dwarf walking ahead alone; the "
        "village opens up in front of them with a square, a town hall, a white chapel, a water "
        "mill, and a stone well in the middle of the square with a line of villagers waiting "
        "with buckets",
        quem=("lily", "pyhmm", "johnny", "vrakyr"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e3-confissao", "Ep. 3 · Pyhmm confessa no caminho", "seção \"O que Pyhmm tinha para contar\"",
        "descending a grassy hill path toward a valley village at dusk: Pyhmm walks with a guilty "
        "face, explaining something with his hands, while Lily and Johnny listen; far ahead on "
        "the path, Vrakyr walks alone, his back turned to them",
        quem=("pyhmm", "lily", "johnny", "vrakyr"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e3-mercador", "Ep. 3 · as flechas do mercador", "seção \"O mercador da estrada\"",
        "a roadside merchant's stall about to close at dusk, crowded with simple weapons and "
        "potion bottles; Johnny and Lily haggle with the merchant, selling old weapons and "
        "buying healing potions, while behind them Pyhmm sneakily slips a handful of arrows "
        "into his quiver with an innocent face",
        quem=("johnny", "lily", "pyhmm"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e3-quirina", "Ep. 3 · \"Aventureiros!\"", "seção \"A velha Quirina\"",
        "a rowdy village tavern feast with mugs of mead: a cranky old woman points a crooked "
        "finger and shouts at the heroes' table, Johnny the goblin shouts right back at her, "
        "and Pyhmm stares at a single parchment page tucked into her belt; the tavern keeper "
        "hurries over to drag her away; other patrons laugh",
        quem=("johnny", "pyhmm", "lily"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e3-telhado", "Ep. 3 · Pyhmm no telhado", "seção \"Do telhado\"",
        "night: Pyhmm the halfling sits alone on the roof of a village tavern, looking over the "
        "sleeping rooftops of a small river village, a few windows still lit, thinking",
        quem=("pyhmm",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e3-cemiterio", "Ep. 3 · o cemitério e a cova aberta", "seção \"O cemitério\"",
        "early morning in a hillside village cemetery: a sister of the chapel in simple robes "
        "lights candles among the graves; beside them rises a beautiful natural standing stone "
        "covered in rows of tiny carved marks, too small to read; one grave has been dug open "
        "and robbed of its bones; Pyhmm stands beside it, worried",
        quem=("pyhmm",), roupa=COM_EQUIPAMENTO,
    ),
    # Episódio 4: O Fiscal de Varek
    cena(
        "t2e4-capa", "Ep. 4 · capa: o fiscal de Varek", "capa do episódio 4",
        "Johnny the goblin, dressed to impress in a small golden crown and a noble red cape, "
        "struts up a forest road with total confidence past two puzzled mercenaries, claiming "
        "to be an inspector sent by the necromancer; behind them, a stone spring pool in a "
        "grotto, a glowing green liquid pouring into it from a channel on the cliff, a skeleton "
        "standing guard and an archer on a narrow wooden bridge",
        quem=("johnny",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e4-capela", "Ep. 4 · a capela de Melora", "seção \"A capela de Melora\"",
        "inside a small village chapel crowded with amulets, statues and religious objects, "
        "lit by dozens of candles; in the place of honor stands a statue of a nature goddess "
        "wreathed in leaves, flowers and animals; Lily looks at it in awe, Johnny looks bored, "
        "and in a back pew a leonine paladin sits quietly, thinking, as if studying the room",
        quem=("lily", "johnny", "egon"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e4-prefeita", "Ep. 4 · a prefeita pede ajuda", "seção \"A prefeita\"",
        "inside a modest village town hall, a worried mayor pleads for help across her desk; "
        "Egon the paladin listens with great interest, Lily asks for something more, and Johnny "
        "leans back unimpressed by the small pouch of gold offered",
        quem=("egon", "lily", "johnny"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e4-sino", "Ep. 4 · o sino derruba o líder", "seção \"O exército que não existia\"",
        "at a spring grotto, a mercenary leader on a narrow wooden bridge loses his balance as "
        "ghostly rings of a funeral bell's toll hit him, and he falls toward the steaming green "
        "poisoned water below; mercenaries and skeletons turn toward the forest, where the "
        "sound of drums and marching seems to come from; Johnny casts from the stone stairs",
        quem=("johnny",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e4-coice", "Ep. 4 · o coice duplo", "seção \"A ponte\", no golpe da Lily",
        "on a stone stairway by a grotto, Lily the centaur spins her horse body and kicks a "
        "skeleton square in the ribs with both hind hooves, its bones scattering down the "
        "steps; Egon the paladin, slightly wounded, raises his axe beside her",
        quem=("lily", "egon"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e4-ponte", "Ep. 4 · Egon sozinho na ponte", "seção \"A ponte\", Egon atravessa",
        "Egon the leonine paladin alone on a narrow, rotten wooden bridge over a poisoned green "
        "spring, swinging his rune-engraved double axe to shatter a skeleton while two "
        "mercenaries charge at him; across the gap Johnny rings a ghostly bell spell, and Lily "
        "guards the top of the stone stairs",
        quem=("egon", "johnny", "lily"), roupa=COM_EQUIPAMENTO,
    ),
    # Episódio 5: O Preço do Silêncio
    cena(
        "t2e5-capa", "Ep. 5 · capa: os heróis de Portela do Véu", "capa do episódio 5",
        "the heroes return to the river village of Portela do Véu and are welcomed by a happy "
        "procession of villagers cheering and waving; Lily, Johnny, Egon and Pyhmm walk at the "
        "front, bringing back a rescued man; the stone bridge, the chapel and the well behind",
        quem=("lily", "johnny", "egon", "pyhmm"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e5-espada", "Ep. 5 · a espada que voltou", "seção \"A espada que voltou\"",
        "at a stone water channel above a grotto, a thrown sword spins through the air, bounces "
        "off the stone wall of the canal and flies back toward the wounded mercenary who threw "
        "it; Lily the centaur is mid-leap back across the gap, looking over her shoulder",
        quem=("lily",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e5-ranchinho", "Ep. 5 · o marido que não parava de falar", "seção \"O ranchinho\"",
        "a comic scene inside a small wooden shack: two people tied up on the floor, a quiet "
        "elf druid and a talkative man who will not stop begging and promising rewards; the "
        "exasperated heroes put the gag back over the man's mouth",
        quem=("lily", "johnny", "egon"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e5-pedra", "Ep. 5 · a pedra que fecha o veneno", "seção \"A pedra\"",
        "Lily the centaur and Egon the paladin push together against a huge boulder to block a "
        "channel of glowing green acid that pours from a fissure in the mountain into a spring "
        "pool; Pyhmm points at the channel, clearly built recently",
        quem=("lily", "egon", "pyhmm"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e5-amuleto", "Ep. 5 · o amuleto de Melora", "seção \"O amuleto de Melora\"",
        "in a candlelit village chapel, a sister in simple robes offers a tray of nature "
        "amulets made of wood, leaves and stone, and Lily the centaur picks one with care, "
        "touched; a statue of a nature goddess in the background",
        quem=("lily",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e5-quirina", "Ep. 5 · a velha vira pequenina", "seção \"Quirina\"",
        "in a secluded corner of a village cemetery, a cranky old woman rubs her face and the "
        "disguise melts away, revealing a young, beautiful halfling woman underneath; she hands "
        "a single parchment page to a stunned Pyhmm, while an elf druid watches",
        quem=("pyhmm",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e5-discurso", "Ep. 5 · o discurso de Egon", "seção \"A taverna\"",
        "in a packed village tavern, Egon the leonine paladin stands and gives a fiery, "
        "inspiring speech; the villagers' celebration turns into anger, they pound the tables, "
        "raise their fists and mugs and start heading for the door; Lily and Johnny beside him",
        quem=("egon", "lily", "johnny"), roupa=COM_EQUIPAMENTO,
    ),
    # Episódio 6: O Primeiro Canto do Galo
    cena(
        "t2e6-capa", "Ep. 6 · capa: o moinho ao primeiro canto do galo", "capa do episódio 6",
        "dawn by a river: an old wooden watermill with its door opening just a crack; a rooster "
        "crows on a fence; outside, the heroes' small camp with a stolen horse cart and a "
        "barrel, and Lily the centaur with a young fawn resting beside her; Pyhmm, Johnny and "
        "Egon turn toward the opening door",
        quem=("lily", "pyhmm", "johnny", "egon"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-cofre", "Ep. 6 · o cofre da taverna", "seção \"A taverna vazia\"",
        "an empty village tavern: behind the counter Pyhmm effortlessly clicks open a heavy "
        "cast-iron safe with his thieves' tools, making sure Johnny sees it, while Johnny, who "
        "failed to open it, watches annoyed; gold and silver coins glint inside",
        quem=("pyhmm", "johnny"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-praca", "Ep. 6 · a praça se levanta", "seções \"A praça\" e \"Em cima da carroça\"",
        "night in a village square packed with angry villagers holding torches and pitchforks "
        "in front of the town hall; the mayor and her husband look down from an upper window; "
        "a villager standing on a cart points at the heroes and cheers, and a circle forms "
        "around Egon the paladin as he speaks",
        quem=("egon", "pyhmm", "johnny", "lily"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-carroca", "Ep. 6 · a carroça que não estava ali", "seção \"A carroça que não estava ali\"",
        "a misty night field near a mill: a mysterious wooden cart appears out of nowhere, with "
        "scattered bones, a sack of white lime powder and an iron crest bearing a mouth full of "
        "sharp teeth swallowing a sword; Pyhmm stares at it, frightened, and the ground around "
        "it shows no tracks at all",
        quem=("pyhmm",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-coruja", "Ep. 6 · o que a coruja viu", "seção \"O que a coruja viu\"",
        "night near a riverside mill: Lily the centaur speaks with a real owl perched on a "
        "branch, using a spell to talk with animals, while Pyhmm gestures wildly about something "
        "that is no longer there",
        quem=("lily", "pyhmm"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-cervo", "Ep. 6 · o filhote de cervo", "seção \"O cervo\"",
        "just before dawn, Lily the centaur kneels her front legs to heal a wounded, frightened "
        "fawn with a deep cut on its leg, soft healing light flowing from her hands; the forest "
        "edge behind is dark",
        quem=("lily",), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-bromelia", "Ep. 6 · Bromélia na viga", "seção \"O primeiro canto do galo\"",
        "inside an old wooden watermill, a young halfling woman sits on a high support beam "
        "with her little legs dangling, looking down unimpressed; below, Pyhmm grins up at "
        "her, charmed; Johnny and Egon stand by the half-open door",
        quem=("pyhmm", "johnny", "egon"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-sala-de-guerra", "Ep. 6 · as cinzas de Brejo-Doce", "seção \"A sala de guerra\"",
        "a secret war room dug into the earth under a mill, full of gear and maps without "
        "writing, a table in the center; a young halfling woman pours fine grey ash from an urn "
        "into her palm, grave and sad; Pyhmm, Johnny and Egon listen around the table by "
        "candlelight",
        quem=("pyhmm", "johnny", "egon"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2e6-pacto", "Ep. 6 · a marca do pacto", "seção \"O que cada um carregava\"",
        "outside a riverside mill in the morning, Johnny the goblin turns his back to show a "
        "dark glowing pact mark near his shoulder and holds up the warlock symbol on his "
        "necklace; Egon the paladin and Lily the centaur stare at him, uneasy",
        quem=("johnny", "egon", "lily", "pyhmm"), roupa=COM_EQUIPAMENTO,
    ),
    cena(
        "t2-simbolo-de-varek", "O símbolo de Varek", "ícone pequeno nos episódios 6 em diante",
        "an emblem: a monstrous mouth full of sharp teeth swallowing a sword, engraved on a "
        "dark iron crest, ominous green glow",
        formato="quadrado",
        contexto="the emblem of the necromancer Varek, shown small inside the chronicle text",
    ),
]

# ---------- A Grande Guerra Leviana ----------

GUERRA = [
    cena(
        "guerra-capa", "Capa: a Grande Guerra Leviana", "capa do evento (cartão das Crônicas e alto da página)",
        "an epic battlefield of the greatest war ever fought: the armies of Mitrael, knights, "
        "volunteers of many peoples and robed war mages, clash with the Red Army of huge orcs "
        "in superior steel armor under a burning sky; red banners, smoke and flashes of magic",
    ),
    cena(
        "guerra-partida", "A frota dos Expedicionários deixa o porto", "Capítulo 1, no lugar da primeira imagem",
        "a fleet of sixteen large, advanced sailing ships leaves a busy harbor of Mitrael, some "
        "of them armored escort ships of the royal soldiers; on the decks, scholars, alchemists, "
        "astronomers and sorcerers in robes wave goodbye; crowds on the docks, optimism in the air",
    ),
    cena(
        "guerra-mar-aberto", "Semanas de mar aberto", "Capítulo 1, no lugar da segunda imagem",
        "a fleet of sailing ships alone in a vast empty ocean after weeks at sea, no land on any "
        "horizon, sails worn, crews weary, a scholar on deck looking at a brass instrument "
        "under a huge sky; a feeling of immense distance",
    ),
    cena(
        "guerra-costa-vermelha", "A costa vermelha", "Capítulo 2, no começo",
        "from the deck of a ship, jagged, reddish mountains rise on the horizon of an unknown "
        "continent; the air shimmers with unbearable heat, and on the red shore stand many huge, "
        "broad silhouettes",
    ),
    cena(
        "guerra-frota-em-chamas", "A frota recebida a fogo", "Capítulo 2, no lugar da terceira imagem",
        "ships burning along a red rocky coast under volleys of flaming arrows, hundreds of small "
        "orc boats sliding out from behind the rocks, armored escort ships trying to shield the "
        "others; smoke and fire on the water",
    ),
    cena(
        "guerra-retorno", "Quatro navios voltam", "Capítulo 3, no começo",
        "only four battered, scorched ships with the Expeditioners' banners limp back into a "
        "harbor of Mitrael; on the docks, a small group of citizens notice something is wrong; "
        "traumatized survivors on the decks",
    ),
    cena(
        "guerra-seis-orcs", "Seis orcs na praia", "Capítulo 3, no desembarque",
        "dusk on a lonely beach near a quiet farming village: a small boat has landed and six "
        "huge orcs in fine steel armor walk up the sand toward the village lights; ominous, no "
        "gore",
    ),
    cena(
        "guerra-cavaleiros", "Os Cavaleiros de Elite Reais", "Capítulo 4, nos cinquenta dias",
        "the Royal Elite Knights of Mitrael charge in shining armor with banners against a wall "
        "of orcs whose steel is visibly superior; a hard, desperate battle in a burned field",
    ),
    cena(
        "guerra-voluntarios", "Os Honrados Voluntários", "Capítulo 4, no chamado do Rei",
        "a king in a crown addresses a vast gathering of volunteers of every people of the "
        "continent: humans, dwarves, elves, beastfolk and northern warriors, farmers with "
        "spears beside veterans, all answering the call to defend their home",
    ),
    cena(
        "guerra-magos", "Os Lendários Magos e os de Vérsia", "Capítulo 5, na magia proibida",
        "on a ruined battlefield, a circle of legendary mages and mysterious hooded figures "
        "unleash forbidden magic of terrifying power; a colossal wave of dark energy sweeps "
        "over the red army, and the land itself withers, blackens and rots where it passes",
    ),
    cena(
        "guerra-domo", "O domo sobre Áskar", "Capítulo 5, no fim da guerra",
        "a gigantic transparent magical dome rises from the sea around a whole red continent "
        "and disappears above the clouds; from a ship far away it looks like a heat distortion "
        "on the horizon",
    ),
    cena(
        "guerra-vigilia", "Treze mil trezentos e trinta e três dias", "\"O que a vitória custou\"",
        "dusk in the narrow streets of a poor city quarter: on each doorstep burn candles for "
        "the dead of the war, some thresholds with ten or fifteen candles; families sit quietly "
        "beside them",
    ),
]

# ---------- Os locais do mapa ----------

LOCAIS = [
    # Razavar
    cena(
        "razavar-capa", "Razavar · capa", "capa do local",
        "the great capital city of Razavar built in layers: the royal palace and hanging gardens "
        "on the highest point inside an inner wall, a district of forges and workshops spiraling "
        "down from it, and a sprawling lower city that spills beyond the outer wall; crowds of "
        "immigrants arrive at the gates",
    ),
    cena(
        "razavar-feira", "Razavar · a Feira dos Mil Ofícios", "seção \"Cultura\"",
        "a lively craft fair filling a spiral street of workshops: guilds show their best work "
        "on open benches, smiths, glassblowers and weavers; a young apprentice challenges an old "
        "master to a test of skill while a crowd of nobles, commoners and foreigners watches",
    ),
    cena(
        "razavar-vigilia", "Razavar · a Vigília dos Nomes", "seção \"Cultura\"",
        "nightfall in the lower city: every family lights a candle on the doorstep for each "
        "relative lost in the war; some doorsteps have ten or fifteen candles; a silent, moving "
        "street of small lights",
    ),
    cena(
        "razavar-fora-portao", "Razavar · Fora-Portão", "seção \"A cidade em camadas\"",
        "outside the outer city wall, a new quarter built in a hurry for post-war immigrants, "
        "crooked wooden houses without any order, laundry lines and market stalls, people of "
        "many races; the old wall and the palace towers rise behind",
    ),
    # Sovara Mithr
    cena(
        "sovara-mithr-capa", "Sovara Mithr · capa", "capa do local",
        "the Sacred Tree of Sovara Mithr, a colossal ancient tree at the heart of a vast "
        "mystical forest, revered as a gift of the gods; tiny fairy lights in the canopy; "
        "pilgrims arrive for the yearly celebration of life",
    ),
    cena(
        "sovara-mithr-manto", "Sovara Mithr · a colheita no Manto", "seção \"Florestas místicas\"",
        "at the outer edge of a lush forest, harvesters gather herbs, resin, bark and fruit "
        "using only their two hands, never iron tools, filling baskets for the caravans",
    ),
    cena(
        "sovara-mithr-silencio", "Sovara Mithr · o Silêncio", "seção \"Florestas místicas\"",
        "the inner circle around a colossal sacred tree, where sound does not carry: a pilgrim "
        "shouts with no sound at all, footsteps leave no echo, an eerie, peaceful stillness",
    ),
    cena(
        "sovara-mithr-lobos", "Sovara Mithr · os lobos e os necromantes", "seção \"O que a Árvore custa\"",
        "deep in a sacred forest at night, an old organized wolf pack attacks a group of "
        "necromancers in dark robes who were trying to drain energy from a giant glowing tree",
    ),
    # Vernáculo
    cena(
        "vernaculo-capa", "Vernáculo dos Clérigos · capa", "capa do local",
        "a temple city of healers: white stone sanctuaries and infirmaries, gardens of "
        "medicinal herbs, clerics in robes receiving lines of wounded, sick and cursed people "
        "arriving from all over the continent",
    ),
    cena(
        "vernaculo-fio", "Vernáculo · a Bênção do Fio", "seção \"Bênçãos\"",
        "a cleric closes a wound that would not heal with threads of golden light, leaving a "
        "pale white scar on the arm of a war veteran who already has several such scars",
    ),
    cena(
        "vernaculo-ala", "Vernáculo · a ala dos amaldiçoados", "seção \"Sobre os amaldiçoados\"",
        "a quiet infirmary ward where clerics sit beside cursed patients nobody knows how to "
        "treat, only keeping them company by candlelight; compassion and exhaustion",
    ),
    cena(
        "vernaculo-caravana", "Vernáculo · a caravana de Sovara", "seção \"A relação com Sovara Mithr\"",
        "a caravan of carts loaded with herbs, bark and resin travels an old fixed road from a "
        "mystical forest toward a temple city of healers, with clerics walking beside it",
    ),
    # Arauto
    cena(
        "arauto-capa", "Arauto dos Feiticeiros · capa", "capa do local",
        "a secluded citadel of mages hidden far from civilization, towers of study and "
        "observatories wrapped in floating arcane lights, only a narrow way leading to it",
    ),
    cena(
        "arauto-circulo-aberto", "Arauto · o Círculo Aberto", "seção \"Magias e feitiços\"",
        "a classroom of young apprentices practicing simple magic: floating lights, small "
        "flames and sparks; one apprentice has just singed his own eyebrow and the teacher "
        "sighs; light-hearted",
    ),
    cena(
        "arauto-circulo-selado", "Arauto · a porta do Círculo Selado", "seção \"Magias e feitiços\"",
        "in the deepest point of a mage citadel, three archmages stand together before the "
        "sealed door of a forbidden library, each needed to open it; heavy runes of light on "
        "the door, deep shadows",
    ),
    cena(
        "arauto-mago-divino", "Arauto · o Grandíssimo Mago Divino", "seção \"O Grandíssimo Mago Divino\"",
        "a legend told in taverns: a lone robed figure, face hidden in light, unmakes an entire "
        "army with one gesture and stands perfectly calm, not even tired",
    ),
    # Terra dos Putrefados
    cena(
        "putrefados-capa", "Terra dos Putrefados · capa", "capa do local",
        "Undaryus, the cursed land: a rotten, blackened forest and wasteland forgotten by the "
        "light, dead twisted trees, grey fog, a dim sky; pale figures walk in straight lines "
        "without any hurry",
    ),
    cena(
        "putrefados-magia", "Putrefados · o dia em que foi feita", "seção \"O que aconteceu aqui\"",
        "the last days of the great war: legendary mages and mysterious hooded figures cast a "
        "forbidden spell over a green land, and a wave of rot and curses spreads from them, "
        "turning forest and fields black as the enemy army breaks",
    ),
    cena(
        "putrefados-maos", "Putrefados · as Mãos", "seção \"As Mãos\"",
        "on an old battlefield of grey dead soil, many pale hands rise from the ground, open, "
        "palms up, perfectly still; a scholar watches from far away with a spyglass",
    ),
    cena(
        "putrefados-ritual", "Putrefados · os necromantes", "seção \"Lendas\"",
        "necromancers in dark robes perform a ritual in a circle on cursed black ground, green "
        "necromantic light rising, dead trees all around",
    ),
    # Askar
    cena(
        "askar-capa", "Terras de Askar · capa", "capa do local",
        "the red continent of Askar: jagged red mountains, scorching heat haze, huge orc "
        "warriors, dragons flying far away, and a great arena carved into the red rock",
    ),
    cena(
        "askar-arena", "Askar · as arenas", "seção \"O lado vermelho do mar\"",
        "a huge arena of red stone where two massive orc warriors fight to become legends, a "
        "roaring crowd of brutal creatures around them",
    ),
    cena(
        "askar-forja", "Askar · os ferreiros", "seção \"O lado vermelho do mar\"",
        "a legendary orc forge: blacksmiths hammering superb steel weapons and armor, sparks "
        "and lava light, finer craftsmanship than anything else in the world",
    ),
    cena(
        "askar-barreira", "Askar · a Grande Barreira vista do mar", "seção \"A Grande Barreira\"",
        "from a small ship's deck, sailors look at a nearly invisible giant dome rising from "
        "the sea, a shimmering distortion on the horizon like heat over stone, reaching above "
        "the clouds; the captain turns the ship away",
    ),
]

# ---------- Lugares novos ----------
# Só o que o Arion contou até agora. O mapa e as histórias ainda vão nascer.

NOVOS = [
    cena(
        "guratan-capa", "Guratan · capa", "capa do local, quando a página existir",
        "the city of Guratan: a bustling, ordinary-looking city with citizens, markets and "
        "imperial banners, but secretly ruled by thieves' guilds; hooded figures trade coin "
        "pouches in alleys, a city guard looks the other way while pocketing a bribe; a "
        "corrupt, shadowy atmosphere",
    ),
    cena(
        "guratan-guilda", "Guratan · a guilda por baixo da cidade", "dentro do local",
        "a hidden thieves' guild hall beneath the city, full of stolen treasures, maps without "
        "writing and hooded thieves counting coin, while above them the city goes on normally",
    ),
    cena(
        "fenda-trevosa-capa", "Fenda Trevosa · capa", "capa do local, quando a página existir",
        "the Fenda Trevosa: an immense, impossibly deep chasm splitting the land, so deep that "
        "its bottom cannot be seen at all, the darkness inside swallowing the light; a tiny "
        "traveler on the edge for scale",
    ),
]


def secoes():
    """As abas novas do guia: (chave, título, pasta no site, lista de cenas)."""
    return [
        ("saga-t2", "Saga · Temporada 2", EP, SAGA_T2),
        ("guerra", "Guerra Leviana", "eventos", GUERRA),
        ("locais", "Locais do mapa", "locais", LOCAIS),
        ("lugares-novos", "Lugares novos", "locais", NOVOS),
    ]


def anexos(c):
    """Os arquivos de referência que vão junto com uma cena.

    Só as cenas com os personagens dos jogadores levam referência. A imagem
    de estilo também mostra o grupo, então as artes de cenário (a Guerra,
    os locais) vão sem nada: lá os jogadores ainda nem existiam."""
    if not c["quem"]:
        return []
    return [ESTILO_DAS_CENAS, TODOS_JUNTOS] + [PERSONAGENS[q][0] for q in c["quem"]]


def assunto_completo(c):
    """O assunto da cena, com quem aparece nela e como está vestido."""
    partes = [c["assunto"]]
    if c["quem"]:
        quem = "; ".join(PERSONAGENS[q][1] for q in c["quem"])
        partes.append(f"Characters in this scene: {quem}")
        if c["roupa"]:
            partes.append(c["roupa"])
    return ". ".join(partes)
