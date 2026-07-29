import type { ComponentType } from "react";

import * as razavar from "@/content/locais/razavar.mdx";
import * as askar from "@/content/locais/askar.mdx";
import * as sovaraMithr from "@/content/locais/sovara-mithr.mdx";
import * as vernaculo from "@/content/locais/vernaculo.mdx";
import * as arauto from "@/content/locais/arauto.mdx";
import * as putrefados from "@/content/locais/putrefados.mdx";

export type MetaLocal = {
  slug: string;
  nome: string;
  subtitulo: string;
  resumo: string;
  chamada: string;
  imagem: string;
  imagemAlt: string;
  ordem: number;
};

export type Local = {
  meta: MetaLocal;
  Conteudo: ComponentType;
};

/**
 * Para adicionar um local novo:
 * 1. crie o arquivo em content/locais/nome-do-local.mdx
 * 2. importe-o acima
 * 3. acrescente-o à lista abaixo
 *
 * A ordem de exibição vem do campo `ordem` de cada arquivo, não daqui.
 */
const MODULOS = [razavar, askar, sovaraMithr, vernaculo, arauto, putrefados];

export const LOCAIS: Local[] = MODULOS.map((modulo) => ({
  meta: modulo.meta as MetaLocal,
  Conteudo: modulo.default as ComponentType,
})).sort((a, b) => a.meta.ordem - b.meta.ordem);

export function buscarLocal(slug: string): Local | undefined {
  return LOCAIS.find((local) => local.meta.slug === slug);
}
