/**
 * Faz a cópia em PNG de cada cursor, para o navegador que não aceitar SVG
 * no cursor. Usa o Playwright do projeto do vídeo, que já está instalado.
 *
 * Uso:  node scripts/cursores/rasterizar.mjs
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(path.join(RAIZ, "video/package.json"));
const { chromium } = require("playwright");
const PASTA = path.join(RAIZ, "public/cursores");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 32, height: 32 } });
for (const arquivo of fs.readdirSync(PASTA).filter((a) => a.endsWith(".svg"))) {
  const svg = fs.readFileSync(path.join(PASTA, arquivo), "utf8");
  await page.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
  await page.screenshot({ path: path.join(PASTA, arquivo.replace(".svg", ".png")), omitBackground: true });
}
await browser.close();
