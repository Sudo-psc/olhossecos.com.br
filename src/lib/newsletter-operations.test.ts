import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  backupSqliteDatabase,
  getNewsletterCampaignRecipients,
  verifySqliteDatabase,
  writePrivateExport,
} from "./newsletter-operations.ts";

const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-operations-"));

after(() => {
  rmSync(testDirectory, { recursive: true, force: true });
});

const createNewsletterDatabase = (path: string) => {
  const database = new DatabaseSync(path);
  database.exec(`
    CREATE TABLE newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      audience_role TEXT,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      unsubscribe_key TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  database
    .prepare(
      `INSERT INTO newsletter_subscribers (
        id, email, name, audience_role, source, status,
        unsubscribe_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "active-id",
      "ativa@example.com",
      "Assinante Ativa",
      "medico",
      "superficie",
      "active",
      "11111111-1111-4111-8111-111111111111",
      "2026-08-08T10:00:00.000Z",
    );
  database
    .prepare(
      `INSERT INTO newsletter_subscribers (
        id, email, name, audience_role, source, status,
        unsubscribe_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "suppressed-id",
      "suprimida@example.com",
      "Assinante Suprimida",
      "paciente",
      "newsletter",
      "unsubscribed",
      "22222222-2222-4222-8222-222222222222",
      "2026-08-08T11:00:00.000Z",
    );
  database.close();
};

test("exporta somente assinantes ativos com URL opaca de descadastro", () => {
  const databasePath = join(testDirectory, "recipients.sqlite");
  rmSync(databasePath, { force: true });
  createNewsletterDatabase(databasePath);

  const recipients = getNewsletterCampaignRecipients({
    databasePath,
    tokenSecret: "segredo-de-operacao-com-pelo-menos-32-caracteres",
    siteOrigin: "https://olhossecos.com.br",
  });

  assert.equal(recipients.length, 1);
  assert.equal(recipients[0]?.email, "ativa@example.com");
  assert.equal(recipients[0]?.audienceRole, "medico");
  assert.match(
    recipients[0]?.unsubscribeUrl ?? "",
    /^https:\/\/olhossecos\.com\.br\/newsletter\/descadastrar\?token=/u,
  );
  assert.doesNotMatch(recipients[0]?.unsubscribeUrl ?? "", /ativa%40|example/u);
});

test("gera snapshot consistente e verificável do SQLite", async () => {
  const databasePath = join(testDirectory, "source.sqlite");
  const backupPath = join(testDirectory, "backup", "source.sqlite");
  rmSync(databasePath, { force: true });
  rmSync(join(testDirectory, "backup"), { recursive: true, force: true });
  createNewsletterDatabase(databasePath);

  const result = await backupSqliteDatabase(databasePath, backupPath);

  assert.equal(existsSync(backupPath), true);
  assert.equal(result.integrity, "ok");
  assert.equal(verifySqliteDatabase(backupPath), "ok");
  const backup = new DatabaseSync(backupPath, { readOnly: true });
  const count = backup
    .prepare("SELECT COUNT(*) AS total FROM newsletter_subscribers")
    .get() as { total: number };
  backup.close();
  assert.equal(count.total, 2);
});

test("não segue symlink durante a criação exclusiva de uma exportação", () => {
  const targetPath = join(testDirectory, "export-target.txt");
  const outputPath = join(testDirectory, "export.jsonl");
  writeFileSync(targetPath, "conteúdo original\n");
  rmSync(outputPath, { force: true });
  symlinkSync(targetPath, outputPath);

  assert.throws(
    () => writePrivateExport(outputPath, "conteúdo atacante\n"),
    /exist|symlink|EEXIST|ELOOP/u,
  );
  assert.equal(readFileSync(targetPath, "utf8"), "conteúdo original\n");
});
