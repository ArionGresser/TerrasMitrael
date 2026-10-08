# Lista de artes do Grimório

Gerada por `scripts/magias/arte/gerar-lista.py`. Não edite à mão: as palavras-chave
ficam em `palavras-chave.txt`, e o resto sai do grimório.

**Ícones prontos:** 292 de 339 · **Ilustrações prontas:** 0 de 339

## Como entregar uma arte

1. Gere a imagem e salve com o nome exato da coluna **Arquivo** (o fim do caminho).
2. **Ícone:** quadrado, 512 × 512, de preferência `.webp` (`.jpg` e `.png` também servem).
3. **Ilustração de uso:** larga, 16:9, uns 1600 × 900. Cabem até três por magia:
   `nome-da-magia-1.webp`, `-2.webp` e `-3.webp`.
4. Solte o arquivo na pasta `public/images/magias/icones/` ou `public/images/magias/ilustracoes/`.
   O site acha sozinho na próxima publicação, sem mexer em código.

## Os prompts

Cada magia tem **palavras-chave** em inglês (as IAs de imagem entendem melhor).
Para buscar referência, as palavras-chave sozinhas já servem. Para pedir a uma IA,
encaixe-as num dos modelos abaixo. A cor muda com a escola, para o conjunto ficar coeso.
Os prompts já montados, um por magia, estão em `lista-de-artes.csv`, que abre no Excel
ou no Google Planilhas.

**Ícone:**

```
fantasy RPG spell icon, <palavras-chave>, single centered emblem, painterly hand-painted style, rich colors, dark vignette background, <cor da escola> glow, square, no text, no border
```

**Ilustração de uso:**

```
medieval fantasy illustration of <a wizard, a cleric...> casting the spell <nome em inglês>: <palavras-chave>, dramatic lighting, painterly D&D book art, wide 16:9, no text
```

| Escola | Cor |
|---|---|
| Abjuração | pale blue |
| Adivinhação | silver and white |
| Conjuração | golden yellow |
| Encantamento | pink and magenta |
| Evocação | fiery orange and red |
| Ilusão | violet |
| Necromancia | sickly green and black |
| Transmutação | emerald green and amber |


## Truques

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Arte Druídica | Druidcraft | Transmutação | `arte-druidica` | small nature magic, budding flower blooming in a palm, falling leaves, tiny weather swirl |
| I· | Bordão Místico | Shillelagh | Transmutação | `bordao-mistico` | wooden club wreathed in green nature magic, glowing grain |
| I· | Centelha Estelar | Starry Wisp | Evocação | `centelha-estelar` | tiny mote of starlight shooting like a comet |
| I· | Chama Sagrada | Sacred Flame | Evocação | `chama-sagrada` | radiant pillar of holy flame falling from above |
| I· | Consertar | Mending | Transmutação | `consertar` | broken pottery pieces knitting back together with golden seams |
| I· | Elementalismo | Elementalism | Transmutação | `elementalismo` | four small swirls of fire, water, earth and air orbiting a hand |
| I· | Explosão Feiticeira | Sorcerous Burst | Evocação | `explosao-feiticeira` | burst of raw chaotic sorcery, multicolored sparks |
| I· | Globos de Luz | Dancing Lights | Ilusão | `globos-de-luz` | four floating orbs of warm light dancing in the dark |
| I· | Golpe Certeiro | True Strike | Adivinhação | `golpe-certeiro` | glowing eye of insight over a weapon, golden aim line |
| I· | Ilusão Menor | Minor Illusion | Ilusão | `ilusao-menor` | illusory crate fading at the edges, shimmering image |
| I· | Luz | Light | Evocação | `luz` | object glowing with bright warm light, torch-like radiance |
| I· | Mensagem | Message | Transmutação | `mensagem` | whisper traveling as a glowing ribbon between two ears |
| I· | Mãos Mágicas | Mage Hand | Conjuração | `maos-magicas` | spectral floating hand lifting a key |
| I· | Orientação | Guidance | Adivinhação | `orientacao` | divine glowing hand resting on a shoulder, soft golden light |
| I· | Poupar os Moribundos | Spare the Dying | Necromancia | `poupar-os-moribundos` | gentle glowing hand over a fallen warrior, stabilizing light |
| I· | Prestidigitação | Prestidigitation | Transmutação | `prestidigitacao` | small magic trick, sparks, a candle lighting itself, cleaned cloth |
| I· | Produzir Chama | Produce Flame | Conjuração | `produzir-chama` | small flame dancing in an open palm |
| I· | Raio de Fogo | Fire Bolt | Evocação | `raio-de-fogo` | streak of fire hurled from a fingertip, ember trail |
| I· | Raio de Gelo | Ray of Frost | Evocação | `raio-de-gelo` | frigid pale blue beam, ice crystals forming |
| I· | Rajada Mística | Eldritch Blast | Evocação | `rajada-mistica` | crackling beam of violet eldritch energy, otherworldly sigils |
| I· | Rajada de Veneno | Poison Spray | Necromancia | `rajada-de-veneno` | puff of toxic green mist sprayed from a palm |
| I· | Resistência | Resistance | Abjuração | `resistencia` | small glowing shield sigil over a cloak, protective shimmer |
| I· | Respingo Ácido | Acid Splash | Evocação | `respingo-acido` | bubble of green acid bursting, corrosive droplets splashing, smoking hiss |
| I· | Taumaturgia | Thaumaturgy | Transmutação | `taumaturgia` | booming voice, flickering flames, trembling ground, eyes glowing |
| I· | Toque Arrepiante | Chill Touch | Necromancia | `toque-arrepiante` | ghostly skeletal hand of pale blue frost reaching out, necrotic mist |
| I· | Toque Chocante | Shocking Grasp | Evocação | `toque-chocante` | hand crackling with lightning, electric arcs |
| I· | Zombaria Viciosa | Vicious Mockery | Encantamento | `zombaria-viciosa` | mocking jester mask, cutting words as purple wisps |

## 1º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Alarme | Alarm | Abjuração | `alarme` | spectral bell over a doorway, ward rune glowing |
| I· | Amizade Animal | Animal Friendship | Encantamento | `amizade-animal` | gentle hand reaching to a wild wolf, calm green aura |
| I· | Armadura Arcana | Mage Armor | Abjuração | `armadura-arcana` | translucent blue arcane armor around a robed figure |
| I· | Bom Fruto | Goodberry | Conjuração | `bom-fruto` | handful of glowing magical berries |
| I· | Bruxaria | Hex | Encantamento | `bruxaria` | witch's curse sigil over a target, green-violet hex mark |
| I· | Bênção | Bless | Encantamento | `bencao` | three glowing holy symbols blessing warriors, golden light |
| I· | Comando | Command | Encantamento | `comando` | single shouted word of power, authoritative glowing rune |
| I· | Compreender Idiomas | Comprehend Languages | Adivinhação | `compreender-idiomas` | ancient scroll with runes translating into light |
| I· | Constrição | Entangle | Conjuração | `constricao` | grasping roots and vines bursting from the ground |
| I· | Criar ou Destruir Água | Create or Destroy Water | Transmutação | `criar-ou-destruir-agua` | water pouring from nowhere into a jug, rain drops |
| I· | Curar Ferimentos | Cure Wounds | Abjuração | `curar-ferimentos` | glowing hand healing a wound, green-gold light |
| I· | Destruição Divina | Divine Smite | Evocação | `destruicao-divina` | sword strike exploding with radiant holy light |
| I· | Destruição Lancinante | Searing Smite | Evocação | `destruicao-lancinante` | weapon blazing with searing fire on impact |
| I· | Detectar Magia | Detect Magic | Adivinhação | `detectar-magia` | glowing eye seeing magical auras around items |
| I· | Detectar Veneno e Doença | Detect Poison and Disease | Adivinhação | `detectar-veneno-e-doenca` | eye revealing green toxic auras over food |
| I· | Detectar o Bem e o Mal | Detect Evil and Good | Adivinhação | `detectar-o-bem-e-o-mal` | glowing eyes sensing celestial and fiendish auras |
| I· | Disco Flutuante | Floating Disk | Conjuração | `disco-flutuante` | floating circular disk of force carrying chests |
| I· | Disfarçar-se | Disguise Self | Ilusão | `disfarcar-se` | face changing like a mask, shimmering illusion |
| I· | Encontrar Familiar | Find Familiar | Conjuração | `encontrar-familiar` | small spirit animal (owl, cat, raven) appearing in a summoning circle |
| I· | Enfeitiçar Pessoa | Charm Person | Encantamento | `enfeiticar-pessoa` | enchanting gaze, pink spiral, captivated face |
| I· | Escrita Ilusória | Illusory Script | Ilusão | `escrita-ilusoria` | magical script shifting on parchment, secret runes |
| I· | Escudo Arcano | Shield | Abjuração | `escudo-arcano` | sudden invisible barrier of force blocking an arrow |
| I· | Escudo da Fé | Shield of Faith | Abjuração | `escudo-da-fe` | shimmering holy shield sigil around an ally |
| I· | Faca de Gelo | Ice Knife | Conjuração | `faca-de-gelo` | dagger of ice shattering into shards |
| I· | Falar com Animais | Speak with Animals | Adivinhação | `falar-com-animais` | person talking with a fox and a bird, speech glow |
| I· | Favor Divino | Divine Favor | Transmutação | `favor-divino` | weapon glowing with radiant divine energy |
| I· | Fogo das Fadas | Faerie Fire | Evocação | `fogo-das-fadas` | creatures outlined in glowing blue and violet fey light |
| I· | Golpe Constritor | Ensnaring Strike | Conjuração | `golpe-constritor` | thorny vines sprouting from a weapon to entangle |
| I· | Heroísmo | Heroism | Encantamento | `heroismo` | heroic glowing aura, courageous warrior, banner of light |
| I· | Identificação | Identify | Adivinhação | `identificacao` | magnifying light revealing secrets of a magic ring |
| I· | Imagem Silenciosa | Silent Image | Ilusão | `imagem-silenciosa` | silent illusory image of a dragon shimmering |
| I· | Infligir Ferimentos | Inflict Wounds | Necromancia | `infligir-ferimentos` | hand of necrotic energy draining life |
| I· | Leque Cromático | Color Spray | Ilusão | `leque-cromatico` | dazzling burst of rainbow light from a hand |
| I· | Marca do Caçador | Hunter's Mark | Adivinhação | `marca-do-cacador` | glowing hunter's sigil marking prey, crosshair of light |
| I· | Mãos Flamejantes | Burning Hands | Evocação | `maos-flamejantes` | thin sheet of flames fanning from spread hands |
| I· | Mísseis Mágicos | Magic Missile | Evocação | `misseis-magicos` | three glowing darts of force streaking forward |
| I· | Névoa Obscurecente | Fog Cloud | Conjuração | `nevoa-obscurecente` | thick sphere of grey fog |
| I· | Onda Trovejante | Thunderwave | Evocação | `onda-trovejante` | wave of thunderous force blasting outward |
| I· | Orbe Cromático | Chromatic Orb | Evocação | `orbe-cromatico` | orb shifting between fire, ice, lightning, acid colors |
| I· | Palavra Curativa | Healing Word | Abjuração | `palavra-curativa` | spoken word of healing as golden letters |
| I· | Passos Largos | Longstrider | Transmutação | `passos-largos` | boots with glowing magic stride, long footsteps |
| I· | Perdição | Bane | Encantamento | `perdicao` | dark sigil weakening, chains of shadow, cursed aura |
| I· | Proteção contra o Bem e o Mal | Protection from Evil and Good | Abjuração | `protecao-contra-o-bem-e-o-mal` | protective rune circle repelling demon and angel |
| I· | Purificar Alimentos e Bebidas | Purify Food and Drink | Transmutação | `purificar-alimentos-e-bebidas` | goblet of water purified by sparkling light |
| I· | Queda Suave | Feather Fall | Transmutação | `queda-suave` | person falling slowly like a feather, floating feathers |
| ·· | Raio Adoecedor | Ray of Sickness | Necromancia | `raio-adoecedor` | sickly green ray of poison |
| I· | Raio Guiador | Guiding Bolt | Evocação | `raio-guiador` | flash of radiant light streaking toward a target |
| I· | Recuo Acelerado | Expeditious Retreat | Transmutação | `recuo-acelerado` | blurred running figure, speed lines, wind trail |
| I· | Repreensão Infernal | Hellish Rebuke | Evocação | `repreensao-infernal` | hellish flames engulfing an attacker, fiendish |
| I· | Riso Histérico | Hideous Laughter | Encantamento | `riso-histerico` | creature collapsed laughing uncontrollably, comic mask |
| I· | Salto | Jump | Transmutação | `salto` | figure leaping high into the air, wind swirl at feet |
| I· | Santuário | Sanctuary | Abjuração | `santuario` | protective bubble of soft light around a cleric |
| I· | Servo Invisível | Unseen Servant | Conjuração | `servo-invisivel` | invisible servant carrying a tray, floating objects |
| I· | Sono | Sleep | Encantamento | `sono` | drowsy figures falling asleep, sparkling sand, crescent moon |
| I· | Sussurros Dissonantes | Dissonant Whispers | Encantamento | `sussurros-dissonantes` | twisted whispers as dark sound waves into an ear |
| I· | Vida Falsa | False Life | Necromancia | `vida-falsa` | dark necrotic vitality filling a body, pale green aura |
| I· | Área Escorregadia | Grease | Conjuração | `area-escorregadia` | slick puddle of grease, a figure slipping |

## 2º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Acalmar Emoções | Calm Emotions | Encantamento | `acalmar-emocoes` | soothing blue aura calming an angry crowd |
| I· | Alterar-se | Alter Self | Transmutação | `alterar-se` | body transforming, gills, claws, shifting features |
| I· | Aprimorar Atributo | Enhance Ability | Transmutação | `aprimorar-atributo` | glowing animal spirits (bull, cat, bear, eagle, fox, owl) empowering |
| I· | Arma Espiritual | Spiritual Weapon | Evocação | `arma-espiritual` | floating spectral weapon of faith |
| I· | Arma Mágica | Magic Weapon | Transmutação | `arma-magica` | ordinary sword glowing with arcane runes |
| I· | Arrombar | Knock | Transmutação | `arrombar` | locked door bursting open with a loud knock |
| I· | Augúrio | Augury | Adivinhação | `augurio` | casting omen stones and tarot, weal and woe glyphs |
| I· | Aumentar/Reduzir | Enlarge/Reduce | Transmutação | `aumentar-reduzir` | figure growing giant and shrinking tiny side by side |
| I· | Aura Mágica do Arcanista | Arcanist's Magic Aura | Ilusão | `aura-magica-do-arcanista` | false magical aura disguising an item |
| I· | Auxílio | Aid | Abjuração | `auxilio` | ally standing bolstered, golden vitality aura |
| I· | Boca Encantada | Magic Mouth | Ilusão | `boca-encantada` | magical mouth appearing on a wall, speaking |
| I· | Cegueira/Surdez | Blindness/Deafness | Transmutação | `cegueira-surdez` | eye and ear covered in shadow, sense blocked |
| I· | Chama Contínua | Continual Flame | Evocação | `chama-continua` | eternal flame burning without heat in a sconce |
| I· | Crescer Espinhos | Spike Growth | Transmutação | `crescer-espinhos` | ground covered in sharp hidden thorns |
| I· | Despedaçar | Shatter | Evocação | `despedacar` | glass and stone shattering from a sonic burst |
| I· | Destruição Reluzente | Shining Smite | Transmutação | `destruicao-reluzente` | weapon strike making a foe glow with light |
| I· | Detectar Pensamentos | Detect Thoughts | Adivinhação | `detectar-pensamentos` | glowing third eye reading another's thoughts |
| I· | Encontrar Armadilhas | Find Traps | Adivinhação | `encontrar-armadilhas` | glowing outline revealing a hidden trap |
| I· | Encontrar Montaria | Find Steed | Conjuração | `encontrar-montaria` | spectral warhorse summoned in light |
| I· | Escuridão | Darkness | Evocação | `escuridao` | sphere of magical darkness swallowing light |
| I· | Esfera Flamejante | Flaming Sphere | Conjuração | `esfera-flamejante` | rolling ball of fire |
| I· | Espinho Mental | Mind Spike | Adivinhação | `espinho-mental` | psychic spike piercing a mind |
| I· | Esquentar Metal | Heat Metal | Transmutação | `esquentar-metal` | glowing red-hot metal armor |
| I· | Fascinar | Enthrall | Encantamento | `fascinar` | captivating orator, entranced listeners |
| I· | Flecha Ácida | Acid Arrow | Evocação | `flecha-acida` | shimmering green arrow of acid, corrosive splash |
| I· | Força Fantasmagórica | Phantasmal Force | Ilusão | `forca-fantasmagorica` | terrifying phantasm only one mind can see |
| I· | Imagem Espelhada | Mirror Image | Ilusão | `imagem-espelhada` | three illusory duplicates of a mage |
| I· | Imobilizar Pessoa | Hold Person | Encantamento | `imobilizar-pessoa` | person frozen mid-step by glowing chains of paralysis |
| I· | Invisibilidade | Invisibility | Ilusão | `invisibilidade` | figure fading into invisibility, translucent silhouette |
| I· | Levitação | Levitate | Transmutação | `levitacao` | figure floating in the air |
| I· | Localizar Animais ou Plantas | Locate Animals or Plants | Adivinhação | `localizar-animais-ou-plantas` | glowing trail leading to a rare flower and a deer |
| I· | Localizar Objeto | Locate Object | Adivinhação | `localizar-objeto` | glowing thread pointing to a lost object |
| I· | Lufada de Vento | Gust of Wind | Evocação | `lufada-de-vento` | strong line of wind blowing creatures back |
| I· | Lâmina Flamejante | Flame Blade | Evocação | `lamina-flamejante` | scimitar of pure fire in a druid's hand |
| I· | Mensageiro Animal | Animal Messenger | Encantamento | `mensageiro-animal` | small bird carrying a rolled message |
| I· | Nublar | Blur | Ilusão | `nublar` | figure's outline blurred and wavering |
| I· | Oração Curativa | Prayer of Healing | Abjuração | `oracao-curativa` | priest praying, healing light spreading to allies |
| I· | Passo Nebuloso | Misty Step | Conjuração | `passo-nebuloso` | silvery mist teleport, figure vanishing and reappearing |
| I· | Passos sem Pegadas | Pass without Trace | Abjuração | `passos-sem-pegadas` | shadowy footprints vanishing, stealthy party in forest |
| I· | Patas de Aranha | Spider Climb | Transmutação | `patas-de-aranha` | person walking on a wall like a spider |
| I· | Pele de Árvore | Barkskin | Transmutação | `pele-de-arvore` | skin turning into tree bark armor |
| I· | Proteção contra Veneno | Protection from Poison | Abjuração | `protecao-contra-veneno` | protective aura neutralizing green poison |
| I· | Raio Ardente | Scorching Ray | Evocação | `raio-ardente` | three rays of fire |
| I· | Raio Lunar | Moonbeam | Evocação | `raio-lunar` | silver beam of moonlight from the sky |
| I· | Raio do Enfraquecimento | Ray of Enfeeblement | Necromancia | `raio-do-enfraquecimento` | black ray draining strength from a warrior |
| I· | Repouso Tranquilo | Gentle Repose | Necromancia | `repouso-tranquilo` | preserved body with protective light, frozen time |
| I· | Restauração Menor | Lesser Restoration | Abjuração | `restauracao-menor` | gentle light cleansing poison from a body |
| I· | Silêncio | Silence | Ilusão | `silencio` | sphere of absolute silence, muted sound waves |
| I· | Sopro de Dragão | Dragon's Breath | Transmutação | `sopro-de-dragao` | caster exhaling a dragon-like cone of fire |
| I· | Sugestão | Suggestion | Encantamento | `sugestao` | hypnotic suggestion, spiral eyes, whispered command |
| I· | Teia | Web | Conjuração | `teia` | thick sticky spider webs filling a corridor |
| I· | Tranca Arcana | Arcane Lock | Abjuração | `tranca-arcana` | door sealed by a glowing arcane lock rune |
| I· | Truque de Corda | Rope Trick | Transmutação | `truque-de-corda` | rope rising into the air to a hidden portal |
| I· | Ver o Invisível | See Invisibility | Adivinhação | `ver-o-invisivel` | eye revealing an invisible creature's outline |
| I· | Visão no Escuro | Darkvision | Transmutação | `visao-no-escuro` | glowing eyes seeing in the dark, grey-green vision |
| I· | Vínculo Protetor | Warding Bond | Abjuração | `vinculo-protetor` | glowing bond linking two allies, shared protection |
| I· | Zona da Verdade | Zone of Truth | Encantamento | `zona-da-verdade` | circle of truth light, honest faces |

## 3º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Ampliar Plantas | Plant Growth | Transmutação | `ampliar-plantas` | overgrown thick vegetation, fertile fields |
| I· | Andar na Água | Water Walk | Transmutação | `andar-na-agua` | figure walking on water surface |
| I· | Animar os Mortos | Animate Dead | Necromancia | `animar-os-mortos` | skeletons rising from graves, necromantic green light |
| I· | Bola de Fogo | Fireball | Evocação | `bola-de-fogo` | bead of fire blossoming into a huge explosion |
| I· | Clarividência | Clairvoyance | Adivinhação | `clarividencia` | floating invisible sensor eye watching a distant room |
| I· | Conjurar Animais | Conjure Animals | Conjuração | `conjurar-animais` | spectral pack of wolves summoned |
| I· | Contramágica | Counterspell | Abjuração | `contramagica` | spell unraveling into broken runes, mage blocking |
| I· | Convocar Relâmpagos | Call Lightning | Conjuração | `convocar-relampagos` | storm cloud calling a lightning bolt down |
| I· | Corcel Fantasma | Phantom Steed | Ilusão | `corcel-fantasma` | ghostly quasi-real horse galloping |
| I· | Criar Alimentos e Água | Create Food and Water | Conjuração | `criar-alimentos-e-agua` | bountiful table of bread and water appearing |
| I· | Círculo Mágico | Magic Circle | Abjuração | `circulo-magico` | inscribed magic circle trapping a demon |
| I· | Dificultar Detecção | Nondetection | Abjuração | `dificultar-deteccao` | figure hidden from a scrying eye, veil |
| I· | Dissipar Magia | Dispel Magic | Abjuração | `dissipar-magia` | magical runes dissolving into sparks |
| I· | Enviar Mensagem | Sending | Adivinhação | `enviar-mensagem` | message sent across distance as a beam of light |
| I· | Espíritos Guardiões | Spirit Guardians | Conjuração | `espiritos-guardioes` | spectral angelic spirits circling a cleric |
| I· | Falar com as Plantas | Speak with Plants | Transmutação | `falar-com-as-plantas` | person talking to an ancient tree with a face |
| I· | Falar com os Mortos | Speak with Dead | Necromancia | `falar-com-os-mortos` | corpse answering questions, ghostly mouth |
| I· | Forma Gasosa | Gaseous Form | Transmutação | `forma-gasosa` | body turning into misty vapor |
| I· | Fundir-se às Rochas | Meld into Stone | Transmutação | `fundir-se-as-rochas` | person merging into a stone wall |
| I· | Glifo de Proteção | Glyph of Warding | Abjuração | `glifo-de-protecao` | glowing protective glyph inscribed on a floor |
| I· | Idiomas | Tongues | Adivinhação | `idiomas` | magical tongue speaking all languages, script glyphs |
| I· | Imagem Maior | Major Image | Ilusão | `imagem-maior` | grand illusion of a castle, shimmering |
| I· | Lentidão | Slow | Transmutação | `lentidao` | figures moving in slow motion, hourglass sigil |
| I· | Luz do Dia | Daylight | Evocação | `luz-do-dia` | sphere of bright daylight in darkness |
| I· | Medo | Fear | Ilusão | `medo` | terrified figure fleeing a looming horrific shadow |
| I· | Muralha de Vento | Wind Wall | Evocação | `muralha-de-vento` | wall of strong wind blowing arrows away |
| I· | Nevasca | Sleet Storm | Conjuração | `nevasca` | freezing sleet storm, icy ground |
| I· | Névoa Fétida | Stinking Cloud | Conjuração | `nevoa-fetida` | sickly yellow-green cloud of nauseating gas |
| I· | Padrão Hipnótico | Hypnotic Pattern | Ilusão | `padrao-hipnotico` | twisting rainbow hypnotic pattern in the air |
| I· | Palavra Curativa em Massa | Mass Healing Word | Abjuração | `palavra-curativa-em-massa` | words of healing radiating to many allies |
| I· | Pequena Cabana | Tiny Hut | Evocação | `pequena-cabana` | small translucent dome of force sheltering adventurers at night |
| I· | Piscar | Blink | Transmutação | `piscar` | figure flickering between planes, ethereal shimmer |
| I· | Proteção contra Energia | Protection from Energy | Abjuração | `protecao-contra-energia` | shield of resistance against fire, cold, lightning |
| I· | Relâmpago | Lightning Bolt | Evocação | `relampago` | line of lightning blasting forward |
| I· | Remover Maldição | Remove Curse | Abjuração | `remover-maldicao` | curse chains breaking with holy light |
| I· | Respirar na Água | Water Breathing | Transmutação | `respirar-na-agua` | adventurer breathing underwater with bubbles |
| I· | Revivificar | Revivify | Necromancia | `revivificar` | fallen hero revived by a diamond's light |
| I· | Rogar Maldição | Bestow Curse | Necromancia | `rogar-maldicao` | dark curse sigil branded onto a victim |
| I· | Sinal de Esperança | Beacon of Hope | Abjuração | `sinal-de-esperanca` | radiant beacon of hope over allies |
| I· | Toque Vampírico | Vampiric Touch | Necromancia | `toque-vampirico` | shadowy hand draining life energy |
| I· | Velocidade | Haste | Transmutação | `velocidade` | figure moving at blinding speed, speed lines |
| I· | Voo | Fly | Transmutação | `voo` | figure flying through the sky |

## 4º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Adivinhação | Divination | Adivinhação | `adivinhacao` | divine oracle vision, glowing eye of a god |
| I· | Assassino Fantasmagórico | Phantasmal Killer | Ilusão | `assassino-fantasmagorico` | nightmare creature formed from fear |
| I· | Aura de Vida | Aura of Life | Abjuração | `aura-de-vida` | radiant aura of life protecting allies |
| I· | Banimento | Banishment | Abjuração | `banimento` | creature banished through a planar rift |
| I· | Baú Secreto | Secret Chest | Conjuração | `bau-secreto` | chest vanishing into the Ethereal Plane |
| I· | Compulsão | Compulsion | Encantamento | `compulsao` | compelled figures moving against their will |
| I· | Confusão | Confusion | Encantamento | `confusao` | confused figures, swirling chaotic sigils over heads |
| I· | Conjurar Elementais Menores | Conjure Minor Elementals | Conjuração | `conjurar-elementais-menores` | small elemental spirits swirling around a caster |
| I· | Conjurar Seres da Floresta | Conjure Woodland Beings | Conjuração | `conjurar-seres-da-floresta` | fey woodland spirits dancing around a druid |
| I· | Controlar a Água | Control Water | Transmutação | `controlar-a-agua` | water parting and rising in a whirlpool |
| I· | Cão Fiel | Faithful Hound | Conjuração | `cao-fiel` | spectral guard dog of force |
| I· | Dominar Fera | Dominate Beast | Encantamento | `dominar-fera` | beast with glowing eyes under mental control |
| I· | Enfeitiçar Monstro | Charm Monster | Encantamento | `enfeiticar-monstro` | monster charmed, pink enchanting spiral over its head |
| I· | Escudo de Fogo | Fire Shield | Evocação | `escudo-de-fogo` | warm flames or chilling ice shield wrapping a body |
| I· | Esfera Resiliente | Resilient Sphere | Abjuração | `esfera-resiliente` | shimmering sphere of force enclosing a creature |
| I· | Esfera Vitriólica | Vitriolic Sphere | Evocação | `esfera-vitriolica` | sphere of acid exploding |
| I· | Fabricar | Fabricate | Transmutação | `fabricar` | raw materials transforming into crafted items |
| I· | Guardião da Fé | Guardian of Faith | Conjuração | `guardiao-da-fe` | large spectral guardian holding a sword |
| I· | Inseto Gigante | Giant Insect | Conjuração | `inseto-gigante` | giant spider, scorpion and wasp |
| I· | Invisibilidade Maior | Greater Invisibility | Ilusão | `invisibilidade-maior` | warrior fully invisible while attacking |
| I· | Liberdade de Movimento | Freedom of Movement | Abjuração | `liberdade-de-movimento` | figure slipping free from chains and vines |
| I· | Localizar Criatura | Locate Creature | Adivinhação | `localizar-criatura` | glowing trail leading to a hidden creature |
| I· | Metamorfose | Polymorph | Transmutação | `metamorfose` | creature transforming into a beast, swirling magic |
| I· | Moldar Rochas | Stone Shape | Transmutação | `moldar-rochas` | stone reshaping like clay in hands |
| I· | Muralha de Fogo | Wall of Fire | Evocação | `muralha-de-fogo` | towering wall of flames |
| I· | Olho Arcano | Arcane Eye | Adivinhação | `olho-arcano` | floating invisible magical eye scouting |
| I· | Pele de Pedra | Stoneskin | Transmutação | `pele-de-pedra` | skin hardening into grey stone |
| I· | Porta Dimensional | Dimension Door | Conjuração | `porta-dimensional` | glowing door portal opening in the air |
| I· | Praga | Blight | Necromancia | `praga` | withering plant and creature, necrotic decay |
| I· | Proteção contra a Morte | Death Ward | Abjuração | `protecao-contra-a-morte` | protective ward against death, glowing ankh |
| I· | Santuário Particular | Private Sanctum | Abjuração | `santuario-particular` | warded room sealed by magical barriers |
| I· | Tempestade de Gelo | Ice Storm | Evocação | `tempestade-de-gelo` | hail of ice chunks raining down |
| I· | Tentáculos Negros | Black Tentacles | Conjuração | `tentaculos-negros` | writhing black tentacles erupting from the ground |
| I· | Terreno Alucinógeno | Hallucinatory Terrain | Ilusão | `terreno-alucinogeno` | illusory terrain, swamp disguised as meadow |

## 5º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Animar Objetos | Animate Objects | Transmutação | `animar-objetos` | swords, books and chairs animated, flying |
| I· | Caminhar em Árvores | Tree Stride | Conjuração | `caminhar-em-arvores` | figure stepping into a tree and out of another |
| I· | Coluna de Chamas | Flame Strike | Evocação | `coluna-de-chamas` | vertical column of divine fire from the heavens |
| I· | Comunhão | Commune | Adivinhação | `comunhao` | priest communing with a divine figure in light |
| I· | Comunhão com a Natureza | Commune with Nature | Adivinhação | `comunhao-com-a-natureza` | druid becoming one with the forest, spirit roots |
| I· | Concha Antivida | Antilife Shell | Abjuração | `concha-antivida` | shimmering barrier repelling living creatures |
| I· | Cone de Frio | Cone of Cold | Evocação | `cone-de-frio` | cone of freezing frost blast |
| I· | Conhecimento Lendário | Legend Lore | Adivinhação | `conhecimento-lendario` | ancient legends unfolding from a glowing tome |
| I· | Conjurar Elemental | Conjure Elemental | Conjuração | `conjurar-elemental` | huge elemental summoned from fire, water, earth, air |
| I· | Consagrar | Hallow | Abjuração | `consagrar` | consecrated ground glowing with holy symbols |
| I· | Contatar Outro Plano | Contact Other Plane | Adivinhação | `contatar-outro-plano` | mind contacting a cosmic entity, alien eyes |
| I· | Contágio | Contagion | Necromancia | `contagio` | magical disease spreading, sickly green plague |
| I· | Criar Passagem | Passwall | Transmutação | `criar-passagem` | passage opening through a stone wall |
| I· | Criação | Creation | Ilusão | `criacao` | object forming from shadow material |
| I· | Curar Ferimentos em Massa | Mass Cure Wounds | Abjuração | `curar-ferimentos-em-massa` | wave of healing light over many wounded allies |
| I· | Círculo de Teletransporte | Teleportation Circle | Conjuração | `circulo-de-teletransporte` | glowing teleportation circle with runes |
| I· | Despertar | Awaken | Transmutação | `despertar` | tree awakening with a face and eyes |
| I· | Despistar | Mislead | Ilusão | `despistar` | invisible caster with an illusory double |
| I· | Dissipar o Bem e o Mal | Dispel Evil and Good | Abjuração | `dissipar-o-bem-e-o-mal` | warding off a demon with holy light |
| I· | Dominar Pessoa | Dominate Person | Encantamento | `dominar-pessoa` | person controlled by a puppeteer's glowing strings |
| I· | Elo Telepático | Telepathic Bond | Adivinhação | `elo-telepatico` | glowing mental links connecting several minds |
| I· | Imobilizar Monstro | Hold Monster | Encantamento | `imobilizar-monstro` | monster frozen by glowing chains |
| I· | Invocar Dragão | Summon Dragon | Conjuração | `invocar-dragao` | dragon spirit summoned |
| I· | Ligação Planar | Planar Binding | Abjuração | `ligacao-planar` | extraplanar being bound in a circle |
| I· | Missão | Geas | Encantamento | `missao` | magical oath binding a person with chains of light |
| I· | Modificar Memória | Modify Memory | Encantamento | `modificar-memoria` | memories altered, fragmented images over a head |
| I· | Muralha de Energia | Wall of Force | Evocação | `muralha-de-energia` | invisible wall of force, glimmering edges |
| I· | Muralha de Pedra | Wall of Stone | Evocação | `muralha-de-pedra` | massive stone wall rising from the ground |
| I· | Mão Arcana | Arcane Hand | Evocação | `mao-arcana` | huge glowing hand of force |
| I· | Névoa Mortal | Cloudkill | Conjuração | `nevoa-mortal` | creeping poisonous green-yellow cloud |
| I· | Praga de Insetos | Insect Plague | Conjuração | `praga-de-insetos` | swarm of biting locusts |
| I· | Reencarnação | Reincarnate | Necromancia | `reencarnacao` | soul reborn into a new body, cycle of life |
| I· | Restauração Maior | Greater Restoration | Abjuração | `restauracao-maior` | powerful restoration light removing curses |
| I· | Reviver os Mortos | Raise Dead | Necromancia | `reviver-os-mortos` | dead hero raised from a coffin |
| I· | Semelhança | Seeming | Ilusão | `semelhanca` | many faces changed by illusion at once |
| I· | Sonho | Dream | Ilusão | `sonho` | figure entering another's dream, dreamscape |
| I· | Telecinese | Telekinesis | Transmutação | `telecinese` | rock lifted by telekinetic force |
| I· | Vidência | Scrying | Adivinhação | `videncia` | crystal ball showing a distant person |

## 6º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Aliado Planar | Planar Ally | Conjuração | `aliado-planar` | otherworldly ally answering a call |
| I· | Banquete dos Heróis | Heroes' Feast | Conjuração | `banquete-dos-herois` | magnificent magical feast for heroes |
| I· | Barreira de Lâminas | Blade Barrier | Evocação | `barreira-de-laminas` | wall of whirling razor-sharp blades |
| I· | Caminhar no Vento | Wind Walk | Transmutação | `caminhar-no-vento` | figures turning into clouds and drifting |
| I· | Carne para Pedra | Flesh to Stone | Transmutação | `carne-para-pedra` | person slowly turning to stone |
| I· | Conjurar Fada | Conjure Fey | Conjuração | `conjurar-fada` | fey spirit stepping out of a glowing circle of mushrooms |
| I· | Contingência | Contingency | Abjuração | `contingencia` | spell held in a gemstone, triggered condition |
| I· | Convocação Instantânea | Instant Summons | Conjuração | `convocacao-instantanea` | object appearing in a hand from a sapphire |
| I· | Criar Mortos-Vivos | Create Undead | Necromancia | `criar-mortos-vivos` | ghouls and wights created at night |
| I· | Cura Completa | Heal | Abjuração | `cura-completa` | powerful healing light restoring a warrior |
| I· | Círculo da Morte | Circle of Death | Necromancia | `circulo-da-morte` | sphere of negative energy spreading death |
| I· | Dança Irresistível | Irresistible Dance | Encantamento | `danca-irresistivel` | figure dancing uncontrollably |
| I· | Desintegrar | Disintegrate | Transmutação | `desintegrar` | thin green ray turning a target to dust |
| I· | Encontrar o Caminho | Find the Path | Adivinhação | `encontrar-o-caminho` | glowing path through a labyrinth |
| I· | Esfera Congelante | Freezing Sphere | Evocação | `esfera-congelante` | frigid sphere exploding with ice |
| I· | Ferir | Harm | Necromancia | `ferir` | dark necrotic wave harming a creature |
| I· | Globo de Invulnerabilidade | Globe of Invulnerability | Abjuração | `globo-de-invulnerabilidade` | shimmering globe blocking spells |
| I· | Guardas e Proteções | Guards and Wards | Abjuração | `guardas-e-protecoes` | fortress warded with magical defenses, fog, locked doors |
| I· | Ilusão Programada | Programmed Illusion | Ilusão | `ilusao-programada` | illusion triggered by a condition, actor |
| I· | Mau-Olhado | Eyebite | Necromancia | `mau-olhado` | glowing black eyes of a warlock, terrifying gaze |
| I· | Mover Terra | Move Earth | Transmutação | `mover-terra` | earth moving, hills reshaping |
| I· | Muralha de Espinhos | Wall of Thorns | Conjuração | `muralha-de-espinhos` | thick wall of thorny brush |
| I· | Muralha de Gelo | Wall of Ice | Evocação | `muralha-de-gelo` | wall of solid ice |
| I· | Palavra de Recordação | Word of Recall | Conjuração | `palavra-de-recordacao` | cleric and allies vanishing to a sanctuary |
| I· | Proibição | Forbiddance | Abjuração | `proibicao` | sacred land forbidding teleport, warded borders |
| I· | Raio de Sol | Sunbeam | Evocação | `raio-de-sol` | blinding beam of sunlight |
| I· | Recipiente Arcano | Magic Jar | Necromancia | `recipiente-arcano` | soul trapped in a gem container |
| I· | Relâmpago em Cadeia | Chain Lightning | Evocação | `relampago-em-cadeia` | lightning bolt chaining between many targets |
| I· | Sugestão em Massa | Mass Suggestion | Encantamento | `sugestao-em-massa` | crowd influenced by hypnotic suggestion |
| I· | Transporte pelas Plantas | Transport via Plants | Conjuração | `transporte-pelas-plantas` | stepping through one tree to another far away |
| I· | Visão da Verdade | True Seeing | Adivinhação | `visao-da-verdade` | eyes seeing true forms, invisible revealed |

## 7º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| I· | Bola de Fogo Controlável | Delayed Blast Fireball | Evocação | `bola-de-fogo-controlavel` | glowing bead of fire growing stronger before exploding |
| I· | Conjurar Celestial | Conjure Celestial | Conjuração | `conjurar-celestial` | radiant angelic celestial descending |
| I· | Dedo da Morte | Finger of Death | Necromancia | `dedo-da-morte` | pointing finger unleashing negative energy |
| I· | Espada Arcana | Arcane Sword | Evocação | `espada-arcana` | floating spectral sword of force |
| I· | Forma Etérea | Etherealness | Conjuração | `forma-eterea` | figure becoming ethereal, ghostly plane |
| I· | Inverter Gravidade | Reverse Gravity | Transmutação | `inverter-gravidade` | creatures falling upward |
| I· | Isolamento | Sequester | Transmutação | `isolamento` | creature hidden in suspended animation |
| ·· | Jaula de Energia | Forcecage | Evocação | `jaula-de-energia` | invisible cage of force bars trapping a creature |
| ·· | Mansão Magnífica | Magnificent Mansion | Conjuração | `mansao-magnifica` | extradimensional grand mansion behind a shimmering door |
| ·· | Miragem Arcana | Mirage Arcane | Ilusão | `miragem-arcana` | landscape transformed by vast illusion |
| ·· | Palavra Divina | Divine Word | Evocação | `palavra-divina` | divine word of power, terrible holy light |
| ·· | Projetar Imagem | Project Image | Ilusão | `projetar-imagem` | illusory projection of a mage far away |
| ·· | Rajada Prismática | Prismatic Spray | Evocação | `rajada-prismatica` | seven rays of rainbow colored light |
| ·· | Regeneração | Regenerate | Transmutação | `regeneracao` | limb regenerating with healing light |
| ·· | Ressurreição | Resurrection | Necromancia | `ressurreicao` | soul returning to a body in a radiant glow |
| ·· | Simulacro | Simulacrum | Ilusão | `simulacro` | illusory duplicate made of snow |
| ·· | Símbolo | Symbol | Abjuração | `simbolo` | glowing deadly symbol inscribed on a door |
| ·· | Teletransporte | Teleport | Conjuração | `teletransporte` | figure teleporting in a flash of light |
| ·· | Tempestade de Fogo | Fire Storm | Evocação | `tempestade-de-fogo` | storm of fire engulfing an area |
| ·· | Viagem Planar | Plane Shift | Conjuração | `viagem-planar` | travel between planes through a tuning fork portal |

## 8º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| ·· | Antipatia/Simpatia | Antipathy/Sympathy | Encantamento | `antipatia-simpatia` | aura repelling and attracting creatures |
| ·· | Aura Sagrada | Holy Aura | Abjuração | `aura-sagrada` | brilliant holy aura around allies |
| ·· | Campo Antimagia | Antimagic Field | Abjuração | `campo-antimagia` | sphere suppressing all magic |
| ·· | Clone | Clone | Necromancia | `clone` | clone growing in a magical vessel |
| ·· | Controlar o Clima | Control Weather | Transmutação | `controlar-o-clima` | caster controlling the sky and storms |
| ·· | Dominar Monstro | Dominate Monster | Encantamento | `dominar-monstro` | monster under mental control, glowing eyes |
| ·· | Explosão Solar | Sunburst | Evocação | `explosao-solar` | brilliant burst of sunlight blinding all |
| ·· | Formas Animais | Animal Shapes | Transmutação | `formas-animais` | allies transforming into beasts |
| ·· | Labirinto | Maze | Conjuração | `labirinto` | creature trapped in an endless labyrinth |
| ·· | Lábia | Glibness | Encantamento | `labia` | silver tongue, persuasive speech, charisma glow |
| ·· | Mente Embotada | Befuddlement | Encantamento | `mente-embotada` | mind shattered, intellect broken, spinning sigils |
| ·· | Mente Vazia | Mind Blank | Abjuração | `mente-vazia` | mind protected by a blank shield |
| ·· | Nuvem Incendiária | Incendiary Cloud | Conjuração | `nuvem-incendiaria` | billowing cloud of burning embers |
| ·· | Palavra de Poder: Atordoar | Power Word Stun | Encantamento | `palavra-de-poder-atordoar` | word of power stunning a creature |
| ·· | Semiplano | Demiplane | Conjuração | `semiplano` | door to a small pocket dimension |
| ·· | Terremoto | Earthquake | Transmutação | `terremoto` | ground splitting from a violent earthquake |
| ·· | Tsunami | Tsunami | Conjuração | `tsunami` | colossal wall of water crashing |

## 9º círculo

| ✓ | Magia | Em inglês | Escola | Arquivo | Palavras-chave |
|---|---|---|---|---|---|
| ·· | Aprisionamento | Imprisonment | Abjuração | `aprisionamento` | creature sealed in a magical prison |
| ·· | Chuva de Meteoros | Meteor Swarm | Evocação | `chuva-de-meteoros` | fiery meteors raining from the sky |
| ·· | Cura Completa em Massa | Mass Heal | Abjuração | `cura-completa-em-massa` | flood of healing light for many |
| ·· | Desejo | Wish | Conjuração | `desejo` | glowing wish granting reality-altering power, a genie-like light |
| ·· | Metamorfose Verdadeira | True Polymorph | Transmutação | `metamorfose-verdadeira` | creature permanently transformed into an object |
| ·· | Mudança de Forma | Shapechange | Transmutação | `mudanca-de-forma` | caster transforming into various creatures |
| ·· | Muralha Prismática | Prismatic Wall | Abjuração | `muralha-prismatica` | shimmering wall of seven colors |
| ·· | Palavra de Poder: Curar | Power Word Heal | Encantamento | `palavra-de-poder-curar` | word of power healing completely |
| ·· | Palavra de Poder: Matar | Power Word Kill | Encantamento | `palavra-de-poder-matar` | word of power killing instantly |
| ·· | Parar o Tempo | Time Stop | Transmutação | `parar-o-tempo` | frozen world, stopped clock, caster moving |
| ·· | Portal | Gate | Conjuração | `portal` | portal to another plane opening |
| ·· | Presciência | Foresight | Adivinhação | `presciencia` | eye seeing the future, threads of fate |
| ·· | Projeção Astral | Astral Projection | Necromancia | `projecao-astral` | astral bodies traveling through the Astral Plane |
| ·· | Ressurreição Verdadeira | True Resurrection | Necromancia | `ressurreicao-verdadeira` | grand resurrection from a pile of ash, divine light |
| ·· | Sina | Weird | Ilusão | `sina` | nightmare illusions of each creature's fears |
| ·· | Tempestade da Vingança | Storm of Vengeance | Conjuração | `tempestade-da-vinganca` | massive storm cloud with lightning and acid rain |

Na coluna ✓, **I** quer dizer que o ícone já chegou e **C** que a ilustração já chegou.
