import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { issue } from "../src/superficie/issues/poc/issue-source.mjs";

const outputRoot = path.resolve("public/superficie/issues/poc");
const pageRoot = path.join(outputRoot, "pages");
const textRoot = path.join(outputRoot, "text");
const audioRoot = path.join(outputRoot, "audio");

await Promise.all([
  mkdir(pageRoot, { recursive: true }),
  mkdir(textRoot, { recursive: true }),
  mkdir(audioRoot, { recursive: true }),
]);

const manifestPages = [];
const searchIndex = [];

for (const [index, page] of issue.pages.entries()) {
  const pageNumber = index + 1;
  const basename = `page-${String(pageNumber).padStart(2, "0")}`;
  const svg = pageSvg(page, pageNumber);

  await Promise.all([
    renderWebp(svg, path.join(pageRoot, `${basename}-small.webp`), 480),
    renderWebp(svg, path.join(pageRoot, `${basename}-medium.webp`), 900),
    renderWebp(svg, path.join(pageRoot, `${basename}-large.webp`), 1400),
    renderWebp(svg, path.join(pageRoot, `${basename}-thumb.webp`), 180),
  ]);

  const blocks = pageBlocks(page, pageNumber);
  await writeJson(path.join(textRoot, `${basename}.json`), {
    page: pageNumber,
    blocks,
  });
  searchIndex.push({
    page: pageNumber,
    text: blocks.map((block) => block.text).join(" "),
  });
  manifestPages.push({
    number: pageNumber,
    image: {
      small: `/superficie/issues/poc/pages/${basename}-small.webp`,
      medium: `/superficie/issues/poc/pages/${basename}-medium.webp`,
      large: `/superficie/issues/poc/pages/${basename}-large.webp`,
    },
    thumbnail: `/superficie/issues/poc/pages/${basename}-thumb.webp`,
    textLayer: `/superficie/issues/poc/text/${basename}.json`,
    type: page.type,
    ...(page.articleId ? { articleId: page.articleId } : {}),
    alt: `Página ${pageNumber}: ${page.title}. Conteúdo fictício de teste.`,
  });
}

await writeJson(path.join(outputRoot, "search-index.json"), searchIndex);
await writeJson(path.join(outputRoot, "manifest.json"), {
  id: issue.id,
  number: issue.number,
  title: issue.title,
  pageCount: issue.pages.length,
  pageSize: { width: 1400, height: 1980 },
  pages: manifestPages,
  toc: issue.toc,
  articles: issue.articles,
  audioSources: [
    "/superficie/issues/poc/audio/paper-soft-1.wav",
    "/superficie/issues/poc/audio/paper-soft-2.wav",
    "/superficie/issues/poc/audio/paper-soft-3.wav",
  ],
  searchIndex: "/superficie/issues/poc/search-index.json",
  pdfFallback: "/superficie/issues/poc/superficie-poc.pdf",
});

await Promise.all([
  writeTurnSound(
    path.join(audioRoot, "paper-soft-1.wav"),
    0x12345678,
    0.28,
    0.8,
  ),
  writeTurnSound(
    path.join(audioRoot, "paper-soft-2.wav"),
    0x91abcdef,
    0.34,
    1.15,
  ),
  writeTurnSound(
    path.join(audioRoot, "paper-soft-3.wav"),
    0x0badcafe,
    0.42,
    0.62,
  ),
  writeFile(
    path.join(outputRoot, "superficie-poc.pdf"),
    buildPlaceholderPdf(),
    "binary",
  ),
]);

function pageBlocks(page, pageNumber) {
  return [
    {
      id: `page-${pageNumber}-eyebrow`,
      text: page.eyebrow,
      x: 0.1,
      y: 0.065,
      width: 0.8,
      height: 0.035,
      role: "label",
    },
    {
      id: `page-${pageNumber}-title`,
      text: page.title,
      x: 0.1,
      y: 0.115,
      width: 0.8,
      height: 0.13,
      role: "heading",
    },
    {
      id: `page-${pageNumber}-subtitle`,
      text: page.subtitle,
      x: 0.1,
      y: 0.245,
      width: 0.8,
      height: 0.07,
      role: "paragraph",
    },
    ...page.body.map((text, index) => ({
      id: `page-${pageNumber}-paragraph-${index + 1}`,
      text,
      x: 0.1,
      y: 0.34 + index * (page.body.length > 4 ? 0.05 : 0.081),
      width: 0.8,
      height: page.body.length > 4 ? 0.045 : 0.075,
      role: "paragraph",
    })),
    {
      id: `page-${pageNumber}-number`,
      text: String(pageNumber).padStart(2, "0"),
      x: 0.84,
      y: 0.93,
      width: 0.06,
      height: 0.025,
      role: "page-number",
    },
  ];
}

function pageSvg(page, pageNumber) {
  const cover = page.type === "cover" || page.type === "back-cover";
  const background = cover
    ? "#071d29"
    : page.type === "infographic"
      ? "#e8eee9"
      : "#f5f0e7";
  const foreground = cover ? "#f7f1e6" : "#172632";
  const muted = cover ? "#b6cbc7" : "#52656c";
  const accent = pageNumber % 2 === 0 ? "#b9924b" : "#307e78";
  const bodyY = 700;
  const bodyGap = page.body.length > 4 ? 100 : 160;
  const bodyMarkup = page.body
    .map((paragraph, index) => {
      const lines = wrapText(paragraph, page.body.length > 4 ? 48 : 61);
      return svgLines(
        lines,
        140,
        bodyY + index * bodyGap,
        page.body.length > 4 ? 30 : 32,
        44,
        muted,
        500,
      );
    })
    .join("");
  const titleSize = cover ? 104 : page.title.length > 29 ? 63 : 76;
  const titleLines = wrapText(page.title, cover ? 18 : 27);
  const subtitleLines = wrapText(page.subtitle, 59);

  return Buffer.from(
    `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1980" viewBox="0 0 1400 1980">
      <rect width="1400" height="1980" fill="${background}"/>
      <path d="M0 0H1400V26H0Z" fill="${accent}"/>
      <circle cx="1190" cy="210" r="250" fill="none" stroke="${accent}" stroke-width="2" opacity=".32"/>
      <circle cx="1190" cy="210" r="165" fill="none" stroke="${accent}" stroke-width="28" opacity=".08"/>
      <path d="M140 585H1260" stroke="${accent}" stroke-width="3" opacity=".75"/>
      <text x="140" y="155" font-family="Arial, sans-serif" font-size="24" letter-spacing="4" font-weight="700" fill="${accent}">${escapeXml(page.eyebrow)}</text>
      ${svgLines(titleLines, 140, 265, titleSize, titleSize * 1.02, foreground, 700)}
      ${svgLines(subtitleLines, 140, 520, 33, 43, muted, 500)}
      ${bodyMarkup}
      <text x="140" y="1890" font-family="Arial, sans-serif" font-size="20" letter-spacing="3" fill="${muted}">SUPERFÍCIE · PROTÓTIPO</text>
      <text x="1230" y="1890" text-anchor="end" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${accent}">${String(pageNumber).padStart(2, "0")}</text>
      ${cover ? `<path d="M945 1320c120-170 275-185 455-70v730H820c-5-260 34-500 125-660Z" fill="${accent}" opacity=".2"/>` : ""}
    </svg>`,
    "utf8",
  );
}

function svgLines(lines, x, y, size, lineHeight, color, weight) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`,
    )
    .join("");
}

function wrapText(text, maxCharacters) {
  const words = text.split(/\s+/u);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function renderWebp(svg, destination, width) {
  await sharp(svg)
    .resize({ width })
    .webp({ quality: width <= 180 ? 72 : 82 })
    .toFile(destination);
}

async function writeJson(destination, value) {
  await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeTurnSound(destination, seed, duration, brightness) {
  const sampleRate = 22050;
  const sampleCount = Math.floor(sampleRate * duration);
  const data = Buffer.alloc(sampleCount * 2);
  let randomState = seed >>> 0;
  let previous = 0;
  for (let index = 0; index < sampleCount; index += 1) {
    randomState = (1664525 * randomState + 1013904223) >>> 0;
    const noise = (randomState / 0xffffffff) * 2 - 1;
    previous = previous * 0.72 + noise * 0.28;
    const position = index / sampleCount;
    const envelope = Math.sin(Math.PI * position) * Math.pow(1 - position, 0.7);
    const flutter = 0.74 + Math.sin(position * Math.PI * 18) * 0.26;
    const sample = Math.max(
      -1,
      Math.min(1, previous * envelope * flutter * brightness * 0.24),
    );
    data.writeInt16LE(Math.round(sample * 32767), index * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  await writeFile(destination, Buffer.concat([header, data]));
}

function buildPlaceholderPdf() {
  const objects = [];
  const pageReferences = issue.pages
    .map((_, index) => `${4 + index * 2} 0 R`)
    .join(" ");
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageReferences}] /Count ${issue.pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  issue.pages.forEach((_, index) => {
    const pageObject = 4 + index * 2;
    const contentObject = pageObject + 1;
    const label = `SUPERFICIE POC - pagina ${index + 1} de ${issue.pages.length}`;
    const stream = `BT /F1 18 Tf 72 760 Td (${label}) Tj ET`;
    objects[pageObject] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, "ascii");
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}
