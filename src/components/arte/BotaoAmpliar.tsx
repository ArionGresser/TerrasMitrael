/**
 * A lupa no canto de uma arte. Não tem código próprio: guarda a imagem nos
 * atributos, e o Ampliador (montado uma vez só, na Mesa) abre a arte grande
 * quando alguém toca nela. Assim cada ilustração do site ganha o zoom sem
 * carregar nada a mais.
 *
 * Vai dentro do quadro da arte, que precisa ser `relative`.
 */
export function BotaoAmpliar({ src, alt, legenda }: { src: string; alt: string; legenda?: string }) {
  return (
    <button
      type="button"
      className="botao-ampliar"
      data-ampliar={src}
      data-alt={alt}
      data-legenda={legenda}
      aria-label={alt ? `Ampliar a imagem: ${alt}` : "Ampliar a imagem"}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6" />
      </svg>
    </button>
  );
}
