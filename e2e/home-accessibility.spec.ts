import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("consolida jornadas e explicita a fonte do mecanismo", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator(".journeys")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /TFOS DEWS III.*fonte científica/iu }),
    ).toBeVisible();
  });

  test("explorador anatômico oferece navegação completa por teclado", async ({
    page,
  }) => {
    await page.goto("/");

    const tablist = page.getByRole("tablist", {
      name: "Estruturas da superfície ocular",
    });
    const firstTab = tablist.getByRole("tab").first();
    const secondTab = tablist.getByRole("tab").nth(1);

    await expect(firstTab).toHaveAttribute("aria-selected", "true");
    await expect(firstTab).toHaveAttribute("tabindex", "0");
    await expect(secondTab).toHaveAttribute("tabindex", "-1");

    await firstTab.focus();
    await firstTab.press("ArrowRight");

    await expect(secondTab).toBeFocused();
    await expect(secondTab).toHaveAttribute("aria-selected", "true");
    await expect(secondTab).toHaveAttribute("tabindex", "0");
    await expect(firstTab).toHaveAttribute("tabindex", "-1");
    await expect(page.locator("#detail-cornea")).toBeVisible();
    await expect(page.locator("[data-pin-id='cornea']")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("metadados do hero não deixam separador órfão no mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const separatorContent = await page
      .locator(".ecosystem-line span")
      .nth(1)
      .evaluate((element) => getComputedStyle(element, "::before").content);
    expect(separatorContent).toBe("none");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  });
});
