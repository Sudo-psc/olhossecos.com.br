import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

writeFileSync(
  join(repositoryDirectory, "dist", "BUILD_METADATA.json"),
  `${JSON.stringify({ commitSha, sourceClean, generatedBy: "npm run build" }, null, 2)}\n`,
  { mode: 0o644 },
);
