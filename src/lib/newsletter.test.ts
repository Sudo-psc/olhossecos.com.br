import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  closeNewsletterDatabases,
  handleNewsletterRequest,
} from "./newsletter.ts";

const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-newsletter-"));
const databasePath = join(testDirectory, "newsletter.sqlite");
const allowedOrigin = "https://olhossecos.com.br";

const request = (body: Record<string, unknown>, origin = allowedOrigin) =>
  new Request(`${allowedOrigin}/api/newsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(body),
  });

const validPayload = {
  name: "Leitora Teste",
  email: "leitora@example.com",
  profession: "Oftalmologista",
  company: "",
  consent: "accepted",
};

beforeEach(() => {
  closeNewsletterDatabases();
  rmSync(databasePath, { force: true });
  rmSync(`${databasePath}-shm`, { force: true });
  rmSync(`${databasePath}-wal`, { force: true });
});

after(() => {
  closeNewsletterDatabases();
  rmSync(testDirectory, { recursive: true, force: true });
});

test("cadastra e atualiza uma assinatura sem duplicar o e-mail", async () => {
  const first = await handleNewsletterRequest(request(validPayload), {
    allowedOrigin,
    databasePath,
    rateLimit: false,
  });
  const second = await handleNewsletterRequest(
    request({ ...validPayload, name: "Leitora Atualizada" }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(first.status, 201);
  assert.equal(second.status, 201);

  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      "SELECT email, name, status, consent_version FROM newsletter_subscribers",
    )
    .get() as Record<string, string>;
  const count = database
    .prepare("SELECT COUNT(*) AS total FROM newsletter_subscribers")
    .get() as { total: number };
  database.close();

  assert.equal(count.total, 1);
  assert.equal(row.email, "leitora@example.com");
  assert.equal(row.name, "Leitora Atualizada");
  assert.equal(row.status, "active");
  assert.equal(row.consent_version, "privacy-2026-08-07");
});

test("exige consentimento explícito", async () => {
  const response = await handleNewsletterRequest(
    request({ ...validPayload, consent: undefined }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 422);
});

test("descarta silenciosamente envios preenchidos por bots", async () => {
  const response = await handleNewsletterRequest(
    request({ ...validPayload, company: "Spam Ltda." }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 202);
  assert.equal(existsSync(databasePath), false);
});

test("recusa origem cruzada", async () => {
  const response = await handleNewsletterRequest(
    request(validPayload, "https://example.org"),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 403);
});
