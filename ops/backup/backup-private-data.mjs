import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { backup, DatabaseSync } from "node:sqlite";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const verifySqliteDatabase = (databasePath) => {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare("PRAGMA integrity_check").get();
    return row.integrity_check;
  } finally {
    database.close();
  }
};

const backupSqliteDatabase = async (databasePath, destinationPath) => {
  mkdirSync(resolve(destinationPath, ".."), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    await backup(database, destinationPath);
  } finally {
    database.close();
  }
  chmodSync(destinationPath, 0o600);
  const integrity = verifySqliteDatabase(destinationPath);
  if (integrity !== "ok") {
    throw new Error(`Backup SQLite inválido: ${integrity}`);
  }
  return { destinationPath, integrity };
};

export const runPrivateDataBackup = async ({
  backupRoot = process.env.OLHOSSECOS_BACKUP_ROOT ??
    "/var/backups/olhossecos/private-data",
  now = new Date(),
  sources = [
    process.env.NEWSLETTER_DATABASE_PATH ??
      "/var/lib/olhossecos/newsletter.sqlite",
    process.env.PARTNER_INQUIRY_DATABASE_PATH ??
      "/var/lib/olhossecos/superficie-partner-inquiries.sqlite",
    process.env.ANALYTICS_DATABASE_PATH ??
      "/var/lib/olhossecos/analytics.sqlite",
  ],
} = {}) => {
  const destinationDirectory = join(
    resolve(backupRoot),
    now.toISOString().replace(/[:.]/gu, "-"),
  );
  const resolvedSources = sources.map((sourcePath) => resolve(sourcePath));
  mkdirSync(destinationDirectory, { recursive: true, mode: 0o700 });
  chmodSync(destinationDirectory, 0o700);

  const manifest = {
    createdAt: now.toISOString(),
    files: [],
    missing: [],
  };

  for (const sourcePath of resolvedSources) {
    if (!existsSync(sourcePath)) {
      manifest.missing.push(basename(sourcePath));
      continue;
    }

    const destinationPath = join(destinationDirectory, basename(sourcePath));
    await backupSqliteDatabase(sourcePath, destinationPath);
    const checksum = createHash("sha256")
      .update(readFileSync(destinationPath))
      .digest("hex");
    manifest.files.push({
      name: basename(sourcePath),
      sha256: checksum,
    });
  }

  if (manifest.files.length === 0) {
    throw new Error("Nenhum banco privado foi encontrado para backup.");
  }

  const manifestPath = join(destinationDirectory, "manifest.json");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    mode: 0o600,
  });
  chmodSync(manifestPath, 0o600);
  return { destinationDirectory, manifest };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await runPrivateDataBackup();
  console.log(result.destinationDirectory);
}
