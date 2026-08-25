import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Deriva os rasters do portal a partir dos TIFFs originais de Hwang et al.
 * (PLoS ONE 2013, CC BY 4.0). Sem recorte: a figura publicada já carrega
 * painéis, letras e o retângulo do campo — cortar isso seria adaptação.
 */

const SOURCE_DIR = process.env.HWANG_SOURCE_DIR ?? "/tmp/hwang-meibography";
const OUT_DIR = path.join(process.cwd(), "public/images/educacao");
const MAX_WIDTH = 1200;

const figures = [
  { id: "g004", basename: "meibografia-ir-palpebra-superior-hwang-2013" },
  { id: "g006", basename: "meibografia-3d-oct-vs-ir-hwang-2013" },
  { id: "g009", basename: "meibografia-dgm-leve-acinos-hwang-2013" },
];

const sha256 = async (filePath) => {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
};

const writeDerivatives = async (image, basename, width) => {
  await image
    .clone()
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT_DIR, `${basename}.jpg`));
  await image
    .clone()
    .avif({ quality: 45 })
    .toFile(path.join(OUT_DIR, `${basename}-${width}.avif`));
  await image
    .clone()
    .webp({ quality: 72 })
    .toFile(path.join(OUT_DIR, `${basename}-${width}.webp`));
};

await mkdir(OUT_DIR, { recursive: true });

for (const figure of figures) {
  const source = path.join(SOURCE_DIR, `pone.0067143.${figure.id}.tif`);
  const digest = await sha256(source);
  const base = sharp(source).rotate();
  const meta = await base.metadata();
  const nativeWidth = meta.width ?? MAX_WIDTH;
  const displayWidth = Math.min(nativeWidth, MAX_WIDTH);
  const display = base.resize({
    width: displayWidth,
    withoutEnlargement: true,
  });
  const { width, height } = await display
    .clone()
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer({ resolveWithObject: true })
    .then(({ info }) => info);

  await writeDerivatives(display, figure.basename, width);

  if (width > 760) {
    const mid = display.resize({ width: 760, withoutEnlargement: true });
    await mid
      .clone()
      .avif({ quality: 45 })
      .toFile(path.join(OUT_DIR, `${figure.basename}-760.avif`));
    await mid
      .clone()
      .webp({ quality: 72 })
      .toFile(path.join(OUT_DIR, `${figure.basename}-760.webp`));
  }

  console.log(`${figure.basename}\t${width}x${height}\tsha256 ${digest}`);
}
