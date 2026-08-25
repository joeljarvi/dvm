import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

// The metadata line the nav renders on behalf of whatever view is on top.
// Views publish while mounted and the topmost entry wins, so a project layered
// over a browser takes over. Same stack shape as modalStack. Stepping lives
// with the views themselves — the arrows sit in their own click zones, either
// side of the image.
type Entry = { id: number; metadata: ReactNode };

let stack: Entry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getMetadata = () => stack[stack.length - 1]?.metadata ?? null;
const getNull = () => null;

export function useMetadata() {
  return useSyncExternalStore(subscribe, getMetadata, getNull);
}

// Publish this view's metadata while mounted. It re-publishes whenever the
// node changes, so the nav tracks e.g. the browser's current project.
export function usePublishViewChrome(metadata: ReactNode) {
  const idRef = useRef(0);

  useEffect(() => {
    const id = idRef.current || (idRef.current = nextId++);
    const entry = { id, metadata };
    stack = stack.some((e) => e.id === id)
      ? stack.map((e) => (e.id === id ? entry : e))
      : [...stack, entry];
    emit();
  }, [metadata]);

  useEffect(
    () => () => {
      stack = stack.filter((e) => e.id !== idRef.current);
      emit();
    },
    [],
  );
}
