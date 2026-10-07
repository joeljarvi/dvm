// Where the pointer last was, so the project page's full-screen watermark
// (see NameMark) can open on it rather than sitting at its starting position
// until the first move. Null until the pointer has moved at all this page
// load.
let pointer: { x: number; y: number } | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    pointer = { x: e.clientX, y: e.clientY };
  });
}

export function lastPointer() {
  return pointer;
}
