import { useEffect, useRef } from "react";
import { useIsDesktop } from "@/lib/media";

// How far a swipe has to travel before it counts, and how long a step locks
// out the next one — a swipe fires touchmove continuously, so without this a
// single gesture would run through the whole set.
const THRESHOLD = 40;
const COOLDOWN = 400;

/**
 * Stepping through a set by keyboard and by touch. Arrow keys work at every
 * width; swiping is touch-only, since on desktop the wheel belongs to Lenis
 * and hijacking it would fight the horizontal scroll.
 *
 * Scrolling *down* — finger travelling up — moves forward, the direction the
 * page itself would go.
 */
export function useStepControls(
  enabled: boolean,
  step: (delta: number) => void,
) {
  const desktop = useIsDesktop();

  // Held in a ref so a fresh closure each render doesn't re-bind the
  // listeners on every pass.
  const latest = useRef(step);
  useEffect(() => {
    latest.current = step;
  });

  useEffect(() => {
    if (!enabled) return;
    const go = (delta: number) => latest.current(delta);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);

    if (desktop) return () => window.removeEventListener("keydown", onKey);

    let start: number | null = null;
    let cooling = false;
    const onStart = (e: TouchEvent) => {
      start = e.touches[0]?.clientY ?? null;
    };
    const onMove = (e: TouchEvent) => {
      if (cooling || start === null) return;
      const travelled = start - (e.touches[0]?.clientY ?? start);
      if (Math.abs(travelled) < THRESHOLD) return;
      cooling = true;
      start = null;
      setTimeout(() => (cooling = false), COOLDOWN);
      go(travelled > 0 ? 1 : -1);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, [enabled, desktop]);
}
