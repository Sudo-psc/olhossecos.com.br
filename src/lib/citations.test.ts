import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanAuthorName,
  formatAuthorAbnt,
  formatAuthorVancouver,
  generateAbntCitation,
  generateVancouverCitation,
  generateBibtexCitation,
  generateRisCitation,
  generateAllCitations,
} from "./citations.ts";
import { publishedArticles } from "./superficie.ts";

const sampleArticle = publishedArticles[0];

test("cleanAuthorName remove Dr./Dra. corretamente", () => {
  assert.equal(
    cleanAuthorName("Dr. Philipe Saraiva Cruz"),
    "Philipe Saraiva Cruz",
  );
  assert.equal(cleanAuthorName("Dra. Maria Silva"), "Maria Silva");
  assert.equal(cleanAuthorName("Carlos Drummond"), "Carlos Drummond");
});

test("formatAuthorAbnt formata nomes no padrao ABNT", () => {
  assert.equal(
    formatAuthorAbnt("Dr. Philipe Saraiva Cruz"),
    "CRUZ, Philipe Saraiva",
  );
  assert.equal(formatAuthorAbnt("João Silva"), "SILVA, João");
  assert.equal(formatAuthorAbnt("Aristóteles"), "ARISTÓTELES");
});

test("formatAuthorVancouver formata nomes no padrao Vancouver", () => {
  assert.equal(formatAuthorVancouver("Dr. Philipe Saraiva Cruz"), "Cruz PS");
  assert.equal(formatAuthorVancouver("Maria Santos Silva"), "Silva MS");
});

test("generateAbntCitation gera citacao valida com data de acesso fixa", () => {
  const fixedAccess = new Date("2026-08-19T12:00:00Z");
  const citation = generateAbntCitation(sampleArticle, fixedAccess);
  assert.ok(citation.includes("CRUZ, Philipe Saraiva"));
  assert.ok(citation.includes("SUPERFÍCIE"));
  assert.ok(
    citation.includes(
      "Disponível em: <https://olhossecos.com.br/superficie/artigos/",
    ),
  );
  assert.ok(citation.includes("Acesso em: 19 ago. 2026"));
});

test("generateVancouverCitation gera citacao valida", () => {
  const citation = generateVancouverCitation(sampleArticle);
  assert.ok(citation.startsWith("Cruz PS."));
  assert.ok(citation.includes("SUPERFÍCIE."));
  assert.ok(
    citation.includes(
      "Available from: https://olhossecos.com.br/superficie/artigos/",
    ),
  );
});

test("generateBibtexCitation gera bloco BibTeX integro", () => {
  const bibtex = generateBibtexCitation(sampleArticle);
  assert.ok(bibtex.startsWith("@article{"));
  assert.ok(bibtex.includes("author = {Philipe Saraiva Cruz}"));
  assert.ok(
    bibtex.includes(
      "journal = {SUPERFÍCIE --- Revista de Olho Seco e Superfície Ocular}",
    ),
  );
  assert.ok(
    bibtex.includes("url = {https://olhossecos.com.br/superficie/artigos/"),
  );
});

test("citações incluem o DOI quando o frontmatter o traz", () => {
  const withDoi = {
    ...sampleArticle,
    doi: "10.5281/zenodo.9999999",
  };
  assert.match(generateAbntCitation(withDoi), /DOI: https:\/\/doi.org\/10.5281\/zenodo.9999999/u);
  assert.match(generateVancouverCitation(withDoi), /doi: 10.5281\/zenodo.9999999/u);
  assert.match(generateBibtexCitation(withDoi), /doi = \{10.5281\/zenodo.9999999\}/u);
  assert.match(generateRisCitation(withDoi), /DO  - 10.5281\/zenodo.9999999/u);
});

test("generateRisCitation emite um registro JOUR fechado", () => {
  const ris = generateRisCitation(sampleArticle);
  assert.match(ris, /^TY  - JOUR/u);
  assert.match(ris, /T1  - /u);
  assert.match(ris, /AU  - Cruz, Philipe Saraiva/u);
  assert.match(ris, /ER  - /u);
});

test("generateAllCitations devolve os 3 formatos para todos os artigos publicados", () => {
  for (const article of publishedArticles) {
    const citations = generateAllCitations(article);
    assert.ok(citations.abnt.length > 50);
    assert.ok(citations.vancouver.length > 30);
    assert.ok(citations.bibtex.length > 80);
    assert.ok(citations.ris.startsWith("TY  - JOUR"));
  }
});
