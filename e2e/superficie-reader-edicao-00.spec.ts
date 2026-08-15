import { expect, test, type Page } from "@playwright/test";

const readerUrl = "/superficie/lab/edicao-00";

test("edicao-00 abre na página 4, busca DGM e resolve o H1 no modo texto", async ({
  page,
}) => {
  await page.goto(`${readerUrl}?page=4`, { waitUntil: "domcontentloaded" });
  await readerReady(page);
  await expect(page.locator("[data-page-input]")).toHaveValue("4");
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

async function readerReady(page: Page): Promise<void> {
  await expect(page.locator("[data-reader-loading]")).toBeHidden({
    timeout: 12_000,
  });
  await expect(page.locator("[data-reader-viewport]")).toHaveAttribute(
    "aria-busy",
    "false",
  );
}
