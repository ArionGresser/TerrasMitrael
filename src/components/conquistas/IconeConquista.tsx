import type { Icone } from "@/lib/conquistas";

/** Os desenhos das conquistas: traço simples, na cor do texto em volta. */
const TRACOS: Record<Icone, string> = {
  dado: "M12 2.5 20.5 7.3v9.4L12 21.5 3.5 16.7V7.3Z M12 6.8 16.8 15H7.2Z M12 2.5v4.3 M20.5 16.7 16.8 15 M3.5 16.7 7.2 15",
  moeda: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z",
  vela: "M9 10.5h6V21H9Z M12 2.8c2.2 2.4 2.3 4.6 0 6.2-2.3-1.6-2.2-3.8 0-6.2Z M7 21h10",
  mao: "M8 13V6.5a1.5 1.5 0 0 1 3 0V12 M11 11V4.8a1.5 1.5 0 0 1 3 0V11 M14 11V6.3a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.8 0-4.4-1.6-5.7-4.2L4 14.3a1.4 1.4 0 0 1 2.4-1.4L8 15",
  livro: "M3.5 5.5c2.8-1 5.8-.9 8.5.7 2.7-1.6 5.7-1.7 8.5-.7v13c-2.8-1-5.8-.9-8.5.7-2.7-1.6-5.7-1.7-8.5-.7Z M12 6.2v13.5",
  mapa: "M12 21.5s-6.2-5.7-6.2-10.8a6.2 6.2 0 0 1 12.4 0c0 5.1-6.2 10.8-6.2 10.8Z M12 8.4a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Z",
  bau: "M3.5 11h17v9.5h-17Z M3.5 11a8.5 6 0 0 1 17 0 M10.4 13.6h3.2v3.4h-3.2Z M8 5.6V11 M16 5.6V11",
  martelo: "M13.2 3.5 20.5 10.8l-2.3 2.3-7.3-7.3Z M14.8 9.2 4.5 19.5",
  adaga: "M20.5 3.5 10.6 13.4l1.9 1.9 9.9-9.9V3.5Z M7.6 12.2l6.2 6.2 M10.2 14.9 5.5 19.6 M4.6 20.5h0",
  chave: "M7.5 8.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M11.5 12.5h9 M17.5 12.5v3.2 M20.5 12.5v2.4",
};

export function IconeConquista({ icone, className = "" }: { icone: Icone; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d={TRACOS[icone]} />
    </svg>
  );
}
