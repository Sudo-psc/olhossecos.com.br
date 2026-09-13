import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  normalizeSearchText,
  getUnifiedSearchIndex,
  portalPages,
  searchUnified,
} from "./search.ts";

test("normalizeSearchText remove acentos e normaliza maiusculas/minusculas", () => {
  assert.equal(
    normalizeSearchText("Glândulas de Meibômio"),
    "glandulas de meibomio",
  );
  assert.equal(normalizeSearchText("  NIBUT e TBUT  "), "nibut e tbut");
});

test("getUnifiedSearchIndex agrega portal, guias, artigos da revista, livros e glossario", () => {
  const index = getUnifiedSearchIndex();
  assert.ok(index.length >= 40, "O indice deve conter pelo menos 40 itens");

  const types = new Set(index.map((i) => i.type));
  assert.ok(types.has("portal"), "Deve conter paginas do portal");
  assert.ok(types.has("guia"), "Deve conter guias");
  assert.ok(types.has("artigo"), "Deve conter artigos da SUPERFÍCIE");
  assert.ok(types.has("radar"), "Deve conter relatórios do RADAR");
  assert.ok(types.has("glossario"), "Deve conter termos do glossario");
  assert.ok(types.has("livro"), "Deve conter livros");
});

test("searchUnified encontra o RADAR Científico", () => {
  const results = searchUnified("radar cientifico");
  assert.ok(
    results.some((item) => item.type === "radar"),
    "Deve devolver ao menos um relatório do RADAR",
  );
});

test("searchUnified encontra termos médicos com e sem acento", () => {
  const resultsMeibomius = searchUnified("meibomius");
  assert.ok(
    resultsMeibomius.length > 0,
    "Deve encontrar resultados para meibomius",
  );
  assert.ok(
    resultsMeibomius.some(
      (r) =>
        r.title.toLowerCase().includes("meibomius") || r.type === "glossario",
    ),
  );

  const resultsTelas = searchUnified("telas e piscadas");
  assert.ok(
    resultsTelas.length > 0,
    "Deve encontrar resultados para telas e piscadas",
  );

  const resultsDgm = searchUnified("DGM");
  assert.ok(resultsDgm.length > 0, "Deve encontrar DGM");

  const empty = searchUnified("");
  assert.deepEqual(empty, []);
});

test("cada página do portal entra uma vez na busca", () => {
  const hrefs = portalPages.map((page) => page.href);
  assert.equal(hrefs.length, new Set(hrefs).size);

  const paciente = portalPages.filter((page) => page.href === "/paciente");
  assert.equal(paciente.length, 1);
  assert.equal(paciente[0]?.category, "Portal");
  assert.equal(paciente[0]?.title, "Portal do paciente");
});

test("a busca global não embute o índice no HTML de cada página", () => {
  const modal = readFileSync("src/components/GlobalSearchModal.astro", "utf8");
  const endpoint = readFileSync("src/pages/search-index.json.ts", "utf8");

  assert.doesNotMatch(modal, /getUnifiedSearchIndex/u);
  assert.doesNotMatch(modal, /id="global-search-data"/u);
  assert.match(modal, /data-search-index-url/u);
  assert.match(endpoint, /getUnifiedSearchIndex/u);
  assert.match(endpoint, /prerender = true/u);
});
