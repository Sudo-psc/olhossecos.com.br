// Placas A4 (1654×2339, 200 dpi) do piloto olho-seco-oct-rnfl.
// O VM do agente recebe as imagens anexadas só como descrição; este script
// redesenha os mestres em retrato. Não inventa número: 93,07 / 98,27 / +5,2
// e o eixo 80–110 µm vêm do objeto editorial e da placa de evidência.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const W = 1654;
const H = 2339;
const NAVY = "#0B1F33";
const IVORY = "#F7F3EA";
const TEAL = "#00646A";
const GOLD = "#D9B665";
const GOLD_INK = "#8A6621";
const SERIF = "Noto Serif, Georgia, serif";
const SANS = "Inter, Helvetica, sans-serif";

const outDir = path.join(
  process.cwd(),
  "public/images/superficie/artigos/olho-seco-oct-rnfl",
);

const faces = `
  @font-face {
    font-family: "Noto Serif";
    src: url("file:///usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf");
    font-weight: 400;
  }
  @font-face {
    font-family: "Noto Serif";
    src: url("file:///usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf");
    font-weight: 700;
  }
  @font-face {
    font-family: "Inter";
    src: url("file:///usr/share/fonts/truetype/macos/Inter-Regular.ttf");
    font-weight: 400;
  }
  @font-face {
    font-family: "Inter";
    src: url("file:///usr/share/fonts/truetype/macos/Inter-SemiBold.ttf");
    font-weight: 600;
  }
`;

const svg = (
  body,
  title,
  { embedFaces = false } = {},
) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
  <title>${title}</title>
  ${embedFaces ? `<style>${faces}</style>` : ""}
  ${body}
</svg>
`;

const impacto = (embedFaces) =>
  svg(
    `
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect x="72" y="72" width="1510" height="2195" fill="none" stroke="${GOLD}" stroke-width="2"/>
  <rect x="88" y="88" width="1478" height="2163" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
  <text x="140" y="220" fill="${GOLD}" font-family="${SERIF}" font-size="22" letter-spacing="4.2">SUPERF&#205;CIE &#183; OBSERVAT&#211;RIO DE EVID&#202;NCIA</text>
  <text x="140" y="980" fill="#FFFFFF" font-family="${SERIF}" font-size="78" font-weight="700">
    <tspan x="140" dy="0">A RNFL que caiu</tspan>
    <tspan x="140" dy="96">pode ser o filme,</tspan>
    <tspan x="140" dy="96">n&#227;o o nervo.</tspan>
  </text>
  <text x="140" y="2088" fill="${TEAL}" font-family="${SANS}" font-size="22">Piloto &#183; olho-seco-oct-rnfl</text>
  <text x="140" y="2134" fill="${GOLD}" font-family="${SERIF}" font-size="20" letter-spacing="1.4">CHECAGEM EDITORIAL &#8212; N&#195;O REVISADO POR PARES</text>
`,
    "A RNFL que caiu pode ser o filme, nao o nervo",
    { embedFaces },
  );

const chartTop = 520;
const chartBottom = 1580;
const chartLeft = 280;
const chartRight = 1480;
const chartH = chartBottom - chartTop;
const yAt = (um) => chartBottom - ((um - 80) / 30) * chartH;
const barW = 220;
const xAntes = 560;
const xDepois = 980;
const hAntes = chartBottom - yAt(93.07);
const hDepois = chartBottom - yAt(98.27);

const evidencia = (embedFaces) =>
  svg(
    `
  <rect width="${W}" height="${H}" fill="${IVORY}"/>
  <text x="96" y="160" fill="${NAVY}" font-family="${SERIF}" font-size="56" font-weight="700">O n&#250;mero que muda a visita</text>
  <text x="96" y="220" fill="${TEAL}" font-family="${SANS}" font-size="24">RNFL m&#233;dia &#183; GPAA com OSD &#183; n = 55 &#183; sem bra&#231;o controle</text>
  <line x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}" stroke="${NAVY}" stroke-width="1.4"/>
  <line x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}" stroke="${NAVY}" stroke-width="1.4"/>
  ${[80, 90, 100, 110]
    .map((tick) => {
      const y = yAt(tick);
      return `
        <line x1="${chartLeft - 10}" y1="${y}" x2="${chartRight}" y2="${y}" stroke="${GOLD_INK}" stroke-opacity="0.18" stroke-width="1"/>
        <text x="${chartLeft - 24}" y="${y + 8}" text-anchor="end" fill="${NAVY}" font-family="${SANS}" font-size="20">${tick}</text>
      `;
    })
    .join("")}
  <text x="${chartLeft - 24}" y="${chartTop - 28}" text-anchor="end" fill="${NAVY}" font-family="${SANS}" font-size="20">&#181;m</text>
  <rect x="${xAntes}" y="${yAt(93.07)}" width="${barW}" height="${hAntes}" fill="${NAVY}"/>
  <rect x="${xDepois}" y="${yAt(98.27)}" width="${barW}" height="${hDepois}" fill="${TEAL}"/>
  <text x="${xAntes + barW / 2}" y="${yAt(93.07) - 24}" text-anchor="middle" fill="${NAVY}" font-family="${SERIF}" font-size="36" font-weight="700">93,07 &#181;m</text>
  <text x="${xDepois + barW / 2}" y="${yAt(98.27) - 24}" text-anchor="middle" fill="${NAVY}" font-family="${SERIF}" font-size="36" font-weight="700">98,27 &#181;m</text>
  <text x="${xAntes + barW / 2}" y="${chartBottom + 48}" text-anchor="middle" fill="${TEAL}" font-family="${SANS}" font-size="24">antes</text>
  <text x="${xDepois + barW / 2}" y="${chartBottom + 48}" text-anchor="middle" fill="${TEAL}" font-family="${SANS}" font-size="24">depois</text>
  <line x1="${xAntes + barW + 36}" y1="${yAt(93.07)}" x2="${xAntes + barW + 36}" y2="${yAt(98.27)}" stroke="${GOLD_INK}" stroke-width="2"/>
  <line x1="${xAntes + barW + 24}" y1="${yAt(93.07)}" x2="${xAntes + barW + 48}" y2="${yAt(93.07)}" stroke="${GOLD_INK}" stroke-width="2"/>
  <line x1="${xAntes + barW + 24}" y1="${yAt(98.27)}" x2="${xAntes + barW + 48}" y2="${yAt(98.27)}" stroke="${GOLD_INK}" stroke-width="2"/>
  <text x="${xAntes + barW + 56}" y="${(yAt(93.07) + yAt(98.27)) / 2 + 8}" fill="${GOLD_INK}" font-family="${SERIF}" font-size="28" font-weight="700">+5,2 &#181;m</text>
  <text x="96" y="1760" fill="${TEAL}" font-family="${SANS}" font-size="22">Eixo come&#231;a em 80 &#181;m. A diferen&#231;a &#233; esta, n&#227;o um salto de zero.</text>
  <line x1="96" y1="1988" x2="1558" y2="1988" stroke="${GOLD_INK}" stroke-width="1.2"/>
  <text x="96" y="2050" fill="${GOLD_INK}" font-family="${SANS}" font-size="22">Oktay, Dursun, Y&#305;lmaz. Eur J Ophthalmol. 2021;31(6):2997-3002.</text>
  <text x="96" y="2092" fill="${GOLD_INK}" font-family="${SANS}" font-size="22">doi:10.1177/1120672121991395</text>
  <text x="96" y="2154" fill="${GOLD_INK}" font-family="${SERIF}" font-size="22">L&#225;grima sem conservante + loteprednol, semanas. N&#227;o &#233; gota na sala. N&#227;o &#233; RCT.</text>
`,
    "O numero que muda a visita",
    { embedFaces },
  );

const beat = (i, y, title, body) => `
  <rect x="96" y="${y}" width="1462" height="380" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2"/>
  <rect x="96" y="${y}" width="92" height="380" fill="${NAVY}"/>
  <text x="142" y="${y + 210}" text-anchor="middle" fill="${GOLD}" font-family="${SERIF}" font-size="34" font-weight="700">${i}</text>
  <text x="240" y="${y + 150}" fill="${NAVY}" font-family="${SERIF}" font-size="42" font-weight="700">${title}</text>
  <text x="240" y="${y + 214}" fill="${TEAL}" font-family="${SANS}" font-size="26">${body}</text>
`;

const visita = (embedFaces) =>
  svg(
    `
  <rect width="${W}" height="${H}" fill="${IVORY}"/>
  <text x="96" y="160" fill="${NAVY}" font-family="${SERIF}" font-size="56" font-weight="700">O que muda na cadeira</text>
  ${beat("01", 240, "Piscar", "Quinze segundos de secagem j&#225; saem do erro do Stratus.")}
  ${beat("02", 660, "Ler o sinal", "No eixo daquele aparelho. Stratus e Cirrus n&#227;o s&#227;o Spectralis.")}
  ${beat("03", 1080, "Tratar e repetir", "OSD sobe o n&#250;mero. N&#227;o chamar progress&#227;o no scan seco.")}
  ${beat("04", 1500, "N&#227;o fechar", "Scan ruim n&#227;o fecha piora. Nem no sentido errado da plataforma.")}
`,
    "O que muda na cadeira",
    { embedFaces },
  );

const panel = (x, accent, triangle, label, mid, word) => `
  <rect x="${x}" y="420" width="680" height="1480" fill="${IVORY}"/>
  <polygon points="${triangle}" fill="${accent}"/>
  <text x="${x + 340}" y="820" text-anchor="middle" fill="${GOLD_INK}" font-family="${SERIF}" font-size="26" letter-spacing="3">${label}</text>
  <text x="${x + 340}" y="1100" text-anchor="middle" fill="${NAVY}" font-family="${SERIF}" font-size="36">${mid}</text>
  <text x="${x + 340}" y="1680" text-anchor="middle" fill="${accent}" font-family="${SERIF}" font-size="72" font-weight="700">${word}</text>
`;

const freio = (embedFaces) =>
  svg(
    `
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <text x="96" y="180" fill="#FFFFFF" font-family="${SERIF}" font-size="64" font-weight="700">O freio</text>
  <text x="96" y="250" fill="${GOLD}" font-family="${SANS}" font-size="28">A dire&#231;&#227;o do vi&#233;s depende do aparelho.</text>
  ${panel(96, TEAL, "436,680 336,520 536,520", "STRATUS / CIRRUS", "sinal baixo", "AFINA")}
  ${panel(878, GOLD, "1218,520 1118,680 1318,680", "SPECTRALIS", "Q baixo", "ENGROSSA")}
  <text x="96" y="2040" fill="#FFFFFF" font-family="${SANS}" font-size="22">Gershoni 2022 &#183; Strampe 2020</text>
  <text x="96" y="2090" fill="${GOLD}" font-family="${SANS}" font-size="22">N&#227;o fundir plataforma. Sem IA que calibra filme.</text>
`,
    "O freio: a direcao do vies depende do aparelho",
    { embedFaces },
  );

const plates = [
  ["placa-impacto", impacto],
  ["placa-evidencia", evidencia],
  ["placa-visita", visita],
  ["placa-freio", freio],
];

await mkdir(outDir, { recursive: true });
for (const [name, make] of plates) {
  const lean = make(false);
  const rich = make(true);
  const svgPath = path.join(outDir, `${name}.svg`);
  const pngPath = path.join(outDir, `${name}.png`);
  await writeFile(svgPath, lean);
  const png = await sharp(Buffer.from(rich))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(pngPath, png);
  const meta = await sharp(png).metadata();
  console.log(`${name}: ${meta.width}x${meta.height} ${png.length}B`);
}
