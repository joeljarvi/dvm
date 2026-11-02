import { useSyncExternalStore } from "react";

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
