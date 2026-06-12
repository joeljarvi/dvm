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
      className={`${panel === "personal" ? "bg-neutral-300" : "bg-neutral-400"} relative flex flex-col items-center justify-center w-full h-full bg-inherit shadow`}
    >
      <div
        className="flex flex-wrap lg:flex-row gap-0 p-0 w-full h-dvh overflow-y-scroll scrollbar-none [&::-webkit-scrollbar]:hidden items-center justify-center lg:h-[25vh] lg:w-auto lg:max-w-7xl"
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

      <div className="fixed lg:absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 lg:top-auto lg:translate-y-0 lg:bottom-0 pointer-events-none flex items-center">
        <span className="font-selecta font-medium text-sm flex flex-col lg:flex-row justify-center gap-0 items-center pb-1.5 lg:items-baseline lg:gap-16 uppercase tracking-wide">
          <span>{list}</span>
          {panel === "commissioned" && <span>{title}</span>}
          <span>{year}</span>
        </span>
      </div>

      {/* ITEM DETAIL OVERLAY */}
      <motion.div
        className={`absolute inset-0 z-20 overflow-hidden flex items-center justify-center ${panel === "personal" ? "bg-neutral-400" : "bg-neutral-500"} cursor-pointer`}
        initial={{ y: "-100%" }}
        animate={{ y: selectedItem !== null ? "0%" : "-100%" }}
        transition={{ duration: 0.6, ease }}
        onClick={() => {
          const next = Math.floor(Math.random() * classes.length);
          setSelectedItem(
            next === selectedItem ? (next + 1) % classes.length : next,
          );
        }}
      >
        {selectedItem !== null && (
          <div
            className={`${ratioClasses[selectedItem]} h-[66.6vh] max-w-xs lg:max-w-3xl ${classes[selectedItem]}`}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 font-selecta font-medium text-sm uppercase tracking-wide pb-1.5 hover:text-pink-400"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(null);
            setItemDetailOpen(false);
          }}
        >
          close
        </button>
      </motion.div>
    </div>
  );
}
