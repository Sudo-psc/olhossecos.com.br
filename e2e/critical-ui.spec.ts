import { expect, test } from "@playwright/test";

const externalBaseUrl = process.env.CRITICAL_UI_BASE_URL?.replace(/\/$/u, "");
const route = (path: string) =>
  externalBaseUrl ? `${externalBaseUrl}${path}` : path;

test.describe("regressões críticas da interface", () => {
  test("tooltips do glossário permanecem dentro da viewport mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route("/olho-seco"));

    const triggers = page.locator(".glossary-term-trigger");
    await expect(triggers.first()).toBeVisible();
    expect(await triggers.count()).toBeGreaterThan(0);

    for (let index = 0; index < (await triggers.count()); index += 1) {
      await triggers.nth(index).scrollIntoViewIfNeeded();
      await triggers.nth(index).click();
      const tooltip = page.locator(".glossary-tooltip-card").nth(index);
      await expect(tooltip).toBeVisible();
      const box = await tooltip.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(16);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(374);
      await triggers.nth(index).click();
    }

    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(documentWidth).toBeLessThanOrEqual(390);
  });

  test("metadados de leitura dos Guias atendem contraste AA", async ({
    page,
  }) => {
    await page.goto(route("/guias"));
    const ratio = await page
      .locator(".guide-list small")
      .first()
      .evaluate((element) => {
        const parse = (value: string) =>
          value
            .match(/[\d.]+/gu)
            ?.slice(0, 3)
            .map(Number) ?? [0, 0, 0];
        const luminance = (rgb: number[]) => {
          const channels = rgb.map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return (
            0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
          );
        };
        const foreground = luminance(parse(getComputedStyle(element).color));
        const background = luminance(
          parse(getComputedStyle(document.body).backgroundColor),
        );
        return (background + 0.05) / (foreground + 0.05);
      });

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test("link da Edição Fundadora oferece alvo de toque confortável", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route("/superficie/edicoes"));
    const link = page.getByRole("link", {
      name: "Conhecer a Edição Fundadora",
    });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("miniaturas do Reader reservam espaço antes do carregamento", async ({
    page,
  }) => {
    await page.goto(route("/superficie/lab/edicao-00"));
    await expect(page.locator("[data-page-total]")).toContainText("34", {
      timeout: 15_000,
    });
    await page.locator("[data-action='thumbnails']").click();

    const thumbnails = page.locator("[data-thumbnail-list] img");
    await expect(thumbnails).toHaveCount(34);
    const dimensions = await thumbnails.evaluateAll((images) =>
      images.map((image) => ({
        width: image.getAttribute("width"),
        height: image.getAttribute("height"),
      })),
    );
    expect(dimensions).toEqual(
      Array.from({ length: 34 }, () => ({ width: "180", height: "255" })),
    );
  });

  test("Reader mantém o carregamento inicial abaixo do limite de CLS", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      const state = window as Window & { __readerLayoutShifts?: number };
      state.__readerLayoutShifts = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput) {
            state.__readerLayoutShifts =
              (state.__readerLayoutShifts ?? 0) + shift.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(route("/superficie/lab/edicao-00"), {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(500);
    const cls = await page.evaluate(
      () =>
        (window as Window & { __readerLayoutShifts?: number })
          .__readerLayoutShifts ?? 0,
    );
    expect(cls).toBeLessThanOrEqual(0.1);
  });
});
