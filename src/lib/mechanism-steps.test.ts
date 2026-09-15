import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  isMechanismStep,
  mechanismLayerState,
  mechanismSteps,
} from "./mechanism-steps.ts";

test("cada etapa acrescenta camada e a última fecha o círculo", () => {
  assert.deepEqual(mechanismSteps, [
    "instabilidade",
    "evaporacao",
    "hiperosmolaridade",
    "inflamacao",
    "dano-epitelial",
    "neurossensorial",
  ]);

  assert.equal(mechanismLayerState("instabilidade").evaporation, 0);
  assert.equal(mechanismLayerState("evaporacao").evaporation, 1);
  assert.equal(mechanismLayerState("hiperosmolaridade").aqueous, 0.55);
  assert.equal(mechanismLayerState("dano-epitelial").damagedCells, true);
  assert.equal(mechanismLayerState("neurossensorial").nerve, 1);
  assert.equal(isMechanismStep("instabilidade"), true);
  assert.equal(isMechanismStep("cura"), false);
});

test("o scrolly continua legível sem JavaScript e sem movimento", async () => {
  const source = await readFile(
    "src/components/science/MechanismScrolly.astro",
    "utf8",
  );

  assert.match(source, /data-mechanism/u);
  assert.match(source, /data-mechanism-figure/u);
  assert.match(source, /data-mechanism-step/u);
  assert.match(source, /TFOS DEWS III/u);
  assert.match(source, /IntersectionObserver/u);
  assert.doesNotMatch(source, /tratamento definitivo/iu);
  assert.doesNotMatch(source, /diagnóstico preliminar/iu);
});
