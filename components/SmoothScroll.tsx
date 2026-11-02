"use client";

import { ReactLenis } from "lenis/react";
import { SCROLL_OPTIONS } from "@/lib/scroll";
import { useCanHover } from "@/lib/canHover";

export default function SmoothScroll() {
  const canHover = useCanHover();
  if (!canHover) return null;
  return <ReactLenis root options={SCROLL_OPTIONS} />;
}
