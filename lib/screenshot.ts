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
