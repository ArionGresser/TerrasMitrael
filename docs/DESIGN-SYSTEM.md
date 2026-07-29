# Design System — Terras de Mitrael

Referência rápida da identidade visual. O conceito é **pergaminhos e mapas
antigos sobre uma mesa de madeira nobre, com tecido puxado nas bordas**.

## Cores

Definidas em `app/globals.css`, dentro de `@theme`. Usar sempre os tokens,
nunca cores soltas.

| Token | Uso |
|---|---|
| `madeira-500…950` | O tampo da mesa, o fundo de tudo |
| `pergaminho-50…400` | A superfície de leitura |
| `dourado-300…600` | Ornamentos, bordas, detalhes |
| `heraldico-vermelho` | Ações principais, o selo do menu |
| `heraldico-verde` | Confirmações, o tecido das bordas |
| `tinta-500…900` | Texto sobre o pergaminho |

### Contraste verificado

| Combinação | Razão | Situação |
|---|---|---|
| `tinta-900` sobre pergaminho | 13.9:1 | ✅ texto principal |
| `tinta-700` sobre pergaminho | 9.8:1 | ✅ texto secundário |
| `tinta-500` sobre pergaminho | 6.2:1 | ✅ legendas |
| `heraldico-vermelho` sobre pergaminho | 8.6:1 | ✅ |
| `heraldico-verde` sobre pergaminho | 8.2:1 | ✅ |
| `pergaminho-100` sobre madeira | 15.0:1 | ✅ |
| `dourado-600` sobre pergaminho | 3.7:1 | ⚠️ **só ornamento** |

> ⚠️ **Regra:** o dourado nunca carrega texto que precise ser lido. Ele existe
> para ornamentos (`✦`), bordas e filetes — sempre com `aria-hidden`.

## Tipografia

| Fonte | Classe | Onde usar |
|---|---|---|
| **Uncial Antiqua** | `font-brasao` | Só o nome do site e títulos curtos de grande destaque |
| **Cinzel** | `font-titulo` | Todos os títulos de seção e capítulo |
| **Lora** | `font-corpo` | Todo o texto corrido |

A uncial é marcante mas cansa em texto longo — por isso fica restrita a
poucas palavras. Componentes prontos em `src/components/ui/Titulo.tsx`:
`TituloBrasao`, `TituloSecao`, `TituloCapitulo`, `Sobretitulo`, `Ornamento`.

## Componentes

| Componente | Arquivo | Papel |
|---|---|---|
| `Mesa` | `src/components/Mesa.tsx` | Tampo, tecido nas bordas, vinheta, selo. Envolve o site todo |
| `SeloMenu` | `src/components/navegacao/SeloMenu.tsx` | Navegação: selo de cera que desenrola um pergaminho |
| `Pergaminho` | `src/components/ui/Pergaminho.tsx` | A folha onde o conteúdo é lido |
| `Botao` / `BotaoLink` | `src/components/ui/Botao.tsx` | Ações |
| `Revelar` | `src/components/ui/Revelar.tsx` | Revelação do conteúdo ao rolar |

### Pergaminho

```tsx
<Pergaminho inclinacao="esquerda" borda={2} variante="leitura">
  …conteúdo…
</Pergaminho>
```

- `variante="leitura"` — páginas de texto longo (Locais, Eventos, Personagens)
- `variante="cartao"` — blocos menores em listas e grades
- `borda={1|2|3}` — variações de borda irregular; folhas vizinhas nunca usam a mesma
- `inclinacao` — inclinação sutil, como papel largado sobre a mesa

## Texturas

Todas feitas em CSS, **sem nenhuma imagem** — custo zero de download:

- `.textura-madeira` — veios do tampo
- `.textura-pergaminho` — fibras e manchas do papel
- `.textura-tecido` — trama do tecido das bordas
- `.borda-envelhecida` — escurecimento das bordas pelo tempo
- `.selo-cera` — relevo e brilho da cera

## Regras que não se quebram

1. **Área de toque mínima de 44px** em tudo que se clica (`min-h-11`). O site é
   usado principalmente no celular.
2. **`prefers-reduced-motion` é respeitado.** O componente `Revelar` entrega o
   conteúdo estático para quem pediu menos movimento, e o CSS zera as transições.
3. **Foco visível sempre**, com contorno dourado. Existe atalho "Pular para o
   conteúdo" no início da página.
4. **Nada de rolagem horizontal.** O `body` tem `overflow-x: hidden` e o layout
   é construído a partir do celular.
5. **Elementos decorativos levam `aria-hidden`.** Ornamentos e texturas não
   devem ser anunciados por leitores de tela.
