import { TextoDeRegra } from "@/components/magias/TextoDeRegra";
import { buscarDocumento } from "@/lib/regras";

/** As regras que a ficha viva abre no "?", já formatadas aqui no servidor. */
const REGRAS_DA_FICHA = [
  "pontos-de-vida",
  "pontos-de-vida-temporarios",
  "dados-de-vida",
  "descanso-curto",
  "descanso-longo",
  "inspiracao-heroica",
];

export function regrasDaFicha() {
  const itens = buscarDocumento("glossario")?.grupos.flatMap((g) => g.itens) ?? [];
  return Object.fromEntries(
    REGRAS_DA_FICHA.flatMap((id) => {
      const item = itens.find((i) => i.id === id);
      // Os links do glossário apontam para âncoras da página dele
      return item ? [[id, <TextoDeRegra key={id} texto={item.texto.replaceAll("](#", "](/regras/glossario/#")} compacto />]] : [];
    })
  );
}
