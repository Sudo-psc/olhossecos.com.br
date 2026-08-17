import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isSurfaceNavCurrent } from "./superficie-nav.ts";

test("rotas de artigo ativam Artigos, nunca Entrevistas", () => {
  const artigos = "/superficie/artigos";
  const entrevistas = "/superficie#entrevistas";
  const tfos = "/superficie/artigos/tfos-dews-iii-na-pratica";

  assert.equal(isSurfaceNavCurrent(artigos, tfos), true);
  assert.equal(isSurfaceNavCurrent(artigos, "/superficie/artigos"), true);
  assert.equal(isSurfaceNavCurrent(entrevistas, tfos), false);
  assert.equal(isSurfaceNavCurrent(entrevistas, "/superficie/artigos"), false);
  assert.equal(isSurfaceNavCurrent(entrevistas, "/superficie"), false);
  assert.equal(isSurfaceNavCurrent("/superficie#tecnologia", tfos), false);
  assert.equal(isSurfaceNavCurrent("/superficie/radar", tfos), false);
});

test("cabeçalho da SUPERFÍCIE usa o helper de item corrente", async () => {
  const markup = await readFile(
    "src/components/superficie/SuperficieHeader.astro",
    "utf8",
  );
  assert.match(markup, /isSurfaceNavCurrent/u);
  assert.match(markup, /aria-current/u);
});
