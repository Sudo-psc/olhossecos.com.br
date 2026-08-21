// Gera os cards OpenGraph por seção e os ícones da marca a partir do SVG.
//
// Composição vetorial em vez de imagem gerada: o texto sai nítido, o tamanho
// é exatamente 1200x630 e o arquivo fica na casa das dezenas de KB. Texto
// dentro de imagem gerada por IA sai deformado e não sobrevive a uma troca
// de título.
//
// Uso: node scripts/build-og-cards.mjs

import sharp from "sharp";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const OUT = "public/images/og";
const INK = "#071d45";
const TEAL = "#087f95";
const PAPER = "#ffffff";

mkdirSync(OUT, { recursive: true });

/** Escapa o que vai para dentro do SVG. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Quebra o título em linhas por contagem aproximada de caracteres. */
const quebrar = (texto, max) => {
  const linhas = [];
  let atual = "";
  for (const palavra of texto.split(" ")) {
    if ((atual + " " + palavra).trim().length > max && atual) {
      linhas.push(atual.trim());
      atual = palavra;
    } else {
      atual = (atual + " " + palavra).trim();
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
};

// Só o miolo do favicon: fora a tag <svg> raiz, o conteúdo é reaproveitado
// dentro de um <g> posicionado. O trim é necessário porque o arquivo termina
// com quebra de linha e a âncora $ não casaria com </svg>.
const marca = readFileSync("public/favicon.svg", "utf8")
  .trim()
  .replace(/^<svg[^>]*>/, "")
  .replace(/<\/svg>$/, "");

const cards = [
  ["home", "Olho Seco", "Portal do paciente"],
  ["sintomas", "Sintomas de olho seco", "O que você pode sentir e por quê"],
  [
    "causas",
    "Causas e fatores associados",
    "Por que quase nunca há uma causa só",
  ],
  ["diagnostico", "Diagnóstico", "Como a avaliação é construída"],
  ["tratamentos", "Tratamentos", "O que existe e o que cada opção pretende"],
  [
    "autocuidado",
    "Autocuidado no dia a dia",
    "Práticas de baixo risco, sem promessas",
  ],
  ["sinais-de-alerta", "Sinais de alerta", "Quando procurar avaliação rápida"],
  ["guias", "Guias", "Leituras curtas para decidir com mais clareza"],
  ["profissionais", "Para profissionais", "Superfície ocular em profundidade"],
  ["newsletter", "Newsletter", "Conteúdo editorial no seu e-mail"],
  ["olho-seco", "O que é olho seco?", "Filme lacrimal, tipos e mecanismos"],
  ["app", "Dry Eye Widget", "Pausas e piscadas na rotina de telas"],
  ["livros", "Livros", "Obras sobre olho seco e superfície ocular"],
  [
    "glossario",
    "Glossário do olho seco",
    "Termos técnicos em linguagem simples",
  ],
];

for (const [slug, titulo, subtitulo] of cards) {
  const linhas = quebrar(titulo, 22);
  const tamanho = linhas.length > 2 ? 74 : 88;
  const inicioY = 300 - (linhas.length - 1) * (tamanho * 0.56);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect x="0" y="0" width="1200" height="10" fill="${INK}"/>
  <g transform="translate(84,74) scale(1.35)">${marca}</g>
  ${linhas
    .map(
      (linha, i) =>
        `<text x="84" y="${inicioY + i * tamanho * 1.12}" font-family="Georgia,'Times New Roman',serif" font-size="${tamanho}" font-weight="700" fill="${INK}">${esc(linha)}</text>`,
    )
    .join("\n  ")}
  <text x="84" y="${inicioY + linhas.length * tamanho * 1.12 + 18}" font-family="Helvetica,Arial,sans-serif" font-size="34" fill="${TEAL}">${esc(subtitulo)}</text>
  <path d="M0 596 C 240 560, 420 632, 660 600 S 1020 560, 1200 592" fill="none" stroke="${TEAL}" stroke-width="4" opacity="0.55"/>
  <text x="1116" y="566" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="26" fill="${INK}" opacity="0.55">olhossecos.com.br</text>
</svg>`;

  const info = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(`${OUT}/og-${slug}.png`);

  console.log(
    `og-${slug}.png`.padEnd(30),
    `${info.width}x${info.height}`,
    `${(info.size / 1024).toFixed(1)} KB`,
  );
}

copyFileSync(`${OUT}/og-home.png`, "public/og-image.png");

const markSvg = readFileSync("public/favicon.svg");
for (const [file, size] of [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
]) {
  const info = await sharp(markSvg)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(
    file.replace("public/", "").padEnd(30),
    `${info.width}x${info.height}`,
    `${(info.size / 1024).toFixed(1)} KB`,
  );
}

const faviconPng = await sharp(markSvg).resize(48, 48).png().toBuffer();
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
const icoEntry = Buffer.alloc(16);
icoEntry.writeUInt8(48, 0);
icoEntry.writeUInt8(48, 1);
icoEntry.writeUInt16LE(1, 4);
icoEntry.writeUInt16LE(32, 6);
icoEntry.writeUInt32LE(faviconPng.length, 8);
icoEntry.writeUInt32LE(22, 12);
writeFileSync(
  "public/favicon.ico",
  Buffer.concat([icoHeader, icoEntry, faviconPng]),
);
console.log("favicon.ico".padEnd(30), "48x48");
