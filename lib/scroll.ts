import type { LenisOptions } from "lenis";

// How scrolling feels, site-wide: the page's own smooth scroll
// (components/SmoothScroll) and home's two columns share it.
//
// - a short glide (0.8s) on a gentle exponential ease-out — quick to respond,
//   soft to land, without a long tail to drag through on each wheel tick;
// - the wheel carries a little further per tick;
// - on touch, the page follows the finger closely (Lenis' own default, 0.075,
//   trailed it like syrup) and a swipe carries further.
export const SCROLL_OPTIONS = {
  duration: 0.8,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 1.1,
  touchMultiplier: 1.6,
  syncTouchLerp: 0.15,
} satisfies LenisOptions;
