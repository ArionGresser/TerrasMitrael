import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as carregarCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as carregarLora } from "@remotion/google-fonts/Lora";
import { loadFont as carregarUncial } from "@remotion/google-fonts/UncialAntiqua";
import { DURACAO, FPS, MUSICA, SOBRA, VOLUMES, montar, trechosDe, type Cena, type Tomada } from "./roteiro";

const { fontFamily: CINZEL } = carregarCinzel("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });
const { fontFamily: LORA } = carregarLora("italic", { weights: ["400"], subsets: ["latin"] });
carregarLora("normal", { weights: ["600"], subsets: ["latin"] });
const { fontFamily: UNCIAL } = carregarUncial("normal", { weights: ["400"], subsets: ["latin"] });

// As cores do site (app/globals.css)
const OURO = "#e0c266";
const OURO_ESCURO = "#b8912c";
const PERGAMINHO = "#f4ead2";
const MADEIRA = "rgba(24, 16, 9, 0.9)";

const q = (s: number) => Math.round(s * FPS);
const S = q(SOBRA);
const prender = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A câmera treme no golpe e assenta logo. */
function tremor(f: number, golpe: number, forca = 12) {
  const t = (f - golpe) / FPS;
  if (t < 0 || t > 0.45) return "translate(0px, 0px)";
  const a = forca * Math.exp(-t * 9);
  return `translate(${(a * Math.sin(t * 95)).toFixed(2)}px, ${(a * 0.7 * Math.cos(t * 77)).toFixed(2)}px)`;
}

/** A camada que treme é maior que a tela, para a borda não aparecer no tranco. */
const SOBRA_DE_TREMOR = { top: -40, left: -40, right: -40, bottom: -40, width: "auto", height: "auto" } as const;

/** O anel de poeira dourada que se abre em volta do selo quando ele bate. */
function Onda({ golpe, tamanho }: { golpe: number; tamanho: number }) {
  const f = useCurrentFrame();
  const t = interpolate(f, [golpe, golpe + 16], [0, 1], { ...prender, easing: Easing.out(Easing.cubic) });
  if (f < golpe || t >= 1) return null;
  const d = tamanho + t * 520;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: d,
        height: d,
        marginLeft: -d / 2,
        marginTop: -d / 2,
        borderRadius: "50%",
        border: `${6 * (1 - t) + 1}px solid ${OURO}`,
        opacity: 0.55 * (1 - t),
        boxShadow: `0 0 ${40 * (1 - t)}px ${OURO}`,
        pointerEvents: "none",
      }}
    />
  );
}

/** Um clarão: quente nas trocas de cena, branco no golpe do auge. */
function Clarao({ em, pico = 0.3, dura = 8, cor = "255, 214, 140" }: { em: number; pico?: number; dura?: number; cor?: string }) {
  const f = useCurrentFrame();
  const o = interpolate(f, [em - dura / 2, em, em + dura], [0, pico, 0], prender);
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 45%, rgba(${cor}, ${o}) 0%, rgba(${cor}, ${o * 0.5}) 45%, rgba(${cor}, 0) 80%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}

/**
 * O selo de cera. Com tempo antes do golpe, ele cai do alto, grande, e bate
 * no instante exato. Quando a tela já começa no golpe (o auge), ele chega
 * esmagando: entra grande e encolhe para o lugar nos primeiros quadros.
 */
function Selo({ golpe, tamanho }: { golpe: number; tamanho: number }) {
  const f = useCurrentFrame();
  let escala: number;
  let opacidade = 1;
  if (golpe <= 0) {
    escala = interpolate(f, [0, 5], [1.75, 1], { ...prender, easing: Easing.out(Easing.cubic) });
  } else if (f < golpe) {
    escala = interpolate(f, [golpe - 9, golpe], [2.6, 1], { ...prender, easing: Easing.in(Easing.cubic) });
    opacidade = interpolate(f, [golpe - 9, golpe - 5], [0, 1], prender);
  } else {
    // Um amassadinho de cera na hora da batida, e volta
    escala = 1 - 0.07 * Math.exp(-(f - golpe) / 3) * Math.cos((f - golpe) * 0.9);
  }
  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho }}>
      <Onda golpe={Math.max(0, golpe)} tamanho={tamanho} />
      <Img
        src={staticFile("imagens/selo.svg")}
        style={{
          width: tamanho,
          height: tamanho,
          opacity: opacidade,
          transform: `scale(${escala.toFixed(4)})`,
          filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.65))",
        }}
      />
    </div>
  );
}

function Abertura({ quadros }: { quadros: number }) {
  const f = useCurrentFrame();
  const golpe = q(0.88);
  const zoom = interpolate(f, [0, quadros], [1.0, 1.14]);
  const titulo = interpolate(f, [q(1.4), q(2.1)], [0, 1], { ...prender, easing: Easing.out(Easing.cubic) });
  const sub = interpolate(f, [q(2.8), q(3.4)], [0, 1], prender);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0905" }}>
      {/* Só o fundo e o selo tremem; o fundo sobra para fora da tela, para a borda nunca aparecer */}
      <AbsoluteFill style={{ ...SOBRA_DE_TREMOR, transform: tremor(f, golpe, 9) }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <Img src={staticFile("imagens/heroi-mapa-largo.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(10,7,4,0.35) 0%, rgba(10,7,4,0.75) 60%, rgba(10,7,4,0.95) 100%)",
          opacity: interpolate(f, [0, q(0.6)], [1.6, 1], prender),
        }}
      />
      <AbsoluteFill style={{ transform: tremor(f, golpe, 9) }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
          <Selo golpe={golpe} tamanho={170} />
          <div
            style={{
              fontFamily: UNCIAL,
              color: OURO,
              fontSize: 128,
              lineHeight: 1.02,
              marginTop: 40,
              opacity: titulo,
              transform: `translateY(${(1 - titulo) * 34}px)`,
              textShadow: "0 4px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.6)",
            }}
          >
            Terras de Mitrael
          </div>
          <div
            style={{
              fontFamily: CINZEL,
              color: PERGAMINHO,
              fontSize: 32,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              marginTop: 34,
              opacity: sub,
            }}
          >
            Cenário autoral de RPG de mesa
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Clarao em={golpe} pico={0.35} dura={10} />
    </AbsoluteFill>
  );
}

function Legenda({ nome, texto, quadros }: { nome: string; texto: string; quadros: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f - 2 * S - 2, fps, config: { damping: 18 } });
  const sai = interpolate(f, [quadros - 2 * S - 10, quadros - 2 * S], [1, 0], prender);
  const traco = interpolate(f, [2 * S + 6, 2 * S + 20], [0, 120], { ...prender, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", pointerEvents: "none" }}>
      <div
        style={{
          background: `linear-gradient(to top, ${MADEIRA} 0%, rgba(24,16,9,0.82) 55%, rgba(24,16,9,0) 100%)`,
          padding: "120px 120px 70px",
          opacity: entra * sai,
          transform: `translateY(${(1 - entra) * 40}px)`,
        }}
      >
        <div
          style={{
            fontFamily: CINZEL,
            fontWeight: 700,
            color: OURO,
            fontSize: 56,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textShadow: "0 3px 0 rgba(0,0,0,0.5)",
          }}
        >
          {nome}
        </div>
        <div style={{ width: traco, height: 3, background: OURO_ESCURO, margin: "18px 0 20px", opacity: 0.85 }} />
        <div style={{ fontFamily: LORA, fontStyle: "italic", color: PERGAMINHO, fontSize: 38, lineHeight: 1.3, maxWidth: 1200 }}>
          {texto}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Os pedaços da gravação, um atrás do outro; o que pula para a frente entra num esmaecer curto. */
function Gravacao({ cena }: { cena: Cena }) {
  const trechos = trechosDe(cena);
  let de = 0;
  return (
    <>
      {trechos.map((t, i) => {
        const quadros = q((t.ate - t.de) / t.velocidade);
        const pulo = i > 0 && Math.abs(trechos[i - 1].ate - t.de) > 0.05;
        const inicio = de;
        de += quadros;
        return (
          <Sequence key={i} from={inicio - (pulo ? 3 : 0)} durationInFrames={quadros + (pulo ? 3 : 0) + (i < trechos.length - 1 ? 1 : 0)}>
            <Pedaco gravacao={cena.gravacao} de={t.de - (pulo ? (3 / FPS) * t.velocidade : 0)} velocidade={t.velocidade} esmaecer={pulo} />
          </Sequence>
        );
      })}
    </>
  );
}

function Pedaco({ gravacao, de, velocidade, esmaecer }: { gravacao: string; de: number; velocidade: number; esmaecer: boolean }) {
  const f = useCurrentFrame();
  const o = esmaecer ? interpolate(f, [0, 4], [0, 1], prender) : 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <OffthreadVideo
        src={staticFile(`gravacoes/horizontal/${gravacao}.mp4`)}
        trimBefore={Math.max(0, Math.round(de * FPS))}
        playbackRate={velocidade}
        muted
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
}

/**
 * Uma cena do passeio. Na troca, a que sai cresce e desfoca, e a que entra
 * vem de um pouco maior para o lugar, por cima dela: um mergulho de uma tela
 * para a outra, no ritmo do compasso.
 */
function CenaDoPasseio({ cena, quadros }: { cena: Cena; quadros: number }) {
  const f = useCurrentFrame();
  const escuro = cena.entrada === "escuro";
  const entra = escuro
    ? interpolate(f, [0, q(0.55)], [0, 1], { ...prender, easing: Easing.out(Easing.quad) })
    : interpolate(f, [0, 2 * S], [0, 1], { ...prender, easing: Easing.out(Easing.cubic) });
  const sai = interpolate(f, [quadros - 2 * S, quadros], [0, 1], { ...prender, easing: Easing.in(Easing.cubic) });
  const deriva = interpolate(f, [0, quadros], [1.0, 1.03]);
  const escala = deriva * (escuro ? 1 : 1.07 - 0.07 * entra) * (1 + 0.09 * sai);
  const desfoque = (escuro ? 0 : 9 * (1 - entra)) + 7 * sai;
  // Na freada a tela vai escurecendo no fim, prendendo o folego antes do auge
  const folego = escuro ? interpolate(f, [quadros - q(0.6), quadros], [1, 0.3], { ...prender, easing: Easing.in(Easing.quad) }) : 1;
  const filtros = [desfoque > 0.05 ? `blur(${desfoque.toFixed(2)}px)` : "", folego < 1 ? `brightness(${folego.toFixed(3)})` : ""].join(" ").trim();

  return (
    <AbsoluteFill style={{ opacity: entra }}>
      <AbsoluteFill style={{ transform: `scale(${escala.toFixed(4)})`, filter: filtros || undefined }}>
        <Gravacao cena={cena} />
      </AbsoluteFill>
      {cena.legenda ? <Legenda nome={cena.legenda.nome} texto={cena.legenda.texto} quadros={quadros} /> : null}
    </AbsoluteFill>
  );
}

/** Uma tomada da montagem: entra com um soco de zoom em cima da batida. */
function TomadaDaMontagem({ t, quadros }: { t: Tomada; quadros: number }) {
  const f = useCurrentFrame();
  const soco = interpolate(f, [0, 6], [1.09, 1.0], { ...prender, easing: Easing.out(Easing.cubic) });
  const deriva = interpolate(f, [0, Math.max(quadros, 1)], [1.0, 1.035]);
  const flash = interpolate(f, [0, 3], [0.22, 0], prender);

  let conteudo: React.ReactNode;
  if (t.tipo === "gravacao") {
    conteudo = (
      <OffthreadVideo
        src={staticFile(`gravacoes/horizontal/${t.gravacao}.mp4`)}
        trimBefore={Math.round(t.em * FPS)}
        playbackRate={t.velocidade ?? 1}
        muted
        style={{ width: "100%", height: "100%" }}
      />
    );
  } else if (t.cheia) {
    conteudo = <Img src={staticFile(`imagens/montagem/${t.imagem}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  } else {
    // Arte em pé: no meio, com sombra, sobre ela mesma desfocada no fundo
    conteudo = (
      <AbsoluteFill style={{ backgroundColor: "#0d0905" }}>
        <Img
          src={staticFile(`imagens/montagem/${t.imagem}.jpg`)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(34px) brightness(0.42) saturate(1.2)", transform: "scale(1.2)" }}
        />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Img
            src={staticFile(`imagens/montagem/${t.imagem}.jpg`)}
            style={{ height: "94%", borderRadius: 6, boxShadow: "0 30px 80px rgba(0,0,0,0.75), 0 0 0 2px rgba(224,194,102,0.35)" }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0905" }}>
      <AbsoluteFill style={{ transform: `scale(${(soco * deriva).toFixed(4)})` }}>{conteudo}</AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(255, 236, 200, ${flash})`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}

function Fecho({ quadros }: { quadros: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const golpe = 0;
  // As linhas entram nas batidas depois do auge
  const batida = (n: number) => q(0.054 + n * 0.676);
  const titulo = spring({ frame: f - batida(1), fps, config: { damping: 15 } });
  const linha = (n: number) => interpolate(f, [batida(n), batida(n) + 12], [0, 1], { ...prender, easing: Easing.out(Easing.cubic) });
  const apaga = interpolate(f, [quadros - 24, quadros], [1, 0], prender);
  const zoom = interpolate(f, [0, quadros], [1.06, 1.0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0905", opacity: apaga }}>
      <AbsoluteFill style={{ ...SOBRA_DE_TREMOR, transform: tremor(f, golpe, 14) }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <Img src={staticFile("imagens/mesa.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(10,7,4,0.25) 0%, rgba(10,7,4,0.88) 100%)" }} />
      <AbsoluteFill style={{ transform: tremor(f, golpe, 14) }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
          <Selo golpe={golpe} tamanho={180} />
          <div
            style={{
              fontFamily: UNCIAL,
              color: OURO,
              fontSize: 124,
              lineHeight: 1.02,
              marginTop: 34,
              transform: `scale(${0.85 + 0.15 * titulo})`,
              opacity: titulo,
              textShadow: "0 4px 0 rgba(0,0,0,0.55)",
            }}
          >
            Terras de Mitrael
          </div>
          <div
            style={{
              fontFamily: CINZEL,
              color: PERGAMINHO,
              fontSize: 30,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginTop: 28,
              opacity: linha(3),
              transform: `translateY(${(1 - linha(3)) * 14}px)`,
            }}
          >
            Cenário autoral de RPG de mesa · desde 2020
          </div>
          <div
            style={{
              fontFamily: LORA,
              fontStyle: "italic",
              color: OURO,
              fontSize: 40,
              marginTop: 26,
              opacity: linha(5),
              transform: `translateY(${(1 - linha(5)) * 14}px)`,
            }}
          >
            Muito mais por vir.
          </div>
          <div
            style={{
              fontFamily: LORA,
              fontWeight: 600,
              color: OURO,
              fontSize: 44,
              letterSpacing: "0.02em",
              marginTop: 46,
              padding: "14px 38px",
              border: `2px solid ${OURO_ESCURO}`,
              borderRadius: 12,
              background: "rgba(13,9,5,0.6)",
              opacity: linha(7),
              transform: `scale(${0.94 + 0.06 * linha(7)})`,
            }}
          >
            terrasmitrael.netlify.app
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Clarao em={golpe} pico={0.55} dura={14} cor="255, 244, 220" />
    </AbsoluteFill>
  );
}

export function Trailer() {
  const m = montar();
  const total = q(DURACAO);
  const auge = q(MUSICA.auge);
  const primeira = m.cenas[0];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0905" }}>
      <Sequence durationInFrames={q(primeira.inicio + SOBRA)}>
        <Abertura quadros={q(primeira.inicio + SOBRA)} />
      </Sequence>

      {m.cenas.map((c) => {
        const de = q(c.inicio - (c.entrada === "escuro" ? 0 : SOBRA));
        const ate = c.entrada === "escuro" ? q(c.fim) : q(c.fim + SOBRA);
        return (
          <Sequence key={c.id} from={de} durationInFrames={ate - de}>
            <CenaDoPasseio cena={c} quadros={ate - de} />
          </Sequence>
        );
      })}

      {m.montagem.map((t, i) => {
        // A primeira tomada cruza com o Livro, como uma troca de cena
        const de = q(t.de) - (i === 0 ? S : 0);
        const quadros = q(t.ate) - de;
        return (
          <Sequence key={`m${i}`} from={de} durationInFrames={quadros}>
            {i === 0 ? (
              <EntradaCruzada quadros={quadros}>
                <TomadaDaMontagem t={t} quadros={quadros} />
              </EntradaCruzada>
            ) : (
              <TomadaDaMontagem t={t} quadros={quadros} />
            )}
          </Sequence>
        );
      })}

      <Sequence from={auge} durationInFrames={total - auge}>
        <Fecho quadros={total - auge} />
      </Sequence>

      {/* O clarão quente em cada troca de cena */}
      {m.trocas.map((t) => (
        <Clarao key={`c${t}`} em={q(t)} pico={0.22} dura={10} />
      ))}

      <Audio
        src={staticFile(MUSICA.arquivo)}
        volume={(f) => {
          const base = interpolate(f, [0, 8, q(MUSICA.saida), total], [0, VOLUMES.musica, VOLUMES.musica, 0], prender);
          // Em cada troca a música abre espaço por um instante, e o whoosh passa
          let espaco = 1;
          for (const t of m.trocas) {
            const d = Math.abs(f - q(t)) / FPS;
            if (d < 0.22) espaco = Math.min(espaco, 1 - (1 - VOLUMES.abertura) * (1 - d / 0.22));
          }
          return base * espaco;
        }}
      />

      {m.sons.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, q(s.em))} durationInFrames={q(4)}>
          <Audio src={staticFile(s.arquivo)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

function EntradaCruzada({ quadros, children }: { quadros: number; children: React.ReactNode }) {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 2 * S], [0, 1], { ...prender, easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ opacity: entra, filter: entra < 1 ? `blur(${(8 * (1 - entra)).toFixed(2)}px)` : undefined }}>{children}</AbsoluteFill>;
}
