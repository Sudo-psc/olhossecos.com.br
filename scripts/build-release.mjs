import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeBasePath, rewriteClientBase } from "./site-base-path.mjs";

const repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const git = (argumentsList) =>
  execFileSync("git", ["-C", repositoryDirectory, ...argumentsList], {
    encoding: "utf8",
  }).trim();
const commitSha = git(["rev-parse", "HEAD"]);
const sourceClean =
  git(["status", "--porcelain", "--untracked-files=all"]) === "";

execFileSync("astro", ["check"], {
  cwd: repositoryDirectory,
  stdio: "inherit",
});
execFileSync("astro", ["build"], {
  cwd: repositoryDirectory,
  stdio: "inherit",
});

// O adapter Node lê dist/_headers.json quando staticHeaders=true. O hook
// dele só grava CSP e pode esvaziar o arquivo; reescrevemos o MIME das
// rotas de descoberta depois do astro build.
execFileSync(
  process.execPath,
  ["--experimental-strip-types", "scripts/write-discovery-headers.mjs"],
  { cwd: repositoryDirectory, stdio: "inherit" },
);

// Caminhos que existem sob public/ mas não devem ir para produção.
//
// As placas em art/ e os PNGs de origem dos heros são INSUMOS dos geradores
// (generate-superficie-edicao-00-assets.mjs, build-og-cards.mjs): moram sob
// public/ apenas porque é para lá que os scripts escrevem. O reader consome
// pages/*.webp pelo manifest e nunca toca em art/ — eram 65 MB de PNG servidos
// publicamente sem nenhuma referência, 57% do build.
const leftovers = [
  "superficie/lab/flipbook",
  "superficie/issues/poc",
  "superficie/issues/edicao-00/art",
  "images/superficie/capa-edicao-00-conteudos-v2.png",
  "images/superficie/og-superficie-source.png",
  // Masters dos heros. O <picture> serve avif/webp e cai no .jpg; o PNG só
  // existe para regerar os derivados quando a arte mudar.
  "images/hero-tear-film.png",
  "images/superficie/hero-interferometria.png",
  "images/superficie/capa-edicao-00.png",
];

for (const leftover of leftovers) {
  rmSync(join(repositoryDirectory, "dist", "client", leftover), {
    recursive: true,
    force: true,
  });
}

// SITE_BASE_PATH reescreve link, canonical e sitemap para servir o site sob um
// prefixo. É recurso de preview, e o build o lia do ambiente sem deixar rastro:
// bastava a variável estar exportada no shell para sair um dist em que todo
// canonical apontava para /v2/… — URLs que dão 404 no domínio real. Árvore
// limpa, portão verde, ops:deploy aceitando. Registrar o valor no manifesto é
// o que permite ao deploy recusar depois.
const basePath = normalizeBasePath(process.env.SITE_BASE_PATH ?? "");

await rewriteClientBase(join(repositoryDirectory, "dist", "client"), basePath);

if (basePath) {
  console.warn(
    `[build] SITE_BASE_PATH=${basePath}: build de preview, não publicável. ` +
      `Rode com "env -u SITE_BASE_PATH npm run build" para gerar produção.`,
  );
}

writeFileSync(
  join(repositoryDirectory, "dist", "BUILD_METADATA.json"),
  `${JSON.stringify({ commitSha, sourceClean, basePath, generatedBy: "npm run build" }, null, 2)}\n`,
  { mode: 0o644 },
);
