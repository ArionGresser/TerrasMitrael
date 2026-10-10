import { Carta, PedraDaRaridade } from "./Carta";
import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { rotuloDaMagia, type Magia } from "@/lib/magias";
import { rotuloDaRaridade, type ItemMagico } from "@/lib/itens";
import { COR_DA_RARIDADE } from "@/lib/cartas";

/**
 * As cartas montadas no servidor, com o texto das regras já formatado.
 * Moram na página de cada magia e de cada item; as listas buscam a carta
 * de lá quando alguém toca no cartão.
 */

export function CartaDaMagia({ magia, arte }: { magia: Magia; arte?: string }) {
  const marcas = [magia.concentracao && "Concentração", magia.ritual && "Ritual"].filter(Boolean).join(" · ");
  return (
    <Carta
      tipo="magia"
      nome={magia.nome}
      arte={arte}
      linhaDeTipo={rotuloDaMagia(magia)}
      medalhao={magia.nivel === 0 ? "T" : magia.nivel}
      rodape={marcas || undefined}
    >
      <p className="carta-ficha">
        <strong>Conjuração:</strong> {magia.tempo} · <strong>Alcance:</strong> {magia.alcance} ·{" "}
        <strong>Componentes:</strong> {magia.componentes} · <strong>Duração:</strong> {magia.duracao}
      </p>
      <div className="mt-[0.5em]">
        <TextoDeRegra texto={magia.texto} compacto />
      </div>
    </Carta>
  );
}

export function CartaDoItem({ item, arte }: { item: ItemMagico; arte?: string }) {
  const cor = COR_DA_RARIDADE[item.raridades[0]] ?? COR_DA_RARIDADE.Comum;
  return (
    <Carta
      tipo="item-magico"
      nome={item.nome}
      arte={arte}
      linhaDeTipo={`${item.categoria} · ${rotuloDaRaridade(item)}`}
      medalhao={<PedraDaRaridade cor={cor} />}
      rodape={item.sintonia ? "Exige Sintonia" : undefined}
    >
      <TextoDeRegra texto={item.texto} compacto />
    </Carta>
  );
}
