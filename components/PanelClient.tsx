"use client";

import { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { motion } from "motion/react";
import type { View, Project } from "@/lib/types";
import ProjectClient from "./ProjectClient";
import MetadataBar from "./MetadataBar";

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
  year,
  projectOpen,
  setProjectOpen,
  itemDetailOpen,
  setItemDetailOpen,
  infoVisible,
}: {
  view: View;
  panel: "personal" | "commissioned";
  list: Project[];
  year: number;
  projectOpen: boolean;
  setProjectOpen: (open: boolean) => void;
  itemDetailOpen: boolean;
  setItemDetailOpen: (open: boolean) => void;
  infoVisible: boolean;
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

  const current = list[dataIndex];
  const totalStr = String(list.length).padStart(4, "0");

  return (
    <div
      className={`relative flex items-center justify-center w-full h-dvh`}
      onClick={(e) => {
        if (view !== panel) return;
        e.stopPropagation();
        repick();
      }}
    >
      {current?.coverImageUrl ? (
        <motion.img
          src={current.coverImageUrl}
          alt={current.title}
          className="h-[66.6vh] w-auto max-w-xs lg:max-w-3xl cursor-pointer object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: view === panel ? 1 : 0 }}
          transition={{ duration: 0.4, ease }}
          onClick={(e) => {
            if (view !== panel) return;
            e.stopPropagation();
            setProjectOpen(true);
          }}
        />
      ) : (
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
      )}

      {/* LIGHTBOX UI */}
      {(view === panel || itemDetailOpen) && infoVisible && (
        <>
          <MetadataBar
            className="z-10 absolute top-6 text-lg lg:text-xl px-2.5 h-8"
            left={
              <>
                <span className="lg:hidden">{`${panel === "personal" ? "PER" : "COM"}${String(dataIndex + 1).padStart(4, "0")}`}</span>
                <span className="hidden lg:inline">
                  {`${panel === "personal" ? "PER" : "COM"}${String(dataIndex + 1).padStart(4, "0")}`}
                  {!projectOpen && `—${totalStr}`}
                </span>
              </>
            }
            center={<span className="hidden lg:inline">{current?.title}</span>}
            right={
              <>
                <span className="lg:hidden">{current?.title}</span>
                <span className="hidden lg:inline">{current?.client}</span>
              </>
            }
          />
        </>
      )}

      {/* PROJECT OVERLAY */}
      <motion.div
        className={`absolute top-0 bottom-0 z-10 ${
          panel === "personal" ? "left-0 right-2.5" : "right-0 left-2.5"
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
            key={current?.title}
            project={current}
            panel={panel}
            dataIndex={dataIndex}
            isOpen={projectOpen}
            itemDetailOpen={itemDetailOpen}
            setItemDetailOpen={setItemDetailOpen}
            infoVisible={infoVisible}
          />
        </div>
      </motion.div>
    </div>
  );
}
