// Chevron-shaped CSS cursor, standing in for on-screen prev/next arrows: a
// hairline stroke in a 70 × 70 box. The tip sits a little in from the edge so
// its miter has room and doesn't clip.
const CHEVRON_PATH = {
  left: "M69 1L3 35L69 69",
  right: "M1 1L67 35L1 69",
} as const;

export function arrowCursor(dir: "left" | "right") {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70' fill='none'><path d='${CHEVRON_PATH[dir]}' stroke='black' stroke-width='1'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 35 35, pointer`;
}
