import assert from "node:assert/strict";
import { test } from "node:test";
import { patientHub, toolCatalog, toolsIndex } from "./tools/catalog.ts";
import {
  DEQ5_MAX,
  type Deq5Answers,
  deq5Items,
  emptyDeq5Answers,
  isCompleteDeq5,
  scoreDeq5,
} from "./tools/deq5.ts";
import { osdiEnabled } from "./tools/flags.ts";
import {
  bandForScore,
  hasDiagnosticLanguage,
  instrumentLimitation,
  interpretDeq5,
  SIGNS_SYMPTOMS_ARTICLE_PATH,
} from "./tools/result-engine.ts";
import { pdfContains, pdfPageCount } from "./tools/client-pdf.ts";
import { buildDeq5ReportPdf } from "./tools/deq5-pdf.ts";
import {
  clearDiary,
  diaryToCsv,
  diaryWindow,
  DIARY_STORAGE_KEY,
  loadDiary,
  upsertDiaryEntry,
  type DiaryStore,
} from "./tools/diary.ts";

test("títulos das ferramentas cabem no teto da SERP", () => {
  for (const page of [...toolCatalog, toolsIndex, patientHub]) {
    assert.ok(page.title.length <= 60, page.title);
    assert.ok(page.description.length <= 158, page.href);
    assert.match(page.title, /olho seco/iu);
  }
});

test("o OSDI permanece desligado até haver licença escrita", () => {
  assert.equal(osdiEnabled, false);
});

test("o DEQ-5 tem cinco itens originais e soma 0–22", () => {
  assert.equal(deq5Items.length, 5);
  assert.equal(
    deq5Items.reduce((sum, item) => sum + item.max, 0),
    DEQ5_MAX,
  );
  assert.equal(
    deq5Items[0]?.prompt,
    "During a typical day in the last month, how often did your eyes feel discomfort?",
  );
  assert.equal(
    deq5Items[4]?.prompt,
    "During a typical day in the last month, how often did your eyes look or feel excessively watery?",
  );
});

test("o escore DEQ-5 só fecha com os cinco itens preenchidos", () => {
  const answers = emptyDeq5Answers();
  assert.equal(isCompleteDeq5(answers), false);
  assert.throws(() => scoreDeq5(answers), /incompleto/u);

  answers["discomfort-frequency"] = 2;
  answers["discomfort-intensity"] = 3;
  answers["dryness-frequency"] = 2;
  answers["dryness-intensity"] = 3;
  answers["watery-frequency"] = 1;
  assert.equal(isCompleteDeq5(answers), true);
  assert.equal(scoreDeq5(answers), 11);
});

const complete = (
  values: [number, number, number, number, number],
): Deq5Answers => ({
  "discomfort-frequency": values[0],
  "discomfort-intensity": values[1],
  "dryness-frequency": values[2],
  "dryness-intensity": values[3],
  "watery-frequency": values[4],
});

test("as faixas DEQ-5 seguem os cortes do artigo de validação", () => {
  assert.equal(bandForScore(0).id, "below-screen");
  assert.equal(bandForScore(6).id, "below-screen");
  assert.equal(bandForScore(7).id, "screen-positive");
  assert.equal(bandForScore(12).id, "screen-positive");
  assert.equal(bandForScore(13).id, "sjogren-screen");
  assert.equal(bandForScore(22).id, "sjogren-screen");
  assert.throws(() => bandForScore(23));
});

test("o resultado leva faixa, limitação e o artigo sobre sintoma e sinal", () => {
  const result = interpretDeq5(complete([4, 5, 4, 5, 4]));
  assert.equal(result.score, 22);
  assert.equal(result.band.id, "sjogren-screen");
  assert.equal(result.limitation, instrumentLimitation);
  assert.equal(result.articlePath, SIGNS_SYMPTOMS_ARTICLE_PATH);
  assert.match(result.limitation, /não diagnóstico/u);
  assert.equal(hasDiagnosticLanguage(result.band.meaning), false);
  assert.equal(hasDiagnosticLanguage(result.limitation), false);
});

test("o PDF do DEQ-5 cabe em uma página, cita a fonte e não pede identificador", () => {
  const pdf = buildDeq5ReportPdf(
    complete([2, 3, 2, 3, 1]),
    new Date("2026-08-25T12:00:00Z"),
  );
  assert.equal(pdfPageCount(pdf), 1);
  assert.equal(pdf[0], 0x25); // %
  assert.equal(pdf[1], 0x50); // P
  assert.equal(pdf[2], 0x44); // D
  assert.equal(pdf[3], 0x46); // F
  assert.equal(pdfContains(pdf, "Chalmers"), true);
  assert.equal(pdfContains(pdf, "10.1016/j.clae.2009.12.010"), true);
  assert.equal(pdfContains(pdf, "n\\343o substitui avalia"), true);
  assert.equal(pdfContains(pdf, "Nenhum nome"), true);
  assert.equal(pdfContains(pdf, "Nome:"), false);
  assert.equal(pdfContains(pdf, "@"), false);
});

const memoryStore = (): DiaryStore => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
};

test("o diário guarda 14 dias só no armazenamento local e pode apagar tudo", () => {
  const store = memoryStore();
  const today = new Date("2026-08-25T12:00:00Z");
  assert.equal(diaryWindow(today).length, 14);
  assert.equal(diaryWindow(today)[0], "2026-08-12");
  assert.equal(diaryWindow(today).at(-1), "2026-08-25");

  upsertDiaryEntry(store, { date: "2026-08-25", intensity: 4, note: "telas" });
  assert.equal(loadDiary(store)[0]?.intensity, 4);
  assert.equal(store.getItem(DIARY_STORAGE_KEY)?.includes("telas"), true);

  const csv = diaryToCsv(loadDiary(store));
  assert.match(csv, /^date,intensity,note/u);
  assert.match(csv, /2026-08-25,4,"telas"/u);

  clearDiary(store);
  assert.deepEqual(loadDiary(store), []);
  assert.equal(store.getItem(DIARY_STORAGE_KEY), null);
});
