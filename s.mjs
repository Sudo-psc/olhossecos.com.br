import { chromium } from "playwright";
const nav = await chromium.launch();
for (const [nome, url] of [["home","/"],["profissional","/profissional"],
  ["superficie","/superficie"],["artigo","/superficie/artigos/tfos-dews-iii-na-pratica"],
  ["guia","/guias/olho-seco-o-essencial"]]) {
  for (const [rot, w, h] of [["desktop",1512,950],["mobile",390,844]]) {
    const ctx = await nav.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.goto("http://127.0.0.1:4459" + url, { waitUntil: "networkidle" });
    await p.screenshot({ path: `${process.argv[2]}/${nome}-${rot}.png` });
    await ctx.close();
  }
}
await nav.close();
console.log("ok");
