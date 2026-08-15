import { copyFile, mkdir, writeFile } from "node:fs/promises";
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

await Promise.all([
  mkdir(artRoot, { recursive: true }),
  mkdir(pageRoot, { recursive: true }),
  mkdir(textRoot, { recursive: true }),
  mkdir(audioRoot, { recursive: true }),
  mkdir(articleRoot, { recursive: true }),
]);

await writePlates();

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

async function writePlates() {
  await sharp(capaSvg()).png().toFile(plateFiles.capa);
  await sharp(interiorSvg()).png().toFile(plateFiles.interior);
  await sharp(dgmSvg()).png().toFile(plateFiles.dgm);
  await sharp(tfosSvg()).png().toFile(plateFiles.tfos);
}

function capaSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
      <defs>
        <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0B1F33"/>
          <stop offset="1" stop-color="#061821"/>
        </linearGradient>
        <linearGradient id="film" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7a1f6b"/>
          <stop offset="0.28" stop-color="#c43b8a"/>
          <stop offset="0.5" stop-color="#d9b665"/>
          <stop offset="0.72" stop-color="#7fbf3a"/>
          <stop offset="1" stop-color="#00646A"/>
        </linearGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11"/>
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 0 0.35  0 0 0 0.18 0"/>
        </filter>
      </defs>
      <rect width="1024" height="1536" fill="url(#navy)"/>
      <path d="M420-40C720 80 980 220 1120 520c80 180 40 420-80 680-90 190-260 360-520 430" fill="none" stroke="url(#film)" stroke-width="220" opacity=".88"/>
      <path d="M510 80C760 180 980 320 1080 560c70 170 20 390-90 620" fill="none" stroke="#F7F3EA" stroke-width="8" opacity=".18"/>
      <circle cx="860" cy="180" r="160" fill="#F7F3EA" opacity=".22"/>
      <rect width="1024" height="1536" filter="url(#grain)"/>
    </svg>`,
    "utf8",
  );
}

function interiorSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402" viewBox="0 0 1122 1402">
      <defs>
        <radialGradient id="wash" cx="50%" cy="42%" r="68%">
          <stop offset="0" stop-color="#F7F3EA"/>
          <stop offset="1" stop-color="#e4ddd0"/>
        </radialGradient>
        <filter id="smoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4"/>
          <feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.12  0 0 0 0 0.2  0 0 0 0.55 0"/>
        </filter>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2"/>
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0.12 0"/>
        </filter>
      </defs>
      <rect width="1122" height="1402" fill="url(#wash)"/>
      <rect width="520" height="1402" filter="url(#smoke)" opacity=".85"/>
      <rect y="980" width="1122" height="422" filter="url(#smoke)" opacity=".45"/>
      <path d="M0 1128H1122" stroke="#00646A" stroke-width="4"/>
      <rect width="1122" height="1402" filter="url(#paper)"/>
    </svg>`,
    "utf8",
  );
}

function dgmSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402" viewBox="0 0 1122 1402">
      <defs>
        <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0B1F33"/>
          <stop offset="1" stop-color="#0a3a38"/>
        </linearGradient>
        <linearGradient id="fire" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#8A6621"/>
          <stop offset="0.5" stop-color="#d9782a"/>
          <stop offset="1" stop-color="#f2c14e"/>
        </linearGradient>
        <filter id="mix">
          <feTurbulence type="turbulence" baseFrequency="0.018" numOctaves="3" seed="9"/>
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.28  0 0 0 0 0.08  0 0 0 0.7 0"/>
        </filter>
      </defs>
      <rect width="1122" height="1402" fill="url(#base)"/>
      <rect x="360" width="762" height="1402" filter="url(#mix)"/>
      <path d="M720 180c80 40 120 140 90 230-40 120 30 190 110 240 70 44 80 140 20 210-50 58-20 150 70 190" fill="none" stroke="url(#fire)" stroke-width="70" opacity=".8"/>
      <g fill="none" stroke="#2ec4b6" stroke-width="10">
        <ellipse cx="860" cy="420" rx="70" ry="160"/>
        <ellipse cx="940" cy="620" rx="64" ry="150"/>
        <ellipse cx="820" cy="820" rx="72" ry="170"/>
        <ellipse cx="960" cy="1040" rx="60" ry="140"/>
      </g>
      <g fill="#d9b665" opacity=".35">
        <circle cx="700" cy="300" r="3"/><circle cx="640" cy="520" r="2"/><circle cx="580" cy="760" r="3"/>
        <circle cx="500" cy="980" r="2"/><circle cx="620" cy="1180" r="3"/>
      </g>
    </svg>`,
    "utf8",
  );
}

function tfosSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402" viewBox="0 0 1122 1402">
      <defs>
        <radialGradient id="void" cx="50%" cy="50%" r="70%">
          <stop offset="0" stop-color="#16324a"/>
          <stop offset="1" stop-color="#0B1F33"/>
        </radialGradient>
        <filter id="dust">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="15"/>
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.65  0 0 0 0 0.2  0 0 0 0.35 0"/>
        </filter>
      </defs>
      <rect width="1122" height="1402" fill="url(#void)"/>
      <ellipse cx="820" cy="260" rx="280" ry="180" fill="#F7F3EA" opacity=".16"/>
      <ellipse cx="280" cy="1180" rx="300" ry="200" fill="#F7F3EA" opacity=".12"/>
      <rect x="548" y="80" width="26" height="1240" fill="#8A6621" opacity=".85"/>
      <rect x="548" y="80" width="26" height="1240" filter="url(#dust)"/>
      <path d="M80 701H1042" stroke="#2ec4b6" stroke-width="6"/>
      <path d="M120 701c80-40 160-40 240 0s160 40 240 0 160-40 240 0 160 40 240 0" fill="none" stroke="#7fd3cf" stroke-width="2" opacity=".55"/>
      <path d="M120 740c80 30 160 30 240 0s160-30 240 0 160 30 240 0 160-30 240 0" fill="none" stroke="#7fd3cf" stroke-width="2" opacity=".35"/>
    </svg>`,
    "utf8",
  );
}
