"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NameMark from "@/components/NameMark";
import {
  useSuppressWatermarkCursor,
  useWatermarkCursorSuppressed,
} from "@/lib/watermarkCursor";

// Site Settings' "Watermark cursor on": the full-screen watermark (see
// NameMark) as the cursor on every page, desktop only — the names crossing
// at the pointer, "von" its tip. Hides the system pointer while it's up;
// the blue circle (CustomCursor) stands down on its own.
export default function WatermarkCursor({ on }: { on: boolean }) {
  const suppressed = useWatermarkCursorSuppressed();
  // Never over the Studio — editors get their own pointer there.
  const studio = usePathname().startsWith("/studio");
  const active = on && !suppressed && !studio;

  useEffect(() => {
    document.documentElement.classList.toggle("watermark-cursor", active);
    return () => document.documentElement.classList.remove("watermark-cursor");
  }, [active]);

  if (!active) return null;
  return (
    <div
      aria-hidden
      className="hidden lg:block fixed inset-0 z-960 pointer-events-none"
    >
      <NameMark watermark instant />
    </div>
  );
}

/** For server-rendered pages that show the name themselves (the 404). */
export function SuppressWatermarkCursor() {
  useSuppressWatermarkCursor(true);
  return null;
}
