#!/usr/bin/env node
// Auditoria de frontend com nota de 0 a 10 por categoria.
//
// Mede o que dá para medir num navegador real, em vez de opinar: contraste
// efetivo, anel de foco, overflow horizontal, CLS, hierarquia de headings,
// imagens, alvos de toque e metadados. Cada categoria vira uma nota e uma
// lista de achados priorizados para aprovação humana.
//
//   node skills/frontend-review/driver.mjs --base http://127.0.0.1:44501
//   node skills/frontend-review/driver.mjs --base https://olhossecos.com.br \
//     --routes /,/sintomas --viewports 1440x900,390x844 --json relatorio.json
//
// Sai com código 1 se a nota geral ficar abaixo de --min (padrão 7).

import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";

// ---------------------------------------------------------------- argumentos

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i];
  if (a.startsWith("--")) args.set(a.slice(2), process.argv[++i] ?? "true");
}

const BASE = args.get("base") ?? "http://127.0.0.1:44501";
const ROUTES = (args.get("routes") ?? "/").split(",").filter(Boolean);
const VIEWPORTS = (args.get("viewports") ?? "1440x900,390x844")
  .split(",")
  .map((v) => {
    const [w, h] = v.split("x").map(Number);
    return { width: w, height: h, label: v };
  });
const MIN = Number(args.get("min") ?? 7);
const JSON_OUT = args.get("json");
const SHOTS = args.get("shots"); // diretório para capturas por rota/viewport

// ------------------------------------------------------------------- helpers

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Nota 0-10 a partir da razão de acertos, penalizando achados graves. */
const notaDe = (ok, total, graves = 0) => {
  if (total === 0) return null;
  const base = (ok / total) * 10;
  return clamp(Number((base - graves * 1.5).toFixed(1)), 0, 10);
};

const achados = [];
const registrar = (severidade, categoria, rota, viewport, mensagem, detalhe) =>
  achados.push({ severidade, categoria, rota, viewport, mensagem, detalhe });

// Funções injetadas no navegador. Ficam em string única para rodar via
// page.evaluate sem depender de bundling.
const AUDITORIA_NO_NAVEGADOR = () => {
  // --- cor --------------------------------------------------------------
  const parse = (c) => {
    const m = c.match(/[\d.]+/g);
    if (!m) return null;
    const [r, g, b, a = 1] = m.map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const f = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  };
  const razao = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  /** Sobe na árvore até achar fundo opaco. Retorna null se houver imagem. */
  const fundoEfetivo = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a === 1) return bg;
      node = node.parentElement;
    }
    const body = parse(getComputedStyle(document.body).backgroundColor);
    return body && body.a === 1 ? body : { r: 255, g: 255, b: 255, a: 1 };
  };

  const visivel = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return (
      r.width > 0 &&
      r.height > 0 &&
      cs.visibility !== "hidden" &&
      cs.display !== "none" &&
      Number(cs.opacity) > 0.1
    );
  };

  // --- contraste de texto ----------------------------------------------
  const contraste = { ok: 0, falhas: [], naoVerificavel: 0 };
  const alvos = document.querySelectorAll(
    "p, li, a, span, h1, h2, h3, h4, h5, h6, button, label, small, dd, dt, figcaption, td, th",
  );
  for (const el of alvos) {
    if (!visivel(el)) continue;
    // A WCAG 1.4.3 isenta componente de interface inativo. O cinza de um
    // botão desabilitado É o sinal de que ele está desabilitado; "corrigir"
    // o contraste apagaria a informação que o estado carrega.
    if (el.closest(":disabled, [aria-disabled='true'], fieldset:disabled"))
      continue;
    const texto = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join("");
    if (texto.length < 3) continue;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    const bg = fundoEfetivo(el);
    if (!fg || !bg) {
      contraste.naoVerificavel += 1;
      continue;
    }
    const px = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const grande = px >= 24 || (px >= 18.66 && bold);
    const exigido = grande ? 3 : 4.5;
    const r = razao(fg, bg);
    if (r + 0.05 < exigido) {
      contraste.falhas.push({
        seletor:
          el.tagName.toLowerCase() +
          (el.className ? "." + String(el.className).split(" ")[0] : ""),
        texto: texto.slice(0, 48),
        razao: Number(r.toFixed(2)),
        exigido,
      });
    } else {
      contraste.ok += 1;
    }
  }

  // --- headings ---------------------------------------------------------
  const niveis = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
    Number(h.tagName[1]),
  );
  let saltos = 0;
  for (let i = 1; i < niveis.length; i += 1) {
    if (niveis[i] - niveis[i - 1] > 1) saltos += 1;
  }
  const headings = {
    total: niveis.length,
    h1: niveis.filter((n) => n === 1).length,
    saltos,
  };

  // --- imagens ----------------------------------------------------------
  const imgs = [...document.images];
  const imagens = {
    total: imgs.length,
    semAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
    semDimensao: imgs.filter(
      (i) => !i.getAttribute("width") || !i.getAttribute("height"),
    ).length,
    // A largura real vem do descritor `w` do srcset, não de naturalWidth:
    // o Chrome headless sub-reporta naturalWidth para AVIF (mede 780 num
    // arquivo de 1200), o que geraria falso positivo em toda imagem AVIF.
    subdimensionadas: imgs
      .map((i) => {
        const escolhido = (i.currentSrc || i.src).split("/").pop();
        const fontes = [
          ...[...(i.parentElement?.querySelectorAll("source") ?? [])].map(
            (s) => s.srcset,
          ),
          i.getAttribute("srcset") ?? "",
        ].join(",");
        const entrada = fontes
          .split(",")
          .map((s) => s.trim())
          .find((s) => s.startsWith(escolhido) || s.includes("/" + escolhido));
        const larguraReal = entrada
          ? Number(entrada.match(/(\d+)w/)?.[1])
          : null;
        const precisa = Math.round(
          i.getBoundingClientRect().width * devicePixelRatio,
        );
        return { escolhido, larguraReal, precisa };
      })
      .filter(
        (x) => x.larguraReal && x.precisa && x.larguraReal < x.precisa * 0.9,
      )
      .map((x) => ({
        src: x.escolhido.slice(0, 46),
        natural: x.larguraReal,
        precisa: x.precisa,
      })),
  };

  // --- alvos de toque ---------------------------------------------------
  // WCAG 2.5.8 isenta link inline em texto corrido do tamanho mínimo — sem
  // essa exceção todo link dentro de parágrafo vira achado e o relatório
  // afoga o problema real em ruído.
  const inlineEmTexto = (el) => {
    if (el.tagName !== "A") return false;
    const pai = el.parentElement;
    if (!pai) return false;
    return (
      /^(P|LI|SPAN|SMALL|TD|DD|FIGCAPTION|BLOCKQUOTE|STRONG|EM)$/.test(
        pai.tagName,
      ) && getComputedStyle(el).display.startsWith("inline")
    );
  };
  // O alvo de um controle rotulado é o rótulo inteiro: clicar no texto de um
  // <label> aciona o input dentro dele. Medir só a caixa do input acusa um
  // checkbox de 18px que na prática tem a área do rótulo.
  const caixaEfetiva = (el) => {
    const proprio = el.getBoundingClientRect();
    if (!/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return proprio;
    const rotulo =
      el.closest("label") ??
      (el.id
        ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
        : null);
    if (!rotulo) return proprio;
    const r = rotulo.getBoundingClientRect();
    return r.width >= proprio.width && r.height >= proprio.height ? r : proprio;
  };
  const interativos = [
    ...document.querySelectorAll(
      "a, button, input, select, textarea, [role=button]",
    ),
  ].filter((el) => visivel(el) && !inlineEmTexto(el));
  const pequenos = interativos
    .filter((el) => {
      const r = caixaEfetiva(el);
      return Math.min(r.width, r.height) < 24;
    })
    .map((el) => {
      const r = caixaEfetiva(el);
      return {
        seletor:
          el.tagName.toLowerCase() +
          (el.className ? "." + String(el.className).split(" ")[0] : ""),
        tamanho: `${Math.round(r.width)}x${Math.round(r.height)}`,
      };
    });

  // --- metadados --------------------------------------------------------
  const meta = (sel, attr = "content") =>
    document.querySelector(sel)?.getAttribute(attr) ?? null;
  const metadados = {
    title: document.title || null,
    description: meta('meta[name="description"]'),
    canonical: meta('link[rel="canonical"]', "href"),
    ogImage: meta('meta[property="og:image"]'),
    ogTitle: meta('meta[property="og:title"]'),
    lang: document.documentElement.lang || null,
  };

  // --- overflow ---------------------------------------------------------
  const overflow = {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  };

  return { contraste, headings, imagens, pequenos, metadados, overflow };
};

// ------------------------------------------------------------------ execução

if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const porRota = [];

for (const viewport of VIEWPORTS) {
  // Viewport estreito também emula toque: sem hasTouch o `pointer: coarse`
  // não casa e regras feitas para celular — como ampliar alvo de toque —
  // ficam inertes, produzindo achado que não existe no aparelho real.
  const touch = viewport.width < 500;
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: touch ? 3 : 2,
    hasTouch: touch,
    isMobile: touch,
  });

  for (const rota of ROUTES) {
    const page = await ctx.newPage();
    let transferido = 0;
    page.on("response", async (r) => {
      const len = Number(r.headers()["content-length"] ?? 0);
      if (len) transferido += len;
    });

    const url = BASE.replace(/\/$/, "") + rota;
    let status = 0;
    try {
      const resp = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 45000,
      });
      status = resp?.status() ?? 0;
    } catch (e) {
      registrar(
        "alta",
        "disponibilidade",
        rota,
        viewport.label,
        "Rota não carregou",
        String(e).slice(0, 120),
      );
      await page.close();
      continue;
    }
    if (status >= 400) {
      registrar(
        "alta",
        "disponibilidade",
        rota,
        viewport.label,
        `HTTP ${status}`,
        url,
      );
      await page.close();
      continue;
    }

    // CLS acumulado numa janela curta após o load
    const cls = await page.evaluate(
      () =>
        new Promise((res) => {
          let total = 0;
          new PerformanceObserver((l) => {
            for (const e of l.getEntries())
              if (!e.hadRecentInput) total += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => res(total), 1200);
        }),
    );

    const r = await page.evaluate(AUDITORIA_NO_NAVEGADOR);

    if (SHOTS) {
      const nome =
        rota === "/" ? "home" : rota.replace(/\//g, "-").replace(/^-/, "");
      await page.screenshot({
        path: `${SHOTS}/${nome}--${viewport.label}.png`,
      });
    }

    // anel de foco: percorre os primeiros focáveis com Tab
    const foco = { ok: 0, semIndicador: [] };
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        // O indicador pode estar num ancestral, via :focus-within — padrão
        // comum em campo de busca com ícone, onde o input zera o próprio
        // outline e quem desenha o anel é o contêiner. Olhar apenas o
        // elemento focado gera falso positivo.
        const indicador = (node) => {
          const cs = getComputedStyle(node);
          const largura = parseFloat(cs.outlineWidth) || 0;
          return (
            (largura > 0 && cs.outlineStyle !== "none") ||
            (cs.boxShadow && cs.boxShadow !== "none")
          );
        };
        let node = el;
        let tem = false;
        for (let salto = 0; node && salto < 4; salto += 1) {
          if (indicador(node)) {
            tem = true;
            break;
          }
          node = node.parentElement;
        }
        return {
          tem,
          seletor:
            el.tagName.toLowerCase() +
            (el.className ? "." + String(el.className).split(" ")[0] : ""),
        };
      });
      if (!info) break;
      if (info.tem) foco.ok += 1;
      else foco.semIndicador.push(info.seletor);
    }

    porRota.push({
      rota,
      viewport: viewport.label,
      cls,
      transferido,
      ...r,
      foco,
    });

    // ---- achados
    const vp = viewport.label;
    if (r.overflow.scrollWidth > r.overflow.clientWidth) {
      registrar(
        "alta",
        "layout",
        rota,
        vp,
        "Overflow horizontal",
        `${r.overflow.scrollWidth}px de conteúdo em viewport de ${r.overflow.clientWidth}px`,
      );
    }
    for (const f of r.contraste.falhas.slice(0, 4)) {
      registrar(
        "alta",
        "contraste",
        rota,
        vp,
        `Contraste ${f.razao}:1 abaixo do mínimo ${f.exigido}:1`,
        `${f.seletor} — "${f.texto}"`,
      );
    }
    if (foco.semIndicador.length) {
      registrar(
        "alta",
        "foco",
        rota,
        vp,
        `${foco.semIndicador.length} elemento(s) focáveis sem indicador visível`,
        [...new Set(foco.semIndicador)].join(", "),
      );
    }
    if (cls > 0.1) {
      registrar(
        "alta",
        "estabilidade",
        rota,
        vp,
        `CLS ${cls.toFixed(3)} acima de 0.1`,
        "Reserve espaço com width/height ou aspect-ratio",
      );
    }
    if (r.headings.h1 !== 1) {
      registrar(
        "media",
        "semantica",
        rota,
        vp,
        `${r.headings.h1} elemento(s) h1`,
        "Esperado exatamente 1",
      );
    }
    if (r.headings.saltos) {
      registrar(
        "media",
        "semantica",
        rota,
        vp,
        `${r.headings.saltos} salto(s) de nível de heading`,
        "Ex.: h2 seguido de h4",
      );
    }
    if (r.imagens.semAlt) {
      registrar(
        "alta",
        "imagens",
        rota,
        vp,
        `${r.imagens.semAlt} imagem(ns) sem atributo alt`,
        'alt="" é válido para decorativa; ausente não é',
      );
    }
    if (r.imagens.semDimensao) {
      registrar(
        "media",
        "imagens",
        rota,
        vp,
        `${r.imagens.semDimensao} imagem(ns) sem width/height`,
        "Sem dimensão intrínseca o navegador não reserva espaço",
      );
    }
    for (const s of r.imagens.subdimensionadas.slice(0, 3)) {
      registrar(
        "media",
        "imagens",
        rota,
        vp,
        `Imagem servida menor que o necessário (${s.natural}px para ${s.precisa}px)`,
        s.src,
      );
    }
    // A WCAG 2.5.8 tem exceção de espaçamento que este driver não calcula:
    // um alvo pequeno mas isolado passa no critério. Por isso só vira achado
    // de peso quando fica bem abaixo do limite; entre 20 e 24px é informativo
    // e pede olho humano.
    const critico = r.pequenos.filter(
      (p) => Number(p.tamanho.split("x")[1]) < 20,
    );
    if (critico.length) {
      registrar(
        viewport.width < 500 ? "alta" : "media",
        "toque",
        rota,
        vp,
        `${critico.length} alvo(s) interativos com altura < 20px`,
        critico
          .slice(0, 3)
          .map((p) => `${p.seletor} ${p.tamanho}`)
          .join(", "),
      );
    }
    const marginal = r.pequenos.length - critico.length;
    if (marginal > 0) {
      registrar(
        "baixa",
        "toque",
        rota,
        vp,
        `${marginal} alvo(s) entre 20 e 24px — verificar a exceção de espaçamento da WCAG 2.5.8`,
        r.pequenos
          .filter((p) => Number(p.tamanho.split("x")[1]) >= 20)
          .slice(0, 3)
          .map((p) => `${p.seletor} ${p.tamanho}`)
          .join(", "),
      );
    }
    for (const [campo, valor] of Object.entries(r.metadados)) {
      if (!valor)
        registrar("media", "metadados", rota, vp, `Sem ${campo}`, url);
    }

    await page.close();
  }
  await ctx.close();
}

await browser.close();

// ------------------------------------------------------------------- notas

const somaSe = (fn) => porRota.reduce((a, r) => a + fn(r), 0);
const rotasOk = porRota.length;

const categorias = {
  contraste: notaDe(
    somaSe((r) => r.contraste.ok),
    somaSe((r) => r.contraste.ok + r.contraste.falhas.length),
  ),
  foco: notaDe(
    somaSe((r) => r.foco.ok),
    somaSe((r) => r.foco.ok + r.foco.semIndicador.length),
  ),
  layout: notaDe(
    porRota.filter((r) => r.overflow.scrollWidth <= r.overflow.clientWidth)
      .length,
    rotasOk,
  ),
  estabilidade: notaDe(porRota.filter((r) => r.cls <= 0.1).length, rotasOk),
  semantica: notaDe(
    porRota.filter((r) => r.headings.h1 === 1 && r.headings.saltos === 0)
      .length,
    rotasOk,
  ),
  imagens: notaDe(
    somaSe((r) => r.imagens.total - r.imagens.semAlt - r.imagens.semDimensao),
    somaSe((r) => r.imagens.total * 1) || 0,
  ),
  metadados: notaDe(
    somaSe((r) => Object.values(r.metadados).filter(Boolean).length),
    somaSe((r) => Object.keys(r.metadados).length),
  ),
};

// Uma média sobre centenas de elementos dilui a falha grave: um único texto
// ilegível somia entre 400 aprovados e a categoria fechava em 10. O teto por
// severidade impede que uma categoria com achado ALTA seja aprovada por média.
const TETO_POR_ALTA = [10, 6.5, 5, 4];
for (const [nome, nota] of Object.entries(categorias)) {
  if (nota === null) continue;
  const altas = achados.filter(
    (a) => a.categoria === nome && a.severidade === "alta",
  ).length;
  const medias = achados.filter(
    (a) => a.categoria === nome && a.severidade === "media",
  ).length;
  const teto = TETO_POR_ALTA[Math.min(altas, TETO_POR_ALTA.length - 1)];
  categorias[nome] = clamp(
    Number(Math.min(nota, teto - medias * 0.3).toFixed(1)),
    0,
    10,
  );
}

const validas = Object.entries(categorias).filter(([, n]) => n !== null);
const geral = validas.length
  ? Number((validas.reduce((a, [, n]) => a + n, 0) / validas.length).toFixed(1))
  : 0;

// ---------------------------------------------------------------- relatório

const ordem = { alta: 0, media: 1, baixa: 2 };
achados.sort((a, b) => ordem[a.severidade] - ordem[b.severidade]);

const barra = (n) => "█".repeat(Math.round(n)) + "░".repeat(10 - Math.round(n));

console.log(`\n  AUDITORIA DE FRONTEND — ${BASE}`);
console.log(
  `  ${ROUTES.length} rota(s) x ${VIEWPORTS.length} viewport(s) = ${porRota.length} análises\n`,
);
console.log("  NOTAS POR CATEGORIA");
for (const [nome, nota] of Object.entries(categorias)) {
  if (nota === null) {
    console.log(`    ${nome.padEnd(14)} —     (sem dados)`);
    continue;
  }
  console.log(
    `    ${nome.padEnd(14)} ${String(nota).padStart(4)}  ${barra(nota)}`,
  );
}
console.log(
  `\n    ${"GERAL".padEnd(14)} ${String(geral).padStart(4)}  ${barra(geral)}\n`,
);

if (achados.length === 0) {
  console.log("  Nenhum achado. Nada a aprovar.\n");
} else {
  console.log(`  SUGESTÕES DE MELHORIA (${achados.length}) — para aprovação\n`);
  const vistos = new Set();
  let n = 0;
  for (const a of achados) {
    const chave = `${a.categoria}|${a.mensagem}|${a.detalhe}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    n += 1;
    const tag = { alta: "ALTA ", media: "MEDIA", baixa: "BAIXA" }[a.severidade];
    console.log(
      `  ${String(n).padStart(2)}. [${tag}] ${a.categoria} — ${a.mensagem}`,
    );
    console.log(`      ${a.rota} @ ${a.viewport}`);
    if (a.detalhe) console.log(`      ${a.detalhe}`);
    console.log();
  }
}

const naoVerificado = somaSe((r) => r.contraste.naoVerificavel);
if (naoVerificado) {
  console.log(
    `  Nota: ${naoVerificado} trecho(s) de texto sobre imagem ou gradiente não tiveram`,
  );
  console.log("  contraste medido automaticamente — confira à mão.\n");
}

if (JSON_OUT) {
  writeFileSync(
    JSON_OUT,
    JSON.stringify(
      { base: BASE, geral, categorias, achados, porRota },
      null,
      2,
    ),
  );
  console.log(`  Relatório JSON em ${JSON_OUT}\n`);
}

if (geral < MIN) {
  console.log(`  REPROVADO: nota ${geral} abaixo do mínimo ${MIN}.\n`);
  process.exit(1);
}
console.log(`  APROVADO: nota ${geral} >= mínimo ${MIN}.\n`);
