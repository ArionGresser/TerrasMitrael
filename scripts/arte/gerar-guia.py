"""
Monta scripts/arte/GUIA-DE-ARTES.html: uma página só, para abrir no
navegador, com cada arte do site (as magias inclusive), o nome do arquivo e
o prompt para gerar, separadas por seção e com uma caixinha para marcar o
que já foi feito.

    python3 scripts/arte/gerar-guia.py

As artes que já estão no site saem marcadas sozinhas. Rode de novo depois
de importar artes novas, para atualizar.
"""

import json
from pathlib import Path

from catalogo import catalogo

SAIDA = Path(__file__).resolve().parent / "GUIA-DE-ARTES.html"

PAGINA = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Guia de Artes</title>
<style>
  :root {
    --fundo: #efe4c8; --papel: #fbf6e8; --tinta: #2b1d10; --suave: #6b5138;
    --linha: #d9c79d; --ouro: #96741f; --vermelho: #8b1e1e; --feito: #e7efd9; --espera: #f6e7c4; --ambar: #9a6412;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --fundo: #1a120b; --papel: #241a10; --tinta: #f1e6cc; --suave: #b9a27e;
      --linha: #4a3822; --ouro: #d4ae4f; --vermelho: #e0796f; --feito: #22301a; --espera: #3a2a12; --ambar: #e8b25a;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--fundo); color: var(--tinta);
    font: 15px/1.5 Georgia, "Times New Roman", serif; }
  main { max-width: 960px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 1.8rem; margin: 0 0 4px; letter-spacing: .02em; }
  .sub { color: var(--suave); margin: 0 0 18px; font-style: italic; }
  .passos { background: var(--papel); border: 1px solid var(--linha); border-radius: 6px;
    padding: 12px 16px; margin-bottom: 18px; }
  .passos ol { margin: 6px 0 0; padding-left: 20px; }
  .passos code { background: var(--fundo); padding: 1px 5px; border-radius: 3px; }
  .total { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .barra { flex: 1; height: 10px; background: var(--papel); border: 1px solid var(--linha);
    border-radius: 6px; overflow: hidden; }
  .barra span { display: block; height: 100%; background: var(--ouro); }
  nav { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  nav button { font: inherit; font-size: .9rem; cursor: pointer; padding: 6px 12px;
    border: 1px solid var(--linha); background: var(--papel); color: var(--tinta);
    border-radius: 999px; min-height: 36px; }
  nav button[aria-pressed="true"] { background: var(--tinta); color: var(--papel);
    border-color: var(--tinta); }
  nav small { opacity: .7; margin-left: 4px; }
  .filtros { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center;
    margin-bottom: 14px; }
  .filtros input[type=search] { flex: 1; min-width: 220px; font: inherit; padding: 8px 10px;
    border: 1px solid var(--linha); border-radius: 6px; background: var(--papel);
    color: var(--tinta); min-height: 40px; }
  ul { list-style: none; margin: 0; padding: 0; }
  li.arte { background: var(--papel); border: 1px solid var(--linha); border-radius: 6px;
    padding: 12px 14px; margin-bottom: 10px; }
  li.arte.feita { background: var(--feito); }
  li.arte.feita .prompt { opacity: .55; }
  li.arte.enviada { background: var(--espera); }
  .selo.aguardando { border-color: var(--ambar); color: var(--ambar); }
  .falta { background: var(--papel); border: 1px solid var(--linha); border-radius: 6px;
    padding: 10px 16px; margin-bottom: 14px; }
  .falta summary { cursor: pointer; font-weight: bold; min-height: 32px; display: flex; align-items: center; }
  .falta ul { margin: 6px 0 4px; }
  .falta li { padding: 3px 0; border-bottom: 1px dashed var(--linha); font-size: .92rem; }
  .falta li:last-child { border: 0; }
  .falta em { color: var(--ambar); font-style: normal; }
  .falta small { color: var(--suave); }
  .filtros select { font: inherit; padding: 6px 8px; min-height: 40px; border: 1px solid var(--linha);
    border-radius: 6px; background: var(--papel); color: var(--tinta); }
  #desmarcar { font: inherit; font-size: .85rem; cursor: pointer; padding: 6px 12px; min-height: 36px;
    border: 1px solid var(--ambar); background: transparent; color: var(--ambar); border-radius: 4px; }
  .topo { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .topo label { display: flex; align-items: center; gap: 10px; cursor: pointer;
    font-weight: bold; font-size: 1.05rem; flex: 1; min-width: 200px; }
  .topo input[type=checkbox] { width: 22px; height: 22px; accent-color: var(--ouro); }
  .selo { font-size: .75rem; border: 1px solid var(--linha); border-radius: 999px;
    padding: 1px 8px; color: var(--suave); white-space: nowrap; }
  .selo.site { border-color: var(--ouro); color: var(--ouro); }
  .arquivo { display: flex; align-items: center; gap: 8px; margin: 8px 0 6px;
    flex-wrap: wrap; }
  .arquivo code { font-size: .95rem; background: var(--fundo); padding: 3px 8px;
    border-radius: 4px; word-break: break-all; }
  .prompt { margin: 0; color: var(--suave); font-size: .9rem; }
  button.copiar { font: inherit; font-size: .8rem; cursor: pointer; padding: 4px 10px;
    border: 1px solid var(--ouro); background: transparent; color: var(--ouro);
    border-radius: 4px; min-height: 32px; }
  button.copiar.ok { background: var(--ouro); color: var(--papel); }
  .linha-prompt { display: flex; gap: 10px; align-items: flex-start; }
  .linha-prompt p { flex: 1; }
  .planilha { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center;
    background: var(--papel); border: 1px solid var(--linha); border-radius: 6px;
    padding: 10px 14px; margin-bottom: 14px; }
  .planilha select { font: inherit; padding: 4px 8px; min-height: 36px; margin-left: 6px;
    border: 1px solid var(--linha); border-radius: 4px; background: var(--fundo); color: var(--tinta); }
  #baixar { font: inherit; cursor: pointer; padding: 6px 16px; min-height: 40px; border-radius: 4px;
    border: 1px solid var(--tinta); background: var(--tinta); color: var(--papel); }
  #baixar:disabled { opacity: .5; cursor: default; }
  .prompt { white-space: pre-line; }
  .vazio { text-align: center; color: var(--suave); font-style: italic; padding: 24px; }
  :focus-visible { outline: 2px solid var(--ouro); outline-offset: 2px; }
</style>
</head>
<body>
<main>
  <h1>Guia de Artes</h1>
  <p class="sub">Terras de Mitrael · todas as artes do site, das magias aos monstros</p>

  <div class="passos">
    <strong>Como fazer</strong>
    <ol>
      <li>Copie o <em>prompt</em> e gere a imagem. Se a ferramenta deixar, escolha a proporção indicada (16:9 deitada ou quadrada).</li>
      <li>Salve na pasta <code>Documents/Artes prontas</code> com o nome mostrado. Pode ser <code>.png</code> ou <code>.jpg</code>.</li>
      <li>Marque a caixinha quando mandar para o ChatGPT: ela fica <em>enviada, aguardando</em> até a arte chegar ao site. A marca fica guardada neste navegador.</li>
      <li>Quando juntar algumas, avise o Claude para subir. As que já estão no site aparecem com o selo <em>no site</em>.</li>
    </ol>
    <p><strong>Muitas de uma vez:</strong> em cada aba, baixe a planilha com as que faltam, anexe no ChatGPT e cole a mensagem pronta. Cada linha já traz o prompt inteiro e o nome do arquivo.</p>
  </div>

  <div class="total"><strong id="contagem"></strong><div class="barra"><span id="barra"></span></div></div>

  <details class="falta" id="falta" open>
    <summary>O que falta</summary>
    <ul id="resumo"></ul>
  </details>

  <nav id="abas" aria-label="Seções"></nav>

  <div class="filtros">
    <input type="search" id="busca" placeholder="Procurar pelo nome, em português ou pelo arquivo" aria-label="Procurar">
    <label>Mostrar
      <select id="mostrar">
        <option value="fora" selected>Ainda não estão no site</option>
        <option value="faltam">Só as que faltam enviar</option>
        <option value="aguardando">Só as enviadas, aguardando</option>
        <option value="site">Só as que estão no site</option>
        <option value="todas">Todas</option>
      </select>
    </label>
  </div>

  <div class="planilha">
    <label>Quantas por planilha
      <select id="lote">
        <option value="10">10</option>
        <option value="20" selected>20</option>
        <option value="50">50</option>
        <option value="0">Todas</option>
      </select>
    </label>
    <button type="button" id="baixar">Baixar planilha</button>
    <button type="button" id="mensagem" class="copiar">Copiar mensagem para o ChatGPT</button>
    <button type="button" id="desmarcar" hidden>Desmarcar as que não chegaram</button>
  </div>

  <ul id="lista"></ul>
</main>

<script>
const SECOES = __DADOS__;
const CHAVE = "terras-mitrael-guia-de-artes";

function lerMarcas() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
}
function salvarMarcas() {
  try { localStorage.setItem(CHAVE, JSON.stringify(marcas)); } catch {}
}
let marcas = lerMarcas();
let atual = SECOES[0].chave;
try { atual = localStorage.getItem(CHAVE + ":aba") || atual; } catch {}
if (!SECOES.some(s => s.chave === atual)) atual = SECOES[0].chave;

// Três estados: no site (veio de verdade), enviada (marcada aqui, ainda não
// chegou) e falta. Só as que faltam entram na planilha.
const noSite = a => a.pronta;
const enviada = a => !a.pronta && !!marcas[a.entrega];
const feita = a => noSite(a) || enviada(a);
const estado = a => noSite(a) ? "site" : enviada(a) ? "aguardando" : "faltam";
const normalizar = t => t.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();

async function copiar(texto, botao) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const area = document.createElement("textarea");
    area.value = texto; document.body.appendChild(area); area.select();
    document.execCommand("copy"); area.remove();
  }
  const antes = botao.textContent;
  botao.textContent = "Copiado"; botao.classList.add("ok");
  setTimeout(() => { botao.textContent = antes; botao.classList.remove("ok"); }, 1200);
}

function contagens() {
  const todas = SECOES.flatMap(s => s.artes);
  const site = todas.filter(noSite).length;
  const espera = todas.filter(enviada).length;
  document.getElementById("contagem").textContent =
    `${site} de ${todas.length} no site` + (espera ? ` · ${espera} aguardando` : "");
  document.getElementById("barra").style.width = `${(site / todas.length) * 100}%`;
  resumo();
}

/** Por aba: quantas faltam e quais estão aguardando, com os nomes quando são poucas. */
function resumo() {
  const ul = document.getElementById("resumo");
  ul.innerHTML = "";
  for (const s of SECOES) {
    const faltam = s.artes.filter(a => estado(a) === "faltam");
    const espera = s.artes.filter(enviada);
    if (!faltam.length && !espera.length) continue;
    const li = document.createElement("li");
    const nomes = l => l.map(a => a.nome.split(" (")[0]).join(", ");
    const partes = [];
    if (faltam.length) partes.push(`faltam ${faltam.length}` + (faltam.length <= 6 ? ` (${nomes(faltam)})` : ""));
    if (espera.length) partes.push(`<em>aguardando ${espera.length}</em>` + (espera.length <= 6 ? ` (${nomes(espera)})` : ""));
    li.innerHTML = `<strong></strong>: ${partes.join(" · ")} <small>de ${s.artes.length}</small>`;
    li.querySelector("strong").textContent = s.titulo;
    ul.appendChild(li);
  }
  if (!ul.children.length) ul.innerHTML = "<li>Nada faltando. Todas as artes estão no site.</li>";
}

function abas() {
  const nav = document.getElementById("abas");
  nav.innerHTML = "";
  for (const s of SECOES) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-pressed", s.chave === atual);
    const site = s.artes.filter(noSite).length;
    const espera = s.artes.filter(enviada).length;
    b.innerHTML = `${s.titulo}<small>${site}/${s.artes.length}${espera ? ` · ${espera} aguardando` : ""}</small>`;
    b.onclick = () => {
      atual = s.chave;
      try { localStorage.setItem(CHAVE + ":aba", atual); } catch {}
      tudo();
    };
    nav.appendChild(b);
  }
}

function lista() {
  const secao = SECOES.find(s => s.chave === atual);
  const busca = normalizar(document.getElementById("busca").value.trim());
  const mostrar = document.getElementById("mostrar").value;
  const ul = document.getElementById("lista");
  ul.innerHTML = "";
  const artes = secao.artes.filter(a =>
    (!busca || normalizar(a.nome).includes(busca) || a.entrega.includes(busca)) &&
    (mostrar === "todas" || estado(a) === mostrar || (mostrar === "fora" && !noSite(a))));
  if (artes.length === 0) {
    ul.innerHTML = '<li class="vazio">Nada por aqui com esse filtro.</li>';
    return;
  }
  for (const a of artes) {
    const li = document.createElement("li");
    li.className = "arte" + (noSite(a) ? " feita" : enviada(a) ? " enviada" : "");
    const id = "c-" + a.entrega;
    li.innerHTML = `
      <div class="topo">
        <label for="${id}"><input type="checkbox" id="${id}"> <span></span></label>
        <span class="selo">${a.formato === "largo" ? "16:9 deitada" : "quadrada"}</span>
        ${a.pronta ? '<span class="selo site">no site</span>' : enviada(a) ? '<span class="selo aguardando">enviada, aguardando</span>' : ""}
      </div>
      <div class="arquivo"><code></code><button type="button" class="copiar">Copiar nome</button></div>
      <div class="linha-prompt"><p class="prompt"></p><button type="button" class="copiar">Copiar prompt</button></div>`;
    li.querySelector("label span").textContent = a.nome;
    li.querySelector("code").textContent = a.entrega + ".png";
    li.querySelector(".prompt").textContent = a.prompt;
    const caixa = li.querySelector("input");
    caixa.checked = feita(a);
    caixa.disabled = a.pronta;
    caixa.onchange = () => {
      if (caixa.checked) marcas[a.entrega] = true; else delete marcas[a.entrega];
      salvarMarcas();
      tudo();
    };
    const [botaoNome, botaoPrompt] = li.querySelectorAll("button.copiar");
    botaoNome.onclick = () => copiar(a.entrega, botaoNome);
    botaoPrompt.onclick = () => copiar(a.prompt, botaoPrompt);
    ul.appendChild(li);
  }
}

const MENSAGEM =
  "Anexei uma planilha. Gere uma imagem para cada linha, uma de cada vez e na ordem, " +
  "seguindo à risca o prompt da coluna \\"prompt\\" (formato, estilo e o que evitar). " +
  "Entregue cada imagem em PNG com o nome exato da coluna \\"arquivo\\". " +
  "Não escreva nenhum texto dentro das imagens. Se parar no meio, continue de onde parou quando eu disser \\"continue\\".";

function pendentes() {
  const secao = SECOES.find(s => s.chave === atual);
  const todas = secao.artes.filter(a => !feita(a));
  const lote = Number(document.getElementById("lote").value);
  return { secao, todas, lote: lote ? todas.slice(0, lote) : todas };
}

function botaoBaixar() {
  const { secao, todas, lote } = pendentes();
  const espera = secao.artes.filter(enviada).length;
  const d = document.getElementById("desmarcar");
  d.hidden = espera === 0;
  d.textContent = `Desmarcar as ${espera} que não chegaram`;
  const b = document.getElementById("baixar");
  b.disabled = lote.length === 0;
  b.textContent = lote.length
    ? `Baixar planilha (${lote.length} de ${todas.length} que faltam)`
    : "Nada faltando nesta aba";
}

function celula(t) { return '"' + String(t).replace(/"/g, '""') + '"'; }

function baixar() {
  const { secao, lote } = pendentes();
  if (!lote.length) return;
  const linhas = [["numero", "arquivo", "nome", "proporcao", "prompt"]];
  lote.forEach((a, i) => linhas.push([
    i + 1, a.entrega + ".png", a.nome,
    a.formato === "largo" ? "deitada 1536x1024" : "quadrada 1024x1024", a.prompt,
  ]));
  // O BOM no começo faz o Excel e o Numbers lerem os acentos certo
  const csv = "\\uFEFF" + linhas.map(l => l.map(celula).join(",")).join("\\r\\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const data = new Date().toISOString().slice(0, 10);
  link.download = `artes-${secao.chave}-${data}.csv`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  // Marca como enviadas, para a próxima planilha trazer as seguintes
  if (confirm(`Marcar estas ${lote.length} como enviadas? Assim a próxima planilha começa nas seguintes.`)) {
    for (const a of lote) marcas[a.entrega] = true;
    salvarMarcas();
    tudo();
  }
}

function desmarcar() {
  const secao = SECOES.find(s => s.chave === atual);
  const espera = secao.artes.filter(enviada);
  if (!espera.length) return;
  if (!confirm(`Desmarcar as ${espera.length} enviadas desta aba que ainda não estão no site? Elas voltam para a próxima planilha.`)) return;
  for (const a of espera) delete marcas[a.entrega];
  salvarMarcas();
  tudo();
}

function tudo() { contagens(); abas(); lista(); botaoBaixar(); }
document.getElementById("desmarcar").addEventListener("click", desmarcar);
document.getElementById("lote").addEventListener("change", botaoBaixar);
document.getElementById("baixar").addEventListener("click", baixar);
document.getElementById("mensagem").addEventListener("click", e => copiar(MENSAGEM, e.currentTarget));
document.getElementById("busca").addEventListener("input", lista);
document.getElementById("mostrar").addEventListener("change", lista);
tudo();
</script>
</body>
</html>
"""


# ---------- O prompt completo ----------
# A planilha vai sozinha para o ChatGPT, então cada linha precisa trazer tudo:
# o que é a imagem, onde ela aparece, o formato, o estilo e o que evitar.

CONTEXTO = {
    "magias-icones": (
        "the icon of the spell \"{nome}\" for the spell list of a D&D website. It is shown "
        "very small (128 px) in the list and at 512 px on the spell page, so it needs ONE bold "
        "central magical symbol with a strong, simple silhouette and high contrast, glowing "
        "against a dark background and filling about 70% of the frame. It must match the rest "
        "of the icon set: a glowing magical emblem, painterly, on a dark vignette"
    ),
    "magias-ilustracoes": (
        "the illustration at the top of the page of the spell \"{nome}\", showing the spell "
        "being cast and its effect clearly"
    ),
    "livro": "the cover card of the \"{nome}\" chapter of the rules book on the website",
    "especies": "the portrait at the top of the page of the D&D species \"{nome}\"",
    "classes": "the cover art at the top of the page of the D&D class \"{nome}\"",
    "antecedentes": "the illustration of the character background \"{nome}\"",
    "talentos": "the illustration of the feat \"{nome}\"",
    "equipamento": "the art of \"{nome}\" in the equipment chapter",
    "itens": (
        "the icon of the magic item \"{nome}\" for its page and for the item list, where it "
        "is shown at 160 px, so the object must be clear and readable at that size"
    ),
    "monstros": "the illustration at the top of the bestiary page of \"{nome}\"",
    "fichas": (
        "the icon of \"{nome}\" on a character sheet, shown at 64 px, so it needs one bold, "
        "simple symbol readable at that size"
    ),
}

FORMATO = {
    "quadrado": (
        "Square 1:1, 1024 x 1024 px. One subject, centered, filling most of the frame."
    ),
    "largo": (
        "Landscape, 1536 x 1024 px. It is cropped to 16:9 and also to a small centered "
        "square thumbnail, so keep the main subject in the middle of the image and nothing "
        "important near the edges."
    ),
}

ESTILO = (
    "Painterly hand-painted digital fantasy art, like a premium modern D&D sourcebook "
    "illustration: rich colors, readable dramatic lighting, fine detail, medieval fantasy "
    "setting. It must look like part of the same collection as the other images."
)

EVITAR = (
    "any text, letters, numbers or runes that look like writing, captions, logos, "
    "watermark, signature, border, frame, UI elements, collage or multiple panels. "
    "Deliver one single image."
)


def completo(secao, a):
    nome = a["nome"].split(" (")[0]
    return (
        f"Create ONE image for the website of the tabletop RPG setting \"Terras de Mitrael\". "
        f"File name: {a['entrega']}.png\n"
        f"What it is: {CONTEXTO[secao].format(nome=nome)}.\n"
        f"Subject: {a['prompt']}.\n"
        f"Format: {FORMATO[a['formato']]}\n"
        f"Style: {ESTILO}\n"
        f"Avoid: {EVITAR}"
    )


def gerar():
    secoes = [
        {
            "chave": chave,
            "titulo": titulo,
            "artes": [
                {
                    **{k: a[k] for k in ("nome", "entrega", "formato", "pronta")},
                    "prompt": completo(chave, a),
                }
                for a in artes
            ],
        }
        for chave, titulo, artes in catalogo()
    ]
    dados = json.dumps(secoes, ensure_ascii=False).replace("</", "<\\/")
    SAIDA.write_text(PAGINA.replace("__DADOS__", dados))
    total = sum(len(s["artes"]) for s in secoes)
    prontas = sum(a["pronta"] for s in secoes for a in s["artes"])
    print(f"{SAIDA} ({prontas} de {total} prontas)")


if __name__ == "__main__":
    gerar()
