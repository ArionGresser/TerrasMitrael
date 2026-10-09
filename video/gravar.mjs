/**
 * Grava o passeio pelo site, cena por cena, no formato deitado (1920x1080).
 *
 * Serve a pasta out/ (o site estático do `pnpm build`) num servidor próprio,
 * abre cada tela num Chromium sem janela e filma pelo DevTools: cada quadro
 * que o navegador desenha vira uma imagem, com a hora exata em que saiu.
 * Depois o ffmpeg do Remotion junta as imagens num mp4 a 30 quadros.
 *
 * Cada gesto (virar folha, abrir a capa, clicar no mapa) fica anotado com o
 * instante em que aconteceu, para o vídeo tocar o efeito sonoro certo na
 * hora certa.
 *
 * Uso:  node gravar.mjs [horizontal] [cena...]
 * Sai:  public/gravacoes/<formato>/<cena>.mp4 e public/gravacoes/<formato>/cenas.json
 */

import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(AQUI, "../out");
const SAIDA = path.join(AQUI, "public/gravacoes");
const QUADROS = path.join(AQUI, "tmp");
const FFMPEG = path.join(
  AQUI,
  "node_modules/.pnpm/node_modules/@remotion/compositor-darwin-arm64/ffmpeg",
);
const PORTA = 4317;
const FPS = 30;

export const FORMATOS = {
  horizontal: { viewport: { width: 1280, height: 720 }, escala: 1.5 },
};

// ---------- O servidor do site estático ----------

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".ico": "image/x-icon",
};

function servir() {
  const servidor = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let arquivo = path.join(SITE, url);
    if (url.endsWith("/")) arquivo = path.join(arquivo, "index.html");
    if (!fs.existsSync(arquivo) && fs.existsSync(arquivo + ".html")) arquivo += ".html";
    if (!arquivo.startsWith(SITE) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { "content-type": TIPOS[path.extname(arquivo)] ?? "application/octet-stream" });
    fs.createReadStream(arquivo).pipe(res);
  });
  return new Promise((ok) => servidor.listen(PORTA, () => ok(servidor)));
}

// ---------- Ferramentas das cenas ----------

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** Rola a página devagar, como uma pessoa lendo, com a rodinha. */
async function rolar(page, total, ms) {
  const passos = Math.max(1, Math.round(ms / 16));
  for (let i = 0; i < passos; i++) {
    await page.mouse.wheel(0, total / passos);
    await esperar(16);
  }
}

/** Rola até o elemento ficar a uma fração da altura da tela, de uma vez. */
async function posicionar(page, locator, fracao = 0.4) {
  await locator.evaluate((el, f) => {
    const r = el.getBoundingClientRect();
    window.scrollBy({ top: r.top - window.innerHeight * f, behavior: "instant" });
  }, fracao);
  await esperar(500);
}

async function pronto(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await esperar(900);
}

// ---------- As cenas ----------
// Cada uma recebe a página já carregada e `marcar(efeito, nivel?)`, e só
// começa a ser filmada quando `filmar()` é chamado.

const CENAS = {
  async inicio({ page, filmar }) {
    await page.goto(`http://localhost:${PORTA}/`);
    await pronto(page);
    await filmar();
    await esperar(900);
    await rolar(page, 1100, 2600);
    await esperar(400);
  },

  async mapa({ page, filmar, marcar }) {
    await page.goto(`http://localhost:${PORTA}/mapa/`);
    await pronto(page);
    const vw = page.viewportSize();
    // O primeiro lugar que já aparece na tela, para o zoom cair em cima dele
    const preferidos = ["Sovara Mithr", "Terra dos Putrefados", "Terras de Askar", "Arauto dos Feiticeiros"];
    let alvo = null;
    for (const nome of preferidos) {
      const l = page.getByLabel(`${nome}: abrir a história do lugar`);
      const b = await l.boundingBox().catch(() => null);
      if (b && b.x > 30 && b.x < vw.width - 30 && b.y > 90 && b.y < vw.height - 60) {
        alvo = { l, b };
        break;
      }
    }
    if (!alvo) throw new Error("Nenhum lugar visível no mapa");
    await filmar();
    await esperar(700);
    const cx = alvo.b.x + alvo.b.width / 2;
    const cy = alvo.b.y + alvo.b.height / 2;
    await page.mouse.move(cx, cy);
    marcar("zoomPerto");
    for (let i = 0; i < 9; i++) {
      await page.mouse.wheel(0, -90);
      await esperar(45);
    }
    await esperar(900);
    marcar("marcador");
    await alvo.l.click();
    await esperar(3000);
  },

  async contos({ page, filmar, marcar }) {
    await page.goto(`http://localhost:${PORTA}/contos/cronicas/temporada-2/`);
    await pronto(page);
    await posicionar(page, page.locator(".livro"), 0.12);
    await filmar();
    await esperar(800);
    marcar("capa");
    await page.keyboard.press("ArrowRight");
    await esperar(1500);
    marcar("virarPagina");
    await page.keyboard.press("ArrowRight");
    await esperar(1400);
    marcar("virarPagina");
    await page.keyboard.press("ArrowRight");
    await esperar(1700);
  },

  async personagem({ page, filmar, marcar }) {
    await page.goto(`http://localhost:${PORTA}/personagens/vrakyr-windrose/`);
    await pronto(page);
    await filmar();
    await esperar(1200);
    const abas = page.getByRole("tab");
    const lista = page.getByRole("tablist");
    const b = await lista.boundingBox();
    const vh = page.viewportSize().height;
    if (b) await rolar(page, b.y - vh * 0.3, 1500);
    await esperar(500);
    marcar("aba");
    await abas.nth(1).click();
    await esperar(1500);
    marcar("aba");
    await abas.nth(2).click();
    await esperar(1500);
  },

  async grimorio({ page, filmar, marcar }) {
    await page.goto(`http://localhost:${PORTA}/regras/`);
    await pronto(page);
    const cartao = page.locator('a[href="/magias/"]').first();
    await posicionar(page, cartao, 0.35);
    await filmar();
    await esperar(800);
    marcar("feitico");
    await cartao.click();
    await page.waitForURL("**/magias/");
    await pronto(page);
    await rolar(page, 900, 2200);
    await esperar(300);
  },

  async bestiario({ page, filmar, marcar }) {
    await page.goto(`http://localhost:${PORTA}/regras/`);
    await pronto(page);
    const cartao = page.locator('a[href="/monstros/"]').first();
    await posicionar(page, cartao, 0.35);
    await filmar();
    await esperar(800);
    marcar("rugido");
    await cartao.click();
    await page.waitForURL("**/monstros/");
    await pronto(page);
    await rolar(page, 900, 2200);
    await esperar(300);
  },

  async bau({ page, filmar, marcar }) {
    await page.goto(`http://localhost:${PORTA}/bau/`);
    await pronto(page);
    // O jogador tirou 20 natural na mesa e o mestre digita o resultado
    const campo = page.getByLabel("Resultado do d20");
    const abrir = page.getByRole("button", { name: "Abrir o baú" });
    await posicionar(page, campo, 0.35);
    await filmar();
    await esperar(700);
    await campo.click();
    await page.keyboard.type("20", { delay: 160 });
    await esperar(450);
    marcar("trinco");
    await abrir.click();
    await esperar(150);
    // O que saiu decide os sons, como no site: moedas e o brilho da raridade
    const saiu = await page.evaluate(() => {
      const texto = document.querySelector("main")?.innerText ?? "";
      const niveis = { Comum: 1, Incomum: 2, Raro: 3, "Muito Raro": 4, Lendário: 5 };
      let nivel = 0;
      for (const [nome, n] of Object.entries(niveis)) if (new RegExp(`, ${nome}\\b`).test(texto)) nivel = Math.max(nivel, n);
      return { moedas: /\b(po|pp|pc|pe|pl)\b|moedas? de/i.test(texto), nivel };
    });
    if (saiu.moedas) marcar("moedas", undefined, 260 - 150);
    if (saiu.nivel) marcar("brilho", saiu.nivel, 620 - 150);
    await esperar(900);
    // Desce até o que saiu, sem passar dele
    const titulo = page.getByText("O que tinha dentro");
    const b = await titulo.boundingBox();
    if (b) await rolar(page, b.y - page.viewportSize().height * 0.12, 1300);
    await esperar(2200);
    return saiu;
  },
};

// ---------- A filmagem ----------

async function gravarCena(browser, formato, nome) {
  const { viewport, escala } = FORMATOS[formato];
  const contexto = await browser.newContext({
    viewport,
    deviceScaleFactor: escala,
    locale: "pt-BR",
    reducedMotion: "no-preference",
  });
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);

  const pasta = path.join(QUADROS, formato, nome);
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.mkdirSync(pasta, { recursive: true });

  const quadros = [];
  const eventos = [];
  let inicio = null;

  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    const n = quadros.length;
    const arquivo = path.join(pasta, `${String(n).padStart(5, "0")}.jpg`);
    fs.writeFileSync(arquivo, Buffer.from(data, "base64"));
    quadros.push({ arquivo, t: metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });

  const filmar = async () => {
    inicio = Date.now() / 1000;
    await cdp.send("Page.startScreencast", {
      format: "jpeg",
      quality: 92,
      maxWidth: Math.round(viewport.width * escala),
      maxHeight: Math.round(viewport.height * escala),
      everyNthFrame: 1,
    });
  };
  const marcar = (efeito, nivel, atraso = 0) => {
    eventos.push({ t: Date.now() / 1000 + atraso / 1000, efeito, ...(nivel ? { nivel } : {}) });
  };

  const extra = await CENAS[nome]({ page, filmar, marcar });
  const fim = Date.now() / 1000;
  await cdp.send("Page.stopScreencast").catch(() => {});
  await esperar(200);
  await contexto.close();

  if (quadros.length < 2) throw new Error(`${formato}/${nome}: nenhum quadro gravado`);

  // O relógio do vídeo começa no primeiro quadro desenhado. O carimbo dos
  // quadros é hora do relógio, como Date.now; se um dia não for, o vídeo
  // passa a contar do instante em que a filmagem foi pedida.
  let zero = quadros[0].t;
  let desvio = 0;
  if (Math.abs(zero - inicio) > 5) {
    desvio = inicio - zero;
    zero = inicio;
  }
  quadros.forEach((q) => (q.t += desvio));
  const lista = quadros
    .map((q, i) => {
      const prox = i + 1 < quadros.length ? quadros[i + 1].t : fim;
      return `file '${q.arquivo}'\nduration ${Math.max(0.001, prox - q.t).toFixed(4)}`;
    })
    .join("\n");
  const listaArq = path.join(pasta, "lista.txt");
  fs.writeFileSync(listaArq, `${lista}\nfile '${quadros.at(-1).arquivo}'\n`);

  fs.mkdirSync(path.join(SAIDA, formato), { recursive: true });
  const mp4 = path.join(SAIDA, formato, `${nome}.mp4`);
  const { width, height } = viewport;
  const W = Math.round((width * escala) / 2) * 2;
  const H = Math.round((height * escala) / 2) * 2;
  execFileSync(FFMPEG, [
    "-y", "-loglevel", "error",
    "-f", "concat", "-safe", "0", "-i", listaArq,
    "-vf", `scale=${W}:${H}`,
    "-r", String(FPS), "-fps_mode", "cfr",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    mp4,
  ], { env: { ...process.env, DYLD_LIBRARY_PATH: path.dirname(FFMPEG) } });

  const duracao = fim - zero;
  return {
    duracao: Number(duracao.toFixed(3)),
    quadros: quadros.length,
    eventos: eventos.map((e) => ({ ...e, t: Number((e.t - zero).toFixed(3)) })),
    ...(extra ? { extra } : {}),
  };
}

async function main() {
  const [formatoPedido, ...cenasPedidas] = process.argv.slice(2);
  const formatos = formatoPedido ? [formatoPedido] : Object.keys(FORMATOS);
  const cenas = cenasPedidas.length ? cenasPedidas : Object.keys(CENAS);

  const servidor = await servir();
  const browser = await chromium.launch();
  try {
    for (const formato of formatos) {
      const indice = path.join(SAIDA, formato, "cenas.json");
      const registro = fs.existsSync(indice) ? JSON.parse(fs.readFileSync(indice, "utf8")) : {};
      for (const nome of cenas) {
        let r = await gravarCena(browser, formato, nome);
        // O baú é sorteio: grava de novo até sair um item mágico raro ou melhor
        for (let tentativa = 1; nome === "bau" && (r.extra?.nivel ?? 0) < 3 && tentativa < 12; tentativa++) {
          r = await gravarCena(browser, formato, nome);
        }
        registro[nome] = r;
        console.log(`${formato}/${nome}: ${r.duracao}s, ${r.quadros} quadros, ${r.eventos.length} sons`);
        fs.mkdirSync(path.dirname(indice), { recursive: true });
        fs.writeFileSync(indice, JSON.stringify(registro, null, 2));
      }
    }
  } finally {
    await browser.close();
    servidor.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
