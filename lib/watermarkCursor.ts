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

// Where the pointer last was, so the watermark can open on it rather than
// sitting at its starting position until the first move. Null until the
// pointer has moved at all this page load.
let pointer: { x: number; y: number } | null = null;
const pointerListeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    const first = pointer === null;
    pointer = { x: e.clientX, y: e.clientY };
    if (first) pointerListeners.forEach((l) => l());
  });
}

export function lastPointer() {
  return pointer;
}

/** Whether the pointer has moved yet — the watermark cursor waits for it. */
export function usePointerKnown() {
  return useSyncExternalStore(
    (l) => {
      pointerListeners.add(l);
      return () => {
        pointerListeners.delete(l);
      };
    },
    () => pointer !== null,
    () => false,
  );
}
