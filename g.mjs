import { chromium } from "playwright";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4461/guias/olho-seco-o-essencial", { waitUntil: "networkidle" });
console.log(await p.evaluate(() => {
  const ps = [...document.querySelectorAll("p")].filter((e) => e.offsetParent && e.textContent.trim().length > 80);
  return ps.slice(0, 4).map((e) => {
    const cs = getComputedStyle(e);
    return `${Math.round(e.getBoundingClientRect().width)}px ${cs.fontSize} pai=${e.parentElement.tagName.toLowerCase()}.${(e.parentElement.className||"").toString().split(" ")[0]}`;
  });
}));
await nav.close();
