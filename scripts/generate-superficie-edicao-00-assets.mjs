import { access, copyFile, mkdir, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { issue } from "../src/superficie/issues/edicao-00/issue-source.mjs";
import { publishedArticles } from "../src/lib/superficie.ts";
import { buildEditionPdf } from "./lib/build-edition-pdf.mjs";

const PAGE_WIDTH = 1400;
const PAGE_HEIGHT = 1867;
const FOOTER_Y = 1748;
const TEXT_LEFT = 140;
const COLUMN_WIDTH = PAGE_WIDTH - TEXT_LEFT * 2;
const TEXT_WIDTH = 0.8;
const NEW_PLATE_SIZE = { width: 1086, height: 1448 };
const outputRoot = path.resolve("public/superficie/issues/edicao-00");
const artRoot = path.join(outputRoot, "art");
const pageRoot = path.join(outputRoot, "pages");
const textRoot = path.join(outputRoot, "text");
const audioRoot = path.join(outputRoot, "audio");
const articleRoot = path.join(outputRoot, "articles");
const pocAudioRoot = path.resolve("public/superficie/issues/poc/audio");

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
const pdfPages = [];

for (const [index, page] of issue.pages.entries()) {
  const pageNumber = index + 1;
  const basename = `page-${String(pageNumber).padStart(2, "0")}`;
  const platePath = platePathFor(page.plate);
  const layout = await layoutPage(page);
  assertBodyDoesNotCollide(layout, pageNumber);
  const cropped = await centerCropToPage(platePath);
  const overlay = pageSvg(page, pageNumber, layout);
  const layers = [{ input: overlay, blend: "over" }];
  if (layout.figure) {
    const figurePng = await sharp(layout.figure.path)
      .resize(layout.figure.width, layout.figure.height)
      .png()
      .toBuffer();
    layers.push({
      input: figurePng,
      left: layout.figure.x,
      top: layout.figure.y,
      blend: "over",
    });
  }
  const composed = await sharp(cropped).composite(layers).png().toBuffer();
  const pdfJpeg = await sharp(composed)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const pdfMeta = await sharp(pdfJpeg).metadata();
  pdfPages.push({
    width: pdfMeta.width,
    height: pdfMeta.height,
    jpeg: pdfJpeg,
  });

  await Promise.all([
    renderWebp(composed, path.join(pageRoot, `${basename}-small.webp`), 480),
    renderWebp(composed, path.join(pageRoot, `${basename}-medium.webp`), 900),
    renderWebp(composed, path.join(pageRoot, `${basename}-large.webp`), 1400),
    renderWebp(composed, path.join(pageRoot, `${basename}-thumb.webp`), 180),
  ]);

  const blocks = pageBlocks(page, pageNumber, layout);
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
    buildEditionPdf(pdfPages),
  ),
  ...publishedArticles.map((article) =>
    writeFile(
      path.join(articleRoot, `${article.slug}.html`),
      articleHtml(article),
      "utf8",
    ),
  ),
]);

function platePathFor(plate) {
  if (typeof plate !== "string" || plate.length === 0) {
    throw new Error("Cada página precisa de page.plate.");
  }
  const filename = plate.endsWith(".png") ? plate : `${plate}.png`;
  if (
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("..")
  ) {
    throw new Error(`Placa inválida: ${plate}`);
  }
  return path.join(artRoot, filename);
}

function figurePathFor(src) {
  if (typeof src !== "string" || src.length === 0) {
    throw new Error("figure.src é obrigatório.");
  }
  if (src.includes("/") || src.includes("\\") || src.includes("..")) {
    throw new Error(`Figura inválida: ${src}`);
  }
  return path.join(artRoot, src);
}

async function layoutPage(page) {
  if (page.type === "ad") {
    return {
      kind: "ad",
      title: null,
      subtitle: null,
      figure: null,
      caption: null,
      body: [],
      byline: null,
      endY: 200,
    };
  }

  const cover = page.type === "cover" || page.type === "back-cover";
  const titleSize = cover ? 86 : 58;
  const titleLineHeight = titleSize * 1.08;
  const subtitleSize = 28;
  const subtitleLineHeight = 36;
  const bodySize = 28;
  const bodyLineHeight = 36;
  const paragraphGap = page.type === "contents" ? 16 : 26;
  const bodyWrap = page.type === "contents" ? 48 : 52;
  const captionSize = 20;
  const captionLineHeight = 26;

  const title = {
    text: page.title,
    lines: wrapText(page.title, cover ? 18 : 26),
    y: 252,
    size: titleSize,
    lineHeight: titleLineHeight,
  };
  const subtitleLines = page.subtitle ? wrapText(page.subtitle, 50) : [];
  const subtitle = page.subtitle
    ? {
        text: page.subtitle,
        lines: subtitleLines,
        y: title.y + title.lines.length * titleLineHeight + 28,
        size: subtitleSize,
        lineHeight: subtitleLineHeight,
      }
    : null;

  let cursor = subtitle
    ? subtitle.y + subtitle.lines.length * subtitleLineHeight + 40
    : title.y + title.lines.length * titleLineHeight + 40;

  const bodyDraft = (page.body ?? []).map((text) => ({
    text,
    lines: wrapText(text, bodyWrap),
    size: bodySize,
    lineHeight: bodyLineHeight,
  }));
  const bodyStackHeight = bodyDraft.reduce((total, block, index) => {
    const gap = index === bodyDraft.length - 1 ? 0 : paragraphGap;
    return total + block.lines.length * bodyLineHeight + gap;
  }, 0);
  const bylineHeight = page.byline ? 36 : 0;

  let figure = null;
  let caption = null;
  if (page.figure) {
    const figureFile = figurePathFor(page.figure.src);
    const meta = await sharp(figureFile).metadata();
    if (!meta.width || !meta.height) {
      throw new Error(`Figura sem dimensões: ${figureFile}`);
    }
    const captionLines = wrapText(page.figure.caption, 68);
    const captionBlockHeight = captionLines.length * captionLineHeight;
    // caption.y usa baseline (cursor + captionSize); reserva essa subida
    // para a figura ceder espaço ao recorte selado, nunca o contrário.
    const reservedAfterFigure =
      16 +
      captionSize +
      captionBlockHeight +
      24 +
      bodyStackHeight +
      bylineHeight +
      8;
    const maxFigureHeight = FOOTER_Y - cursor - reservedAfterFigure;
    const naturalHeight = Math.round((COLUMN_WIDTH * meta.height) / meta.width);
    // Encolhe a figura se o recorte selado não couber; nunca descarta o texto.
    const figureHeight = Math.min(
      naturalHeight,
      Math.max(1, Math.floor(maxFigureHeight)),
    );
    const figureWidth = Math.round((figureHeight * meta.width) / meta.height);
    figure = {
      path: figureFile,
      x: TEXT_LEFT,
      y: Math.round(cursor),
      width: figureWidth,
      height: figureHeight,
    };
    cursor = figure.y + figure.height + 16;
    caption = {
      text: page.figure.caption,
      lines: captionLines,
      y: cursor + captionSize,
      size: captionSize,
      lineHeight: captionLineHeight,
    };
    cursor = caption.y + caption.lines.length * captionLineHeight + 24;
  }

  const body = bodyDraft.map((block) => {
    const placed = { ...block, y: cursor };
    cursor += block.lines.length * bodyLineHeight + paragraphGap;
    return placed;
  });

  let byline = null;
  if (page.byline) {
    byline = {
      text: page.byline,
      lines: wrapText(page.byline, 56),
      y: cursor + 8,
      size: 20,
      lineHeight: 26,
    };
    cursor = byline.y + byline.lines.length * byline.lineHeight;
  }

  return {
    kind: "text",
    title,
    subtitle,
    figure,
    caption,
    body,
    byline,
    endY: cursor,
  };
}

function assertBodyDoesNotCollide(layout, pageNumber) {
  if (layout.kind === "ad") return;

  let previousBottom =
    layout.title.y + layout.title.lines.length * layout.title.lineHeight;
  if (layout.subtitle) {
    if (layout.subtitle.y < previousBottom + 8) {
      throw new Error(
        `Página ${pageNumber}: o subtítulo colide com o título (y=${layout.subtitle.y}, fim anterior=${previousBottom}).`,
      );
    }
    previousBottom =
      layout.subtitle.y +
      layout.subtitle.lines.length * layout.subtitle.lineHeight;
  }
  if (layout.figure) {
    if (layout.figure.y < previousBottom + 8) {
      throw new Error(
        `Página ${pageNumber}: a figura colide com o bloco anterior (y=${layout.figure.y}, fim anterior=${previousBottom}).`,
      );
    }
    previousBottom = layout.figure.y + layout.figure.height;
  }
  if (layout.caption) {
    if (layout.caption.y < previousBottom + 4) {
      throw new Error(
        `Página ${pageNumber}: a legenda colide com a figura (y=${layout.caption.y}, fim anterior=${previousBottom}).`,
      );
    }
    previousBottom =
      layout.caption.y +
      layout.caption.lines.length * layout.caption.lineHeight;
  }
  for (const [index, block] of layout.body.entries()) {
    if (block.y < previousBottom + 8) {
      throw new Error(
        `Página ${pageNumber}: o parágrafo ${index + 1} colide com o bloco anterior (y=${block.y}, fim anterior=${previousBottom}).`,
      );
    }
    previousBottom = block.y + block.lines.length * block.lineHeight;
  }
  if (layout.byline) {
    if (layout.byline.y < previousBottom + 4) {
      throw new Error(
        `Página ${pageNumber}: o byline colide com o corpo (y=${layout.byline.y}, fim anterior=${previousBottom}).`,
      );
    }
    previousBottom =
      layout.byline.y + layout.byline.lines.length * layout.byline.lineHeight;
  }
  if (previousBottom > FOOTER_Y) {
    throw new Error(
      `Página ${pageNumber}: o corpo ultrapassa o rodapé (${previousBottom} > ${FOOTER_Y}). Encurte body[] ou aperte o entrelinhamento.`,
    );
  }
}

function pageBlocks(page, pageNumber, layout) {
  if (layout.kind === "ad") {
    const band = page.adPlacement === "band";
    return [
      {
        id: `page-${pageNumber}-ad-label`,
        text: "PUBLICIDADE",
        x: 0.15,
        y: band ? 0.78 : 0.46,
        width: 0.7,
        height: 0.04,
        role: "label",
      },
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

  const toBox = (block, extra = 0) => ({
    x: TEXT_LEFT / PAGE_WIDTH,
    y: (block.y - block.size) / PAGE_HEIGHT,
    width: TEXT_WIDTH,
    height: (block.lines.length * block.lineHeight + extra) / PAGE_HEIGHT,
  });
  const blocks = [
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
      ...toBox(layout.title, 8),
      role: "heading",
    },
  ];
  if (layout.subtitle) {
    blocks.push({
      id: `page-${pageNumber}-subtitle`,
      text: page.subtitle,
      ...toBox(layout.subtitle, 6),
      role: "paragraph",
    });
  }
  if (layout.caption) {
    blocks.push({
      id: `page-${pageNumber}-figure-caption`,
      text: layout.caption.text,
      ...toBox(layout.caption, 4),
      role: "label",
    });
  }
  blocks.push(
    ...layout.body.map((block, index) => ({
      id: `page-${pageNumber}-paragraph-${index + 1}`,
      text: block.text,
      ...toBox(block, 4),
      role: "paragraph",
    })),
  );
  if (layout.byline) {
    blocks.push({
      id: `page-${pageNumber}-byline`,
      text: layout.byline.text,
      ...toBox(layout.byline, 4),
      role: "label",
    });
  }
  if (page.footer) {
    blocks.push({
      id: `page-${pageNumber}-footer`,
      text: page.footer,
      x: 0.1,
      y: 0.93,
      width: 0.6,
      height: 0.025,
      role: "label",
    });
  }
  blocks.push({
    id: `page-${pageNumber}-number`,
    text: String(pageNumber).padStart(2, "0"),
    x: 0.84,
    y: 0.93,
    width: 0.06,
    height: 0.025,
    role: "page-number",
  });
  return blocks;
}

function pageSvg(page, pageNumber, layout) {
  const dark = page.theme === "dark";
  const foreground = dark ? "#F7F3EA" : "#0B1F33";
  const muted = dark ? "#d7cbb3" : "#3d4f5c";
  const accent = dark ? "#d9b665" : "#00646A";
  const pageLabel = String(pageNumber).padStart(2, "0");

  if (layout.kind === "ad") {
    const band = page.adPlacement === "band";
    const labelY = band ? 1580 : 960;
    return Buffer.from(
      `
    <svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}">
      <text x="700" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" letter-spacing="8" font-weight="700" fill="${accent}">PUBLICIDADE</text>
      <text x="1260" y="1795" text-anchor="end" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${accent}">${pageLabel}</text>
    </svg>`,
      "utf8",
    );
  }

  const scrimHeight = Math.min(
    1680,
    Math.max(980, Math.round(layout.endY - 40)),
  );
  const scrim = dark
    ? `<rect x="90" y="70" width="1220" height="${scrimHeight}" rx="18" fill="#0B1F33" opacity=".42"/>`
    : `<rect x="90" y="70" width="1220" height="${scrimHeight}" rx="18" fill="#F7F3EA" opacity=".62"/>`;
  const subtitleMarkup = layout.subtitle
    ? svgLines(
        layout.subtitle.lines,
        TEXT_LEFT,
        layout.subtitle.y,
        layout.subtitle.size,
        layout.subtitle.lineHeight,
        muted,
        500,
      )
    : "";
  const captionMarkup = layout.caption
    ? svgLines(
        layout.caption.lines,
        TEXT_LEFT,
        layout.caption.y,
        layout.caption.size,
        layout.caption.lineHeight,
        muted,
        500,
      )
    : "";
  const bodyMarkup = layout.body
    .map((block) =>
      svgLines(
        block.lines,
        TEXT_LEFT,
        block.y,
        block.size,
        block.lineHeight,
        muted,
        500,
      ),
    )
    .join("");
  const bylineMarkup = layout.byline
    ? svgLines(
        layout.byline.lines,
        TEXT_LEFT,
        layout.byline.y,
        layout.byline.size,
        layout.byline.lineHeight,
        accent,
        600,
      )
    : "";
  const footerText = page.footer ?? "SUPERFÍCIE · EDIÇÃO 00";

  return Buffer.from(
    `
    <svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}">
      ${scrim}
      <path d="M0 0H1400V18H0Z" fill="${accent}"/>
      <text x="140" y="150" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" font-weight="700" fill="${accent}">${escapeXml(page.eyebrow)}</text>
      ${svgLines(layout.title.lines, TEXT_LEFT, layout.title.y, layout.title.size, layout.title.lineHeight, foreground, 700)}
      ${subtitleMarkup}
      ${captionMarkup}
      ${bodyMarkup}
      ${bylineMarkup}
      <text x="140" y="1795" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${muted}">${escapeXml(footerText.toUpperCase())}</text>
      <text x="1260" y="1795" text-anchor="end" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${accent}">${pageLabel}</text>
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

async function requireExistingPlates() {
  const plates = [...new Set(issue.pages.map((page) => page.plate))];
  for (const plate of plates) {
    const file = platePathFor(plate);
    try {
      await access(file, fsConstants.R_OK);
    } catch {
      throw new Error(
        `Missing plate ${file}. Copy the ChatGPT PNG byte-for-byte before generating assets.`,
      );
    }
    const { width, height } = await sharp(file).metadata();
    if (width !== NEW_PLATE_SIZE.width || height !== NEW_PLATE_SIZE.height) {
      throw new Error(
        `Plate ${file} is ${width}×${height}, expected ${NEW_PLATE_SIZE.width}×${NEW_PLATE_SIZE.height}.`,
      );
    }
  }

  const figures = [
    ...new Set(
      issue.pages
        .map((page) => page.figure?.src)
        .filter((src) => typeof src === "string"),
    ),
  ];
  for (const src of figures) {
    const file = figurePathFor(src);
    try {
      await access(file, fsConstants.R_OK);
    } catch {
      throw new Error(`Missing figure ${file}.`);
    }
  }
}
