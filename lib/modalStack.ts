import { useEffect, useRef } from "react";

// A stack of open modal layers, each with a close fn. The topmost entry is the
// "latest opened" — Escape (see Nav) closes it. Entries come from
// route layers (close = router.back) and internal overlays (close = setState).
type Entry = { id: number; close: () => void };

let stack: Entry[] = [];
let nextId = 1;

function pushModal(close: () => void): number {
  const id = nextId++;
  stack = [...stack, { id, close }];
  return id;
}

function popModal(id: number) {
  stack = stack.filter((e) => e.id !== id);
}

export function closeTop() {
  const top = stack[stack.length - 1];
  if (top) top.close();
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
