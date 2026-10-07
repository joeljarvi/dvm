import type { ProjectMedia } from "@/lib/types";
import {
  COVER_FRAME_CLASS,
  COVER_STAGE_CLASS,
  MEDIA_CLASS,
  mediaSrc,
} from "@/components/HomeClient";
import { ENTRANCE_CLASS } from "@/lib/motion";

/**
 * Media laid out like a home cover, dimmed and blurred, for the background
 * of Index (the hovered project) and About (the bio image). Callers place it.
 *
 * Built around Safari, which has drawn a hard edge around it every other way:
 * - a backdrop-blur over it gets a hard edge of its own;
 * - blur and dimming sit together on the full-height stage, not on the media,
 *   so the media isn't split off into a layer of its own and blurred alone;
 * - nothing between stage and media clips (unlike a cover's box), so the blur
 *   is never cut at the media's edge;
 * - the stage's padding keeps the media well inside the stage's box, where
 *   Safari clips the blur, so it fades out before it gets there;
 * - the stage is filled with the page's background, inside the blur, so the
 *   media's edge blurs into that colour — against transparency Safari leaves
 *   a fringe there. The fill's own edge then sits on the same background and
 *   doesn't show.
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
  /** Unblurred, slowly. The blur goes to 0px rather than none, so it
   * animates both ways. */
  sharp?: boolean;
}) {
  return (
    // A dimmed copy of media shown elsewhere — decorative, so hidden from
    // screen readers.
    <div
      aria-hidden
      className={`w-full h-dvh bg-background ${sharp ? "blur-[0px]" : "blur-xs"} transition-[filter] ${ENTRANCE_CLASS} opacity-30 dark:opacity-10 ${COVER_STAGE_CLASS} ${className}`}
    >
      <div className={COVER_FRAME_CLASS}>
        <div className="relative inline-flex max-h-full max-w-full">
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
            <img src={mediaSrc(media.url)} alt={alt} className={MEDIA_CLASS} />
          )}
        </div>
      </div>
    </div>
  );
}
