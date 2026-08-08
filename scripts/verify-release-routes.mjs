import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = process.env.ROUTE_TEST_PORT ?? "44321";
const localOrigin = `http://${host}:${port}`;
const productionOrigin = "https://olhossecos.com.br";

const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
  env: {
    ...process.env,
    HOST: host,
    PORT: port,
    NODE_ENV: "production",
    NEWSLETTER_ALLOWED_ORIGIN: productionOrigin,
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
  await assertStatus("/superficie");
  await assertPage("/superficie/parceiros", "/superficie/parceiros");
  await assertPage("/newsletter", "/newsletter");

  const sitemapResponse = await assertStatus("/sitemap-0.xml");
  const sitemap = await sitemapResponse.text();
  for (const path of ["/superficie/parceiros", "/newsletter"]) {
    if (!sitemap.includes(`<loc>${productionOrigin}${path}</loc>`)) {
      throw new Error(`sitemap: ${path} ausente`);
    }
  }

  console.log("release routes: pass");
} finally {
  if (server.exitCode === null) server.kill("SIGTERM");
}
