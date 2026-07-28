import { useEffect, useRef, useSyncExternalStore } from "react";

// A stack of open modal layers, each with a close fn. The topmost entry is the
// "latest opened" — a single global close button pops it. Entries come from
// route layers (close = router.back) and internal overlays (close = setState).
type Entry = { id: number; close: () => void };

let stack: Entry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function pushModal(close: () => void): number {
  const id = nextId++;
  stack = [...stack, { id, close }];
  emit();
  return id;
}

function popModal(id: number) {
  const next = stack.filter((e) => e.id !== id);
  if (next.length !== stack.length) {
    stack = next;
    emit();
  }
}

export function closeTop() {
  const top = stack[stack.length - 1];
  if (top) top.close();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => stack.length;
const getServerSnapshot = () => 0;

export function useModalCount() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Register a modal layer while `active`. `close` is read fresh on each call.
export function useRegisterModal(active: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!active) return;
    const id = pushModal(() => closeRef.current());
    return () => popModal(id);
  }, [active]);
}
