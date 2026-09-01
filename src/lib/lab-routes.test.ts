import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { isLabIndexPath, LAB_EDICAO_00_PATH } from "./lab-routes.ts";

test("o índice do lab aponta só para a edição 00, sem vitrine", () => {
  assert.equal(LAB_EDICAO_00_PATH, "/superficie/lab/edicao-00");
  assert.equal(isLabIndexPath("/superficie/lab"), true);
  assert.equal(isLabIndexPath("/superficie/lab/"), true);
  assert.equal(isLabIndexPath("/superficie/lab/edicao-00"), false);
  assert.equal(isLabIndexPath("/superficie/lab/flipbook"), false);
  assert.equal(isLabIndexPath("/superficie"), false);
});

test("o middleware redireciona o índice do lab e não o bloqueia com 404", async () => {
  const source = await readFile("src/middleware.ts", "utf8");
  const vite = await readFile("astro.config.mjs", "utf8");
  assert.match(source, /isLabIndexPath/u);
  assert.match(source, /LAB_EDICAO_00_PATH/u);
  assert.match(source, /status:\s*302/u);
  assert.match(source, /X-Robots-Tag/u);
  assert.match(vite, /isLabIndexUrl/u);
  assert.match(vite, /\/superficie\/lab\//u);
  assert.doesNotMatch(
    source,
    /pathname === "\/superficie\/lab" \|\|[\s\S]*startsWith\("\/superficie\/lab\/"\)[\s\S]*404/u,
  );
});
