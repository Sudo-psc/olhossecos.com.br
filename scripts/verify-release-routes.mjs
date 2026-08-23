import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeBasePath, withBasePath } from "./site-base-path.mjs";
import { dataBackedPaths, lastmodForPath } from "../src/lib/sitemap-lastmod.ts";

const host = "127.0.0.1";
const port = process.env.ROUTE_TEST_PORT ?? "44321";
const localOrigin = `http://${host}:${port}`;
const productionOrigin = "https://olhossecos.com.br";
const basePath = normalizeBasePath(process.env.SITE_BASE_PATH);
const publicOrigin = `${productionOrigin}${basePath}`;
const publicPath = (path) => withBasePath(path, basePath);
const testDirectory = mkdtempSync(join(tmpdir(), "olhossecos-routes-"));
const analyticsDatabasePath = join(testDirectory, "analytics.sqlite");

const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
  env: {
    ...process.env,
    HOST: host,
    PORT: port,
    NODE_ENV: "production",
    NEWSLETTER_ALLOWED_ORIGIN: publicOrigin,
    NEWSLETTER_TOKEN_SECRET:
      "segredo-de-teste-de-rotas-com-pelo-menos-32-caracteres",
    ANALYTICS_ALLOWED_ORIGIN: publicOrigin,
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
      const response = await fetch(`${localOrigin}${publicPath("/")}`);
      if (response.status === 200) return;
    } catch {
      // O processo ainda está iniciando.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Servidor não ficou disponível.\n${serverOutput}`);
};

const assertStatus = async (path, expectedStatus = 200) => {
  const response = await fetch(`${localOrigin}${publicPath(path)}`);
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
  const canonical = `<link rel="canonical" href="${publicOrigin}${canonicalPath === "/" ? "" : canonicalPath}">`;
  if (!html.includes(canonical)) {
    throw new Error(`${path}: canonical ausente ou incorreto`);
  }
  return html;
};

// Rotas que o servidor realmente entrega, para confrontar com o sitemap.
const rotasConhecidas = new Set();
const mapearRotas = async (directory, prefix = "") => {
  const { readdir } = await import("node:fs/promises");
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      await mapearRotas(join(directory, entry.name), `${prefix}/${entry.name}`);
    } else if (entry.name === "index.html") {
      rotasConhecidas.add(prefix || "/");
    }
  }
};

try {
  await mapearRotas("dist/client");
  await waitForServer();

  // Primeira checagem de todas: um dist gerado com SITE_BASE_PATH falha em
  // várias asserções adiante, mas com mensagens que apontam para o sintoma
  // errado ("link para /newsletter ausente") em vez da causa. Confrontar o
  // canonical da raiz com a origem de produção nomeia o problema de imediato.
  const raizHtml = await (await assertStatus("/")).text();
  const raizCanonical = raizHtml.match(
    /<link rel="canonical" href="([^"]+)">/u,
  )?.[1];
  if (raizCanonical && raizCanonical.replace(/\/$/u, "") !== productionOrigin) {
    throw new Error(
      `canonical da raiz é ${raizCanonical}, esperado ${productionOrigin}. ` +
        `Build gerado com SITE_BASE_PATH? Regere com "env -u SITE_BASE_PATH npm run build".`,
    );
  }
  const homeHtml = await (await assertStatus("/")).text();
  if (!homeHtml.includes(`href="${publicPath("/newsletter")}"`)) {
    throw new Error("homepage: link global para /newsletter ausente");
  }
  await assertStatus("/superficie");
  await assertPage("/superficie/edicoes", "/superficie/edicoes");
  await assertPage("/superficie/artigos", "/superficie/artigos");
  await assertStatus("/superficie/lab/flipbook", 404);
  await assertStatus("/superficie/lab/edicao-00", 200);
  await assertStatus("/superficie/issues/poc/manifest.json", 404);
  await assertStatus("/superficie/issues/edicao-00/manifest.json", 200);

  // Insumos dos geradores não podem voltar ao release: eram 65 MB de placas em
  // art/ mais 7,7 MB de PNGs de origem, todos públicos e sem referência. O
  // reader precisa continuar funcionando sem eles.
  for (const input of [
    "/superficie/issues/edicao-00/art/dgm.png",
    "/images/hero-tear-film.png",
    "/images/superficie/hero-interferometria.png",
    "/images/superficie/capa-edicao-00.png",
    "/images/superficie/og-superficie-source.png",
    "/images/superficie/capa-edicao-00-conteudos-v2.png",
  ]) {
    await assertStatus(input, 404);
  }

  for (const shipped of [
    "/superficie/issues/edicao-00/pages/page-01-large.webp",
    "/superficie/issues/edicao-00/superficie-edicao-00.pdf",
    "/images/hero-tear-film.jpg",
    "/images/superficie/hero-interferometria.jpg",
    "/images/superficie/capa-edicao-00.jpg",
  ]) {
    await assertStatus(shipped, 200);
  }
  await assertPage("/superficie/parceiros", "/superficie/parceiros");
  await assertPage("/newsletter", "/newsletter");
  await assertPage("/newsletter/descadastrar", "/newsletter/descadastrar");
  await assertPage("/newsletter/confirmar", "/newsletter/confirmar");

  const unsubscribeResponse = await fetch(
    `${localOrigin}${publicPath("/api/newsletter-unsubscribe")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: publicOrigin,
      },
      body: JSON.stringify({ token: "invalido" }),
    },
  );
  if (unsubscribeResponse.status !== 403) {
    throw new Error(
      `/api/newsletter-unsubscribe: esperado HTTP 403, recebido ${unsubscribeResponse.status}`,
    );
  }

  const analyticsResponse = await fetch(
    `${localOrigin}${publicPath("/api/analytics")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: publicOrigin,
      },
      body: JSON.stringify({ event: "page_view", page_path: "/newsletter" }),
    },
  );
  if (analyticsResponse.status !== 202) {
    throw new Error(
      `/api/analytics: esperado HTTP 202, recebido ${analyticsResponse.status}`,
    );
  }

  const sitemapResponse = await assertStatus("/sitemap-0.xml");
  const sitemap = await sitemapResponse.text();

  // Última rede contra um build de preview: mede o que é servido, não o que o
  // manifesto declara. Um dist gerado com SITE_BASE_PATH traz canonical e
  // <loc> sob o prefixo, e todos eles dão 404 no domínio real.
  const prefixados = [
    ...new Set(
      [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)]
        .map((match) => new URL(match[1]).pathname)
        .filter(
          (pathname) =>
            !rotasConhecidas.has(pathname.replace(/\/$/u, "") || "/"),
        ),
    ),
  ];
  if (prefixados.length > 0) {
    throw new Error(
      `sitemap aponta para caminhos que o site não serve — build com SITE_BASE_PATH?\n${prefixados.slice(0, 5).join("\n")}`,
    );
  }
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
  ]) {
    if (
      !sitemap.includes(`<loc>${publicOrigin}${path === "/" ? "" : path}</loc>`)
    ) {
      throw new Error(`sitemap: ${path} ausente`);
    }
  }

  // O lastmod é derivado dos módulos de conteúdo, mas quem serializa é o
  // plugin de sitemap. Este é o único ponto que compara as duas pontas contra
  // o XML realmente publicado — sem ele, um erro na serialização repetiria a
  // falha que anunciou quatro artigos de agosto como sendo de julho.
  const emitted = new Map(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]{10})/gu)].map(
      (match) => [
        (() => {
          const pathname = new URL(match[1]).pathname;
          const logicalPath =
            basePath &&
            (pathname === basePath || pathname.startsWith(`${basePath}/`))
              ? pathname.slice(basePath.length) || "/"
              : pathname;
          return logicalPath.replace(/\/$/u, "") || "/";
        })(),
        match[2],
      ],
    ),
  );

  const wrong = [];
  for (const path of dataBackedPaths()) {
    const expected = lastmodForPath(path);
    const actual = emitted.get(path);
    if (actual !== expected) {
      wrong.push(`${path}: esperado ${expected}, publicado ${actual ?? "—"}`);
    }
  }
  if (wrong.length > 0) {
    throw new Error(`sitemap lastmod divergente:\n${wrong.join("\n")}`);
  }

  // Título e description vêm de origens diferentes — módulo de conteúdo em
  // umas páginas, literal na própria página em outras. O teste unitário só
  // alcança as primeiras; aqui mede o que é realmente servido, em toda página
  // que o sitemap declara indexável.
  const oversized = [];
  for (const [path] of emitted) {
    const html = await (await assertStatus(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/u)?.[1] ?? "";
    const description =
      html.match(/<meta name="description" content="([^"]*)"/u)?.[1] ?? "";
    const decode = (value) =>
      value
        .replace(/&quot;/gu, '"')
        .replace(/&#39;/gu, "'")
        .replace(/&amp;/gu, "&");
    if (decode(title).length > 60) {
      oversized.push(`${path}: título com ${decode(title).length}`);
    }
    if (decode(description).length > 158) {
      oversized.push(`${path}: description com ${decode(description).length}`);
    }
    if (decode(description).length === 0) {
      oversized.push(`${path}: sem description`);
    }
  }
  if (oversized.length > 0) {
    throw new Error(`campos truncados na SERP:\n${oversized.join("\n")}`);
  }

  // MedicalWebPage arrasta `about: MedicalCondition`. Declarar privacidade ou
  // política editorial como conteúdo médico afirmava que aquelas páginas
  // tratam da doença do olho seco.
  for (const path of ["/privacidade", "/politica-editorial"]) {
    const html = await (await assertStatus(path)).text();
    if (html.includes("MedicalWebPage")) {
      throw new Error(`${path}: página institucional tipada como médica`);
    }
  }

  console.log("release routes: pass");
} finally {
  if (server.exitCode === null) server.kill("SIGTERM");
  rmSync(testDirectory, { recursive: true, force: true });
}
