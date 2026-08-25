"use client";

import { cn } from "@/lib/utils";
import { useMetadata } from "@/lib/viewChrome";
import { chip } from "@/lib/chip";

// One container, rendered by the nav: the metadata for whichever view is on
// top. Prev/next belong to the views, not here. See lib/viewChrome.
export default function MetadataBar({
  className,
  textColor,
}: {
  className?: string;
  textColor?: string;
}) {
  const content = useMetadata();
  if (!content) return null;

  return (
    <div
      className={cn(
        "flex items-baseline justify-start lg:justify-center font-selecta w-min  px-0 gap-x-2",
        className,
      )}
    >
      {/* `chip` goes first so twMerge lets the bar's own sizing and fill win
          over it. The plate stays frosted rather than solid — the cutout still
          reads through a translucent background, and the metadata sits over
          artwork often enough that an opaque bar would fight it. */}
      <span
        className={`flex-1 flex items-start justify-start lg:justify-center gap-x-3  px-0 text-xl leading-[0.6] tracking-wider text-left w-min lg:w-full whitespace-nowrap pointer-events-none ${textColor}`}
      >
        {content}
      </span>
    </div>
  );
}
