"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { View } from "@/lib/types";
import ProjectClient from "./ProjectClient";

const ratios = ["aspect-3/4", "aspect-16/9", "aspect-4/3", "aspect-9/16"];

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

const ease = [0.4, 0, 0.2, 1] as const;

export default function PanelClient({
  view,
  panel,
  list,
  title,
  year,
  projectOpen,
  setProjectOpen,
  itemDetailOpen,
  setItemDetailOpen,
}: {
  view: View;
  panel: "personal" | "commissioned";
  list: string[];
  title: string;
  year: number;
  projectOpen: boolean;
  setProjectOpen: (open: boolean) => void;
  itemDetailOpen: boolean;
  setItemDetailOpen: (open: boolean) => void;
}) {
  const palette = panel === "personal" ? PINK_SHADES : GREEN_SHADES;

  const [color, setColor] = useState("");
  const [ratio, setRatio] = useState("aspect-3/4");
  const [dataIndex, setDataIndex] = useState(0);

  const repick = () => {
    setColor(pick(palette));
    setRatio(pick(ratios));
    setDataIndex(Math.floor(Math.random() * list.length));
  };

  useEffect(() => {
    repick();
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center w-full h-dvh`}
      onClick={(e) => {
        if (view !== panel) return;
        e.stopPropagation();
        repick();
      }}
    >
      <motion.div
        className={`${ratio} h-[66.6vh] max-w-xs lg:max-w-3xl cursor-pointer ${color}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: view === panel ? 1 : 0 }}
        transition={{ duration: 0.4, ease }}
        onClick={(e) => {
          if (view !== panel) return;
          e.stopPropagation();
          setProjectOpen(true);
        }}
      />

      {view === panel && (
        <div className="z-10 absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none flex items-center">
          <span className="font-selecta font-medium text-sm flex flex-col lg:flex-row justify-center gap-0 items-center pb-1.5 lg:items-baseline lg:gap-16 uppercase tracking-wide">
            <span>{list[dataIndex]}</span>
            {panel === "commissioned" && (
              <span className="hidden lg:inline">{title}</span>
            )}
            <span className="hidden lg:inline">{year}</span>
          </span>
        </div>
      )}

      {/* PROJECT OVERLAY */}
      <motion.div
        className={`absolute top-0 bottom-0 z-10 ${
          panel === "personal"
            ? "left-0 right-4 shadow-[8px_0_24px_rgba(0,0,0,0.18)]"
            : "right-0 left-4 shadow-[-8px_0_24px_rgba(0,0,0,0.18)]"
        }`}
        initial={{ x: panel === "commissioned" ? "100%" : "-100%" }}
        animate={{
          x: projectOpen ? "0%" : panel === "commissioned" ? "100%" : "-100%",
        }}
        transition={{ duration: 0.6, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 overflow-hidden">
          <ProjectClient
            list={list[dataIndex]}
            panel={panel}
            isOpen={projectOpen}
            itemDetailOpen={itemDetailOpen}
            setItemDetailOpen={setItemDetailOpen}
          />
        </div>
      </motion.div>
    </div>
  );
}
