"use client";

import { ReactLenis } from "lenis/react";

// The page's own smooth scroll (Lenis on the root). A client component so
// its options can include the easing function — a server component (the
// layout) can't hand a function to a client one.
export default function SmoothScroll() {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.1,
        // Gentle exponential ease-out — quick to respond, soft to land.
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.6,
      }}
    />
  );
}
