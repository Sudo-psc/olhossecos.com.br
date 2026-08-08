import {
  chmodSync,
  closeSync,
  constants,
  fchmodSync,
  mkdirSync,
  openSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";
import { createNewsletterUnsubscribeToken } from "./newsletter.ts";

export type NewsletterCampaignRecipient = {
  email: string;
  name: string;
  audienceRole: string | null;
  source: string;
  unsubscribeUrl: string;
};

export const writePrivateExport = (outputPath: string, content: string) => {
  const flags =
    constants.O_WRONLY |
    constants.O_CREAT |
    constants.O_EXCL |
    (constants.O_NOFOLLOW ?? 0);
  const descriptor = openSync(outputPath, flags, 0o600);
  try {
    fchmodSync(descriptor, 0o600);
    writeFileSync(descriptor, content, { encoding: "utf8" });
  } finally {
    closeSync(descriptor);
  }
};

export const getNewsletterCampaignRecipients = ({
  databasePath,
  tokenSecret,
  siteOrigin,
}: {
  databasePath: string;
  tokenSecret: string;
  siteOrigin: string;
}): NewsletterCampaignRecipient[] => {
  if (tokenSecret.length < 32) {
    throw new Error(
      "NEWSLETTER_TOKEN_SECRET deve ter pelo menos 32 caracteres.",
    );
  }
  const origin = new URL(siteOrigin).origin;
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const rows = database
      .prepare(
        `SELECT email, name, audience_role, source, unsubscribe_key
         FROM newsletter_subscribers
         WHERE status = 'active'
           AND unsubscribe_key IS NOT NULL
           AND unsubscribe_key <> ''
         ORDER BY created_at ASC`,
      )
      .all() as Array<{
      email: string;
      name: string;
      audience_role: string | null;
      source: string;
      unsubscribe_key: string;
    }>;

    return rows.map((row) => {
      const token = createNewsletterUnsubscribeToken(
        row.unsubscribe_key,
        tokenSecret,
      );
      const unsubscribeUrl = new URL("/newsletter/descadastrar", origin);
      unsubscribeUrl.searchParams.set("token", token);
      return {
        email: row.email,
        name: row.name,
        audienceRole: row.audience_role,
        source: row.source,
        unsubscribeUrl: unsubscribeUrl.href,
      };
    });
  } finally {
    database.close();
  }
};

export const verifySqliteDatabase = (databasePath: string) => {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare("PRAGMA integrity_check").get() as {
      integrity_check: string;
    };
    return row.integrity_check;
  } finally {
    database.close();
  }
};

export const backupSqliteDatabase = async (
  databasePath: string,
  destinationPath: string,
) => {
  mkdirSync(dirname(destinationPath), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(databasePath);
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
