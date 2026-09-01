import { expect, test, type Page } from "@playwright/test";

const readerUrl = "/superficie/lab/edicao-00";

test("first paint da edição 00 mostra a capa sem chrome de espera", async ({
  page,
}) => {
  await page.goto(readerUrl, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-page-count]")).toHaveText("34");
  await expect(
    page.locator("[data-ssr-cover] img, [data-page-number='1'] img").first(),
  ).toBeVisible();
  await expect(page.getByText("Preparando edição")).toHaveCount(0);
  await expect(
    page.getByText("Não foi possível iniciar a animação de páginas"),
  ).toHaveCount(0);
  await expect(page.getByText("Reader Prototype")).toHaveCount(0);
  await expect(page.locator("[data-resume-banner]")).toBeHidden();
});

test("toast de resume fica no chrome e o × persiste a escolha", async ({
  page,
}) => {
  await page.goto(readerUrl, { waitUntil: "domcontentloaded" });
  await readerReady(page);
  await expect(page.locator("[data-resume-banner]")).toBeHidden();

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("superficie-reader", 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("progress", "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore("progress").put({
          issueId: "edicao-00",
          page: 2,
          percent: 6,
          updatedAt: new Date().toISOString(),
        });
      };
    });
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await readerReady(page);
  await expect(page.locator("[data-resume-banner]")).toBeHidden();
  await page.keyboard.press("Shift");
  const banner = page.locator("[data-resume-banner]");
  await expect(banner).toBeVisible();
  await expect(page.locator("[data-resume-copy]")).toHaveText(
    "Continuar da página 2?",
  );

  const bannerBox = await banner.boundingBox();
  const coverBox = await page
    .locator("[data-ssr-cover] img, [data-page-number='1'] img")
    .first()
    .boundingBox();
  expect(bannerBox).toBeTruthy();
  expect(coverBox).toBeTruthy();
  expect(bannerBox!.y).toBeGreaterThan(coverBox!.y + coverBox!.height * 0.45);

  await banner.locator("[data-action='dismiss-resume']").click();
  await expect(banner).toBeHidden();

  await page.reload({ waitUntil: "domcontentloaded" });
  await readerReady(page);
  await page.keyboard.press("Shift");
  await expect(banner).toBeHidden();
});

test("edicao-00 abre na página 5, busca DGM e resolve o H1 no modo texto", async ({
  page,
}) => {
  await page.goto(`${readerUrl}?page=5`, { waitUntil: "domcontentloaded" });
  await readerReady(page);
  await expect(page.locator("[data-page-input]")).toHaveValue("5");
  await expect(page.locator("[data-reader-brand-line]")).toContainText(
    "A nova era da superfície ocular",
  );

  await page.locator("[data-action='search']").click();
  await page.locator("#reader-search").fill("fenotipar melhor");
  await page
    .locator("[data-search-form]")
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  const result = page.locator("[data-search-results] [data-navigate-page='5']");
  await expect(result).toContainText("página 5");

  await page.locator(".reader-toolbar [data-action='text-mode']").click();
  await expect(page.locator("[data-text-mode-content] h1")).toHaveText(
    "Além da obstrução: a biologia molecular da DGM",
  );
});

async function readerReady(page: Page): Promise<void> {
  await expect(page.locator("[data-reader-viewport]")).toHaveAttribute(
    "aria-busy",
    "false",
    { timeout: 12_000 },
  );
  await expect(page.locator("[data-magazine-reader]")).toHaveAttribute(
    "data-reader-storage",
    "ready",
    { timeout: 12_000 },
  );
  await expect(
    page.locator("[data-ssr-cover], [data-page-number]").first(),
  ).toBeVisible();
}
