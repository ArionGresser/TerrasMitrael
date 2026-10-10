import * as THREE from "three";
import type { EstiloDeDado } from "@/lib/dados";

/**
 * As texturas da mesa 3D, pintadas em canvas na hora: nenhuma imagem a
 * mais para baixar.
 */

function tela(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  return { c, g };
}

/** Um ruído fino de fibra, para nada parecer plástico liso. */
function grao(g: CanvasRenderingContext2D, w: number, h: number, forca: number, n = 4000) {
  for (let i = 0; i < n; i++) {
    const claro = Math.random() > 0.5;
    g.fillStyle = claro ? `rgba(255,255,255,${forca * Math.random()})` : `rgba(0,0,0,${forca * Math.random()})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
  }
}

/**
 * O pano: lã (vermelha, ou da cor pedida) com a trama aparente, friso de ouro nas bordas e uma
 * faixa de losangos bordados no meio. Repete na vertical, para cobrir a
 * página inteira sem emenda.
 */
export function texturaPano(cor = { base: "#741a23", borda: "#4e0f16", fio: "255,190,170" }) {
  const W = 256;
  const H = 512;
  const { c, g } = tela(W, H);
  g.fillStyle = cor.base;
  g.fillRect(0, 0, W, H);
  // A trama: fios finos nas duas direções
  for (let y = 0; y < H; y += 2) {
    g.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.06})`;
    g.fillRect(0, y, W, 1);
  }
  for (let x = 0; x < W; x += 3) {
    g.fillStyle = `rgba(${cor.fio},${0.025 + Math.random() * 0.03})`;
    g.fillRect(x, 0, 1, H);
  }
  grao(g, W, H, 0.08, 6000);
  // As bordas: um friso de ouro e uma barra mais escura por fora
  const friso = (x: number) => {
    const gr = g.createLinearGradient(x, 0, x + 10, 0);
    gr.addColorStop(0, "#7a5a14");
    gr.addColorStop(0.5, "#e8c86a");
    gr.addColorStop(1, "#7a5a14");
    g.fillStyle = gr;
    g.fillRect(x, 0, 10, H);
    g.fillStyle = "rgba(0,0,0,0.25)";
    for (let y = 0; y < H; y += 6) g.fillRect(x, y, 10, 2);
  };
  g.fillStyle = cor.borda;
  g.fillRect(0, 0, 14, H);
  g.fillRect(W - 14, 0, 14, H);
  friso(16);
  friso(W - 26);
  // Os losangos bordados, em ponto de ouro
  g.strokeStyle = "#d6ad48";
  g.lineWidth = 3;
  for (let y = 0; y < H; y += 128) {
    const cx = W / 2;
    const cy = y + 64;
    g.beginPath();
    g.moveTo(cx, cy - 52);
    g.lineTo(cx + 40, cy);
    g.lineTo(cx, cy + 52);
    g.lineTo(cx - 40, cy);
    g.closePath();
    g.stroke();
    g.fillStyle = "rgba(214,173,72,0.55)";
    g.beginPath();
    g.moveTo(cx, cy - 22);
    g.lineTo(cx + 17, cy);
    g.lineTo(cx, cy + 22);
    g.lineTo(cx - 17, cy);
    g.closePath();
    g.fill();
    g.fillStyle = "#d6ad48";
    g.beginPath();
    g.arc(cx, y, 4, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/**
 * O relevo da face da moeda: a borda serrilhada, um aro e o M do selo.
 * É mapa de altura (claro é alto), usado como bumpMap.
 */
export function relevoMoeda() {
  const S = 256;
  const { c, g } = tela(S, S);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);
  const cx = S / 2;
  g.strokeStyle = "#e0e0e0";
  g.lineWidth = 14;
  g.beginPath();
  g.arc(cx, cx, S / 2 - 12, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "#b0b0b0";
  g.lineWidth = 4;
  g.beginPath();
  g.arc(cx, cx, S / 2 - 34, 0, Math.PI * 2);
  g.stroke();
  // Pontinhos em volta, como uma legenda gasta
  g.fillStyle = "#c8c8c8";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    g.beginPath();
    g.arc(cx + Math.cos(a) * (S / 2 - 50), cx + Math.sin(a) * (S / 2 - 50), 3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#f2f2f2";
  g.font = "bold 120px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("M", cx, cx + 6);
  grao(g, S, S, 0.12, 3000);
  const t = new THREE.CanvasTexture(c);
  return t;
}

/** A serrilha da borda da moeda, em listras verticais. */
export function relevoBorda() {
  const { c, g } = tela(256, 16);
  for (let x = 0; x < 256; x += 4) {
    g.fillStyle = "#e6e6e6";
    g.fillRect(x, 0, 2, 16);
    g.fillStyle = "#555555";
    g.fillRect(x + 2, 0, 2, 16);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(4, 1);
  return t;
}

/** A luz de uma chama vista de cima: um miolo branco e o halo laranja. */
export function texturaChama() {
  const S = 128;
  const { c, g } = tela(S, S);
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  // Vista de cima, a chama é um olho: miolo quase branco, o corpo amarelo
  // e uma franja laranja que se desfaz
  gr.addColorStop(0, "rgba(255,252,225,1)");
  gr.addColorStop(0.08, "rgba(255,236,150,1)");
  gr.addColorStop(0.22, "rgba(255,190,70,0.95)");
  gr.addColorStop(0.42, "rgba(255,130,30,0.5)");
  gr.addColorStop(0.7, "rgba(255,90,10,0.14)");
  gr.addColorStop(1, "rgba(255,70,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * O brilho quente que a vela joga na madeira em volta dela. Neutro, é
 * branco, para o material tingir (o clarão das poções).
 */
export function texturaBrilho(neutro = false) {
  const S = 128;
  const { c, g } = tela(S, S);
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, neutro ? "rgba(255,255,255,0.55)" : "rgba(255,170,80,0.55)");
  gr.addColorStop(0.4, neutro ? "rgba(255,255,255,0.22)" : "rgba(255,140,50,0.22)");
  gr.addColorStop(1, neutro ? "rgba(255,255,255,0)" : "rgba(255,120,40,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * As vinte faces do d20 num atlas de 5 por 4: cada célula é um triângulo
 * de resina vermelha com o número em ouro no meio. O 6 e o 9 ganham o
 * tracinho embaixo, como nos dados de verdade.
 */
export const ATLAS = { colunas: 5, linhas: 4 };

/**
 * O d20 pintado num dos estilos de src/lib/dados.ts (o padrão é resina
 * preta com ouro): duas pinturas do mesmo atlas, e uma terceira nos raros.
 *
 * `cor` é o que se vê: o preto com um esfumaçado fundo, o friso dourado
 * contornando cada face e o número em relevo, na fonte dos títulos do site.
 * `metal` diz ao three.js onde é ouro (metal que reflete a sala) e onde é
 * resina (lisa, de brilho só por cima): o canal azul é o metal e o verde,
 * a aspereza. `luz`, só nos estilos que brilham, é a tinta acesa no escuro.
 *
 * Cada célula guarda o triângulo da face com a ponta para cima: os cantos
 * caem em (0,5; 0,08), (0,04; 0,92) e (0,96; 0,92) da célula.
 */
export function texturaD20(estilo: EstiloDeDado) {
  const C = 256;
  const W = C * ATLAS.colunas;
  const H = C * ATLAS.linhas;
  const cor = tela(W, H);
  const metal = tela(W, H);
  const luz = estilo.brilho ? tela(W, H) : null;
  const raiz = typeof document !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const fonte = raiz?.getPropertyValue("--fonte-titulo").trim() || 'Georgia, "Times New Roman", serif';

  // O fundo de resina: preto com fumaça que se mexe por dentro
  cor.g.fillStyle = estilo.fundo;
  cor.g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 30 + Math.random() * 90;
    const fumo = cor.g.createRadialGradient(x, y, 0, x, y, r);
    const tom = estilo.fumaca[Math.floor(Math.random() * estilo.fumaca.length)];
    fumo.addColorStop(0, `rgba(${tom},${0.1 + Math.random() * 0.12})`);
    fumo.addColorStop(1, `rgba(${tom},0)`);
    cor.g.fillStyle = fumo;
    cor.g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  grao(cor.g, W, H, 0.04, 3000);
  // Resina: nada de metal, quase lisa
  metal.g.fillStyle = "rgb(0,55,0)";
  metal.g.fillRect(0, 0, W, H);
  if (luz) {
    luz.g.fillStyle = "#000";
    luz.g.fillRect(0, 0, W, H);
  }

  const ouro = (g: CanvasRenderingContext2D, y0: number, y1: number) => {
    const o = g.createLinearGradient(0, y0, 0, y1);
    o.addColorStop(0, estilo.tinta[0]);
    o.addColorStop(0.45, estilo.tinta[1]);
    o.addColorStop(1, estilo.tinta[2]);
    return o;
  };

  for (let n = 1; n <= 20; n++) {
    const i = n - 1;
    const x0 = (i % ATLAS.colunas) * C;
    const y0 = Math.floor(i / ATLAS.colunas) * C;
    // O triângulo da face e o seu centro
    const cantos = [
      [x0 + C * 0.5, y0 + C * 0.08],
      [x0 + C * 0.04, y0 + C * 0.92],
      [x0 + C * 0.96, y0 + C * 0.92],
    ];
    const gx = (cantos[0][0] + cantos[1][0] + cantos[2][0]) / 3;
    const gy = (cantos[0][1] + cantos[1][1] + cantos[2][1]) / 3;
    const recuo = (f: number) => cantos.map(([x, y]) => [gx + (x - gx) * f, gy + (y - gy) * f]);

    const camadas: { g: CanvasRenderingContext2D; modo: "cor" | "metal" | "luz" }[] = [
      { g: cor.g, modo: "cor" },
      { g: metal.g, modo: "metal" },
    ];
    if (luz) camadas.push({ g: luz.g, modo: "luz" });
    for (const { g, modo } of camadas) {
      // Na pintura da tinta: metal liso, ou tinta fosca; na luz, a cor da brasa
      const pinta =
        modo === "cor"
          ? ouro(g, y0 + C * 0.1, y0 + C * 0.9)
          : modo === "metal"
            ? estilo.metal
              ? "rgb(0,95,255)"
              : "rgb(0,150,0)"
            : estilo.brilho!;
      // O friso: uma linha de ouro rente à borda e outra fina por dentro
      for (const [f, largura] of [
        [0.86, 4.5],
        [0.78, 1.6],
      ] as const) {
        const t = recuo(f);
        g.beginPath();
        g.moveTo(t[0][0], t[0][1]);
        g.lineTo(t[1][0], t[1][1]);
        g.lineTo(t[2][0], t[2][1]);
        g.closePath();
        g.lineJoin = "round";
        g.lineWidth = largura;
        g.strokeStyle = pinta;
        g.stroke();
      }
      // Um losango de ouro em cada canto, entre os dois frisos
      for (const [x, y] of recuo(0.82)) {
        g.save();
        g.translate(x, y);
        g.rotate(Math.PI / 4);
        g.fillStyle = pinta;
        g.fillRect(-3.5, -3.5, 7, 7);
        g.restore();
      }

      // O número, gravado: sombra embaixo, luz em cima, o ouro no meio
      const texto = String(n);
      const cy = gy + 4;
      g.font = `700 ${n >= 10 ? 70 : 82}px ${fonte}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      if (modo === "cor") {
        g.fillStyle = "rgba(0,0,0,0.85)";
        g.fillText(texto, gx + 2, cy + 3);
        g.fillStyle = "rgba(255,245,200,0.35)";
        g.fillText(texto, gx - 1, cy - 1.5);
      }
      g.fillStyle = pinta;
      g.fillText(texto, gx, cy);
      // O 6 e o 9 levam o traço embaixo, para não se confundirem
      if (n === 6 || n === 9) g.fillRect(gx - 16, cy + 36, 32, 5);
      // O 20 e o 1 ganham uma estrelinha em cima, de lembrança
      if (n === 20 || n === 1) {
        g.save();
        g.translate(gx, cy - 50);
        g.rotate(Math.PI / 4);
        g.fillRect(-4.5, -4.5, 9, 9);
        g.restore();
      }
    }
  }

  const fazer = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { cor: fazer(cor.c, true), metal: fazer(metal.c, false), luz: luz ? fazer(luz.c, true) : null };
}

/** A camurça do fundo da bandeja: manchas macias de quem já foi alisado. */
export function texturaCamurca() {
  const S = 256;
  const { c, g } = tela(S, S);
  g.fillStyle = "#1f2f52";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 10 + Math.random() * 40;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const claro = Math.random() > 0.5;
    gr.addColorStop(0, claro ? "rgba(120,150,210,0.10)" : "rgba(0,0,20,0.14)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  grao(g, S, S, 0.06, 9000);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A madeira da moldura da bandeja: veios compridos e um verniz escuro. */
export function texturaMoldura() {
  const W = 512;
  const H = 64;
  const { c, g } = tela(W, H);
  g.fillStyle = "#5a3519";
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 46; i++) {
    const y = Math.random() * H;
    const claro = Math.random() > 0.55;
    g.strokeStyle = claro ? `rgba(200,140,80,${0.08 + Math.random() * 0.1})` : `rgba(20,8,0,${0.12 + Math.random() * 0.18})`;
    g.lineWidth = 0.6 + Math.random() * 2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= W; x += 32) g.lineTo(x, y + Math.sin(x / 60 + i) * 2.5);
    g.stroke();
  }
  grao(g, W, H, 0.05, 2500);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A capa de couro de um livro: a cor dele, um friso duplo de ouro e um losango no meio. */
export function texturaCapa(cor: string) {
  const W = 256;
  const H = 340;
  const { c, g } = tela(W, H);
  g.fillStyle = cor;
  g.fillRect(0, 0, W, H);
  grao(g, W, H, 0.1, 5000);
  // O couro gasto nas bordas
  const gr = g.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.8);
  gr.addColorStop(0, "rgba(255,255,255,0.06)");
  gr.addColorStop(1, "rgba(0,0,0,0.35)");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#d6ad48";
  g.lineWidth = 4;
  g.strokeRect(18, 18, W - 36, H - 36);
  g.lineWidth = 1.5;
  g.strokeRect(28, 28, W - 56, H - 56);
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(W / 2, H / 2 - 50);
  g.lineTo(W / 2 + 36, H / 2);
  g.lineTo(W / 2, H / 2 + 50);
  g.lineTo(W / 2 - 36, H / 2);
  g.closePath();
  g.stroke();
  g.fillStyle = "rgba(214,173,72,0.6)";
  g.beginPath();
  g.arc(W / 2, H / 2, 10, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** O corte das páginas: creme com as folhas em listras finas. */
export function texturaPaginas() {
  const { c, g } = tela(64, 64);
  g.fillStyle = "#e9dcbc";
  g.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 2) {
    g.fillStyle = `rgba(120,90,50,${0.12 + Math.random() * 0.15})`;
    g.fillRect(0, y, 64, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Uma mancha de sangue seco: a poça irregular e os respingos em volta. Com
 * `rgb` branco, serve de poça de qualquer líquido (a cor vem do material).
 */
export function texturaSangue(rgb = "118,10,14", fundo = "48,0,4") {
  const S = 256;
  const { c, g } = tela(S, S);
  const borrao = (x: number, y: number, r: number, a: number) => {
    g.beginPath();
    const n = 18;
    for (let i = 0; i <= n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const rr = r * (0.7 + Math.random() * 0.5);
      const px = x + Math.cos(ang) * rr;
      const py = y + Math.sin(ang) * rr * 0.85;
      if (i === 0) g.moveTo(px, py);
      else g.quadraticCurveTo(x + Math.cos(ang - 0.17) * rr * 1.1, y + Math.sin(ang - 0.17) * rr, px, py);
    }
    g.fillStyle = `rgba(${rgb},${a})`;
    g.fill();
  };
  borrao(S / 2, S / 2, 62, 0.92);
  borrao(S / 2 + 30, S / 2 - 18, 36, 0.9);
  borrao(S / 2 - 34, S / 2 + 20, 28, 0.88);
  // O meio mais escuro, onde o sangue empoçou
  const meio = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, 60);
  meio.addColorStop(0, `rgba(${fundo},0.55)`);
  meio.addColorStop(1, `rgba(${fundo},0)`);
  g.fillStyle = meio;
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 26; i++) {
    const ang = Math.random() * Math.PI * 2;
    const d = 70 + Math.random() * 50;
    g.fillStyle = `rgba(${rgb},${0.6 + Math.random() * 0.3})`;
    g.beginPath();
    g.arc(S / 2 + Math.cos(ang) * d, S / 2 + Math.sin(ang) * d, 1 + Math.random() * 4, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
