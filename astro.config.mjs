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
  "/guias/epifora-olho-seco-vias-lacrimais",
  "/guias/olho-seco-lentes-de-contato",
  "/olho-seco",
  "/sinais-de-alerta",
  "/sintomas",
  "/tratamentos",
]);

const revisedOnAugust5 = new Set(["/fontes", "/olho-seco"]);

const revisedOnAugust7 = new Set([
  "/",
  "/livros",
  "/livros/conjuntivocalase-diagnostico-fisiopatologia-abordagem-clinica",
  "/livros/o-custo-invisivel-do-olho-seco",
  "/superficie",
  "/superficie/edicao-00",
  "/autor/philipe-saraiva-cruz",
  "/politica-editorial",
  "/privacidade",
  "/profissionais",
]);

const revisedOnAugust8 = new Set([
  "/newsletter",
  "/superficie",
  "/superficie/parceiros",
  "/privacidade",
]);

const pocRobotsHeader = "noindex, nofollow, noarchive";

const superficiePocHeaders = () => ({
  name: "superficie-poc-headers",
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (
        request.url?.startsWith("/superficie/lab/") ||
        request.url?.startsWith("/superficie/issues/poc/")
      ) {
        response.setHeader("X-Robots-Tag", pocRobotsHeader);
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((request, response, next) => {
      if (
        request.url?.startsWith("/superficie/lab/") ||
        request.url?.startsWith("/superficie/issues/poc/")
      ) {
        response.setHeader("X-Robots-Tag", pocRobotsHeader);
      }
      next();
    });
  },
});

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
        return !new Set([
          "/blog",
          "/videos",
          "/exames",
          "/newsletter/descadastrar",
          "/superficie/lab/flipbook",
        ]).has(path);
      },
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        item.lastmod = revisedOnAugust8.has(path)
          ? "2026-08-08"
          : revisedOnAugust7.has(path)
            ? "2026-08-07"
            : revisedOnAugust5.has(path)
              ? "2026-08-05"
              : revisedOnJuly26.has(path)
                ? "2026-07-26"
                : "2026-07-25";
        return item;
      },
    }),
  ],
  vite: {
    plugins: [superficiePocHeaders()],
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
