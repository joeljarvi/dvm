import { useSyncExternalStore } from "react";

// Whether the Index lists (and the carousel behind them) show the curated
// projects only, or those plus the placeholder "Boring Client" ones — see
// lib/data's extraClients. Same shape as lib/section.ts: the Index overlay's
// own toggle writes it, the carousel reads it back to grow its list to
// match. Shared across both categories — one toggle drives both lists.
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
