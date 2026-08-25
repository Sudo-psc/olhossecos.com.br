import assert from "node:assert/strict";
import { test } from "node:test";
import { guides, selectRelatedGuides } from "./guides.ts";

/**
 * O bloco "Continue aprendendo" era `guides.filter(outro).slice(0, 3)`: os três
 * primeiros do array, idênticos nas doze páginas. Medindo os links internos, o
 * efeito aparecia inteiro — três guias recebiam doze links cada e oito
 * recebiam só o da listagem, o que também significa que oito guias nunca eram
 * oferecidos a quem terminava uma leitura.
 */

const distribution = () => {
  const counts = new Map(guides.map((guide) => [guide.slug, 0]));
  for (const guide of guides) {
    for (const related of selectRelatedGuides(guide)) {
      counts.set(related.slug, (counts.get(related.slug) ?? 0) + 1);
    }
  }
  return counts;
};

test("nenhum guia sugere a si mesmo", () => {
  for (const guide of guides) {
    const slugs = selectRelatedGuides(guide).map((related) => related.slug);
    assert.ok(!slugs.includes(guide.slug), `${guide.slug} sugere a si mesmo`);
    assert.equal(new Set(slugs).size, slugs.length, `${guide.slug} repete`);
  }
});

test("a seleção não é a mesma lista em toda página", () => {
  const lists = new Set(
    guides.map((guide) =>
      selectRelatedGuides(guide)
        .map((related) => related.slug)
        .join("|"),
    ),
  );

  assert.ok(
    lists.size >= guides.length - 1,
    `${lists.size} listas distintas para ${guides.length} guias — a seleção está ignorando o assunto`,
  );
});

test("todo guia é oferecido a alguém", () => {
  const orphans = [...distribution()]
    .filter(([, count]) => count === 0)
    .map(([slug]) => slug);

  assert.deepEqual(
    orphans,
    [],
    `guia que ninguém sugere só recebe link da listagem:\n${orphans.join("\n")}`,
  );
});

test("os links não se concentram em poucos destinos", () => {
  const counts = [...distribution().values()];
  const most = Math.max(...counts);

  assert.ok(
    most <= Math.ceil(guides.length / 2),
    `um guia recebe ${most} dos ${guides.length * 3} links sugeridos`,
  );
});

test("guias do mesmo assunto se encontram", () => {
  // Dois pares onde a afinidade é inequívoca; se a pontuação regredir para
  // ordem de array, estes são os primeiros a quebrar.
  const pares: [string, string][] = [
    [
      "tratamento-com-colirios-diferencas-e-tipos",
      "lubrificantes-perguntas-uteis",
    ],
    ["conjuntivocalase-olho-seco-mecanico", "epifora-olho-seco-vias-lacrimais"],
    ["meibografia-o-que-a-imagem-mostra", "higiene-palpebral-com-seguranca"],
  ];

  for (const [from, to] of pares) {
    const guide = guides.find((candidate) => candidate.slug === from);
    assert.ok(guide, from);
    const slugs = selectRelatedGuides(guide).map((related) => related.slug);
    assert.ok(
      slugs.includes(to),
      `${from} deveria sugerir ${to}, sugeriu ${slugs}`,
    );
  }
});
