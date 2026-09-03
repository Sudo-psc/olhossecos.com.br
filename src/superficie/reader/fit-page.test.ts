import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { A4_PAGE_RATIO, fitA4Page } from "./fit-page.ts";

test("fitA4Page keeps a single A4 page inside the viewport without crop", () => {
  const fitted = fitA4Page(800, 600, 1);
  assert.ok(fitted.width <= 800);
  assert.ok(fitted.height <= 600);
  assert.ok(Math.abs(fitted.height / fitted.width - A4_PAGE_RATIO) < 0.001);
});

test("fitA4Page uses the same page scale for a double spread", () => {
  const single = fitA4Page(1400, 900, 1);
  const spread = fitA4Page(1400, 900, 2);
  assert.equal(spread.pagesInView, 2);
  assert.ok(spread.width * 2 <= 1400 + 0.01);
  assert.ok(spread.height <= 900 + 0.01);
  assert.ok(Math.abs(spread.height / spread.width - A4_PAGE_RATIO) < 0.001);
  assert.ok(spread.width <= single.width);
});

test("fitA4Page stays readable on a narrow phone and a landscape tablet", () => {
  const phone = fitA4Page(390, 700, 1);
  const tablet = fitA4Page(1024, 680, 2);
  assert.ok(phone.width >= 240);
  assert.ok(phone.height <= 700);
  assert.ok(tablet.width * 2 <= 1024 + 0.01);
  assert.ok(tablet.height <= 680 + 0.01);
});

test("PageFlip adapter no longer stretches pages to the parent", async () => {
  const source = await readFile(
    "src/superficie/reader/engines/StPageFlipAdapter.ts",
    "utf8",
  );
  assert.match(source, /size:\s*"fixed"/u);
  assert.doesNotMatch(source, /size:\s*"stretch"/u);
  assert.match(source, /fitA4Page/u);
});
