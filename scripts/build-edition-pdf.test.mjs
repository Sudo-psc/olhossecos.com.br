import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import sharp from "sharp";
import { buildEditionPdf } from "./lib/build-edition-pdf.mjs";

test("buildEditionPdf rejects an odd page count", () => {
  assert.throws(
    () =>
      buildEditionPdf([
        { width: 8, height: 8, jpeg: Buffer.from([0xff, 0xd8, 0xff]) },
      ]),
    /página par/u,
  );
});

test("buildEditionPdf embeds two JPEG pages", async () => {
  const jpeg = await sharp({
    create: {
      width: 16,
      height: 20,
      channels: 3,
      background: { r: 11, g: 31, b: 51 },
    },
  })
    .jpeg({ quality: 80 })
    .toBuffer();
  const pdf = buildEditionPdf([
    { width: 16, height: 20, jpeg },
    { width: 16, height: 20, jpeg },
  ]);

  assert.match(pdf.subarray(0, 8).toString("ascii"), /^%PDF-1\./u);
  assert.equal(countPdfPages(pdf), 2);
  assert.ok(pdf.includes(jpeg));
  assert.ok(pdf.length > 200);
});

test("edicao-00 pdfFallback is a real even-page edition, not a stub", async () => {
  const pdfPath = path.resolve(
    "public/superficie/issues/edicao-00/superficie-edicao-00.pdf",
  );
  const pdf = await readFile(pdfPath);
  const manifest = JSON.parse(
    await readFile("public/superficie/issues/edicao-00/manifest.json", "utf8"),
  );

  assert.equal(
    manifest.pdfFallback,
    "/superficie/issues/edicao-00/superficie-edicao-00.pdf",
  );
  assert.match(pdf.subarray(0, 8).toString("ascii"), /^%PDF-1\./u);
  assert.ok(pdf.length > 1_000_000, `PDF stub demais: ${pdf.length} bytes`);
  const pageCount = countPdfPages(pdf);
  assert.equal(pageCount % 2, 0);
  assert.equal(pageCount, manifest.pageCount);
  assert.equal(pageCount, 34);
});

function countPdfPages(pdf) {
  return [...pdf.toString("latin1").matchAll(/\/Type\s*\/Page(?![sA-Za-z])/gu)]
    .length;
}
