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

/**
 * Dois artigos traziam foto de capa própria e os outros dez caíam no card
 * gerado. O resultado aparecia em dois lugares: na home da revista, onde dois
 * cards vinham com imagem e dez sem, e no preview de compartilhamento, onde os
 * mesmos dois mostravam a foto em vez do card com o título.
 *
 * A capa por artigo continua sendo possível — os campos seguem no tipo. Mas
 * volta como decisão de arte para a coleção inteira, não para um artigo
 * isolado, porque é a mistura que quebra a grade.
 */
test("nenhum artigo publicado carrega capa própria", () => {
  const comCapa = publishedArticles
    .filter(
      (article) =>
        article.featuredImage ?? article.heroBackground ?? article.ogImage,
    )
    .map((article) => article.slug);

  assert.deepEqual(
    comCapa,
    [],
    `a listagem mistura card com e sem imagem: ${comCapa.join(", ")}`,
  );
});
