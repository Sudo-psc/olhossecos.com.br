import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { guides } from "./guides.ts";
import { publishedArticles } from "./superficie.ts";

const portalSectionCards = [
  "home",
  "sintomas",
  "causas",
  "diagnostico",
  "tratamentos",
  "autocuidado",
  "sinais-de-alerta",
  "guias",
  "olho-seco",
  "glossario",
  "profissionais",
  "newsletter",
  "app",
];

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

test("as seções do portal têm card OpenGraph próprio", () => {
  const missing = portalSectionCards
    .map((slug) => `public/images/og/og-${slug}.png`)
    .filter((path) => !existsSync(path));

  assert.deepEqual(
    missing,
    [],
    `rode node scripts/build-og-cards.mjs:\n${missing.join("\n")}`,
  );
});

test("toda página que pede card de seção aponta para um arquivo existente", async () => {
  const collect = async (directory: string): Promise<string[]> => {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return collect(path);
        return entry.name.endsWith(".astro") ? [path] : [];
      }),
    );
    return files.flat();
  };

  const missing: string[] = [];
  for (const file of await collect("src/pages")) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(
      /image=["'](\/images\/og\/og-[^"']+\.png)["']/gu,
    )) {
      const relative = `public${match[1]}`;
      if (!existsSync(relative)) missing.push(`${file} → ${relative}`);
    }
  }

  assert.deepEqual(
    missing,
    [],
    `página pede card que o script ainda não gera:\n${missing.join("\n")}`,
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

test("a vitrine de livros tem o card OpenGraph que a página declara", () => {
  assert.equal(
    existsSync("public/images/livros/og-livros.png"),
    true,
    "public/images/livros/og-livros.png",
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
