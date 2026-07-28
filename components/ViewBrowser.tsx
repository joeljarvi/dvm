"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { arrowCursor } from "@/lib/cursor";
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

const RATIOS = ["aspect-3/4", "aspect-16/9", "aspect-4/3", "aspect-9/16"];

const pick = (p: string[]) => p[Math.floor(Math.random() * p.length)];

// Browse the projects of one category: a cover over a blurred backdrop,
// left/right arrows to move between projects, click the cover to open it.
// Rendered by both the full page (/[view]) and the intercepted modal.
export default function ViewBrowser({
  list,
  panel,
}: {
  list: Project[];
  panel: "personal" | "commissioned";
}) {
  const router = useRouter();
  const palette = panel === "personal" ? PINK_SHADES : GREEN_SHADES;

  const [color, setColor] = useState("");
  const [ratio, setRatio] = useState("aspect-3/4");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setColor(pick(palette));
    setRatio(pick(RATIOS));
  }, []);

  const current = list[index];

  const step = (delta: number) => {
    setColor(pick(palette));
    setRatio(pick(RATIOS));
    setIndex((i) => (i + delta + list.length) % list.length);
  };

  const openProject = () => {
    if (current?.slug) router.push(`/${panel}/${current.slug}`);
  };

  return (
    <div
      className={`${panel === "personal" ? "bg-neutral-300" : "bg-neutral-400"} relative flex items-center justify-center w-full h-full overflow-hidden`}
    >
      {/* prev / next arrow zones */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-1/2"
        style={{ cursor: arrowCursor("left") }}
        onClick={() => step(-1)}
      />
      <div
        className="absolute inset-y-0 right-0 z-10 w-1/2"
        style={{ cursor: arrowCursor("right") }}
        onClick={() => step(1)}
      />

      {/* centered cover — click to open the project */}
      {current?.coverImageUrl ? (
        <img
          src={sanityImage(current.coverImageUrl, { w: 1400 })}
          alt={current.title}
          className="relative z-20 h-[66.6vh] w-auto max-w-xs lg:max-w-3xl object-cover cursor-pointer"
          onClick={openProject}
        />
      ) : (
        <div
          className={`relative z-20 ${ratio} h-[66.6vh] max-w-xs lg:max-w-3xl ${color} cursor-pointer`}
          onClick={openProject}
        />
      )}

      {/* mobile: client top-left, title bottom-left; desktop: centered at top */}
      <MetadataBar
        className="z-30 absolute top-2 px-2.5 h-6"
        left={<span className="lg:hidden">{current?.client}</span>}
        center={
          <span className="hidden lg:flex items-center gap-x-4">
            {current?.client && <span>{current.client}</span>}
            <span>{current?.title}</span>
          </span>
        }
      />
      <MetadataBar
        className="z-30 absolute bottom-2 px-2.5 h-6 lg:hidden"
        left={current?.title}
      />
    </div>
  );
}
