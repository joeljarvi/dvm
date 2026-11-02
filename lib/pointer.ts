let pointer: { x: number; y: number } | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    pointer = { x: e.clientX, y: e.clientY };
  });
}

export function lastPointer() {
  return pointer;
}
