import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import { lastmodForPath } from "./src/lib/sitemap-lastmod.ts";

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
        item.lastmod = lastmodForPath(new URL(item.url).pathname);
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
