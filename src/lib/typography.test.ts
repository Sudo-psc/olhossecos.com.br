import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

/**
 * O site não carrega nenhuma fonte web, e isso é decisão, não descuido: zero
 * requisição de fonte é parte de por que ele pinta rápido.
 *
 * A CSP só permite `font-src 'self'`, então uma fonte externa que alguém
 * adicionasse funcionaria no dev e falharia calada em produção — o navegador
 * bloqueia o download e cai no fallback sem avisar ninguém. O teste tranca as
 * duas portas: nenhum @font-face e nenhum host de fonte.
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

test("nenhuma fonte web é declarada ou baixada", async () => {
  const files = await collectStyleSources("src");
  const offenders: string[] = [];

  for (const path of files) {
    const source = await readFile(path, "utf8");
    if (/@font-face/u.test(source)) offenders.push(`${path}: @font-face`);
    for (const host of fontHosts) {
      if (source.includes(host)) offenders.push(`${path}: ${host}`);
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
    for (const match of source.matchAll(/font-size:\s*([\d.]+)(rem|em|px)/gu)) {
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
  // fontes de sistema, e a serifa Iowan Old Style, que degrada por conta
  // própria para Palatino e Georgia.
  const resolvable =
    /^(ui-sans-serif|ui-serif|ui-monospace|system-ui|-apple-system|sans-serif|serif|monospace|inherit|var\(|"Iowan Old Style"|Georgia)/u;

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
