import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const baseUrl = "http://127.0.0.1:4328/superficie/lab/flipbook";
const output = path.resolve("docs/qa/superficie-poc/screenshots");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

await captureDesktop();
await captureMobile();
await captureTablet("tablet-portrait", { width: 768, height: 1024 });
await captureTablet("tablet-landscape", { width: 1024, height: 768 });

await browser.close();

async function captureDesktop() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  await open(page, 1);
  await shot(page, "desktop-cover.png");

  await goTo(page, 4);
  await shot(page, "desktop-double-page.png");

  await page.locator("[data-action='search']").click();
  await page.locator("#reader-search").fill("camada visual");
  await page
    .locator("[data-search-form]")
    .evaluate((form) => form.requestSubmit());
  await shot(page, "desktop-search.png");
  await page.locator("[data-panel='search'] [data-close-panel]").click();

  await selectText(
    page,
    "[data-page-number='4'] [data-text-block='page-4-paragraph-2']",
    "camada visual",
  );
  await page.locator("[data-highlight-color='yellow']").click();
  await shot(page, "desktop-highlight.png");

  await goTo(page, 2);
  await page.locator("[data-action='next']").click();
  await page.waitForTimeout(240);
  await shot(page, "desktop-page-turn.png");
  await page.waitForTimeout(650);

  await page.locator("[data-action='fullscreen']").click();
  await page.waitForTimeout(250);
  await shot(page, "desktop-fullscreen.png");
  await context.close();
}

async function captureMobile() {
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await open(page, 1);
  await shot(page, "mobile-cover.png");
  await shot(page, "mobile-toolbar.png");

  await page.locator("[data-action='search']").click();
  await page.locator("#reader-search").fill("camada visual");
  await page
    .locator("[data-search-form]")
    .evaluate((form) => form.requestSubmit());
  await shot(page, "mobile-search.png");
  await page.locator("[data-panel='search'] [data-close-panel]").click();

  await goTo(page, 4);
  await selectText(
    page,
    "[data-page-number='4'] [data-text-block='page-4-paragraph-2']",
    "camada visual",
  );
  await page.locator("[data-highlight-color='yellow']").click();
  await shot(page, "mobile-highlight.png");
  await context.close();
}

async function captureTablet(name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await open(page, 4);
  await shot(page, `${name}.png`);
  await context.close();
}

async function open(page, pageNumber) {
  await page.goto(`${baseUrl}?page=${pageNumber}`, {
    waitUntil: "domcontentloaded",
  });
  await page
    .locator("[data-reader-loading]")
    .waitFor({ state: "hidden", timeout: 12_000 });
  await page.locator("[data-reader-viewport][aria-busy='false']").waitFor();
  await page.waitForTimeout(350);
}

async function goTo(page, pageNumber) {
  await page.locator("[data-page-input]").fill(String(pageNumber));
  await page
    .locator("[data-page-form]")
    .evaluate((form) => form.requestSubmit());
  await page.locator("[data-page-input]").waitFor();
  await page.waitForFunction(
    (expected) =>
      document.querySelector("[data-page-input]")?.value === String(expected),
    pageNumber,
  );
  await page.waitForTimeout(300);
}

async function shot(page, filename) {
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
}

async function selectText(page, selector, exact) {
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
