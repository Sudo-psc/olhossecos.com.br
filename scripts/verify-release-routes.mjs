import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const host = "127.0.0.1";
const port = process.env.ROUTE_TEST_PORT ?? "44321";
const localOrigin = `http://${host}:${port}`;
const productionOrigin = "https://olhossecos.com.br";
const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-routes-"));
const analyticsDatabasePath = join(testDirectory, "analytics.sqlite");

const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
  env: {
    ...process.env,
    HOST: host,
    PORT: port,
    NODE_ENV: "production",
    NEWSLETTER_ALLOWED_ORIGIN: productionOrigin,
    NEWSLETTER_TOKEN_SECRET:
      "segredo-de-teste-de-rotas-com-pelo-menos-32-caracteres",
    ANALYTICS_ALLOWED_ORIGIN: productionOrigin,
    ANALYTICS_DATABASE_PATH: analyticsDatabasePath,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => {
    serverOutput += String(chunk);
  });
}

const waitForServer = async () => {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Servidor encerrou antes do teste.\n${serverOutput}`);
    }

    try {
      const response = await fetch(`${localOrigin}/`);
      if (response.status === 200) return;
    } catch {
      // O processo ainda está iniciando.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Servidor não ficou disponível.\n${serverOutput}`);
};

const assertStatus = async (path, expectedStatus = 200) => {
  const response = await fetch(`${localOrigin}${path}`);
  if (response.status !== expectedStatus) {
    throw new Error(
      `${path}: esperado HTTP ${expectedStatus}, recebido ${response.status}`,
    );
  }
  return response;
};

const assertPage = async (path, canonicalPath) => {
  const response = await assertStatus(path);
  const html = await response.text();
  const h1Count = html.match(/<h1(?:\s|>)/gu)?.length ?? 0;
  if (h1Count !== 1) {
    throw new Error(`${path}: esperado um H1, encontrados ${h1Count}`);
  }
  const canonical = `<link rel="canonical" href="${productionOrigin}${canonicalPath}">`;
  if (!html.includes(canonical)) {
    throw new Error(`${path}: canonical ausente ou incorreto`);
  }
  return html;
};

try {
  await waitForServer();
  const homeHtml = await (await assertStatus("/")).text();
  if (!/href="\/newsletter"/u.test(homeHtml)) {
    throw new Error("homepage: link global para /newsletter ausente");
  }
  const superficieHtml = await assertPage("/superficie", "/superficie");
  if (!superficieHtml.includes("Revista de Olho Seco e Superfície Ocular")) {
    throw new Error("superficie: H1 sem o nome editorial completo");
  }
  if (
    !superficieHtml.includes('"name":"Olhos Secos"') ||
    !superficieHtml.includes("CRM-MG 69.870")
  ) {
    throw new Error("superficie: Organization/Physician canônicos ausentes");
  }
  await assertPage("/superficie/edicoes", "/superficie/edicoes");
  await assertPage("/superficie/artigos", "/superficie/artigos");
  await assertStatus("/superficie/lab/flipbook", 404);
  await assertStatus("/superficie/lab/edicao-00", 404);
  await assertStatus("/superficie/issues/poc/manifest.json", 404);
  await assertStatus("/superficie/issues/edicao-00/manifest.json", 404);
  await assertPage("/superficie/parceiros", "/superficie/parceiros");
  await assertPage("/newsletter", "/newsletter");
  await assertPage("/newsletter/descadastrar", "/newsletter/descadastrar");
  await assertPage("/newsletter/confirmar", "/newsletter/confirmar");

  const unsubscribeResponse = await fetch(
    `${localOrigin}/api/newsletter-unsubscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: productionOrigin,
      },
      body: JSON.stringify({ token: "invalido" }),
    },
  );
  if (unsubscribeResponse.status !== 403) {
    throw new Error(
      `/api/newsletter-unsubscribe: esperado HTTP 403, recebido ${unsubscribeResponse.status}`,
    );
  }

  const analyticsResponse = await fetch(`${localOrigin}/api/analytics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: productionOrigin,
    },
    body: JSON.stringify({ event: "page_view", page_path: "/newsletter" }),
  });
  if (analyticsResponse.status !== 202) {
    throw new Error(
      `/api/analytics: esperado HTTP 202, recebido ${analyticsResponse.status}`,
    );
  }

  const sitemapResponse = await assertStatus("/sitemap-0.xml");
  const sitemap = await sitemapResponse.text();
  const homeCanonical = homeHtml.match(
    /<link rel="canonical" href="([^"]+)">/u,
  )?.[1];
  const sitemapRoot = sitemap.match(/<url><loc>([^<]+)<\/loc>/u)?.[1];
  if (!homeCanonical || homeCanonical !== sitemapRoot) {
    throw new Error(
      `raiz canônica inconsistente: HTML=${homeCanonical} sitemap=${sitemapRoot}`,
    );
  }
  for (const path of [
    "/superficie/parceiros",
    "/superficie/edicoes",
    "/superficie/artigos",
    "/newsletter",
    "/superficie/artigos/irpl-versus-ipl-na-dgm",
  ]) {
    if (!sitemap.includes(`<loc>${productionOrigin}${path}</loc>`)) {
      throw new Error(`sitemap: ${path} ausente`);
    }
  }
  if (sitemap.includes("/newsletter/confirmar")) {
    throw new Error("sitemap: /newsletter/confirmar não deveria ser indexada");
  }
  if (
    !sitemap.includes(
      `<loc>${productionOrigin}/superficie/artigos/irpl-versus-ipl-na-dgm</loc><lastmod>2026-08-17`,
    )
  ) {
    throw new Error("sitemap: lastmod do artigo IRPL deveria ser 2026-08-17");
  }

  const notFoundHtml = await assertStatus("/pagina-inexistente-seo", 404).then(
    (response) => response.text(),
  );
  if (!notFoundHtml.includes("Esta página não existe ou mudou de endereço")) {
    throw new Error("404: meta description ausente");
  }
  if (!homeHtml.includes("width=device-width, initial-scale=1")) {
    throw new Error("homepage: viewport sem initial-scale");
  }

  const pilarHtml = await assertPage("/olho-seco", "/olho-seco");
  if (!pilarHtml.includes('"@type":"FAQPage"')) {
    throw new Error("olho-seco: FAQPage ausente");
  }
  if (!pilarHtml.includes("CRM-MG 69.870")) {
    throw new Error("olho-seco: credencial médica ausente no JSON-LD");
  }

  console.log("release routes: pass");
} finally {
  if (server.exitCode === null) server.kill("SIGTERM");
  rmSync(testDirectory, { recursive: true, force: true });
}
