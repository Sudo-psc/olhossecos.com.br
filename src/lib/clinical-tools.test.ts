import assert from "node:assert/strict";
import { test } from "node:test";
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

const complete = (values: [number, number, number, number, number]): Deq5Answers => ({
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
