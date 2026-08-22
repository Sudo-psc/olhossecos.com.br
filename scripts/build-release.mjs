import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteClientBase } from "./site-base-path.mjs";

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

await rewriteClientBase(
  join(repositoryDirectory, "dist", "client"),
  process.env.SITE_BASE_PATH,
);

writeFileSync(
  join(repositoryDirectory, "dist", "BUILD_METADATA.json"),
  `${JSON.stringify({ commitSha, sourceClean, generatedBy: "npm run build" }, null, 2)}\n`,
  { mode: 0o644 },
);
