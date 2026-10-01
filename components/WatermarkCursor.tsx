"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NameMark from "@/components/NameMark";
import { CURSOR_IDLE, FADE_CLASS } from "@/lib/motion";
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

  // Fades out once the pointer has rested CURSOR_IDLE, back on its next move.
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!active) return;
    let timer = window.setTimeout(() => setIdle(true), CURSOR_IDLE);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), CURSOR_IDLE);
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      setIdle(false);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div
      aria-hidden
      className={`hidden lg:block fixed inset-0 z-960 pointer-events-none transition-opacity ${FADE_CLASS} ${idle ? "opacity-0" : ""}`}
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
