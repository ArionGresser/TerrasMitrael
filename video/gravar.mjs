/**
 * Grava o passeio pelo site, cena por cena, no formato deitado (1920x1080).
 *
 * Serve a pasta out/ (o site estático do `pnpm build`) num servidor próprio,
 * abre cada tela num Chromium sem janela e filma pelo DevTools: cada quadro
 * que o navegador desenha vira uma imagem, com a hora exata em que saiu.
 * Depois o ffmpeg do Remotion junta as imagens num mp4 a 30 quadros.
 *
 * O navegador da gravação não filma o cursor do sistema. Por isso cada tela
 * ganha uma luva desenhada na própria página, que segue o mouse e troca de
 * pose como o cursor do site (mão, dedo, aperto, pinça).
 *
 * Cada gesto fica anotado com o instante em que aconteceu (`marcar`), para o
 * vídeo encaixar o efeito sonoro e o corte na hora certa.
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

// ---------- O que a página já sabe antes de abrir ----------

/**
 * O estado guardado no navegador antes da primeira tela: as conquistas que
 * já existem, a luva vestida e o dado escolhido.
 *
 * Quem grava já rolou o d20 uma vez e já bateu 300 vezes na mesa (por isso
 * a Manopla de aço está liberada). Assim, na cena da mesa, o único lacre que
 * desce é o do Vinte natural.
 */
function estadoInicial({ cursor = "couro", dado = "preto", vinte = false } = {}) {
  const agora = "2026-10-10T12:00:00.000Z";
  const feitas = { "primeiro-dado": agora, "na-bandeja": agora, "batidas-bronze": agora, batidas: agora, "batidas-ouro": agora };
  const contas = { rolador: 1, batidas: 300 };
  if (vinte) {
    feitas["vinte-natural"] = agora;
    contas.vintes = 1;
  }
  return {
    "mitrael:conquistas": JSON.stringify(feitas),
    "mitrael:contadores": JSON.stringify(contas),
    "mitrael:cursor": cursor,
    "mitrael:dado": dado,
  };
}

/** Grava o estado, mas só na primeira tela: o que a cena muda depois fica. */
function scriptDoEstado(estado) {
  return `(() => {
    try {
      if (sessionStorage.getItem("__gravacao")) return;
      sessionStorage.setItem("__gravacao", "1");
      const e = ${JSON.stringify(estado)};
      for (const [k, v] of Object.entries(e)) localStorage.setItem(k, v);
    } catch {}
  })();`;
}

/**
 * A luva na tela. Lê o cursor que o CSS do site escolheu para o ponto embaixo
 * do mouse (com o ponto quente de cada desenho) e desenha a imagem ali, por
 * cima de tudo e sem receber clique. Também anota as conquistas que descem.
 */
const SCRIPT_DA_MAO = `(() => {
  window.__conquistasVistas = [];
  window.addEventListener("mitrael:conquista", (e) => window.__conquistasVistas.push(e.detail && e.detail.chave));
  let x = -200, y = -200;
  const tamanhos = {};
  function montar() {
    if (document.getElementById("__mao")) return;
    const el = document.createElement("div");
    el.id = "__mao";
    el.style.cssText = "position:fixed;left:0;top:0;width:32px;height:32px;pointer-events:none;z-index:2147483647;background-repeat:no-repeat;background-size:contain;will-change:transform;filter:drop-shadow(0 3px 3px rgba(0,0,0,.45));";
    document.documentElement.appendChild(el);
    desenhar();
  }
  function desenhar() {
    const el = document.getElementById("__mao");
    if (!el) return;
    const alvo = document.elementFromPoint(Math.max(0, x), Math.max(0, y));
    const c = alvo ? getComputedStyle(alvo).cursor : "";
    const m = c.match(/url\\("?([^")]+)"?\\)\\s*(\\d+)?\\s*(\\d+)?/);
    if (!m) { el.style.display = "none"; return; }
    el.style.display = "block";
    const url = m[1], hx = Number(m[2] || 0), hy = Number(m[3] || 0);
    if (!tamanhos[url]) {
      tamanhos[url] = [32, 32];
      const img = new Image();
      img.onload = () => { tamanhos[url] = [img.naturalWidth || 32, img.naturalHeight || 32]; desenhar(); };
      img.src = url;
    }
    const [w, h] = tamanhos[url];
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.backgroundImage = 'url("' + url + '")';
    el.style.transform = "translate(" + (x - hx) + "px," + (y - hy) + "px)";
  }
  const seguir = (e) => { x = e.clientX; y = e.clientY; desenhar(); };
  window.addEventListener("pointermove", seguir, true);
  window.addEventListener("pointerdown", (e) => { seguir(e); requestAnimationFrame(desenhar); }, true);
  window.addEventListener("pointerup", (e) => { seguir(e); requestAnimationFrame(desenhar); }, true);
  window.addEventListener("scroll", () => requestAnimationFrame(desenhar), true);
  setInterval(desenhar, 120);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
})();`;

// ---------- Ferramentas das cenas ----------

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Onde o mouse está, para o próximo movimento sair dali. */
const mao = new WeakMap();

/** Leva a mão até um ponto, acelerando e freando como uma mão de verdade. */
async function mover(page, x, y, ms = 700) {
  const de = mao.get(page) ?? { x: 640, y: 400 };
  const passos = Math.max(2, Math.round(ms / 16));
  // Uma curva leve, para não andar em linha reta como robô
  const cx = (de.x + x) / 2 + (y - de.y) * 0.12;
  const cy = (de.y + y) / 2 - (x - de.x) * 0.12;
  for (let i = 1; i <= passos; i++) {
    const t = suave(i / passos);
    const px = (1 - t) * (1 - t) * de.x + 2 * (1 - t) * t * cx + t * t * x;
    const py = (1 - t) * (1 - t) * de.y + 2 * (1 - t) * t * cy + t * t * y;
    await page.mouse.move(px, py);
    await esperar(16);
  }
  mao.set(page, { x, y });
}

/** Põe a mão num ponto sem filmar o caminho (antes de a cena começar). */
async function pousar(page, x, y) {
  await page.mouse.move(x, y);
  mao.set(page, { x, y });
}

async function clicar(page, alvo, ms = 650) {
  const b = await alvo.boundingBox();
  if (!b) throw new Error("Alvo fora da tela");
  await mover(page, b.x + b.width / 2, b.y + b.height / 2, ms);
  await esperar(120);
  await page.mouse.down();
  await esperar(90);
  await page.mouse.up();
}

/** Rola a página devagar, como uma pessoa lendo, com a rodinha. */
async function rolar(page, total, ms) {
  const passos = Math.max(1, Math.round(ms / 16));
  let feito = 0;
  for (let i = 1; i <= passos; i++) {
    const alvo = total * suave(i / passos);
    await page.mouse.wheel(0, alvo - feito);
    feito = alvo;
    await esperar(16);
  }
}

/** Rola até o elemento ficar a uma fração da altura da tela. */
async function rolarAte(page, locator, fracao = 0.4, ms = 1200) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("Elemento não encontrado para rolar");
  const vh = page.viewportSize().height;
  await rolar(page, b.y + b.height / 2 - vh * fracao, ms);
}

/** Rola até o elemento de uma vez, antes de filmar. */
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

/** Depois de trocar de tela, a luva precisa saber de novo onde está. */
async function reacordar(page) {
  const p = mao.get(page) ?? { x: 640, y: 400 };
  await page.mouse.move(p.x + 1, p.y);
  await page.mouse.move(p.x, p.y);
}

/** Um ponto de dentro da região do mapa, o mais perto possível do pedido. */
async function pontoDaRegiao(page, chave, px, py) {
  return page.evaluate(
    ({ chave, px, py }) => {
      const el = document.querySelector(`[data-regiao="${chave}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      let melhor = null;
      for (let y = Math.max(r.top, 90); y < Math.min(r.bottom, innerHeight - 30); y += 8) {
        for (let x = Math.max(r.left, 20); x < Math.min(r.right, innerWidth - 20); x += 8) {
          const sob = document.elementFromPoint(x, y)?.closest("[data-regiao]");
          if (sob?.getAttribute("data-regiao") !== chave) continue;
          const d = Math.hypot(x - px, y - py);
          if (!melhor || d < melhor.d) melhor = { x, y, d };
        }
      }
      return melhor;
    },
    { chave, px, py },
  );
}

/** Pega o d20 onde ele estiver e joga na direção pedida. */
async function jogarDado(page, marcar, alvoX, alvoY) {
  const d = await page.evaluate(() => window.__mesa3d?.ondeEstaODado?.());
  if (!d) throw new Error("O d20 não está na tela");
  await mover(page, d.x, d.y, 800);
  await esperar(150);
  await page.mouse.down();
  await esperar(120);
  // Levanta um pouco e puxa para trás, antes do arremesso
  await mover(page, d.x - 18, d.y + 14, 260);
  await esperar(80);
  marcar("arremesso");
  const passos = 9;
  for (let i = 1; i <= passos; i++) {
    const t = i / passos;
    await page.mouse.move(d.x - 18 + (alvoX - d.x + 18) * t, d.y + 14 + (alvoY - d.y - 14) * t);
    await esperar(12);
  }
  await page.mouse.up();
  mao.set(page, { x: alvoX, y: alvoY });
}

/** Espera o d20 parar e devolve se saiu 20. */
async function esperarResultado(page, rolagensAntes) {
  for (let i = 0; i < 80; i++) {
    const c = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem("mitrael:contadores") || "{}");
      } catch {
        return {};
      }
    });
    if ((c.rolador ?? 0) > rolagensAntes) return { vinte: (c.vintes ?? 0) > 0 };
    await esperar(100);
  }
  return { vinte: false, travou: true };
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
    await rolar(page, 1500, 4200);
    await esperar(500);
  },

  /**
   * A mesa: joga o d20 da bandeja e ele precisa dar 20 de verdade. Se não
   * der, a cena para cedo e é gravada de novo (ver `main`). Com o 20, desce
   * o lacre do Vinte natural, que libera o dado Esmeralda; a mão escolhe o
   * Esmeralda, joga de novo e veste a Manopla de aço.
   */
  mesa: {
    estado: { cursor: "couro" },
    async gravar({ page, filmar, marcar }) {
      await page.goto(`http://localhost:${PORTA}/conquistas/`);
      await pronto(page);
      for (let i = 0; i < 60 && !(await page.evaluate(() => window.__mesa3d?.ondeEstaODado?.())); i++) await esperar(200);
      await esperar(1200);
      await pousar(page, 700, 470);
      await filmar();
      await esperar(500);
      await jogarDado(page, marcar, 560, 330);
      const r = await esperarResultado(page, 1);
      if (!r.vinte) return { vinte: false };
      marcar("vinte");
      marcar("brilho", 3, 120);
      await esperar(2400);

      // O prêmio: o dado Esmeralda
      await clicar(page, page.getByRole("button", { name: /^Escolher o dado/ }), 800);
      await esperar(700);
      marcar("clique");
      await clicar(page, page.getByRole("group").getByRole("button", { name: /Esmeralda/ }), 600);
      await esperar(600);
      await page.keyboard.press("Escape");
      await esperar(400);
      await jogarDado(page, marcar, 760, 300);
      await esperResultadoQualquer(page);
      await esperar(600);

      // E a luva da vez: a Manopla de aço
      await clicar(page, page.getByRole("button", { name: /^Escolher o cursor/ }), 800);
      await esperar(700);
      marcar("clique");
      await clicar(page, page.getByRole("group").getByRole("button", { name: /Manopla/ }), 600);
      await esperar(500);
      await page.keyboard.press("Escape");
      await mover(page, 820, 420, 800);
      await esperar(900);
      return { vinte: true };
    },
  },

  mapa: {
    estado: { cursor: "manopla", vinte: true, dado: "esmeralda" },
    async gravar({ page, filmar, marcar }) {
      await page.goto(`http://localhost:${PORTA}/mapa/`);
      await pronto(page);
      const tundra = await pontoDaRegiao(page, "tundra", 300, 150);
      const askar = await pontoDaRegiao(page, "askar", 230, 540);
      const mitrael = await pontoDaRegiao(page, "mitrael", 960, 600);
      if (!tundra || !askar || !mitrael) throw new Error("Regiões do mapa não achadas");
      await pousar(page, 620, 250);
      await filmar();
      await esperar(500);
      for (const p of [tundra, askar]) {
        await mover(page, p.x, p.y, 750);
        marcar("regiao");
        await esperar(420);
      }
      await mover(page, mitrael.x, mitrael.y, 850);
      marcar("regiao");
      await esperar(700);
      marcar("zoom");
      await page.mouse.down();
      await esperar(90);
      await page.mouse.up();
      await esperar(2000);
      const sovara = page.getByLabel("Sovara Mithr: abrir a história do lugar");
      marcar("marcador", undefined, 650 + 120);
      await clicar(page, sovara, 650);
      await esperar(2600);
    },
  },

  personagens: {
    estado: { cursor: "manopla", vinte: true, dado: "esmeralda" },
    async gravar({ page, filmar, marcar }) {
      await page.goto(`http://localhost:${PORTA}/personagens/`);
      await pronto(page);
      await pousar(page, 1060, 420);
      await filmar();
      await esperar(1600);
      const egon = page.locator('a[href="/personagens/egon-vitriol/"]').first();
      await rolarAte(page, egon, 0.5, 2600);
      await esperar(300);
      marcar("egon", undefined, 650 + 120);
      await clicar(page, egon, 650);
      await page.waitForURL("**/personagens/egon-vitriol/");
      await reacordar(page);
      await esperar(1700);
      // A runa do bando Vitriol, girando
      const runa = page.getByRole("tabpanel").getByRole("img").first();
      await rolarAte(page, runa, 0.45, 1400);
      await esperar(1700);
      // O retrato pintado pela ilustradora
      // A primeira moldura da aba é a da runa; o retrato é a segunda
      const retrato = page.getByRole("tabpanel").locator("figure").nth(1);
      await rolarAte(page, retrato, 0.5, 1300);
      await esperar(1600);
      // As abas da ficha (Poderes fica de fora)
      const lista = page.getByRole("tablist");
      await rolarAte(page, lista, 0.2, 1100);
      await esperar(300);
      marcar("aba", undefined, 650 + 120);
      await clicar(page, page.getByRole("tab", { name: /Ficha/ }), 650);
      await esperar(1700);
      marcar("aba", undefined, 650 + 120);
      await clicar(page, page.getByRole("tab", { name: /Mochila/ }), 650);
      await esperar(1800);
    },
  },

  cronicas: {
    estado: { cursor: "manopla", vinte: true, dado: "esmeralda" },
    async gravar({ page, filmar, marcar }) {
      await page.goto(`http://localhost:${PORTA}/contos/`);
      await pronto(page);
      await pousar(page, 1080, 430);
      await filmar();
      await esperar(1300);
      const saga = page.locator('main a[href="/contos/cronicas/"]').first();
      await rolarAte(page, saga, 0.5, 1300);
      await clicar(page, saga, 600);
      await page.waitForURL("**/contos/cronicas/");
      await reacordar(page);
      await esperar(1300);
      const t2 = page.locator('main a[href="/contos/cronicas/temporada-2/"]').first();
      await rolarAte(page, t2, 0.5, 1200);
      await esperar(500);
      await clicar(page, t2, 600);
      await page.waitForURL("**/contos/cronicas/temporada-2/");
      await reacordar(page);
      await page.locator(".livro").waitFor();
      await esperar(400);
      await rolarAte(page, page.locator(".livro"), 0.45, 900);
      await mover(page, 1180, 600, 500);
      await esperar(500);
      marcar("capa");
      await page.keyboard.press("ArrowRight");
      await esperar(1500);
      marcar("virarPagina");
      await page.keyboard.press("ArrowRight");
      await esperar(1400);
      marcar("virarPagina");
      await page.keyboard.press("ArrowRight");
      await esperar(1600);
    },
  },

  livro: {
    estado: { cursor: "manopla", vinte: true, dado: "esmeralda" },
    async gravar({ page, filmar, marcar }) {
      await page.goto(`http://localhost:${PORTA}/regras/`);
      await pronto(page);
      await pousar(page, 1080, 430);
      await filmar();
      await esperar(1300);
      const grimorio = page.locator('main a[href="/magias/"]').first();
      await rolarAte(page, grimorio, 0.45, 1300);
      await esperar(200);
      marcar("feitico", undefined, 650 + 120);
      await clicar(page, grimorio, 650);
      await page.waitForURL("**/magias/");
      await reacordar(page);
      await esperar(1400);
      await rolar(page, 1300, 2600);
      await esperar(400);
    },
  },

  novidades: {
    estado: { cursor: "manopla", vinte: true, dado: "esmeralda" },
    async gravar({ page, filmar }) {
      await page.goto(`http://localhost:${PORTA}/novidades/`);
      await pronto(page);
      await posicionar(page, page.locator("#em-breve"), 0.18);
      await filmar();
      await esperar(500);
      await rolar(page, 260, 3600);
      await esperar(600);
    },
  },

  bau: {
    estado: { cursor: "manopla", vinte: true, dado: "esmeralda" },
    async gravar({ page, filmar, marcar }) {
      await page.goto(`http://localhost:${PORTA}/bau/`);
      await pronto(page);
      // O jogador tirou 20 natural na mesa e o mestre digita o resultado
      const campo = page.getByLabel("Resultado do d20");
      const abrir = page.getByRole("button", { name: "Abrir o baú" });
      await posicionar(page, campo, 0.35);
      await filmar();
      await esperar(500);
      await campo.click();
      await page.keyboard.type("20", { delay: 140 });
      await esperar(300);
      marcar("trinco");
      await abrir.click();
      await esperar(150);
      const saiu = await page.evaluate(() => {
        const texto = document.querySelector("main")?.innerText ?? "";
        const niveis = { Comum: 1, Incomum: 2, Raro: 3, "Muito Raro": 4, Lendário: 5 };
        let nivel = 0;
        for (const [nome, n] of Object.entries(niveis)) if (new RegExp(`, ${nome}\\b`).test(texto)) nivel = Math.max(nivel, n);
        return { nivel };
      });
      await esperar(700);
      const titulo = page.getByText("O que tinha dentro");
      const b = await titulo.boundingBox();
      if (b) await rolar(page, b.y - page.viewportSize().height * 0.12, 1100);
      marcar("resultado");
      await esperar(1800);
      return saiu;
    },
  },
};

/** O segundo arremesso pode dar qualquer coisa: só espera ele parar. */
async function esperResultadoQualquer(page) {
  await esperar(2600);
}

// ---------- A filmagem ----------

async function gravarCena(browser, formato, nome) {
  const { viewport, escala } = FORMATOS[formato];
  const cena = typeof CENAS[nome] === "function" ? { gravar: CENAS[nome] } : CENAS[nome];
  const contexto = await browser.newContext({
    viewport,
    deviceScaleFactor: escala,
    locale: "pt-BR",
    reducedMotion: "no-preference",
  });
  await contexto.addInitScript(scriptDoEstado(estadoInicial(cena.estado)));
  await contexto.addInitScript(SCRIPT_DA_MAO);
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);

  const pasta = path.join(QUADROS, formato, nome);
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.mkdirSync(pasta, { recursive: true });

  const quadros = [];
  const eventos = [];
  let inicio = null;
  let filmando = false;

  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    if (filmando) {
      const n = quadros.length;
      const arquivo = path.join(pasta, `${String(n).padStart(5, "0")}.jpg`);
      fs.writeFileSync(arquivo, Buffer.from(data, "base64"));
      quadros.push({ arquivo, t: metadata.timestamp });
    }
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });

  const filmar = async () => {
    inicio = Date.now() / 1000;
    filmando = true;
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

  const extra = await cena.gravar({ page, filmar, marcar });
  const fim = Date.now() / 1000;
  filmando = false;
  await cdp.send("Page.stopScreencast").catch(() => {});
  await esperar(200);
  await contexto.close();

  // A tomada que não serve (o d20 não deu 20) nem vira vídeo
  if (extra && extra.vinte === false) return { extra };
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
  // O headless novo com a placa de vídeo (Metal): o padrão desenha o 3D da
  // mesa no processador (SwiftShader), e a cena sai em câmera lenta
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
  });
  try {
    for (const formato of formatos) {
      const indice = path.join(SAIDA, formato, "cenas.json");
      const registro = fs.existsSync(indice) ? JSON.parse(fs.readFileSync(indice, "utf8")) : {};
      for (const nome of cenas) {
        let r = await gravarCena(browser, formato, nome);
        // A mesa precisa de um 20 de verdade: joga de novo até sair
        for (let tentativa = 1; nome === "mesa" && r.extra?.vinte === false && tentativa < 120; tentativa++) {
          if (tentativa % 10 === 0) console.log(`mesa: ${tentativa} arremessos e nada de 20 ainda`);
          r = await gravarCena(browser, formato, nome);
        }
        if (r.extra?.vinte === false) throw new Error("mesa: o 20 não saiu em 120 arremessos");
        // O baú é sorteio: grava de novo até sair um item mágico raro ou melhor
        for (let tentativa = 1; nome === "bau" && (r.extra?.nivel ?? 0) < 4 && tentativa < 12; tentativa++) {
          r = await gravarCena(browser, formato, nome);
        }
        registro[nome] = r;
        console.log(`${formato}/${nome}: ${r.duracao}s, ${r.quadros} quadros, ${r.eventos.length} marcas`);
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
