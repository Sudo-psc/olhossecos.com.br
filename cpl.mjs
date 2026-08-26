import { chromium } from "playwright";
const base = "http://127.0.0.1:4459";
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1512, height: 900 } });
const p = await ctx.newPage();
for (const [nome, url] of [
  ["artigo", "/superficie/artigos/tfos-dews-iii-na-pratica"],
  ["guia", "/guias/olho-seco-o-essencial"],
  ["paciente", "/paciente"],
]) {
  await p.goto(base + url, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    // o parágrafo de corpo = o <p> mais repetido, com mais texto
    const ps = [...document.querySelectorAll("p")].filter(
      (e) => e.offsetParent && e.textContent.trim().length > 60);
    const grupos = new Map();
    for (const el of ps) {
      const cs = getComputedStyle(el);
      const chave = `${cs.fontSize}|${Math.round(el.getBoundingClientRect().width)}|${cs.fontFamily.split(",")[0]}`;
      grupos.set(chave, (grupos.get(chave) ?? 0) + 1);
    }
    const [chave, n] = [...grupos.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    if (!chave) return null;
    const [fs, w, fam] = chave.split("|");
    const el = ps.find((e) => {
      const cs = getComputedStyle(e);
      return cs.fontSize === fs && Math.round(e.getBoundingClientRect().width) === Number(w);
    });
    const cs = getComputedStyle(el);
    const cv = document.createElement("canvas").getContext("2d");
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const amostra = "abcdefghijklmnopqrstuvwxyz aeiou de da do que para com uma na";
    const media = cv.measureText(amostra).width / amostra.length;
    return { fs, w: Number(w), fam, n, cpl: Math.round(Number(w) / media),
             maxWidth: cs.maxWidth, lh: cs.lineHeight };
  });
  console.log(r ? `${nome.padEnd(9)} ${String(r.cpl).padStart(3)} cpl  ${r.w}px  ${r.fs}/${r.lh}  max-width:${r.maxWidth}  (${r.n} parágrafos)` : `${nome}: nada`);
}
await nav.close();
