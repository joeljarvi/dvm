export function sanityImage(
  url: string | undefined | null,
  {
    w,
    h,
    q = 75,
    blur,
  }: { w?: number; h?: number; q?: number; blur?: number } = {},
): string | undefined {
  if (!url) return url ?? undefined;
  if (!url.includes("cdn.sanity.io")) return url;

  const params = new URLSearchParams({
    auto: "format",
    fit: "max",
    q: String(q),
  });
  if (w) params.set("w", String(w));
  if (h) params.set("h", String(h));
  if (blur) params.set("blur", String(blur));
  return `${url}?${params.toString()}`;
}

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
