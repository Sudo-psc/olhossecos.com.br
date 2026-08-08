import { randomUUID } from "node:crypto";
import {
  chmodSync,
  chownSync,
  existsSync,
  lchownSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

export const assertBuildMatchesCommit = (
  sourceDirectory: string,
  expectedSha: string,
) => {
  const metadataPath = join(sourceDirectory, "dist", "BUILD_METADATA.json");
  let metadata: { commitSha?: unknown; sourceClean?: unknown };
  try {
    metadata = JSON.parse(readFileSync(metadataPath, "utf8")) as {
      commitSha?: unknown;
      sourceClean?: unknown;
    };
  } catch {
    throw new Error(
      "O build não possui manifesto legível vinculado ao commit aprovado.",
    );
  }

  if (metadata.commitSha !== expectedSha || metadata.sourceClean !== true) {
    throw new Error(
      `Manifesto do build não comprova o SHA ${expectedSha} em uma árvore limpa.`,
    );
  }
};

export const secureReleaseTree = (
  releasePath: string,
  ownerUid = 0,
  ownerGid = 0,
) => {
  const visit = (path: string) => {
    const stats = lstatSync(path);
    if (stats.isSymbolicLink()) {
      lchownSync(path, ownerUid, ownerGid);
      return;
    }

    chownSync(path, ownerUid, ownerGid);
    if (stats.isDirectory()) {
      chmodSync(path, 0o755);
      for (const entry of readdirSync(path)) visit(join(path, entry));
      return;
    }

    chmodSync(path, 0o644);
  };

  visit(releasePath);
};

export const assertSafeReleasePath = (
  releaseRoot: string,
  releasePath: string,
) => {
  const safeRoot = resolve(releaseRoot);
  const releasesDirectory = resolve(safeRoot, "releases");
  const safeRelease = resolve(releasePath);
  const pathFromReleases = relative(releasesDirectory, safeRelease);
  if (
    !pathFromReleases ||
    pathFromReleases.startsWith(`..${sep}`) ||
    pathFromReleases === ".." ||
    pathFromReleases.includes(sep)
  ) {
    throw new Error("Release fora da raiz de releases permitida.");
  }
  if (!/^[0-9a-f]{40}$/u.test(basename(safeRelease))) {
    throw new Error("O diretório de release deve usar um SHA completo.");
  }
  return safeRelease;
};

const replaceSymlink = (
  currentLink: string,
  target: string,
  releaseRoot: string,
) => {
  const safeCurrentLink = resolve(currentLink);
  if (safeCurrentLink !== resolve(releaseRoot, "current")) {
    throw new Error("O symlink ativo deve ser releaseRoot/current.");
  }

  const temporaryLink = `${safeCurrentLink}.next-${process.pid}-${randomUUID()}`;
  try {
    symlinkSync(target, temporaryLink);
    renameSync(temporaryLink, safeCurrentLink);
  } finally {
    rmSync(temporaryLink, { force: true });
  }
};

export const assertRollbackAvailable = (currentLink: string) => {
  if (!existsSync(currentLink) || !lstatSync(currentLink).isSymbolicLink()) {
    throw new Error(
      "Bootstrap necessário: current deve apontar para um release anterior.",
    );
  }
  return readlinkSync(currentLink);
};

export const activateRelease = ({
  currentLink,
  releasePath,
  releaseRoot,
}: {
  currentLink: string;
  releasePath: string;
  releaseRoot: string;
}) => {
  const safeRelease = assertSafeReleasePath(releaseRoot, releasePath);
  if (!existsSync(safeRelease) || !lstatSync(safeRelease).isDirectory()) {
    throw new Error("O diretório de release não existe.");
  }

  let previousTarget: string | null = null;
  if (existsSync(currentLink)) {
    if (!lstatSync(currentLink).isSymbolicLink()) {
      throw new Error("current existe, mas não é um symlink.");
    }
    previousTarget = readlinkSync(currentLink);
  }

  const target = relative(dirname(resolve(currentLink)), safeRelease);
  replaceSymlink(currentLink, target, releaseRoot);
  return previousTarget;
};

export const rollbackRelease = ({
  currentLink,
  previousTarget,
  releaseRoot,
}: {
  currentLink: string;
  previousTarget: string | null;
  releaseRoot: string;
}) => {
  if (!previousTarget) {
    throw new Error("Não existe release anterior para rollback.");
  }
  const previousRelease = resolve(
    dirname(resolve(currentLink)),
    previousTarget,
  );
  assertSafeReleasePath(releaseRoot, previousRelease);
  if (
    !existsSync(previousRelease) ||
    !lstatSync(previousRelease).isDirectory()
  ) {
    throw new Error("O release anterior não existe.");
  }
  replaceSymlink(currentLink, previousTarget, releaseRoot);
};
