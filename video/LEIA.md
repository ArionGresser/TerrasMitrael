# Vídeo de apresentação

O trailer do site, nos formatos em pé (1080×1920) e deitado (1920×1080).

1. Na raiz do site: `pnpm build` (gera a pasta `out/`, que é o que se filma).
2. Aqui em `video/`:
   - `pnpm install` e `pnpm exec playwright install chromium`, só na primeira vez;
   - `pnpm preparar`: copia a música, as imagens e prepara os efeitos sonoros;
   - `pnpm gravar`: filma o passeio pelo site (ou `node gravar.mjs vertical mapa` para refazer uma cena);
   - `pnpm estudio`: abre o editor do Remotion no navegador, para ver e ajustar;
   - `pnpm render`: gera os dois mp4 em `out/`.

O roteiro (ordem, tempo e legenda de cada cena) fica em `src/roteiro.ts`.
