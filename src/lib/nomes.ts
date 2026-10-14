/**
 * ✦ O gerador de nomes por povo. As sílabas e os sobrenomes são todos
 * daqui (nada copiado de livro nem de outro gerador): o primeiro nome sai
 * de pedaços que combinam com o som de cada povo, e o sobrenome é um
 * apelido de família em português, no jeito dos clãs anões de
 * "Barba Cinzenta" e "Barba Vermelha".
 */

export type Genero = "masculino" | "feminino" | "qualquer";

type Povo = {
  slug: string;
  nome: string;
  /** Começo do primeiro nome. */
  inicio: string[];
  /** Pedaço do meio, às vezes. */
  meio?: string[];
  fimMasculino: string[];
  fimFeminino: string[];
  /** Sobrenome, clã ou epíteto. */
  sobrenomes: string[];
  /** Apelido que às vezes vem junto (ou no lugar do primeiro nome). */
  apelidos?: string[];
};

export const POVOS: Povo[] = [
  {
    slug: "anao",
    nome: "Anão",
    inicio: ["Bal", "Bor", "Bram", "Brun", "Dag", "Dor", "Dur", "Gar", "Grim", "Grom", "Gun", "Har", "Hro", "Kal", "Kar", "Mor", "Orm", "Rur", "Thar", "Tor", "Ulf", "Vond", "Brok", "Hal"],
    fimMasculino: ["dan", "dek", "din", "gar", "grim", "rek", "rim", "ni", "nor", "ok", "rik", "rur", "um", "var", "dur", "bek"],
    fimFeminino: ["a", "dis", "hild", "ra", "run", "na", "grid", "wyn", "lin", "dra", "ga", "veig"],
    sobrenomes: [
      "Barba Cinzenta", "Barba Vermelha", "Barba de Ferro", "Barba de Bronze", "Barba Trançada", "Barba de Brasa",
      "Barba de Pedra", "Barba Branca", "Barba Chamuscada", "Barba de Cobre", "Martelo de Pedra", "Martelo Rachado",
      "Martelo Trovejante", "Punho de Ferro", "Punho de Granito", "Escudo Partido", "Escudo de Carvalho", "Bigorna Quente",
      "Bigorna Partida", "Picareta Funda", "Elmo Amassado", "Caneco Cheio", "Caneco Sem Fundo", "Pedra Funda",
      "Veio de Ouro", "Forja Acesa", "Machado Cego", "Cinto de Mithral", "Fornalha Velha", "Rocha Viva",
    ],
    apelidos: ["Pança", "Ruivo", "Nariz de Batata", "Três Dedos", "Caneca", "Bafo de Cerveja", "Mão de Pedra", "Pé Torto", "Velho", "Toco", "Barril", "Resmungão", "Cabeça Dura", "Sobrancelha"],
  },
  {
    slug: "elfo",
    nome: "Elfo",
    inicio: ["Ae", "Ara", "Cael", "Ela", "Fae", "Gal", "Ith", "Lae", "Lir", "Mae", "Nae", "Syl", "Tha", "Eru", "Ily", "Quel", "Vae", "Ser", "Ely", "Aun"],
    meio: ["la", "ri", "the", "va", "no", "lan", "di", "re", "sa", "li"],
    fimMasculino: ["dril", "las", "rion", "thir", "nor", "vel", "ran", "dor", "ion", "riel", "thas", "andor"],
    fimFeminino: ["wen", "ra", "lia", "thiel", "ria", "nis", "wyn", "elle", "sa", "dhra", "lys", "nae"],
    sobrenomes: [
      "Folha de Prata", "Canto do Orvalho", "Estrela da Manhã", "Galho Alto", "Lua Serena", "Brisa Lenta", "Rio de Luz",
      "Flor do Inverno", "Asa de Cinza", "Sombra da Bétula", "Orvalho Antigo", "Vento do Oeste", "Pena de Garça",
      "Raiz Profunda", "Musgo Prateado", "Chuva Mansa", "Céu de Âmbar", "Fio de Luar", "Copa do Carvalho", "Voz do Riacho",
    ],
  },
  {
    slug: "humano",
    nome: "Humano",
    inicio: [],
    fimMasculino: [],
    fimFeminino: [],
    sobrenomes: [
      "Ferreiro", "Moleiro", "do Vale", "da Ponte", "da Torre", "do Moinho", "Pedreira", "Carvalho", "Lobato", "Cardoso",
      "Pereira", "Monteiro", "Ribeiro", "Barqueiro", "Pastor", "Tecelão", "Corvo", "da Encosta", "do Poço", "Vidal",
      "Seixas", "Prado", "Falcão", "Bragado",
    ],
    apelidos: ["o Moço", "o Velho", "Mão Leve", "o Manco", "Língua de Prata", "o Ruivo", "Bom de Copo", "o Calado"],
  },
  {
    slug: "pequenino",
    nome: "Pequenino",
    inicio: ["Pip", "Mil", "Tob", "Rol", "Wil", "Fen", "Cob", "Lin", "Bel", "Ros", "Tam", "Dil", "Nel", "Pom", "Ted", "Mer"],
    fimMasculino: ["o", "in", "bo", "ric", "dor", "wick", "by", "ton", "ias"],
    fimFeminino: ["a", "ie", "bel", "ly", "sa", "rose", "dy", "mina", "ette"],
    sobrenomes: [
      "Pé Ligeiro", "Bolso Fundo", "Monte Verde", "Chá Quente", "Torta de Maçã", "Cesto Cheio", "Morro Baixo", "Pão de Mel",
      "Raiz Doce", "Camélia", "Hortênsia", "Verbena", "Gardênia", "Magnólia", "Lavanda", "Begônia", "Azaleia", "Alecrim",
      "Toca Funda", "Cerca Viva",
    ],
  },
  {
    slug: "gnomo",
    nome: "Gnomo",
    inicio: ["Bim", "Fiz", "Nim", "Pol", "Tink", "Zan", "Gim", "Wob", "Quil", "Dob", "Bix", "Fen", "Nack", "Ori"],
    meio: ["ble", "wi", "lo", "zi", "pi"],
    fimMasculino: ["wick", "ix", "bo", "zle", "ri", "nock", "dle", "ock"],
    fimFeminino: ["bella", "ixa", "ni", "zie", "wyn", "ra", "lia", "pip"],
    sobrenomes: [
      "Engrenagem", "Mola Torta", "Faísca", "Parafuso Solto", "Bule Fumegante", "Lente Rachada", "Rodinha", "Pavio Curto",
      "Chaleira", "Catavento", "Dedal de Cobre", "Alavanca", "Fumacinha", "Manivela", "Relojoeiro", "Ponteiro Torto",
    ],
  },
  {
    slug: "orc",
    nome: "Orc",
    inicio: ["Grak", "Mog", "Thrak", "Urg", "Zug", "Dur", "Gor", "Kro", "Rag", "Shar", "Bol", "Narg", "Vur", "Ghaz"],
    fimMasculino: ["ash", "ok", "ug", "gul", "mak", "nar", "rok", "thak", "gor", "uz"],
    fimFeminino: ["a", "ka", "sha", "gra", "ra", "ul", "ena", "zha"],
    sobrenomes: [
      "Quebra-Crânio", "Dente Partido", "Olho Sangrento", "Punho Negro", "Machado Rubro", "Presa Longa", "Sem Medo",
      "Couro Grosso", "Lua Rasgada", "Osso Rachado", "Grito de Guerra", "Cicatriz", "Ferro Velho", "Pele de Lobo",
    ],
  },
  {
    slug: "goblin",
    nome: "Goblin",
    inicio: ["Grib", "Snik", "Zik", "Nok", "Rik", "Skab", "Gnaz", "Fiz", "Mug", "Pik", "Kruk", "Sniv", "Blig", "Wiz"],
    fimMasculino: ["le", "nik", "snat", "gob", "zit", "ble", "ik", "o", "izz"],
    fimFeminino: ["a", "ka", "zi", "nix", "ette", "ga", "lee"],
    sobrenomes: [
      "Bolso Furado", "Dedo Leve", "Fede-a-Queijo", "Orelha Mordida", "Moeda Torta", "Sorriso Podre", "Pé de Rato",
      "Faca Cega", "Rouba-Galinha", "Brilho-Brilho", "Nariz de Gancho", "Unha Suja", "Sapato Trocado", "Dente de Ouro",
      "Cata-Lixo", "Pulga Gorda",
    ],
  },
  {
    slug: "draconato",
    nome: "Draconato",
    inicio: ["Arj", "Bal", "Dar", "Ghesh", "Kriv", "Med", "Nad", "Pand", "Rho", "Sor", "Tar", "Vra", "Ziv", "Kor"],
    fimMasculino: ["han", "asar", "esh", "jhan", "ar", "ok", "ash", "inn", "yr", "akor"],
    fimFeminino: ["a", "ra", "ith", "ys", "ora", "ann", "isha", "esk"],
    sobrenomes: [
      "Escama de Bronze", "Sopro Rubro", "Asa Partida", "Garra de Cobre", "Chama Antiga", "Cauda de Ferro", "Olho de Brasa",
      "Escama Negra", "Dente de Prata", "Sopro Gelado", "Chifre Torto", "Asa de Trovão",
    ],
  },
  {
    slug: "tiefling",
    nome: "Tiefling",
    inicio: ["Ak", "Bar", "Dam", "Kal", "Mor", "Nem", "Ska", "Zar", "Ori", "Kri", "Mak", "Val", "Ith", "Rie"],
    fimMasculino: ["akos", "ai", "ios", "eth", "ezar", "on", "us", "aram"],
    fimFeminino: ["ira", "is", "ael", "ia", "eth", "ka", "yss"],
    // Um nome de virtude ou de sentimento, no lugar do sobrenome
    sobrenomes: ["Esperança", "Glória", "Tormento", "Canção", "Desejo", "Promessa", "Silêncio", "Cinza", "Ruína", "Lamento", "Saudade", "Coragem", "Segredo", "Vigília"],
  },
  {
    slug: "golias",
    nome: "Golias",
    inicio: ["Ka", "Tho", "Gau", "Va", "Ilo", "Ma", "Ke", "Na", "Pa", "Ro", "Ul", "Sko"],
    fimMasculino: ["gath", "luk", "rak", "veth", "kan", "thar", "rum", "gor"],
    fimFeminino: ["nai", "lai", "ua", "veia", "tha", "rei", "lia"],
    sobrenomes: ["Pisa-Neve", "Leva-Pedra", "Olho de Gelo", "Ombro Largo", "Salta-Rocha", "Grito do Pico", "Mão Firme", "Sobe-Cume", "Pé de Granito", "Vento Frio"],
  },
  {
    slug: "leonino",
    nome: "Leonino",
    inicio: ["Ra", "Sa", "Ka", "Ash", "Ner", "Ta", "Jhar", "Zu", "Mar", "Bah", "Eg", "Vor"],
    fimMasculino: ["han", "rok", "zir", "um", "ar", "esh", "on", "rad"],
    fimFeminino: ["ri", "ra", "isha", "eya", "ani", "zah"],
    sobrenomes: ["Juba Dourada", "Garra Sombria", "Rugido Alto", "Pata Leve", "Juba de Cinza", "Olho de Âmbar", "Dente de Sabre", "Cauda Inquieta", "Pelo de Areia", "Caça Noturna"],
  },
  {
    slug: "centauro",
    nome: "Centauro",
    inicio: ["Cor", "Ere", "Gal", "Kal", "Ner", "Pho", "Tor", "Ari", "Che", "Ly", "Thes", "Ev"],
    fimMasculino: ["on", "us", "eas", "imos", "ion", "andro", "ides"],
    fimFeminino: ["ane", "ia", "oe", "ina", "ea", "ope"],
    sobrenomes: ["Casco Ligeiro", "Crina ao Vento", "Flecha do Campo", "Galope Longo", "Olhar do Horizonte", "Trote Firme", "Capim Alto", "Estrela Guia", "Arco de Freixo", "Pó da Estrada"],
  },
  {
    slug: "fauno",
    nome: "Fauno",
    inicio: ["Fel", "Lu", "Sil", "Ti", "Or", "Vir", "Myr", "Pel", "Bra", "Cel", "Ner"],
    fimMasculino: ["ix", "ano", "vio", "eo", "inho", "eu", "ão"],
    fimFeminino: ["ia", "era", "ina", "ela", "isa", "ena"],
    sobrenomes: ["Flauta Doce", "Chifre Torto", "Casco de Musgo", "Vinho Novo", "Riso Fácil", "Folha de Hera", "Canto do Bosque", "Pé de Cabra", "Amora Silvestre", "Sombra do Salgueiro"],
  },
  {
    slug: "tritao",
    nome: "Tritão",
    inicio: ["Kor", "Ne", "Thal", "Mar", "Ae", "Sel", "Ul", "Or", "Dyn", "Pel", "Ish"],
    fimMasculino: ["ran", "eus", "asso", "ion", "an", "ol"],
    fimFeminino: ["ia", "ine", "ael", "ssa", "ira", "ea"],
    sobrenomes: ["da Maré Alta", "Espuma Branca", "Coral Vermelho", "Concha Antiga", "Onda Funda", "Escama de Pérola", "Corrente Fria", "Sal Eterno", "Recife Partido", "Canto da Baleia"],
  },
];

const HUMANOS_M = ["Aldo", "Bento", "Caio", "Dário", "Edrico", "Fausto", "Gaspar", "Heitor", "Ivo", "Joaquim", "Lauro", "Martim", "Nuno", "Otávio", "Rui", "Silvano", "Tomé", "Vasco", "Ulrico", "Bastião", "Afonso", "Gonçalo", "Lourenço", "Mem"];
const HUMANOS_F = ["Adélia", "Brites", "Catarina", "Dulce", "Elvira", "Filipa", "Guiomar", "Helena", "Inês", "Joana", "Leonor", "Mafalda", "Odete", "Rosália", "Sancha", "Teodora", "Urraca", "Violante", "Branca", "Isaura", "Aldonça", "Mécia"];

const um = <T,>(lista: T[]): T => lista[Math.floor(Math.random() * lista.length)];
const chance = (p: number) => Math.random() < p;

function primeiroNome(povo: Povo, genero: "masculino" | "feminino"): string {
  if (povo.slug === "humano") return um(genero === "masculino" ? HUMANOS_M : HUMANOS_F);
  const fim = um(genero === "masculino" ? povo.fimMasculino : povo.fimFeminino);
  const meio = povo.meio && chance(0.35) ? um(povo.meio) : "";
  const nome = um(povo.inicio) + meio + fim;
  // Sem sílaba repetida ("pipip"), três letras iguais seguidas nem vogal
  // dobrada estranha ("aa", "ee", "ii")
  const limpo = nome
    .replace(/([a-z]{2,3})\1/gi, "$1")
    .replace(/(.)\1\1/g, "$1$1")
    .replace(/([aeiu])\1/gi, "$1")
    .replace(/^Aea/, "Ae");
  return limpo.charAt(0).toUpperCase() + limpo.slice(1).toLowerCase();
}

export type NomeGerado = { nome: string; povo: string };

/** Um nome completo: primeiro nome e sobrenome, às vezes com apelido. */
export function gerarNome(slug: string, genero: Genero): NomeGerado {
  const povo = POVOS.find((p) => p.slug === slug) ?? POVOS[0];
  const g = genero === "qualquer" ? (chance(0.5) ? "masculino" : "feminino") : genero;
  const nome = primeiroNome(povo, g);
  const sobrenome = um(povo.sobrenomes);
  const apelido = povo.apelidos && chance(0.3) ? um(povo.apelidos) : null;
  let completo = `${nome} ${sobrenome}`;
  if (apelido) {
    // O anão pode ser chamado só pelo apelido e pelo clã: "Pança Barba Cinzenta"
    if (povo.slug === "anao" && chance(0.5)) completo = `${apelido} ${sobrenome}`;
    else if (apelido.startsWith("o ")) completo = `${nome} ${apelido}, ${sobrenome}`;
    else completo = `${nome} "${apelido}" ${sobrenome}`;
  }
  return { nome: completo, povo: povo.nome };
}

/** Vários nomes de uma vez, sem repetir. */
export function gerarNomes(slug: string, genero: Genero, quantos = 10): NomeGerado[] {
  const vistos = new Set<string>();
  const saida: NomeGerado[] = [];
  for (let tentativa = 0; saida.length < quantos && tentativa < quantos * 10; tentativa++) {
    const n = gerarNome(slug, genero);
    if (vistos.has(n.nome)) continue;
    vistos.add(n.nome);
    saida.push(n);
  }
  return saida;
}
