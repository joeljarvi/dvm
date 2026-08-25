import { useSyncExternalStore } from "react";

// Which section the pointer is over on the home page. The panels are their own
// component but the nav has to echo them — hovering a panel marks the matching
// nav button — so the state lives here rather than in either one.
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
