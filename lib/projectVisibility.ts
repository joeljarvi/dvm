import { useSyncExternalStore } from "react";

// Whether the Index list (and the commissioned carousel behind it) show the
// curated projects only, or those plus the placeholder "Boring Client" ones —
// see lib/data's extraClients. Same shape as lib/section.ts: the Index
// overlay's own toggle writes it, the carousel reads it back to grow its list
// to match.
export type Visibility = "selected" | "all";

let mode: Visibility = "selected";
const listeners = new Set<() => void>();

export function setProjectVisibility(next: Visibility) {
  if (next === mode) return;
  mode = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const getSnapshot = () => mode;
const getServerSnapshot = (): Visibility => "selected";

export function useProjectVisibility() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
