// Redraws a full-screen layer onto a canvas, as it currently looks on screen:
// its background, its image or video where it sits, and the NameMark words
// (`[data-name-word]`) at their own positions, fonts, colours and fades —
// turned a quarter for the ones inside `[data-turned]`. Nothing else in the
// layer is drawn. The media has to be readable cross-origin (`crossOrigin`
// set, CDN sending CORS) or the canvas can't be exported.
//
// `cropToMedia` trims it to the image itself — its own aspect ratio, none of
// the viewport around it — keeping whatever of the watermark falls on it.
// The across name's ends (`[data-across]`) are moved in to the image's own
// edges then, the same gutter in from them as from the screen's, so the
// line spans the image rather than running off it.
export async function captureLayer(
  layer: HTMLElement,
  { cropToMedia = false }: { cropToMedia?: boolean } = {},
): Promise<Blob> {
  await document.fonts.ready;

  const media = layer.querySelector<HTMLImageElement | HTMLVideoElement>(
    "img, video",
  );
  const mediaRect = media?.getBoundingClientRect();
  const area =
    cropToMedia && mediaRect
      ? mediaRect
      : new DOMRect(0, 0, window.innerWidth, window.innerHeight);

  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * dpr);
  canvas.height = Math.round(area.height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context");
  ctx.scale(dpr, dpr);
  ctx.translate(-area.left, -area.top);

  ctx.fillStyle = getComputedStyle(layer).backgroundColor;
  ctx.fillRect(area.left, area.top, area.width, area.height);

  if (media && mediaRect) {
    // With object-fit: cover (a fixed-ratio frame), only the centre of the
    // source shows — take just that part.
    const sw =
      media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    const sh =
      media instanceof HTMLVideoElement
        ? media.videoHeight
        : media.naturalHeight;
    let sx = 0;
    let sy = 0;
    let cw = sw;
    let ch = sh;
    if (getComputedStyle(media).objectFit === "cover" && sw && sh) {
      const scale = Math.max(mediaRect.width / sw, mediaRect.height / sh);
      cw = mediaRect.width / scale;
      ch = mediaRect.height / scale;
      sx = (sw - cw) / 2;
      sy = (sh - ch) / 2;
    }
    ctx.drawImage(
      media,
      sx,
      sy,
      cw,
      ch,
      mediaRect.left,
      mediaRect.top,
      mediaRect.width,
      mediaRect.height,
    );
  }

  layer.querySelectorAll<HTMLElement>("[data-name-word]").forEach((word) => {
    const style = getComputedStyle(word);
    const opacity = Number(style.opacity);
    if (
      !opacity ||
      !word.textContent ||
      style.visibility === "hidden" ||
      !word.getClientRects().length
    )
      return;

    // The text's own box, not the element's — a grid cell stretches that
    // to the whole column.
    const range = document.createRange();
    range.selectNodeContents(word);
    const r = range.getBoundingClientRect();
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = style.color;
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = style.letterSpacing;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // From the text's centre — for a turned word, its box on screen is
    // already the rotated one.
    let cx = r.left + r.width / 2;
    const end = word.dataset.across;
    if (cropToMedia && mediaRect && end) {
      const row = word.parentElement;
      const gutter = row ? parseFloat(getComputedStyle(row).paddingLeft) : 0;
      cx =
        end === "start"
          ? mediaRect.left + gutter + r.width / 2
          : mediaRect.right - gutter - r.width / 2;
    }
    ctx.translate(cx, r.top + r.height / 2);
    if (word.closest("[data-turned]")) ctx.rotate(Math.PI / 2);
    ctx.fillText(word.textContent, 0, 0);
    ctx.restore();
  });

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Empty canvas"))),
      "image/png",
    ),
  );
}
