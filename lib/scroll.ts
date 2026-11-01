import type { LenisOptions } from "lenis";

// How scrolling feels, site-wide: the page's own smooth scroll
// (components/SmoothScroll) and home's two columns share it.
//
// The wheel: a short glide (0.8s) on a gentle exponential ease-out — quick
// to respond, soft to land, without a long tail to drag through on each
// tick — carrying a little further per tick.
//
// No touch settings: on touch screens Lenis is off altogether — the page's
// scroll isn't mounted, and the columns leave touch to the device (see
// lib/canHover) — so they scroll the way the phone itself does.
export const SCROLL_OPTIONS = {
  duration: 0.8,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 1.1,
} satisfies LenisOptions;
