import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera o site como arquivos estáticos (HTML/CSS/JS prontos) na pasta out/.
  // O conteúdo de Mitrael não muda sozinho, então não precisamos de servidor:
  // é mais rápido, mais barato e não tem o que quebrar em produção.
  output: "export",

  // Cada página vira uma pasta com index.html — necessário para o Netlify
  // servir as URLs corretamente sem configuração extra.
  trailingSlash: true,

  images: {
    // A otimização automática de imagens do Next precisa de servidor.
    // Como o site é estático, otimizamos os arquivos antes (WebP) e
    // servimos direto.
    unoptimized: true,
  },

  // Permite que páginas sejam escritas em .mdx (texto formatado), além de .tsx
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  experimental: {
    // Necessário para o Next 16 trabalhar com o TypeScript 7.
    useTypeScriptCli: true,
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
