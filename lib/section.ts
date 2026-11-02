import { useSyncExternalStore } from "react";
import type { Section } from "./hover";

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
