import assert from "node:assert/strict";
import { test } from "node:test";
import { highwireTagsForArticle, SUPERFICIE_JOURNAL_TITLE } from "./highwire.ts";
import { publishedArticles } from "./superficie.ts";

test("todo artigo publicado emite as metas Highwire que o Scholar lê", () => {
  for (const article of publishedArticles) {
    const tags = highwireTagsForArticle(article);
    const byName = Object.fromEntries(
      tags.map((tag) => [tag.name, tag.content]),
    );
    assert.equal(byName.citation_title, article.title);
    assert.ok(byName.citation_author);
    assert.equal(byName.citation_journal_title, SUPERFICIE_JOURNAL_TITLE);
    if (article.publishedAt) {
      assert.equal(
        byName.citation_publication_date,
        article.publishedAt.replaceAll("-", "/"),
      );
    }
    if (article.doi) {
      assert.equal(byName.citation_doi, article.doi);
    } else {
      assert.equal(byName.citation_doi, undefined);
    }
  }
});
