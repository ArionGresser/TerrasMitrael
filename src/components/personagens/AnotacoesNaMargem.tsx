import { Caveat } from "next/font/google";

// A letra de quem escreve à pena na margem do diário. Sem preload: o
// arquivo só é baixado na ficha que tem anotações, quando o texto aparece.
const fonteManuscrita = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  preload: false,
});

// Cada palavra sai um pouco torta, como quem escreve rápido e sem pauta
const GIROS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];
const RECUOS = ["ml-0", "ml-1.5", "ml-0.5", "ml-2"];

/**
 * As palavras escritas à mão ao lado do brasão ("Astuto · Caótico..."),
 * com um traço de tinta separando as duas colunas.
 */
export function AnotacoesNaMargem({ palavras }: { palavras: string[] }) {
  return (
    <div className="flex items-stretch gap-4 sm:gap-5">
      {/* O traço feito à pena: mais grosso no meio, afinando nas pontas */}
      <svg
        aria-hidden
        viewBox="0 0 6 100"
        preserveAspectRatio="none"
        className="text-tinta-900/80 w-1.5 shrink-0"
      >
        <path
          d="M3 0 C4.4 20 4.2 45 3.8 60 C3.5 75 3.6 88 2.6 100 C2.2 85 1.9 70 2.1 55 C2.3 35 1.8 18 3 0Z"
          fill="currentColor"
        />
      </svg>

      <ul
        className={`${fonteManuscrita.className} text-tinta-900 space-y-0.5 py-1 text-[1.65rem] leading-tight sm:text-3xl`}
      >
        {palavras.map((palavra, i) => (
          <li
            key={palavra}
            className={`flex items-baseline gap-2 ${GIROS[i % GIROS.length]} ${RECUOS[i % RECUOS.length]}`}
          >
            <span aria-hidden className="text-tinta-700 text-lg font-bold">
              ·
            </span>
            <span className="font-medium">{palavra}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
