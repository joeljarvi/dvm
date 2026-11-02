import type { CSSProperties } from "react";
import type { ProjectMedia } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import {
  COVER_FRAME_CLASS,
  COVER_STAGE_CLASS,
  MEDIA_CLASS,
} from "@/components/HomeClient";

const FEATHER = "18px";
const feather = (dir: string) =>
  `linear-gradient(${dir}, transparent, black ${FEATHER}, black calc(100% - ${FEATHER}), transparent)`;
const FEATHERED: CSSProperties = {
  maskImage: `${feather("to right")}, ${feather("to bottom")}`,
  maskComposite: "intersect",
  WebkitMaskImage: `${feather("to right")}, ${feather("to bottom")}`,
  WebkitMaskComposite: "source-in",
};

const CDN_BLUR = 90;

export default function BlurredPreview({
  media,
  alt = "",
  className = "",
  sharp = false,
}: {
  media: ProjectMedia;
  alt?: string;

  className?: string;

  sharp?: boolean;
}) {
  const cdnImage =
    media.type === "image" && media.url.includes("cdn.sanity.io");
  const cssBlur = !sharp && !cdnImage;
  return (
    <div
      aria-hidden
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
