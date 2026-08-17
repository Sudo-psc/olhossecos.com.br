import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as superficie from "./superficie.ts";
import type { MagazineArticle } from "./superficie.ts";

const read = (filePath: string) => readFileSync(filePath, "utf8");
const repoRoot = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../..",
);

const article = (overrides: Partial<MagazineArticle> = {}): MagazineArticle =>
  ({
    slug: "artigo-base",
    title: "Artigo base",
    excerpt: "Resumo editorial.",
    content: [
      {
        id: "por-que-importa",
        title: "Por que isso importa?",
        kind: "why-it-matters",
        paragraphs: ["texto ".repeat(260)],
      },
      {
        id: "evidencia",
        title: "Qual é a evidência?",
        kind: "evidence",
        paragraphs: ["Evidência contextualizada."],
      },
      {
        id: "aplicacao",
        title: "Como muda a prática?",
        kind: "practice",
        paragraphs: ["Aplicação contextualizada."],
      },
      {
        id: "limitacoes",
        title: "Quais são as limitações?",
        kind: "limitations",
        paragraphs: ["Limitações declaradas."],
      },
    ],
    category: "Clínica",
    author: { name: "Autoria confirmada" },
    reviewSeal: "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
    status: "published",
    publishedAt: "2026-08-07",
    references: [{ label: "Referência primária", url: "https://example.org" }],
    disclosures: [
      { label: "Financiamento", text: "Sem financiamento externo." },
      { label: "Conflitos de interesse", text: "Nenhum conflito declarado." },
    ],
    sponsored: false,
    tags: ["DGM", "meibografia"],
    seo: {
      title: "Artigo base | SUPERFÍCIE",
      description: "Descrição do artigo base.",
      canonical: "/superficie/artigos/artigo-base",
    },
    ...overrides,
  }) as MagazineArticle;

const api = superficie as unknown as Record<string, unknown>;

test("calcula tempo de leitura a partir do conteúdo estruturado", () => {
  const calculateArticleReadingTime =
    typeof api.calculateArticleReadingTime === "function"
      ? (api.calculateArticleReadingTime as (value: MagazineArticle) => number)
      : () => 0;

  assert.equal(calculateArticleReadingTime(article()), 2);
});

test("seleciona relacionados por tags e categoria, nunca aleatoriamente", () => {
  const selectRelatedArticles =
    typeof api.selectRelatedArticles === "function"
      ? (api.selectRelatedArticles as (
          current: MagazineArticle,
          candidates: MagazineArticle[],
          limit?: number,
        ) => MagazineArticle[])
      : () => [];

  const current = article();
  const candidates = [
    article({
      slug: "mesma-categoria",
      title: "Mesma categoria",
      tags: ["NIBUT"],
      seo: {
        title: "Mesma categoria | SUPERFÍCIE",
        description: "Descrição.",
        canonical: "/superficie/artigos/mesma-categoria",
      },
    }),
    article({
      slug: "duas-tags",
      title: "Duas tags em comum",
      category: "Tecnologia",
      tags: ["DGM", "meibografia"],
      seo: {
        title: "Duas tags | SUPERFÍCIE",
        description: "Descrição.",
        canonical: "/superficie/artigos/duas-tags",
      },
    }),
    article({
      slug: "uma-tag",
      title: "Uma tag em comum",
      category: "Diagnóstico",
      tags: ["DGM"],
      seo: {
        title: "Uma tag | SUPERFÍCIE",
        description: "Descrição.",
        canonical: "/superficie/artigos/uma-tag",
      },
    }),
    article({
      slug: "rascunho",
      status: "draft",
      tags: ["DGM", "meibografia"],
      seo: {
        title: "Rascunho | SUPERFÍCIE",
        description: "Descrição.",
        canonical: "/superficie/artigos/rascunho",
      },
    }),
  ];

  assert.deepEqual(
    selectRelatedArticles(current, candidates, 3).map(({ slug }) => slug),
    ["duas-tags", "uma-tag", "mesma-categoria"],
  );
});

test("validação impede publicar artigo sem disclosure, data ou referência", () => {
  const validateMagazineArticle =
    typeof api.validateMagazineArticle === "function"
      ? (api.validateMagazineArticle as (value: MagazineArticle) => string[])
      : () => [];

  const errors = validateMagazineArticle(
    article({ disclosures: [], publishedAt: undefined, references: [] }),
  );

  assert.deepEqual(errors, [
    "Artigos publicados exigem data de publicação.",
    "Artigos publicados exigem ao menos uma referência.",
    "Declarações obrigatórias ausentes: Financiamento, Conflitos de interesse.",
  ]);
});

test("selo que afirma revisão exige revisor nomeado", () => {
  const validateMagazineArticle =
    typeof api.validateMagazineArticle === "function"
      ? (api.validateMagazineArticle as (value: MagazineArticle) => string[])
      : () => [];

  // Sem esta trava o rótulo declara ao leitor um processo que não ocorreu.
  assert.deepEqual(
    validateMagazineArticle(
      article({ reviewSeal: "REVISÃO CIENTÍFICA EDITORIAL" }),
    ),
    [
      'O selo "REVISÃO CIENTÍFICA EDITORIAL" exige revisor nomeado. Sem revisor, use "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES".',
    ],
  );

  assert.deepEqual(
    validateMagazineArticle(
      article({
        reviewSeal: "REVISÃO CIENTÍFICA EDITORIAL",
        reviewer: { name: "Revisora nomeada" },
      }),
    ),
    [],
  );
});

test("validação exige identificação explícita do patrocinador", () => {
  const validateMagazineArticle =
    typeof api.validateMagazineArticle === "function"
      ? (api.validateMagazineArticle as (value: MagazineArticle) => string[])
      : () => [];

  assert.deepEqual(validateMagazineArticle(article({ sponsored: true })), [
    "Conteúdo patrocinado exige patrocinador e rótulo explícito.",
  ]);
});

test("validação exige as quatro perguntas editoriais em artigos publicados", () => {
  const validateMagazineArticle =
    typeof api.validateMagazineArticle === "function"
      ? (api.validateMagazineArticle as (value: MagazineArticle) => string[])
      : () => [];
  const withoutLimitations = article({
    content: article().content.filter(({ kind }) => kind !== "limitations"),
  });

  assert.deepEqual(validateMagazineArticle(withoutLimitations), [
    "Artigos publicados exigem as seções: por que importa, evidência, aplicação prática e limitações.",
  ]);
});

test("Tecnologia em foco liga os seis temas do hub a artigos já publicados", () => {
  assert.deepEqual(
    superficie.technologyTopics.map(({ label, href }) => [label, href]),
    [
      ["Meibografia", "/superficie/artigos/alem-do-meiboscore"],
      ["Interferometria", "/superficie/artigos/cinco-testes-cinco-perguntas"],
      ["Osmolaridade", "/superficie/artigos/cinco-testes-cinco-perguntas"],
      ["Biomarcadores", "/superficie/artigos/cinco-testes-cinco-perguntas"],
      [
        "Tecnologias baseadas em energia",
        "/superficie/artigos/tres-meses-nao-sao-doze",
      ],
      [
        "Inteligência artificial",
        "/superficie/artigos/ia-na-superficie-ocular",
      ],
    ],
  );
});

test("descrição estável da revista não muda por página", () => {
  assert.equal(
    superficie.magazineDescription,
    "SUPERFÍCIE é uma revista dedicada a olho seco, córnea, diagnóstico, tecnologia, terapias e inovação em superfície ocular.",
  );
  assert.deepEqual(
    superficie.publishedIssues.map(({ slug }) => slug),
    ["edicao-00"],
  );
});

test("template de artigo da revista não injeta capa nem fundo no layout", () => {
  const template = read("src/components/superficie/MagazineArticlePage.astro");
  const route = read("src/pages/superficie/artigos/[slug].astro");

  assert.match(route, /MagazineArticlePage/);
  assert.match(template, /<h1>\{article\.title\}<\/h1>/);
  assert.match(template, /article\.excerpt/);
  assert.match(template, /class="article-facts"/);
  assert.doesNotMatch(template, /article\.featuredImage/);
  assert.doesNotMatch(template, /article\.heroBackground/);
  assert.doesNotMatch(template, /class="featured-image"/);
  assert.doesNotMatch(template, /class="hero-image"/);
  assert.doesNotMatch(route, /class="featured-image"/);
  assert.doesNotMatch(route, /class="hero-image"/);
});

test("matéria DGM publica capa, fundo e OG próprios", () => {
  const [article] = superficie.publishedArticles;
  assert.equal(article.slug, "biologia-molecular-da-dgm");
  assert.ok(
    article.featuredImage?.src.includes("biologia-molecular-da-dgm/cover.jpg"),
  );
  assert.ok(
    article.heroBackground?.src.includes("biologia-molecular-da-dgm/bg.jpg"),
  );
  assert.ok(article.ogImage?.src.includes("biologia-molecular-da-dgm/og.jpg"));
  assert.equal(article.ogImage?.width, 1200);
  assert.equal(article.ogImage?.height, 630);
});

test("matéria TFOS DEWS III publica as quatro seções e o selo de checagem editorial", () => {
  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "tfos-dews-iii-na-pratica",
  );

  assert.ok(
    article,
    "slug tfos-dews-iii-na-pratica deve estar em publishedArticles",
  );
  assert.equal(
    superficie.publishedArticles[0].slug,
    "biologia-molecular-da-dgm",
  );
  assert.equal(article.status, "published");
  assert.equal(
    article.reviewSeal,
    "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  );
  assert.equal(article.reviewer, undefined);
  assert.deepEqual(superficie.founderIssue.articles, []);

  const kinds = new Set(article.content.map(({ kind }) => kind));
  for (const kind of [
    "why-it-matters",
    "evidence",
    "practice",
    "limitations",
  ] as const) {
    assert.ok(kinds.has(kind), `falta a seção ${kind}`);
  }

  assert.deepEqual(superficie.validateMagazineArticle(article), []);
});

test("matéria TFOS DEWS III cita os DOIs adicionais da prova resolvidos no Crossref", () => {
  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "tfos-dews-iii-na-pratica",
  );
  assert.ok(article);
  const dois = new Set(
    article.references.map(({ doi }) => doi).filter(Boolean),
  );

  for (const doi of [
    "10.1016/j.jtos.2017.05.006",
    "10.1097/opx.0000000000002184",
    "10.1016/j.clinsp.2025.100578",
    "10.1038/s41598-018-20273-9",
    "10.5935/0004-2749.202200100",
    "10.1016/j.jtos.2023.04.004",
    "10.1016/j.jtos.2023.04.007",
    "10.1016/j.jtos.2023.08.009",
  ]) {
    assert.ok(dois.has(doi), `falta o DOI ${doi}`);
  }

  const prigol = article.references.find(
    ({ doi }) => doi === "10.1590/s0004-27492012000100005",
  );
  assert.ok(prigol?.label.includes("língua portuguesa"));
  assert.ok(!prigol?.label.includes("Translation and validation"));

  const marculino = article.references.find(
    ({ doi }) => doi === "10.5935/0004-2749.202200100",
  );
  assert.ok(marculino?.label.includes("2022;85(6):549-557"));

  const craigLifestyle = article.references.find(
    ({ doi }) => doi === "10.1016/j.jtos.2023.08.009",
  );
  assert.ok(
    craigLifestyle?.label.includes(
      "A Lifestyle Epidemic — Ocular Surface Disease",
    ),
  );
});

test("matéria TFOS DEWS III inclui o mapa dos nove drivers só no corpo", () => {
  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "tfos-dews-iii-na-pratica",
  );
  assert.ok(article);

  const section = article.content.find(({ id }) => id === "nove-drivers");
  assert.ok(section?.figure);
  assert.equal(
    section.figure.src,
    "/images/superficie/artigos/tfos-dews-iii-na-pratica/mapa-nove-drivers.png",
  );
  assert.equal(
    section.figure.caption,
    "O mapa dos nove drivers. Três territórios etiológicos — TFOS DEWS III.",
  );
  assert.equal(
    section.figure.alt,
    "Mapa dos nove drivers da TFOS DEWS III: filme lacrimal (lipídico, aquoso, mucina/glicocálix), pálpebras (piscar e fechamento, margem palpebral) e superfície ocular (anatomia, disfunção neural, dano celular, inflamação).",
  );
  assert.ok(
    existsSync(
      path.join(repoRoot, "public", section.figure.src.replace(/^\//, "")),
    ),
    "o PNG do mapa dos nove drivers precisa estar versionado com o artigo",
  );

  const otherFigures = article.content.filter(
    ({ id, figure }) => id !== "nove-drivers" && figure,
  );
  assert.deepEqual(otherFigures, []);

  for (const other of superficie.publishedArticles.filter(
    ({ slug }) => slug !== "tfos-dews-iii-na-pratica",
  )) {
    assert.ok(
      other.content.every(({ figure }) => !figure),
      `${other.slug} não deve receber a figura do TFOS`,
    );
  }
});

test("matéria de fenotipagem integrada publica as quatro seções sem capa nem figura clínica", () => {
  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "quando-sintomas-e-sinais-nao-batem",
  );

  assert.ok(
    article,
    "slug quando-sintomas-e-sinais-nao-batem deve estar em publishedArticles",
  );
  assert.deepEqual(
    superficie.publishedArticles.map(({ slug }) => slug),
    [
      "biologia-molecular-da-dgm",
      "tfos-dews-iii-na-pratica",
      "quando-sintomas-e-sinais-nao-batem",
      "tres-meses-nao-sao-doze",
      "alem-do-meiboscore",
      "cinco-testes-cinco-perguntas",
      "a-prega-o-atrito-e-o-piscar",
      "ia-na-superficie-ocular",
    ],
  );
  assert.equal(article.status, "published");
  assert.equal(article.category, "Diagnóstico");
  assert.equal(
    article.reviewSeal,
    "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  );
  assert.equal(article.reviewer, undefined);
  assert.equal(article.featuredImage, undefined);
  assert.equal(article.heroBackground, undefined);
  assert.equal(article.ogImage, undefined);
  assert.equal(
    article.seo.canonical,
    "/superficie/artigos/quando-sintomas-e-sinais-nao-batem",
  );
  assert.deepEqual(superficie.founderIssue.articles, []);

  const byId = Object.fromEntries(
    article.content.map((section) => [section.id, section]),
  );
  assert.equal(byId["por-que-importa"]?.kind, "why-it-matters");
  assert.equal(byId.evidencia?.kind, "evidence");
  assert.equal(byId.pratica?.kind, "practice");
  assert.equal(byId.limitacoes?.kind, "limitations");
  assert.equal(byId.pratica?.bullets?.length, 8);
  assert.deepEqual(superficie.validateMagazineArticle(article), []);

  const text = [
    ...article.content.flatMap((section) => section.paragraphs),
    ...(byId.pratica?.bullets ?? []),
  ].join(" ");
  assert.match(text, /soma bruta dos 6 itens \(escala 0–24\)/);
  assert.match(text, /não no índice 0–100 do OSDI-12/);
  assert.match(
    text,
    /Mais sintomas que sinais associou-se a pior saúde percebida/,
  );
  assert.match(
    text,
    /Não há ensaio randomizado que teste fenotipagem integrada contra escalada por gravidade/,
  );
  assert.equal(article.references.length, 14);
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1016/j.ajo.2026.04.007"),
    false,
  );
  assert.match(
    text,
    /Mejía-Salgado e colaboradores, 2026\) não foi confirmado no PubMed/,
  );
  assert.equal(
    article.references.some(({ label }) => /Mej[ií]a-Salgado/u.test(label)),
    false,
  );
});

test("matéria de tecnologias publica as quatro seções sem capa nem figura clínica", () => {
  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "tres-meses-nao-sao-doze",
  );

  assert.ok(
    article,
    "slug tres-meses-nao-sao-doze deve estar em publishedArticles",
  );
  assert.deepEqual(
    superficie.publishedArticles.map(({ slug }) => slug),
    [
      "biologia-molecular-da-dgm",
      "tfos-dews-iii-na-pratica",
      "quando-sintomas-e-sinais-nao-batem",
      "tres-meses-nao-sao-doze",
      "alem-do-meiboscore",
      "cinco-testes-cinco-perguntas",
      "a-prega-o-atrito-e-o-piscar",
      "ia-na-superficie-ocular",
    ],
  );
  assert.equal(article.status, "published");
  assert.equal(article.category, "Tecnologia");
  assert.equal(
    article.reviewSeal,
    "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  );
  assert.equal(article.reviewer, undefined);
  assert.equal(article.featuredImage, undefined);
  assert.equal(article.heroBackground, undefined);
  assert.equal(article.ogImage, undefined);
  assert.equal(article.publishedAt, "2026-08-15");
  assert.equal(article.modifiedAt, "2026-08-17");
  assert.equal(
    article.seo.canonical,
    "/superficie/artigos/tres-meses-nao-sao-doze",
  );
  assert.match(
    article.excerpt,
    /P-score não é ranking de compra/,
  );
  assert.equal(
    article.excerpt.includes("O consultório está sendo vendido um ranking de aparelhos"),
    false,
  );
  assert.deepEqual(superficie.founderIssue.articles, []);

  const byId = Object.fromEntries(
    article.content.map((section) => [section.id, section]),
  );
  assert.equal(byId["por-que-importa"]?.kind, "why-it-matters");
  assert.equal(byId.metodo?.kind, "body");
  assert.equal(byId.evidencia?.kind, "evidence");
  assert.equal(byId.pratica?.kind, "practice");
  assert.equal(byId.limitacoes?.kind, "limitations");
  assert.equal(article.content.length, 5);
  assert.equal(byId.pratica?.bullets?.length, 6);
  assert.match(
    byId.metodo?.callout ?? "",
    /^P-score não é ranking de compra\./,
  );
  assert.deepEqual(superficie.validateMagazineArticle(article), []);

  const text = [
    ...article.content.flatMap((section) => section.paragraphs),
    ...(byId.metodo?.callout ? [byId.metodo.callout] : []),
    ...(byId.pratica?.bullets ?? []),
  ].join(" ");

  assert.match(text, /47 ensaios randomizados, 3\.581 participantes/);
  assert.match(text, /2 a 4 meses/);
  assert.match(text, /P-score não é ranking de compra/);
  assert.match(text, /Três meses não são doze/);
  assert.match(text, /Antes de comprar um aparelho, faça seis perguntas|estas seis perguntas/);
  assert.match(text, /Qual foi o horizonte do estudo/);
  assert.match(text, /mediana até o retratamento ficou em torno de oito meses/);
  assert.match(text, /aproximadamente 16 pontos no OSDI/);
  assert.match(text, /cerca de 7 pontos no OSDI/);
  assert.match(text, /E-Eye\/IRPL com plataformas como M22\/Lumenis ou Toyos/);
  assert.match(text, /Xue e colaboradores \(2020\)/);
  assert.match(text, /Wu e colaboradores \(2020\)/);
  assert.match(text, /Jiang e colaboradores \(2022\)/);
  assert.match(text, /Cong e colaboradores \(2025\)/);
  assert.match(text, /E>eye com expressão lidera TBUT/);
  assert.equal(text.includes("Park et al"), false);
  assert.match(text, /atualização científica foi realizada em 17\/08\/2026/);
  assert.equal(article.references.length, 12);
  assert.equal(
    article.references.every(
      ({ url, doi }) => url === `https://doi.org/${doi}`,
    ),
    true,
  );
  assert.equal(
    article.references.some(
      ({ doi }) => doi === "10.1002/14651858.CD015448.pub2",
    ),
    true,
  );
  assert.equal(
    article.references.some(({ label }) => /Holland|OLYMPIA|Park et al/u.test(label)),
    false,
  );
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1016/j.jtos.2020.01.003"),
    true,
  );
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1007/s10792-020-01337-0"),
    true,
  );
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1007/s40123-022-00556-1"),
    true,
  );
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1007/s10103-025-04545-1"),
    true,
  );
});
const assertSealedArticle = (
  slug: string,
  expected: {
    category: string;
    references: number;
    practiceBullets: number;
    locks: RegExp[];
    forbiddenDois?: string[];
    forbiddenLabels?: RegExp[];
  },
) => {
  const article = superficie.publishedArticles.find(
    ({ slug: value }) => value === slug,
  );

  assert.ok(article, `slug ${slug} deve estar em publishedArticles`);
  assert.equal(
    superficie.publishedArticles[0].slug,
    "biologia-molecular-da-dgm",
  );
  assert.equal(article.status, "published");
  assert.equal(article.category, expected.category);
  assert.equal(
    article.reviewSeal,
    "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  );
  assert.equal(article.reviewer, undefined);
  assert.equal(article.featuredImage, undefined);
  assert.equal(article.heroBackground, undefined);
  assert.equal(article.ogImage, undefined);
  assert.equal(article.sponsored, false);
  assert.equal(article.issue, "edicao-00");
  assert.equal(article.publishedAt, "2026-08-15");
  assert.equal(article.modifiedAt, "2026-08-15");
  assert.equal(article.seo.canonical, `/superficie/artigos/${slug}`);
  assert.deepEqual(superficie.founderIssue.articles, []);

  const byId = Object.fromEntries(
    article.content.map((section) => [section.id, section]),
  );
  assert.equal(byId["por-que-importa"]?.kind, "why-it-matters");
  assert.equal(byId.evidencia?.kind, "evidence");
  assert.equal(byId.pratica?.kind, "practice");
  assert.equal(byId.limitacoes?.kind, "limitations");
  assert.equal(byId.pratica?.bullets?.length, expected.practiceBullets);
  assert.deepEqual(superficie.validateMagazineArticle(article), []);

  const text = [
    ...article.content.flatMap((section) => [
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
  ].join(" ");
  for (const lock of expected.locks) {
    assert.match(text, lock);
  }

  assert.equal(article.references.length, expected.references);
  for (const doi of expected.forbiddenDois ?? []) {
    assert.equal(
      article.references.some((reference) => reference.doi === doi),
      false,
    );
  }
  for (const label of expected.forbiddenLabels ?? []) {
    assert.equal(
      article.references.some((reference) => label.test(reference.label)),
      false,
    );
  }
};

test("matéria Além do meiboscore publica as quatro seções e as travas do rascunho selado", () => {
  assertSealedArticle("alem-do-meiboscore", {
    category: "Diagnóstico",
    references: 15,
    practiceBullets: 6,
    locks: [
      /O meiboscore virou atalho de consultório/,
      /soma bruta dos 6 itens, escala 0–24/,
      /não o índice 0–100 do OSDI-12/,
      /Arita 0–3 com Pult 0–4/,
      /C-stat em torno de 0,63/,
      /n = 15/,
      /corpo do workshop não foi recuperado/,
      /R = 0,428/,
    ],
  });
});

test("matéria Cinco testes, cinco perguntas publica as quatro seções e as travas do rascunho selado", () => {
  assertSealedArticle("cinco-testes-cinco-perguntas", {
    category: "Diagnóstico",
    references: 14,
    practiceBullets: 5,
    locks: [
      /O consultório ainda trata tempo de ruptura/,
      /soma bruta dos 6 itens \(escala 0–24\)/,
      /Interferometria e MMP-9 não entram no critério diagnóstico/,
      /308 não é 316/,
      /85% versus 86%/,
      /≤ 8 s numa plataforma, ≤ 14 s na outra/,
      /n = 33/,
    ],
    forbiddenLabels: [/NEI/],
  });
});

test("matéria A prega, o atrito e o piscar publica as quatro seções e as travas do rascunho selado", () => {
  assertSealedArticle("a-prega-o-atrito-e-o-piscar", {
    category: "Clínica",
    references: 14,
    practiceBullets: 8,
    locks: [
      /O consultório ainda escala o paciente/,
      /6,8% na primeira década para 90,2%/,
      /76% dos sintomáticos/,
      /versus 12% dos assintomáticos/,
      /88,2% sem DED e 78,0% com DED/,
      /n = 20/,
      /indica CPAP como terapia de olho seco/,
      /Snap-back é manobra/,
    ],
    forbiddenDois: ["10.1097/ICO.0b013e3181ba0cb2"],
    forbiddenLabels: [/Höh/, /Hirotani/, /Korb DR, Herman JP, Blackie CA/],
  });
});


test("matéria IA na superfície ocular publica as quatro seções e o selo de checagem editorial", () => {
  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "ia-na-superficie-ocular",
  );

  assert.ok(
    article,
    "slug ia-na-superficie-ocular deve estar em publishedArticles",
  );
  assert.equal(article.status, "published");
  assert.equal(article.publishedAt, "2026-08-17");
  assert.equal(
    article.reviewSeal,
    "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  );
  assert.equal(article.reviewer, undefined);
  assert.equal(article.featuredImage, undefined);
  assert.equal(article.heroBackground, undefined);
  assert.equal(article.ogImage, undefined);
  assert.equal(
    article.seo.canonical,
    "/superficie/artigos/ia-na-superficie-ocular",
  );

  const kinds = new Set(article.content.map(({ kind }) => kind));
  for (const kind of [
    "why-it-matters",
    "evidence",
    "practice",
    "limitations",
  ] as const) {
    assert.ok(kinds.has(kind), `falta a seção ${kind}`);
  }

  assert.equal(article.modifiedAt, "2026-08-17");
  assert.equal(article.issue, "edicao-00");
  assert.equal(article.sponsored, false);
  assert.equal(article.references.length, 18);
  assert.deepEqual(superficie.validateMagazineArticle(article), []);

  const text = article.content.flatMap((section) => section.paragraphs).join(" ");
  assert.match(text, /73,01%/);
  assert.match(text, /59,17%/);
  assert.match(text, /5\.511 participantes/);
  assert.match(text, /97,5%/);
  assert.match(text, /85,5%/);
  assert.match(text, /TRIPOD\+AI ou STARD-AI/);
  assert.match(text, /kappa 0,93/);
  assert.match(text, /acurácia 0,789/);
  assert.equal(text.includes("TearNET"), false);
  assert.equal(text.includes("94,5%"), false);
  assert.equal(text.includes("35,8%"), false);
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1097/ICO.0000000000004151"),
    true,
  );
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1136/bmj-2023-078378"),
    true,
  );
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1038/s41591-025-03953-8"),
    true,
  );
});

test("validação exige canonical consistente com o slug", () => {
  const validateMagazineArticle =
    typeof api.validateMagazineArticle === "function"
      ? (api.validateMagazineArticle as (value: MagazineArticle) => string[])
      : () => [];

  assert.deepEqual(
    validateMagazineArticle(
      article({
        seo: {
          title: "Artigo base | SUPERFÍCIE",
          description: "Descrição.",
          canonical: "/superficie/artigos/outro-slug",
        },
      }),
    ),
    ["O canonical do artigo deve corresponder ao slug editorial."],
  );
});
