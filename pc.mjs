import { chromium } from "playwright";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4464/paciente", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const g = new Map();
  for (const el of document.querySelectorAll("p")) {
    if (!el.offsetParent || el.textContent.trim().length < 90) continue;
    const cs = getComputedStyle(el);
    const k = `${cs.fontSize} ${Math.round(el.getBoundingClientRect().width)}px`;
    g.set(k, (g.get(k) ?? 0) + 1);
  }
  return [...g.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);
}));
await nav.close();
