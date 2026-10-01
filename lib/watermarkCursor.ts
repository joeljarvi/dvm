import { useEffect, useSyncExternalStore } from "react";

// While anything that already shows the name is up — the full-screen
// watermark, the maintenance gate, the 404 — the site-wide watermark cursor
// (components/WatermarkCursor) steps aside, rather than doubling it.
// Counted, so overlapping holders don't release each other.
let holds = 0;
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Holds the watermark cursor back while `active`. */
export function useSuppressWatermarkCursor(active: boolean) {
  useEffect(() => {
    if (!active) return;
    holds += 1;
    listeners.forEach((l) => l());
    return () => {
      holds -= 1;
      listeners.forEach((l) => l());
    };
  }, [active]);
}

export function useWatermarkCursorSuppressed() {
  return useSyncExternalStore(
    subscribe,
    () => holds > 0,
    () => false,
  );
}
