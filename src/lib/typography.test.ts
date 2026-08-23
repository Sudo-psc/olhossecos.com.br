import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

/**
 * O corpo do site continua na pilha do sistema. A única fonte web é a serifada
 * das manchetes, servida do próprio domínio (`/fonts/*.woff2`, subset latino).
 *
 * A CSP declara `font-src 'self'`: uma fonte de host externo funcionaria no dev
 * e falharia calada em produção — o navegador bloqueia o download e cai no
 * fallback sem avisar ninguém. O teste continua trancando essa porta e passa a
 * exigir que todo @font-face aponte para um arquivo do próprio domínio.
 */

const fontHosts = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "use.typekit.net",
  "fonts.bunny.net",
];

const collectStyleSources = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectStyleSources(path);
      if (entry.name.includes(".test.")) return [];
      return /\.(astro|css)$/u.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
};

test("toda fonte declarada é servida pelo próprio domínio", async () => {
  const files = await collectStyleSources("src");
  const offenders: string[] = [];

  for (const path of files) {
    const source = await readFile(path, "utf8");
    for (const host of fontHosts) {
      if (source.includes(host)) offenders.push(`${path}: ${host}`);
    }
    for (const [, url] of source.matchAll(
      /@font-face[^}]*?url\(\s*["']?([^"')]+)/gsu,
    )) {
      if (!url.startsWith("/")) offenders.push(`${path}: url(${url})`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `a CSP permite apenas font-src 'self' — uma fonte externa falha calada em produção:\n${offenders.join("\n")}`,
  );
});

test("nenhum texto é declarado abaixo de 12px", async () => {
  // Piso de legibilidade: havia declarações de 0.62rem, 9,9px. São rótulos
  // curtos em caixa alta, o que disfarça o tamanho, mas não o resolve — e a
  // auditoria de font-size do Lighthouse mede o mesmo número.
  const tiny: string[] = [];
  for (const path of await collectStyleSources("src")) {
    const source = await readFile(path, "utf8");
    // clamp() precisa ser lido pelo primeiro argumento: é o piso, o tamanho
    // que a viewport estreita entrega. A versão anterior só casava valores
    // literais, e três declarações passaram por baixo — a menor com piso de
    // 0.42rem, 6,7px, num rótulo do reader.
    for (const match of source.matchAll(
      /font-size:\s*(?:clamp\(\s*)?([\d.]+)(rem|em|px)/gu,
    )) {
      const value = Number(match[1]);
      const px = match[2] === "px" ? value : value * 16;
      if (px < 12) tiny.push(`${path}: ${match[0]} = ${px.toFixed(1)}px`);
    }
  }

  assert.deepEqual(
    tiny,
    [],
    `abaixo de 12px o texto deixa de ser confortável em tela pequena:\n${tiny.join("\n")}`,
  );
});

test("as pilhas de fonte começam por famílias que o sistema resolve", async () => {
  const files = await collectStyleSources("src");
  // Famílias aceitas na primeira posição: palavras-chave genéricas do CSS,
  // fontes de sistema, a serifa Iowan Old Style — que degrada por conta própria
  // para Palatino e Georgia — e a Source Serif 4, que o próprio domínio serve
  // com font-display: swap e pilha de sistema atrás.
  const resolvable =
    /^(ui-sans-serif|ui-serif|ui-monospace|system-ui|-apple-system|sans-serif|serif|monospace|inherit|var\(|"Iowan Old Style"|"Source Serif 4 Var"|Georgia)/u;

  const offenders: string[] = [];
  for (const path of files) {
    const source = await readFile(path, "utf8");
    for (const match of source.matchAll(/font-family:\s*([^;}]+)/gu)) {
      const first = match[1].replace(/\s+/gu, " ").trim();
      if (!resolvable.test(first)) offenders.push(`${path}: ${first}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `família não hospedada na frente da pilha: quem a tiver instalada vê um site, o resto vê outro\n${offenders.join("\n")}`,
  );
});
