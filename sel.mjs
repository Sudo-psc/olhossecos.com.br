import { chromium } from "playwright";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
for (const [nome, url, sel] of [
  ["artigo", "/superficie/artigos/tfos-dews-iii-na-pratica", ".article-section p"],
  ["guia", "/guias/olho-seco-o-essencial", "p"],
]) {
  await p.goto("http://127.0.0.1:4459" + url, { waitUntil: "networkidle" });
  const r = await p.evaluate((sel) => {
    const ps = [...document.querySelectorAll(sel)].filter(
      (e) => e.offsetParent && e.textContent.trim().length > 100);
    if (!ps.length) return null;
    const el = ps[0];
    const cadeia = [];
    let n = el;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      cadeia.push(`${n.tagName.toLowerCase()}${n.className ? "." + n.className.toString().trim().split(/\s+/)[0] : ""} w=${Math.round(n.getBoundingClientRect().width)} max=${cs.maxWidth}`);
      n = n.parentElement;
    }
    return { total: ps.length, cadeia: cadeia.slice(0, 5) };
  }, sel);
  console.log(`\n=== ${nome} (${r?.total ?? 0} parágrafos) ===`);
  r?.cadeia.forEach((l) => console.log("  " + l));
}
await nav.close();
