import type { LenisOptions } from "lenis";

// How scrolling feels, site-wide: the page's own smooth scroll
// (components/SmoothScroll) and home's two columns share it.
//
// The wheel: a short glide (0.8s) on a gentle exponential ease-out — quick
// to respond, soft to land, without a long tail to drag through on each
// tick — carrying a little further per tick.
//
// Touch is left at Lenis' own defaults, deliberately. The page's scroll hands
// touch to the browser anyway; the columns take it over (for their loop) and
// there it must stay 1:1 with the finger — a touchMultiplier above 1 had the
// page run ahead of it — and coast to a stop naturally (a higher
// syncTouchLerp braked flicks short).
export const SCROLL_OPTIONS = {
  duration: 0.8,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 1.1,
} satisfies LenisOptions;
