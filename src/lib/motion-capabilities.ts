/**
 * Quem pode carregar GSAP/Lenis. O bundle não desce para quem pediu menos
 * movimento, está em rede economizada ou usa o dedo como ponteiro — nesses
 * casos o CSS já existente (e o quadro parado do filme) basta.
 */

export const motionProfiles = ["reduce", "lite", "full"] as const;
export type MotionProfile = (typeof motionProfiles)[number];

export type MotionSignals = {
  reducedMotion: boolean;
  saveData: boolean;
  finePointer: boolean;
  hoverHover: boolean;
  deviceMemory?: number;
};

export function resolveMotionProfile(signals: MotionSignals): MotionProfile {
  if (signals.reducedMotion) return "reduce";
  if (signals.saveData) return "lite";
  if (signals.deviceMemory !== undefined && signals.deviceMemory < 4) {
    return "lite";
  }
  if (!signals.finePointer || !signals.hoverHover) return "lite";
  return "full";
}

export function shouldLoadGsap(profile: MotionProfile): boolean {
  return profile !== "reduce";
}

export function shouldUseLenis(profile: MotionProfile): boolean {
  return profile === "full";
}

export function shouldUseDepth(profile: MotionProfile): boolean {
  return profile === "full";
}

export function readBrowserMotionSignals(
  win: Pick<Window, "matchMedia" | "navigator"> = window,
): MotionSignals {
  const nav = win.navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  return {
    reducedMotion: win.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(nav.connection?.saveData),
    finePointer: win.matchMedia("(pointer: fine)").matches,
    hoverHover: win.matchMedia("(hover: hover)").matches,
    deviceMemory: nav.deviceMemory,
  };
}
