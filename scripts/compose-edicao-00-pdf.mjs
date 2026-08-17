import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { buildEditionPdf } from "./lib/build-edition-pdf.mjs";

const outputRoot = path.resolve("public/superficie/issues/edicao-00");
const pageRoot = path.join(outputRoot, "pages");
const files = (await readdir(pageRoot))
  .filter((name) => /^page-\d+-large\.webp$/u.test(name))
  .sort((left, right) => left.localeCompare(right, "en"));

if (files.length === 0 || files.length % 2 !== 0) {
  throw new Error(
    `Esperava rasters large em número par; achei ${files.length}.`,
  );
}

const pages = [];
for (const file of files) {
  const jpeg = await sharp(path.join(pageRoot, file))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const { width, height } = await sharp(jpeg).metadata();
  pages.push({ width, height, jpeg });
}

const pdf = buildEditionPdf(pages);
await writeFile(path.join(outputRoot, "superficie-edicao-00.pdf"), pdf);
process.stdout.write(
  `Wrote ${pdf.length} bytes / ${pages.length} pages to superficie-edicao-00.pdf\n`,
);
