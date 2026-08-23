import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  closeNewsletterDatabases,
  createNewsletterUnsubscribeToken,
  handleNewsletterRequest,
  handleNewsletterUnsubscribeRequest,
} from "./newsletter.ts";

const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-newsletter-"));
const databasePath = join(testDirectory, "newsletter.sqlite");
const allowedOrigin = "https://olhossecos.com.br";
const tokenSecret = "segredo-de-teste-com-pelo-menos-32-caracteres";

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
  assert.equal(row.consent_version, "privacy-2026-08-08");
});

test("aceita cadastro inicial da SUPERFÍCIE somente com e-mail e preserva a origem", async () => {
  const response = await handleNewsletterRequest(
    request({
      email: "medica@example.com",
      source: "superficie",
      consent: "accepted",
      utmSource: "qr-edicao-00",
      utmCampaign: "lancamento",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 201);
  const result = (await response.json()) as { profileToken?: string };
  assert.equal(typeof result.profileToken, "string");
  assert.ok((result.profileToken?.length ?? 0) >= 32);

  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      `SELECT email, name, source, audience_role, utm_source, utm_campaign
       FROM newsletter_subscribers`,
    )
    .get() as Record<string, string | null>;
  database.close();

  assert.equal(row.email, "medica@example.com");
  assert.equal(row.name, "");
  assert.equal(row.source, "superficie");
  assert.equal(row.audience_role, null);
  assert.equal(row.utm_source, "qr-edicao-00");
  assert.equal(row.utm_campaign, "lancamento");
});

test("aceita a origem geral da newsletter com cadastro mínimo", async () => {
  const response = await handleNewsletterRequest(
    request({
      email: "portal@example.com",
      source: "newsletter",
      consent: "accepted",
      utmSource: "header",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 201);
  const result = (await response.json()) as { profileToken?: string };
  assert.equal(typeof result.profileToken, "string");

  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      `SELECT email, name, source, utm_source
       FROM newsletter_subscribers WHERE email = ?`,
    )
    .get("portal@example.com") as Record<string, string>;
  database.close();

  assert.equal(row.name, "");
  assert.equal(row.source, "newsletter");
  assert.equal(row.utm_source, "header");
});

test("completa o perfil opcional somente com o token emitido no cadastro", async () => {
  const subscription = await handleNewsletterRequest(
    request({
      email: "fellow@example.com",
      source: "superficie",
      consent: "accepted",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );
  const { profileToken } = (await subscription.json()) as {
    profileToken: string;
  };

  const profile = await handleNewsletterRequest(
    request({
      stage: "profile",
      email: "fellow@example.com",
      audienceRole: "residente-fellow",
      profileToken,
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(profile.status, 200);

  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      `SELECT audience_role, profile_token_hash, profile_token_expires_at
       FROM newsletter_subscribers WHERE email = ?`,
    )
    .get("fellow@example.com") as Record<string, string | null>;
  database.close();

  assert.equal(row.audience_role, "residente-fellow");
  assert.equal(row.profile_token_hash, null);
  assert.equal(row.profile_token_expires_at, null);
});

test("migra a base existente antes de salvar os novos campos da SUPERFÍCIE", async () => {
  const legacy = new DatabaseSync(databasePath);
  legacy.exec(`
    CREATE TABLE newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      profession TEXT,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      consented_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  legacy.close();

  const response = await handleNewsletterRequest(
    request({
      email: "migracao@example.com",
      source: "superficie",
      consent: "accepted",
    }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 201);
  closeNewsletterDatabases();
  const migrated = new DatabaseSync(databasePath, { readOnly: true });
  const columns = migrated
    .prepare("PRAGMA table_info(newsletter_subscribers)")
    .all() as Array<{ name: string }>;
  const indexes = migrated
    .prepare("PRAGMA index_list(newsletter_subscribers)")
    .all() as Array<{ name: string; unique: number }>;
  migrated.close();

  assert.ok(columns.some(({ name }) => name === "audience_role"));
  assert.ok(columns.some(({ name }) => name === "profile_token_hash"));
  assert.ok(columns.some(({ name }) => name === "utm_campaign"));
  assert.ok(columns.some(({ name }) => name === "unsubscribe_key"));
  assert.ok(
    indexes.some(
      ({ name, unique }) =>
        name === "newsletter_subscribers_unsubscribe_key_idx" && unique === 1,
    ),
  );
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

test("descadastra por token opaco e mantém o endereço na supressão", async () => {
  await handleNewsletterRequest(request(validPayload), {
    allowedOrigin,
    databasePath,
    rateLimit: false,
  });
  closeNewsletterDatabases();
  const reader = new DatabaseSync(databasePath, { readOnly: true });
  const { unsubscribe_key: unsubscribeKey } = reader
    .prepare(
      "SELECT unsubscribe_key FROM newsletter_subscribers WHERE email = ?",
    )
    .get(validPayload.email) as { unsubscribe_key: string };
  reader.close();
  assert.doesNotMatch(unsubscribeKey, /@/u);

  const token = createNewsletterUnsubscribeToken(unsubscribeKey, tokenSecret);
  const unsubscribeRequest = () =>
    new Request(`${allowedOrigin}/api/newsletter-unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: allowedOrigin,
      },
      body: JSON.stringify({ token }),
    });
  const first = await handleNewsletterUnsubscribeRequest(unsubscribeRequest(), {
    allowedOrigin,
    databasePath,
    tokenSecret,
  });
  const second = await handleNewsletterUnsubscribeRequest(
    unsubscribeRequest(),
    {
      allowedOrigin,
      databasePath,
      tokenSecret,
    },
  );

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      `SELECT status, unsubscribed_at
       FROM newsletter_subscribers WHERE email = ?`,
    )
    .get(validPayload.email) as Record<string, string>;
  database.close();

  assert.equal(row.status, "unsubscribed");
  assert.equal(typeof row.unsubscribed_at, "string");
});

test("recusa token de descadastro adulterado", async () => {
  const response = await handleNewsletterUnsubscribeRequest(
    new Request(`${allowedOrigin}/api/newsletter-unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: allowedOrigin,
      },
      body: JSON.stringify({ token: "chave.assinatura-invalida" }),
    }),
    { allowedOrigin, databasePath, tokenSecret },
  );

  assert.equal(response.status, 403);
});

test("novo cadastro anônimo não reativa um endereço anteriormente descadastrado", async () => {
  await handleNewsletterRequest(request(validPayload), {
    allowedOrigin,
    databasePath,
    rateLimit: false,
  });
  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath);
  database
    .prepare(
      `UPDATE newsletter_subscribers
       SET status = 'unsubscribed', unsubscribed_at = ?
       WHERE email = ?`,
    )
    .run("2026-08-08T12:00:00.000Z", validPayload.email);
  database.close();

  let deliveredToken = "";
  const response = await handleNewsletterRequest(request(validPayload), {
    allowedOrigin,
    databasePath,
    rateLimit: false,
    sendConfirmationEmail: async ({ token }: { token: string }) => {
      deliveredToken = token;
    },
  });
  assert.equal(response.status, 202);
  assert.ok(deliveredToken.length >= 32);

  closeNewsletterDatabases();
  const reader = new DatabaseSync(databasePath, { readOnly: true });
  const row = reader
    .prepare(
      `SELECT status, unsubscribed_at, confirmation_token_hash
       FROM newsletter_subscribers WHERE email = ?`,
    )
    .get(validPayload.email) as Record<string, string | null>;
  reader.close();

  assert.equal(row.status, "unsubscribed");
  assert.equal(row.unsubscribed_at, "2026-08-08T12:00:00.000Z");
  assert.equal(typeof row.confirmation_token_hash, "string");
});

test("reativa uma supressão somente com o token enviado ao e-mail", async () => {
  await handleNewsletterRequest(request(validPayload), {
    allowedOrigin,
    databasePath,
    rateLimit: false,
  });
  closeNewsletterDatabases();
  const database = new DatabaseSync(databasePath);
  database
    .prepare(
      `UPDATE newsletter_subscribers
       SET status = 'unsubscribed', unsubscribed_at = ?
       WHERE email = ?`,
    )
    .run("2026-08-08T12:00:00.000Z", validPayload.email);
  database.close();

  let deliveredToken = "";
  const pending = await handleNewsletterRequest(request(validPayload), {
    allowedOrigin,
    databasePath,
    rateLimit: false,
    sendConfirmationEmail: async ({ token }: { token: string }) => {
      deliveredToken = token;
    },
  });
  assert.equal(pending.status, 202);

  const confirmed = await handleNewsletterRequest(
    request({ stage: "confirm", confirmationToken: deliveredToken }),
    {
      allowedOrigin,
      databasePath,
      rateLimit: false,
      now: () => new Date("2026-08-08T13:00:00.000Z"),
    },
  );
  assert.equal(confirmed.status, 200);

  closeNewsletterDatabases();
  const reader = new DatabaseSync(databasePath, { readOnly: true });
  const row = reader
    .prepare(
      `SELECT status, unsubscribed_at, confirmation_token_hash
       FROM newsletter_subscribers WHERE email = ?`,
    )
    .get(validPayload.email) as Record<string, string | null>;
  reader.close();

  assert.equal(row.status, "active");
  assert.equal(row.unsubscribed_at, null);
  assert.equal(row.confirmation_token_hash, null);
});

test("interrompe o consumo do corpo de descadastro assim que excede o limite", async () => {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulls += 1;
      if (pulls === 1) {
        controller.enqueue(new Uint8Array(8_193));
        return;
      }
      controller.error(new Error("corpo consumido depois do limite"));
    },
    cancel() {
      cancelled = true;
    },
  });
  const oversizedRequest = new Request(
    `${allowedOrigin}/api/newsletter-unsubscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: allowedOrigin,
      },
      body,
      duplex: "half",
    } as RequestInit & { duplex: "half" },
  );

  const response = await handleNewsletterUnsubscribeRequest(oversizedRequest, {
    allowedOrigin,
    databasePath,
    tokenSecret,
  });

  assert.equal(response.status, 413);
  assert.equal(pulls, 1);
  assert.equal(cancelled, true);
});

test("aplica rate limit independente no descadastro", async () => {
  const statuses: number[] = [];
  for (let index = 0; index < 6; index += 1) {
    const response = await handleNewsletterUnsubscribeRequest(
      new Request(`${allowedOrigin}/api/newsletter-unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: allowedOrigin,
        },
        body: JSON.stringify({ token: "invalido" }),
      }),
      {
        allowedOrigin,
        databasePath,
        tokenSecret,
        clientKey: "unsubscribe-rate-limit-test",
      },
    );
    statuses.push(response.status);
  }

  assert.deepEqual(statuses, [403, 403, 403, 403, 403, 429]);
});
