import type { Metadata, Viewport } from "next";
import { Cinzel, Lora } from "next/font/google";
import "./globals.css";

// As fontes são baixadas durante o build e servidas junto com o site.
// Nenhuma chamada ao Google no navegador do jogador: carrega mais rápido
// e não vaza dados de quem acessa.

const fonteTitulo = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--fonte-titulo",
  display: "swap",
});

const fonteCorpo = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--fonte-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Terras de Mitrael",
    template: "%s — Terras de Mitrael",
  },
  description:
    "Cenário autoral de RPG de mesa em fantasia medieval. Explore os locais, os eventos que moldaram a história e os heróis que caminharam por Mitrael.",
  keywords: ["RPG", "D&D", "fantasia medieval", "cenário autoral", "Mitrael", "mesa"],
  authors: [{ name: "Arion Gresser" }],
  openGraph: {
    title: "Terras de Mitrael",
    description:
      "Cenário autoral de RPG de mesa em fantasia medieval. Um mundo vivo, construído mesa após mesa.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#241609",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteCorpo.variable}`}>
      <body className="textura-madeira min-h-dvh">{children}</body>
    </html>
  );
}
