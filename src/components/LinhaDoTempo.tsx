import { CRONOLOGIA } from "@/lib/eventos";
import { Revelar } from "@/components/ui/Revelar";
import { TituloCapitulo } from "@/components/ui/Titulo";

/**
 * A cronologia da Terceira Era.
 * Marcos graves recebem o vermelho heráldico; os demais, o dourado.
 */
export function LinhaDoTempo() {
  return (
    <ol className="relative">
      {/* O fio que atravessa a linha do tempo */}
      <span
        aria-hidden
        className="via-dourado-600/40 absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-transparent to-transparent"
      />

      {CRONOLOGIA.map((marco, i) => (
        <li key={`${marco.ano}-${marco.titulo}`} className="relative pl-8 pb-7 last:pb-0">
          <Revelar atraso={i * 0.05} direcao="esquerda">
            <span
              aria-hidden
              className={`absolute top-[7px] left-0 size-[15px] rounded-full border-2 ${
                marco.peso === "grave"
                  ? "bg-heraldico-vermelho border-heraldico-vermelho/40"
                  : "bg-dourado-500 border-dourado-500/40"
              }`}
            />

            <p className="font-titulo text-tinta-500 text-[0.7rem] tracking-[0.2em] uppercase">
              {marco.ano}
            </p>

            <TituloCapitulo className="mt-1">{marco.titulo}</TituloCapitulo>

            <p className="text-tinta-700 mt-1.5 text-sm leading-relaxed">
              {marco.texto}
            </p>
          </Revelar>
        </li>
      ))}
    </ol>
  );
}
