import {
  isMechanismStep,
  mechanismLayerState,
  type MechanismStep,
} from "./mechanism-steps.ts";
import {
  readBrowserMotionSignals,
  resolveMotionProfile,
  shouldLoadGsap,
  shouldUseDepth,
  shouldUseLenis,
  type MotionProfile,
} from "./motion-capabilities.ts";

type GsapCore = typeof import("gsap").default;
type ScrollTriggerType = typeof import("gsap/ScrollTrigger").ScrollTrigger;

type MotionRuntime = {
  destroy: () => void;
};

let runtime: MotionRuntime | undefined;
let watchingMotionPreference = false;

const EASE_OUT = "power3.out";
const EASE_EXPO = "expo.out";

export async function bootPortalMotion(): Promise<void> {
  runtime?.destroy();
  runtime = undefined;

  const profile = resolveMotionProfile(readBrowserMotionSignals());
  document.documentElement.dataset.motionProfile = profile;

  if (!shouldLoadGsap(profile)) {
    delete document.documentElement.dataset.motionEngine;
    delete document.documentElement.dataset.motionScroll;
    return;
  }

  runtime = await startEnhancedMotion(profile);
  watchMotionPreference();
}

function watchMotionPreference(): void {
  if (watchingMotionPreference) return;
  watchingMotionPreference = true;
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", () => {
      void bootPortalMotion();
    });
}

async function startEnhancedMotion(
  profile: MotionProfile,
): Promise<MotionRuntime> {
  const [gsapModule, scrollModule] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  const gsap = gsapModule.default;
  const { ScrollTrigger } = scrollModule;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.dataset.motionEngine = "gsap";

  const cleanups: Array<() => void> = [];
  cleanups.push(enhanceTearCycles(gsap, ScrollTrigger));
  cleanups.push(enhanceMechanism(gsap, ScrollTrigger));
  cleanups.push(enhanceReveals(gsap, ScrollTrigger));

  if (shouldUseDepth(profile)) {
    cleanups.push(enhanceDepth(gsap, ScrollTrigger));
    cleanups.push(enhanceGatewayTilt(gsap));
  }

  if (shouldUseLenis(profile)) {
    cleanups.push(await startLenis(gsap, ScrollTrigger));
  }

  ScrollTrigger.refresh();

  return {
    destroy: () => {
      cleanups.forEach((stop) => stop());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      delete document.documentElement.dataset.motionEngine;
      delete document.documentElement.dataset.motionScroll;
    },
  };
}

function enhanceTearCycles(
  gsap: GsapCore,
  ScrollTrigger: ScrollTriggerType,
): () => void {
  const timelines: Array<{ kill: () => void }> = [];

  document
    .querySelectorAll<HTMLElement>("[data-tear-cycle]")
    .forEach((root) => {
      const cheio = root.querySelector<SVGElement>('[data-tear-layer="cheio"]');
      const medio = root.querySelector<SVGElement>('[data-tear-layer="medio"]');
      const roto = root.querySelector<SVGElement>('[data-tear-layer="roto"]');
      const meniscus = root.querySelector<SVGElement>("[data-tear-meniscus]");
      const lid = root.querySelector<SVGElement>("[data-tear-lid]");
      if (!cheio || !medio || !roto || !meniscus || !lid) return;

      root.dataset.engine = "gsap";
      gsap.set([cheio, medio, roto], { opacity: 0 });
      gsap.set(cheio, { opacity: 1 });
      gsap.set(meniscus, { attr: { "stroke-width": 8 }, opacity: 1 });
      gsap.set(lid, { y: 0 });

      const timeline = gsap.timeline({
        repeat: -1,
        defaults: { ease: "none" },
      });

      // 9s: espalha, afina, rompe; a pálpebra fecha rápido e abre com inércia.
      timeline
        .to(cheio, { opacity: 0, duration: 1.9, ease: "sine.inOut" }, 1.25)
        .fromTo(
          medio,
          { opacity: 0 },
          { opacity: 1, duration: 1.9, ease: "sine.inOut" },
          1.25,
        )
        .to(medio, { opacity: 0, duration: 1.6, ease: "sine.inOut" }, 4.85)
        .fromTo(
          roto,
          { opacity: 0 },
          { opacity: 1, duration: 1.6, ease: "sine.inOut" },
          4.85,
        )
        .to(
          meniscus,
          {
            attr: { "stroke-width": 3 },
            opacity: 0.55,
            duration: 7.4,
            ease: "sine.inOut",
          },
          0.2,
        )
        .to(roto, { opacity: 0, duration: 0.28, ease: "power2.in" }, 8.28)
        .to(lid, { y: 178, duration: 0.18, ease: "power4.in" }, 8.28)
        .to(lid, { y: 0, duration: 0.32, ease: EASE_EXPO }, 8.52)
        .to(cheio, { opacity: 1, duration: 0.28, ease: "power2.out" }, 8.55)
        .to(
          meniscus,
          {
            attr: { "stroke-width": 8 },
            opacity: 1,
            duration: 0.28,
            ease: EASE_OUT,
          },
          8.55,
        );

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          if (self.isActive) timeline.play();
          else timeline.pause();
        },
      });

      if (!trigger.isActive) timeline.pause();
      timelines.push(timeline, trigger);
    });

  return () => {
    timelines.forEach((item) => item.kill());
    document.querySelectorAll("[data-tear-cycle]").forEach((root) => {
      delete (root as HTMLElement).dataset.engine;
    });
  };
}

function enhanceMechanism(
  gsap: GsapCore,
  ScrollTrigger: ScrollTriggerType,
): () => void {
  const triggers: Array<{ kill: () => void }> = [];

  document.querySelectorAll<HTMLElement>("[data-mechanism]").forEach((root) => {
    const figure = root.querySelector<SVGElement>("[data-mechanism-figure]");
    const steps = [
      ...root.querySelectorAll<HTMLElement>("[data-mechanism-step]"),
    ];
    if (!figure || steps.length === 0) return;

    root.dataset.engine = "gsap";
    const layers = {
      break: figure.querySelector<SVGGElement>(".layer-break"),
      evaporation: figure.querySelector<SVGGElement>(".layer-evaporation"),
      osmolarity: figure.querySelector<SVGGElement>(".layer-osmolarity"),
      inflammation: figure.querySelector<SVGGElement>(".layer-inflammation"),
      nerve: figure.querySelector<SVGGElement>(".layer-nerve"),
      aqueous: figure.querySelector<SVGPathElement>(".layer-aqueous path"),
    };

    const apply = (step: MechanismStep, immediate = false) => {
      const state = mechanismLayerState(step);
      figure.dataset.step = step;
      steps.forEach((item) => {
        item.dataset.active = String(item.dataset.mechanismStep === step);
      });

      const duration = immediate ? 0 : 0.48;
      const tween = (node: Element | null, opacity: number) => {
        if (!node) return;
        gsap.to(node, { opacity, duration, ease: EASE_OUT, overwrite: "auto" });
      };

      tween(layers.break, state.break);
      tween(layers.evaporation, state.evaporation);
      tween(layers.osmolarity, state.osmolarity);
      tween(layers.inflammation, state.inflammation);
      tween(layers.nerve, state.nerve);
      tween(layers.aqueous, state.aqueous);
    };

    const first = steps[0]?.dataset.mechanismStep;
    if (isMechanismStep(first)) apply(first, true);

    steps.forEach((step) => {
      const id = step.dataset.mechanismStep;
      if (!isMechanismStep(id)) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: step,
          start: "top 58%",
          end: "bottom 42%",
          onToggle: (self) => {
            if (self.isActive) apply(id);
          },
        }),
      );
    });
  });

  return () => {
    triggers.forEach((item) => item.kill());
    document.querySelectorAll("[data-mechanism]").forEach((root) => {
      delete (root as HTMLElement).dataset.engine;
    });
  };
}

function enhanceReveals(
  gsap: GsapCore,
  ScrollTrigger: ScrollTriggerType,
): () => void {
  const items = [...document.querySelectorAll<HTMLElement>(".reveal")];
  if (items.length === 0) return () => undefined;

  const fold = window.innerHeight * 0.9;
  const pending = items.filter(
    (item) => item.getBoundingClientRect().top > fold,
  );

  pending.forEach((item) => {
    gsap.set(item, { opacity: 0, y: 18 });
    ScrollTrigger.create({
      trigger: item,
      start: "top 88%",
      once: true,
      onEnter: () => {
        const delay =
          Number.parseFloat(item.style.getPropertyValue("--reveal-index")) *
            0.07 || 0;
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 0.72,
          delay,
          ease: EASE_OUT,
          overwrite: "auto",
        });
      },
    });
  });

  return () => {
    pending.forEach((item) =>
      gsap.set(item, { clearProps: "opacity,transform" }),
    );
  };
}

function enhanceDepth(
  gsap: GsapCore,
  ScrollTrigger: ScrollTriggerType,
): () => void {
  const tweens: Array<{ kill: () => void }> = [];

  document
    .querySelectorAll<HTMLElement>("[data-motion-depth]")
    .forEach((frame) => {
      const media = frame.querySelector("img");
      if (!media) return;
      const tween = gsap.fromTo(
        media,
        { yPercent: -5, scale: 1.055 },
        {
          yPercent: 6,
          scale: 1.055,
          ease: "none",
        },
      );
      tweens.push(
        tween,
        ScrollTrigger.create({
          trigger: frame.closest("section") ?? frame,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.65,
          animation: tween,
        }),
      );
    });

  return () => {
    tweens.forEach((item) => item.kill());
    document.querySelectorAll("[data-motion-depth] img").forEach((media) => {
      gsap.set(media, { clearProps: "transform" });
    });
  };
}

function enhanceGatewayTilt(gsap: GsapCore): () => void {
  const cleanups: Array<() => void> = [];

  document.querySelectorAll<HTMLElement>(".gateway-card").forEach((card) => {
    const tilt = { x: 0, y: 0 };
    const apply = () => {
      card.style.setProperty("--tilt-x", `${tilt.x}deg`);
      card.style.setProperty("--tilt-y", `${tilt.y}deg`);
    };
    const xTo = gsap.quickTo(tilt, "x", {
      duration: 0.55,
      ease: EASE_OUT,
      onUpdate: apply,
    });
    const yTo = gsap.quickTo(tilt, "y", {
      duration: 0.55,
      ease: EASE_OUT,
      onUpdate: apply,
    });

    const onMove = (event: PointerEvent) => {
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      yTo(px * 3.4);
      xTo(py * -2.6);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });

  return () => cleanups.forEach((stop) => stop());
}

async function startLenis(
  gsap: GsapCore,
  ScrollTrigger: ScrollTriggerType,
): Promise<() => void> {
  const { default: Lenis } = await import("lenis");
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.09,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.9,
    respectReducedMotion: true,
  });

  document.documentElement.dataset.motionScroll = "lenis";
  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(ticker);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.off("scroll", onScroll);
    lenis.destroy();
    delete document.documentElement.dataset.motionScroll;
  };
}
