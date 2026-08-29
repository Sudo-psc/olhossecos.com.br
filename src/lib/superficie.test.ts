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

test("status público da edição 00 descreve artigos no ar sem anunciar circulação", () => {
  const status = superficie.getIssuePublicStatus(superficie.founderIssue);

  assert.equal(superficie.founderIssue.status, "in_production");
  assert.ok(superficie.founderIssue.articles.length >= 12);
  assert.equal(status.shortLabel, "Artigos no ar");
  assert.equal(status.label, "Artigos no ar");
  assert.match(status.detail, /novembro de 2026/);
  assert.doesNotMatch(status.detail, /^Em produção$/u);
  assert.equal(status.heroCta, "Ler a Edição Fundadora");
  assert.equal(superficie.editorialPolicyPath, "/politica-editorial");
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

test("matéria DGM entra na listagem sem capa própria", () => {
  const [article] = superficie.publishedArticles;
  assert.equal(article.slug, "biologia-molecular-da-dgm");
  assert.equal(article.featuredImage, undefined);
  assert.equal(article.heroBackground, undefined);
  assert.equal(article.ogImage, undefined);
  assert.equal(article.references.length, 27);
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1016/j.jtos.2024.04.005"),
    true,
  );
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1016/j.jtos.2024.09.006"),
    false,
  );
  assert.match(
    article.references.find(({ doi }) => doi === "10.1016/j.jtos.2024.04.005")
      ?.label ?? "",
    /Zhu X, Xu M, Millar SE/,
  );
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
  assert.deepEqual(
    superficie.founderIssue.articles.map(({ slug }) => slug),
    superficie.publishedArticles.map(({ slug }) => slug),
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
      other.content.every(
        ({ figure }) =>
          !figure ||
          figure.src !==
            "/images/superficie/artigos/tfos-dews-iii-na-pratica/mapa-nove-drivers.png",
      ),
      `${other.slug} não deve receber a figura do TFOS`,
    );
  }

  const markup = readFileSync(
    path.join(repoRoot, "src/components/superficie/MagazineArticlePage.astro"),
    "utf8",
  );
  // A figura saiu para <ArticleFigure>. Só a primeira seção nasce eager:
  // marcar toda figura como alta prioridade faz o navegador competir consigo
  // mesmo por banda e atrasa justamente a candidata a LCP.
  assert.match(markup, /<ArticleFigure figure=\{section\.figure\}/u);
  assert.match(markup, /priority=\{index === 0\}/u);

  const figura = readFileSync(
    path.join(repoRoot, "src/components/superficie/ArticleFigure.astro"),
    "utf8",
  );
  assert.match(figura, /loading=\{priority \? "eager" : "lazy"\}/u);
  assert.match(figura, /fetchpriority=\{priority \? "high" : "auto"\}/u);
  // width/height sempre presentes: é o que reserva a caixa e segura o CLS.
  assert.match(figura, /width=\{figure\.width\}/u);
  assert.match(figura, /height=\{figure\.height\}/u);
  assert.match(
    figura,
    /--figure-ratio: \$\{figure\.width\} \/ \$\{figure\.height\}/u,
  );
  assert.equal(section.figure.width, 1680);
  assert.equal(section.figure.height, 980);
  assert.match(
    markup,
    /class="section-title"[\s\S]*ArticleFigure[\s\S]*section\.paragraphs/u,
  );
  assert.doesNotMatch(
    markup,
    /class="article-inline-figure"[\s\S]*loading="lazy"/u,
  );
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
      "anti-demodex",
      "terapias-dirigidas-por-mecanismo",
      "prehab-ocular",
      "anatomia-dry-eye-center",
      "olho-seco-oct-rnfl",
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
  assert.deepEqual(
    superficie.founderIssue.articles.map(({ slug }) => slug),
    superficie.publishedArticles.map(({ slug }) => slug),
  );

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
  assert.match(text, /associou-se a pior saúde percebida/);
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
      "anti-demodex",
      "terapias-dirigidas-por-mecanismo",
      "prehab-ocular",
      "anatomia-dry-eye-center",
      "olho-seco-oct-rnfl",
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
  assert.match(article.excerpt, /P-score não é ranking de compra/);
  assert.equal(
    article.excerpt.includes(
      "O consultório está sendo vendido um ranking de aparelhos",
    ),
    false,
  );
  assert.deepEqual(
    superficie.founderIssue.articles.map(({ slug }) => slug),
    superficie.publishedArticles.map(({ slug }) => slug),
  );

  const byId = Object.fromEntries(
    article.content.map((section) => [section.id, section]),
  );
  assert.equal(byId["por-que-importa"]?.kind, "why-it-matters");
  assert.equal(byId["o-que-o-ranking-realmente-significa"]?.kind, "body");
  assert.equal(byId.evidencia?.kind, "evidence");
  assert.equal(byId.pratica?.kind, "practice");
  assert.equal(byId.limitacoes?.kind, "limitations");
  assert.equal(article.content.length, 5);
  assert.equal(byId.pratica?.bullets, undefined);
  assert.deepEqual(superficie.validateMagazineArticle(article), []);

  const text = [
    ...article.content.flatMap((section) => section.paragraphs),
    ...(byId.pratica?.bullets ?? []),
  ].join(" ");

  assert.match(text, /47 ensaios randomizados, 3\.581 participantes/);
  assert.match(text, /2 a 4 meses/);
  assert.match(text, /P-score não é ranking de compra/);
  assert.match(text, /Três meses não são doze/);
  assert.match(text, /estas seis perguntas/);
  assert.match(text, /Qual foi o horizonte do estudo/);
  assert.match(text, /mediana até o retratamento ficou em torno de oito meses/);
  assert.match(text, /aproximadamente 16 pontos no OSDI/);
  assert.match(text, /cerca de 7 pontos/);
  assert.match(text, /E-Eye\/IRPL com M22\/Lumenis ou Toyos/);
  assert.match(text, /Xue e colaboradores \(2020\)/);
  assert.match(text, /Wu e colaboradores \(2020\)/);
  assert.match(text, /Jiang e colaboradores \(2022\)/);
  assert.match(text, /Cong e colaboradores \(2025\)/);
  assert.match(text, /Chen e colaboradores \(2025\)/);
  assert.equal(text.includes("Park et al"), false);
  assert.equal(text.includes("Consensus"), false);
  assert.equal(text.includes("Elicit"), false);
  assert.match(text, /17 de agosto de 2026/);
  assert.equal(article.references.length, 15);
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
    article.references.some(({ label }) =>
      /Holland|OLYMPIA|Park et al/u.test(label),
    ),
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
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1177/25158414251338775"),
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
    modifiedAt?: string;
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
  assert.equal(article.modifiedAt, expected.modifiedAt ?? "2026-08-15");
  assert.equal(article.seo.canonical, `/superficie/artigos/${slug}`);
  assert.deepEqual(
    superficie.founderIssue.articles.map(({ slug }) => slug),
    superficie.publishedArticles.map(({ slug }) => slug),
  );

  const byId = Object.fromEntries(
    article.content.map((section) => [section.id, section]),
  );
  assert.equal(byId["por-que-importa"]?.kind, "why-it-matters");
  assert.equal(byId.evidencia?.kind, "evidence");
  assert.equal(byId.pratica?.kind, "practice");
  assert.equal(byId.limitacoes?.kind, "limitations");
  if (expected.practiceBullets === 0) {
    assert.equal(byId.pratica?.bullets, undefined);
  } else {
    assert.equal(byId.pratica?.bullets?.length, expected.practiceBullets);
  }
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
    references: 16,
    modifiedAt: "2026-08-25",
    practiceBullets: 0,
    locks: [
      /O meiboscore virou atalho de consultório/,
      /soma bruta dos 6 itens, escala 0–24/,
      /não o índice 0–100 do OSDI-12/,
      /Arita 0–3 por pálpebra ou Pult 0–4/,
      /C-stat em torno de 0,63/,
      /n = 15/,
      /corpo do workshop não foi recuperado/,
      /R = 0,428/,
      /Hwang e colaboradores \(2013\)/,
      /campo 5 × 2 mm/,
    ],
  });

  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "alem-do-meiboscore",
  );
  const oct = article?.content.find(({ id }) => id === "oct-3d");
  assert.equal(
    oct?.figure?.src,
    "/images/educacao/meibografia-dgm-leve-acinos-hwang-2013.jpg",
  );
  assert.equal(
    oct?.figure?.credit?.url,
    "https://doi.org/10.1371/journal.pone.0067143",
  );
  assert.equal(oct?.figure?.license?.label, "CC BY 4.0");
  assert.equal(
    oct?.figure?.license?.url,
    "https://creativecommons.org/licenses/by/4.0/",
  );
  assert.match(oct?.figure?.modification ?? "", /Sem recorte/u);

  // Crédito e licença moram em <ArticleFigure>: atribuição de CC BY é
  // exigência da licença, e é o componente que a renderiza agora.
  const figuraMarkup = read(
    path.join(repoRoot, "src/components/superficie/ArticleFigure.astro"),
  );
  assert.match(figuraMarkup, /figure\.credit\.url/u);
  assert.match(figuraMarkup, /rel="noopener noreferrer license"/u);
});

test("matéria Cinco testes, cinco perguntas publica as quatro seções e as travas do rascunho selado", () => {
  assertSealedArticle("cinco-testes-cinco-perguntas", {
    category: "Diagnóstico",
    references: 14,
    practiceBullets: 0,
    locks: [
      /O consultório ainda trata tempo de ruptura/,
      /soma bruta dos 6 itens \(escala 0–24\)/,
      /Interferometria e MMP-9 não entram no critério diagnóstico/,
      /308 do DEWS III é o limiar sensível de Lemp/,
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
    practiceBullets: 0,
    locks: [
      /O consultório ainda escala o paciente/,
      /6,8% na primeira década, 90,2%/,
      /76% dos sintomáticos/,
      /versus 12% dos assintomáticos/,
      /88,2% sem DED e 78,0% com DED/,
      /n = 20/,
      /indica CPAP como terapia de olho seco/,
      /Snap-back/,
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
  assert.equal(article.references.length, 12);
  assert.deepEqual(superficie.validateMagazineArticle(article), []);

  const text = article.content
    .flatMap((section) => section.paragraphs)
    .join(" ");
  assert.match(text, /73,01%/);
  assert.match(text, /59,17%/);
  assert.match(text, /síntese sem DOI próprio/);
  assert.match(text, /não tratada aqui como artigo publicado/);
  assert.match(text, /fora da lista de referências/);
  assert.equal(text.includes("1.600 imagens"), false);
  assert.equal(text.includes("TearNET"), false);
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1016/j.jtos.2022.06.006"),
    true,
  );
});

const assertSealedEditionArticle = (
  slug: string,
  referenceCount: number,
  keyDois: string[],
) => {
  const article = superficie.publishedArticles.find(
    (item) => item.slug === slug,
  );

  assert.ok(article, `slug ${slug} deve estar em publishedArticles`);
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
  assert.equal(article.seo.canonical, `/superficie/artigos/${slug}`);
  assert.equal(article.references.length, referenceCount);

  const kinds = new Set(article.content.map(({ kind }) => kind));
  for (const kind of [
    "why-it-matters",
    "evidence",
    "practice",
    "limitations",
  ] as const) {
    assert.ok(kinds.has(kind), `falta a seção ${kind}`);
  }

  const dois = new Set(
    article.references.map(({ doi }) => doi).filter(Boolean),
  );
  for (const doi of keyDois) {
    assert.ok(dois.has(doi), `falta o DOI ${doi}`);
  }

  assert.deepEqual(superficie.validateMagazineArticle(article), []);
};

test("matéria Anti-Demodex publica as quatro seções e o selo de checagem editorial", () => {
  assert.equal(
    superficie.publishedArticles[0].slug,
    "biologia-molecular-da-dgm",
  );
  assertSealedEditionArticle("anti-demodex", 14, ["10.1167/iovs.05-0275"]);
});

test("matéria terapias dirigidas publica as quatro seções e o selo de checagem editorial", () => {
  assertSealedEditionArticle("terapias-dirigidas-por-mecanismo", 14, [
    "10.1002/14651858.CD010051.pub3",
  ]);
});

test("matéria prehab ocular publica as quatro seções e o selo de checagem editorial", () => {
  assertSealedEditionArticle("prehab-ocular", 14, [
    "10.1016/j.jcrs.2019.03.023",
  ]);
});

test("matéria anatomia do Dry Eye Center publica as quatro seções e o selo de checagem editorial", () => {
  assertSealedEditionArticle("anatomia-dry-eye-center", 17, [
    "10.1097/ICO.0b013e3181f7f363",
    "10.1038/s41598-018-20273-9",
    "10.1016/j.clinsp.2025.100578",
    "10.5935/0004-2749.202200100",
  ]);
});

test("matéria olho-seco-oct-rnfl publica as quatro seções e as quatro placas", () => {
  const article = superficie.publishedArticles.find(
    ({ slug }) => slug === "olho-seco-oct-rnfl",
  );

  assert.ok(article, "slug olho-seco-oct-rnfl deve estar em publishedArticles");
  assert.equal(article.status, "published");
  assert.equal(article.category, "Diagnóstico");
  assert.equal(article.issue, "edicao-00");
  assert.equal(article.publishedAt, "2026-08-25");
  assert.equal(
    article.reviewSeal,
    "CHECAGEM EDITORIAL — NÃO REVISADO POR PARES",
  );
  assert.equal(article.reviewer, undefined);
  assert.equal(article.featuredImage, undefined);
  assert.equal(article.heroBackground, undefined);
  assert.equal(article.ogImage, undefined);
  assert.equal(article.sponsored, false);
  assert.equal(article.seo.canonical, "/superficie/artigos/olho-seco-oct-rnfl");
  assert.deepEqual(superficie.validateMagazineArticle(article), []);
  const technologyHrefs: readonly string[] = superficie.technologyTopics.map(
    ({ href }) => href,
  );
  assert.equal(
    technologyHrefs.includes("/superficie/artigos/olho-seco-oct-rnfl"),
    false,
  );

  const byId = Object.fromEntries(
    article.content.map((section) => [section.id, section]),
  );
  assert.equal(byId["por-que-importa"]?.kind, "why-it-matters");
  assert.equal(byId.evidencia?.kind, "evidence");
  assert.equal(byId.pratica?.kind, "practice");
  assert.equal(byId.limitacoes?.kind, "limitations");
  assert.equal(byId.pratica?.bullets?.length, 5);

  const figures = [
    [
      "por-que-importa",
      "/images/superficie/artigos/olho-seco-oct-rnfl/placa-impacto.png",
      "Placa Observatório: A RNFL que caiu pode ser o filme, não o nervo.",
      "A RNFL que caiu pode ser o filme, não o nervo.",
    ],
    [
      "evidencia",
      "/images/superficie/artigos/olho-seco-oct-rnfl/placa-evidencia.png",
      "Gráfico de duas barras: RNFL média 93,07 µm antes e 98,27 µm depois de tratar OSD em 55 pessoas com GPAA. Sem braço controle.",
      "O número que muda a visita. RNFL média em GPAA com OSD, n = 55, sem braço controle: 93,07 µm antes → 98,27 µm depois de tratar a superfície (Δ +5,2 µm; eixo do gráfico 80–110 µm; lágrima + loteprednol, semanas; não é gota na sala; não é RCT). Oktay, Dursun, Yılmaz. Eur J Ophthalmol. 2021;31(6):2997-3002. doi:10.1177/1120672121991395",
    ],
    [
      "pratica",
      "/images/superficie/artigos/olho-seco-oct-rnfl/placa-visita.png",
      "Quatro beats da visita: piscar; ler o sinal no eixo daquele aparelho; tratar OSD e repetir; scan ruim não fecha piora.",
      "O que muda na cadeira. Piscar: quinze segundos de secagem já saem do erro do Stratus. Ler o sinal no eixo daquele aparelho — Stratus e Cirrus não são Spectralis. Tratar OSD e repetir: não chamar progressão no scan seco. Scan ruim não fecha piora, nem no sentido errado da plataforma.",
    ],
    [
      "limitacoes",
      "/images/superficie/artigos/olho-seco-oct-rnfl/placa-freio.png",
      "Dois cartões: Stratus e Cirrus, sinal baixo afina; Spectralis, Q baixo engrossa.",
      "O freio: a direção do viés depende do aparelho. Stratus e Cirrus: sinal baixo afina RNFL. Spectralis: Q baixo engrossa. Gershoni 2022, Strampe 2020. Não fundir plataforma. Sem IA que calibra filme.",
    ],
  ] as const;

  for (const [id, src, alt, caption] of figures) {
    const figure = byId[id]?.figure;
    assert.ok(figure, `falta a figura em #${id}`);
    assert.equal(figure.src, src);
    assert.equal(figure.alt, alt);
    assert.equal(figure.caption, caption);
    assert.equal(figure.width, 1654);
    assert.equal(figure.height, 2339);
    const file = path.join(repoRoot, "public", src.replace(/^\//, ""));
    assert.ok(existsSync(file), `${src} precisa estar versionado com o artigo`);
    const ihdr = readFileSync(file);
    assert.equal(ihdr.readUInt32BE(16), 1654, `${src} width`);
    assert.equal(ihdr.readUInt32BE(20), 2339, `${src} height`);
  }

  const text = [
    ...article.content.flatMap((section) => [
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
  ].join(" ");
  assert.match(text, /17 sadios/);
  assert.match(text, /93,07/);
  assert.match(text, /98,27/);
  assert.match(text, /−15,70/);
  assert.match(text, /−16,34/);
  assert.match(text, /−4,76/);
  assert.match(text, /n = 13/);
  assert.match(text, /n = 55/);
  assert.match(text, /IA não calibra filme/);
  assert.equal(text.includes("GCC"), true);
  assert.equal(
    article.references.some(({ doi }) => doi === "10.1177/1120672121991395"),
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
