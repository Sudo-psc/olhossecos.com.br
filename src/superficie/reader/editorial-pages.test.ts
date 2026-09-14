import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  buildEditorialPageMap,
  printFolio,
  remapSearchIndex,
  withoutAdPages,
} from "./editorial-pages.ts";
import { validateIssueManifest } from "./manifest.ts";
import { validateSearchIndex } from "./search.ts";
import type { IssueManifest, SearchIndexEntry } from "./types.ts";

test("withoutAdPages drops only type=ad and rebuilds consecutive pagination", () => {
  const manifest = {
    id: "lab",
    number: "00",
    title: "Teste",
    pageCount: 5,
    pages: [
      {
        number: 1,
        type: "cover",
        image: dummyImage(1),
        thumbnail: dummyAsset(1),
        textLayer: dummyAsset(1),
      },
      {
        number: 2,
        type: "ad",
        image: dummyImage(2),
        thumbnail: dummyAsset(2),
        textLayer: dummyAsset(2),
        alt: "Página 2: PUBLICIDADE.",
      },
      {
        number: 3,
        type: "article",
        articleId: "dgm",
        image: dummyImage(3),
        thumbnail: dummyAsset(3),
        textLayer: dummyAsset(3),
        alt: "Página 3: DGM.",
      },
      {
        number: 4,
        type: "article",
        image: dummyImage(4),
        thumbnail: dummyAsset(4),
        textLayer: dummyAsset(4),
      },
      {
        number: 5,
        type: "ad",
        image: dummyImage(5),
        thumbnail: dummyAsset(5),
        textLayer: dummyAsset(5),
      },
    ],
    toc: [
      { title: "Capa", page: 1 },
      { title: "DGM", page: 3 },
    ],
    articles: [{ id: "dgm", title: "DGM", pages: [3] }],
    audioSources: [dummyAsset(1), dummyAsset(2)],
    searchIndex: dummyAsset(1),
    pdfFallback: dummyAsset(2),
  } as IssueManifest;

  const editorial = withoutAdPages(manifest);
  assert.equal(editorial.pageCount, 3);
  assert.deepEqual(
    editorial.pages.map((page) => [page.number, page.type]),
    [
      [1, "cover"],
      [2, "article"],
      [3, "article"],
    ],
  );
  assert.equal(editorial.pages[1]?.articleId, "dgm");
  assert.equal(editorial.pages[1]?.sourcePage, 3);
  assert.equal(editorial.pages[1]?.alt, "Página 2: DGM.");
  assert.deepEqual(
    editorial.pages.map((page) => [page.number, page.sourcePage]),
    [
      [1, 1],
      [2, 3],
      [3, 4],
    ],
  );
  assert.deepEqual(editorial.toc, [
    { title: "Capa", page: 1 },
    { title: "DGM", page: 2 },
  ]);
  assert.deepEqual(editorial.articles[0]?.pages, [2]);
  assert.equal(
    editorial.pages.some((page) => page.type === "ad"),
    false,
  );
});

test("withoutAdPages never drops type=article even if the filename looks like pub", () => {
  const manifest = {
    id: "lab",
    number: "00",
    title: "Teste",
    pageCount: 2,
    pages: [
      {
        number: 1,
        type: "article",
        image: {
          small: "/superficie/issues/test/p02-pub-lookalike-small.webp",
          medium: "/superficie/issues/test/p02-pub-lookalike-medium.webp",
          large: "/superficie/issues/test/p02-pub-lookalike-large.webp",
        },
        thumbnail: "/superficie/issues/test/p02-pub-lookalike-thumb.webp",
        textLayer: "/superficie/issues/test/p02-pub-lookalike.json",
      },
      {
        number: 2,
        type: "ad",
        image: dummyImage(2),
        thumbnail: dummyAsset(2),
        textLayer: dummyAsset(2),
      },
    ],
    toc: [],
    articles: [],
    audioSources: [dummyAsset(1), dummyAsset(2)],
    searchIndex: dummyAsset(1),
    pdfFallback: dummyAsset(2),
  } as IssueManifest;

  const editorial = withoutAdPages(manifest);
  assert.equal(editorial.pageCount, 1);
  assert.equal(editorial.pages[0]?.type, "article");
  assert.match(editorial.pages[0]?.image.medium ?? "", /p02-pub-lookalike/u);
});

test("edicao-00 lab manifest has no ads and keeps DGM/TFOS after reindex", async () => {
  const raw = JSON.parse(
    await readFile("public/superficie/issues/edicao-00/manifest.json", "utf8"),
  ) as IssueManifest;
  const inventoryAds = raw.pages.filter((page) => page.type === "ad");
  assert.ok(
    inventoryAds.length === 0 || inventoryAds.length >= 7,
    "inventário original deve ter as 7 páginas type=ad ou já estar filtrado",
  );

  const editorial = withoutAdPages(raw);
  const validated = validateIssueManifest(editorial);
  assert.equal(validated.success, true, validated.errors.join("\n"));
  assert.equal(editorial.pageCount, 27);
  assert.equal(editorial.pages.length, 27);
  assert.equal(
    editorial.pages.some((page) => page.type === "ad"),
    false,
  );
  assert.equal(
    editorial.pages.some((page) => /PUBLICIDADE/iu.test(page.alt ?? "")),
    false,
  );
  assert.equal(editorial.pages[3]?.articleId, "biologia-molecular-da-dgm");
  assert.equal(editorial.pages[3]?.number, 4);
  assert.equal(editorial.pages[3]?.sourcePage, 5);
  assert.equal(printFolio(editorial.pages[3]!), 5);
  assert.match(editorial.pages[3]?.textLayer ?? "", /page-05\.json$/u);
  assert.equal(editorial.pages[4]?.articleId, "biologia-molecular-da-dgm");
  assert.equal(editorial.pages[4]?.sourcePage, 6);
  assert.equal(editorial.pages[5]?.articleId, "tfos-dews-iii-na-pratica");
  assert.equal(editorial.pages[5]?.sourcePage, 7);
  assert.equal(printFolio(raw.pages[3]!), 5);
  assert.deepEqual(editorial.articles[0]?.pages, [4, 5]);
  assert.deepEqual(editorial.articles[1]?.pages, [6, 7]);
  assert.equal(
    editorial.toc.find((entry) => entry.title.includes("DGM"))?.page,
    4,
  );
});

test("edicao-00 search index remaps with the editorial page map", async () => {
  const raw = JSON.parse(
    await readFile("public/superficie/issues/edicao-00/manifest.json", "utf8"),
  ) as IssueManifest;
  const index = JSON.parse(
    await readFile(
      "public/superficie/issues/edicao-00/search-index.json",
      "utf8",
    ),
  ) as SearchIndexEntry[];
  const editorial = withoutAdPages(raw);
  const remapped = remapSearchIndex(index, buildEditorialPageMap(raw.pages));
  const validated = validateSearchIndex(remapped, editorial.pageCount);
  assert.ok(validated);
  assert.equal(validated?.length, editorial.pageCount);
  assert.equal(
    remapped.filter((entry) => /^PUBLICIDADE \d+$/u.test(entry.text.trim()))
      .length,
    0,
  );
  const dgm = remapped.find((entry) => entry.text.includes("fenotipar melhor"));
  assert.equal(dgm?.page, 4);
});

function dummyAsset(page: number): string {
  return `/superficie/issues/test/page-${page}.json`;
}

function dummyImage(page: number) {
  return {
    small: `/superficie/issues/test/page-${page}-small.webp`,
    medium: `/superficie/issues/test/page-${page}-medium.webp`,
    large: `/superficie/issues/test/page-${page}-large.webp`,
  };
}
