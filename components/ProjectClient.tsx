"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";
import MetadataBar from "./MetadataBar";
import { Button } from "@/components/ui/button";

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

export default function ProjectClient({
  panel,
  project,
  dataIndex,
  itemDetailOpen,
  setItemDetailOpen,
  infoVisible,
}: {
  panel: "personal" | "commissioned";
  isOpen: boolean;
  project: Project | undefined;
  dataIndex: number;
  itemDetailOpen: boolean;
  setItemDetailOpen: (open: boolean) => void;
  infoVisible: boolean;
}) {
  const palette = panel === "personal" ? PINK_SHADES : GREEN_SHADES;
  const hasImages = !!project?.images?.length;

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

  useEffect(() => {
    if (!itemDetailOpen) setSelectedIndex(null);
  }, [itemDetailOpen]);

  const serial = `${panel === "personal" ? "PER" : "COM"}${String(dataIndex + 1).padStart(4, "0")}`;

  const items = hasImages
    ? project!.images!
    : Array.from({ length: PLACEHOLDER_COUNT });
  const itemCount = items.length;

  const credits = project?.credits?.length ? (
    <span className="flex flex-col items-center lg:items-end gap-0.5">
      {project.credits.map((c, i) => (
        <span key={i}>
          {c.role}: {c.name}
        </span>
      ))}
    </span>
  ) : null;

  return (
    <div
      className={`${panel === "personal" ? "bg-neutral-300" : "bg-neutral-400"} absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center h-[calc(100dvh-2.75rem)]`}
    >
      <div
        className="flex flex-wrap lg:flex-row gap-x-2 p-0 w-full h-dvh overflow-y-scroll scrollbar-none [&::-webkit-scrollbar]:hidden items-center justify-center lg:h-[25vh] lg:w-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => {
          const media = hasImages ? project!.images![index] : null;
          return (
            <div
              key={index}
              className={`w-full lg:w-auto lg:h-full cursor-pointer overflow-hidden ${
                !media
                  ? `${placeholderRatios[index]} ${placeholderColors[index]}`
                  : ""
              } ${index >= 6 ? "hidden lg:block" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(index);
                setItemDetailOpen(true);
              }}
            >
              {media?.type === "image" && (
                <img
                  src={media.url}
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

      {infoVisible && (
        <>
          {/* Top bar: mobile = stacked center; desktop = serial | title | client */}
          <MetadataBar
            stackOnMobile
            className="absolute top-1/2 -translate-y-1/2 lg:hidden text-xl mix-blend-difference text-white w-full"
            left={
              <>
                <span className="hidden lg:inline">{serial}</span>
                <span className="lg:hidden">{project?.client}</span>
              </>
            }
            center={project?.title}
            right={
              <>
                <span className="hidden lg:inline ">{project?.client}</span>
                <span className="lg:hidden">{credits}</span>
              </>
            }
          />
          {/*  desktop only — agency | credits | year */}
          <MetadataBar
            className="hidden  lg:flex absolute top-0 mix-blend-difference text-background h-8"
            left={project?.agency}
            center={credits}
            right={project?.year ? String(project.year) : undefined}
          />
        </>
      )}

      {/* ITEM DETAIL OVERLAY */}
      <motion.div
        className={`absolute top-2.5 lg:top-5  bottom-0 z-20 flex items-center justify-center ${
          panel === "personal"
            ? "left-0 right-2.5 lg:right-2.5"
            : "right-0 left-2.5 lg:left-2.5"
        } bg-neutral-900 cursor-pointer`}
        initial={{ x: panel === "commissioned" ? "100%" : "-100%" }}
        animate={{
          x:
            selectedIndex !== null
              ? "0%"
              : panel === "commissioned"
                ? "100%"
                : "-100%",
        }}
        transition={{ duration: 0.6, ease }}
        onClick={() => {
          setSelectedIndex(null);
          setItemDetailOpen(false);
        }}
      >
        <Button
          className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 z-30 hover:text-pink-400 text-background"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIndex(null);
            setItemDetailOpen(false);
          }}
        >
          close
        </Button>
        {selectedIndex !== null &&
          (() => {
            const media = hasImages ? project!.images![selectedIndex] : null;
            const advance = (e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedIndex((selectedIndex + 1) % itemCount);
            };
            return (
              <>
                {media ? (
                  media.type === "image" ? (
                    <img
                      src={media.url}
                      className="h-[66.6vh] w-auto max-w-xs lg:max-w-3xl object-contain cursor-pointer"
                      alt=""
                      onClick={advance}
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="h-[66.6vh] w-auto max-w-xs lg:max-w-3xl object-contain cursor-pointer"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onClick={advance}
                    />
                  )
                ) : (
                  <div
                    className={`${placeholderRatios[selectedIndex]} h-[66.6vh] max-w-xs lg:max-w-3xl ${placeholderColors[selectedIndex]} cursor-pointer`}
                    onClick={advance}
                  />
                )}

                {infoVisible && (
                  <MetadataBar
                    className="absolute bottom-2 block lg:hidden"
                    center={`${selectedIndex + 1} (${String(itemCount).padStart(4, "0")})`}
                  />
                )}
              </>
            );
          })()}
      </motion.div>
    </div>
  );
}
