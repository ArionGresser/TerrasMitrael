/**
 * Os efeitos que não vêm de arquivo: o navegador monta cada um na hora,
 * pela Web Audio.
 *
 * Ficam aqui os sons que não existem no mundo físico e que um arquivo não
 * faria melhor: o sopro do zoom, o brilho de um item mágico e o coro do 20
 * natural no d20 da mesa. Não pesam nada no download e podem variar de
 * tamanho, como o brilho, que cresce com a raridade.
 *
 * Os ganhos foram medidos contra o pergaminho, renderizando cada efeito
 * fora do ar: o sopro fica um pouco abaixo dele, porque se repete muito,
 * e o brilho também, porque o ouvido acha nota pura mais alta do que é.
 */

export type Sintetizado = "zoomPerto" | "zoomLonge" | "brilho" | "divino";

let contexto: AudioContext | null = null;
let ruido: AudioBuffer | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const Contexto =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexto) return null;
    contexto = new Contexto();
  }
  if (contexto.state === "suspended") contexto.resume().catch(() => {});
  return contexto;
}

/** Um segundo de chiado, feito uma vez e reaproveitado por todo sopro. */
function obterRuido(ctx: AudioContext): AudioBuffer {
  if (ruido && ruido.sampleRate === ctx.sampleRate) return ruido;
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
  ruido = buffer;
  return buffer;
}

/**
 * Ar passando: chiado num filtro estreito cuja altura sobe ao aproximar e
 * desce ao afastar. É o que o ouvido entende como "vindo para perto".
 */
function sopro(ctx: AudioContext, saida: AudioNode, perto: boolean) {
  const t = ctx.currentTime;
  const fonte = ctx.createBufferSource();
  fonte.buffer = obterRuido(ctx);

  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.Q.value = 1.4;
  const [de, para] = perto ? [320, 1500] : [1500, 320];
  filtro.frequency.setValueAtTime(de, t);
  filtro.frequency.exponentialRampToValueAtTime(para, t + 0.32);

  const ganho = ctx.createGain();
  ganho.gain.setValueAtTime(0.0001, t);
  ganho.gain.exponentialRampToValueAtTime(0.6, t + 0.07);
  ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);

  fonte.connect(filtro).connect(ganho).connect(saida);
  fonte.start(t);
  fonte.stop(t + 0.4);
}

/**
 * Uma nota de sino: a fundamental e três parciais fora da série harmônica,
 * que é o que separa um sino de um apito. As parciais altas morrem antes.
 */
function nota(ctx: AudioContext, saida: AudioNode, freq: number, quando: number, forca: number, dura = 1.1) {
  const parciais: [razao: number, peso: number, queda: number][] = [
    [1, 1, 1],
    [2.76, 0.45, 0.55],
    [5.4, 0.22, 0.35],
    [8.93, 0.1, 0.2],
  ];
  for (const [razao, peso, queda] of parciais) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * razao;
    const ganho = ctx.createGain();
    const fim = quando + dura * queda;
    ganho.gain.setValueAtTime(0.0001, quando);
    ganho.gain.exponentialRampToValueAtTime(forca * peso, quando + 0.006);
    ganho.gain.exponentialRampToValueAtTime(0.0001, fim);
    osc.connect(ganho).connect(saida);
    osc.start(quando);
    osc.stop(fim + 0.02);
  }
}

/**
 * O coro do 20 natural: quatro vozes num acorde maior, cantando "aah".
 *
 * Cada voz são três serras levemente desafinadas entre si (o que faz soar
 * como gente, e não como teclado), passando por três filtros estreitos nas
 * frequências da vogal "a". Um vibrato lento e uma entrada suave de meio
 * segundo fazem o resto: o coro abre, segura e se apaga em quase três
 * segundos.
 */
function coro(ctx: AudioContext, saida: AudioNode, t: number) {
  const vogal: [freq: number, q: number, peso: number][] = [
    [730, 6, 1],
    [1090, 7, 0.55],
    [2440, 9, 0.25],
  ];
  const acorde = [261.6, 329.6, 392, 523.3];
  const fim = t + 2.9;

  const voz = ctx.createGain();
  voz.gain.setValueAtTime(0.0001, t);
  voz.gain.exponentialRampToValueAtTime(0.065, t + 0.45);
  voz.gain.setValueAtTime(0.065, t + 1.4);
  voz.gain.exponentialRampToValueAtTime(0.0001, fim);
  voz.connect(saida);

  const filtros = vogal.map(([f, q, peso]) => {
    const b = ctx.createBiquadFilter();
    b.type = "bandpass";
    b.frequency.value = f;
    b.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = peso;
    b.connect(g).connect(voz);
    return b;
  });

  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 5.2;
  const fundo = ctx.createGain();
  fundo.gain.value = 3.5;
  vibrato.connect(fundo);
  vibrato.start(t);
  vibrato.stop(fim);

  for (const freq of acorde) {
    for (const desvio of [-7, 0, 6]) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.detune.value = desvio;
      fundo.connect(osc.detune);
      filtros.forEach((f) => osc.connect(f));
      osc.start(t);
      osc.stop(fim + 0.05);
    }
  }
}

/** Dó, ré, mi, sol, lá: a escala que nunca desafina, toque o que tocar. */
const PENTATONICA = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093];

/**
 * Toca um efeito sintetizado.
 *
 * `nivel` só vale para o brilho: de 1 (comum) a 5 (lendário), é o número de
 * notas que sobem. O lendário ainda ganha um véu de cintilação por cima.
 */
export function sintetizar(efeito: Sintetizado, volume: number, nivel = 1) {
  const ctx = obterContexto();
  if (!ctx) return;

  const saida = ctx.createGain();
  saida.gain.value = volume;
  saida.connect(ctx.destination);
  const t = ctx.currentTime + 0.005;

  if (efeito === "zoomPerto" || efeito === "zoomLonge") {
    sopro(ctx, saida, efeito === "zoomPerto");
    return;
  }

  if (efeito === "divino") {
    coro(ctx, saida, t);
    // Os sinos subindo por cima do coro, e a cintilação do lendário
    for (let i = 0; i < 5; i++) nota(ctx, saida, PENTATONICA[i + 1], t + 0.15 + i * 0.09, 0.022, 1.6);
    return;
  }

  const n = Math.min(5, Math.max(1, nivel));
  for (let i = 0; i < n; i++) {
    nota(ctx, saida, PENTATONICA[i + (n >= 4 ? 1 : 0)], t + i * 0.075, 0.02, 0.9);
  }
  if (n === 5) {
    const fonte = ctx.createBufferSource();
    fonte.buffer = obterRuido(ctx);
    const filtro = ctx.createBiquadFilter();
    filtro.type = "highpass";
    filtro.frequency.value = 6000;
    const ganho = ctx.createGain();
    const inicio = t + 0.3;
    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.04, inicio + 0.25);
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 1.1);
    fonte.connect(filtro).connect(ganho).connect(saida);
    fonte.start(inicio);
    fonte.stop(inicio + 1.15);
  }
}
