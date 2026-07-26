import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://olhossecos.com.br",
  output: "static",
  devToolbar: {
    enabled: false,
  },
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/studio/"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
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
