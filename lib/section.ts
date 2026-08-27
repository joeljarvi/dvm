import { useSyncExternalStore } from "react";
import type { Section } from "./hover";

// Which home column holds the width. The nav renders in the layout and the
// columns in the page, so neither can own this — same shape as lib/hover.
// null means neither has been chosen yet and they split it evenly.
let opened: Section = null;
const listeners = new Set<() => void>();

export function setOpenedSection(next: Section) {
  if (next === opened) return;
  opened = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useOpenedSection() {
  return useSyncExternalStore(
    subscribe,
    () => opened,
    (): Section => null,
  );
}
