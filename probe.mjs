import { chromium } from "playwright";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:4459/superficie/artigos/tfos-dews-iii-na-pratica", { waitUntil: "networkidle" });
const r = await p.evaluate(() => {
  const el = [...document.querySelectorAll(".article-section p")].find(
    (e) => e.offsetParent && e.textContent.trim().length > 200);
  const cs = getComputedStyle(el);
  const cv = document.createElement("canvas").getContext("2d");
  cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const amostra = "abcdefghijklmnopqrstuvwxyz aeiou de da do que para com uma na";
  const media = cv.measureText(amostra).width / amostra.length;
  const zero = cv.measureText("0").width;
  const alvo = (n) => Math.round(n * media);
  return {
    fonte: cs.fontSize, larguraAtual: Math.round(el.getBoundingClientRect().width),
    mediaGlifo: media.toFixed(2), ch: zero.toFixed(2),
    cplAtual: Math.round(el.getBoundingClientRect().width / media),
    px_para_65: alvo(65), px_para_68: alvo(68), px_para_72: alvo(72),
    ch_equivalente_68cpl: (alvo(68) / zero).toFixed(1),
  };
});
console.log(r);
await nav.close();
