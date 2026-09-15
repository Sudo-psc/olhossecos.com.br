import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  resolveMotionProfile,
  shouldLoadGsap,
  shouldUseDepth,
  shouldUseLenis,
} from "./motion-capabilities.ts";

test("quem pede menos movimento não carrega biblioteca nenhuma", () => {
  const profile = resolveMotionProfile({
    reducedMotion: true,
    saveData: false,
    finePointer: true,
    hoverHover: true,
    deviceMemory: 8,
  });

  assert.equal(profile, "reduce");
  assert.equal(shouldLoadGsap(profile), false);
  assert.equal(shouldUseLenis(profile), false);
  assert.equal(shouldUseDepth(profile), false);
});

test("toque e rede economizada ficam no perfil leve, sem Lenis", () => {
  assert.equal(
    resolveMotionProfile({
      reducedMotion: false,
      saveData: true,
      finePointer: true,
      hoverHover: true,
    }),
    "lite",
  );
  assert.equal(
    resolveMotionProfile({
      reducedMotion: false,
      saveData: false,
      finePointer: false,
      hoverHover: false,
      deviceMemory: 8,
    }),
    "lite",
  );
  assert.equal(
    resolveMotionProfile({
      reducedMotion: false,
      saveData: false,
      finePointer: true,
      hoverHover: true,
      deviceMemory: 2,
    }),
    "lite",
  );

  assert.equal(shouldLoadGsap("lite"), true);
  assert.equal(shouldUseLenis("lite"), false);
  assert.equal(shouldUseDepth("lite"), false);
});

test("ponteiro fino no desktop ganha inércia e profundidade", () => {
  const profile = resolveMotionProfile({
    reducedMotion: false,
    saveData: false,
    finePointer: true,
    hoverHover: true,
    deviceMemory: 8,
  });

  assert.equal(profile, "full");
  assert.equal(shouldUseLenis(profile), true);
  assert.equal(shouldUseDepth(profile), true);
});

test("o layout só puxa o motor se o visitante aceitar movimento", async () => {
  const layout = await readFile("src/layouts/Layout.astro", "utf8");
  const boot = await readFile("src/lib/portal-motion.ts", "utf8");
  const film = await readFile("src/components/TearFilmCycle.astro", "utf8");

  assert.match(layout, /PortalMotion/u);
  assert.match(layout, /prefers-reduced-motion: reduce/u);
  assert.match(boot, /import\("gsap"\)/u);
  assert.match(boot, /import\("gsap\/ScrollTrigger"\)/u);
  assert.match(boot, /import\("lenis"\)/u);
  assert.match(boot, /shouldLoadGsap/u);
  assert.match(boot, /shouldUseLenis/u);
  assert.match(film, /data-tear-cycle/u);
  assert.match(film, /prefers-reduced-motion: reduce/u);
  assert.match(film, /tc-film--roto/u);
});
