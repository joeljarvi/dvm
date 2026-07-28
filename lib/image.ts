// Build an optimized Sanity CDN image URL from a resolved asset URL.
// Sanity's CDN honors query params (w/h/q/auto/fit), turning multi-MB
// originals into right-sized, auto-formatted (webp/avif) images.
// Non-Sanity URLs (e.g. fallback data) are returned untouched.
export function sanityImage(
  url: string | undefined | null,
  { w, h, q = 75 }: { w?: number; h?: number; q?: number } = {},
): string | undefined {
  if (!url) return url ?? undefined;
  if (!url.includes("cdn.sanity.io")) return url;

  const params = new URLSearchParams({ auto: "format", fit: "max", q: String(q) });
  if (w) params.set("w", String(w));
  if (h) params.set("h", String(h));
  return `${url}?${params.toString()}`;
}
