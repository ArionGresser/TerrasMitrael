import Image from "next/image";
import { Pergaminho } from "@/components/ui/Pergaminho";
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
    href: "/locais/",
    nome: "Locais",
    texto:
      "As terras que formam o continente: capitais, florestas sagradas e lugares onde ninguém quer pisar.",
    imagem: "/images/loc/sovara-mithr.jpg",
    alt: "A floresta de Sovara Mithr",
  },
  {
    href: "/eventos/",
    nome: "Eventos",
    texto:
      "A história que moldou Mitrael, das expedições que partiram às guerras que ninguém esqueceu.",
    imagem: "/images/story/guerra-leviana.jpg",
    alt: "Cena da Grande Guerra Leviana",
  },
  {
    href: "/personagens/",
    nome: "Personagens",
    texto:
      "Os heróis que caminharam por estas terras, suas origens, suas escolhas e o que deixaram para trás.",
    imagem: "/images/howai.jpg",
    alt: "Retrato de Howai, o Ladino",
  },
  {
    href: "/mapa/",
    nome: "Mapa",
    texto:
      "O continente inteiro diante de você: os mares, os reinos e a barreira que sela o que veio de fora.",
    imagem: "/images/map.jpg",
    alt: "Mapa do continente de Mitrael",
  },
];

export default function Home() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
        {/* ---------- Abertura ---------- */}
        <Pergaminho inclinacao="esquerda" borda={1}>
          <header className="text-center">
            <Sobretitulo>Cenário autoral de RPG de mesa</Sobretitulo>

            <TituloBrasao className="mt-4">Terras de Mitrael</TituloBrasao>

            <Ornamento className="mt-6" />

            <p className="text-tinta-700 mx-auto mt-6 max-w-lg text-base leading-relaxed italic sm:text-lg">
              Um mundo de fantasia medieval construído mesa após mesa, desde
              2020.
            </p>
          </header>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <BotaoLink href="/locais/" variante="primario">
              Explorar o mundo
            </BotaoLink>
            <BotaoLink href="/mapa/" variante="secundario">
              Ver o mapa
            </BotaoLink>
          </div>
        </Pergaminho>

        {/* ---------- Apresentação ---------- */}
        <Revelar className="mt-8">
          <Pergaminho inclinacao="direita" borda={2}>
            <TituloSecao className="text-center">Um mundo vivo</TituloSecao>

            <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.8] sm:text-base">
              <p>
                Terras de Mitrael nasceu em 2020 como um cenário de fantasia
                medieval para ser jogado à mesa. Seis anos depois, continua
                crescendo, não por planejamento, mas porque cada campanha
                deixou alguma coisa para trás: uma cidade que antes não existia,
                um herói que virou lenda, uma guerra que ninguém conseguiu
                esquecer.
              </p>

              <p>
                Aqui você encontra as terras que compõem o continente, os
                eventos que moldaram sua história e os personagens que
                caminharam por elas. Nada disso foi inventado por um autor
                sozinho, em silêncio: foi construído em sessões de jogo, por
                pessoas que tomaram decisões e viveram as consequências delas.
              </p>

              <p>
                O cenário entra agora em um novo capítulo. As regras próprias
                que sustentaram os primeiros anos deram lugar aos livros
                oficiais de D&amp;D, e as fichas antigas voltam à mesa
                recalibradas. O mundo é o mesmo de sempre. O que amadureceu foi
                a forma de jogá-lo.
              </p>
            </div>

            <Ornamento className="mt-8" />

            <p className="text-tinta-500 mt-6 text-center text-sm leading-relaxed">
              Seja você um cavaleiro de juramento firme, um alquimista curioso
              demais para o próprio bem ou um ladino sem nenhuma vontade de se
              redimir, há espaço para a sua história aqui.
            </p>
          </Pergaminho>
        </Revelar>

        {/* ---------- Portais ---------- */}
        <Revelar className="mt-14">
          <div className="text-center">
            <TituloCapitulo tom="claro">
              Por onde começar
            </TituloCapitulo>
          </div>
        </Revelar>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PORTAIS.map((portal, i) => (
            <Revelar
              key={portal.href}
              atraso={(i % 2) * 0.08}
              direcao={i % 2 === 0 ? "esquerda" : "direita"}
            >
              <Pergaminho
                variante="cartao"
                borda={((i % 3) + 1) as 1 | 2 | 3}
                inclinacao={i % 2 === 0 ? "esquerda" : "direita"}
                className="flex h-full flex-col"
              >
                <div className="border-madeira-800/25 relative aspect-[16/10] w-full overflow-hidden rounded-sm border">
                  <Image
                    src={portal.imagem}
                    alt={portal.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 340px"
                    className="object-cover sepia-[0.12]"
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

        {/* ---------- A Grande Guerra Leviana ---------- */}
        <Revelar className="mt-14">
          <Pergaminho borda={3} inclinacao="direita">
            <Sobretitulo className="text-center">
              O evento que define tudo
            </Sobretitulo>

            <TituloSecao className="mt-3 text-center">
              A Grande Guerra Leviana
            </TituloSecao>

            <p className="mt-6 text-[0.95rem] leading-[1.8] sm:text-base">
              Começou com uma expedição científica no ano 614 e terminou trinta
              e seis anos depois, com um domo mágico selando um continente
              inteiro. Entre um ponto e outro, Mitrael perdeu territórios,
              gerações e a certeza de que estava sozinha no mundo. Não existe
              uma única história neste cenário que não passe por ela.
            </p>

            <blockquote className="border-dourado-600/50 mt-7 border-l-2 pl-4">
              <p className="text-tinta-700 text-[0.95rem] leading-relaxed italic">
                Treze mil trezentos e trinta e três dias de guerra. Ao fim, a
                vitória custou uma terra inteira, e ela ainda apodrece onde
                caiu.
              </p>
            </blockquote>

            <div className="mt-7 text-center">
              <BotaoLink href="/eventos/guerra-leviana/" variante="primario">
                Ler a história completa
              </BotaoLink>
            </div>
          </Pergaminho>
        </Revelar>

        {/* ---------- Trailer ---------- */}
        <Revelar className="mt-14">
          <Pergaminho variante="cartao" borda={1}>
            <TituloCapitulo className="text-center">
              Trailer da Primeira Temporada
            </TituloCapitulo>
            <p className="text-tinta-500 mt-1 mb-4 text-center text-xs">
              Um registro dos primeiros anos de mesa
            </p>
            <Trailer
              idVideo="1LHHXE8YNrE"
              titulo="Trailer da Primeira Temporada de Terras de Mitrael"
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
