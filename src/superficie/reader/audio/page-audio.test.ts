import assert from "node:assert/strict";
import test from "node:test";
import { PageAudioController } from "./PageAudioController.ts";

test("page audio is silent until enabled and rotates low-volume sounds", async () => {
  const played: Array<{ source: string; volume: number }> = [];
  const controller = new PageAudioController(
    ["one.wav", "two.wav"],
    (source) => ({
      currentTime: 10,
      volume: 1,
      play() {
        played.push({ source, volume: this.volume });
        return Promise.resolve();
      },
    }),
  );

  controller.playTurn();
  assert.deepEqual(played, []);

  controller.enable();
  controller.playTurn();
  controller.playTurn();
  await Promise.resolve();
  assert.deepEqual(played, [
    { source: "one.wav", volume: 0.14 },
    { source: "two.wav", volume: 0.14 },
  ]);

  controller.disable();
  controller.playTurn();
  assert.equal(played.length, 2);
});
