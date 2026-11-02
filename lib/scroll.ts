import type { LenisOptions } from "lenis";

export const SCROLL_OPTIONS = {
  duration: 0.8,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 1.1,
} satisfies LenisOptions;
