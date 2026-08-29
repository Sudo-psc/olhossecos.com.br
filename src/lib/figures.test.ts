import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { figures, openImageCredits, type FigureAsset } from "./figures.ts";

const assetPath = (src: string) => `public${src}`;

type LicensedFigureAsset = FigureAsset & {
  credit: NonNullable<FigureAsset["credit"]>;
  license: NonNullable<FigureAsset["license"]>;
};

test("toda figura declara um arquivo-fonte existente", () => {
  const missing = Object.entries(figures)
    .filter(([, figure]) => !existsSync(assetPath(figure.src)))
    .map(([name, figure]) => `${name} → ${figure.src}`);

  assert.deepEqual(missing, [], missing.join("\n"));
});

test("figura com licença aberta traz crédito com URL e o arquivo da licença", () => {
  const catalog = Object.entries(figures) as [string, FigureAsset][];
  // O predicado estreita `credit` junto com `license`, e não por capricho de
  // tipo: figura sob CC BY sem atribuição viola a própria licença. Estreitar
  // só `license` deixava `figure.credit.url` logo abaixo sem garantia, e o
  // astro check derrubava o build com ts(18048).
  const licensed = catalog.filter(
    (entry): entry is [string, LicensedFigureAsset] =>
      Boolean(entry[1].credit && entry[1].license),
  );

  assert.ok(licensed.length >= 2, "faltam figuras de licença aberta");

  for (const [name, figure] of licensed) {
    assert.ok(figure.credit.url, `${name} sem URL de crédito`);
    assert.ok(figure.license.url, `${name} sem URL de licença`);
    assert.match(figure.license.label, /CC BY/u, name);
  }
});

test("as figuras de Hwang et al. 2013 apontam para o DOI do PLoS ONE e CC BY 4.0", () => {
  const hwang: LicensedFigureAsset[] = [
    figures.meibographyInfraredHwang2013,
    figures.meibographyOct3dHwang2013,
    figures.meibographyMildMgdHwang2013,
  ];

  for (const figure of hwang) {
    assert.ok(figure.credit, "figura de Hwang sem bloco de crédito");
    assert.equal(
      figure.credit.url,
      "https://doi.org/10.1371/journal.pone.0067143",
    );
    assert.equal(figure.license?.label, "CC BY 4.0");
    assert.ok(existsSync(assetPath(figure.src)), figure.src);
  }

  const hwangCredits = openImageCredits.filter((credit) =>
    credit.sourceUrl.includes("pone.0067143"),
  );
  assert.equal(hwangCredits.length, 3);
});
