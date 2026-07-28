"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { arrowCursor } from "@/lib/cursor";
import { useRegisterModal } from "@/lib/modalStack";
import MetadataBar from "./MetadataBar";

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

  const step = (delta: number) =>
    setSelectedIndex((i) =>
      i === null ? i : (i + delta + itemCount) % itemCount,
    );

  // The lightbox is a modal layer too — register it so the shared close button
  // closes it before the project layer underneath.
  useRegisterModal(selectedIndex !== null, () => setSelectedIndex(null));

  return (
    <div
      className={`${panel === "personal" ? "bg-neutral-300" : "bg-neutral-400"} relative flex flex-col items-center justify-center w-full h-full`}
    >
      <div className="flex flex-wrap lg:flex-row gap-x-2 p-0 w-full h-full overflow-y-scroll scrollbar-none [&::-webkit-scrollbar]:hidden items-center justify-center lg:h-[25vh] lg:w-auto">
        {items.map((item, index) => {
          const media = hasImages ? project.images![index] : null;
          return (
            <div
              key={index}
              className={`w-full lg:w-auto lg:h-full cursor-pointer overflow-hidden ${
                !media
                  ? `${placeholderRatios[index]} ${placeholderColors[index]}`
                  : ""
              } ${index >= 6 ? "hidden lg:block" : ""}`}
              onClick={() => setSelectedIndex(index)}
            >
              {media?.type === "image" && (
                <img
                  src={sanityImage(media.url, { w: 800 })}
                  className="h-full w-full object-cover"
                  alt=""
                />
              )}
              {media?.type === "file" && (
                <video
                  src={media.url}
                  className="h-full w-full object-cover"
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

      {/* agency top-left everywhere; credits top-right on desktop, bottom-left on mobile */}
      <MetadataBar
        className="z-10 absolute top-2 px-2.5 h-8"
        left={project.agency && <span>{project.agency}</span>}
        right={
          <span className="hidden lg:flex items-center gap-x-2">
            {project.credits?.map((c, i) => (
              <span key={i}>
                {c.role}: {c.name}
              </span>
            ))}
          </span>
        }
      />
      {project.credits?.length ? (
        <MetadataBar
          className="z-10 absolute bottom-2 px-2.5 h-8 lg:hidden"
          left={
            <span className="flex items-center gap-x-2">
              {project.credits.map((c, i) => (
                <span key={i}>
                  {c.role}: {c.name}
                </span>
              ))}
            </span>
          }
        />
      ) : null}

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
          className="absolute inset-0"
          onClick={() => setSelectedIndex(null)}
        />

        {/* inset card */}
        <div className="absolute inset-x-2 top-2 lg:inset-x-4 lg:top-4 bottom-2 lg:bottom-4 flex items-center justify-center overflow-hidden bg-background shadow-2xl ">
          {/* prev / next arrow zones */}
          <div
            className="absolute inset-y-0 left-0 z-10 w-1/2"
            style={{ cursor: arrowCursor("left") }}
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          />
          <div
            className="absolute inset-y-0 right-0 z-10 w-1/2"
            style={{ cursor: arrowCursor("right") }}
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
                <>
                  {media ? (
                    media.type === "image" ? (
                      <img
                        src={sanityImage(media.url, { w: 1600, q: 80 })}
                        className="relative z-20 h-[66.6vh] w-auto max-w-xs lg:max-w-3xl object-contain cursor-pointer"
                        alt=""
                        onClick={advance}
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="relative z-20 h-[66.6vh] w-auto max-w-xs lg:max-w-3xl object-contain cursor-pointer"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onClick={advance}
                      />
                    )
                  ) : (
                    <div
                      className={`relative z-20 ${placeholderRatios[selectedIndex]} h-[66.6vh] max-w-xs lg:max-w-3xl ${placeholderColors[selectedIndex]} cursor-pointer`}
                      onClick={advance}
                    />
                  )}
                </>
              );
            })()}
        </div>
      </motion.div>
    </div>
  );
}
