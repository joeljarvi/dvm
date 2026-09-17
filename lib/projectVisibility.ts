import { useSyncExternalStore } from "react";

// Whether each category's Index list (and the carousel behind it) shows the
// curated projects only, or those plus the placeholder "Boring Client" ones —
// see lib/data's extraClients. Same shape as lib/section.ts: the Index
// overlay's own toggle writes it, the carousel reads it back to grow its list
// to match. Kept per category — Personal's toggle never touches Commissioned's
// list, and vice versa.
export type Visibility = "selected" | "all";
export type Category = "personal" | "commissioned";

let mode: Record<Category, Visibility> = {
  personal: "selected",
  commissioned: "selected",
};
const listeners = new Set<() => void>();

export function setProjectVisibility(category: Category, next: Visibility) {
  if (mode[category] === next) return;
  mode = { ...mode, [category]: next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useProjectVisibility(category: Category) {
  return useSyncExternalStore(
    subscribe,
    () => mode[category],
    () => "selected" as Visibility,
  );
}
