import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isSurfaceNavCurrent } from "./superficie-nav.ts";

test("rotas de artigo ativam Artigos, nunca um link de âncora", () => {
  const artigos = "/superficie/artigos";
  // Item de âncora da home. Era `#entrevistas` até esse item sair da nav;
  // a regra vale para qualquer href que só tenha hash sobre `/superficie`.
  const ancora = "/superficie#tecnologia";
  const tfos = "/superficie/artigos/tfos-dews-iii-na-pratica";

  assert.equal(isSurfaceNavCurrent(artigos, tfos), true);
  assert.equal(isSurfaceNavCurrent(artigos, "/superficie/artigos"), true);
  assert.equal(isSurfaceNavCurrent(ancora, tfos), false);
  assert.equal(isSurfaceNavCurrent(ancora, "/superficie/artigos"), false);
  assert.equal(isSurfaceNavCurrent(ancora, "/superficie"), false);
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
