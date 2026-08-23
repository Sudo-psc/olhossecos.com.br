import test from "node:test";
import assert from "node:assert/strict";
import { glossaryTerms, getGlossaryTerm } from "./glossary.ts";

test("todos os termos do glossário têm slugs únicos e definições preenchidas", () => {
  const slugs = new Set<string>();
  for (const item of glossaryTerms) {
    assert.ok(item.slug, "Termo deve ter um slug");
    assert.ok(!slugs.has(item.slug), `Slug duplicado detectado: ${item.slug}`);
    slugs.add(item.slug);
    assert.ok(item.term.trim().length > 0, "Nome do termo não pode ser vazio");
    assert.ok(
      item.shortDefinition.trim().length > 0,
      "Definição curta não pode ser vazia",
    );
    assert.ok(
      item.definition.trim().length > 0,
      "Definição completa não pode ser vazia",
    );
  }
  assert.ok(
    glossaryTerms.length >= 30,
    "Glossário deve conter no mínimo 30 termos",
  );
});

test("getGlossaryTerm encontra termos por slug e por alias com e sem acento", () => {
  const nibut = getGlossaryTerm("nibut");
  assert.ok(nibut);
  assert.equal(nibut?.slug, "nibut");

  const meibomius = getGlossaryTerm("Glandulas de Meibomius");
  assert.ok(meibomius);
  assert.equal(meibomius?.slug, "glandulas-de-meibomius");

  const dgm = getGlossaryTerm("DGM");
  assert.ok(dgm);
  assert.equal(dgm?.slug, "dgm");

  const conjunctivochalasis = getGlossaryTerm("conjunctivochalasis");
  assert.ok(conjunctivochalasis);
  assert.equal(conjunctivochalasis?.slug, "conjuntivocalase");

  const nonExistent = getGlossaryTerm("termo-inexistente-xyz");
  assert.equal(nonExistent, undefined);
});
