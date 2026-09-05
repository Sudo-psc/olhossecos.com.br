import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  calculateReadingProgress,
  getVisiblePageNumbers,
  normalizePageNumber,
} from "./navigation.ts";
import { resolveHighlightAnchor } from "./highlights.ts";
import { validateIssueManifest } from "./manifest.ts";
import { searchIssue } from "./search.ts";
import { pageFromUrl, shareUrlForPage, urlForPage } from "./url-state.ts";
import { sanitizeStoredReaderData } from "./stored-data.ts";
import type { TextLayerDocument } from "./types.ts";

const validManifest = {
  id: "superficie-poc",
  number: "POC",
  title: "SUPERFÍCIE Reader Prototype",
  pageCount: 2,
  pages: [
    {
      number: 1,
      image: {
        small: "/superficie/issues/test/page-1-small.webp",
        medium: "/superficie/issues/test/page-1-medium.webp",
        large: "/superficie/issues/test/page-1-large.webp",
      },
      thumbnail: "/superficie/issues/test/page-1-thumb.webp",
      textLayer: "/superficie/issues/test/page-1.json",
      type: "cover",
    },
    {
      number: 2,
      image: {
        small: "/superficie/issues/test/page-2-small.webp",
        medium: "/superficie/issues/test/page-2-medium.webp",
        large: "/superficie/issues/test/page-2-large.webp",
      },
      thumbnail: "/superficie/issues/test/page-2-thumb.webp",
      textLayer: "/superficie/issues/test/page-2.json",
      type: "editorial",
    },
  ],
  toc: [{ title: "Editorial", page: 2 }],
  articles: [],
  audioSources: [
    "/superficie/issues/test/audio-1.wav",
    "/superficie/issues/test/audio-2.wav",
  ],
  searchIndex: "/superficie/issues/test/search-index.json",
  pdfFallback: "/superficie/issues/test/fallback.pdf",
};

test("manifest validation rejects a pageCount that differs from the pages", () => {
  const result = validateIssueManifest({ ...validManifest, pageCount: 3 });
  assert.equal(result.success, false);
  assert.match(result.errors.join(" "), /pageCount/u);
});

test("manifest validation accepts the reusable issue contract", () => {
  const result = validateIssueManifest(validManifest);
  assert.equal(result.success, true);
  assert.equal(result.data?.pages[1]?.number, 2);
});

test("manifest validation accepts assets published below a base path", () => {
  const prefixedManifest = JSON.parse(
    JSON.stringify(validManifest).replaceAll(
      '"/superficie/issues/',
      '"/v2/superficie/issues/',
    ),
  );
  const result = validateIssueManifest(prefixedManifest, "/v2");
  assert.equal(result.success, true);
});

test("manifest validation accepts a portrait pageSize and rejects nonsense", () => {
  const accepted = validateIssueManifest({
    ...validManifest,
    pageSize: { width: 1400, height: 1867 },
  });
  assert.equal(accepted.success, true, accepted.errors.join("\n"));
  assert.deepEqual(accepted.data?.pageSize, { width: 1400, height: 1867 });
  for (const pageSize of [
    { width: 0, height: 1867 },
    { width: 1400.5, height: 1867 },
    { width: 1867, height: 1400 },
    { width: 100, height: 1867 },
    "1400x1867",
  ]) {
    const rejected = validateIssueManifest({ ...validManifest, pageSize });
    assert.equal(rejected.success, false, JSON.stringify(pageSize));
    assert.match(rejected.errors.join(" "), /pageSize/u);
  }
});

test("published issues declare the pixel size of their plates", async () => {
  for (const [issue, expected] of [
    ["edicao-00", { width: 1400, height: 1867 }],
    ["poc", { width: 1400, height: 1980 }],
  ] as const) {
    const manifest = JSON.parse(
      await readFile(`public/superficie/issues/${issue}/manifest.json`, "utf8"),
    );
    assert.deepEqual(manifest.pageSize, expected, issue);
  }
});

test("the reader rehydrates the text window when the flip engine mounts", async () => {
  const source = await readFile("src/superficie/reader/reader-app.ts", "utf8");
  const upgrade = source.slice(
    source.indexOf("private async upgradeToPageFlip"),
    source.indexOf("private async rebuildAdapter"),
  );
  assert.match(upgrade, /hydrateWindow\(this\.currentPage\)/u);
  assert.doesNotMatch(upgrade, /hydrateImages/u);
  const mount = source.slice(
    source.indexOf("private mountVisibleReader"),
    source.indexOf("private async upgradeToPageFlip"),
  );
  assert.match(mount, /hydrateWindow\(this\.currentPage\)/u);
});

test("manifest validation rejects external assets and invalid references", () => {
  const unsafe = {
    ...validManifest,
    searchIndex: "https://attacker.example/index.json",
    toc: [{ title: "Fora", page: 9 }],
    articles: [
      { id: "duplicado", title: "A", pages: [1], htmlPath: "/article-a" },
      { id: "duplicado", title: "B", pages: [3], htmlPath: "/article-b" },
    ],
  };
  const result = validateIssueManifest(unsafe);
  assert.equal(result.success, false);
  assert.match(result.errors.join(" "), /searchIndex/u);
  assert.match(result.errors.join(" "), /toc/u);
  assert.match(result.errors.join(" "), /articles/u);
});

test("manifest validation rejects encoded traversal and cross-issue assets", () => {
  const encodedTraversal = {
    ...validManifest,
    searchIndex: "/superficie/issues/test/%2e%2e/private.json",
  };
  assert.equal(validateIssueManifest(encodedTraversal).success, false);

  const crossIssue = {
    ...validManifest,
    pages: validManifest.pages.map((page, index) =>
      index === 0
        ? {
            ...page,
            thumbnail: "/superficie/issues/another/page-1-thumb.webp",
          }
        : page,
    ),
  };
  assert.equal(validateIssueManifest(crossIssue).success, false);
});

test("reader chrome does not seed a POC pageCount of 8", async () => {
  const markup = await readFile(
    "src/superficie/reader/components/MagazineReader.astro",
    "utf8",
  );
  const viewport = await readFile(
    "src/superficie/reader/components/PageViewport.astro",
    "utf8",
  );
  const lab = await readFile(
    "src/pages/superficie/lab/edicao-00.astro",
    "utf8",
  );
  assert.match(markup, /data-page-count>\{pageCount \?\? ""\}<\/span>/u);
  assert.match(markup, /data-page-total hidden=\{!pageCount\}/u);
  assert.doesNotMatch(markup, /data-page-count>\s*8\s*</u);
  assert.doesNotMatch(markup, /READER PROTOTYPE/iu);
  assert.doesNotMatch(markup, /Prototype · POC/iu);
  assert.doesNotMatch(viewport, /superficie-poc\.pdf/u);
  assert.doesNotMatch(viewport, /PDF de teste/u);
  assert.doesNotMatch(viewport, /Reader Prototype/iu);
  assert.match(viewport, /PDF da edição/u);
  assert.match(lab, /edicao-00\/manifest\.json/u);
  assert.match(lab, /pageCount=\{issue\.pageCount\}/u);
  assert.match(lab, /withoutAdPages/u);
  assert.match(lab, /pdfHref=\{issue\.pdfFallback\}/u);
  assert.doesNotMatch(lab, /superficie-poc/u);
  assert.doesNotMatch(lab, /READER PROTOTYPE/iu);
});

test("reader reveals the cover before importing page-flip", async () => {
  const source = await readFile("src/superficie/reader/reader-app.ts", "utf8");
  const startAt = source.indexOf("async start()");
  const startBlock = source.slice(
    startAt,
    source.indexOf("private async loadManifest"),
  );
  assert.match(startBlock, /this\.mountVisibleReader\(\)/u);
  assert.match(startBlock, /void this\.upgradeToPageFlip\(\)/u);
  assert.doesNotMatch(startBlock, /await this\.rebuildAdapter\(\)/u);
  assert.doesNotMatch(startBlock, /await import\(/u);
});

test("reader default zoom fits the page in the viewport", async () => {
  const source = await readFile("src/superficie/reader/reader-app.ts", "utf8");
  assert.match(source, /zoomMode: "fit-page"/u);
  assert.match(source, /fitA4Page/u);
  assert.match(source, /withoutAdPages/u);
});

test("reader masks the internal lab stamp without rewriting sealed copy", async () => {
  const renderer = await readFile(
    "src/superficie/reader/page-renderer.ts",
    "utf8",
  );
  const css = await readFile("src/superficie/reader/reader.css", "utf8");
  assert.match(renderer, /lab-stamp-mask/u);
  assert.match(renderer, /não indexar/iu);
  assert.match(css, /\.lab-stamp-mask/u);
});

test("generated edicao-00 manifest is a self-contained editorial issue", async () => {
  const rawManifest = JSON.parse(
    await readFile("public/superficie/issues/edicao-00/manifest.json", "utf8"),
  );
  const result = validateIssueManifest(rawManifest);
  assert.equal(result.success, true, result.errors.join("\n"));
  assert.equal(result.data?.id, "edicao-00");
  assert.equal(result.data?.pageCount, 27);
  assert.equal(result.data?.pages.length, 27);
  assert.equal(result.data?.toc.length, 13);
  assert.equal(result.data?.articles.length, 2);
  assert.equal(result.data?.articles[0]?.pages.join(","), "4,5");
  assert.equal(result.data?.articles[1]?.pages.join(","), "6,7");
  assert.equal(result.data?.pages[3]?.articleId, "biologia-molecular-da-dgm");
  assert.equal(result.data?.pages[5]?.articleId, "tfos-dews-iii-na-pratica");
  assert.equal(
    result.data?.pages.some((page) => page.type === "ad"),
    false,
  );
  assert.equal(result.data?.pages.filter((page) => page.articleId).length, 4);
  assert.equal(result.data?.audioSources.length, 3);
  assert.ok(
    result.data?.audioSources.every((source) =>
      source.startsWith("/superficie/issues/edicao-00/"),
    ),
  );
});

test("landing /superficie/edicao-00 stays outside the lab reader", async () => {
  const landing = await readFile(
    "src/pages/superficie/edicao-00.astro",
    "utf8",
  );
  assert.doesNotMatch(landing, /MagazineReader/u);
  assert.doesNotMatch(landing, /data-magazine-reader/u);
  assert.doesNotMatch(landing, /lab\/edicao-00/u);
  assert.match(landing, /SuperficieLayout/u);
});

test("reader chrome can be hidden and restored from markup", async () => {
  const toolbar = await readFile(
    "src/superficie/reader/components/ReaderToolbar.astro",
    "utf8",
  );
  const shell = await readFile(
    "src/superficie/reader/components/MagazineReader.astro",
    "utf8",
  );
  const css = await readFile("src/superficie/reader/reader.css", "utf8");
  const app = await readFile("src/superficie/reader/reader-app.ts", "utf8");
  assert.match(toolbar, /data-action="hide-chrome"/u);
  assert.match(shell, /data-action="show-chrome"/u);
  assert.match(shell, /data-chrome-restore/u);
  assert.match(shell, /data-chrome-page-label/u);
  assert.match(css, /data-chrome-hidden/u);
  assert.match(css, /reader-chrome-restore-nav/u);
  assert.match(app, /setChromeHidden/u);
  assert.match(app, /event\.key === "Escape"/u);
});

test("edicao-00 article text layers do not stack body paragraphs", async () => {
  for (const page of [5, 6, 7, 8]) {
    const layer: TextLayerDocument = JSON.parse(
      await readFile(
        `public/superficie/issues/edicao-00/text/page-${String(page).padStart(2, "0")}.json`,
        "utf8",
      ),
    );
    const paragraphs = layer.blocks.filter((block) =>
      String(block.id).includes("-paragraph-"),
    );
    assert.ok(paragraphs.length >= 2, `página ${page} sem parágrafos`);
    for (let index = 1; index < paragraphs.length; index += 1) {
      const previous = paragraphs[index - 1];
      const current = paragraphs[index];
      assert.ok(
        current.y >= previous.y + previous.height,
        `página ${page}: ${current.id} colide com ${previous.id}`,
      );
    }
  }
});

test("edicao-00 TFOS verso keeps the nine-drivers caption in the text layer", async () => {
  const layer: TextLayerDocument = JSON.parse(
    await readFile(
      "public/superficie/issues/edicao-00/text/page-08.json",
      "utf8",
    ),
  );
  const caption = layer.blocks.find((block) =>
    String(block.id).includes("figure-caption"),
  );
  assert.ok(caption, "página 8 sem legenda da figura");
  assert.match(String(caption.text), /mapa dos nove drivers/u);
  assert.match(String(caption.text), /TFOS DEWS III/u);
});

test("generated POC manifest contains eight replaceable pages", async () => {
  const rawManifest = JSON.parse(
    await readFile("public/superficie/issues/poc/manifest.json", "utf8"),
  );
  const result = validateIssueManifest(rawManifest);
  assert.equal(result.success, true, result.errors.join("\n"));
  assert.equal(result.data?.pageCount, 8);
  assert.equal(result.data?.toc.length, 4);
  assert.equal(result.data?.articles[0]?.pages.join(","), "4,5");
  assert.equal(result.data?.audioSources.length, 3);
});

test("navigation clamps pages and keeps the cover isolated", () => {
  assert.equal(normalizePageNumber(-4, 8), 1);
  assert.equal(normalizePageNumber(12, 8), 8);
  assert.deepEqual(getVisiblePageNumbers(1, 8, "double"), [1]);
  assert.deepEqual(getVisiblePageNumbers(4, 8, "double"), [4, 5]);
  assert.deepEqual(getVisiblePageNumbers(5, 8, "double"), [4, 5]);
  assert.deepEqual(getVisiblePageNumbers(8, 8, "double"), [8]);
  assert.deepEqual(getVisiblePageNumbers(4, 8, "single"), [4]);
});

test("reading progress is stable at the boundaries", () => {
  assert.equal(calculateReadingProgress(1, 8), 12.5);
  assert.equal(calculateReadingProgress(4, 8), 50);
  assert.equal(calculateReadingProgress(8, 8), 100);
});

test("stored reader data discards corrupt or cross-issue records", () => {
  const sanitized = sanitizeStoredReaderData("issue-a", 8, {
    progress: {
      issueId: "issue-a",
      page: 99,
      percent: 200,
      updatedAt: "invalid",
    },
    preferences: {
      issueId: "issue-a",
      soundEnabled: "yes",
      reducedMotion: false,
      toolbarMinimized: false,
      zoomMode: "custom",
      zoomPercent: 150,
    },
    bookmarks: [
      {
        id: "valid",
        issueId: "issue-a",
        page: 4,
        createdAt: "2026-08-08T12:00:00.000Z",
      },
      {
        id: "foreign",
        issueId: "issue-b",
        page: 4,
        createdAt: "2026-08-08T12:00:00.000Z",
      },
    ],
    highlights: [{ id: "broken", issueId: "issue-a", page: 4 }],
    notes: [
      {
        id: "bad-date",
        issueId: "issue-a",
        page: 4,
        text: "nota",
        createdAt: "invalid",
        updatedAt: "invalid",
      },
    ],
  });

  assert.equal(sanitized.progress, null);
  assert.equal(sanitized.preferences, null);
  assert.deepEqual(
    sanitized.bookmarks.map((entry) => entry.id),
    ["valid"],
  );
  assert.deepEqual(sanitized.highlights, []);
  assert.deepEqual(sanitized.notes, []);

  const stringZoom = sanitizeStoredReaderData("issue-a", 8, {
    progress: null,
    preferences: {
      issueId: "issue-a",
      soundEnabled: false,
      reducedMotion: false,
      toolbarMinimized: false,
      zoomMode: "custom",
      zoomPercent: "150",
    },
    bookmarks: [],
    highlights: [],
    notes: [],
  });
  assert.equal(stringZoom.preferences, null);
});

test("search ignores accents and returns a useful page snippet", () => {
  const results = searchIssue(
    [
      { page: 2, text: "Uma edição de demonstração com leitura tranquila." },
      {
        page: 4,
        text: "A superfície editorial combina imagem e uma camada de texto selecionável.",
      },
    ],
    "superficie",
  );

  assert.equal(results.length, 1);
  assert.equal(results[0]?.page, 4);
  assert.match(results[0]?.snippet ?? "", /superfície editorial/u);
});

test("highlight anchors survive text inserted before the selection", () => {
  const anchor = {
    exact: "camada de texto",
    prefix: "imagem e uma ",
    suffix: " selecionável",
    start: 38,
    end: 53,
  };

  assert.deepEqual(
    resolveHighlightAnchor(
      "Nota de revisão. A superfície editorial combina imagem e uma camada de texto selecionável.",
      anchor,
    ),
    { start: 61, end: 76 },
  );
});

test("URL state clamps deep links and preserves unrelated query parameters", () => {
  assert.equal(pageFromUrl("https://example.test/reader?page=5", 8), 5);
  assert.equal(pageFromUrl("https://example.test/reader?page=99", 8), 8);
  assert.equal(pageFromUrl("https://example.test/reader?page=zero", 8), 1);
  assert.equal(
    urlForPage("https://example.test/reader?utm_source=qa&page=2", 7),
    "https://example.test/reader?utm_source=qa&page=7",
  );
  assert.equal(
    shareUrlForPage(
      "https://example.test/reader?page=2&token=segredo&utm_source=qa",
      7,
    ),
    "https://example.test/reader?page=7",
  );
});
