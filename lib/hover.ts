import { useSyncExternalStore } from "react";

export type Section = "personal" | "commissioned" | null;

let hovered: Section = null;
const listeners = new Set<() => void>();

export function setHoveredSection(next: Section) {
  if (next === hovered) return;
  hovered = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const getSnapshot = () => hovered;
const getServerSnapshot = (): Section => null;

export function useHoveredSection() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
