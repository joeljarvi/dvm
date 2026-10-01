import { useEffect, useSyncExternalStore } from "react";
import { ms } from "./motion";

// Home's landing reveal, before a section is picked, one panel at a time:
// the "personal" label, then its covers in beneath it; then the
// "commissioned" label, then its covers. Shared here so anything outside the
// page can follow the same timeline.
//
// Beats are ms from the home page's first mount, each advancing the step by
// one. Like the intro, it plays once per page load — coming back home finds
// it already spent.
const BEATS = [300, 1000, 1700, 2400].map(ms);

let step = 0;
let started = false;
const listeners = new Set<() => void>();

/** Starts the timeline. Called by the home page on mount; a no-op after the
 * first time. */
export function startLanding() {
  if (started) return;
  started = true;
  BEATS.forEach((at, i) =>
    setTimeout(() => {
      step = i + 1;
      listeners.forEach((l) => l());
    }, at),
  );
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useLanding() {
  const s = useSyncExternalStore(
    subscribe,
    () => step,
    () => 0,
  );
  return {
    personal: { label: s >= 1, images: s >= 2 },
    commissioned: { label: s >= 3, images: s >= 4 },
  };
}

/** Starts the landing timeline on mount and returns its state. */
export function useLandingReveal() {
  useEffect(startLanding, []);
  return useLanding();
}
