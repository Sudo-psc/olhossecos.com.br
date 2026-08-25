import assert from "node:assert/strict";
import { test } from "node:test";

import {
  sortPublishedArticlesByDate,
  publishedArticles,
} from "./superficie.ts";
import {
  relatedContentArticleSlugs,
  selectRelatedContent,
} from "./related-content.ts";

test("cada artigo publicado tem curadoria editorial explícita", () => {
  assert.deepEqual(
    [...relatedContentArticleSlugs].sort(),
    publishedArticles.map(({ slug }) => slug).sort(),
  );
});

test("todo artigo publicado oferece de três a cinco conteúdos relacionados", () => {
  for (const article of publishedArticles) {
    const related = selectRelatedContent(article);
    const hrefs = related.map(({ href }) => href);

    assert.ok(
      related.length >= 3 && related.length <= 5,
      `${article.slug} oferece ${related.length} links`,
    );
    assert.equal(
      new Set(hrefs).size,
      hrefs.length,
      `${article.slug} repete um destino relacionado`,
    );
    assert.ok(
      !hrefs.includes(`/superficie/artigos/${article.slug}`),
      `${article.slug} aponta para si mesmo`,
    );
  }
});

test("a curadoria cruza artigos, guias e páginas-pilar quando o assunto pede", () => {
  const ia = publishedArticles.find(
    ({ slug }) => slug === "ia-na-superficie-ocular",
  );
  const conjuntivocalase = publishedArticles.find(
    ({ slug }) => slug === "a-prega-o-atrito-e-o-piscar",
  );

  assert.ok(ia);
  assert.ok(conjuntivocalase);

  const iaRelated = selectRelatedContent(ia);
  const conjuntivocalaseRelated = selectRelatedContent(conjuntivocalase);

  assert.ok(
    iaRelated.some(
      ({ href }) => href === "/superficie/artigos/alem-do-meiboscore",
    ),
  );
  assert.ok(iaRelated.some(({ href }) => href === "/profissional#diagnostico"));
  assert.ok(
    conjuntivocalaseRelated.some(
      ({ href }) => href === "/guias/conjuntivocalase-olho-seco-mecanico",
    ),
  );
  assert.ok(conjuntivocalaseRelated.some(({ href }) => href === "/causas"));
});

test("a ordenação editorial coloca os artigos mais recentes nos hubs", () => {
  const latest = sortPublishedArticlesByDate(publishedArticles);

  assert.deepEqual(
    latest.slice(0, 5).map(({ slug }) => slug),
    [
      "olho-seco-oct-rnfl",
      "ia-na-superficie-ocular",
      "anti-demodex",
      "terapias-dirigidas-por-mecanismo",
      "prehab-ocular",
    ],
  );
  assert.ok(
    latest.findIndex(({ slug }) => slug === "ia-na-superficie-ocular") <
      latest.findIndex(({ slug }) => slug === "biologia-molecular-da-dgm"),
  );
});
