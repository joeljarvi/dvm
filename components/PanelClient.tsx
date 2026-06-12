"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { View } from "@/lib/types";

const clients = [
  "Björk & Berries",
  "Apoteket Hjärtat",
  "H&M",
  "IKEA",
  "Pressbyrån",
  "IfLyko",
  "Lendo",
  "KPMG",
  "Inika",
  "KÄLLA",
  "Åkestam Holst",
  "Bold",
  "NoA Ignite",
  "Bluebird",
];

const title = "Project title";

const year = 2026;

const container = {
  hidden: {
    transition: { staggerChildren: 0.06, staggerDirection: -1 },
  },
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: (x: number) => ({ opacity: 0, x }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

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

const pick = (palette: string[]) =>
  palette[Math.floor(Math.random() * palette.length)];

export default function PanelClient({
  view,
  panel,
}: {
  view: View;
  panel: "personal" | "commissioned";
}) {
  const palette = panel === "personal" ? PINK_SHADES : GREEN_SHADES;
  const xOffset = panel === "personal" ? -24 : 24;
  const [classes, setClasses] = useState<string[]>(
    Array.from({ length: 7 }, () => ""),
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const repick = () =>
    setClasses(Array.from({ length: 7 }, () => pick(palette)));

  useEffect(() => {
    repick();
  }, []);

  const hoverText =
    hoveredIndex !== null
      ? `${clients[hoveredIndex]}, ${title}, ${year}`
      : null;

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-dvh"
      onClick={(e) => {
        if (view !== panel) return;
        e.stopPropagation();
        repick();
      }}
    >
      <motion.div
        className="flex flex-col lg:flex-row gap-0 p-1 w-1/3 items-center justify-center h-full lg:h-[25vh] lg:w-auto lg:max-w-7xl"
        custom={xOffset}
        variants={container}
        initial="hidden"
        animate={view === panel ? "show" : "hidden"}
        onClick={(e) => e.stopPropagation()}
      >
        {classes.map((cls, index) => (
          <motion.div
            key={index}
            className={`aspect-3/4 h-full ${cls} ${index >= 6 ? "hidden lg:block" : ""}`}
            custom={xOffset}
            variants={item}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </motion.div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-2 pointer-events-none">
        {hoverText && <span>{hoverText}</span>}
      </div>
    </div>
  );
}
