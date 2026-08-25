import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEQ5_MAX,
  deq5Items,
  emptyDeq5Answers,
  isCompleteDeq5,
  scoreDeq5,
} from "./tools/deq5.ts";
import { osdiEnabled } from "./tools/flags.ts";

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
