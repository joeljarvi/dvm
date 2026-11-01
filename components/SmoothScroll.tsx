"use client";

import { ReactLenis } from "lenis/react";
import { SCROLL_OPTIONS } from "@/lib/scroll";
import { useCanHover } from "@/lib/canHover";

// The page's own smooth scroll (Lenis on the root). A client component so
// its options can include the easing function — a server component (the
// layout) can't hand a function to a client one. Off on touch screens: the
// device's own scrolling there.
export default function SmoothScroll() {
  const canHover = useCanHover();
  if (!canHover) return null;
  return (
    <ReactLenis
      root
      // How it feels is shared with home's columns (see lib/scroll).
      options={SCROLL_OPTIONS}
    />
  );
}
