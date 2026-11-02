import { useEffect, useRef } from "react";

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

export function useRegisterModal(active: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!active) return;
    const id = pushModal(() => closeRef.current());
    return () => popModal(id);
  }, [active]);
}
