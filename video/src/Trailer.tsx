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
import { FPS, MUSICA_INICIO, TRANSICAO, montar, type Bloco, type Formato } from "./roteiro";

const { fontFamily: CINZEL } = carregarCinzel("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });
const { fontFamily: LORA } = carregarLora("italic", { weights: ["400"], subsets: ["latin"] });
carregarLora("normal", { weights: ["600"], subsets: ["latin"] });
const { fontFamily: UNCIAL } = carregarUncial("normal", { weights: ["400"], subsets: ["latin"] });

// As cores do site (app/globals.css)
const OURO = "#e0c266";
const OURO_ESCURO = "#b8912c";
const PERGAMINHO = "#f4ead2";
const MADEIRA = "rgba(24, 16, 9, 0.9)";

const T = Math.round(TRANSICAO * FPS);

/**
 * A mistura. Medida no vídeo pronto, janela a janela: a música fica cheia,
 * cada efeito sai uns 6 dB acima dela no instante do gesto. O rugido, que
 * é quase todo grave e encorpado, e os cliques secos da aba, do trinco e
 * das moedas pedem menos que os outros para não estourar por cima dela.
 */
const MUSICA = 1.25;
const EFEITOS = 1.5;
const AJUSTE: Record<string, number> = { rugido: 0.26, aba: 0.6, trinco: 0.6, moedas: 0.75 };

/** Entra e sai em esmaecimento, para as cenas se cruzarem. */
function useEsmaecer(quadros: number) {
  const f = useCurrentFrame();
  return interpolate(f, [0, T, quadros - T, quadros], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function Abertura({ formato, quadros }: { formato: Formato; quadros: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacidade = interpolate(f, [quadros - T, quadros], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(f, [0, quadros], [1.0, 1.14]);
  const selo = spring({ frame: f - 8, fps, config: { damping: 12, mass: 0.8 } });
  const titulo = interpolate(f, [16, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const sub = interpolate(f, [36, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0905", opacity: opacidade }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img
          src={staticFile("imagens/heroi-mapa-largo.webp")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,7,4,0.35) 0%, rgba(10,7,4,0.75) 60%, rgba(10,7,4,0.95) 100%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
        <Img
          src={staticFile("imagens/selo.svg")}
          style={{ width: 170, transform: `scale(${selo})`, filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.6))" }}
        />
        <div
          style={{
            fontFamily: UNCIAL,
            color: OURO,
            fontSize: 128,
            lineHeight: 1.02,
            marginTop: 40,
            opacity: titulo,
            transform: `translateY(${(1 - titulo) * 30}px)`,
            textShadow: "0 4px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.6)",
          }}
        >
          Terras de{" "}Mitrael
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
  );
}

function Legenda({ bloco, formato }: { bloco: Bloco; formato: Formato }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!bloco.legenda) return null;
  const entra = spring({ frame: f - T - 4, fps, config: { damping: 18 } });
  const sai = interpolate(f, [bloco.quadros - T - 8, bloco.quadros - T], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
          {bloco.legenda.nome}
        </div>
        <div style={{ width: 120, height: 3, background: OURO_ESCURO, margin: "18px 0 20px", opacity: 0.8 }} />
        <div
          style={{
            fontFamily: LORA,
            fontStyle: "italic",
            color: PERGAMINHO,
            fontSize: 38,
            lineHeight: 1.3,
            maxWidth: 1200,
          }}
        >
          {bloco.legenda.texto}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Cena({ bloco, formato }: { bloco: Bloco; formato: Formato }) {
  const opacidade = useEsmaecer(bloco.quadros);
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, bloco.quadros], [1.0, 1.035]);
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo
          src={staticFile(`gravacoes/${formato}/${bloco.cena}.mp4`)}
          trimBefore={Math.round(bloco.inicio * FPS)}
          playbackRate={bloco.velocidade}
          muted
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
      <Legenda bloco={bloco} formato={formato} />
    </AbsoluteFill>
  );
}

function Fecho({ formato, quadros }: { formato: Formato; quadros: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = interpolate(f, [0, T], [0, 1], { extrapolateRight: "clamp" });
  const apaga = interpolate(f, [quadros - 22, quadros], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // O selo bate junto com a virada da música
  const selo = spring({ frame: f - T, fps, config: { damping: 9, mass: 0.9 } });
  const titulo = spring({ frame: f - T - 6, fps, config: { damping: 16 } });
  const resto = interpolate(f, [T + 22, T + 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: entra * apaga, backgroundColor: "#0d0905" }}>
      <AbsoluteFill>
        <Img src={staticFile("imagens/mesa.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(10,7,4,0.25) 0%, rgba(10,7,4,0.85) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
        <Img
          src={staticFile("imagens/selo.svg")}
          style={{ width: 180, transform: `scale(${selo})`, filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.7))" }}
        />
        <div
          style={{
            fontFamily: UNCIAL,
            color: OURO,
            fontSize: 124,
            lineHeight: 1.02,
            marginTop: 36,
            transform: `scale(${0.85 + 0.15 * titulo})`,
            opacity: titulo,
            textShadow: "0 4px 0 rgba(0,0,0,0.55)",
          }}
        >
          Terras de{" "}Mitrael
        </div>
        <div
          style={{
            fontFamily: CINZEL,
            color: PERGAMINHO,
            fontSize: 30,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginTop: 30,
            opacity: resto,
          }}
        >
          Cenário autoral de RPG de mesa · desde 2020
        </div>
        <div
          style={{
            fontFamily: LORA,
            fontWeight: 600,
            color: OURO,
            fontSize: 46,
            letterSpacing: "0.02em",
            marginTop: 60,
            padding: "16px 40px",
            border: `2px solid ${OURO_ESCURO}`,
            borderRadius: 12,
            background: "rgba(13,9,5,0.6)",
            opacity: resto,
          }}
        >
          terrasmitrael.netlify.app
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function Trailer({ formato }: { formato: Formato }) {
  const m = montar(formato);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0905" }}>
      <Sequence durationInFrames={m.abertura}>
        <Abertura formato={formato} quadros={m.abertura} />
      </Sequence>

      {m.blocos.map((b) => (
        <Sequence key={b.cena} from={b.de} durationInFrames={b.quadros}>
          <Cena bloco={b} formato={formato} />
        </Sequence>
      ))}

      <Sequence from={m.fecho} durationInFrames={m.total - m.fecho}>
        <Fecho formato={formato} quadros={m.total - m.fecho} />
      </Sequence>

      <Audio
        src={staticFile("musica/vrakyr-tema.m4a")}
        trimBefore={Math.round(MUSICA_INICIO * FPS)}
        volume={(f) =>
          interpolate(f, [0, 12, m.total - 60, m.total], [0, MUSICA, MUSICA, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {m.sons.map((s, i) => (
        <Sequence key={i} from={s.quadro} durationInFrames={FPS * 2}>
          <Audio src={staticFile(`sons/${s.efeito}.wav`)} volume={EFEITOS * (AJUSTE[s.efeito] ?? 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
