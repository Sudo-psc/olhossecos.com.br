import assert from "node:assert/strict";
import { test } from "node:test";
import {
  alternateFeedsForPath,
  escapeXml,
  pacienteEntries,
  radarEntries,
  renderJsonFeed,
  renderRss,
  superficieEntries,
} from "./feeds.ts";

test("RSS 2.0 de cada canal traz item, guid e atom:self", () => {
  for (const channel of ["paciente", "superficie", "radar"] as const) {
    const rss = renderRss(channel);
    assert.match(rss, /<rss version="2.0"/);
    assert.match(rss, /<atom:link [^>]*rel="self"/);
    assert.match(rss, /<item>/);
    assert.match(rss, /<guid isPermaLink="true">/);
    assert.doesNotMatch(rss, /&(?!amp;|lt;|gt;|quot;|apos;)/);
  }
});

test("JSON Feed 1.1 de cada canal tem itens com data", () => {
  for (const channel of ["paciente", "superficie", "radar"] as const) {
    const feed = renderJsonFeed(channel);
    assert.equal(feed.version, "https://jsonfeed.org/version/1.1");
    assert.ok(feed.items.length > 0);
    assert.ok(feed.items[0]?.date_published?.startsWith("20"));
    assert.ok(feed.items[0]?.url?.startsWith("https://olhossecos.com.br/"));
  }
});

test("os canais não misturam conteúdo", () => {
  const paciente = new Set(pacienteEntries().map((entry) => entry.url));
  const superficie = new Set(superficieEntries().map((entry) => entry.url));
  const radar = new Set(radarEntries().map((entry) => entry.url));

  for (const url of superficie) assert.equal(paciente.has(url), false);
  for (const url of radar) {
    assert.equal(paciente.has(url), false);
    assert.equal(superficie.has(url), false);
  }
});

test("rel=alternate segue o portal da página", () => {
  const home = alternateFeedsForPath("/");
  assert.equal(home.length, 6);
  assert.deepEqual(
    alternateFeedsForPath("/guias/olho-seco-guia-essencial").map(
      (feed) => feed.href,
    ),
    ["/rss.xml", "/feed.json"],
  );
  assert.ok(
    alternateFeedsForPath("/superficie/artigos").some((feed) =>
      feed.href.startsWith("/superficie/rss"),
    ),
  );
  assert.deepEqual(
    alternateFeedsForPath("/superficie/radar/agosto-2026").map(
      (feed) => feed.href,
    ),
    ["/superficie/radar/rss.xml", "/superficie/radar/feed.json"],
  );
});

test("escapeXml cobre os cinco caracteres do XML", () => {
  assert.equal(escapeXml(`&<>"'`), "&amp;&lt;&gt;&quot;&apos;");
});
