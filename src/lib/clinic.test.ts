import assert from "node:assert/strict";
import { test } from "node:test";
import { responsibleDoctor } from "./doctor.ts";

test("o registro do rodapé continua vindo do módulo do médico", () => {
  assert.equal(responsibleDoctor.registration, "CRM-MG 69.870 · RQE 71.903");
});
