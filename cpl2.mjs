import { chromium } from "playwright";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
const medir = async (url, sel, minLen = 150) => {
  await p.goto("http://127.0.0.1:4465" + url, { waitUntil: "networkidle" });
  return p.evaluate(({ sel, minLen }) => {
    const el = [...document.querySelectorAll(sel)].find(
      (e) => e.offsetParent && e.textContent.trim().length > minLen);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const cv = document.createElement("canvas").getContext("2d");
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const a = "abcdefghijklmnopqrstuvwxyz aeiou de da do que para com uma na";
    const m = cv.measureText(a).width / a.length;
    const w = el.getBoundingClientRect().width;
    return { cpl: Math.round(w / m), w: Math.round(w), fs: cs.fontSize };
  }, { sel, minLen });
};
for (const [nome, url, sel, n] of [
  ["artigo   ", "/superficie/artigos/tfos-dews-iii-na-pratica", ".article-section p", 200],
  ["guia     ", "/guias/olho-seco-guia-essencial", ".article-prose p", 100],
  ["paciente ", "/paciente", "main p", 100],
  ["sintomas ", "/sintomas", "main p", 100],
]) {
  const r = await medir(url, sel, n);
  console.log(r ? `${nome} ${String(r.cpl).padStart(3)} cpl   ${r.w}px   ${r.fs}` : `${nome} — não encontrado`);
}
await nav.close();
