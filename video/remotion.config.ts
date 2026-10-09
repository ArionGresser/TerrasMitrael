import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Config } from "@remotion/cli/config";

// Usa o mesmo Chromium que o Playwright já baixou para gravar o site,
// em vez de baixar um segundo navegador só para o Remotion
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
const pasta = fs.existsSync(cache)
  ? fs.readdirSync(cache).filter((p) => p.startsWith("chromium_headless_shell")).sort().pop()
  : undefined;
if (pasta) {
  Config.setBrowserExecutable(
    path.join(cache, pasta, "chrome-headless-shell-mac-arm64/chrome-headless-shell"),
  );
}
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
