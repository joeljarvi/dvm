import type { CSSProperties } from "react";
import type { ProjectMedia } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import {
  COVER_FRAME_CLASS,
  COVER_STAGE_CLASS,
  MEDIA_CLASS,
} from "@/components/HomeClient";

// The media's edges, feathered out by a mask rather than a blur: Safari
// blurs an image or video drawn on a layer of its own only inside its own
// bounds, leaving a hard rectangle round it. A mask it renders cleanly.
const FEATHER = "18px";
const feather = (dir: string) =>
  `linear-gradient(${dir}, transparent, black ${FEATHER}, black calc(100% - ${FEATHER}), transparent)`;
const FEATHERED: CSSProperties = {
  maskImage: `${feather("to right")}, ${feather("to bottom")}`,
  maskComposite: "intersect",
  WebkitMaskImage: `${feather("to right")}, ${feather("to bottom")}`,
  WebkitMaskComposite: "source-in",
};

// Sanity's CDN blurs the image itself — its `blur` measured against the
// original, so it reads lighter than the number suggests; 90 matches the
// CSS blur-xs this replaced.
const CDN_BLUR = 90;

/**
 * Media laid out like a home cover, dimmed and blurred, for the background
 * of Index (the hovered project) and About (the bio image). Callers place it.
 *
 * Built around Safari, which has drawn a hard edge around it every other way:
 * - images come blurred from Sanity's CDN rather than through a CSS filter —
 *   Safari draws an image or video on a layer of its own and blurs it only
 *   inside its own bounds, so the blur stopped dead at a hard rectangle;
 * - their edges are feathered with a mask (FEATHERED), which Safari renders
 *   cleanly, for the soft edge the filter gave elsewhere;
 * - videos (and local placeholder images) can't come blurred, so they keep
 *   the CSS blur, on the full-height stage, never animated, with the stage's
 *   padding keeping the media well inside it — and the same feathered mask,
 *   so whatever edge Safari draws fades out;
 * - the stage is filled with the page's background, so anything blurring out
 *   blurs into that colour, not transparency (which leaves a fringe).
 */
export default function BlurredPreview({
  media,
  alt = "",
  className = "",
  sharp = false,
}: {
  media: ProjectMedia;
  alt?: string;
  /** Extra classes for the stage, e.g. padding. */
  className?: string;
  /** Unblurred, with hard edges. */
  sharp?: boolean;
}) {
  // A Sanity image comes blurred from the CDN; anything else (a video, a
  // local placeholder) falls back to the CSS blur.
  const cdnImage =
    media.type === "image" && media.url.includes("cdn.sanity.io");
  const cssBlur = !sharp && !cdnImage;
  return (
    // A dimmed copy of media shown elsewhere — decorative, so hidden from
    // screen readers.
    <div
      aria-hidden
      // px-12 inside the stage (not around it): the media never reaches the
      // stage's sides, where Safari cuts a CSS blur off.
      className={`w-full h-dvh bg-background ${cssBlur ? "blur-xs" : ""} opacity-30 dark:opacity-10 ${COVER_STAGE_CLASS} px-12 ${className}`}
    >
      <div className={COVER_FRAME_CLASS}>
        <div
          className="relative inline-flex max-h-full max-w-full"
          style={sharp ? undefined : FEATHERED}
        >
          {media.type === "file" ? (
            <video
              key={media.url}
              src={media.url}
              autoPlay
              muted
              loop
              playsInline
              aria-label={alt}
              className={MEDIA_CLASS}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                cdnImage
                  ? sanityImage(media.url, {
                      // Blurred, it needs far fewer pixels.
                      w: sharp ? 1400 : 600,
                      blur: sharp ? undefined : CDN_BLUR,
                    })
                  : media.url
              }
              alt={alt}
              className={MEDIA_CLASS}
            />
          )}
        </div>
      </div>
    </div>
  );
}
