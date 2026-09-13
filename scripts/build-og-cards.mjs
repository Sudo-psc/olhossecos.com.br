// Gera os cards OpenGraph por seção a partir da marca em SVG.
//
// Composição vetorial em vez de imagem gerada: o texto sai nítido, o tamanho
// é exatamente 1200x630 e o arquivo fica na casa das dezenas de KB. Texto
// dentro de imagem gerada por IA sai deformado e não sobrevive a uma troca
// de título.
//
// Uso: node scripts/build-og-cards.mjs

import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { guides } from "../src/lib/guides.ts";
import { publishedArticles } from "../src/lib/superficie.ts";

const OUT = "public/images/og";
const INK = "#071d45";
const TEAL = "#087f95";
const PAPER = "#ffffff";

// A revista tem sistema de cores próprio e o card precisa parecer com ela, não
// com o portal.
const SURFACE_NAVY = "#001a33";
const SURFACE_PAPER = "#f7f4ed";
const SURFACE_GOLD = "#d9b665";

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
  [
    "olho-seco",
    "O que é olho seco?",
    "Filme lacrimal, tipos e por onde começar",
  ],
  ["glossario", "Glossário", "Termos da superfície ocular em linguagem clara"],
  ["paciente", "Portal do paciente", "Sintomas, diagnóstico e cuidado"],
  [
    "profissional",
    "Portal profissional",
    "Superfície ocular com a limitação declarada",
  ],
  ["newsletter", "Newsletter", "Conteúdo editorial no seu e-mail"],
  ["app", "Dry Eye Widget", "Pausas e piscadas na rotina de telas"],
];

/** Card do portal: papel branco, navy e teal. */
const cartaoPortal = (titulo, subtitulo) => {
  const linhas = quebrar(titulo, 22);
  const tamanho = linhas.length > 2 ? 74 : 88;
  const inicioY = 300 - (linhas.length - 1) * (tamanho * 0.56);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
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
};

/** Card da SUPERFÍCIE: navy, papel creme e ouro, com o cabeçalho da revista. */
const cartaoSuperficie = (titulo, chapeu) => {
  const linhas = quebrar(titulo, 26);
  const tamanho = linhas.length > 2 ? 66 : 80;
  const inicioY = 320 - (linhas.length - 1) * (tamanho * 0.56);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${SURFACE_NAVY}"/>
  <rect x="0" y="0" width="1200" height="8" fill="${SURFACE_GOLD}"/>
  <text x="84" y="112" font-family="Georgia,'Times New Roman',serif" font-size="42" letter-spacing="10" fill="${SURFACE_PAPER}">SUPERFÍCIE</text>
  <text x="84" y="168" font-family="Helvetica,Arial,sans-serif" font-size="24" letter-spacing="4" fill="${SURFACE_GOLD}">${esc(chapeu.toLocaleUpperCase("pt-BR"))}</text>
  ${linhas
    .map(
      (linha, i) =>
        `<text x="84" y="${inicioY + i * tamanho * 1.14}" font-family="Georgia,'Times New Roman',serif" font-size="${tamanho}" fill="${SURFACE_PAPER}">${esc(linha)}</text>`,
    )
    .join("\n  ")}
  <path d="M84 552 H 1116" stroke="${SURFACE_GOLD}" stroke-width="2" opacity="0.5"/>
  <text x="84" y="596" font-family="Helvetica,Arial,sans-serif" font-size="26" fill="${SURFACE_PAPER}" opacity="0.7">Revista de Olho Seco e Superfície Ocular</text>
  <text x="1116" y="596" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="26" fill="${SURFACE_PAPER}" opacity="0.55">olhossecos.com.br</text>
</svg>`;
};

const gravar = async (svg, caminho) => {
  const info = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(caminho);
  console.log(
    caminho.replace("public/images/", "").padEnd(46),
    `${info.width}x${info.height}`,
    `${(info.size / 1024).toFixed(1)} KB`,
  );
};

for (const [slug, titulo, subtitulo] of cards) {
  await gravar(cartaoPortal(titulo, subtitulo), `${OUT}/og-${slug}.png`);
}

// Um card por guia e por artigo. Antes, os doze guias dividiam o mesmo
// og-image.png genérico e onze dos treze artigos dividiam a capa da revista:
// compartilhar qualquer um deles no WhatsApp ou no LinkedIn mostrava a mesma
// figura, sem dizer qual texto estava sendo compartilhado.
mkdirSync(`${OUT}/guias`, { recursive: true });
for (const guide of guides) {
  await gravar(
    cartaoPortal(guide.seoTitle ?? guide.title, guide.category),
    `${OUT}/guias/${guide.slug}.png`,
  );
}

mkdirSync(`${OUT}/superficie`, { recursive: true });
for (const article of publishedArticles) {
  await gravar(
    cartaoSuperficie(article.title, article.category),
    `${OUT}/superficie/${article.slug}.png`,
  );
}
