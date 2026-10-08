"""
Monta o kit para repintar o mapa por partes: cada continente recortado do
mapa atual, sem o mar, ampliado e pronto para enviar ao ChatGPT, mais uma
página com o prompt de cada um.

    python3 -m venv /tmp/venv && /tmp/venv/bin/pip install numpy opencv-python-headless pillow
    /tmp/venv/bin/python scripts/mapa/recortar-continentes.py

Sai em mapa-kit/ (fora do git):
    mapa-kit/COMO-USAR.html          a página com os prompts para copiar
    mapa-kit/enviar/<chave>.png      a peça para anexar no ChatGPT
E em scripts/mapa/continentes.json, onde cada peça estava no mapa: é o que
o script de montagem usa para devolver cada uma ao seu lugar.

Peças vizinhas na mesma terra (Tundra, Tungel e Marily) saem com uma sobra
de terra da vizinha, para a emenda ficar escondida na montagem.
"""

import html
import importlib.util
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from continentes import ESTILO, PECAS

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
KIT = RAIZ / "mapa-kit"
ENVIAR = KIT / "enviar"

# O lado maior de cada peça. O ChatGPT devolve no tamanho dele, mas quanto
# mais nítida a entrada, mais fiel ao desenho ele fica.
LADO = 2048
SOBRA = 28  # px do mapa original: quanto cada peça invade a vizinha
MARGEM = 0.05  # ar em volta da terra, em fração do quadro

spec = importlib.util.spec_from_file_location("gr", AQUI / "gerar-regioes.py")
gr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gr)

IM = cv2.cvtColor(gr.im, cv2.COLOR_BGR2RGB)
H, W = IM.shape[:2]


def sem_buracos(m):
    """Lagos e nomes dentro da terra viram terra: a peça vai inteira."""
    contornos, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cheio = np.zeros_like(m)
    cv2.drawContours(cheio, contornos, -1, 255, cv2.FILLED)
    return cheio


def soltas():
    """A terra que nenhuma região cobre: as ilhotas (e alguns borrões)."""
    uniao = np.zeros_like(gr.T)
    for m in gr.REGIOES.values():
        uniao |= m
    resto = gr.T & ~cv2.dilate(uniao, gr.elipse(15))
    return cv2.connectedComponents(resto)[1]


SOLTAS = soltas()


def ilha(x, y):
    """A ilhota solta mais perto do ponto, a até 20 px dele."""
    janela = SOLTAS[y - 20 : y + 21, x - 20 : x + 21]
    ys, xs = np.nonzero(janela)
    assert len(xs), f"nenhuma ilha solta perto de {x},{y}"
    i = np.argmin((xs - 20) ** 2 + (ys - 20) ** 2)
    return ((SOLTAS == janela[ys[i], xs[i]]) * 255).astype(np.uint8)


def proporcao(w, h):
    """As três proporções que o ChatGPT gera: deitada, em pé ou quadrada."""
    r = w / h
    if r > 1.25:
        return LADO, LADO * 2 // 3
    if r < 0.8:
        return LADO * 2 // 3, LADO
    return LADO, LADO


def montar():
    ENVIAR.mkdir(parents=True, exist_ok=True)
    todas = np.zeros_like(gr.T)
    for m in gr.REGIOES.values():
        todas |= sem_buracos(m)

    pecas = []
    for p in PECAS:
        nucleo = np.zeros_like(gr.T)
        for r in p["regioes"]:
            nucleo |= sem_buracos(gr.REGIOES[r])
        for x, y in p["ilhas"]:
            nucleo |= sem_buracos(ilha(x, y))

        # A sobra: só terra da mesma massa (a vizinha de emenda), logo além
        # da borda do núcleo. Ilha de outra peça, mesmo perto, não entra.
        mesma = np.isin(gr.ROTULO, np.unique(gr.ROTULO[(nucleo > 0) & (gr.ROTULO > 0)]))
        vizinha = todas & (mesma * 255).astype(np.uint8)
        recorte = nucleo | (cv2.dilate(nucleo, gr.elipse(SOBRA * 2 + 1)) & vizinha)
        x, y, w, h = cv2.boundingRect(recorte)
        cw, ch = proporcao(w, h)
        escala = min(cw / w, ch / h) * (1 - 2 * MARGEM)
        ox = (cw - w * escala) / 2
        oy = (ch - h * escala) / 2

        # Leva o pedaço do mapa para o quadro: a mesma conta de ida que a
        # montagem vai desfazer na volta
        A = np.float32([[escala, 0, ox - x * escala], [0, escala, oy - y * escala]])
        rgb = cv2.warpAffine(IM, A, (cw, ch), flags=cv2.INTER_LANCZOS4)
        alfa = cv2.warpAffine(recorte, A, (cw, ch), flags=cv2.INTER_LINEAR)
        alfa = cv2.GaussianBlur(alfa, (0, 0), escala * 0.6)
        Image.fromarray(np.dstack([rgb, alfa])).save(ENVIAR / f"{p['chave']}.png", optimize=True)

        pecas.append(
            {
                "chave": p["chave"],
                "nome": p["nome"],
                "quadro": [cw, ch],
                "escala": round(escala, 5),
                "origem": [round(ox - x * escala, 3), round(oy - y * escala, 3)],
                "caixa": [x, y, w, h],
            }
        )
        print(f"{p['chave']:>15}: {w}x{h} px no mapa → {cw}x{ch} (×{escala:.2f})")

    (AQUI / "continentes.json").write_text(
        json.dumps({"mapa": [W, H], "pecas": pecas}, ensure_ascii=False, indent=2) + "\n"
    )
    pagina(pecas)


def pagina(pecas):
    cartoes = []
    for i, (p, d) in enumerate(zip(PECAS, pecas), 1):
        prompt = f"{ESTILO}\n\nThis piece: {p['descricao']}"
        forma = "deitada (3:2)" if d["quadro"][0] > d["quadro"][1] else (
            "em pé (2:3)" if d["quadro"][0] < d["quadro"][1] else "quadrada")
        cartoes.append(f"""
  <li class="peca">
    <img src="enviar/{p['chave']}.png" alt="{html.escape(p['nome'])}">
    <div>
      <h2>{i}. {html.escape(p['nome'])}</h2>
      <p class="meta">Anexe <code>enviar/{p['chave']}.png</code> · proporção {forma} ·
        salve a resposta como <code>continente-{p['chave']}.png</code></p>
      <textarea readonly rows="7">{html.escape(prompt)}</textarea>
      <button type="button" class="copiar">Copiar prompt</button>
    </div>
  </li>""")
    (KIT / "COMO-USAR.html").write_text(f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mapa por Partes</title>
<style>
  :root {{ --fundo:#1b140d; --papel:#f6efdc; --tinta:#2b1d10; --suave:#6b5138; --ouro:#b8912c; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--fundo); color:var(--tinta); font:15px/1.55 Georgia,serif; }}
  main {{ max-width:1000px; margin:0 auto; padding:24px 16px 64px; }}
  h1 {{ color:var(--papel); margin:0 0 6px; }}
  .sub {{ color:#cbb88f; margin:0 0 20px; font-style:italic; }}
  .passos {{ background:var(--papel); border-radius:6px; padding:14px 18px; margin-bottom:20px; }}
  .passos ol {{ margin:6px 0 0; padding-left:20px; }}
  code {{ background:#e7dcc0; padding:1px 5px; border-radius:3px; font-size:.9em; }}
  ul {{ list-style:none; margin:0; padding:0; display:grid; gap:14px; }}
  .peca {{ background:var(--papel); border-radius:6px; padding:14px; display:grid;
    grid-template-columns:220px 1fr; gap:16px; align-items:start; }}
  .peca img {{ width:100%; border-radius:4px; background:
    repeating-conic-gradient(#d8ccb0 0 25%, #efe6d0 0 50%) 0 0/16px 16px; }}
  h2 {{ margin:0; font-size:1.2rem; }}
  .meta {{ color:var(--suave); margin:4px 0 8px; font-size:.9rem; }}
  textarea {{ width:100%; font:13px/1.45 ui-monospace,monospace; padding:8px; border:1px solid #d3c49e;
    border-radius:4px; background:#fffaf0; color:var(--tinta); resize:vertical; }}
  button {{ margin-top:6px; font:inherit; font-size:.85rem; padding:6px 14px; min-height:36px; cursor:pointer;
    border:1px solid var(--ouro); background:transparent; color:#7a5a14; border-radius:4px; }}
  button.ok {{ background:var(--ouro); color:#fff; }}
  @media (max-width:640px) {{ .peca {{ grid-template-columns:1fr; }} }}
</style>
</head>
<body>
<main>
  <h1>O mapa por partes</h1>
  <p class="sub">Terras de Mitrael · {len(pecas)} peças para repintar no ChatGPT</p>
  <div class="passos">
    <strong>Como fazer</strong>
    <ol>
      <li>Comece por <strong>uma peça só</strong>, de teste. Se o resultado sair bom, siga com as outras na mesma conversa, para o estilo ficar igual.</li>
      <li>Anexe a imagem da peça (está na pasta <code>enviar</code>, ao lado desta página) e cole o prompt dela.</li>
      <li>Confira se a resposta veio <strong>com fundo transparente</strong> e com a mesma forma de costa. Se vier com fundo, peça de novo: <em>"same image, transparent background, land only"</em>.</li>
      <li>Salve em <code>Documents/Artes prontas/mapa</code> com o nome indicado, como <code>continente-tundra.png</code>.</li>
      <li>Avise o Claude: ele encaixa cada peça no lugar, pinta o oceano e monta o mapa maior.</li>
    </ol>
  </div>
  <ul>{''.join(cartoes)}
  </ul>
</main>
<script>
  for (const b of document.querySelectorAll("button.copiar")) {{
    b.onclick = async () => {{
      const t = b.previousElementSibling;
      try {{ await navigator.clipboard.writeText(t.value); }} catch {{ t.select(); document.execCommand("copy"); }}
      b.textContent = "Copiado"; b.classList.add("ok");
      setTimeout(() => {{ b.textContent = "Copiar prompt"; b.classList.remove("ok"); }}, 1200);
    }};
  }}
</script>
</body>
</html>
""")
    print(KIT / "COMO-USAR.html")


if __name__ == "__main__":
    montar()
