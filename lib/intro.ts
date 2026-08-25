import { useSyncExternalStore } from "react";

// The opening sequence, in one place: the wordmark fills in left to right in
// the middle of the viewport, fades out, and only then does the site arrive.
// Fake durations until there is real content to wait on.
const REVEAL = [500, 900, 1300]; // "aniel" / "on" / "almborg"
const DISMISS = 2300;
export const FADE_MS = 600;
const SETTLE = DISMISS + FADE_MS;
const STAGGER = 160;

// Everything that comes in behind the loader — the home panels' images and
// labels, the section buttons in the nav — takes one of these slots in order.
export const STAGGER_SLOTS = 4;

const BEATS = [
  ...REVEAL,
  DISMISS,
  SETTLE,
  ...Array.from(
    { length: STAGGER_SLOTS },
    (_, i) => SETTLE + (i + 1) * STAGGER,
  ),
];

// Kept in a module-level store rather than component state so the intro plays
// once per page load: navigating back to a view that animates in finds the
// timeline already spent and renders it settled, with no replay.
let phase = 0;
let running = false;
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  if (!running) {
    running = true;
    BEATS.forEach((at, i) =>
      setTimeout(() => {
        phase = i + 1;
        listeners.forEach((fn) => fn());
      }, at),
    );
  }
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const getSnapshot = () => phase;
const getServerSnapshot = () => 0;

export function useIntro() {
  const phase = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    /** How many of the wordmark's three tails have faded in. */
    revealed: Math.min(phase, REVEAL.length),
    /** The loader is fading out, or already has. */
    dismissed: phase >= REVEAL.length + 1,
    /** The loader is gone; the breadcrumb and nav chrome can come in. */
    settled: phase >= REVEAL.length + 2,
    /** How many staggered slots have come up. Slot `i` shows at `> i`. */
    staggered: Math.max(0, phase - (REVEAL.length + 2)),
  };
}
