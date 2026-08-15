import { access, copyFile, mkdir, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { issue } from "../src/superficie/issues/edicao-00/issue-source.mjs";
import { publishedArticles } from "../src/lib/superficie.ts";

const PAGE_WIDTH = 1400;
const PAGE_HEIGHT = 1867;
const outputRoot = path.resolve("public/superficie/issues/edicao-00");
const artRoot = path.join(outputRoot, "art");
const pageRoot = path.join(outputRoot, "pages");
const textRoot = path.join(outputRoot, "text");
const audioRoot = path.join(outputRoot, "audio");
const articleRoot = path.join(outputRoot, "articles");
const pocAudioRoot = path.resolve("public/superficie/issues/poc/audio");

const plateFiles = {
  capa: path.join(artRoot, "capa.png"),
  interior: path.join(artRoot, "interior.png"),
  dgm: path.join(artRoot, "dgm.png"),
  tfos: path.join(artRoot, "tfos.png"),
};

const expectedPlateSize = {
  capa: { width: 1024, height: 1536 },
  interior: { width: 1122, height: 1402 },
  dgm: { width: 1122, height: 1402 },
  tfos: { width: 1122, height: 1402 },
};

await Promise.all([
  mkdir(artRoot, { recursive: true }),
  mkdir(pageRoot, { recursive: true }),
  mkdir(textRoot, { recursive: true }),
  mkdir(audioRoot, { recursive: true }),
  mkdir(articleRoot, { recursive: true }),
]);

await requireExistingPlates();

const manifestPages = [];
const searchIndex = [];

for (const [index, page] of issue.pages.entries()) {
  const pageNumber = index + 1;
  const basename = `page-${String(pageNumber).padStart(2, "0")}`;
  const platePath = plateFiles[page.plate];
  const cropped = await centerCropToPage(platePath);
  const overlay = pageSvg(page, pageNumber);
  const composed = await sharp(cropped)
    .composite([{ input: overlay, blend: "over" }])
    .png()
    .toBuffer();

  await Promise.all([
    renderWebp(composed, path.join(pageRoot, `${basename}-small.webp`), 480),
    renderWebp(composed, path.join(pageRoot, `${basename}-medium.webp`), 900),
    renderWebp(composed, path.join(pageRoot, `${basename}-large.webp`), 1400),
    renderWebp(composed, path.join(pageRoot, `${basename}-thumb.webp`), 180),
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
      small: `/superficie/issues/edicao-00/pages/${basename}-small.webp`,
      medium: `/superficie/issues/edicao-00/pages/${basename}-medium.webp`,
      large: `/superficie/issues/edicao-00/pages/${basename}-large.webp`,
    },
    thumbnail: `/superficie/issues/edicao-00/pages/${basename}-thumb.webp`,
    textLayer: `/superficie/issues/edicao-00/text/${basename}.json`,
    type: page.type,
    ...(page.articleId ? { articleId: page.articleId } : {}),
    alt: `Página ${pageNumber}: ${page.title}.`,
  });
}

await writeJson(path.join(outputRoot, "search-index.json"), searchIndex);
await writeJson(path.join(outputRoot, "manifest.json"), {
  id: issue.id,
  number: issue.number,
  title: issue.title,
  pageCount: issue.pages.length,
  pages: manifestPages,
  toc: issue.toc,
  articles: issue.articles,
  audioSources: [
    "/superficie/issues/edicao-00/audio/paper-soft-1.wav",
    "/superficie/issues/edicao-00/audio/paper-soft-2.wav",
    "/superficie/issues/edicao-00/audio/paper-soft-3.wav",
  ],
  searchIndex: "/superficie/issues/edicao-00/search-index.json",
  pdfFallback: "/superficie/issues/edicao-00/superficie-edicao-00.pdf",
});

await Promise.all([
  copyFile(
    path.join(pocAudioRoot, "paper-soft-1.wav"),
    path.join(audioRoot, "paper-soft-1.wav"),
  ),
  copyFile(
    path.join(pocAudioRoot, "paper-soft-2.wav"),
    path.join(audioRoot, "paper-soft-2.wav"),
  ),
  copyFile(
    path.join(pocAudioRoot, "paper-soft-3.wav"),
    path.join(audioRoot, "paper-soft-3.wav"),
  ),
  writeFile(
    path.join(outputRoot, "superficie-edicao-00.pdf"),
    buildPlaceholderPdf(),
    "binary",
  ),
  ...publishedArticles.map((article) =>
    writeFile(
      path.join(articleRoot, `${article.slug}.html`),
      articleHtml(article),
      "utf8",
    ),
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
  const dark = page.theme === "dark";
  const foreground = dark ? "#F7F3EA" : "#0B1F33";
  const muted = dark ? "#d7cbb3" : "#3d4f5c";
  const accent = dark ? "#d9b665" : "#00646A";
  const bodyY = 660;
  const bodyGap = page.body.length > 4 ? 96 : 150;
  const titleSize =
    page.type === "cover" || page.type === "back-cover" ? 86 : 58;
  const titleLines = wrapText(page.title, page.type === "cover" ? 18 : 26);
  const subtitleLines = wrapText(page.subtitle, 52);
  const scrim = dark
    ? `<rect x="90" y="70" width="1220" height="${page.body.length > 3 ? 1680 : 1180}" rx="18" fill="#0B1F33" opacity=".42"/>`
    : `<rect x="90" y="70" width="1220" height="${page.body.length > 3 ? 1680 : 1180}" rx="18" fill="#F7F3EA" opacity=".62"/>`;
  const bodyMarkup = page.body
    .map((paragraph, index) => {
      const lines = wrapText(paragraph, page.body.length > 4 ? 46 : 58);
      return svgLines(
        lines,
        140,
        bodyY + index * bodyGap,
        page.body.length > 4 ? 28 : 30,
        40,
        muted,
        500,
      );
    })
    .join("");

  return Buffer.from(
    `
    <svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}">
      ${scrim}
      <path d="M0 0H1400V18H0Z" fill="${accent}"/>
      <text x="140" y="150" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" font-weight="700" fill="${accent}">${escapeXml(page.eyebrow)}</text>
      ${svgLines(titleLines, 140, 250, titleSize, titleSize * 1.05, foreground, 700)}
      ${svgLines(subtitleLines, 140, 500, 30, 40, muted, 500)}
      ${bodyMarkup}
      <text x="140" y="1795" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${muted}">SUPERFÍCIE · EDIÇÃO 00</text>
      <text x="1260" y="1795" text-anchor="end" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${accent}">${String(pageNumber).padStart(2, "0")}</text>
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

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function centerCropToPage(sourcePath) {
  const image = sharp(sourcePath);
  const { width, height } = await image.metadata();
  if (!width || !height) {
    throw new Error(`Placa sem dimensões: ${sourcePath}`);
  }
  const targetRatio = PAGE_WIDTH / PAGE_HEIGHT;
  const sourceRatio = width / height;
  let extract;
  if (sourceRatio > targetRatio) {
    const cropWidth = Math.round(height * targetRatio);
    extract = {
      left: Math.round((width - cropWidth) / 2),
      top: 0,
      width: cropWidth,
      height,
    };
  } else {
    const cropHeight = Math.round(width / targetRatio);
    extract = {
      left: 0,
      top: Math.round((height - cropHeight) / 2),
      width,
      height: cropHeight,
    };
  }
  return image
    .extract(extract)
    .resize(PAGE_WIDTH, PAGE_HEIGHT)
    .png()
    .toBuffer();
}

async function renderWebp(png, destination, width) {
  await sharp(png)
    .resize({ width })
    .webp({ quality: width <= 180 ? 72 : 82 })
    .toFile(destination);
}

async function writeJson(destination, value) {
  await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function articleHtml(article) {
  const sections = article.content
    .map((section) => {
      const paragraphs = section.paragraphs
        .map((paragraph) => `    <p>${escapeHtml(paragraph)}</p>`)
        .join("\n");
      const bullets = section.bullets?.length
        ? `    <ul>\n${section.bullets
            .map((item) => `      <li>${escapeHtml(item)}</li>`)
            .join("\n")}\n    </ul>`
        : "";
      return `  <section aria-labelledby="${escapeHtml(section.id)}">
    <h2 id="${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>
${paragraphs}
${bullets}
  </section>`;
    })
    .join("\n");
  const references = article.references
    .map(
      (reference) =>
        `      <li><cite>${escapeHtml(reference.label)}</cite> <a href="${escapeHtml(reference.url)}">${reference.doi ? `DOI ${escapeHtml(reference.doi)}` : "Ver fonte"}</a></li>`,
    )
    .join("\n");
  const disclosures = article.disclosures
    .map(
      ({ label, text }) =>
        `      <dt>${escapeHtml(label)}</dt>\n      <dd>${escapeHtml(text)}</dd>`,
    )
    .join("\n");

  return `<article aria-labelledby="article-title">
  <header>
    <p>${escapeHtml(article.category)} · ${escapeHtml(article.reviewSeal)}</p>
    <h1 id="article-title">${escapeHtml(article.title)}</h1>
    <p>${escapeHtml(article.subtitle ?? article.excerpt)}</p>
  </header>
${sections}
  <section aria-labelledby="referencias">
    <h2 id="referencias">Referências</h2>
    <ol>
${references}
    </ol>
  </section>
  <footer>
    <h2 id="disclosures">Disclosures</h2>
    <dl>
${disclosures}
    </dl>
    <p>Texto canônico: <a href="${escapeHtml(article.seo.canonical)}">${escapeHtml(article.seo.canonical)}</a></p>
  </footer>
</article>
`;
}

function buildPlaceholderPdf() {
  const objects = [];
  const pageReferences = issue.pages
    .map((_, index) => `${4 + index * 2} 0 R`)
    .join(" ");
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageReferences}] /Count ${issue.pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  issue.pages.forEach((page, index) => {
    const pageObject = 4 + index * 2;
    const contentObject = pageObject + 1;
    const label = `SUPERFICIE EDICAO 00 - ${page.title}`.slice(0, 80);
    const stream = `BT /F1 16 Tf 48 760 Td (${label}) Tj ET`;
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

async function requireExistingPlates() {
  for (const [name, file] of Object.entries(plateFiles)) {
    try {
      await access(file, fsConstants.R_OK);
    } catch {
      throw new Error(
        `Missing Comfy original ${file}. Copy the attached PNG byte-for-byte before generating assets.`,
      );
    }
    const { width, height } = await sharp(file).metadata();
    const expected = expectedPlateSize[name];
    if (width !== expected.width || height !== expected.height) {
      throw new Error(
        `Plate ${file} is ${width}×${height}, expected ${expected.width}×${expected.height}.`,
      );
    }
  }
}
