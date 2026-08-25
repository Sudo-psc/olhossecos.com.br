import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/**
 * Contraste WCAG dos tokens que viram texto.
 *
 * O site já tinha falha de AA em produção: `--surface-gold` (#b98a36) dava
 * 2,83:1 sobre o papel creme e mesmo assim era a cor da numeração das
 * referências, do rótulo do ciclo do RADAR e do marcador das limitações.
 * Ninguém percebe lendo o CSS — a cor é bonita, o número é pequeno, e nenhum
 * teste olhava para a razão entre as duas.
 *
 * O critério aqui é o AAA (1.4.6): 7:1 para texto normal. Cada par declara o
 * pior fundo claro em que aquele token realmente aparece, porque é o pior caso
 * que decide, não o branco puro.
 *
 * Tokens de marca (--surface-gold, --surface-teal, --copper-600) ficam de
 * fora de propósito: são fio, borda e topo de card, e elemento decorativo não
 * tem exigência de contraste. Se algum deles voltar a ser `color:`, o teste
 * seguinte pega.
 */

const readToken = (source: string, name: string): string => {
  const match = source.match(
    new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`, "u"),
  );
  assert.ok(match, `token ${name} não encontrado ou não é hex de 6 dígitos`);
  return match[1].toLowerCase();
};

const channel = (value: number): number => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) =>
    channel(Number.parseInt(hex.slice(i, i + 2), 16)),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

/** Arredonda para baixo em duas casas: 6,999 não passa por otimismo. */
const ratio = (a: string, b: string) => Math.floor(contrast(a, b) * 100) / 100;

const AAA_NORMAL = 7;

test("o cálculo de contraste bate com os pares canônicos do WCAG", () => {
  assert.equal(ratio("#000000", "#ffffff"), 21);
  assert.equal(ratio("#ffffff", "#ffffff"), 1);
  // Par de referência do próprio WCAG para o limiar de 4,5:1.
  assert.equal(ratio("#767676", "#ffffff"), 4.54);
});

const AA_NORMAL = 4.5;
const AA_LARGE = 3;

test("todo token de texto do portal tem 7:1 no pior fundo claro", async () => {
  const tokens = await readFile("src/styles/tokens.css", "utf8");
  const t = (name: string) => readToken(tokens, name);

  // Fundos claros que aparecem como `background:` nas páginas do portal.
  const fundos = [
    t("--paper-0"),
    t("--paper-50"),
    t("--paper-100"),
    t("--teal-50"),
    t("--teal-100"),
  ];

  const textos = [
    "--navy-800",
    "--navy-600",
    "--navy-400",
    "--teal-700",
    "--copper-700",
    "--alert-600",
  ];

  const falhas: string[] = [];
  for (const nome of textos) {
    for (const fundo of fundos) {
      const r = ratio(t(nome), fundo);
      if (r < AAA_NORMAL) {
        falhas.push(`${nome} (${t(nome)}) sobre ${fundo}: ${r}:1`);
      }
    }
  }

  assert.deepEqual(
    falhas,
    [],
    `abaixo de ${AAA_NORMAL}:1 — escureça o token ou tire-o de texto:\n${falhas.join("\n")}`,
  );
});

test("o dourado de texto do portal tem 4,5:1 no pior fundo claro real", async () => {
  const tokens = await readFile("src/styles/tokens.css", "utf8");
  const t = (name: string) => readToken(tokens, name);
  const ouro = t("--gold-text");

  // --paper-200 existe na escala mas não é fundo de texto; o pior fundo
  // real é --teal-100 (4,62:1). WCAG 1.4.3 texto normal.
  const fundos = [
    t("--paper-0"),
    t("--paper-50"),
    t("--paper-100"),
    t("--teal-50"),
    t("--teal-100"),
  ];

  const falhas: string[] = [];
  for (const fundo of fundos) {
    const r = ratio(ouro, fundo);
    if (r < AA_NORMAL)
      falhas.push(`--gold-text (${ouro}) sobre ${fundo}: ${r}:1`);
  }

  assert.deepEqual(falhas, [], falhas.join("\n"));
});

test("todo token de texto da SUPERFÍCIE tem 7:1 no pior fundo claro", async () => {
  const layout = await readFile("src/layouts/SuperficieLayout.astro", "utf8");
  const t = (name: string) => readToken(layout, name);

  const fundos = [t("--surface-white"), t("--surface-paper")];
  const textos = [
    "--surface-ink",
    "--surface-copy",
    "--surface-muted",
    "--surface-teal-dark",
    "--surface-gold-text",
  ];

  const falhas: string[] = [];
  for (const nome of textos) {
    for (const fundo of fundos) {
      const r = ratio(t(nome), fundo);
      if (r < AAA_NORMAL) {
        falhas.push(`${nome} (${t(nome)}) sobre ${fundo}: ${r}:1`);
      }
    }
  }

  assert.deepEqual(falhas, [], falhas.join("\n"));
});

test("o dourado de texto AA da SUPERFÍCIE passa 4,5:1 no papel", async () => {
  const layout = await readFile("src/layouts/SuperficieLayout.astro", "utf8");
  const t = (name: string) => readToken(layout, name);
  const ouro = t("--gold-text");

  for (const fundo of ["--surface-white", "--surface-paper"]) {
    const r = ratio(ouro, t(fundo));
    assert.ok(
      r >= AA_NORMAL,
      `--gold-text sobre ${fundo}: ${r}:1 — WCAG 1.4.3 exige 4,5:1`,
    );
  }
});

test("o ouro claro só vale como texto sobre o navy", async () => {
  const layout = await readFile("src/layouts/SuperficieLayout.astro", "utf8");
  const t = (name: string) => readToken(layout, name);
  const claro = t("--surface-gold-light");

  assert.ok(
    ratio(claro, t("--surface-navy")) >= AA_NORMAL,
    `ouro claro no navy abaixo de 4,5:1`,
  );
  assert.ok(
    ratio(claro, t("--surface-paper")) < AA_LARGE,
    `ouro claro no papel passou a ter contraste de texto — não use como color: sobre fundo claro`,
  );
});

test("o texto sobre o navy da SUPERFÍCIE também tem 7:1", async () => {
  const layout = await readFile("src/layouts/SuperficieLayout.astro", "utf8");
  const t = (name: string) => readToken(layout, name);

  // As seções escuras têm paleta própria: quem for de fundo claro reprova aqui.
  for (const nome of [
    "--surface-paper",
    "--surface-muted-on-dark",
    "--surface-gold-light",
  ]) {
    for (const fundo of ["--surface-navy", "--surface-navy-deep"]) {
      const r = ratio(t(nome), t(fundo));
      assert.ok(
        r >= AAA_NORMAL,
        `${nome} sobre ${fundo}: ${r}:1 — abaixo de ${AAA_NORMAL}:1`,
      );
    }
  }
});

/**
 * A regressão que o teste de razão sozinho não pega: o token de marca voltar
 * a ser cor de texto. `--surface-gold` sobre papel dá 2,83:1, e foi exatamente
 * assim — como `color:` — que a falha de AA entrou no site.
 */
test("token de marca nunca é cor de texto", async () => {
  const arquivos = [
    "src/components/superficie/MagazineArticlePage.astro",
    "src/components/superficie/ArticleCard.astro",
    "src/pages/superficie/index.astro",
    "src/pages/superficie/radar/index.astro",
    "src/pages/superficie/radar/[slug].astro",
    "src/pages/profissional.astro",
  ];

  const decorativos = ["--surface-gold", "--surface-teal", "--copper-600"];
  const ofensores: string[] = [];

  for (const caminho of arquivos) {
    const source = await readFile(caminho, "utf8");
    for (const token of decorativos) {
      // `(?<![-\w])` impede que `border-top-color:` conte como cor de texto.
      const padrao = new RegExp(`(?<![-\\w])color:\\s*var\\(${token}\\)`, "gu");
      for (const _ of source.matchAll(padrao)) {
        ofensores.push(`${caminho}: color: var(${token})`);
      }
    }
  }

  assert.deepEqual(
    ofensores,
    [],
    `use a variante de texto (--surface-gold-text, --surface-teal-dark, --copper-700):\n${ofensores.join("\n")}`,
  );
});
