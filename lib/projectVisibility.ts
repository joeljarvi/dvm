import { useSyncExternalStore } from "react";

// Whether the Index lists show the curated ("featured") projects only, or
// every project in the category. Same shape as lib/section.ts. Shared across
// both categories — one toggle drives both lists.
export type Visibility = "selected" | "all";

let mode: Visibility = "selected";
const listeners = new Set<() => void>();

export function setProjectVisibility(next: Visibility) {
  if (mode === next) return;
  mode = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useProjectVisibility() {
  return useSyncExternalStore(
    subscribe,
    () => mode,
    () => "selected" as Visibility,
  );
}
