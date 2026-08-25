import { useEffect, useRef, useSyncExternalStore } from "react";

// A stack of open modal layers, each with a close fn. The topmost entry is the
// "latest opened" — a single global close button pops it. Entries come from
// route layers (close = router.back) and internal overlays (close = setState).
// A label is what opts a layer into the nav's shared close button, and names
// it. Most layers pass none: you leave a browser or a project by going back,
// and only the item detail puts a close up.
type Entry = { id: number; close: () => void; label: string | null };

let stack: Entry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function pushModal(close: () => void, label: string | null): number {
  const id = nextId++;
  stack = [...stack, { id, close, label }];
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

const getLabel = () => stack[stack.length - 1]?.label ?? null;
const getServerLabel = () => null;

// What the nav's shared close button should call itself, or null when the top
// layer offers none — which is the nav's cue not to render one at all.
export function useCloseLabel() {
  return useSyncExternalStore(subscribe, getLabel, getServerLabel);
}

// Register a modal layer while `active`. `close` is read fresh on each call.
export function useRegisterModal(
  active: boolean,
  close: () => void,
  label: string | null = null,
) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!active) return;
    const id = pushModal(() => closeRef.current(), label);
    return () => popModal(id);
  }, [active, label]);
}
