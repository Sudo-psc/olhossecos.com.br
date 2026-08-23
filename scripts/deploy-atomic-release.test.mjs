import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

test(
  "prepara release só com build do SHA aprovado e fuma candidato sem root",
  { skip: process.getuid?.() !== 0 },
  () => {
    const testDirectory = mkdtempSync(
      join(tmpdir(), "olhossecos-deploy-release-"),
    );
    chmodSync(testDirectory, 0o755);

    try {
      const sourceDirectory = join(testDirectory, "source");
      const releaseRoot = join(testDirectory, "release-root");
      const evidenceDirectory = join(testDirectory, "evidence");
      const npmCacheDirectory = join(testDirectory, "npm-cache");
      mkdirSync(join(sourceDirectory, "scripts"), { recursive: true });
      mkdirSync(join(sourceDirectory, "src/lib"), { recursive: true });
      mkdirSync(join(sourceDirectory, "dist/server"), { recursive: true });
      mkdirSync(join(sourceDirectory, "dist/client"), { recursive: true });
      mkdirSync(releaseRoot, { recursive: true });
      mkdirSync(evidenceDirectory, { recursive: true });
      mkdirSync(npmCacheDirectory, { recursive: true });
      chmodSync(sourceDirectory, 0o755);
      chmodSync(releaseRoot, 0o755);
      chmodSync(evidenceDirectory, 0o777);
      chmodSync(npmCacheDirectory, 0o777);

      writeFileSync(
        join(sourceDirectory, ".gitignore"),
        "dist\nnode_modules\n",
      );
      writeFileSync(
        join(sourceDirectory, "package.json"),
        JSON.stringify({ name: "candidate", version: "1.0.0" }),
      );
      writeFileSync(
        join(sourceDirectory, "package-lock.json"),
        JSON.stringify({
          name: "candidate",
          version: "1.0.0",
          lockfileVersion: 3,
          requires: true,
          packages: { "": { name: "candidate", version: "1.0.0" } },
        }),
      );
      writeFileSync(join(sourceDirectory, "scripts/placeholder.mjs"), "\n");
      writeFileSync(join(sourceDirectory, "src/lib/placeholder.ts"), "\n");
      writeFileSync(
        join(sourceDirectory, "dist/server/entry.mjs"),
        `import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
writeFileSync(process.env.CANDIDATE_UID_FILE, String(process.getuid?.() ?? "none"));
createServer((_request, response) => {
  response.statusCode = 200;
  response.end("ok");
}).listen(Number(process.env.PORT), process.env.HOST);
`,
      );
      chmodSync(join(sourceDirectory, "dist/server/entry.mjs"), 0o664);
      writeFileSync(join(sourceDirectory, "dist/client/index.html"), "ok\n");
      writeFileSync(
        join(sourceDirectory, "dist/BUILD_METADATA.json"),
        JSON.stringify({ commitSha: "0".repeat(40), sourceClean: true }),
      );

      execFileSync("git", ["init", "-q"], { cwd: sourceDirectory });
      execFileSync("git", ["config", "user.email", "test@example.org"], {
        cwd: sourceDirectory,
      });
      execFileSync("git", ["config", "user.name", "Deploy Test"], {
        cwd: sourceDirectory,
      });
      execFileSync("git", ["add", "."], { cwd: sourceDirectory });
      execFileSync("git", ["commit", "-qm", "fixture"], {
        cwd: sourceDirectory,
      });
      const sha = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: sourceDirectory,
        encoding: "utf8",
      }).trim();

      const deployArguments = [
        "--source",
        sourceDirectory,
        "--sha",
        sha,
        "--release-root",
        releaseRoot,
        "--mode",
        "prepare-only",
      ];
      const run = (metadataSha) => {
        writeFileSync(
          join(sourceDirectory, "dist/BUILD_METADATA.json"),
          JSON.stringify({ commitSha: metadataSha, sourceClean: true }),
        );
        return spawnSync(
          process.execPath,
          [
            join(repositoryDirectory, "scripts/deploy-atomic-release.mjs"),
            ...deployArguments,
          ],
          {
            cwd: repositoryDirectory,
            env: {
              ...process.env,
              CANDIDATE_UID_FILE: join(evidenceDirectory, "candidate.uid"),
              NPM_CONFIG_CACHE: npmCacheDirectory,
            },
            encoding: "utf8",
            timeout: 60_000,
          },
        );
      };

      const rejected = run("b".repeat(40));
      assert.notEqual(rejected.status, 0);
      assert.match(
        `${rejected.stdout}\n${rejected.stderr}`,
        /build|manifesto|SHA/u,
      );

      const accepted = run(sha);
      assert.equal(
        accepted.status,
        0,
        `${accepted.stdout}\n${accepted.stderr}`,
      );

      const releasePath = join(releaseRoot, "releases", sha);
      const releaseStat = statSync(releasePath);
      const entryStat = statSync(join(releasePath, "dist/server/entry.mjs"));
      assert.equal(releaseStat.uid, 0);
      assert.equal(entryStat.uid, 0);
      assert.equal(entryStat.mode & 0o022, 0);
      assert.notEqual(
        Number(readFileSync(join(evidenceDirectory, "candidate.uid"), "utf8")),
        0,
      );
    } finally {
      rmSync(testDirectory, { recursive: true, force: true });
    }
  },
);
