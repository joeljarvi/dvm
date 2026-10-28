"use client";

import { ReactLenis } from "lenis/react";
import { SCROLL_OPTIONS } from "@/lib/scroll";

// The page's own smooth scroll (Lenis on the root). A client component so
// its options can include the easing function — a server component (the
// layout) can't hand a function to a client one.
export default function SmoothScroll() {
  return (
    <ReactLenis
      root
      // How it feels is shared with home's columns (see lib/scroll).
      options={SCROLL_OPTIONS}
    />
  );
}
