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

// Alt text for a project's image or video: its own alt text from Sanity, or
// its caption, or failing those where it sits in the project — "Title –
// image 2 of 5".
export function mediaAlt(
  title: string,
  media: { type: "image" | "file"; caption?: string; alt?: string },
  index: number,
  total: number,
): string {
  if (media.alt?.trim()) return media.alt.trim();
  if (media.caption) return media.caption;
  const kind = media.type === "file" ? "video" : "image";
  return `${title} – ${kind} ${index + 1} of ${total}`;
}
