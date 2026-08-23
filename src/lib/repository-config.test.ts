import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("CI valida o portal com Node 24 sem executar deploy destrutivo", () => {
  const workflow = read(".github/workflows/deploy.yml");

  assert.match(workflow, /node-version:\s*["']24["']/);
  assert.match(workflow, /run:\s*npm test/);
  assert.match(workflow, /run:\s*npm run lint/);
  assert.match(workflow, /run:\s*npm run format:check/);
  assert.match(workflow, /run:\s*npm run build/);
  assert.match(workflow, /- v2/);
  assert.match(workflow, /SITE_BASE_PATH/);
  assert.match(workflow, /github\.base_ref == 'v2'/);
  assert.match(workflow, /run:\s*npm audit --audit-level=high/);
  assert.doesNotMatch(workflow, /git reset --hard/);
  assert.doesNotMatch(workflow, /appleboy\/ssh-action/);
  assert.doesNotMatch(workflow, /quick-deploy\.sh/);
});

test("exemplo de ambiente representa os formulários persistidos do portal", () => {
  const environment = read(".env.example");

  assert.match(environment, /^PUBLIC_NEWSLETTER_ENDPOINT=\/api\/newsletter$/m);
  assert.match(
    environment,
    /^NEWSLETTER_DATABASE_PATH=\.\/var\/newsletter\.sqlite$/m,
  );
  assert.match(
    environment,
    /^NEWSLETTER_ALLOWED_ORIGIN=http:\/\/localhost:4321$/m,
  );
  assert.match(environment, /NEWSLETTER_CONFIRMATION_SENDMAIL/);
  assert.match(
    environment,
    /^PUBLIC_PARTNER_INQUIRY_ENDPOINT=\/api\/superficie-parceiros$/m,
  );
  assert.match(
    environment,
    /^PARTNER_INQUIRY_DATABASE_PATH=\.\/var\/superficie-partner-inquiries\.sqlite$/m,
  );
  assert.match(
    environment,
    /^PARTNER_INQUIRY_ALLOWED_ORIGIN=http:\/\/localhost:4321$/m,
  );
  assert.doesNotMatch(
    environment,
    /SITE_URL|SITE_NAME|SITE_DESCRIPTION|Caratinga|PUBLIC_SANITY|GOOGLE_ANALYTICS_ID/,
  );
});

test("documentacao principal descreve a stack operacional atual", () => {
  const readme = read("README.md");
  const deploy = read("docs/VPS-DEPLOY.md");

  assert.match(readme, /Astro 7/);
  assert.match(readme, /Nginx/);
  assert.match(readme, /systemd/);
  assert.match(readme, /superficie-partner-inquiries\.sqlite/);
  assert.match(deploy, /PARTNER_INQUIRY_DATABASE_PATH/);
  assert.match(deploy, /\/api\/superficie-parceiros/);
  assert.doesNotMatch(
    readme,
    /Astro\*\* como framework.*v4|Tailwind CSS|Sanity\.io/,
  );
});

test("backup do systemd usa script instalado e não o symlink do release", () => {
  const backupService = read(
    "ops/systemd/olhossecos-private-data-backup.service",
  );

  assert.match(
    backupService,
    /ExecStart=.*\/usr\/local\/libexec\/olhossecos\/backup-private-data\.mjs/u,
  );
  assert.doesNotMatch(backupService, /current\/scripts\/backup-private-data/u);
});

test("gitignore não contém marcadores residuais de edição", () => {
  const gitignore = read(".gitignore");

  assert.doesNotMatch(gitignore, /^\s*\+{7}\s+REPLACE$/m);
});
