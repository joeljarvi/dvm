"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { useRegisterModal } from "@/lib/modalStack";
import { usePublishViewChrome } from "@/lib/viewChrome";
import { usePublishItem } from "@/lib/crumb";
import { useStepControls } from "@/lib/step";
import { Button } from "@/components/ui/button";
import { ReactLenis } from "lenis/react";
import { useIsDesktop } from "@/lib/media";

const PINK_SHADES = [
  "bg-pink-100",
  "bg-pink-200",
  "bg-pink-300",
  "bg-pink-400",
  "bg-pink-500",
  "bg-pink-600",
  "bg-pink-700",
  "bg-pink-800",
];

const GREEN_SHADES = [
  "bg-green-100",
  "bg-green-200",
  "bg-green-300",
  "bg-green-400",
  "bg-green-500",
  "bg-green-600",
  "bg-green-700",
  "bg-green-800",
];

const RATIOS = [
  "aspect-3/4",
  "aspect-16/9",
  "aspect-4/3",
  "aspect-9/16",
  "aspect-square",
  "aspect-2/3",
  "aspect-1/2",
];

const pick = (palette: string[]) =>
  palette[Math.floor(Math.random() * palette.length)];

const ease = [0.4, 0, 0.2, 1] as const;
const PLACEHOLDER_COUNT = 7;

// Self-contained project view, rendered by both the full page (/[view]/[slug])
// and the intercepted modal. Manages its own lightbox state.
export default function ProjectDetail({
  project,
  panel,
}: {
  project: Project;
  panel: "personal" | "commissioned";
}) {
  const palette = panel === "personal" ? PINK_SHADES : GREEN_SHADES;
  const hasImages = !!project.images?.length;

  const [placeholderColors, setPlaceholderColors] = useState<string[]>(
    Array.from({ length: PLACEHOLDER_COUNT }, () => ""),
  );
  const [placeholderRatios, setPlaceholderRatios] = useState<string[]>(
    Array.from({ length: PLACEHOLDER_COUNT }, () => "aspect-3/4"),
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setPlaceholderColors(
      Array.from({ length: PLACEHOLDER_COUNT }, () => pick(palette)),
    );
    setPlaceholderRatios(
      Array.from({ length: PLACEHOLDER_COUNT }, () => pick(RATIOS)),
    );
  }, []);

  const items = hasImages
    ? project.images!
    : Array.from({ length: PLACEHOLDER_COUNT });
  const itemCount = items.length;

  // The strip runs sideways once there is room for it to.
  const desktop = useIsDesktop();

  // The nav's breadcrumb tails off with which item is open, 1-based.
  usePublishItem(selectedIndex, itemCount, () => setSelectedIndex(null));

  const step = (delta: number) =>
    setSelectedIndex((i) =>
      i === null ? i : (i + delta + itemCount) % itemCount,
    );

  // Only while the lightbox is open — otherwise the arrows would step an
  // overlay that isn't showing.
  useStepControls(selectedIndex !== null, step);

  // The lightbox is a modal layer too — register it so the shared close button
  // closes it before the project layer underneath.
  useRegisterModal(
    selectedIndex !== null,
    () => setSelectedIndex(null),
    "Close",
  );

  usePublishViewChrome(
    <span className="flex items-center gap-x-2 font-selecta font-medium tracking-wider">
      {project.agency && (
        <span className="flex gap-x-2">
          <span>Agency:</span>
          <span className="italic">{project.agency}</span>
        </span>
      )}
      {project.credits?.map((c, i) => (
        <span className="" key={i}>
          {c.role}: <span className=" italic ">{c.name}</span>
        </span>
      ))}
    </span>,
  );

  return (
    <div
      className={`${panel === "personal" ? "bg-background" : "bg-background"} relative flex flex-col items-center justify-center w-full h-full `}
    >
      {/* Lenis owns this scroller rather than the page: the axis flips at lg,
          and orientation is fixed when the instance is built, so the key
          remounts it on the way across. The wrapper is what scrolls; the div
          inside lays the strip out, since Lenis renders its own content
          element between the two. */}
      <ReactLenis
        key={desktop ? "horizontal" : "vertical"}
        className="w-full h-full lg:h-dvh lg:flex lg:justify-center lg:items-center overflow-y-auto overflow-x-hidden lg:overflow-x-auto lg:overflow-y-hidden scrollbar-none [&::-webkit-scrollbar]:hidden"
        options={{
          orientation: desktop ? "horizontal" : "vertical",
          gestureOrientation: "both",
        }}
      >
        <div className="flex flex-wrap lg:flex-nowrap lg:flex-row gap-x-0 w-full lg:w-max px-8 pb-8 pt-16 lg:py-8 gap-y-16 items-center justify-center lg:justify-center-safe lg:h-[66.6dvh]">
          {items.map((item, index) => {
            const media = hasImages ? project.images![index] : null;
            return (
              <div
                key={index}
                className={`scale-100 mx-1 hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform w-full lg:w-auto lg:h-full cursor-pointer overflow-hidden ${
                  !media
                    ? `${placeholderRatios[index]} ${placeholderColors[index]}`
                    : ""
                } ${index >= 6 ? "hidden lg:block" : ""}`}
                onClick={() => setSelectedIndex(index)}
              >
                {media?.type === "image" && (
                  <img
                    src={sanityImage(media.url, { w: 800 })}
                    className="h-full w-full lg:w-auto object-contain "
                    alt=""
                  />
                )}
                {media?.type === "file" && (
                  <video
                    src={media.url}
                    className="h-full w-full lg:w-auto object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
              </div>
            );
          })}
        </div>
      </ReactLenis>

      {/* ITEM DETAIL — level 3, inset over the project grid */}
      <motion.div
        className="absolute inset-0 z-40"
        initial={{ opacity: 0, pointerEvents: "none" }}
        animate={{
          opacity: selectedIndex !== null ? 1 : 0,
          pointerEvents: selectedIndex !== null ? "auto" : "none",
        }}
        transition={{ duration: 0.4, ease }}
      >
        {/* catcher — grid stays visible around the inset, click to close */}
        <div
          className="absolute inset-0 bg-black/10 backdrop-blur-lg"
          onClick={() => setSelectedIndex(null)}
        />
        {/* inset card */}
        <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center overflow-hidden bg-background shadow-2xl ">
          {/* Opposite the breadcrumb, which the nav hangs off whichever
              section label you are inside: top-left in personal, top-right in
              commissioned. Above the step zones so it takes the click. */}
          <Button
            variant="link"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:bottom-auto lg:top-0 lg:left-0 lg:translate-x-0 px-2.5 z-30"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
          >
            Close
          </Button>

          {/* prev / next zones — the chevron lives in the cursor, not on screen */}
          <div
            className="absolute inset-y-0 left-0 z-10 w-1/2"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          />
          <div
            className="absolute inset-y-0 right-0 z-10 w-1/2"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          />

          {selectedIndex !== null &&
            (() => {
              const media = hasImages ? project.images![selectedIndex] : null;
              const advance = (e: React.MouseEvent) => {
                e.stopPropagation();
                setSelectedIndex((selectedIndex + 1) % itemCount);
              };
              return (
                <div className="flex flex-col px-8">
                  {media ? (
                    media.type === "image" ? (
                      <img
                        src={sanityImage(media.url, { w: 1600, q: 80 })}
                        className="relative z-20 h-[66.6dvh] w-auto max-w-xs lg:max-w-3xl object-contain cursor-pointer"
                        alt=""
                        onClick={advance}
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="relative z-20 h-[66.6dvh] w-auto max-w-xs lg:max-w-3xl object-contain cursor-pointer"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onClick={advance}
                      />
                    )
                  ) : (
                    <div
                      className={`relative  z-20 ${placeholderRatios[selectedIndex]} h-[25vh] max-w-xs lg:max-w-3xl ${placeholderColors[selectedIndex]} cursor-pointer`}
                      onClick={advance}
                    />
                  )}
                </div>
              );
            })()}
        </div>
      </motion.div>
    </div>
  );
}
