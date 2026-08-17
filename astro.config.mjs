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

const revisedOnAugust15 = new Set([
  "/superficie/edicoes",
  "/superficie/artigos",
]);

const pocRobotsHeader = "noindex, nofollow, noarchive";

const superficiePocHeaders = () => ({
  name: "superficie-poc-headers",
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (
        request.url?.startsWith("/superficie/lab/") ||
        request.url?.startsWith("/superficie/issues/poc/") ||
        request.url?.startsWith("/superficie/issues/edicao-00/")
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
        request.url?.startsWith("/superficie/issues/poc/") ||
        request.url?.startsWith("/superficie/issues/edicao-00/")
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
          "/newsletter/confirmar",
          "/newsletter/descadastrar",
          "/superficie/lab/flipbook",
          "/superficie/lab/edicao-00",
        ]).has(path);
      },
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        const articleLastmod = {
          "/superficie/artigos/a-prega-o-atrito-e-o-piscar": "2026-08-15",
          "/superficie/artigos/alem-do-meiboscore": "2026-08-15",
          "/superficie/artigos/biologia-molecular-da-dgm": "2026-08-15",
          "/superficie/artigos/cinco-testes-cinco-perguntas": "2026-08-15",
          "/superficie/artigos/ia-na-superficie-ocular": "2026-08-17",
          "/superficie/artigos/quando-sintomas-e-sinais-nao-batem": "2026-08-15",
          "/superficie/artigos/tfos-dews-iii-na-pratica": "2026-08-15",
          "/superficie/artigos/tres-meses-nao-sao-doze": "2026-08-17",
        };
        item.lastmod = articleLastmod[path]
          ? articleLastmod[path]
          : revisedOnAugust15.has(path)
            ? "2026-08-15"
            : revisedOnAugust8.has(path)
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
