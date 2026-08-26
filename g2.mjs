import { chromium } from "playwright";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4461/guias/olho-seco-o-essencial", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("main p, main li, .article-prose *")) {
    if (!el.offsetParent) continue;
    const t = el.textContent.trim();
    if (t.length < 60 || el.children.length) continue;
    const cs = getComputedStyle(el);
    out.push(`${el.tagName.toLowerCase()} ${Math.round(el.getBoundingClientRect().width)}px ${cs.fontSize} — ${t.slice(0,34)}`);
  }
  return out.slice(0, 6);
}));
await nav.close();
