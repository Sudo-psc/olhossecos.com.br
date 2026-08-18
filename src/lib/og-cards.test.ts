import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { guides } from "./guides.ts";
import { publishedArticles } from "./superficie.ts";

/**
 * Os cards OpenGraph são gerados por scripts/build-og-cards.mjs, fora do
 * build: publicar um guia ou artigo sem rodar o script deixaria a página sem
 * imagem de compartilhamento, e a falha só apareceria quando alguém colasse o
 * link em algum lugar.
 *
 * O teste não gera nada — só cobra que o arquivo exista.
 */

test("todo guia tem card OpenGraph próprio", () => {
  const missing = guides
    .map((guide) => `public/images/og/guias/${guide.slug}.png`)
    .filter((path) => !existsSync(path));

  assert.deepEqual(
    missing,
    [],
    `rode node scripts/build-og-cards.mjs:\n${missing.join("\n")}`,
  );
});

test("todo artigo publicado tem card OpenGraph próprio", () => {
  const missing = publishedArticles
    .filter((article) => !article.ogImage)
    .map((article) => `public/images/og/superficie/${article.slug}.png`)
    .filter((path) => !existsSync(path));

  assert.deepEqual(
    missing,
    [],
    `rode node scripts/build-og-cards.mjs:\n${missing.join("\n")}`,
  );
});

test("artigo com capa própria aponta para um arquivo que existe", () => {
  const broken = publishedArticles
    .filter((article) => article.ogImage)
    .map((article) => `public${article.ogImage?.src}`)
    .filter((path) => !existsSync(path));

  assert.deepEqual(broken, []);
});
