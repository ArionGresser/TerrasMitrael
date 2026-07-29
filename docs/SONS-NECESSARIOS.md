# Sons necessários

O sistema de som está pronto e funcionando. Faltam apenas os arquivos.

**O site funciona normalmente sem eles.** Se um arquivo não existir, aquele
efeito simplesmente não toca, sem erro e sem quebrar nada. Você pode enviar um
de cada vez, na ordem que quiser.

## Onde colocar

Crie a pasta `public/sons/` e coloque os arquivos lá, com exatamente estes
nomes:

```
public/sons/pergaminho-abrir.mp3
public/sons/pergaminho-fechar.mp3
public/sons/virar-pagina.mp3
public/sons/marcador.mp3
```

## Especificação de cada som

### 1. `pergaminho-abrir.mp3`

| | |
|---|---|
| **Quando toca** | Ao tocar no selo e o menu se desenrolar |
| **Duração** | 0,4 a 0,7 segundo |
| **Descrição** | Papel grosso ou pergaminho sendo desenrolado. Um roçar seco e curto, com leve estalo no fim, como couro ou papel rígido cedendo |
| **Não deve ter** | Eco longo, música, nota musical definida |
| **Volume no site** | 35% |

### 2. `pergaminho-fechar.mp3`

| | |
|---|---|
| **Quando toca** | Ao fechar o menu |
| **Duração** | 0,3 a 0,5 segundo |
| **Descrição** | O mesmo material do anterior, porém enrolando. Mais curto e mais abafado que o de abrir, terminando seco |
| **Volume no site** | 30% |

### 3. `virar-pagina.mp3`

| | |
|---|---|
| **Quando toca** | Ao seguir qualquer link interno, ou seja, a cada troca de página |
| **Duração** | 0,3 a 0,5 segundo |
| **Descrição** | Uma folha de livro sendo virada. Precisa ser **bem discreto**: é o som mais frequente do site e não pode cansar em cinco minutos de navegação |
| **Não deve ter** | Nada percussivo, nada agudo, nada que chame atenção |
| **Volume no site** | 30% |

### 4. `marcador.mp3`

| | |
|---|---|
| **Quando toca** | Ao tocar num marcador do mapa, e uma vez ao ligar o som |
| **Duração** | 0,15 a 0,3 segundo |
| **Descrição** | Um toque curto e limpo. Pode ser madeira leve, uma pena marcando o pergaminho ou um tinido metálico bem curto |
| **Não deve ter** | Cauda longa, reverberação |
| **Volume no site** | 25% |

## Formato

- **MP3**, mono, entre 96 e 128 kbps
- Sem silêncio no começo do arquivo (atrasa a resposta ao toque)
- Normalizados entre si, para nenhum sair mais alto que os outros
- O ideal é cada arquivo ficar abaixo de 30 KB

## Depois de colocar os arquivos

Só isso. Não precisa mexer em código: o sistema detecta e passa a usar. Para
testar, abra o site, clique no botão de som no canto inferior direito e navegue.

## Como o som se comporta

1. **Começa sempre desligado.** Ninguém é surpreendido por áudio ao abrir a
   página, o que também evita o bloqueio automático dos navegadores.
2. **A escolha fica salva** no navegador de quem visita, então quem ligou uma
   vez não precisa ligar de novo a cada página.
3. **O botão fica sempre visível**, no canto oposto ao selo de navegação.
4. **Se um arquivo faltar, o site continua funcionando** em silêncio.

Se quiser trocar o volume de algum efeito, os valores estão em
`src/lib/som.ts`, na constante `VOLUMES`.
