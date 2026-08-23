import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { after, test } from "node:test";
import {
  activateRelease,
  assertBuildMatchesCommit,
  assertRollbackAvailable,
  assertSafeReleasePath,
  rollbackRelease,
} from "./release.ts";

const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-release-"));

after(() => {
  rmSync(testDirectory, { recursive: true, force: true });
});

test("recusa publicar build de preview gerado com SITE_BASE_PATH", () => {
  // Um dist gerado com a variável no ambiente traz canonical, sitemap e todo
  // link interno sob o prefixo — URLs que dão 404 no domínio real. Passava por
  // aqui sem resistência: a árvore estava limpa e o SHA conferia.
  const source = mkdtempSync(join(testDirectory, "preview-"));
  const dist = join(source, "dist");
  mkdirSync(dist, { recursive: true });
  const sha = "b".repeat(40);

  writeFileSync(
    join(dist, "BUILD_METADATA.json"),
    JSON.stringify({ commitSha: sha, sourceClean: true, basePath: "/v2" }),
  );
  assert.throws(
    () => assertBuildMatchesCommit(source, sha),
    /SITE_BASE_PATH|preview/iu,
  );

  writeFileSync(
    join(dist, "BUILD_METADATA.json"),
    JSON.stringify({ commitSha: sha, sourceClean: true, basePath: "" }),
  );
  assert.doesNotThrow(() => assertBuildMatchesCommit(source, sha));

  // Manifesto antigo, sem o campo, continua válido: o campo nasceu depois.
  writeFileSync(
    join(dist, "BUILD_METADATA.json"),
    JSON.stringify({ commitSha: sha, sourceClean: true }),
  );
  assert.doesNotThrow(() => assertBuildMatchesCommit(source, sha));
});

test("bloqueia ativação quando ainda não existe release para rollback", () => {
  const releaseRoot = join(testDirectory, "without-current");
  mkdirSync(join(releaseRoot, "releases"), { recursive: true });

  assert.throws(
    () => assertRollbackAvailable(join(releaseRoot, "current")),
    /Bootstrap/u,
  );
});

test("troca o symlink current atomicamente e preserva o alvo anterior", () => {
  const releaseRoot = join(testDirectory, "portal");
  const releasesDirectory = join(releaseRoot, "releases");
  const releaseA = join(
    releasesDirectory,
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  );
  const releaseB = join(
    releasesDirectory,
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  );
  const currentLink = join(releaseRoot, "current");
  mkdirSync(releaseA, { recursive: true });
  mkdirSync(releaseB, { recursive: true });
  symlinkSync(relative(releaseRoot, releaseA), currentLink);

  const previousTarget = activateRelease({
    currentLink,
    releasePath: releaseB,
    releaseRoot,
  });

  assert.equal(previousTarget, relative(releaseRoot, releaseA));
  assert.equal(readlinkSync(currentLink), relative(releaseRoot, releaseB));

  rollbackRelease({ currentLink, previousTarget, releaseRoot });
  assert.equal(readlinkSync(currentLink), relative(releaseRoot, releaseA));
});

test("recusa release fora da raiz e nome que não seja SHA completo", () => {
  const releaseRoot = join(testDirectory, "safe-root");
  const outside = join(testDirectory, "outside", "aaaaaaaa");

  assert.throws(
    () => assertSafeReleasePath(releaseRoot, outside),
    /fora da raiz de releases/u,
  );
  assert.throws(
    () =>
      assertSafeReleasePath(
        releaseRoot,
        join(releaseRoot, "releases", "sha-curto"),
      ),
    /SHA completo/u,
  );
});

test("exige manifesto do build vinculado ao commit aprovado", () => {
  const sourceDirectory = join(testDirectory, "build-source");
  const distDirectory = join(sourceDirectory, "dist");
  const sha = "a".repeat(40);
  mkdirSync(distDirectory, { recursive: true });
  writeFileSync(
    join(distDirectory, "BUILD_METADATA.json"),
    JSON.stringify({ commitSha: "b".repeat(40), sourceClean: true }),
  );

  assert.throws(
    () => assertBuildMatchesCommit(sourceDirectory, sha),
    /manifesto.*build|build.*vincula|SHA.*build/iu,
  );

  writeFileSync(
    join(distDirectory, "BUILD_METADATA.json"),
    JSON.stringify({ commitSha: sha, sourceClean: true }),
  );
  assert.doesNotThrow(() => assertBuildMatchesCommit(sourceDirectory, sha));
});
