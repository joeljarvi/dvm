import { useEffect, useRef, useSyncExternalStore } from "react";

// The tail of the nav's breadcrumb. The nav draws it, but only the views know
// where they have been stepped to — and unlike a project's slug, none of it is
// in the URL. Same shape as lib/hover and lib/viewChrome.
//
// Two independent slots, because a project layered over a browser leaves both
// mounted and publishing at once: one would otherwise overwrite the other.
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// --- the cover a section browser is showing -------------------------------
let client: string | null = null;

/** Publish the browser's current project while the view is mounted. */
export function usePublishBrowsing(next: string | null | undefined) {
  useEffect(() => {
    const value = next ?? null;
    if (value !== client) {
      client = value;
      emit();
    }
    return () => {
      if (client === null) return;
      client = null;
      emit();
    };
  }, [next]);
}

export function useBrowsing() {
  return useSyncExternalStore(
    subscribe,
    () => client,
    (): string | null => null,
  );
}

// --- which item of a project is open --------------------------------------
export type Item = { index: number; count: number };

// Held as one object so the snapshot keeps a stable identity between reads —
// building a fresh one per call would spin useSyncExternalStore.
let item: Item | null = null;

// How the nav closes the item it is naming. Held outside the store because it
// is a handle, not state — nothing re-renders when it changes.
let closer: (() => void) | null = null;

/** Close whatever item is open, from anywhere. No-op if none is. */
export function closeItem() {
  closer?.();
}

/**
 * Publish the open item's position, or null once it closes. `onClose` is kept
 * in a ref so a fresh closure each render doesn't churn the subscription.
 */
export function usePublishItem(
  index: number | null,
  count: number,
  onClose?: () => void,
) {
  const latest = useRef(onClose);
  useEffect(() => {
    latest.current = onClose;
  });

  useEffect(() => {
    closer = () => latest.current?.();
    return () => {
      closer = null;
    };
  }, []);

  useEffect(() => {
    item = index === null ? null : { index, count };
    emit();
    return () => {
      if (item === null) return;
      item = null;
      emit();
    };
  }, [index, count]);
}

export function useItem() {
  return useSyncExternalStore(
    subscribe,
    () => item,
    (): Item | null => null,
  );
}
