"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

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

const title = "Project title";
const year = 2026;
const ease = [0.4, 0, 0.2, 1] as const;

export default function ProjectClient({
  panel,
  list,
  itemDetailOpen,
  setItemDetailOpen,
}: {
  panel: "personal" | "commissioned";
  isOpen: boolean;
  list: string;
  itemDetailOpen: boolean;
  setItemDetailOpen: (open: boolean) => void;
}) {
  const palette = panel === "personal" ? PINK_SHADES : GREEN_SHADES;
  const [classes, setClasses] = useState<string[]>(
    Array.from({ length: 7 }, () => ""),
  );
  const [ratioClasses, setRatioClasses] = useState<string[]>(
    Array.from({ length: 7 }, () => "aspect-3/4"),
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  useEffect(() => {
    setClasses(Array.from({ length: 7 }, () => pick(palette)));
    setRatioClasses(Array.from({ length: 7 }, () => pick(RATIOS)));
  }, []);

  useEffect(() => {
    if (!itemDetailOpen) setSelectedItem(null);
  }, [itemDetailOpen]);

  return (
    <div
      className={`${panel === "personal" ? "bg-neutral-300" : "bg-neutral-400"} absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center h-[calc(100dvh-0.5rem)]`}
    >
      <div
        className="flex flex-wrap lg:flex-row gap-0 p-0 w-full h-dvh overflow-y-scroll scrollbar-none [&::-webkit-scrollbar]:hidden items-center justify-center lg:h-[25vh] lg:w-auto "
        onClick={(e) => e.stopPropagation()}
      >
        {classes.map((cls, index) => (
          <div
            key={index}
            className={`${ratioClasses[index]} w-full lg:w-auto lg:h-full ${cls} cursor-pointer ${index >= 6 ? "hidden lg:block" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(index);
              setItemDetailOpen(true);
            }}
          />
        ))}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 lg:top-auto lg:translate-y-0 lg:bottom-0 pointer-events-none flex items-center">
        <span className="font-selecta font-medium text-sm flex flex-col lg:flex-row justify-center gap-0 items-center pb-1.5 lg:items-baseline lg:gap-16 uppercase tracking-wide">
          <span>{list}</span>
          {panel === "commissioned" && <span>{title}</span>}
          <span>{year}</span>
        </span>
      </div>

      {/* ITEM DETAIL OVERLAY */}
      <motion.div
        className={`absolute top-2 bottom-0 z-20 flex items-center justify-center ${
          panel === "personal"
            ? "left-0 right-2"
            : "right-0 left-2"
        } bg-neutral-100 cursor-pointer`}
        initial={{ x: panel === "commissioned" ? "100%" : "-100%" }}
        animate={{
          x:
            selectedItem !== null
              ? "0%"
              : panel === "commissioned"
                ? "100%"
                : "-100%",
        }}
        transition={{ duration: 0.6, ease }}
        onClick={() => {
          setSelectedItem(null);
          setItemDetailOpen(false);
        }}
      >
        {selectedItem !== null && (
          <div
            className={`${ratioClasses[selectedItem]} h-[66.6vh] max-w-xs lg:max-w-3xl ${classes[selectedItem]} cursor-pointer`}
            onClick={(e) => {
              e.stopPropagation();
              if (classes.length > 1) {
                setSelectedItem((selectedItem + 1) % classes.length);
              } else {
                setSelectedItem(null);
                setItemDetailOpen(false);
              }
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
