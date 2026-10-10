/**
 * O selo imperial de Mitrael.
 *
 * Uma peça só, usada em dois estados: a cera vermelha lacrando a carta, e a
 * marca que o ferro quente deixou na madeira da mesa. Ter as duas no mesmo
 * componente garante que a marca seja mesmo a impressão daquele selo, e não
 * um desenho parecido.
 *
 * O M é o contorno real da fonte Uncial Antiqua, tirado do arquivo da fonte.
 * O mesmo traçado está em app/icon.svg, que é o ícone da aba.
 */

const M_DO_BRASAO =
  "M1133 -762Q1133 -841 1126.5 -919.5Q1120 -998 1104.5 -1069.5Q1089 -1141 1064.5 -1202.5Q1040 -1264 1004.0 -1309.5Q968 -1355 919.5 -1381.0Q871 -1407 809 -1407Q720 -1407 649.5 -1355.5Q579 -1304 529.0 -1217.5Q479 -1131 452.5 -1018.5Q426 -906 426 -784Q426 -649 455.5 -539.5Q485 -430 530.0 -344.0Q575 -258 628.0 -194.0Q681 -130 727.5 -88.0Q774 -46 807.5 -24.0Q841 -2 846 0H463Q444 -9 410.5 -40.0Q377 -71 336.5 -120.0Q296 -169 254.5 -234.5Q213 -300 179.0 -377.5Q145 -455 123.5 -543.5Q102 -632 102 -727Q102 -785 112.5 -863.0Q123 -941 151.0 -1023.5Q179 -1106 227.5 -1186.0Q276 -1266 351.0 -1329.0Q426 -1392 531.0 -1431.0Q636 -1470 778 -1470Q872 -1470 948.5 -1452.5Q1025 -1435 1087.0 -1404.5Q1149 -1374 1197.0 -1333.0Q1245 -1292 1282 -1245Q1319 -1292 1370.0 -1333.0Q1421 -1374 1487.0 -1404.5Q1553 -1435 1636.5 -1452.5Q1720 -1470 1823 -1470Q1961 -1470 2066.5 -1439.0Q2172 -1408 2249.5 -1355.5Q2327 -1303 2378.5 -1234.5Q2430 -1166 2461.5 -1091.5Q2493 -1017 2506.0 -940.5Q2519 -864 2519 -797Q2519 -671 2481.0 -567.5Q2443 -464 2383.0 -381.5Q2323 -299 2248.5 -235.0Q2174 -171 2101.0 -124.5Q2028 -78 1964.5 -47.5Q1901 -17 1862 0H1774Q1779 -2 1812.0 -24.5Q1845 -47 1892.0 -90.0Q1939 -133 1992.0 -198.0Q2045 -263 2090.0 -351.0Q2135 -439 2165.0 -550.5Q2195 -662 2195 -799Q2195 -940 2162.0 -1053.0Q2129 -1166 2073.5 -1244.5Q2018 -1323 1945.0 -1365.0Q1872 -1407 1792 -1407Q1728 -1407 1678.0 -1381.0Q1628 -1355 1590.0 -1309.5Q1552 -1264 1525.5 -1202.5Q1499 -1141 1482.0 -1069.5Q1465 -998 1457.5 -919.5Q1450 -841 1450 -762V0H1133Z";

/** Centraliza o M do brasão dentro do disco de 100 por 100. */
const POSICAO_DO_M = "translate(50 50) scale(0.0233) translate(-1310.5 735)";

/**
 * Cera derretida nunca sai redonda: o ferro aperta e ela escapa para fora em
 * línguas de tamanhos diferentes, umas curtas, outras compridas, sem padrão.
 * Estes números são essas línguas, sempre os mesmos, para o selo não mudar
 * de forma entre uma página e outra.
 */
const LINGUAS = [
  1, 0.965, 1.02, 0.95, 0.985, 1.045, 0.97, 0.94, 1.0, 1.035, 0.96, 0.99,
  1.06, 0.975, 0.945, 1.01, 0.98, 1.025, 0.955, 0.99, 1.04, 0.965, 0.95,
  1.015, 0.975, 1.05, 0.96, 0.985,
];

function contornoDeCera(raio: number): string {
  const total = LINGUAS.length;
  const pontos: [number, number][] = LINGUAS.map((variacao, i) => {
    const angulo = (i / total) * Math.PI * 2 - Math.PI / 2;
    const r = raio * variacao;
    return [50 + Math.cos(angulo) * r, 50 + Math.sin(angulo) * r];
  });

  const meio = (a: [number, number], b: [number, number]) =>
    `${((a[0] + b[0]) / 2).toFixed(2)} ${((a[1] + b[1]) / 2).toFixed(2)}`;

  let d = `M${meio(pontos[total - 1], pontos[0])}`;
  for (let i = 0; i < total; i++) {
    const p = pontos[i];
    const proximo = pontos[(i + 1) % total];
    d += `Q${p[0].toFixed(2)} ${p[1].toFixed(2)} ${meio(p, proximo)}`;
  }
  return `${d}Z`;
}

const CERA = contornoDeCera(46.5);

type Variante = "cera" | "marca";

/**
 * A seta de voltar, gravada na cera no lugar do M: o caminho faz a curva e
 * aponta para trás. Traço grosso e pontas redondas, como o ferro deixa.
 */
const SETA_DE_VOLTA = "M65 63V53.5a12.5 12.5 0 0 0-12.5-12.5H35 M44 31 33.5 41 44 51";

export function Selo({
  variante = "cera",
  emblema = "brasao",
  pressionado = false,
  className = "",
  id = "selo",
}: {
  variante?: Variante;
  /** O que o ferro gravou: o M do brasão, ou a seta do selo de voltar. */
  emblema?: "brasao" | "voltar";
  /** Ferro apertado até o fim, como fica com o menu aberto. */
  pressionado?: boolean;
  className?: string;
  /** Precisa ser único quando dois selos aparecem na mesma página. */
  id?: string;
}) {
  if (variante === "marca") {
    return (
      <svg
        viewBox="0 0 100 100"
        className={className}
        aria-hidden
        focusable="false"
      >
        {/* A borda de madeira levantada em volta da queimadura, que é o que
            faz a marca parecer funda em vez de desenhada por cima. */}
        <g transform="translate(0 1.4)" opacity="0.5">
          <path d={CERA} fill="#c99a5c" />
          <circle cx="50" cy="50" r="38" fill="#3a2410" />
          <circle
            cx="50"
            cy="50"
            r="41.5"
            fill="none"
            stroke="#c99a5c"
            strokeWidth="1.4"
          />
          <path d={M_DO_BRASAO} transform={POSICAO_DO_M} fill="#3a2410" />
        </g>

        <path d={CERA} fill="#150c05" opacity="0.66" />
        <circle cx="50" cy="50" r="38" fill="#2a1a0c" opacity="0.5" />
        <circle
          cx="50"
          cy="50"
          r="41.5"
          fill="none"
          stroke="#0d0703"
          strokeWidth="1.4"
          opacity="0.7"
        />
        <path
          d={M_DO_BRASAO}
          transform={POSICAO_DO_M}
          fill="#0d0703"
          opacity="0.72"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        {/* A luz da vela vem do alto à esquerda */}
        <radialGradient id={`${id}-cera`} cx="36%" cy="30%" r="70%">
          <stop offset="0" stopColor="#a02c37" />
          <stop offset="0.5" stopColor="#7c1d27" />
          <stop offset="1" stopColor="#430c13" />
        </radialGradient>

        {/* O fundo da cavidade, onde o ferro afundou a cera: a parede de
            cima fica na sombra e a de baixo pega a luz, ao contrário da
            borda, que é como o olho entende "afundado". */}
        <radialGradient id={`${id}-fundo`} cx="58%" cy="64%" r="62%">
          <stop offset="0" stopColor="#8a2530" />
          <stop offset="0.7" stopColor="#6c1922" />
          <stop offset="1" stopColor="#4a0f16" />
        </radialGradient>

        {/* O relevo do brasão, um tom acima do fundo */}
        <linearGradient id={`${id}-relevo`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a9343f" />
          <stop offset="1" stopColor="#6a1820" />
        </linearGradient>

        {/* Brilho de cera endurecida, um reflexo largo e macio */}
        <radialGradient id={`${id}-brilho`} cx="33%" cy="24%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* As irregularidades da cera, bolhas e manchas finas */}
        <filter id={`${id}-poros`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.55"
            numOctaves="2"
            seed="4"
          />
          <feColorMatrix
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.22"
          />
        </filter>

        <clipPath id={`${id}-recorte`}>
          <path d={CERA} />
        </clipPath>
      </defs>

      {/* A cera que escorreu para fora quando o ferro apertou */}
      <path d={CERA} fill={`url(#${id}-cera)`} />
      <rect
        width="100"
        height="100"
        filter={`url(#${id}-poros)`}
        clipPath={`url(#${id}-recorte)`}
        opacity="0.5"
      />
      {/* A beira escura onde a cera afina e esfria primeiro */}
      <path
        d={CERA}
        fill="none"
        stroke="#3a0a10"
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />

      {/* A borda levantada que o ferro empurrou para cima */}
      <circle
        cx="50"
        cy="50"
        r="38.5"
        fill="none"
        stroke="#c4525c"
        strokeOpacity="0.55"
        strokeWidth="2"
        transform="translate(-0.6 -0.8)"
      />
      <circle
        cx="50"
        cy="50"
        r="38.5"
        fill="none"
        stroke="#3a0a10"
        strokeOpacity="0.5"
        strokeWidth="2"
        transform="translate(0.7 0.9)"
      />

      {/* A cavidade */}
      <circle cx="50" cy="50" r="36.5" fill={`url(#${id}-fundo)`} />
      <circle
        cx="50"
        cy="50"
        r="35.6"
        fill="none"
        stroke="#2a060b"
        strokeOpacity="0.5"
        strokeWidth="2.2"
        transform="translate(0.5 0.9)"
      />

      {/* O anel de contas da matriz imperial, em relevo */}
      <circle
        cx="50"
        cy="50"
        r="32.5"
        fill="none"
        stroke="#3a0a10"
        strokeOpacity="0.45"
        strokeWidth="1.3"
        strokeDasharray="0.1 2.6"
        strokeLinecap="round"
        transform="translate(0.35 0.45)"
      />
      <circle
        cx="50"
        cy="50"
        r="32.5"
        fill="none"
        stroke="#d26a74"
        strokeOpacity="0.7"
        strokeWidth="1.1"
        strokeDasharray="0.1 2.6"
        strokeLinecap="round"
      />

      {/* O brasão em relevo: luz em cima, sombra embaixo, cor da cera */}
      {emblema === "voltar" ? (
        <g fill="none" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={SETA_DE_VOLTA} transform="translate(0.9 1.2)" stroke="#2a060b" strokeOpacity="0.7" />
          <path d={SETA_DE_VOLTA} transform="translate(-0.7 -0.9)" stroke="#e07a85" strokeOpacity="0.7" />
          <path d={SETA_DE_VOLTA} stroke="#8e2430" />
          <path d={SETA_DE_VOLTA} stroke="#e9c27a" strokeOpacity="0.12" />
        </g>
      ) : (
        <g transform={POSICAO_DO_M}>
          <path d={M_DO_BRASAO} transform="translate(45 60)" fill="#2a060b" fillOpacity="0.7" />
          <path d={M_DO_BRASAO} transform="translate(-35 -45)" fill="#e07a85" fillOpacity="0.7" />
          <path d={M_DO_BRASAO} fill={`url(#${id}-relevo)`} />
          <path d={M_DO_BRASAO} fill="#e9c27a" fillOpacity="0.12" />
        </g>
      )}

      {/* O reflexo por cima de tudo */}
      <path d={CERA} fill={`url(#${id}-brilho)`} />

      {/* Ferro apertado até o fim. A parede da cavidade afunda mais, e é só
          isso que muda: a sombra interna engrossa e ganha um fio de luz na
          borda de baixo, que é como a vista lê profundidade. */}
      {pressionado ? (
        <g fill="none">
          <circle
            cx="50"
            cy="50"
            r="35.2"
            stroke="#2a070b"
            strokeOpacity="0.6"
            strokeWidth="3.2"
            transform="translate(0.4 0.8)"
          />
          <circle
            cx="50"
            cy="50"
            r="35.8"
            stroke="#e8a0a8"
            strokeOpacity="0.25"
            strokeWidth="0.8"
            transform="translate(0 1.2)"
          />
        </g>
      ) : null}
    </svg>
  );
}
