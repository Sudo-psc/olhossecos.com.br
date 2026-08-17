import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { responsibleDoctor } from "./doctor.ts";

/**
 * O CFM exige que toda página que nomeie o médico exiba CRM e RQE. O portal
 * quebrava isso em 34 páginas: o rodapé citava "Dr. Philipe Saraiva Cruz" e
 * nenhum dos dois números aparecia. O teste trava as duas metades da regra —
 * a redação do registro e o fato de cada rodapé exibi-lo.
 */

test("o registro segue a redação exigida pelo CFM", () => {
  assert.equal(responsibleDoctor.crm, "CRM-MG 69.870");
  assert.equal(responsibleDoctor.rqe, "RQE 71.903");
  assert.equal(responsibleDoctor.registration, "CRM-MG 69.870 · RQE 71.903");
});

test("os rodapés do portal e da revista exibem o registro", async () => {
  const footers = [
    "src/components/Footer.astro",
    "src/components/superficie/SuperficieFooter.astro",
  ];

  for (const path of footers) {
    const source = await readFile(path, "utf8");
    assert.match(
      source,
      /responsibleDoctor\.registration/u,
      `${path} nomeia o médico sem exibir CRM e RQE`,
    );
  }
});

const collectSourceFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(path);
      return /\.(astro|ts)$/u.test(entry.name) && !entry.name.includes(".test.")
        ? [path]
        : [];
    }),
  );
  return files.flat();
};

test("o registro não é reescrito à mão fora de doctor.ts", async () => {
  const files = await collectSourceFiles("src");
  const offenders = files.filter((path) => path !== "src/lib/doctor.ts");

  const duplicated: string[] = [];
  for (const path of offenders) {
    const source = await readFile(path, "utf8");
    // superficie.ts guarda a assinatura de cada artigo publicado: são dados
    // editoriais congelados por edição, não a identificação do rodapé.
    if (path === "src/lib/superficie.ts") continue;
    if (source.includes(responsibleDoctor.crm)) duplicated.push(path);
  }

  assert.deepEqual(
    duplicated,
    [],
    `copiar o registro cria uma segunda redação para envelhecer sozinha; importe responsibleDoctor:\n${duplicated.join("\n")}`,
  );
});
