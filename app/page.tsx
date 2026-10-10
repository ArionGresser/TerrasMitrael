import Image from "next/image";
import { novidades } from "@/lib/novidades";
import { ListaDeNovidades } from "@/components/Novidades";
import { Pergaminho } from "@/components/ui/Pergaminho";
import { Dobra } from "@/components/ui/Dobra";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoLink } from "@/components/ui/Botao";
import { Trailer } from "@/components/Trailer";
import { Rodape } from "@/components/Rodape";
import {
  TituloBrasao,
  TituloSecao,
  TituloCapitulo,
  Sobretitulo,
  Ornamento,
} from "@/components/ui/Titulo";

const PORTAIS = [
  {
    href: "/mapa/",
    nome: "Mapa",
    texto:
      "O continente inteiro diante de você: as capitais, as florestas sagradas e os lugares onde ninguém quer pisar, cada um com a sua história.",
    // Versão reduzida: o cartão mostra o mapa a 340px, e o arquivo cheio
    // de 1600px só faz sentido na página do mapa, onde há zoom.
    imagem: "/images/map-cartao.jpg",
    alt: "Mapa do continente de Mitrael",
  },
  {
    href: "/personagens/",
    nome: "Personagens",
    texto:
      "Os heróis que caminharam por estas terras, suas origens, suas escolhas e o que deixaram para trás.",
    imagem: "/images/personagens/elenco-reunido.webp",
    alt: "Os doze personagens, do elenco antigo e do novo, descansando juntos entre ruínas cobertas de musgo numa clareira ensolarada",
  },
  {
    href: "/contos/",
    nome: "Crônicas",
    texto:
      "As sessões jogadas, contadas episódio por episódio, e a história que moldou o continente, como a Grande Guerra Leviana.",
    imagem: "/images/contos/cronicas-cartao.webp",
    alt: "Uma crônica aberta sobre a mesa à luz de vela, com desenhos de aventureiros, de um castelo e de uma taverna nas páginas e um d20 preto e dourado em cima",
  },
  {
    href: "/regras/",
    nome: "Livro do Aventureiro",
    texto:
      "As regras de 2024 em português: classes, espécies, magias, itens mágicos e o bestiário, para criar um personagem ou tirar uma dúvida na mesa.",
    imagem: "/images/livro-cartao.webp",
    alt: "Um livro aberto sobre a mesa, de onde sobem, feitos de luz azul, uma espada, um escudo, um círculo de magia, uma poção, um anel e um dragão",
  },
];

export default function Home() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        {/* ---------- Abertura ----------
            O mapa do continente aberto na mesa, escurecido por uma vinheta
            forte, e o nome do mundo escrito direto sobre ele. No celular o
            mapa ocupa a largura toda e vem recortado em pé. */}
        <header className="relative -mx-4 grid aspect-[4/5] place-items-center overflow-hidden shadow-[0_14px_40px_-12px_rgba(0,0,0,0.85)] sm:mx-0 sm:aspect-[16/9] sm:rounded-sm sm:border sm:border-black/40">
          <picture>
            <source media="(min-width: 640px)" srcSet="/images/heroi-mapa-largo.webp" />
            <img
              src="/images/heroi-mapa-alto.webp"
              alt="O mapa do continente de Mitrael: as Terras de Áskar em vermelho, as Terras de Tungel ao norte, Sovara Mithr e as Terras de Mitrael a leste, e a rosa dos ventos no meio do mar"
              width={720}
              height={900}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </picture>

          {/* A vinheta: escurece as bordas e abre uma sombra no meio, atrás
              do nome, para o texto claro ler bem sobre qualquer parte do mapa */}
          <div aria-hidden className="vinheta-abertura absolute inset-0" />

          <div className="relative px-6 text-center">
            <Sobretitulo tom="claro" className="sobretitulo-abertura text-dourado-200!">
              Cenário autoral de RPG de mesa
            </Sobretitulo>
            <TituloBrasao
              tom="claro"
              className="titulo-abertura mt-3 text-[3.1rem]! sm:mt-4 sm:text-6xl! lg:text-7xl!"
            >
              Terras de
              <br />
              Mitrael
            </TituloBrasao>
            <Ornamento className="mt-5 [&_span]:text-dourado-300 sm:mt-6" />
          </div>
        </header>

        {/* ---------- Apresentação ---------- */}
        <Revelar className="mt-8">
          <Pergaminho inclinacao="direita" borda={2}>
            <TituloSecao className="text-center">Um mundo vivo</TituloSecao>

            <div className="mt-6 text-[0.95rem] leading-[1.8] sm:text-base">
              <p>
                Terras de Mitrael nasceu em 2020 como um cenário de fantasia
                medieval para ser jogado à mesa. Seis anos depois, continua
                crescendo, não por planejamento, mas porque cada campanha
                deixou alguma coisa para trás: uma cidade que antes não existia,
                um herói que virou lenda, uma guerra que ninguém conseguiu
                esquecer.
              </p>

              <Dobra previa="nenhuma" className="mt-4">
                <div className="space-y-5">
                  <p>
                    Aqui você encontra as terras que compõem o continente, os
                    eventos que moldaram sua história e os personagens que
                    caminharam por elas. Nada disso foi inventado por um autor
                    sozinho, em silêncio: foi construído em sessões de jogo, por
                    pessoas que tomaram decisões e viveram as consequências
                    delas.
                  </p>

                  <p>
                    O cenário entra agora em um novo capítulo. As regras
                    próprias que sustentaram os primeiros anos deram lugar aos
                    livros oficiais de D&amp;D, e as fichas antigas voltam à
                    mesa recalibradas. O mundo é o mesmo de sempre. O que
                    amadureceu foi a forma de jogá-lo.
                  </p>
                </div>

                <Ornamento className="mt-8" />

                <p className="text-tinta-500 mt-6 text-center text-sm leading-relaxed">
                  Seja você um cavaleiro de juramento firme, um alquimista
                  curioso demais para o próprio bem ou um ladino sem nenhuma
                  vontade de se redimir, há espaço para a sua história aqui.
                </p>
              </Dobra>
            </div>
          </Pergaminho>
        </Revelar>

        {/* ---------- Novidades ---------- */}
        <Novidades />

        {/* ---------- Portais: as seções do site ---------- */}
        <Revelar className="mt-14">
          <div className="text-center">
            <TituloCapitulo tom="claro">
              Caminhos de Mitrael
            </TituloCapitulo>
          </div>
        </Revelar>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PORTAIS.map((portal, i) => (
            <Revelar
              key={portal.href}
              atraso={(i % 2) * 0.08}
              direcao={i % 2 === 0 ? "esquerda" : "direita"}
              // Com número ímpar de portais, o último ocupa a linha inteira
              className={
                i === PORTAIS.length - 1 && PORTAIS.length % 2 === 1
                  ? "sm:col-span-2"
                  : ""
              }
            >
              <Pergaminho
                variante="cartao"
                borda={((i % 3) + 1) as 1 | 2 | 3}
                inclinacao={i % 2 === 0 ? "esquerda" : "direita"}
                className="flex h-full flex-col"
              >
                <div
                  className={`border-madeira-800/25 relative aspect-[16/10] w-full overflow-hidden rounded-sm border ${
                    i === PORTAIS.length - 1 && PORTAIS.length % 2 === 1
                      ? "sm:aspect-[21/8]"
                      : ""
                  }`}
                >
                  <Image
                    src={portal.imagem}
                    alt={portal.alt}
                    fill
                    sizes={
                      i === PORTAIS.length - 1 && PORTAIS.length % 2 === 1
                        ? "(max-width: 640px) 100vw, 700px"
                        : "(max-width: 640px) 100vw, 340px"
                    }
                    className={
                      "inteira" in portal && portal.inteira
                        ? "bg-madeira-950 object-contain p-3"
                        : "object-cover sepia-[0.12]"
                    }
                  />
                </div>

                <TituloCapitulo className="mt-4">{portal.nome}</TituloCapitulo>

                <p className="text-tinta-700 mt-2 grow text-sm leading-relaxed">
                  {portal.texto}
                </p>

                <div className="mt-4">
                  <BotaoLink href={portal.href} variante="secundario" className="text-xs">
                    Entrar
                  </BotaoLink>
                </div>
              </Pergaminho>
            </Revelar>
          ))}
        </div>

        {/* ---------- O vídeo de apresentação ---------- */}
        <Revelar className="mt-14">
          <Pergaminho variante="cartao" borda={1}>
            <TituloCapitulo className="text-center">
              Conheça Terras de Mitrael
            </TituloCapitulo>
            <p className="text-tinta-500 mt-1 mb-4 text-center text-xs">
              A mesa, o mapa, os personagens e as Crônicas em pouco mais de um minuto
            </p>
            <Trailer
              video="/video/conheca-terras-de-mitrael.mp4"
              capa="/video/conheca-terras-de-mitrael-capa.webp"
              titulo="Conheça Terras de Mitrael"
              duracao="1:16"
            />
          </Pergaminho>
        </Revelar>

        {/* ---------- Comunidade ---------- */}
        <Revelar className="mt-14">
          <Pergaminho variante="cartao" borda={2} inclinacao="esquerda">
            <TituloCapitulo className="text-center">
              A mesa continua
            </TituloCapitulo>
            <p className="text-tinta-700 mx-auto mt-3 max-w-md text-center text-sm leading-relaxed">
              O cenário está em transição para as novas regras. Se quiser
              acompanhar de perto o que vem pela frente, a conversa acontece no
              Discord.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <BotaoLink
                href="https://discord.gg/SQuSnvxpdp"
                variante="secundario"
                externo
                className="text-xs"
              >
                Discord
              </BotaoLink>
              <BotaoLink
                href="https://www.youtube.com/@TerrasMitrael"
                variante="secundario"
                externo
                className="text-xs"
              >
                YouTube
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>
      </main>

      <Rodape />
    </>
  );
}

/**
 * O mural de novidades: as três coisas que entraram no site por último, e o
 * caminho para a lista completa. Os dados moram em src/lib/novidades.ts.
 */
function Novidades() {
  const itens = novidades();
  if (itens.length === 0) return null;

  return (
    <section aria-labelledby="titulo-novidades" className="mt-14">
      <Revelar>
        <div className="text-center">
          <TituloCapitulo as="h2" tom="claro">
            <span id="titulo-novidades">Novidades</span>
          </TituloCapitulo>
          <p className="text-pergaminho-300/80 mt-1 text-sm">
            O que chegou à mesa por último
          </p>
        </div>
      </Revelar>

      <div className="mt-6">
        <ListaDeNovidades itens={itens} />
      </div>

      <div className="mt-5 text-center">
        <BotaoLink href="/novidades/" variante="primario">
          Ver todas as novidades
        </BotaoLink>
      </div>
    </section>
  );
}
