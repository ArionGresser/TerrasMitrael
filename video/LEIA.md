# Vídeo de apresentação

O trailer do site, em 1920×1080, no computador. O roteiro em texto fica em
`ROTEIRO-2.txt`; o mesmo roteiro em código, preso à música, em `src/roteiro.ts`.

1. Na raiz do site: `pnpm build` (gera a pasta `out/`, que é o que se filma).
2. Aqui em `video/`:
   - `pnpm install` e `pnpm exec playwright install chromium`, só na primeira vez;
   - `pnpm preparar`: corta e iguala os efeitos e copia a trilha e as imagens
     da montagem, tudo de `Documents/Artes prontas/sons/video/` e das artes;
   - `pnpm gravar`: filma o passeio pelo site (ou `node gravar.mjs horizontal mapa`
     para refazer uma cena). A mesa joga o d20 até sair um 20 de verdade;
   - `pnpm estudio`: abre o editor do Remotion no navegador, para ver e ajustar;
   - `pnpm render`: gera o vídeo e passa o som por um limitador, em
     `out/terras-de-mitrael-2.mp4`.
