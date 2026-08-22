import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

/**
 * Contrato dos estados de UI dos controles interativos.
 *
 * O sistema de design pede hover, foco visível, pressed/active nos botões,
 * disabled+busy nos formulários assíncronos e empty nas buscas. Remover o
 * outline sem um replacement (`:focus-visible` ou `:focus-within`) é
 * regressão: o anel global some e o teclado fica sem indicador.
 *
 * Componentes só-marcação (Footer, wrapper da newsletter da revista) herdam
 * o estilo do layout — a lista de delegados abaixo é o que autoriza isso.
 */

const INTERACTIVE_TAG = /<(button|input|select|textarea|summary)\b/u;

const STYLE_DELEGATES = new Set([
  "src/components/AnalyticsCollector.astro",
  "src/components/EyeMark.astro",
  "src/components/Footer.astro",
  "src/components/superficie/SuperficieNewsletterForm.astro",
]);

const PORTAL_LAYOUT_STATES = [
  ":focus-visible",
  ".button-primary:hover",
  ".button-primary:active",
  ".button-primary:disabled",
  ".header-cta:hover",
  ".header-cta:active",
  ".menu-button:hover",
  ".menu-button:active",
  ".mobile-nav a:hover",
];

const SUPERFICIE_LAYOUT_STATES = [
  ":focus-visible",
  ".button:hover",
  ".button:active",
  ".button:disabled",
];

const collectSources = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectSources(path);
      if (entry.name.includes(".test.")) return [];
      return /\.(astro|css)$/u.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
};

const styleBlocks = (source: string) =>
  [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gu)]
    .map((match) => match[1] ?? "")
    .join("\n") || source;

const compact = (css: string) => css.replace(/\s+/gu, " ");

const hasSelector = (css: string, selector: string) =>
  compact(css).includes(compact(selector));

test("quem zera o outline declara replacement de foco no mesmo arquivo", async () => {
  const offenders: string[] = [];

  for (const path of await collectSources("src")) {
    const source = await readFile(path, "utf8");
    const css = styleBlocks(source);
    if (!/\boutline:\s*(?:0|none)\b/u.test(css)) continue;
    if (
      !/:focus-visible\b/u.test(css) &&
      !/:focus-within\b/u.test(css) &&
      !/:focus\b/u.test(css)
    ) {
      offenders.push(path);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `outline:none sem :focus-visible/:focus-within apaga o anel global:\n${offenders.join("\n")}`,
  );
});

test("componentes com controle próprio declaram hover", async () => {
  const offenders: string[] = [];

  for (const path of await collectSources("src/components")) {
    if (STYLE_DELEGATES.has(path)) continue;
    const source = await readFile(path, "utf8");
    if (!INTERACTIVE_TAG.test(source)) continue;
    if (!/<style[\s>]/u.test(source)) continue;
    if (!/:hover\b/u.test(styleBlocks(source))) offenders.push(path);
  }

  assert.deepEqual(
    offenders,
    [],
    `controle interativo sem :hover no próprio arquivo:\n${offenders.join("\n")}`,
  );
});

test("formulários que ficam ocupados têm estado disabled", async () => {
  const offenders: string[] = [];

  for (const path of await collectSources("src")) {
    const source = await readFile(path, "utf8");
    if (!source.includes('setAttribute("aria-busy"')) continue;
    if (!/:disabled\b/u.test(styleBlocks(source))) offenders.push(path);
  }

  assert.deepEqual(
    offenders,
    [],
    `aria-busy sem :disabled deixa o botão parecer clicável no envio:\n${offenders.join("\n")}`,
  );
});

test("a busca global tem estado vazio e foco no campo", async () => {
  const source = await readFile(
    "src/components/GlobalSearchModal.astro",
    "utf8",
  );
  const css = styleBlocks(source);

  assert.match(source, /class="search-empty"/u);
  assert.ok(
    hasSelector(css, ".search-input-wrap:focus-within"),
    "o input zera outline — o wrap precisa de :focus-within",
  );
  assert.ok(hasSelector(css, ".search-close-btn:hover"));
  assert.ok(hasSelector(css, ".filter-chip:hover"));
});

test("os layouts canônicos declaram hover, active, disabled e foco", async () => {
  const portal = styleBlocks(
    await readFile("src/layouts/Layout.astro", "utf8"),
  );
  const missingPortal = PORTAL_LAYOUT_STATES.filter(
    (selector) => !hasSelector(portal, selector),
  );
  assert.deepEqual(
    missingPortal,
    [],
    `Layout.astro sem estado: ${missingPortal.join(", ")}`,
  );

  const surface = styleBlocks(
    await readFile("src/layouts/SuperficieLayout.astro", "utf8"),
  );
  const missingSurface = SUPERFICIE_LAYOUT_STATES.filter(
    (selector) => !hasSelector(surface, selector),
  );
  assert.deepEqual(
    missingSurface,
    [],
    `SuperficieLayout.astro sem estado: ${missingSurface.join(", ")}`,
  );
});

test("controles do header do portal e da revista têm hover e active", async () => {
  const portal = styleBlocks(
    await readFile("src/components/Header.astro", "utf8"),
  );
  for (const selector of [
    ".header-search-btn:hover",
    ".header-search-btn:active",
    ".mobile-search-btn:hover",
    ".mobile-search-btn:active",
  ]) {
    assert.ok(hasSelector(portal, selector), `Header.astro sem ${selector}`);
  }

  const surface = styleBlocks(
    await readFile("src/components/superficie/SuperficieHeader.astro", "utf8"),
  );
  for (const selector of [
    ".surface-search-btn:hover",
    ".surface-search-btn:active",
    ".surface-mobile-search-btn:hover",
    ".surface-mobile-search-btn:active",
    ".sticky-search-btn:hover",
    ".sticky-search-btn:active",
    ".surface-menu-button:hover",
    ".surface-menu-button:active",
  ]) {
    assert.ok(
      hasSelector(surface, selector),
      `SuperficieHeader.astro sem ${selector}`,
    );
  }
});

test("a newsletter do portal também tem pressed, não só a da revista", async () => {
  const css = styleBlocks(
    await readFile("src/components/NewsletterSignupForm.astro", "utf8"),
  );
  assert.ok(hasSelector(css, "button:hover"));
  assert.ok(hasSelector(css, "button:disabled"));
  assert.ok(
    hasSelector(css, "button:not(:disabled):active"),
    "o variant portal ficava sem :active; a revista já tinha",
  );
});
