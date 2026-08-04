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
 * Cera derretida nunca sai redonda: ela escorre para fora em bicos
 * irregulares quando o ferro aperta. Estes números fazem esse contorno.
 */
const VARIACAO = [
  1, 1.035, 0.968, 1.022, 0.994, 1.041, 0.962, 1.014, 1.03, 0.978, 1.018,
  0.972, 1.008, 1.038, 0.984, 1.026,
];

function contornoDeCera(raio: number, bicos: number): string {
  const total = bicos * 2;
  const pontos: [number, number][] = [];

  for (let i = 0; i < total; i++) {
    const angulo = (i / total) * Math.PI * 2 - Math.PI / 2;
    const vale = i % 2 === 1;
    const r = raio * (vale ? 0.945 : 1) * VARIACAO[i % VARIACAO.length];
    pontos.push([50 + Math.cos(angulo) * r, 50 + Math.sin(angulo) * r]);
  }

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

const CERA = contornoDeCera(48, 16);

type Variante = "cera" | "marca";

/**
 * A cera não abre no meio: ela racha em linha quebrada, seguindo o ponto
 * mais fino do relevo. Este é o traçado dessa rachadura.
 */
const RACHADURA = "M6 44 L28 39 L34 52 L52 45 L58 58 L78 51 L94 57";

export function Selo({
  variante = "cera",
  rompido = false,
  className = "",
  id = "selo",
}: {
  variante?: Variante;
  /** Cera partida, como fica depois que a carta foi aberta. */
  rompido?: boolean;
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
        <radialGradient id={`${id}-luz`} cx="34%" cy="26%" r="62%">
          <stop offset="0" stopColor="#c4525c" />
          <stop offset="0.55" stopColor="#7b2028" />
          <stop offset="1" stopColor="#4d1219" />
        </radialGradient>
        <radialGradient id={`${id}-fundo`} cx="50%" cy="50%" r="50%">
          <stop offset="0.62" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      {/* A cera que escorreu para fora quando o ferro apertou */}
      <path d={CERA} fill={`url(#${id}-luz)`} />
      <path d={CERA} fill={`url(#${id}-fundo)`} />

      {/* O disco fundo, onde o ferro comprimiu a cera */}
      <circle cx="50" cy="50" r="38" fill="#000" opacity="0.18" />
      <circle cx="50" cy="50" r="37" fill={`url(#${id}-luz)`} opacity="0.85" />

      {/* O anel de contas da matriz imperial */}
      <circle
        cx="50"
        cy="50"
        r="41.5"
        fill="none"
        stroke="#000"
        strokeOpacity="0.28"
        strokeWidth="1.6"
      />
      <circle
        cx="50"
        cy="50"
        r="41.5"
        fill="none"
        stroke="#e8a0a8"
        strokeOpacity="0.3"
        strokeWidth="0.7"
        strokeDasharray="1.6 2.9"
      />

      {/* O brasão, com a sombra que a cera guarda em volta do relevo */}
      <g transform={POSICAO_DO_M}>
        <path d={M_DO_BRASAO} transform="translate(0 46)" fill="#3d0d13" />
        <path d={M_DO_BRASAO} fill="#f7ecd8" />
      </g>

      {/* A carta já foi aberta: a cera partiu */}
      {rompido ? (
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={RACHADURA} stroke="#2a070b" strokeWidth="4.5" />
          <path
            d={RACHADURA}
            stroke="#e08b95"
            strokeOpacity="0.5"
            strokeWidth="1.4"
            transform="translate(0 -1.6)"
          />
        </g>
      ) : null}
    </svg>
  );
}
