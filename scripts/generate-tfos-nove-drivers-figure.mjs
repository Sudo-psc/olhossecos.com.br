import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1680;
const HEIGHT = 980;
const PAPER = "#f6f3ec";
const CARD = "#fbfaf6";
const INK = "#2a3136";
const MUTED = "#5c636a";
const TEAL = "#0b827f";
const ORANGE = "#d06a2b";
const GRAY = "#3d4348";
const LINE = "#ddd7cb";

const outDir = path.join(
  process.cwd(),
  "public/images/superficie/artigos/tfos-dews-iii-na-pratica",
);

const icon = (paths, stroke = INK, fill = "none") =>
  `<g fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</g>`;

const drop = (color, filled = true) =>
  icon(
    `<path d="M20 8c0 0-9 12-9 18a9 9 0 0 0 18 0c0-6-9-18-9-18z"/>`,
    color,
    filled ? color : "none",
  );

const molecule = () =>
  icon(
    `<circle cx="14" cy="16" r="4.2"/><circle cx="28" cy="12" r="3.4"/><circle cx="26" cy="28" r="3.8"/><path d="M17.6 17.6 25.2 13.4M17.2 19.2 23.4 26.2M28 15.4 26.6 24.4"/>`,
    GRAY,
  );

const closedEye = () =>
  icon(
    `<path d="M8 22c4.5-5 9.5-7.5 12-7.5S27.5 17 32 22"/><path d="M11 26.5 9 31M16 27.5 15 32.5M20 28 20 33.5M24 27.5 25 32.5M29 26.5 31 31"/>`,
    INK,
  );

const openEye = () =>
  icon(
    `<path d="M6 20c5.2-7 10.8-10 14-10s8.8 3 14 10c-5.2 7-10.8 10-14 10S11.2 27 6 20z"/><circle cx="20" cy="20" r="4.4"/>`,
    INK,
  );

const blinkEye = () =>
  icon(
    `<path d="M10 14c3.2-2.4 6.6-3.6 10-3.6S26.8 11.6 30 14"/><path d="M8 21c4.8-6.2 9.6-8.6 12-8.6s7.2 2.4 12 8.6c-4.8 6.2-9.6 8.6-12 8.6S12.8 27.2 8 21z"/><circle cx="20" cy="21" r="3.6"/><path d="M10 28c3.2 2.2 6.6 3.2 10 3.2s6.8-1 10-3.2"/>`,
    TEAL,
  );

const eyelid = () =>
  icon(
    `<path d="M7 24c5-8 10.4-11.5 13-11.5S28 16 33 24"/><path d="M9 18.5 7 13.5M14 16 13 10.5M20 15 20 9.5M26 16 27 10.5M31 18.5 33 13.5"/><path d="M10 26c3.4 2.6 6.8 3.8 10 3.8s6.6-1.2 10-3.8"/>`,
    ORANGE,
  );

const anatomy = () =>
  icon(
    `<circle cx="20" cy="21" r="11"/><path d="M20 10c3.2 0 6.4 1.6 8.6 4.2"/><path d="M13 18.5h14"/><path d="M15 21.5c1.6 3.4 3.4 5 5 5s3.4-1.6 5-5"/><circle cx="20" cy="20" r="2.2"/>`,
    TEAL,
  );

const brain = () =>
  icon(
    `<path d="M13 15.5c0-4 3-6.5 7-6.5 2.2 0 3.6 0.8 4.8 2 1.4-0.8 3.2-0.6 4.4 0.8 1.4 1.5 1.4 3.6 0.4 5.2 1.6 0.8 2.4 2.6 1.8 4.4-0.6 2-2.6 3.2-4.6 3.1H15.6c-2.4 0-4.4-1.8-4.6-4.2-0.1-1.8 0.8-3.4 2-4.2z"/><path d="M20 9.4v21.2M13.6 18.2c2.2 0.6 3.8 0.4 6.4-0.6M20 22.4c2.6 1.2 4.6 1.4 7.2 0.4"/>`,
    ORANGE,
  );

const cell = () =>
  icon(
    `<path d="M13 14c2.4-3.4 7-4.6 10.6-3.2 3.2 1.2 5.8 2 6.6 5.4 0.8 3.4-0.6 6.2-2.2 8.6-1.8 2.6-5.2 4.4-8.8 3.8-3.4-0.6-6.6-2.8-7.2-6.4-0.5-2.8 0.2-5.6 1-8.2z"/><circle cx="19" cy="20" r="2.4"/><circle cx="24.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="25" r="1.3"/>`,
    GRAY,
  );

const inflammation = () =>
  icon(
    `<path d="M7 23c5-7.2 10.4-10.4 13-10.4S28 15.8 33 23c-5 7.2-10.4 10.4-13 10.4S12 30.2 7 23z"/><path d="M20 16.2c1.6 2.2 1.4 3.6 0.2 4.6 1.8 0.2 3 1.6 3 3.4 0 2.4-1.8 4-4.2 4s-4.2-1.6-4.2-4c0-2.6 2.2-4.8 5.2-8z"/>`,
    ORANGE,
  );

const tearHeader = () =>
  icon(
    `<path d="M20 6.5c0 0-11 15-11 22.2a11 11 0 0 0 22 0C31 21.5 20 6.5 20 6.5z"/><circle cx="16.8" cy="24.2" r="3.1"/><circle cx="23.4" cy="26.6" r="2.5"/>`,
    INK,
  );

const row = (x, y, mark, label, color) => `
  <g transform="translate(${x} ${y})">
    <circle cx="28" cy="22" r="22" fill="${color}14" stroke="${color}33"/>
    <g transform="translate(8 2)">${mark}</g>
    <text x="64" y="28" fill="${INK}" font-family="Inter, ui-sans-serif, sans-serif" font-size="22" font-weight="600">${label}</text>
  </g>`;

const card = ({ x, title, headerIcon, rows }) => {
  const rowStart = 188;
  const gap = rows.length === 4 ? 92 : rows.length === 3 ? 112 : 132;
  return `
  <g>
    <rect x="${x}" y="196" width="496" height="708" rx="18" fill="${CARD}" stroke="${LINE}"/>
    <g transform="translate(${x + 228} 228)">${headerIcon}</g>
    <text x="${x + 248}" y="310" text-anchor="middle" fill="${INK}" font-family="Inter, ui-sans-serif, sans-serif" font-size="20" font-weight="750" letter-spacing="1.6">${title}</text>
    <line x1="${x + 48}" y1="336" x2="${x + 448}" y2="336" stroke="${LINE}"/>
    ${rows
      .map((item, index) =>
        row(
          x + 48,
          rowStart + 196 + index * gap,
          item.icon,
          item.label,
          item.color,
        ),
      )
      .join("")}
  </g>`;
};

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img">
  <rect width="100%" height="100%" fill="${PAPER}"/>
  <text x="840" y="86" text-anchor="middle" fill="${INK}" font-family="Inter, ui-sans-serif, sans-serif" font-size="42" font-weight="750">O mapa dos nove drivers</text>
  <text x="840" y="136" text-anchor="middle" fill="${MUTED}" font-family="Inter, ui-sans-serif, sans-serif" font-size="22" font-weight="500">Três territórios etiológicos — TFOS DEWS III</text>
  ${card({
    x: 48,
    title: "FILME LACRIMAL",
    headerIcon: tearHeader(),
    rows: [
      { icon: drop(ORANGE), label: "Lipídico", color: ORANGE },
      { icon: drop(TEAL), label: "Aquoso", color: TEAL },
      { icon: molecule(), label: "Mucina / glicocálix", color: GRAY },
    ],
  })}
  ${card({
    x: 592,
    title: "PÁLPEBRAS",
    headerIcon: closedEye(),
    rows: [
      { icon: blinkEye(), label: "Piscar e fechamento", color: TEAL },
      { icon: eyelid(), label: "Margem palpebral", color: ORANGE },
    ],
  })}
  ${card({
    x: 1136,
    title: "SUPERFÍCIE OCULAR",
    headerIcon: openEye(),
    rows: [
      { icon: anatomy(), label: "Anatomia", color: TEAL },
      { icon: brain(), label: "Disfunção neural", color: ORANGE },
      { icon: cell(), label: "Dano celular", color: GRAY },
      { icon: inflammation(), label: "Inflamação", color: ORANGE },
    ],
  })}
</svg>
`;

await mkdir(outDir, { recursive: true });
const svgPath = path.join(outDir, "mapa-nove-drivers.svg");
const pngPath = path.join(outDir, "mapa-nove-drivers.png");
await writeFile(svgPath, svg);
const png = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(pngPath, png);
const meta = await sharp(png).metadata();
console.log(
  `wrote ${pngPath} (${meta.width}×${meta.height}, ${png.length} bytes)`,
);
