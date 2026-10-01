"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NameMark from "@/components/NameMark";
import { CURSOR_IDLE, FADE_CLASS } from "@/lib/motion";
import { useOpenedSection } from "@/lib/section";
import {
  usePointerKnown,
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
  const pathname = usePathname();
  const studio = pathname.startsWith("/studio");
  const opened = useOpenedSection();
  // Not until the pointer has moved — no watermark parked at its starting
  // position (nor one rendered on the server) before there's a pointer to
  // follow.
  const pointerKnown = usePointerKnown();
  const active = on && !suppressed && !studio && pointerKnown;

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

  const landing = pathname === "/" && opened === null;

  if (!active) return null;
  return <Mark idle={idle} landing={landing} />;
}

// Mounted each time the cursor comes up, so the landing fade-in starts fresh.
function Mark({ idle, landing }: { idle: boolean; landing: boolean }) {
  // On the landing page it fades in once the reveal releases it (see
  // HomeClient); after that, waking from idle brings it back at once. The
  // idle fade out stays everywhere.
  const [entering, setEntering] = useState(landing);
  useEffect(() => {
    if (!entering) return;
    // A frame at opacity 0 first, so the fade has somewhere to start from.
    const frame = requestAnimationFrame(() => setEntering(false));
    return () => cancelAnimationFrame(frame);
  }, [entering]);
  const [entered, setEntered] = useState(!landing);

  const fade =
    idle || !landing || !entered ? `transition-opacity ${FADE_CLASS}` : "";

  return (
    <div
      aria-hidden
      onTransitionEnd={() => setEntered(true)}
      className={`hidden lg:block fixed inset-0 z-960 pointer-events-none ${fade} ${idle || entering ? "opacity-0" : ""}`}
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
