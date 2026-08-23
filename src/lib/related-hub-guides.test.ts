import assert from "node:assert/strict";
import { test } from "node:test";
import { getGuide } from "./guides.ts";
import {
  relatedHubPaths,
  selectRelatedHubGuides,
} from "./related-hub-guides.ts";

test("todo hub mapeado aponta para guias existentes e distintos", () => {
  for (const path of relatedHubPaths()) {
    const related = selectRelatedHubGuides(path);
    assert.ok(
      related.length >= 2 && related.length <= 3,
      `${path} deveria oferecer 2 ou 3 guias, ofereceu ${related.length}`,
    );
    const slugs = related.map((guide) => guide.slug);
    assert.equal(new Set(slugs).size, slugs.length, `${path} repete guia`);
    for (const slug of slugs) {
      assert.ok(getGuide(slug), `${path} aponta para guia inexistente ${slug}`);
    }
  }
});

test("tratamentos leva aos guias de lubrificação, higiene e colírios", () => {
  const slugs = selectRelatedHubGuides("/tratamentos").map(
    (guide) => guide.slug,
  );
  assert.deepEqual(slugs, [
    "lubrificantes-perguntas-uteis",
    "higiene-palpebral-com-seguranca",
    "tratamento-com-colirios-diferencas-e-tipos",
  ]);
});

test("caminho desconhecido não inventa leitura", () => {
  assert.deepEqual(selectRelatedHubGuides("/newsletter"), []);
});
