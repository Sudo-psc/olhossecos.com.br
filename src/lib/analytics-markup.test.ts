import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import {
  closeAnalyticsDatabases,
  handleAnalyticsRequest,
} from "./analytics.ts";

/**
 * Guarda contra o modo de falha mais silencioso do analytics: um
 * `data-analytics-event` que não existe em `canonicalEvents` é rejeitado com
 * 422 e descartado. A página não quebra, o console fica limpo, e a seção
 * simplesmente não mede nada.
 *
 * Foi o que aconteceu com o RADAR Científico inteiro. Em vez de reconferir a
 * allowlist na revisão, o teste percorre a marcação e submete cada nome ao
 * handler real.
 */

const allowedOrigin = "https://olhossecos.com.br";
const testDirectory = mkdtempSync(
  join(tmpdir(), "olhossecos-analytics-markup-"),
);
const databasePath = join(testDirectory, "analytics.sqlite");

after(() => {
  closeAnalyticsDatabases();
  rmSync(testDirectory, { recursive: true, force: true });
});

const collectSourceFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(path);
      // Os próprios testes carregam o atributo em regex e em fixture; incluí-los
      // faria a varredura encontrar a si mesma.
      if (entry.name.includes(".test.")) return [];
      return /\.(astro|ts|js)$/u.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
};

const eventsDeclaredInMarkup = async () => {
  const files = await collectSourceFiles("src");
  const found = new Map<string, string>();
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/data-analytics-event="([^"]+)"/gu)) {
      if (!found.has(match[1])) found.set(match[1], file);
    }
  }
  return found;
};

test("todo data-analytics-event da marcação é aceito pelo endpoint", async () => {
  const declared = await eventsDeclaredInMarkup();
  assert.ok(
    declared.size > 0,
    "nenhum data-analytics-event encontrado em src/",
  );

  const rejected: string[] = [];
  for (const [event, file] of declared) {
    const response = await handleAnalyticsRequest(
      new Request(`${allowedOrigin}/api/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: allowedOrigin },
        body: JSON.stringify({ event, page_path: "/" }),
      }),
      { allowedOrigin, databasePath, rateLimit: false },
    );
    if (response.status === 422) rejected.push(`${event} (${file})`);
  }

  assert.deepEqual(
    rejected,
    [],
    `eventos rejeitados com 422 — adicione o nome em canonicalEvents:\n${rejected.join("\n")}`,
  );
});
