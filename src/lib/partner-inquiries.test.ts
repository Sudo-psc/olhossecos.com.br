import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, test } from "node:test";
import { DatabaseSync } from "node:sqlite";

type PartnerModule = typeof import("./partner-inquiries.ts");

const testDirectory = mkdtempSync(join(tmpdir(), "superficie-partners-"));
const databasePath = join(testDirectory, "partners.sqlite");
const allowedOrigin = "https://olhossecos.com.br";

const loadModule = async () =>
  import("./partner-inquiries.ts").catch(
    () => null,
  ) as Promise<PartnerModule | null>;

const request = (body: Record<string, unknown>, origin = allowedOrigin) =>
  new Request(`${allowedOrigin}/api/superficie-parceiros`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(body),
  });

const validPayload = {
  organization: "Instituto Visão",
  name: "Contato Profissional",
  email: "parcerias@example.com",
  interest: "media-kit",
  message: "Gostaria de conhecer os formatos disponíveis.",
  website: "",
  consent: "accepted",
  utmSource: "linkedin",
  utmCampaign: "parcerias-fundadoras",
};

beforeEach(async () => {
  const module = await loadModule();
  module?.closePartnerInquiryDatabases();
  rmSync(databasePath, { force: true });
  rmSync(`${databasePath}-shm`, { force: true });
  rmSync(`${databasePath}-wal`, { force: true });
});

after(async () => {
  const module = await loadModule();
  module?.closePartnerInquiryDatabases();
  rmSync(testDirectory, { recursive: true, force: true });
});

test("registra uma solicitação de mídia kit com consentimento e atribuição", async () => {
  const module = await loadModule();
  assert.ok(module, "o módulo de solicitações de parceria precisa existir");

  const response = await module.handlePartnerInquiryRequest(
    request(validPayload),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 201);
  module.closePartnerInquiryDatabases();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const row = database
    .prepare(
      `SELECT organization, contact_name, email, interest, status,
              consent_version, utm_source, utm_campaign
       FROM partner_inquiries`,
    )
    .get() as Record<string, string>;
  database.close();

  assert.equal(row.organization, "Instituto Visão");
  assert.equal(row.contact_name, "Contato Profissional");
  assert.equal(row.email, "parcerias@example.com");
  assert.equal(row.interest, "media-kit");
  assert.equal(row.status, "new");
  assert.equal(row.consent_version, "privacy-2026-08-08");
  assert.equal(row.utm_source, "linkedin");
  assert.equal(row.utm_campaign, "parcerias-fundadoras");
});

test("recusa solicitação sem consentimento explícito", async () => {
  const module = await loadModule();
  assert.ok(module, "o módulo de solicitações de parceria precisa existir");

  const response = await module.handlePartnerInquiryRequest(
    request({ ...validPayload, consent: undefined }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 422);
  assert.equal(existsSync(databasePath), false);
});

test("descarta silenciosamente o honeypot de parceria", async () => {
  const module = await loadModule();
  assert.ok(module, "o módulo de solicitações de parceria precisa existir");

  const response = await module.handlePartnerInquiryRequest(
    request({ ...validPayload, website: "https://spam.example" }),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 202);
  assert.equal(existsSync(databasePath), false);
});

test("recusa origem cruzada na solicitação de parceria", async () => {
  const module = await loadModule();
  assert.ok(module, "o módulo de solicitações de parceria precisa existir");

  const response = await module.handlePartnerInquiryRequest(
    request(validPayload, "https://example.org"),
    { allowedOrigin, databasePath, rateLimit: false },
  );

  assert.equal(response.status, 403);
});
