# Terras de Mitrael

Site do cenário autoral de RPG de mesa **Terras de Mitrael**, em fantasia
medieval, jogado com as regras de D&D 5.5e.

**No ar:** https://terrasmitrael.netlify.app/

---

## Como editar o conteúdo

Toda a lore fica em arquivos de texto na pasta `content/`. **Não é preciso
mexer em código para editar, adicionar ou remover conteúdo.**

```
content/
├── locais/       um arquivo por local do continente
├── eventos/      a Grande Guerra Leviana e o que vier depois
└── personagens/  as fichas e biografias
```

Cada arquivo tem duas partes: um bloco `meta` no topo, com os dados da entrada
(nome, resumo, imagem), e o texto abaixo, escrito em Markdown comum.

### Adicionar um local novo

1. Copie um arquivo existente de `content/locais/` e mude o nome
2. Edite o `meta` e escreva o texto
3. Abra `src/lib/locais.ts`, importe o arquivo novo e acrescente-o à lista

O mesmo vale para eventos (`src/lib/eventos.ts`) e personagens
(`src/lib/personagens.ts`).

### Adicionar um personagem atual

Nos arquivos de `content/personagens/`, o campo `originHero` separa as duas
gerações:

- `originHero: true` marca a primeira geração, cujas fichas nasceram sob o
  sistema de regras próprio da casa e precisam de calibração
- `originHero: false` marca personagens criados já em D&D 5.5e

A seção "Personagens atuais" aparece sozinha assim que existir o primeiro
personagem com `false`.

---

## Rodar na sua máquina

```bash
npm install
npm run dev
```

Depois abra http://localhost:3000

Para gerar a versão final, a mesma que vai para o ar:

```bash
npm run build
```

O resultado fica na pasta `out/`.

---

## Como o site é feito

| Ferramenta | Papel |
|---|---|
| Next.js 16 | Monta as páginas. Gera o site como arquivos estáticos, sem servidor |
| Tailwind CSS 4 | Cores, espaçamentos e formas |
| Motion | Animações e transições |
| Howler.js | Efeitos sonoros |
| MDX | Permite escrever a lore em texto comum |

Publicado no Netlify, com build automático a cada envio para a `main`.

### Decisões que valem conhecer

- **As texturas de madeira, pergaminho e tecido são feitas em CSS**, sem
  nenhuma imagem. Custo zero de download.
- **As fontes são servidas pelo próprio site**, sem chamadas ao Google.
- **O trailer do YouTube só carrega depois do clique**, o que evita cerca de
  1 MB de scripts e cookies de rastreamento para quem não vai assistir.
- **O som começa sempre desligado** e tem botão sempre visível.
- **Nenhuma requisição a terceiros** é feita ao abrir o site.

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/CONTEUDO-ORIGINAL.md`](docs/CONTEUDO-ORIGINAL.md) | Todo o conteúdo do site anterior, preservado em texto puro |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Paleta, tipografia, componentes e regras de acessibilidade |
| [`docs/LORE-EXPANDIDA.md`](docs/LORE-EXPANDIDA.md) | O que é do site original e o que foi escrito na reconstrução |
| [`docs/SONS-NECESSARIOS.md`](docs/SONS-NECESSARIOS.md) | Especificação dos efeitos sonoros que faltam |

---

## Histórico

O site anterior, escrito à mão em HTML e Bootstrap entre 2020 e 2024, está
preservado na tag `v1-arquivo-historico`:

```bash
git checkout v1-arquivo-historico
```

Desenvolvido e mestrado por [Arion Gresser](https://github.com/ArionGresser).
Mapa de Mitrael criado por Lucas Monteiro.
