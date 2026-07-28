// Arrow-shaped CSS cursor (white with a black outline so it reads on any image).
const ARROW_PATH = {
  left: "M19 12H5 M12 19l-7-7 7-7",
  right: "M5 12h14 M12 5l7 7-7 7",
} as const;

export function arrowCursor(dir: "left" | "right") {
  const d = ARROW_PATH[dir];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='${d}' stroke='black' stroke-width='4'/><path d='${d}' stroke='white' stroke-width='2'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 20 20, pointer`;
}
