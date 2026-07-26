import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

const revisedOnJuly26 = new Set([
  "/",
  "/app",
  "/autocuidado",
  "/causas",
  "/diagnostico",
  "/fontes",
  "/glossario",
  "/guias",
  "/olho-seco",
  "/sinais-de-alerta",
  "/sintomas",
  "/tratamentos",
]);

export default defineConfig({
  site: "https://olhossecos.com.br",
  output: "static",
  trailingSlash: "never",
  devToolbar: {
    enabled: false,
  },
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, "") || "/";
        return !new Set(["/blog", "/videos", "/exames"]).has(path);
      },
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        item.lastmod = revisedOnJuly26.has(path) ? "2026-07-26" : "2026-07-25";
        return item;
      },
    }),
  ],
  vite: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
  },
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
});
