import * as THREE from "three";
import * as CANNON from "cannon-es";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { tocar, tocarComo } from "@/lib/som";
import { conquistar, contar, liberado } from "@/lib/conquistas";
import { DADOS, DADO_PADRAO, EVENTO_DADO, dadoSalvo } from "@/lib/dados";
import {
  ATLAS,
  relevoBorda,
  relevoMoeda,
  texturaBrilho,
  texturaChama,
  texturaD20,
  texturaPano,
  texturaCamurca,
  texturaMoldura,
  texturaCapa,
  texturaPaginas,
  texturaSangue,
} from "./texturas";

/**
 * A mesa em 3D: o que está em cima da madeira nas laterais da página.
 *
 * O mundo usa a mesma régua da página: 1 unidade é 1 px, x cresce para a
 * direita e y para cima (então a coordenada y da página entra negativa), e
 * z sai da mesa em direção a quem olha. O tampo é o plano z = 0.
 *
 * A câmera olha reto para baixo, como quem está em pé na frente da mesa, e
 * anda junto com a rolagem: no plano da mesa, um pixel do mundo cai em cima
 * de um pixel da tela. Assim cada objeto fica preso no seu lugar da
 * madeira, rola com ela e é visto do mesmo ângulo que as tábuas. O que tem
 * altura, como as velas, mostra um pouco da lateral quando está longe do
 * centro da tela, como numa foto tirada de cima.
 *
 * O canvas fica por cima do papel e não recebe clique: o dado e as moedas
 * podem rolar pela tela toda e parar em cima da folha. Quem pergunta se o
 * clique caiu num objeto é a MaoNaMesa, pela função `apertar`.
 */

export type ResultadoDoDado = { valor: number; x: number; y: number };

export type MesaAPI = {
  /** O que está debaixo do clique, se for coisa da mesa; `naMadeira` diz se o clique caiu fora do papel. */
  apertar(x: number, y: number, naMadeira: boolean): string | null;
  /** Onde o dado está na tela agora (serve para testar a mesa). */
  ondeEstaODado(): { x: number; y: number } | null;
  /** Joga o dado de onde ele está, numa direção sorteada (o botão "Jogar"). */
  jogar(): void;
  reconstruir(): void;
  destruir(): void;
};

type Avisos = { resultado(r: ResultadoDoDado): void };

// ---------- Medidas ----------

// A gravidade, em px/s². A régua da mesa é de uns 0,4 mm por pixel, então a
// real seria perto de 25 mil; um pouco menos deixa o dado à vista sem flutuar
const G = 17000;
const RAIO_DADO = 30;
const RAIO_MOEDA = 15;
const ESPESSURA_MOEDA = 2.8;
// Câmera bem do alto, quase sem perspectiva, como a madeira, que é uma foto
// tirada de cima: o que tem altura mostra só um fio da lateral
const FOV = 9;

// O icosaedro: os 12 vértices e as 20 faces (as mesmas do three.js)
const T = (1 + Math.sqrt(5)) / 2;
const VERTICES = [
  [-1, T, 0], [1, T, 0], [-1, -T, 0], [1, -T, 0],
  [0, -1, T], [0, 1, T], [0, -1, -T], [0, 1, -T],
  [T, 0, -1], [T, 0, 1], [-T, 0, -1], [-T, 0, 1],
].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(RAIO_DADO));
const FACES_BRUTAS = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

/** Um sorteio que dá sempre o mesmo resultado para a mesma página. */
function semente(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * "mesa" é a do computador: as peças nas laterais da página e o d20 na
 * bandeja. "dado" é a do celular: a tela inteira vira mesa só para o d20,
 * que cai do alto ao abrir e se joga com o dedo.
 */
export type ModoDaMesa = "mesa" | "dado";

/** No celular a câmera chega mais perto: o dado fica maior que o de 60 px do computador. */
const PERTO_NO_CELULAR = 1.6;
/** O espaço que os botões da mesa do celular ocupam embaixo. */
const BOTOES_NO_CELULAR = 104;

export function criarMesa(canvas: HTMLCanvasElement, avisos: Avisos, reduzido: boolean, modo: ModoDaMesa = "mesa"): MesaAPI {
  // ---------- O palco ----------

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environment = ambiente;
  cena.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 5000);
  camera.up.set(0, 1, 0);

  // A luz quente da sala, e a principal vindo do alto, um pouco à esquerda
  cena.add(new THREE.HemisphereLight(0xffe2b8, 0x3a2412, 0.9));
  const sol = new THREE.DirectionalLight(0xffe2b8, 2.4);
  sol.castShadow = true;
  // No celular, uma sombra menor: o dado sozinho não precisa de mais
  const mapa = modo === "dado" ? 1024 : 2048;
  sol.shadow.mapSize.set(mapa, mapa);
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.6;
  sol.shadow.radius = 4;
  cena.add(sol, sol.target);

  // O chão que só mostra sombra: é ele que faz os objetos pousarem na madeira
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShadowMaterial({ color: 0x0a0502, opacity: 0.5 }),
  );
  chao.receiveShadow = true;
  cena.add(chao);

  // ---------- A física ----------

  const mundo = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, -G), allowSleep: true });
  mundo.broadphase = new CANNON.SAPBroadphase(mundo);
  (mundo.solver as CANNON.GSSolver).iterations = 14;
  const matMadeira = new CANNON.Material("madeira");
  const matDado = new CANNON.Material("dado");
  const matMoeda = new CANNON.Material("moeda");
  const matCamurca = new CANNON.Material("camurca");
  mundo.addContactMaterial(new CANNON.ContactMaterial(matMadeira, matDado, { friction: 0.42, restitution: 0.3 }));
  mundo.addContactMaterial(new CANNON.ContactMaterial(matMadeira, matMoeda, { friction: 0.45, restitution: 0.22 }));
  mundo.addContactMaterial(new CANNON.ContactMaterial(matDado, matMoeda, { friction: 0.2, restitution: 0.3 }));
  // Moeda em cima de moeda: sem quique e com o contato um pouco macio,
  // senão a pilha fica tremendo e tilintando sem parar (o "guizo")
  mundo.addContactMaterial(
    new CANNON.ContactMaterial(matMoeda, matMoeda, { friction: 0.6, restitution: 0, contactEquationRelaxation: 4 }),
  );
  // A camurça segura: o dado quase não quica e para logo
  mundo.addContactMaterial(new CANNON.ContactMaterial(matCamurca, matDado, { friction: 0.75, restitution: 0.12 }));
  mundo.addContactMaterial(new CANNON.ContactMaterial(matCamurca, matMoeda, { friction: 0.8, restitution: 0.05 }));

  const GRUPO_MESA = 1;
  const GRUPO_PAREDE = 2;
  const GRUPO_DADO = 4;
  const GRUPO_MOEDA = 8;

  const tampo = new CANNON.Body({ mass: 0, material: matMadeira, collisionFilterGroup: GRUPO_MESA });
  tampo.addShape(new CANNON.Plane());
  mundo.addBody(tampo);

  // ---------- Materiais e texturas, feitos uma vez ----------

  const tex = {
    pano: texturaPano(),
    camurca: texturaCamurca(),
    moldura: texturaMoldura(),
    panoVerde: texturaPano({ base: "#1d4a35", borda: "#0f2b1e", fio: "190,255,210" }),
    moeda: relevoMoeda(),
    borda: relevoBorda(),
    chama: texturaChama(),
    brilho: texturaBrilho(),
    clarao: texturaBrilho(true),
    paginas: texturaPaginas(),
    sangue: texturaSangue(),
    poca: texturaSangue("255,255,255", "170,170,170"),
  };
  // As capas dos livros, cada uma com o seu couro: vinho, verde, azul e castanho
  const COURO_DOS_LIVROS = ["#5c1c16", "#1f3d2b", "#262c4c", "#4c3319"];
  const capas = COURO_DOS_LIVROS.map((cor) => ({
    capa: new THREE.MeshStandardMaterial({ map: texturaCapa(cor), roughness: 0.7, bumpScale: 0.6 }),
    couro: new THREE.MeshStandardMaterial({ color: cor, roughness: 0.75 }),
  }));
  const mat = {
    ouroFace: new THREE.MeshStandardMaterial({ color: 0xd9aa45, metalness: 1, roughness: 0.3, bumpMap: tex.moeda, bumpScale: 1.6 }),
    ouroBorda: new THREE.MeshStandardMaterial({ color: 0xb98d2f, metalness: 1, roughness: 0.38, bumpMap: tex.borda, bumpScale: 1.2 }),
    latao: new THREE.MeshStandardMaterial({ color: 0x7a5a22, metalness: 0.9, roughness: 0.55, envMapIntensity: 0.6 }),
    cera: new THREE.MeshStandardMaterial({ color: 0xdcc8a0, roughness: 0.6, emissive: 0x3a1c06, emissiveIntensity: 0.18 }),
    poca: new THREE.MeshStandardMaterial({ color: 0xc9ac78, roughness: 0.2, emissive: 0x5a2c08, emissiveIntensity: 0.25 }),
    pavio: new THREE.MeshStandardMaterial({ color: 0x1a120c, roughness: 0.9 }),
    pano: new THREE.MeshStandardMaterial({ map: tex.pano, roughness: 0.95, side: THREE.DoubleSide }),
    camurca: new THREE.MeshPhysicalMaterial({ map: tex.camurca, roughness: 1, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x6f86c4) }),
    moldura: new THREE.MeshStandardMaterial({ map: tex.moldura, roughness: 0.45, metalness: 0.05 }),
    panoVerde: new THREE.MeshStandardMaterial({ map: tex.panoVerde, roughness: 0.95, side: THREE.DoubleSide }),
    chama: new THREE.SpriteMaterial({ map: tex.chama, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }),
    halo: new THREE.SpriteMaterial({ map: tex.chama, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0.22 }),
    brilho: new THREE.MeshBasicMaterial({ map: tex.brilho, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    paginas: new THREE.MeshStandardMaterial({ map: tex.paginas, roughness: 0.9 }),
    fita: new THREE.MeshStandardMaterial({ color: 0x8c1420, roughness: 0.6, side: THREE.DoubleSide }),
    // O vidro soma luz em vez de cobrir: deixa ver o líquido e a madeira
    // embaixo e acende só onde reflete, como vidro de verdade
    vidro: new THREE.MeshPhysicalMaterial({
      color: 0x6f8a90,
      roughness: 0.03,
      metalness: 0,
      clearcoat: 1,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      envMapIntensity: 1.5,
    }),
    reflexo: new THREE.SpriteMaterial({ map: tex.clarao, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.75 }),
    rolha: new THREE.MeshStandardMaterial({ color: 0x8a6238, roughness: 0.9 }),
    aco: new THREE.MeshStandardMaterial({ color: 0xc9ccd1, metalness: 1, roughness: 0.26 }),
    acoEscuro: new THREE.MeshStandardMaterial({ color: 0x6d7178, metalness: 1, roughness: 0.4 }),
    ouro: new THREE.MeshStandardMaterial({ color: 0xb08530, metalness: 1, roughness: 0.38, envMapIntensity: 0.8 }),
    empunhadura: new THREE.MeshStandardMaterial({ color: 0x3b2414, roughness: 0.85 }),
    haste: new THREE.MeshStandardMaterial({ color: 0x8b6a42, roughness: 0.7 }),
    linha: new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.9 }),
    penaVermelha: new THREE.MeshStandardMaterial({ color: 0x9c1f1f, roughness: 0.9, side: THREE.DoubleSide }),
    penaClara: new THREE.MeshStandardMaterial({ color: 0xe8e1d0, roughness: 0.9, side: THREE.DoubleSide }),
    // Sangue seco: fosco, sem reflexo nenhum
    sangue: new THREE.MeshLambertMaterial({
      map: tex.sangue,
      color: 0x9a6a62,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  };

  // As poções: cada cor tem o seu líquido, a sua poça e o seu clarão na
  // madeira, feitos uma vez e repetidos em todas as garrafas da mesma cor
  const CORES_DAS_POCOES = [0xc0172e, 0x2a62e0, 0x3fb04a, 0x8a3ad0, 0xe0921c];
  const daPocao = new Map<number, { liquido: THREE.Material; poca: THREE.Material; brilho: THREE.Material }>();
  function materiaisDaPocao(cor: number) {
    let m = daPocao.get(cor);
    if (!m) {
      m = {
        liquido: new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.55, roughness: 0.15 }),
        poca: new THREE.MeshStandardMaterial({
          map: tex.poca,
          color: cor,
          emissive: cor,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.85,
          roughness: 0.1,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
        }),
        brilho: new THREE.MeshBasicMaterial({
          map: tex.clarao,
          color: cor,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.32,
        }),
      };
      daPocao.set(cor, m);
    }
    return m;
  }

  /**
   * A pintura do d20 no estilo escolhido (src/lib/dados.ts): resina polida,
   * com a tinta dos números e frisos refletindo a sala se for metal, e
   * acesa sozinha nos estilos que brilham. O verniz por cima dá o brilho
   * molhado. Um estilo ainda não conquistado volta para o padrão.
   */
  function pintarDado(chave: string) {
    const valido = liberado("dado", chave) ? chave : DADO_PADRAO;
    const estilo = DADOS.find((d) => d.chave === valido) ?? DADOS[0];
    const t = texturaD20(estilo);
    const material = new THREE.MeshPhysicalMaterial({
      map: t.cor,
      metalnessMap: t.metal,
      roughnessMap: t.metal,
      metalness: 1,
      roughness: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.3,
      ...(t.luz ? { emissiveMap: t.luz, emissive: new THREE.Color(0xffffff), emissiveIntensity: 1.6 } : {}),
    });
    const texturas = [t.cor, t.metal, t.luz].filter((x): x is THREE.CanvasTexture => !!x);
    return { material, texturas };
  }
  let pinturaDado = pintarDado(dadoSalvo());
  let redesenhar = false;
  const trocarDado = (e: Event) => {
    const nova = pintarDado((e as CustomEvent<string>).detail);
    if (dado) (dado.mesh as THREE.Mesh).material = nova.material;
    pinturaDado.material.dispose();
    pinturaDado.texturas.forEach((t) => t.dispose());
    pinturaDado = nova;
    redesenhar = true;
  };
  window.addEventListener(EVENTO_DADO, trocarDado);

  const geoMoeda = new THREE.CylinderGeometry(RAIO_MOEDA, RAIO_MOEDA, ESPESSURA_MOEDA, 40);
  geoMoeda.rotateX(Math.PI / 2);
  const matsMoeda = [mat.ouroBorda, mat.ouroFace, mat.ouroFace];

  // ---------- O d20 ----------

  const { geoDado, normais, numeros } = montarD20();
  const formaDado = new CANNON.ConvexPolyhedron({
    vertices: VERTICES.map((v) => new CANNON.Vec3(v.x, v.y, v.z)),
    faces: FACES_BRUTAS.map((f, i) => (normais[i].ehInvertida ? [f[0], f[2], f[1]] : f)),
  });

  // ---------- O que está na mesa agora ----------

  type Corpo = { body: CANNON.Body; mesh: THREE.Object3D };
  type Vela = { chama: THREE.Sprite; halo: THREE.Sprite; luz: THREE.PointLight; brilho: THREE.Mesh; fase: number; base: number; sopro: number; y: number };
  let grupo = new THREE.Group();
  cena.add(grupo);
  let corpos: Corpo[] = [];
  let estaticos: CANNON.Body[] = [];
  let velas: Vela[] = [];
  let clicaveis: THREE.Object3D[] = [];
  let dado: Corpo | null = null;
  let paredes: CANNON.Body[] = [];
  type Bandeja = { x: number; y: number; dentro: number; fora: number; muros: CANNON.Body[]; fundo: CANNON.Body };
  let bandeja: Bandeja | null = null;
  let atraindo = false;
  // Onde estão os panos, para o que fica em cima deles assentar no tecido
  let panos: { x0: number; x1: number; y0: number; y1: number }[] = [];
  // O som que cada peça parada faz quando o dado bate nela (o resto é madeira)
  const somDoCorpo = new WeakMap<CANNON.Body, "vidro" | "aco">();

  function limpar() {
    cena.remove(grupo);
    grupo.traverse((o) => {
      if (o instanceof THREE.Mesh && o.geometry !== geoMoeda && o.geometry !== geoDado) o.geometry.dispose();
      if (o instanceof THREE.PointLight) o.dispose();
    });
    grupo = new THREE.Group();
    cena.add(grupo);
    for (const v of velas) (v.brilho.material as THREE.Material).dispose();
    for (const c of corpos) mundo.removeBody(c.body);
    for (const b of estaticos) mundo.removeBody(b);
    for (const b of paredes) mundo.removeBody(b);
    corpos = [];
    estaticos = [];
    paredes = [];
    velas = [];
    clicaveis = [];
    dado = null;
    bandeja = null;
    atraindo = false;
    panos = [];
  }

  /** As colunas de madeira livre dos dois lados do papel, na página. */
  function colunas() {
    const vw = document.documentElement.clientWidth;
    const main = document.querySelector<HTMLElement>("#conteudo main");
    let esq = (vw - 768) / 2;
    let dir = vw - esq;
    if (main) {
      const r = main.getBoundingClientRect();
      esq = r.left;
      dir = r.right;
    }
    const lista: { de: number; ate: number; lado: "esq" | "dir" }[] = [];
    if (esq - 40 >= 150) lista.push({ de: 22, ate: esq - 18, lado: "esq" });
    if (vw - dir - 40 >= 150) lista.push({ de: dir + 18, ate: vw - 22, lado: "dir" });
    return lista;
  }

  type Peca = "castical" | "pilha" | "soltas" | "livros" | "pocoes" | "adaga" | "flecha";
  type Plano = { meia: number; largura: number; criar(x: number, y: number): void };

  /**
   * Quanto cada peça ocupa (meia altura e largura, na página) e como ela se
   * monta. A adaga e a flecha já sorteiam aqui o ângulo em que estão
   * deitadas, para caber na largura da coluna.
   */
  function planejar(tipo: Peca, largo: number, sorte: () => number): Plano {
    const escala = Math.min(1, largo / 260);
    const deitada = (comprimento: number) => {
      // O cosseno do ângulo com a horizontal: deitada na diagonal até onde a coluna deixa
      const c = Math.min((largo - 40) / comprimento, 0.25 + sorte() * 0.6);
      return (sorte() < 0.5 ? 1 : -1) * Math.acos(Math.max(0.05, Math.min(1, c)));
    };
    switch (tipo) {
      case "castical":
        return { meia: 70, largura: 120, criar: (x, y) => castical(x, y, sorte) };
      case "pilha":
        return { meia: 55, largura: 110, criar: (x, y) => pilha(x, y, sorte) };
      case "soltas":
        return { meia: 55, largura: 100, criar: (x, y) => soltas(x, y, sorte) };
      case "livros":
        return { meia: 100 * escala, largura: 135 * escala, criar: (x, y) => livros(x, y, escala, sorte) };
      case "pocoes":
        return { meia: 70 * escala, largura: 120 * escala, criar: (x, y) => pocoes(x, y, escala, sorte) };
      case "adaga": {
        const comp = 170 * escala;
        const ang = deitada(comp);
        return {
          meia: (Math.abs(Math.sin(ang)) * comp) / 2 + 40,
          largura: Math.abs(Math.cos(ang)) * comp + 40,
          criar: (x, y) => adaga(x, y, ang, escala, sorte),
        };
      }
      case "flecha": {
        const comp = 220 * escala;
        const ang = deitada(comp);
        return {
          meia: (Math.abs(Math.sin(ang)) * comp) / 2 + 15,
          largura: Math.abs(Math.cos(ang)) * comp + 24,
          criar: (x, y) => flecha(x, y, ang, escala),
        };
      }
    }
  }

  /**
   * Desce uma coluna pondo as peças da fila uma depois da outra, com um
   * respiro sorteado entre elas, até o rodapé. `livre` é um trecho que já
   * tem dono (a bandeja) e fica de fora.
   */
  function encher(col: { de: number; ate: number }, inicio: number, fim: number, fila: Peca[], sorte: () => number, livre?: [number, number]) {
    const largo = col.ate - col.de;
    let y = inicio;
    let anterior = 0;
    let casticais = 0;
    let i = Math.floor(sorte() * fila.length);
    for (let n = 0; n < 40; n++) {
      let tipo = fila[i++ % fila.length];
      // Cada castiçal acende três luzes: mais de três na página pesa
      if (tipo === "castical" && casticais >= 3) tipo = "pilha";
      const p = planejar(tipo, largo, sorte);
      y += anterior ? anterior + p.meia + 130 + sorte() * 170 : p.meia;
      if (livre && y + p.meia > livre[0] && y - p.meia < livre[1]) y = livre[1] + p.meia + 40;
      if (y + p.meia > fim) break;
      const x = col.de + p.largura / 2 + sorte() * Math.max(0, largo - p.largura);
      p.criar(x, y);
      if (tipo === "castical") casticais++;
      anterior = p.meia;
    }
  }

  /** A altura do chão num ponto da página: em cima do pano, o tecido; fora, a madeira. */
  function chaoEm(x: number, y: number) {
    return panos.some((p) => x > p.x0 && x < p.x1 && y > p.y0 && y < p.y1) ? 1.6 : 0;
  }

  function montar() {
    limpar();
    if (modo === "dado") {
      montarSoODado();
      return;
    }
    const cols = colunas();
    if (!cols.length) return;
    const sorte = semente(location.pathname);
    const rodape = document.querySelector("footer");
    const fim = rodape ? rodape.getBoundingClientRect().top + window.scrollY - 60 : document.documentElement.scrollHeight - 200;

    const esq = cols.find((c) => c.lado === "esq");
    const dir = cols.find((c) => c.lado === "dir");

    // Os panos, um de cada lado, encostados no papel: vermelho à esquerda
    // e verde à direita
    const largura = 104;
    if (esq && esq.ate - esq.de >= 180) pano(esq.ate - largura / 2 - 18, 70, fim + 40, largura, "vermelho");
    if (dir && dir.ate - dir.de >= 180) pano(dir.de + largura / 2 + 18, 70, fim + 40, largura, "verde");

    // Do lado direito, velas, livros, moedas e armas descendo a página
    if (dir) {
      encher(dir, 240, fim - 40, ["castical", "livros", "pilha", "pocoes", "adaga", "castical", "flecha", "soltas", "livros", "pocoes", "castical", "pilha", "flecha", "adaga"], sorte);
    }

    // Do lado esquerdo, a bandeja de dados com o d20 dentro, e o resto em
    // volta dela
    if (esq) {
      const fora = Math.min(92, (esq.ate - esq.de - 16) / 2);
      const xb = esq.de + fora + 4;
      criarBandeja(xb, 640, fora);
      criarDado(xb, 640);
      encher(esq, 250, fim - 40, ["pocoes", "soltas", "livros", "flecha", "pilha", "adaga", "pocoes", "soltas", "livros", "adaga", "flecha", "pilha"], sorte, [640 - fora - 40, 640 + fora + 40]);
    }
    sincronizar();
  }

  /**
   * A mesa do celular: só o d20, que cai do alto no meio da tela, girando,
   * como quem solta o dado da mão. A queda já é uma jogada e dá resultado.
   */
  function montarSoODado() {
    cercar();
    const vw = document.documentElement.clientWidth;
    criarDado(vw / 2, window.scrollY + window.innerHeight * 0.45);
    if (!dado) return;
    const b = dado.body;
    const giro = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28),
    );
    b.quaternion.set(giro.x, giro.y, giro.z, giro.w);
    b.position.z = 420;
    b.velocity.set((Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500, -200);
    b.angularVelocity.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 22, (Math.random() - 0.5) * 10);
    lancado = true;
    parado = 0;
    sincronizar();
  }

  /** Põe cada malha onde o corpo dela está. */
  function sincronizar() {
    for (const c of corpos) {
      c.mesh.position.set(c.body.position.x, c.body.position.y, c.body.position.z);
      c.mesh.quaternion.set(c.body.quaternion.x, c.body.quaternion.y, c.body.quaternion.z, c.body.quaternion.w);
    }
  }

  // ---------- As peças ----------

  function pano(x: number, de: number, ate: number, largura: number, cor: "vermelho" | "verde") {
    const comprimento = ate - de;
    const segs = Math.max(8, Math.round(comprimento / 30));
    const geo = new THREE.PlaneGeometry(largura, comprimento, 8, segs);
    // As dobras: ondas largas na direção do comprimento, um pouco mais
    // fundas nas beiradas, onde o pano assenta na madeira
    const pos = geo.attributes.position;
    const fase = Math.random() * 10;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      const borda = Math.abs(px) / (largura / 2);
      // As dobras ficam abaixo de 1,6 px: o pano é chão, e o que cai nele
      // pousa por cima (antes uma moeda afundava numa dobra mais alta)
      const onda = Math.sin(py / 95 + fase) * 0.45 + Math.sin(py / 37 + fase * 2) * 0.2;
      pos.setZ(i, 1.0 + onda * (0.6 + 0.4 * borda) - borda * borda * 0.7);
    }
    geo.computeVertexNormals();
    const textura = cor === "verde" ? tex.panoVerde : tex.pano;
    textura.repeat.set(1, comprimento / 512);
    const malha = new THREE.Mesh(geo, cor === "verde" ? mat.panoVerde : mat.pano);
    malha.position.set(x, -(de + comprimento / 2), 0);
    malha.receiveShadow = true;
    malha.castShadow = true;
    malha.userData.tipo = "pano";
    grupo.add(malha);
    clicaveis.push(malha);
    const chaoDoPano = new CANNON.Body({ mass: 0, material: matCamurca, collisionFilterGroup: GRUPO_MESA });
    chaoDoPano.addShape(new CANNON.Box(new CANNON.Vec3(largura / 2, comprimento / 2, 0.8)));
    chaoDoPano.position.set(x, -(de + comprimento / 2), 0.8);
    mundo.addBody(chaoDoPano);
    estaticos.push(chaoDoPano);
    panos.push({ x0: x - largura / 2, x1: x + largura / 2, y0: de, y1: ate });
  }

  // O último tlim de qualquer moeda: dez moedas batendo juntas soam como
  // algumas, não como um chocalho
  let ultimoTlim = 0;

  function moeda(x: number, y: number, z: number, giro: number, inclinacao = 0, assentada = z <= ESPESSURA_MOEDA) {
    const malha = new THREE.Mesh(geoMoeda, matsMoeda);
    malha.castShadow = true;
    malha.receiveShadow = true;
    malha.userData.tipo = "moedas";
    grupo.add(malha);
    clicaveis.push(malha);
    const body = new CANNON.Body({
      mass: 0.2,
      material: matMoeda,
      collisionFilterGroup: GRUPO_MOEDA,
      collisionFilterMask: GRUPO_MESA | GRUPO_DADO | GRUPO_MOEDA,
      linearDamping: 0.3,
      angularDamping: 0.5,
      // Uma moeda que só treme no lugar já conta como parada: com a
      // gravidade da mesa, o tremor de um contato passa de 6 px/s, e com
      // o limite antigo a pilha nunca dormia
      sleepSpeedLimit: 30,
      sleepTimeLimit: 0.2,
    });
    const forma = new CANNON.Cylinder(RAIO_MOEDA, RAIO_MOEDA, ESPESSURA_MOEDA, 12);
    body.addShape(forma, new CANNON.Vec3(), new CANNON.Quaternion().setFromEuler(Math.PI / 2, 0, 0));
    // Nasce já no lugar (no pano, em cima do tecido) e, se está apoiada no
    // chão ou na pilha, dormindo: acorda quando o dado ou a mão mexem nela.
    // A que nasce por cima de outra, solta, cai e assenta sozinha
    body.position.set(x, -y, z + chaoEm(x, y));
    body.quaternion.setFromEuler(inclinacao, 0, giro);
    mundo.addBody(body);
    if (assentada && !inclinacao) body.sleep();
    corpos.push({ body, mesh: malha });
    // O "tlim" de moeda caindo: o ferro batido do site, bem mais agudo e
    // baixo. Só batida de verdade: o roçar de uma moeda na outra não soa
    let ultima = 0;
    body.addEventListener("collide", (e: { contact: CANNON.ContactEquation; body: CANNON.Body }) => {
      const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
      const outraMoeda = e.body.material === matMoeda;
      if (v < (outraMoeda ? 420 : 260)) return;
      const agora = performance.now();
      if (agora - ultima < 120 || agora - ultimoTlim < 40) return;
      ultima = agora;
      ultimoTlim = agora;
      tocarComo("metal", { volume: Math.min(1, v / 1500) * 0.55, velocidade: 1.7 + Math.random() * 0.4 });
    });
    // A moeda que dorme de lado, apoiada na borda: a face (o eixo z dela)
    // ficou deitada, e o centro está no alto, a um raio da mesa
    body.addEventListener("sleep", () => {
      const q = body.quaternion;
      const face = 1 - 2 * (q.x * q.x + q.y * q.y);
      if (Math.abs(face) < 0.3 && body.position.z > RAIO_MOEDA * 0.75) conquistar("moeda-em-pe");
    });
  }

  function pilha(x: number, y: number, sorte: () => number) {
    for (let i = 0; i < 7; i++) {
      moeda(x + (sorte() - 0.5) * 3, y + (sorte() - 0.5) * 3, ESPESSURA_MOEDA / 2 + i * ESPESSURA_MOEDA, sorte() * 6.28, 0, true);
    }
    for (let i = 0; i < 3; i++) {
      const a = sorte() * 6.28;
      moeda(x + Math.cos(a) * (38 + sorte() * 18), y + Math.sin(a) * (30 + sorte() * 14), ESPESSURA_MOEDA / 2, sorte() * 6.28);
    }
  }

  function soltas(x: number, y: number, sorte: () => number) {
    const n = 4 + Math.floor(sorte() * 3);
    for (let i = 0; i < n; i++) {
      const a = sorte() * 6.28;
      const r = sorte() * 46;
      // Uma ou outra moeda por cima de outra, para não parecer enfileirado
      const z = i > 2 && sorte() > 0.6 ? ESPESSURA_MOEDA * 1.5 : ESPESSURA_MOEDA / 2;
      moeda(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, z, sorte() * 6.28);
    }
  }

  function castical(x: number, y: number, sorte: () => number) {
    const prato = new THREE.Mesh(new THREE.CylinderGeometry(52, 58, 7, 48).rotateX(Math.PI / 2), mat.latao);
    prato.position.set(x, -y, 3.5);
    prato.castShadow = true;
    prato.receiveShadow = true;
    prato.userData.tipo = "velas";
    grupo.add(prato);
    clicaveis.push(prato);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(54, 2.6, 10, 48), mat.latao);
    aro.position.set(x, -y, 7);
    aro.castShadow = true;
    grupo.add(aro);
    const corpoPrato = new CANNON.Body({ mass: 0, material: matMadeira, collisionFilterGroup: GRUPO_MESA });
    corpoPrato.addShape(new CANNON.Cylinder(56, 56, 8, 16), new CANNON.Vec3(), new CANNON.Quaternion().setFromEuler(Math.PI / 2, 0, 0));
    corpoPrato.position.set(x, -y, 4);
    mundo.addBody(corpoPrato);
    estaticos.push(corpoPrato);

    const tres: [dx: number, dy: number, r: number, h: number][] = [
      [-22, 10, 11, 70 + sorte() * 30],
      [20, 14, 10, 50 + sorte() * 20],
      [2, -18, 12, 95 + sorte() * 30],
    ];
    for (const [dx, dy, r, h] of tres) {
      const cx = x + dx;
      const cy = -y + dy;
      const vela = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.03, h, 28).rotateX(Math.PI / 2), mat.cera);
      vela.position.set(cx, cy, 7 + h / 2);
      vela.castShadow = true;
      vela.receiveShadow = true;
      vela.userData.tipo = "velas";
      grupo.add(vela);
      clicaveis.push(vela);
      // A poça de cera derretida em volta do pavio
      const poca = new THREE.Mesh(new THREE.CircleGeometry(r * 0.78, 24), mat.poca);
      poca.position.set(cx, cy, 7 + h + 0.2);
      grupo.add(poca);
      // Pingos escorrendo pela lateral
      for (let k = 0; k < 3; k++) {
        const a = sorte() * 6.28;
        const comp = 8 + sorte() * 22;
        const pingo = new THREE.Mesh(new THREE.CapsuleGeometry(1.8, comp, 4, 8).rotateX(Math.PI / 2), mat.cera);
        pingo.position.set(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 7 + h - comp / 2 - 1);
        grupo.add(pingo);
      }
      const pavio = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 7, 6).rotateX(Math.PI / 2), mat.pavio);
      pavio.position.set(cx, cy, 7 + h + 3.5);
      grupo.add(pavio);

      // Vista de cima, a chama é um ponto de luz em cima do pavio, e o resto
      // é o clarão em volta, fraco o bastante para a cera aparecer
      const chama = new THREE.Sprite(mat.chama);
      chama.position.set(cx, cy, 7 + h + 12);
      chama.scale.set(15, 15, 1);
      chama.renderOrder = 11;
      grupo.add(chama);
      const halo = new THREE.Sprite(mat.halo);
      halo.position.set(cx, cy, 7 + h + 10);
      halo.scale.set(58, 58, 1);
      halo.renderOrder = 10;
      grupo.add(halo);
      const luz = new THREE.PointLight(0xff9a40, 0.7, 300, 0);
      luz.position.set(cx, cy, 7 + h + 16);
      grupo.add(luz);
      const brilho = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), mat.brilho.clone());
      brilho.position.set(cx, cy, 0.3);
      grupo.add(brilho);
      velas.push({ chama, halo, luz, brilho, fase: sorte() * 100, base: 1, sopro: 0, y });

      const corpoVela = new CANNON.Body({ mass: 0, material: matMadeira, collisionFilterGroup: GRUPO_MESA });
      corpoVela.addShape(new CANNON.Cylinder(r, r, h, 12), new CANNON.Vec3(), new CANNON.Quaternion().setFromEuler(Math.PI / 2, 0, 0));
      corpoVela.position.set(cx, cy, 7 + h / 2);
      mundo.addBody(corpoVela);
      estaticos.push(corpoVela);
    }
  }

  /** Um corpo parado na mesa, que o dado e as moedas sentem mas não movem. */
  function fixo(x: number, y: number, z: number, giro: number, formas: [CANNON.Shape, CANNON.Vec3, CANNON.Quaternion?][], som?: "vidro" | "aco") {
    const body = new CANNON.Body({ mass: 0, material: matMadeira, collisionFilterGroup: GRUPO_MESA });
    for (const [f, o, q] of formas) body.addShape(f, o, q);
    body.position.set(x, y, z);
    body.quaternion.setFromEuler(0, 0, giro);
    mundo.addBody(body);
    estaticos.push(body);
    if (som) somDoCorpo.set(body, som);
  }

  function malha(geo: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], sombra = true) {
    const o = new THREE.Mesh(geo, m);
    o.castShadow = sombra;
    o.receiveShadow = true;
    return o;
  }

  /** O ponto de luz que a janela da sala deixa no vidro, do lado de onde vem a luz. */
  function reflexo(x: number, y: number, z: number, tam: number) {
    const r = new THREE.Sprite(mat.reflexo);
    r.position.set(x, y, z);
    r.scale.set(tam, tam, 1);
    r.renderOrder = 5;
    return r;
  }

  /** Um cilindro de pé (o eixo no z), como o three.js não faz sozinho. */
  const cilindro = (r1: number, r2: number, h: number, lados = 24) =>
    new THREE.CylinderGeometry(r1, r2, h, lados).rotateX(Math.PI / 2);

  /**
   * Uma pilha de dois ou três livros de couro, cada um meio torto em cima do
   * outro, com friso de ouro na capa e o corte das folhas cor de creme. O de
   * cima às vezes tem a fita marcando a página.
   */
  function livros(x: number, y: number, escala: number, sorte: () => number) {
    let z = chaoEm(x, y);
    const n = 2 + Math.floor(sorte() * 2);
    const giro0 = (sorte() - 0.5) * 1.2;
    for (let i = 0; i < n; i++) {
      // Os de baixo são os maiores, como se empilha de verdade
      const w = (122 - i * 9 + sorte() * 10) * escala;
      const h = w * (1.32 + sorte() * 0.1);
      const t = (13 + sorte() * 11) * escala;
      const cx = x + (sorte() - 0.5) * 16 * escala;
      const cy = -y + (sorte() - 0.5) * 16 * escala;
      const giro = giro0 + (sorte() - 0.5) * 0.45;
      const { capa, couro } = capas[Math.floor(sorte() * capas.length)];
      const livro = new THREE.Group();
      const placa = 2;
      // O miolo, um pouco recolhido dentro da capa
      livro.add(malha(new THREE.BoxGeometry(w - 7, h - 6, t - placa * 2), [mat.paginas, couro, mat.paginas, mat.paginas, mat.paginas, mat.paginas]).translateX(1.5));
      livro.add(malha(new THREE.BoxGeometry(w, h, placa), [couro, couro, couro, couro, capa, couro]).translateZ(t / 2 - placa / 2));
      livro.add(malha(new THREE.BoxGeometry(w, h, placa), couro).translateZ(-t / 2 + placa / 2));
      // A lombada, arredondada pelo couro
      livro.add(malha(new THREE.CylinderGeometry(t / 2, t / 2, h, 12, 1, false, Math.PI, Math.PI), couro).translateX(-w / 2 + 1));
      if (i === n - 1 && sorte() > 0.4) {
        const fita = malha(new THREE.PlaneGeometry(4, 34), mat.fita, false);
        fita.position.set(w * (0.15 - sorte() * 0.3), -h / 2 - 12, t / 2 - placa);
        livro.add(fita);
      }
      livro.position.set(cx, cy, z + t / 2);
      livro.rotation.z = giro;
      livro.userData.tipo = "livros";
      livro.traverse((o) => (o.userData.tipo = "livros"));
      grupo.add(livro);
      livro.children.forEach((c) => clicaveis.push(c));
      fixo(cx, cy, z + t / 2, giro, [[new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, t / 2)), new CANNON.Vec3()]]);
      z += t;
    }
  }

  /**
   * Duas ou três poções: o frasco redondo de pé, a garrafinha quadrada e,
   * às vezes, um vidro tombado com a rolha solta e o líquido escorrido na
   * madeira. O líquido brilha um pouco, e o brilho tinge a mesa em volta.
   */
  function pocoes(x: number, y: number, escala: number, sorte: () => number) {
    const base = chaoEm(x, y);
    const cores = [...CORES_DAS_POCOES].sort(() => sorte() - 0.5);
    const tipos: ("redondo" | "quadrado" | "tombado")[] = sorte() > 0.45 ? ["redondo", "quadrado", "tombado"] : ["redondo", "quadrado"];
    const giro = sorte() * 6.28;
    tipos.forEach((tipo, i) => {
      const a = giro + (i * Math.PI * 2) / tipos.length;
      const r = (tipos.length === 2 ? 24 : 32) * escala;
      const px = x + Math.cos(a) * r;
      const py = -y + Math.sin(a) * r;
      const cor = cores[i];
      const m = materiaisDaPocao(cor);
      const brilho = new THREE.Mesh(new THREE.PlaneGeometry(130 * escala, 130 * escala), m.brilho);
      brilho.position.set(px, py, base + 0.4);
      grupo.add(brilho);

      if (tipo === "redondo") {
        const R = (22 + sorte() * 5) * escala;
        const gargalo = R * 0.3;
        const corpo = malha(new THREE.SphereGeometry(R, 32, 20), mat.vidro, false);
        corpo.position.set(px, py, base + R);
        corpo.userData.tipo = "pocoes";
        const liquido = malha(new THREE.SphereGeometry(R * 0.93, 28, 16), m.liquido);
        liquido.position.copy(corpo.position);
        const pescoco = malha(cilindro(gargalo, gargalo * 1.15, R * 0.8, 16), mat.vidro, false);
        pescoco.position.set(px, py, base + R * 2.2);
        const rolha = malha(cilindro(gargalo * 1.05, gargalo * 0.9, R * 0.45, 14), mat.rolha);
        rolha.position.set(px, py, base + R * 2.7);
        rolha.userData.tipo = "pocoes";
        grupo.add(liquido, corpo, pescoco, rolha, reflexo(px - R * 0.42, py + R * 0.42, base + R * 2, R * 0.5));
        clicaveis.push(corpo, rolha);
        fixo(px, py, base + R, 0, [[new CANNON.Sphere(R), new CANNON.Vec3()]], "vidro");
      } else if (tipo === "quadrado") {
        const L = (24 + sorte() * 4) * escala;
        const H = (56 + sorte() * 16) * escala;
        const gargalo = L * 0.24;
        const rot = sorte() * 1.5;
        const corpo = malha(new THREE.BoxGeometry(L, L, H), mat.vidro, false);
        corpo.position.set(px, py, base + H / 2);
        corpo.rotation.z = rot;
        corpo.userData.tipo = "pocoes";
        const nivel = H * (0.55 + sorte() * 0.3);
        const liquido = malha(new THREE.BoxGeometry(L - 2.5, L - 2.5, nivel), m.liquido);
        liquido.position.set(px, py, base + 2 + nivel / 2);
        liquido.rotation.z = rot;
        const pescoco = malha(cilindro(gargalo, gargalo, H * 0.22, 14), mat.vidro, false);
        pescoco.position.set(px, py, base + H * 1.1);
        const rolha = malha(cilindro(gargalo * 1.1, gargalo * 0.95, H * 0.16, 14), mat.rolha);
        rolha.position.set(px, py, base + H * 1.25);
        rolha.userData.tipo = "pocoes";
        grupo.add(liquido, corpo, pescoco, rolha, reflexo(px - L * 0.25, py + L * 0.25, base + H, L * 0.5));
        clicaveis.push(corpo, rolha);
        fixo(px, py, base + H / 2, rot, [[new CANNON.Box(new CANNON.Vec3(L / 2, L / 2, H / 2)), new CANNON.Vec3()]], "vidro");
      } else {
        // O vidro tombado: deitado, com o gargalo para fora e a poça na frente
        const R = 9 * escala;
        const C = 54 * escala;
        const vira = sorte() * 6.28;
        const vidro = new THREE.Group();
        const corpo = malha(new THREE.CylinderGeometry(R, R, C, 20).rotateZ(Math.PI / 2), mat.vidro, false);
        corpo.userData.tipo = "pocoes";
        const liquido = malha(new THREE.CylinderGeometry(R * 0.8, R * 0.8, C * 0.5, 16).rotateZ(Math.PI / 2), m.liquido);
        liquido.position.set(-C * 0.2, 0, -R * 0.15);
        const pescoco = malha(new THREE.CylinderGeometry(R * 0.42, R * 0.5, 10 * escala, 12).rotateZ(Math.PI / 2), mat.vidro, false);
        pescoco.position.x = C / 2 + 5 * escala;
        vidro.add(liquido, corpo, pescoco);
        vidro.position.set(px, py, base + R);
        vidro.rotation.z = vira;
        grupo.add(vidro, reflexo(px - 3, py + 3, base + R * 2, R * 1.1));
        clicaveis.push(corpo);
        // A poça escorrida e a rolha que rolou para longe
        const frente = (d: number) => [px + Math.cos(vira) * d, py + Math.sin(vira) * d] as const;
        const [qx, qy] = frente(C / 2 + 34 * escala);
        const poca = new THREE.Mesh(new THREE.PlaneGeometry(80 * escala, 80 * escala), m.poca);
        poca.position.set(qx, qy, base + 0.3);
        poca.rotation.z = sorte() * 6.28;
        poca.receiveShadow = true;
        grupo.add(poca);
        const [rx, ry] = frente(C / 2 + 20 * escala);
        const rolha = malha(cilindro(R * 0.5, R * 0.42, R * 0.9, 12), mat.rolha);
        rolha.rotation.set(Math.PI / 2, 0, vira + 1.2);
        rolha.position.set(rx + Math.cos(vira + 1.6) * 22 * escala, ry + Math.sin(vira + 1.6) * 22 * escala, base + R * 0.5);
        grupo.add(rolha);
        fixo(px, py, base + R, vira, [[new CANNON.Cylinder(R, R, C, 10), new CANNON.Vec3(), new CANNON.Quaternion().setFromEuler(0, 0, Math.PI / 2)]], "vidro");
      }
    });
  }

  /**
   * Uma adaga largada na mesa, a lâmina ainda suja: a poça de sangue seco
   * fica embaixo da ponta. Lâmina de aço com o sulco no meio, guarda de
   * ouro, cabo de couro enrolado e o pomo de latão.
   */
  function adaga(x: number, y: number, ang: number, escala: number, sorte: () => number) {
    const base = chaoEm(x, y);
    const L = 105 * escala;
    const W = 17 * escala;
    const cabo = 38 * escala;
    const arma = new THREE.Group();

    const perfil = new THREE.Shape();
    perfil.moveTo(0, -W / 2);
    perfil.lineTo(L * 0.7, -W * 0.42);
    perfil.quadraticCurveTo(L * 0.93, -W * 0.26, L, 0);
    perfil.quadraticCurveTo(L * 0.93, W * 0.26, L * 0.7, W * 0.42);
    perfil.lineTo(0, W / 2);
    perfil.closePath();
    const lamina = malha(
      new THREE.ExtrudeGeometry(perfil, { depth: 1.2, bevelEnabled: true, bevelThickness: 1.1, bevelSize: 1.8, bevelSegments: 2, curveSegments: 8 }),
      mat.aco,
    );
    lamina.position.z = 1.1;
    const sulco = malha(new THREE.BoxGeometry(L * 0.62, 2.4 * escala, 0.4), mat.acoEscuro, false);
    sulco.position.set(L * 0.34, 0, 3.5);
    const guarda = malha(new THREE.BoxGeometry(7 * escala, 50 * escala, 7 * escala), mat.ouro);
    guarda.position.set(-3.5 * escala, 0, 3.5 * escala);
    arma.add(lamina, sulco, guarda);
    for (const lado of [-1, 1]) {
      const ponta = malha(new THREE.SphereGeometry(4.4 * escala, 12, 10), mat.ouro);
      ponta.position.set(-3.5 * escala, lado * 25 * escala, 3.5 * escala);
      arma.add(ponta);
    }
    const punho = malha(new THREE.CylinderGeometry(5 * escala, 5.6 * escala, cabo, 16).rotateZ(Math.PI / 2), mat.empunhadura);
    punho.position.set(-7 * escala - cabo / 2, 0, 5.5 * escala);
    arma.add(punho);
    for (let k = 0; k < 6; k++) {
      const volta = malha(new THREE.TorusGeometry(5.3 * escala, 0.9 * escala, 6, 18).rotateY(Math.PI / 2), mat.linha, false);
      volta.position.set(-7 * escala - cabo * (0.12 + k * 0.15), 0, 5.5 * escala);
      arma.add(volta);
    }
    const pomo = malha(new THREE.SphereGeometry(8 * escala, 18, 14), mat.latao);
    pomo.position.set(-7 * escala - cabo - 6 * escala, 0, 8 * escala);
    arma.add(pomo);

    // A adaga é desenhada com o centro no meio do comprimento todo
    const meio = (L - cabo - 20 * escala) / 2;
    arma.children.forEach((c) => (c.position.x -= meio));
    arma.position.set(x, -y, base);
    arma.rotation.z = ang;
    arma.traverse((o) => (o.userData.tipo = "adaga"));
    grupo.add(arma);
    arma.children.forEach((c) => clicaveis.push(c));

    // O sangue, embaixo da metade da lâmina para a ponta
    const lx = L * (0.55 + sorte() * 0.25) - meio;
    const ly = (sorte() - 0.5) * 24 * escala;
    const tam = (120 + sorte() * 50) * escala;
    const sangue = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam), mat.sangue);
    sangue.position.set(x + Math.cos(ang) * lx - Math.sin(ang) * ly, -y + Math.sin(ang) * lx + Math.cos(ang) * ly, base + 0.25);
    sangue.rotation.z = sorte() * 6.28;
    sangue.receiveShadow = true;
    grupo.add(sangue);

    fixo(x, -y, base, ang, [
      [new CANNON.Box(new CANNON.Vec3(L / 2, W / 2, 2.4)), new CANNON.Vec3(L / 2 - meio, 0, 2.4)],
      [new CANNON.Box(new CANNON.Vec3(3.5 * escala, 25 * escala, 3.5 * escala)), new CANNON.Vec3(-3.5 * escala - meio, 0, 3.5 * escala)],
      [new CANNON.Box(new CANNON.Vec3(cabo / 2 + 7 * escala, 6 * escala, 6 * escala)), new CANNON.Vec3(-7 * escala - cabo / 2 - 3 * escala - meio, 0, 6 * escala)],
    ], "aco");
  }

  /**
   * Uma flecha deitada: haste de madeira, ponta de aço larga, as três penas
   * (uma clara, a pena-guia, e duas vermelhas) amarradas com linha, e o
   * entalhe no fim.
   */
  function flecha(x: number, y: number, ang: number, escala: number) {
    const base = chaoEm(x, y);
    const L = 196 * escala;
    const r = 2.3;
    const seta = new THREE.Group();
    seta.add(malha(new THREE.CylinderGeometry(r, r, L, 10).rotateZ(Math.PI / 2), mat.haste));

    const perfil = new THREE.Shape();
    perfil.moveTo(0, -1.6);
    perfil.lineTo(5, -7);
    perfil.lineTo(24, 0);
    perfil.lineTo(5, 7);
    perfil.lineTo(0, 1.6);
    perfil.closePath();
    const ponta = malha(
      new THREE.ExtrudeGeometry(perfil, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.8, bevelSegments: 1 }),
      mat.aco,
    );
    ponta.scale.setScalar(escala);
    ponta.position.set(L / 2 + 4, 0, -0.4);
    const encaixe = malha(new THREE.CylinderGeometry(r * 1.05, r * 1.25, 9, 10).rotateZ(Math.PI / 2), mat.acoEscuro);
    encaixe.position.x = L / 2 + 1;
    seta.add(ponta, encaixe);

    // As penas: uma pra cima e duas abertas para os lados, a 120 graus
    const pena = new THREE.Shape();
    pena.moveTo(0, 0);
    pena.lineTo(36, 0);
    pena.quadraticCurveTo(34, 7, 30, 9);
    pena.quadraticCurveTo(14, 11, 2, 9.5);
    pena.closePath();
    const geoPena = new THREE.ShapeGeometry(pena);
    [0, 1, 2].forEach((k) => {
      const p = malha(geoPena.clone(), k === 0 ? mat.penaClara : mat.penaVermelha);
      p.scale.setScalar(escala);
      p.rotation.x = Math.PI / 2 + (k * Math.PI * 2) / 3;
      p.position.x = -L / 2 + 8;
      seta.add(p);
    });
    geoPena.dispose();
    for (const px of [L / 2 - 6, -L / 2 + 6, -L / 2 + 8 + 36 * escala]) {
      const amarra = malha(new THREE.CylinderGeometry(r * 1.18, r * 1.18, 4, 10).rotateZ(Math.PI / 2), mat.linha, false);
      amarra.position.x = px;
      seta.add(amarra);
    }
    const entalhe = malha(new THREE.CylinderGeometry(r * 1.2, r * 1.1, 6, 10).rotateZ(Math.PI / 2), mat.linha);
    entalhe.position.x = -L / 2 - 3;
    seta.add(entalhe);

    seta.position.set(x, -y, base + r + 1);
    seta.rotation.z = ang;
    grupo.add(seta);
    fixo(x, -y, base + 3, ang, [[new CANNON.Box(new CANNON.Vec3(L / 2 + 14, 4, 3)), new CANNON.Vec3()]]);
  }

  /**
   * A bandeja de dados: um octógono de madeira envernizada, com cantoneiras
   * de latão e o fundo forrado de camurça. `fora` é o raio de fora.
   */
  function criarBandeja(x: number, y: number, fora: number) {
    const espessura = 11;
    const altura = 24;
    const apotema = fora * Math.cos(Math.PI / 8) - espessura;
    const dentro = apotema / Math.cos(Math.PI / 8);
    const cy = -y;

    // O forro: um octógono de lados retos, rente à mesa
    const forma = new THREE.Shape();
    for (let k = 0; k < 8; k++) {
      const a = Math.PI / 8 + (k * Math.PI) / 4;
      const px = Math.cos(a) * dentro;
      const py = Math.sin(a) * dentro;
      if (k === 0) forma.moveTo(px, py);
      else forma.lineTo(px, py);
    }
    tex.camurca.repeat.set(1 / 120, 1 / 120);
    const forro = new THREE.Mesh(new THREE.ShapeGeometry(forma), mat.camurca);
    forro.position.set(x, cy, 1.2);
    forro.receiveShadow = true;
    grupo.add(forro);

    const fundo = new CANNON.Body({ mass: 0, material: matCamurca, collisionFilterGroup: GRUPO_MESA });
    fundo.addShape(new CANNON.Box(new CANNON.Vec3(apotema, apotema, 0.6)));
    fundo.position.set(x, cy, 0.6);
    mundo.addBody(fundo);
    estaticos.push(fundo);

    // As oito paredes, cada uma cobrindo o canto até a vizinha
    const muros: CANNON.Body[] = [];
    const comprimento = 2 * (apotema + espessura) * Math.tan(Math.PI / 8);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const d = apotema + espessura / 2;
      const px = x + Math.cos(a) * d;
      const py = cy + Math.sin(a) * d;
      const muro = new THREE.Mesh(new THREE.BoxGeometry(espessura, comprimento, altura), mat.moldura);
      muro.position.set(px, py, altura / 2);
      muro.rotation.z = a;
      muro.castShadow = true;
      muro.receiveShadow = true;
      grupo.add(muro);
      const corpo = new CANNON.Body({ mass: 0, material: matMadeira, collisionFilterGroup: GRUPO_MESA });
      corpo.addShape(new CANNON.Box(new CANNON.Vec3(espessura / 2, comprimento / 2, altura / 2)));
      corpo.position.set(px, py, altura / 2);
      corpo.quaternion.setFromEuler(0, 0, a);
      mundo.addBody(corpo);
      estaticos.push(corpo);
      muros.push(corpo);
      // A cantoneira de latão em cada quina de cima
      const quina = Math.PI / 8 + a;
      const canto = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 3), mat.latao);
      canto.position.set(x + Math.cos(quina) * (dentro + espessura * 0.55), cy + Math.sin(quina) * (dentro + espessura * 0.55), altura + 1);
      canto.rotation.z = quina;
      canto.castShadow = true;
      grupo.add(canto);
    }
    bandeja = { x, y: cy, dentro, fora, muros, fundo };
  }

  function criarDado(x: number, y: number) {
    const malha = new THREE.Mesh(geoDado, pinturaDado.material);
    malha.castShadow = true;
    malha.receiveShadow = true;
    malha.userData.tipo = "dado";
    grupo.add(malha);
    clicaveis.push(malha);
    const body = new CANNON.Body({
      mass: 1,
      material: matDado,
      collisionFilterGroup: GRUPO_DADO,
      collisionFilterMask: GRUPO_MESA | GRUPO_PAREDE | GRUPO_MOEDA,
      linearDamping: 0.18,
      angularDamping: 0.22,
      sleepSpeedLimit: 5,
      sleepTimeLimit: 0.3,
    });
    body.addShape(formaDado);
    // Começa deitado com o 20 para cima, como quem deixou o dado arrumado
    const face20 = numeros.indexOf(20);
    const q = new THREE.Quaternion().setFromUnitVectors(normais[face20].v, new THREE.Vector3(0, 0, 1));
    body.quaternion.set(q.x, q.y, q.z, q.w);
    body.position.set(x, -y, RAIO_DADO * 0.8 + 2);
    mundo.addBody(body);
    dado = { body, mesh: malha };
    corpos.push(dado);

    let ultimaBatida = 0;
    body.addEventListener("collide", (e: { contact: CANNON.ContactEquation; body: CANNON.Body }) => {
      const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
      if (v < 70) return;
      const agora = performance.now();
      if (agora - ultimaBatida < 32) return;
      ultimaBatida = agora;
      const forca = Math.min(1, v / 1300);
      const material = somDoCorpo.get(e.body);
      if (bandeja && e.body === bandeja.fundo) {
        // Na camurça o golpe é abafado e grave
        tocarComo("madeira", { volume: forca * 0.35, velocidade: 0.8 + Math.random() * 0.15 });
      } else if (material === "vidro") {
        // O vidro da poção tine fino
        tocarComo("metal", { volume: forca * 0.45, velocidade: 2.5 + Math.random() * 0.3 });
      } else if (material === "aco") {
        tocarComo("metal", { volume: forca * 0.7, velocidade: 1.05 + Math.random() * 0.15 });
      } else {
        tocarComo("madeira", { volume: forca * 0.9, velocidade: 1.4 + Math.random() * 0.3 });
      }
    });
  }

  // ---------- Pegar e jogar (o dado e as moedas) ----------

  let segurando: Corpo | null = null;
  let lancado = false;
  let parado = 0;
  const rastro: { x: number; y: number; t: number }[] = [];

  /** O ponto da mesa (na altura z) debaixo de um ponto da tela. */
  function naMesa(cx: number, cy: number, z = 0) {
    const ndc = new THREE.Vector2((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), -z);
    const p = new THREE.Vector3();
    ray.ray.intersectPlane(plano, p);
    return p;
  }

  /**
   * As paredes invisíveis: as bordas da tela de agora. O dado e as moedas
   * rolam pela mesa inteira, por cima do papel também, mas não fogem da
   * vista.
   */
  function cercar() {
    for (const b of paredes) mundo.removeBody(b);
    paredes = [];
    const vw = document.documentElement.clientWidth;
    let esquerda = 16;
    let direita = vw - 16;
    let topo = window.scrollY + 76;
    let base = window.scrollY + window.innerHeight - 24;
    if (modo === "dado") {
      // Com a câmera mais perto, a tela mostra menos mesa: as paredes vão
      // para as bordas do que se vê, e a de baixo fica acima dos botões
      const cx = vw / 2;
      const cy = window.scrollY + window.innerHeight / 2;
      const meiaL = vw / 2 / PERTO_NO_CELULAR;
      const meiaA = window.innerHeight / 2 / PERTO_NO_CELULAR;
      esquerda = cx - meiaL + 10;
      direita = cx + meiaL - 10;
      topo = cy - meiaA + 50 / PERTO_NO_CELULAR;
      base = cy + meiaA - BOTOES_NO_CELULAR / PERTO_NO_CELULAR;
    }
    const lados: [CANNON.Vec3, CANNON.Quaternion][] = [
      [new CANNON.Vec3(esquerda, 0, 0), new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0)],
      [new CANNON.Vec3(direita, 0, 0), new CANNON.Quaternion().setFromEuler(0, -Math.PI / 2, 0)],
      [new CANNON.Vec3(0, -topo, 0), new CANNON.Quaternion().setFromEuler(Math.PI / 2, 0, 0)],
      [new CANNON.Vec3(0, -base, 0), new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)],
    ];
    for (const [p, q] of lados) {
      const b = new CANNON.Body({
        mass: 0,
        material: matMadeira,
        collisionFilterGroup: GRUPO_PAREDE,
        collisionFilterMask: GRUPO_DADO | GRUPO_MOEDA,
      });
      b.addShape(new CANNON.Plane());
      b.position.copy(p);
      b.quaternion.copy(q);
      mundo.addBody(b);
      paredes.push(b);
    }
  }

  /**
   * Pega uma peça na pinça: ela sobe da mesa e segue a mão. Ao soltar, sai
   * com a velocidade do gesto, bem amansada, e girando como peça de verdade
   * que escorrega dos dedos. Um clique sem arrastar joga de leve.
   */
  function pegar(corpo: Corpo, cx: number, cy: number) {
    const ehDado = corpo === dado;
    const altura = ehDado ? 64 : 34;
    segurando = corpo;
    if (ehDado) {
      lancado = false;
      if (atraindo && bandeja) for (const m of bandeja.muros) m.collisionResponse = true;
      atraindo = false;
    }
    cercar();
    document.documentElement.classList.add("pincando");
    corpo.body.type = CANNON.Body.KINEMATIC;
    corpo.body.velocity.setZero();
    corpo.body.angularVelocity.set(ehDado ? 1.5 : 0, ehDado ? 2 : 0, ehDado ? 0.8 : 0);
    corpo.body.wakeUp();
    // A moeda fica deitada na pinça, de face para cima
    if (!ehDado) corpo.body.quaternion.setFromEuler(0.25, 0, Math.random() * 6.28);
    rastro.length = 0;
    rastro.push({ x: cx, y: cy, t: performance.now() });
    const inicio = naMesa(cx, cy, altura);
    corpo.body.position.set(inicio.x, inicio.y, altura);

    const mover = (e: PointerEvent) => {
      rastro.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (rastro.length > 6) rastro.shift();
      const p = naMesa(e.clientX, e.clientY, altura);
      corpo.body.position.set(p.x, p.y, altura);
    };
    const soltar = (e: PointerEvent) => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
      document.documentElement.classList.remove("pincando");
      segurando = null;
      rastro.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      // A velocidade dos últimos instantes do gesto, não do gesto inteiro
      const a = rastro[Math.max(0, rastro.length - 4)];
      const b = rastro[rastro.length - 1];
      const dt = Math.max(0.03, (b.t - a.t) / 1000);
      let vx = ((b.x - a.x) / dt) * 0.55;
      let vy = (-(b.y - a.y) / dt) * 0.55;
      const andou = Math.hypot(b.x - rastro[0].x, b.y - rastro[0].y);
      if (andou < 8) {
        const ang = Math.random() * Math.PI * 2;
        const forca = ehDado ? 420 + Math.random() * 380 : 120 + Math.random() * 120;
        vx = Math.cos(ang) * forca;
        vy = Math.sin(ang) * forca;
      }
      const max = ehDado ? 1500 : 1200;
      const m = Math.hypot(vx, vy);
      if (m > max) {
        vx *= max / m;
        vy *= max / m;
      }
      corpo.body.type = CANNON.Body.DYNAMIC;
      if (ehDado && bandeja && perto(corpo.body.position, 90)) {
        // Soltou em cima da bandeja ou perto dela: o dado é puxado para dentro
        corpo.body.velocity.set(vx * 0.4, vy * 0.4, 260);
        corpo.body.angularVelocity.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 8);
        atrair();
        lancado = true;
        parado = 0;
      } else if (ehDado) {
        corpo.body.velocity.set(vx, vy, 120 + Math.random() * 120);
        // O giro acompanha a direção do arremesso, como quem solta rolando
        corpo.body.angularVelocity.set(-vy * 0.012 + (Math.random() - 0.5) * 8, vx * 0.012 + (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6);
        lancado = true;
        parado = 0;
      } else {
        contar("moedas");
        // A moeda sai girando no ar, de cara e coroa
        corpo.body.velocity.set(vx, vy, andou < 8 ? 520 : 220);
        corpo.body.angularVelocity.set(14 + Math.random() * 14, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
      }
      corpo.body.wakeUp();
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
  }

  /** Se um ponto está a menos de `folga` da borda de fora da bandeja. */
  function perto(p: CANNON.Vec3, folga: number) {
    if (!bandeja) return false;
    return Math.hypot(p.x - bandeja.x, p.y - bandeja.y) < bandeja.fora + folga;
  }

  /**
   * Começa a puxar o dado para dentro da bandeja. Enquanto ele não passa da
   * borda, as paredes deixam de ser sólidas para ele (senão bateria nelas
   * por fora) e uma mola leva o dado para o meio, segurando um pouco do
   * peso dele no ar, como quem conduz o dado com a mão.
   */
  function atrair() {
    if (!bandeja || !dado) return;
    atraindo = true;
    for (const m of bandeja.muros) m.collisionResponse = false;
  }

  mundo.addEventListener("preStep", () => {
    if (!atraindo || !bandeja || !dado || segurando === dado) return;
    const b = dado.body;
    const dx = bandeja.x - b.position.x;
    const dy = bandeja.y - b.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist < bandeja.dentro - RAIO_DADO * 0.9) {
      // Entrou: as paredes voltam, e o dado rola solto lá dentro
      atraindo = false;
      for (const m of bandeja.muros) m.collisionResponse = true;
      return;
    }
    const k = 70;
    const amortece = 2 * Math.sqrt(k) * 0.9;
    b.applyForce(
      new CANNON.Vec3((k * dx - amortece * b.velocity.x) * b.mass, (k * dy - amortece * b.velocity.y) * b.mass, G * 0.55 * b.mass),
    );
  });

  /** Qual número ficou para cima: a face que aponta para a câmera. */
  function leitura() {
    if (!dado) return 0;
    const q = new THREE.Quaternion(dado.body.quaternion.x, dado.body.quaternion.y, dado.body.quaternion.z, dado.body.quaternion.w);
    let melhor = 0;
    let maior = -2;
    normais.forEach((n, i) => {
      const z = n.v.clone().applyQuaternion(q).z;
      if (z > maior) {
        maior = z;
        melhor = i;
      }
    });
    return numeros[melhor];
  }

  // A glória do 20 natural: uma luz dourada que acende em cima do dado e se apaga
  const gloria = new THREE.PointLight(0xffd36b, 0, 420, 0);
  cena.add(gloria);
  let brilhoGloria = 0;

  function terminou() {
    lancado = false;
    if (!dado) return;
    const valor = leitura();
    const p = dado.body.position;
    if (modo === "dado") {
      const t = new THREE.Vector3(p.x, p.y, p.z).project(camera);
      avisos.resultado({
        valor,
        x: ((t.x + 1) / 2) * window.innerWidth,
        y: ((1 - t.y) / 2) * window.innerHeight + window.scrollY,
      });
    } else {
      avisos.resultado({ valor, x: p.x, y: -p.y });
    }
    contar("rolador");
    if (valor === 20) contar("vintes");
    if (valor === 1) contar("uns");
    if (bandeja && Math.hypot(p.x - bandeja.x, p.y - bandeja.y) < bandeja.dentro) conquistar("na-bandeja");
    if (valor === 20) {
      tocar("divino");
      brilhoGloria = 1;
      gloria.position.set(p.x, p.y, 120);
    }
  }

  // ---------- A câmera presa à rolagem ----------

  let largura = 0;
  let altura = 0;
  let rolagem = -1;

  function ajustar() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sy = window.scrollY;
    if (vw === largura && vh === altura && sy === rolagem) return false;
    if (vw !== largura || vh !== altura) {
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
      const d = vh / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)) / (modo === "dado" ? PERTO_NO_CELULAR : 1);
      camera.position.z = d;
      camera.near = d - 600;
      camera.far = d + 100;
      camera.updateProjectionMatrix();
      const s = sol.shadow.camera as THREE.OrthographicCamera;
      s.left = -vw / 2 - 300;
      s.right = vw / 2 + 300;
      s.top = vh / 2 + 300;
      s.bottom = -vh / 2 - 300;
      s.near = 100;
      s.far = 3000;
      s.updateProjectionMatrix();
      chao.scale.set(vw + 1000, vh + 1000, 1);
    }
    largura = vw;
    altura = vh;
    rolagem = sy;
    const cx = vw / 2;
    const cy = -(sy + vh / 2);
    camera.position.x = cx;
    camera.position.y = cy;
    camera.lookAt(cx, cy, 0);
    chao.position.set(cx, cy, 0);
    sol.position.set(cx - 260, cy + 420, 1400);
    sol.target.position.set(cx, cy, 0);
    return true;
  }

  // ---------- O laço ----------

  let pedido = 0;
  let antes = performance.now();
  let quadro = 0;

  function laco(agora: number) {
    pedido = requestAnimationFrame(laco);
    if (document.hidden) return;
    const dt = Math.min(0.05, (agora - antes) / 1000);
    antes = agora;
    quadro++;

    const mexeu = ajustar();
    const ativos = corpos.some((c) => c.body.sleepState !== CANNON.Body.SLEEPING && c.body.type !== CANNON.Body.STATIC);
    if (ativos || segurando) {
      mundo.step(1 / 120, dt, 8);
      sincronizar();
    }

    if (lancado && dado && !atraindo && bandeja && !segurando) {
      const p = dado.body.position;
      const dist = Math.hypot(p.x - bandeja.x, p.y - bandeja.y);
      if (dist > bandeja.dentro && perto(p, 40)) atrair();
    }

    if (lancado && dado) {
      const v = dado.body.velocity.length();
      const w = dado.body.angularVelocity.length();
      parado = v < 8 && w < 0.4 ? parado + dt : 0;
      if (!atraindo && (dado.body.sleepState === CANNON.Body.SLEEPING || parado > 0.35)) terminou();
    }

    // As chamas: cada uma no seu ritmo, nunca duas iguais
    const topo = window.scrollY - 300;
    const base = window.scrollY + window.innerHeight + 300;
    let fogoNaTela = false;
    if (!reduzido) {
      const t = agora / 1000;
      for (const v of velas) {
        if (v.y < topo || v.y > base) continue;
        fogoNaTela = true;
        v.sopro = Math.max(0, v.sopro - dt * 1.6);
        const tremor =
          1 + 0.07 * Math.sin(t * 11 + v.fase) + 0.05 * Math.sin(t * 23.7 + v.fase * 2) + 0.03 * (Math.random() - 0.5);
        const s = tremor * (1 - v.sopro * 0.6);
        v.chama.scale.set(15 * s, 15 * s, 1);
        v.halo.scale.set(58 * s, 58 * s, 1);
        v.luz.intensity = 0.7 * (0.8 + 0.4 * (s - 0.85)) * (1 - v.sopro * 0.5);
        (v.brilho.material as THREE.MeshBasicMaterial).opacity = 0.75 + (s - 1) * 1.5;
      }
    }

    if (brilhoGloria > 0) {
      brilhoGloria = Math.max(0, brilhoGloria - dt * 0.45);
      gloria.intensity = 6 * Math.sin(Math.min(1, brilhoGloria) * Math.PI);
    }

    // Parado e sem fogo à vista, desenha só quando algo muda; com fogo, a
    // 30 quadros, que a chama não pede mais que isso
    const desenhar =
      mexeu || ativos || !!segurando || brilhoGloria > 0 || (fogoNaTela && quadro % 2 === 0) || quadro < 3 || redesenhar;
    redesenhar = false;
    if (desenhar) renderer.render(cena, camera);
  }

  // ---------- Reconstruir quando a página muda de tamanho ----------

  let espera = 0;
  const refazer = () => {
    window.clearTimeout(espera);
    espera = window.setTimeout(() => {
      largura = 0;
      montar();
    }, 250);
  };
  const vigiaAltura = new ResizeObserver(refazer);
  if (modo === "mesa") vigiaAltura.observe(document.body);
  window.addEventListener("resize", refazer);

  ajustar();
  montar();
  pedido = requestAnimationFrame(laco);

  // ---------- O que a MaoNaMesa pode pedir ----------

  const raio = new THREE.Raycaster();

  return {
    apertar(x, y, naMadeira) {
      const ndc = new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
      raio.setFromCamera(ndc, camera);
      const alvo = raio.intersectObjects(clicaveis, false)[0];
      if (!alvo) return null;
      const tipo = alvo.object.userData.tipo as string;
      // O dado e as moedas ficam por cima de tudo, então se pegam até em
      // cima do papel; a vela e o pano só existem na madeira
      if (tipo === "dado" || tipo === "moedas") {
        const corpo = corpos.find((c) => c.mesh === alvo.object);
        if (!corpo) return null;
        pegar(corpo, x, y);
        return tipo;
      }
      if (!naMadeira) return null;
      if (tipo === "velas") {
        for (const v of velas) {
          const d = Math.hypot(v.chama.position.x - alvo.point.x, v.chama.position.y - alvo.point.y);
          if (d < 90) v.sopro = 1;
        }
        tocar("zoomLonge");
        conquistar("sopro");
      }
      // Bater nas coisas da mesa: cada uma com a sua voz
      if (tipo === "livros") tocar("virarPagina");
      if (tipo === "pocoes") tocarComo("metal", { volume: 0.35, velocidade: 2.6 + Math.random() * 0.2 });
      if (tipo === "adaga") {
        tocar("lamina");
        conquistar("adaga");
      }
      return tipo;
    },
    jogar() {
      if (!dado || segurando) return;
      cercar();
      const b = dado.body;
      const ang = Math.random() * Math.PI * 2;
      const forca = 600 + Math.random() * 500;
      b.type = CANNON.Body.DYNAMIC;
      b.position.z = Math.max(b.position.z, 90);
      b.velocity.set(Math.cos(ang) * forca, Math.sin(ang) * forca, 380);
      b.angularVelocity.set((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 10);
      b.wakeUp();
      lancado = true;
      parado = 0;
    },
    ondeEstaODado() {
      if (!dado) return null;
      const p = new THREE.Vector3(dado.body.position.x, dado.body.position.y, dado.body.position.z).project(camera);
      return { x: ((p.x + 1) / 2) * window.innerWidth, y: ((1 - p.y) / 2) * window.innerHeight };
    },
    reconstruir: refazer,
    destruir() {
      window.removeEventListener(EVENTO_DADO, trocarDado);
      pinturaDado.material.dispose();
      pinturaDado.texturas.forEach((t) => t.dispose());
      cancelAnimationFrame(pedido);
      window.clearTimeout(espera);
      vigiaAltura.disconnect();
      window.removeEventListener("resize", refazer);
      limpar();
      geoMoeda.dispose();
      geoDado.dispose();
      Object.values(tex).forEach((t) => t.dispose());
      Object.values(mat).forEach((m) => m.dispose());
      for (const c of capas) {
        c.capa.map?.dispose();
        c.capa.dispose();
        c.couro.dispose();
      }
      for (const m of daPocao.values()) Object.values(m).forEach((x) => x.dispose());
      ambiente.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

/**
 * A malha do d20: as 20 faces soltas, cada uma com a sua célula do atlas.
 * Os números vão em pares opostos que somam 21, como num dado de verdade.
 */
function montarD20() {
  const posicoes: number[] = [];
  const normaisArr: number[] = [];
  const uvs: number[] = [];
  const normais: { v: THREE.Vector3; ehInvertida: boolean }[] = [];

  FACES_BRUTAS.forEach((f) => {
    const [a, b, c] = f.map((i) => VERTICES[i]);
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
    const centro = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
    normais.push({ v: n.dot(centro) < 0 ? n.negate() : n, ehInvertida: n.dot(centro) < 0 });
  });

  // Os pares de faces opostas
  const numeros = new Array<number>(20).fill(0);
  let proximo = 1;
  for (let i = 0; i < 20; i++) {
    if (numeros[i]) continue;
    let oposta = 0;
    let menor = 2;
    for (let j = 0; j < 20; j++) {
      const d = normais[i].v.dot(normais[j].v);
      if (j !== i && !numeros[j] && d < menor) {
        menor = d;
        oposta = j;
      }
    }
    numeros[i] = proximo;
    numeros[oposta] = 21 - proximo;
    proximo++;
  }

  FACES_BRUTAS.forEach((f, i) => {
    const ordem = normais[i].ehInvertida ? [f[0], f[2], f[1]] : f;
    const [a, b, c] = ordem.map((k) => VERTICES[k]);
    posicoes.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    const n = normais[i].v;
    for (let k = 0; k < 3; k++) normaisArr.push(n.x, n.y, n.z);
    const celula = numeros[i] - 1;
    const col = celula % ATLAS.colunas;
    const lin = Math.floor(celula / ATLAS.colunas);
    const u = (fx: number) => (col + fx) / ATLAS.colunas;
    const v = (fy: number) => 1 - (lin + fy) / ATLAS.linhas;
    uvs.push(u(0.5), v(0.08), u(0.04), v(0.92), u(0.96), v(0.92));
  });

  const geoDado = new THREE.BufferGeometry();
  geoDado.setAttribute("position", new THREE.Float32BufferAttribute(posicoes, 3));
  geoDado.setAttribute("normal", new THREE.Float32BufferAttribute(normaisArr, 3));
  geoDado.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return { geoDado, normais, numeros };
}
