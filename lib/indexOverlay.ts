import { useSyncExternalStore } from "react";

// Whether the client index is raised over a browsing view — the commissioned
// carousel, currently. Same shape as lib/section.ts: the nav's corner button
// writes it, whichever view is mounted reads it back and renders its own
// overlay + dismiss.
let open = false;
const listeners = new Set<() => void>();

export function openIndex() {
  if (open) return;
  open = true;
  listeners.forEach((l) => l());
}

export function closeIndex() {
  if (!open) return;
  open = false;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const getSnapshot = () => open;
const getServerSnapshot = () => false;

export function useIndexOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
