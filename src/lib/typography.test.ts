import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

/**
 * O corpo do site continua na pilha do sistema. A única fonte web é a serifada
 * das manchetes, servida do próprio domínio (`/fonts/*.woff2`, subset latino).
 *
 * A CSP declara `font-src 'self'`: uma fonte de host externo funcionaria no dev
 * e falharia calada em produção — o navegador bloqueia o download e cai no
 * fallback sem avisar ninguém. O teste continua trancando essa porta e passa a
 * exigir que todo @font-face aponte para um arquivo do próprio domínio.
 */

const fontHosts = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "use.typekit.net",
  "fonts.bunny.net",
];

const collectStyleSources = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectStyleSources(path);
      if (entry.name.includes(".test.")) return [];
      return /\.(astro|css)$/u.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
};

test("toda fonte declarada é servida pelo próprio domínio", async () => {
  const files = await collectStyleSources("src");
  const offenders: string[] = [];

  for (const path of files) {
    const source = await readFile(path, "utf8");
    for (const host of fontHosts) {
      if (source.includes(host)) offenders.push(`${path}: ${host}`);
    }
    for (const [, url] of source.matchAll(
      /@font-face[^}]*?url\(\s*["']?([^"')]+)/gsu,
    )) {
      if (!url.startsWith("/")) offenders.push(`${path}: url(${url})`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `a CSP permite apenas font-src 'self' — uma fonte externa falha calada em produção:\n${offenders.join("\n")}`,
  );
});

test("nenhum texto informativo é declarado abaixo de 14px", async () => {
  // WCAG 1.4.4 / auditoria de font-size: 14px é o piso de leitura. Rótulos
  // decorativos sem informação única (atalho ⌘K que já está no aria-label)
  // podem ficar menores — o teste os ignora pelo seletor.
  const tiny: string[] = [];
  for (const path of await collectStyleSources("src")) {
    const source = await readFile(path, "utf8");
    const decorative =
      /(?:^|\n)\s*(?:kbd|\.visually-hidden|\.sr-only)\b[^{]*\{[^}]*font-size:/gu;
    const skipped = new Set(
      [...source.matchAll(decorative)].map((match) => match[0]),
    );
    // clamp() precisa ser lido pelo primeiro argumento: é o piso, o tamanho
    // que a viewport estreita entrega.
    for (const match of source.matchAll(
      /font-size:\s*(?:clamp\(\s*)?([\d.]+)(rem|em|px)/gu,
    )) {
      const value = Number(match[1]);
      const px = match[2] === "px" ? value : value * 16;
      if (px >= 14) continue;
      const around = source.slice(
        Math.max(0, match.index - 80),
        match.index + match[0].length,
      );
      if ([...skipped].some((block) => block.includes(match[0]))) continue;
      if (/(?:kbd|\.visually-hidden|\.sr-only)\b[^{]*\{[^}]*$/u.test(around)) {
        continue;
      }
      tiny.push(`${path}: ${match[0]} = ${px.toFixed(1)}px`);
    }
  }

  assert.deepEqual(
    tiny,
    [],
    `abaixo de 14px o texto informativo falha a auditoria de tamanho:\n${tiny.join("\n")}`,
  );
});

/**
 * O piso agora mora no degrau, não no papel: `--text-meta` aponta para
 * `--step-0`. Resolver a indireção é o ponto do teste — apontar um papel
 * para um degrau menor que 14px é exatamente o erro que ele precisa pegar,
 * e ler só o literal deixaria de ver isso.
 */
const resolveToken = (tokens: string, name: string): number => {
  const match = tokens.match(new RegExp(`${name}:\\s*([^;]+);`, "u"));
  assert.ok(match, `${name} ausente`);
  const value = match[1].trim();
  const step = value.match(/^var\((--step-\d+)\)$/u);
  if (step) return resolveToken(tokens, step[1]);
  const literal = value.match(/^([\d.]+)rem$/u);
  assert.ok(literal, `${name} não resolve para rem: ${value}`);
  return Number(literal[1]) * 16;
};

test("o token de meta não desce de 14px", async () => {
  const tokens = await readFile("src/styles/scale.css", "utf8");
  for (const role of ["--text-meta", "--text-small", "--text-ui"]) {
    const px = resolveToken(tokens, role);
    assert.ok(px >= 14, `${role} resolve para ${px}px, abaixo do piso de 14px`);
  }
});

test("a escala é modular: razão constante entre degraus vizinhos", async () => {
  const tokens = await readFile("src/styles/scale.css", "utf8");
  const steps = Array.from({ length: 11 }, (_, i) =>
    resolveToken(tokens, `--step-${i}`),
  );

  assert.equal(steps[0], 14, "o piso da escala é 14px");

  const ratios = steps.slice(1).map((px, i) => px / steps[i]);
  for (const [index, ratio] of ratios.entries()) {
    assert.ok(
      Math.abs(ratio - 1.25) < 0.01,
      `degrau ${index + 1} quebra a razão 1,25: ${ratio.toFixed(3)}`,
    );
  }
});

test("as pilhas de fonte começam por famílias que o sistema resolve", async () => {
  const files = await collectStyleSources("src");
  // Famílias aceitas na primeira posição: palavras-chave genéricas do CSS,
  // fontes de sistema, a serifa Iowan Old Style — que degrada por conta própria
  // para Palatino e Georgia — e a Source Serif 4, que o próprio domínio serve
  // com font-display: swap e pilha de sistema atrás.
  const resolvable =
    /^(ui-sans-serif|ui-serif|ui-monospace|system-ui|-apple-system|sans-serif|serif|monospace|inherit|var\(|"Iowan Old Style"|"Source Serif 4 Var"|Georgia)/u;

  const offenders: string[] = [];
  for (const path of files) {
    const source = await readFile(path, "utf8");
    for (const match of source.matchAll(/font-family:\s*([^;}]+)/gu)) {
      const first = match[1].replace(/\s+/gu, " ").trim();
      if (!resolvable.test(first)) offenders.push(`${path}: ${first}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `família não hospedada na frente da pilha: quem a tiver instalada vê um site, o resto vê outro\n${offenders.join("\n")}`,
  );
});

/**
 * A escala nasceu só em tokens.css, que só o Layout do portal importa. Na
 * SUPERFÍCIE nenhum `var(--text-*)` resolvia e TODA a revista caía no padrão
 * de 16px do navegador — duas páginas inteiras com um único tamanho. O build
 * passava, a suíte passava, e só a medição no navegador via.
 */
test("todo layout que serve HTML carrega a escala tipográfica", async () => {
  const layouts = [
    "src/layouts/Layout.astro",
    "src/layouts/SuperficieLayout.astro",
    "src/layouts/SuperficieReaderLayout.astro",
  ];

  const offenders: string[] = [];
  for (const path of layouts) {
    const source = await readFile(path, "utf8");
    const direct = source.includes("styles/scale.css");
    const viaTokens = source.includes("styles/tokens.css");
    if (!direct && !viaTokens) offenders.push(path);
  }

  assert.deepEqual(
    offenders,
    [],
    `sem a escala, font-size cai no padrão de 16px do navegador:\n${offenders.join("\n")}`,
  );
});

/**
 * A armadilha que mordeu duas vezes na mesma sessão: um token declarado só em
 * tokens.css, que apenas o layout do portal importa, e usado num componente da
 * SUPERFÍCIE. O CSS não avisa — `var(--x)` sem fallback vira valor inválido e
 * a propriedade some. Na primeira vez toda a revista caiu para os 16px padrão
 * do navegador; na segunda, a coluna do artigo pulou de 704px para 1340px.
 *
 * Build e suíte passavam nas duas. Só a medição no navegador via.
 */
test("componente da SUPERFÍCIE não usa token exclusivo do portal", async () => {
  const definidos = new Set<string>();
  for (const path of [
    "src/styles/scale.css",
    "src/layouts/SuperficieLayout.astro",
  ]) {
    const source = await readFile(path, "utf8");
    for (const match of source.matchAll(/(--[\w-]+):/gu))
      definidos.add(match[1]);
  }

  const arquivos = (await collectStyleSources("src")).filter(
    (path) =>
      path.includes("/superficie/") || path.includes("SuperficieLayout"),
  );

  const offenders: string[] = [];
  for (const path of arquivos) {
    const source = await readFile(path, "utf8");
    // Um arquivo pode declarar o próprio token, inclusive inline pelo atributo
    // style — é como o MagazineArticlePage passa --figure-ratio por figura.
    const locais = new Set(
      [...source.matchAll(/(--[\w-]+)\s*:/gu)].map((match) => match[1]),
    );
    // Só `var(--x)` SEM fallback: com fallback a falta do token é intencional.
    for (const match of source.matchAll(/var\(\s*(--[\w-]+)\s*\)/gu)) {
      const token = match[1];
      if (definidos.has(token) || locais.has(token)) continue;
      offenders.push(`${path}: var(${token})`);
    }
  }

  assert.deepEqual(
    [...new Set(offenders)],
    [],
    `token indefinido na revista — declare em scale.css ou dê fallback:\n${[...new Set(offenders)].join("\n")}`,
  );
});
