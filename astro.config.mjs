import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import { writeFile } from "node:fs/promises";
import { lastmodForPath } from "./src/lib/sitemap-lastmod.ts";
import { discoveryStaticHeaders } from "./src/lib/discovery.ts";
import { isIndexableSitemapPath } from "./src/lib/seo.ts";

const pocRobotsHeader = "noindex, nofollow, noarchive";

const configuredBasePath = process.env.SITE_BASE_PATH?.trim() || "";
const basePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/gu, "")}`
  : "";
const siteOrigin = "https://olhossecos.com.br";

const logicalPath = (pathname) => {
  const normalized = pathname.replace(/\/$/u, "") || "/";
  if (
    basePath &&
    (normalized === basePath || normalized.startsWith(`${basePath}/`))
  ) {
    return normalized.slice(basePath.length) || "/";
  }
  return normalized;
};

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
  site: siteOrigin,
  base: basePath || undefined,
  output: "static",
  trailingSlash: "never",
  devToolbar: {
    enabled: false,
  },
  adapter: node({
    mode: "standalone",
    staticHeaders: true,
  }),
  integrations: [
    sitemap({
      filter: (page) =>
        isIndexableSitemapPath(logicalPath(new URL(page).pathname)),
      serialize(item) {
        item.lastmod = lastmodForPath(logicalPath(new URL(item.url).pathname));
        return item;
      },
    }),
    {
      name: "discovery-static-headers",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          await writeFile(
            new URL("_headers.json", dir),
            `${JSON.stringify(discoveryStaticHeaders, null, 2)}\n`,
          );
        },
      },
    },
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
