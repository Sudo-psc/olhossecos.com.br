import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { formatLongDate } from "./dates.ts";
import { founderIssue } from "./superficie.ts";

/**
 * Congruência entre o que páginas diferentes dizem do mesmo dado.
 *
 * A edição fundadora aparecia como "Nº 0" em três páginas da revista e como
 * "nº 00" na home, porque só a home lia founderIssue.number e as outras
 * traziam o número escrito à mão. E a ficha da matéria na home imprimia
 * publishedAt cru — "2026-08-15" — enquanto a página do mesmo artigo mostrava
 * "15 de agosto de 2026".
 *
 * Nenhuma das duas quebra build, teste ou layout. Só aparecem para quem lê
 * duas páginas seguidas.
 */

const collectPages = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectPages(path);
      return entry.name.endsWith(".astro") ? [path] : [];
    }),
  );
  return files.flat();
};

test("o número da edição nunca é escrito à mão", async () => {
  const offenders: string[] = [];
  for (const path of await collectPages("src/pages")) {
    const source = await readFile(path, "utf8");
    for (const match of source.matchAll(/[Nn]º\s*(\d+)/gu)) {
      offenders.push(`${path}: "${match[0]}" — use founderIssue.number`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `número fixo diverge do dado assim que a edição mudar:\n${offenders.join("\n")}`,
  );
});

test("a edição fundadora é a de número 00", () => {
  assert.equal(founderIssue.number, "00");
});

test("data do acervo nunca chega ao leitor em formato ISO", async () => {
  const offenders: string[] = [];
  for (const path of await collectPages("src/pages")) {
    const source = await readFile(path, "utf8");
    // Interpolação de um campo de data direto na marcação, sem formatador.
    for (const match of source.matchAll(
      /<dd>\{\s*[\w.]*(publishedAt|modifiedAt|datePublished|dateModified)[^}]*\}<\/dd>/gu,
    )) {
      offenders.push(`${path}: ${match[0]}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `use formatLongDate dentro de <time datetime>:\n${offenders.join("\n")}`,
  );
});

test("o formatador entrega o dia civil, não o dia do fuso local", () => {
  // Sem timeZone UTC, um offset negativo cairia para o dia anterior.
  assert.equal(formatLongDate("2026-08-15"), "15 de agosto de 2026");
  assert.equal(formatLongDate("2026-01-01"), "01 de janeiro de 2026");
  assert.equal(formatLongDate(undefined), undefined);
});
