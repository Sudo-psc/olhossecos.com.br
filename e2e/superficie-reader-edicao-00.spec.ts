import { expect, test, type Page } from "@playwright/test";

const readerUrl = "/superficie/lab/edicao-00";
const landingUrl = "/superficie/edicao-00";

test("edicao-00 abre na página 4, busca DGM e resolve o H1 no modo texto", async ({
  page,
}) => {
  await page.goto(`${readerUrl}?page=4`, { waitUntil: "domcontentloaded" });
  await readerReady(page);
  await expect(page.locator("[data-page-input]")).toHaveValue("4");
  await expect(page.locator("[data-page-count]")).toHaveText("27");
  await expect(page.locator("[data-reader-brand-line]")).toContainText(
    "A nova era da superfície ocular",
  );

  await page.locator("[data-action='search']").click();
  await page.locator("#reader-search").fill("fenotipar melhor");
  await page
    .locator("[data-search-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  const result = page.locator("[data-search-results] [data-navigate-page='4']");
  await expect(result).toContainText("página 4");

  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Além da obstrução: a biologia molecular da DGM",
  );
});

test("lab edicao-00 cabe a página no viewport e remove as páginas type=ad", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(readerUrl, { waitUntil: "domcontentloaded" });
  await readerReady(page);

  await expect(page.locator("[data-page-count]")).toHaveText("27");
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-zoom-mode",
    "fit-page",
  );

  const overflow = await page.evaluate(() => {
    const root = document.querySelector("[data-magazine-reader]");
    const stage = document.querySelector(".reader-stage");
    if (!(root instanceof HTMLElement) || !(stage instanceof HTMLElement)) {
      return { horizontal: true, cropped: true };
    }
    const pages = Array.from(
      stage.querySelectorAll<HTMLElement>(
        ".magazine-page[data-simple-visible], .stf__item",
      ),
    );
    const stageBox = stage.getBoundingClientRect();
    const pageBoxes = pages.map((node) => node.getBoundingClientRect());
    return {
      horizontal: root.scrollWidth > root.clientWidth + 1,
      cropped: pageBoxes.some(
        (box) =>
          box.width > stageBox.width + 2 || box.height > stageBox.height + 2,
      ),
    };
  });
  expect(overflow.horizontal).toBe(false);
  expect(overflow.cropped).toBe(false);

  await page.locator("[data-action='thumbnails']").click();
  const thumbs = page.locator("[data-thumbnail-list] img");
  await expect(thumbs).toHaveCount(27);
  await expect(page.locator("[data-thumbnail-list]")).not.toContainText(
    "PUBLICIDADE",
  );
});

test("barras do lab são ocultáveis, recuperáveis e usáveis pelo teclado", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(readerUrl, { waitUntil: "domcontentloaded" });
  await readerReady(page);

  const hide = page.locator("[data-action='hide-chrome']");
  const restore = page.locator("[data-action='show-chrome']");
  await hide.click();
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-chrome-hidden",
    "true",
  );
  await expect(restore).toBeVisible();
  await expect(restore).toBeFocused();
  await expect(page.locator(".reader-header")).toHaveAttribute("inert", "");

  await page.keyboard.press("Escape");
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-chrome-hidden",
    "false",
  );
  await expect(hide).toBeFocused();

  await page.keyboard.press("h");
  await expect(restore).toBeFocused();
  await page.locator("#superficie-reader").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-page-input]")).toHaveValue("2");
  await expect(page.locator("[data-reader-live]")).toContainText(/Página 2/u);
});

test("landing /superficie/edicao-00 permanece fora do flipbook", async ({
  page,
}) => {
  await page.goto(landingUrl, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-magazine-reader]")).toHaveCount(0);
  await expect(page.locator("[data-reader-viewport]")).toHaveCount(0);
  await expect(page).toHaveURL(/\/superficie\/edicao-00\/?$/u);
});

test("lab respeita prefers-reduced-motion sem perder a página visível", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(readerUrl, { waitUntil: "domcontentloaded" });
  await readerReady(page);
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await expect(page.locator("[data-page-input]")).toHaveValue("1");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-page-input]")).toHaveValue("2");
});

async function readerReady(page: Page): Promise<void> {
  await expect(page.locator("[data-reader-loading]")).toBeHidden({
    timeout: 12_000,
  });
  await expect(page.locator("[data-reader-viewport]")).toHaveAttribute(
    "aria-busy",
    "false",
  );
}
