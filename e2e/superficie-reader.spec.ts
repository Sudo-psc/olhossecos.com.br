import { expect, test, type Page } from "@playwright/test";

const readerUrl = "/superficie/lab/flipbook";

test.beforeEach(async ({ page }) => {
  const criticalConsoleMessages: string[] = [];
  const missingResources: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error")
      criticalConsoleMessages.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() === 404) missingResources.push(response.url());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  (
    page as Page & { criticalConsoleMessages?: string[] }
  ).criticalConsoleMessages = criticalConsoleMessages;
  (page as Page & { missingResources?: string[] }).missingResources =
    missingResources;
  (page as Page & { pageErrors?: string[] }).pageErrors = pageErrors;
});

test.afterEach(async ({ page }) => {
  expect(
    (page as Page & { criticalConsoleMessages?: string[] })
      .criticalConsoleMessages,
  ).toEqual([]);
  expect(
    (page as Page & { missingResources?: string[] }).missingResources,
  ).toEqual([]);
  expect((page as Page & { pageErrors?: string[] }).pageErrors).toEqual([]);
});

test("fluxo crítico persiste destaque, marcador e progresso", async ({
  page,
}) => {
  await openReader(page, 1);
  await expect(page.locator("[data-reader-viewport]")).toHaveAttribute(
    "data-display-mode",
    /single|double/u,
  );

  await page.locator("[data-action='next']").click();
  await expect(page.locator("[data-page-input]")).toHaveValue("2", {
    timeout: 3_000,
  });

  await page.locator("[data-action='search']").click();
  await page.locator("#reader-search").fill("camada visual");
  await page
    .locator("[data-search-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  const result = page.locator("[data-search-results] [data-navigate-page='4']");
  await expect(result).toContainText("página 4");
  await result.click();
  await expect(page.locator("[data-page-input]")).toHaveValue("4");

  await selectText(
    page,
    "[data-page-number='4'] [data-text-block='page-4-paragraph-2']",
    "camada visual",
  );
  await expect(page.locator("[data-selection-menu]")).toBeVisible();
  await page.locator("[data-highlight-color='yellow']").click();
  await expect(
    page.locator("[data-page-number='4'] mark[data-color='yellow']"),
  ).toContainText("camada visual");

  await page.locator("[data-action='bookmark']").click();
  await expect(page.locator("[data-action='bookmark']")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("[data-action='bookmarks']").click();
  await page.locator("[data-panel='bookmarks'] [data-close-panel]").click();

  await page.reload();
  await readerReady(page);
  await expect(page.locator("[data-page-input]")).toHaveValue("4");
  await expect(
    page.locator("[data-page-number='4'] mark[data-color='yellow']"),
  ).toContainText("camada visual");
  await expect(page.locator("[data-action='bookmark']")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.locator("[data-page-input]").fill("7");
  await page
    .locator("[data-page-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator("[data-page-input]")).toHaveValue("7");
  await page.evaluate(() =>
    window.history.replaceState({}, "", window.location.pathname),
  );
  await page.reload();
  await readerReady(page);
  await expect(page.locator("[data-resume-banner]")).toContainText(
    "Continuar da página 7",
  );
  await page.locator("[data-action='resume']").click();
  await expect(page.locator("[data-page-input]")).toHaveValue("7");
});

test("deep link, modo texto, nota e controles de teclado permanecem acessíveis", async ({
  page,
}) => {
  await openReader(page, 5);
  await expect(page.locator("[data-page-input]")).toHaveValue("5");

  await page.keyboard.press("Home");
  await expect(page.locator("[data-page-input]")).toHaveValue("1");
  await page.keyboard.press("End");
  await expect(page.locator("[data-page-input]")).toHaveValue("8");

  await page.locator("[data-action='notes']").click();
  await page.locator("#reader-note").fill("Nota local de teste E2E.");
  await page
    .locator("[data-note-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator("[data-note-list]")).toContainText(
    "Nota local de teste E2E.",
  );
  await page.locator("[data-panel='notes'] [data-close-panel]").click();

  await page.locator("[data-page-input]").fill("4");
  await page
    .locator("[data-page-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Duas camadas, uma leitura",
  );
  await expect(page.locator("[data-text-mode-content] article")).toBeVisible();
});

test("preferência reduced motion troca o curl pelo adapter simples", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openReader(page, 4);
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await expect(page.locator(".stf__block")).toHaveCount(0);
  await expect(page.locator("[data-page-number='4']")).toBeVisible();
  const displayMode = await page
    .locator("[data-reader-viewport]")
    .getAttribute("data-display-mode");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-page-input]")).toHaveValue(
    displayMode === "double" ? "6" : "5",
  );
});

test("seleção real por arraste funciona com o engine 3D", async ({ page }) => {
  await openReader(page, 4);
  await expect(page.locator(".stf__block")).toHaveCount(1);

  const paragraph = page.locator(
    "[data-page-number='4'] [data-text-block='page-4-paragraph-2']",
  );
  const bounds = await paragraph.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  const y = bounds.y + Math.min(bounds.height / 2, 18);
  await page.mouse.move(bounds.x + 8, y);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.72, y, { steps: 12 });
  await page.mouse.up();

  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString().trim()))
    .not.toBe("");
  await expect(page.locator("[data-selection-menu]")).toBeVisible();
});

test("modo texto resolve o artigo declarado pela página atual", async ({
  page,
}) => {
  await page.route("**/superficie/issues/poc/manifest.json", async (route) => {
    const response = await route.fetch();
    const manifest = await response.json();
    manifest.pages = manifest.pages.map(
      (entry: { number: number; articleId?: string }) =>
        entry.number === 6 || entry.number === 7
          ? { ...entry, articleId: "edicao-alternativa" }
          : { ...entry, articleId: undefined },
    );
    manifest.articles = [
      {
        id: "edicao-alternativa",
        title: "Artigo de edição alternativa",
        pages: [6, 7],
        htmlPath: "/superficie/issues/poc/articles/duas-camadas.html",
      },
    ];
    await route.fulfill({ response, json: manifest });
  });

  await openReader(page, 6);
  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Duas camadas, uma leitura",
  );
});

test("virtualização mantém no máximo cinco páginas pesadas hidratadas", async ({
  page,
}) => {
  await openReader(page, 1);
  for (const target of [3, 5, 7, 8]) {
    await page.locator("[data-page-input]").fill(String(target));
    await page
      .locator("[data-page-form]")
      .evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(page.locator("[data-page-input]")).toHaveValue(String(target));
  }

  await expect
    .poll(() => page.locator("img[data-loaded='true']").count())
    .toBeLessThanOrEqual(5);
  await expect
    .poll(() =>
      page.locator("[data-text-layer]:has([data-text-block])").count(),
    )
    .toBeLessThanOrEqual(5);
});

test("zoom diferencia fit page, fit width e amplia o adapter simples", async ({
  page,
}) => {
  await openReader(page, 4);
  const visiblePage = page.locator("[data-page-number='4']:visible").first();
  await page.locator("[data-action='zoom']").click();
  await page.locator("[data-zoom='fit-page']").click();
  const fitPage = await visiblePage.boundingBox();
  await page.locator("[data-zoom='fit-width']").click();
  const fitWidth = await visiblePage.boundingBox();
  expect(fitPage).not.toBeNull();
  expect(fitWidth).not.toBeNull();
  const displayMode = await page
    .locator("[data-reader-viewport]")
    .getAttribute("data-display-mode");
  if (displayMode === "double") {
    expect(fitWidth!.width).toBeGreaterThan(fitPage!.width * 1.05);
  } else {
    expect(fitWidth!.width).toBeGreaterThanOrEqual(fitPage!.width * 0.99);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await readerReady(page);
  const simplePage = page.locator("[data-page-number='4']:visible").first();
  await page.locator("[data-action='zoom']").click();
  await page.locator("[data-zoom='100']").click();
  await expect(simplePage).toHaveCSS("transform", /matrix\(1, 0, 0, 1/u);
  const before = await simplePage.boundingBox();
  await page.locator("[data-zoom='150']").click();
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-zoom-mode",
    "custom",
  );
  await expect(simplePage).toHaveCSS("transform", /matrix\(1\.5/u);
  const after = await simplePage.boundingBox();
  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(after!.width).toBeGreaterThan(before!.width * 1.4);
});

test("painéis restauram foco e marcadores podem ser consultados sem mutação", async ({
  page,
}) => {
  await openReader(page, 4);
  const markButton = page.locator("[data-action='bookmark']");
  await markButton.click();
  await expect(markButton).toHaveAttribute("aria-pressed", "true");

  const listButton = page.locator("[data-action='bookmarks']");
  await listButton.click();
  await expect(
    page.locator("[data-bookmark-list] [data-navigate-page]"),
  ).toHaveCount(1);
  await page.locator("[data-panel='bookmarks'] [data-close-panel]").click();
  await expect(listButton).toBeFocused();
  await expect(markButton).toHaveAttribute("aria-pressed", "true");

  const searchButton = page.locator("[data-action='search']");
  await searchButton.click();
  await page.keyboard.press("Escape");
  await expect(searchButton).toBeFocused();
});

test("modo texto sanitiza HTML ativo e preserva estrutura acessível", async ({
  page,
}) => {
  await page.route("**/articles/duas-camadas.html", async (route) => {
    await route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: `
        <article>
          <h1>Artigo seguro</h1>
          <img src="/superficie/issues/poc/pages/page-01-small.webp" onerror="window.__readerXss = true">
          <script>window.__readerXss = true</script>
          <iframe srcdoc="<script>parent.__readerXss = true</script>"></iframe>
          <form><input name="segredo"></form>
          <svg onload="window.__readerXss = true"></svg>
          <a id="unsafe-link" href="javascript:window.__readerXss=true">Ruim</a>
          <a id="safe-link" href="https://example.org/leitura" target="_blank">Seguro</a>
        </article>`,
    });
  });

  await openReader(page, 4);
  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Artigo seguro",
  );
  await expect(
    page
      .locator("[data-text-mode-content]")
      .locator("script, iframe, form, svg"),
  ).toHaveCount(0);
  await expect(
    page.locator("[data-text-mode-content] img"),
  ).not.toHaveAttribute("onerror", /.+/u);
  await expect(page.locator("#unsafe-link")).not.toHaveAttribute("href", /.+/u);
  await expect(page.locator("#safe-link")).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  expect(await page.evaluate(() => Reflect.get(window, "__readerXss"))).toBe(
    undefined,
  );
});

test("índice de busca inválido falha localmente sem erro não tratado", async ({
  page,
}) => {
  await page.route("**/search-index.json", async (route) => {
    await route.fulfill({ json: [{ page: 4, text: null }] });
  });
  await openReader(page, 4);
  await page.locator("[data-action='search']").click();
  await page.locator("#reader-search").fill("camada");
  await page
    .locator("[data-search-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator("[data-search-status]")).toContainText(
    "indisponível",
  );
  await expect(page.locator("[data-page-input]")).toHaveValue("4");
});

test("text layer inválida degrada somente a página afetada", async ({
  page,
}) => {
  await page.route("**/text/page-04.json", async (route) => {
    await route.fulfill({
      json: {
        page: 4,
        blocks: [
          {
            id: "fora-da-pagina",
            text: "Texto inválido",
            x: 2,
            y: -1,
            width: 10,
            height: 0,
          },
        ],
      },
    });
  });
  await openReader(page, 4);
  await expect(
    page.locator("[data-page-number='4'] [data-text-layer]"),
  ).toHaveAttribute("aria-label", /indisponível/u);
  await expect(page.locator("[data-page-number='4'] img")).toBeVisible();
  const displayMode = await page
    .locator("[data-reader-viewport]")
    .getAttribute("data-display-mode");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-page-input]")).toHaveValue(
    displayMode === "double" ? "6" : "5",
  );
});

test("analytics separa telemetria da política de som e cobre o spread visível", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Reflect.set(window, "__readerEvents", []);
    window.addEventListener("olhossecos:analytics", (event) => {
      const events = Reflect.get(window, "__readerEvents") as unknown[];
      events.push((event as CustomEvent).detail);
    });
  });
  await openReader(page, 4);
  const displayMode = await page
    .locator("[data-reader-viewport]")
    .getAttribute("data-display-mode");
  const expectedVisiblePages = displayMode === "double" ? [4, 5] : [4];
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          Reflect.get(window, "__readerEvents") as Array<{
            event: string;
            page_number?: number;
          }>
        ).filter((entry) => entry.event === "page_view"),
      ),
    )
    .toEqual(
      expect.arrayContaining(
        expectedVisiblePages.map((pageNumber) =>
          expect.objectContaining({ page_number: pageNumber }),
        ),
      ),
    );

  await page.locator("[data-action='toc']").click();
  await page.locator("[data-panel='toc'] [data-navigate-page='7']").click();
  await expect(page.locator("[data-page-input]")).toHaveValue("7");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          Reflect.get(window, "__readerEvents") as Array<{
            event: string;
            page_number?: number;
          }>
        ).some(
          (entry) => entry.event === "page_turn" && entry.page_number === 7,
        ),
      ),
    )
    .toBe(true);
});

test("compartilhamento remove parâmetros não autorizados", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        Reflect.set(window, "__sharedReaderUrl", data.url);
      },
    });
  });
  await page.goto(`${readerUrl}?page=4&token=segredo&email=x@example.org`, {
    waitUntil: "domcontentloaded",
  });
  await readerReady(page);
  await page.locator("[data-action='share']").click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "__sharedReaderUrl")))
    .toBe(`${new URL(page.url()).origin}${readerUrl}?page=4`);
});

test("artefatos diretos do laboratório enviam X-Robots-Tag", async ({
  request,
}) => {
  for (const path of [
    "/superficie/issues/poc/manifest.json",
    "/superficie/issues/poc/articles/duas-camadas.html",
    "/superficie/issues/poc/superficie-poc.pdf",
    "/superficie/issues/poc/pages/page-01-small.webp",
  ]) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect(response.headers()["x-robots-tag"], path).toBe(
      "noindex, nofollow, noarchive",
    );
  }
});

test("mudança de reduced motion durante a sessão troca o adapter", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openReader(page, 4);
  await expect(page.locator(".stf__block")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await expect(page.locator(".stf__block")).toHaveCount(0);
  await expect(page.locator("[data-page-input]")).toHaveValue("4");
  await expect(page.locator("[data-page-number='4']")).toBeVisible();
});

test("modos responsivos seguem o espaço útil nas larguras obrigatórias", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");
  await openReader(page, 1);
  for (const viewport of [
    { width: 320, height: 720, mode: "single" },
    { width: 375, height: 812, mode: "single" },
    { width: 390, height: 844, mode: "single" },
    { width: 768, height: 1024, mode: "single" },
    { width: 1024, height: 768, mode: "double" },
    { width: 1440, height: 1000, mode: "double" },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator("[data-reader-viewport]")).toHaveAttribute(
      "data-display-mode",
      viewport.mode,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("arraste visual vira a página sem interceptar a text layer", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");
  await openReader(page, 1);
  const viewport = await page.locator("[data-reader-viewport]").boundingBox();
  expect(viewport).not.toBeNull();
  if (!viewport) return;
  const y = viewport.y + viewport.height / 2;
  await page.mouse.move(viewport.x + viewport.width - 24, y);
  await page.mouse.down();
  await page.mouse.move(viewport.x + viewport.width * 0.2, y, { steps: 16 });
  await page.mouse.up();
  await expect(page.locator("[data-page-input]")).toHaveValue("2", {
    timeout: 4_000,
  });
});

test("deep link é persistido mesmo sem virar a página", async ({ page }) => {
  await openReader(page, 5);
  await page.evaluate(() =>
    window.history.replaceState({}, "", window.location.pathname),
  );
  await page.reload();
  await readerReady(page);
  await expect(page.locator("[data-resume-banner]")).toContainText(
    "Continuar da página 5",
  );
});

test("modo texto troca o conteúdo ao navegar entre artigos", async ({
  page,
}) => {
  await page.route("**/superficie/issues/poc/manifest.json", async (route) => {
    const response = await route.fetch();
    const manifest = await response.json();
    manifest.pages = manifest.pages.map(
      (entry: { number: number; articleId?: string }) => ({
        ...entry,
        articleId:
          entry.number === 4
            ? "artigo-a"
            : entry.number === 6
              ? "artigo-b"
              : undefined,
      }),
    );
    manifest.articles = [
      {
        id: "artigo-a",
        title: "Artigo A",
        pages: [4],
        htmlPath: "/superficie/issues/poc/articles/artigo-a.html",
      },
      {
        id: "artigo-b",
        title: "Artigo B",
        pages: [6],
        htmlPath: "/superficie/issues/poc/articles/artigo-b.html",
      },
    ];
    await route.fulfill({ response, json: manifest });
  });
  await page.route("**/articles/artigo-a.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<article><h1>Artigo A</h1></article>",
    }),
  );
  await page.route("**/articles/artigo-b.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<article><h1>Artigo B</h1></article>",
    }),
  );

  await openReader(page, 4);
  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Artigo A",
  );
  await page.locator("[data-panel='text'] [data-close-panel]").click();
  await page.locator("[data-page-input]").fill("6");
  await page
    .locator("[data-page-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator("[data-page-input]")).toHaveValue("6");
  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Artigo B",
  );
});

test("resposta tardia não reidrata text layer fora da janela", async ({
  page,
}) => {
  let pageFourRequests = 0;
  await page.route("**/text/page-04.json", async (route) => {
    pageFourRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await openReader(page, 1);
  await page.locator("[data-page-input]").fill("4");
  await page
    .locator("[data-page-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator("[data-page-input]")).toHaveValue("4");
  await page.locator("[data-page-input]").fill("8");
  await page
    .locator("[data-page-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator("[data-page-input]")).toHaveValue("8");
  await page.waitForTimeout(900);
  await expect(
    page.locator("[data-page-number='4'] [data-text-block]"),
  ).toHaveCount(0);
  await page.locator("[data-page-input]").fill("4");
  await page
    .locator("[data-page-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(
    page.locator("[data-page-number='4'] [data-text-block]"),
  ).not.toHaveCount(0);
  expect(pageFourRequests).toBe(2);
});

test("toolbar minimizada remove controles ocultos do teclado", async ({
  page,
}) => {
  await openReader(page, 1);
  await page.locator("[data-action='search']").click();
  const minimize = page.locator("[data-action='minimize']");
  await minimize.evaluate((button: HTMLButtonElement) => button.click());
  await expect(
    page.locator(".reader-toolbar .toolbar-item:not(:disabled)"),
  ).toHaveCount(0);
  await expect(
    page.locator(".reader-toolbar .toolbar-item:not([aria-hidden='true'])"),
  ).toHaveCount(0);
  await expect(page.locator("[data-panel='search']")).toBeHidden();
  await expect(minimize).toBeFocused();
  await expect(minimize).toHaveAttribute("aria-label", "Expandir ferramentas");
});

test("resposta lenta de artigo não sobrescreve o artigo atual", async ({
  page,
}) => {
  let releaseArticleA: () => void = () => undefined;
  const articleAGate = new Promise<void>((resolve) => {
    releaseArticleA = resolve;
  });
  await page.route("**/superficie/issues/poc/manifest.json", async (route) => {
    const response = await route.fetch();
    const manifest = await response.json();
    manifest.pages = manifest.pages.map(
      (entry: { number: number; articleId?: string }) => ({
        ...entry,
        articleId:
          entry.number === 4
            ? "artigo-lento"
            : entry.number === 6
              ? "artigo-atual"
              : undefined,
      }),
    );
    manifest.articles = [
      {
        id: "artigo-lento",
        title: "Artigo lento",
        pages: [4],
        htmlPath: "/superficie/issues/poc/articles/artigo-lento.html",
      },
      {
        id: "artigo-atual",
        title: "Artigo atual",
        pages: [6],
        htmlPath: "/superficie/issues/poc/articles/artigo-atual.html",
      },
    ];
    await route.fulfill({ response, json: manifest });
  });
  await page.route("**/articles/artigo-lento.html", async (route) => {
    await articleAGate;
    await route.fulfill({
      contentType: "text/html",
      body: "<article><h1>Artigo lento</h1></article>",
    });
  });
  await page.route("**/articles/artigo-atual.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<article><h1>Artigo atual</h1></article>",
    }),
  );

  await openReader(page, 4);
  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await page.locator("[data-panel='text'] [data-close-panel]").click();
  await page.locator("[data-page-input]").fill("6");
  await page
    .locator("[data-page-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Artigo atual",
  );
  releaseArticleA();
  await page.waitForTimeout(300);
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Artigo atual",
  );
});

test("fullscreen rejeitado usa fallback na janela", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value: () =>
        Promise.reject(new DOMException("Negado", "NotAllowedError")),
    });
  });
  await openReader(page, 1);
  await page.locator("[data-action='fullscreen']").click();
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-simulated-fullscreen",
    "true",
  );
});

async function openReader(page: Page, pageNumber: number): Promise<void> {
  await page.goto(`${readerUrl}?page=${pageNumber}`, {
    waitUntil: "domcontentloaded",
  });
  await readerReady(page);
}

async function readerReady(page: Page): Promise<void> {
  await expect(page.locator("[data-reader-loading]")).toBeHidden({
    timeout: 12_000,
  });
  await expect(page.locator("[data-reader-viewport]")).toHaveAttribute(
    "aria-busy",
    "false",
  );
}

async function selectText(
  page: Page,
  selector: string,
  exact: string,
): Promise<void> {
  await page.locator(selector).evaluate((element, selectedText) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent ?? "";
      const start = text.indexOf(selectedText);
      if (start >= 0) {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, start + selectedText.length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        return;
      }
      node = walker.nextNode();
    }
    throw new Error(`Texto não encontrado: ${selectedText}`);
  }, exact);
}
