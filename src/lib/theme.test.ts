import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { themeBootScript, themeStorageKey } from "./theme.ts";

const colorLiteral =
  /#(?:[0-9a-fA-F]{3,8})\b|rgb\(|hsl\(|color-mix\(|lab\(|oklch\(/u;

const extractMediaDarkBlocks = (source: string) => {
  const blocks: string[] = [];
  const startRe = /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{/gu;
  for (const match of source.matchAll(startRe)) {
    let depth = 0;
    const from = match.index + match[0].length - 1;
    for (let i = from; i < source.length; i += 1) {
      if (source[i] === "{") depth += 1;
      if (source[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          blocks.push(source.slice(match.index, i + 1));
          break;
        }
      }
    }
  }
  return blocks;
};

test("o script de boot e o storage usam a mesma chave", () => {
  assert.match(themeBootScript, new RegExp(themeStorageKey, "u"));
  assert.match(themeBootScript, /data-theme/);
});

test("nenhuma cor é definida só dentro de prefers-color-scheme", async () => {
  const files = [
    "src/styles/tokens.css",
    "src/layouts/SuperficieLayout.astro",
    "src/layouts/Layout.astro",
  ];

  const unicas: string[] = [];
  for (const path of files) {
    const source = await readFile(path, "utf8");
    const darkBlocks = extractMediaDarkBlocks(source);
    const fora = darkBlocks.reduce(
      (acc, block) => acc.replace(block, ""),
      source,
    );
    for (const block of darkBlocks) {
      for (const match of block.matchAll(
        /(#(?:[0-9a-fA-F]{3,8})\b|rgb\([^)]+\)|hsl\([^)]+\))/gu,
      )) {
        if (!fora.includes(match[1])) {
          unicas.push(`${path}: ${match[1]}`);
        }
      }
    }
  }

  assert.deepEqual(
    unicas,
    [],
    `cor com definição única no media query — mova para :root:\n${unicas.join("\n")}`,
  );
});

test("o media query de tema só remapeia tokens", async () => {
  const tokens = await readFile("src/styles/tokens.css", "utf8");
  const [dark] = extractMediaDarkBlocks(tokens);
  assert.ok(dark, "prefers-color-scheme: dark ausente em tokens.css");
  assert.equal(colorLiteral.test(dark), false, dark);
});

test("o alternador é um switch compacto claro/escuro", async () => {
  const source = await readFile("src/components/ThemeSwitch.astro", "utf8");
  assert.match(source, /aria-label="Alternar tema claro ou escuro"/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /width:\s*44px/);
  assert.match(source, /height:\s*24px/);
  assert.doesNotMatch(source, />\s*Claro\s*</);
  assert.doesNotMatch(source, />\s*Escuro\s*</);
  assert.doesNotMatch(source, />\s*Sistema\s*</);
});
