/**
 * O crédito que a licença Creative Commons pede: de onde vem o texto, sob
 * qual licença, e que ele foi modificado (traduzido). Aparece no grimório e
 * em toda página de magia.
 */
export function CreditoSrd({ className = "" }: { className?: string }) {
  return (
    <p className={`text-tinta-500 mx-auto max-w-lg text-center text-[0.7rem] leading-relaxed ${className}`}>
      Este trabalho inclui material do System Reference Document 5.2.1
      (&ldquo;SRD 5.2.1&rdquo;) da Wizards of the Coast LLC, disponível em{" "}
      <a
        href="https://www.dndbeyond.com/srd"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        dndbeyond.com/srd
      </a>
      . O SRD 5.2.1 é licenciado sob a{" "}
      <a
        href="https://creativecommons.org/licenses/by/4.0/legalcode.pt"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        Licença Creative Commons Atribuição 4.0 Internacional
      </a>
      . Texto traduzido para o português por Terras de Mitrael, sem fins
      lucrativos e sem vínculo com a Wizards of the Coast.
    </p>
  );
}
