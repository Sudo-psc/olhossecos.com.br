import assert from "node:assert/strict";
import { test } from "node:test";
import { guides } from "./guides.ts";
import { dataBackedPaths, lastmodForPath } from "./sitemap-lastmod.ts";
import { getRadarReportPath, radarReports } from "./radar.ts";
import { getMagazineArticlePath, publishedArticles } from "./superficie.ts";

/**
 * Quatro artigos da SUPERFÍCIE saíram no sitemap com lastmod de 25/07 tendo
 * sido publicados em 17/08 — a escada de datas manual não foi atualizada e
 * nada reclamou. Estes testes fecham as duas frestas: a data precisa vir do
 * registro do conteúdo, e nunca pode ser anterior à publicação.
 */

test("o lastmod de cada guia vem do registro do guia", () => {
  for (const guide of guides) {
    assert.equal(
      lastmodForPath(`/guias/${guide.slug}`),
      guide.dateModified ?? guide.datePublished,
      `/guias/${guide.slug} não herdou a data do registro`,
    );
  }
});

test("o lastmod de cada artigo vem do registro do artigo", () => {
  for (const article of publishedArticles) {
    assert.equal(
      lastmodForPath(getMagazineArticlePath(article)),
      article.modifiedAt ?? article.publishedAt,
      `${article.slug} não herdou a data do registro`,
    );
  }
});

test("o lastmod de cada relatório do RADAR vem do registro", () => {
  for (const report of radarReports) {
    assert.equal(
      lastmodForPath(getRadarReportPath(report)),
      report.publishedAt,
    );
  }
});

test("nenhum lastmod é anterior à publicação do conteúdo", () => {
  const backwards: string[] = [];

  for (const guide of guides) {
    const path = `/guias/${guide.slug}`;
    if (guide.datePublished && lastmodForPath(path) < guide.datePublished) {
      backwards.push(
        `${path}: ${lastmodForPath(path)} < ${guide.datePublished}`,
      );
    }
  }

  for (const article of publishedArticles) {
    const path = getMagazineArticlePath(article);
    if (article.publishedAt && lastmodForPath(path) < article.publishedAt) {
      backwards.push(
        `${path}: ${lastmodForPath(path)} < ${article.publishedAt}`,
      );
    }
  }

  assert.deepEqual(
    backwards,
    [],
    `lastmod anterior à publicação anuncia conteúdo novo como velho:\n${backwards.join("\n")}`,
  );
});

test("todo conteúdo publicado tem data no próprio registro", () => {
  const missing = [
    ...guides
      .filter((guide) => !guide.datePublished || !guide.dateModified)
      .map((guide) => `/guias/${guide.slug}`),
    ...publishedArticles
      .filter((article) => !article.publishedAt)
      .map((article) => getMagazineArticlePath(article)),
  ];

  assert.deepEqual(
    missing,
    [],
    `sem data no registro, o sitemap cai no piso de lançamento:\n${missing.join("\n")}`,
  );
});

test("a data em prosa dos guias concorda com a data ISO", () => {
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const drifted: string[] = [];
  for (const guide of guides) {
    const match = /^(\d{1,2}) de (\p{L}+) de (\d{4})$/u.exec(guide.updated);
    if (!match) {
      drifted.push(`${guide.slug}: "${guide.updated}" fora do formato`);
      continue;
    }
    const [, day, month, year] = match;
    const iso = `${year}-${String(months.indexOf(month) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
    if (iso !== guide.dateModified) {
      drifted.push(`${guide.slug}: prosa=${iso} iso=${guide.dateModified}`);
    }
  }

  assert.deepEqual(
    drifted,
    [],
    `a data que o leitor vê e a que o buscador lê divergiram:\n${drifted.join("\n")}`,
  );
});

test("o lastmod das páginas-pilar acompanha a revisão declarada na página", () => {
  assert.equal(lastmodForPath("/olho-seco"), "2026-08-21");
  assert.equal(lastmodForPath("/profissionais"), "2026-08-21");
  assert.equal(lastmodForPath("/superficie/radar"), "2026-08-22");
  assert.equal(lastmodForPath("/ferramentas"), "2026-08-25");
  assert.equal(lastmodForPath("/paciente"), "2026-08-25");
});

test("o sitemap cobre todo caminho com dado por trás", () => {
  const paths = dataBackedPaths();
  assert.equal(
    paths.length,
    guides.length + publishedArticles.length + radarReports.length,
  );
});
