# Músicas necessárias

O sistema de música está pronto e funcionando. Faltam apenas os arquivos.

**O site funciona normalmente sem eles.** Se um arquivo não existir, aquela
seção fica em silêncio, sem erro e sem quebrar nada. Você pode enviar uma
música de cada vez, na ordem que quiser.

## Onde colocar

Crie a pasta `public/musicas/` e coloque os arquivos lá, com exatamente estes
nomes:

```
public/musicas/tema.m4a
public/musicas/locais.m4a
public/musicas/eventos.m4a
public/musicas/personagens.m4a
```

## Uma faixa por seção

| Arquivo | Toca em | Clima |
|---|---|---|
| `tema.m4a` | Início e Mapa | Convite. Medieval calmo, harpa ou alaúde, sem urgência nenhuma |
| `locais.m4a` | Todas as páginas de locais | Paisagem aberta. Cordas e sopros leves, contemplativo, de quem está viajando |
| `eventos.m4a` | Guerra Leviana e o que vier | Peso. Cordas graves e tambor baixo ao fundo, tenso sem virar trilha de ação |
| `personagens.m4a` | Todas as páginas de personagem | Intimidade. Poucos instrumentos, quase silêncio, para não competir com a narração |

## O que evitar

- **Voz cantada.** O site é para ler. Letra em qualquer idioma rouba a atenção
  das palavras na tela.
- **Melodia marcante.** Ambiente é fundo. Se a pessoa sair assobiando, a faixa
  está chamando atenção demais.
- **Mudanças bruscas.** Nada de silêncio no meio nem de entrada súbita de
  percussão. A faixa fica em repetição, então qualquer solavanco aparece.

## Formato

- **Duração de 2 a 4 minutos**, porque a faixa fica em repetição
- **A repetição precisa ser limpa.** O fim tem que emendar no começo sem
  estalo. Muitas faixas de ambiente já são feitas assim e dizem isso na
  descrição
- **Até 2,5 MB por arquivo**, para as quatro somarem menos de 10 MB
- Baixe em qualquer formato. A conversão é feita depois, no projeto

## Licença

Precisa ser música livre para uso. Onde procurar:

| Onde | Observação |
|---|---|
| pixabay.com/music | Livre, não pede crédito |
| freemusicarchive.org | Filtre por licença antes de baixar |
| incompetech.com | Ótimo acervo medieval, porém exige crédito ao autor |

Se a faixa exigir crédito, é só me avisar que eu coloco o nome do autor no
rodapé do site.

## Como a música se comporta

1. **Nada é baixado antes de alguém ligar o som.** Quem nunca clicar no botão
   continua com o site tão leve quanto hoje.
2. **A faixa atravessa a troca de página.** Indo de um local para outro a
   música continua sem cortar. Ela só troca ao mudar de seção, e a troca é
   feita com as duas faixas se cruzando devagar.
3. **Mutar pausa, desmutar continua** do mesmo ponto, em vez de recomeçar.
4. **A música abaixa sozinha durante as narrações** dos personagens e volta ao
   volume normal quando a narração termina.
5. **Depois de recarregar a página**, o navegador proíbe qualquer som que a
   pessoa não tenha pedido naquele carregamento. É regra do navegador. A
   música volta sozinha no primeiro toque que ela der em qualquer lugar.

O volume de repouso e o volume abafado ficam em `src/lib/musica.ts`, nas
constantes `VOLUME` e `VOLUME_ABAFADO`. Para trocar qual faixa toca em cada
seção, a lista está na mesma pasta, em `ARQUIVOS`.
