import type { ProjectMedia } from "@/lib/types";
import {
  COVER_FRAME_CLASS,
  COVER_STAGE_CLASS,
  MEDIA_CLASS,
  mediaSrc,
} from "@/components/HomeClient";

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
 *   Safari clips the blur, so it fades out before it gets there.
 */
export default function BlurredPreview({
  media,
  alt = "",
  className = "",
}: {
  media: ProjectMedia;
  alt?: string;
  /** Extra classes for the stage, e.g. padding. */
  className?: string;
}) {
  return (
    <div
      className={`h-dvh blur-xs opacity-30 dark:opacity-10 ${COVER_STAGE_CLASS} ${className}`}
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
