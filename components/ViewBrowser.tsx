"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { usePublishViewChrome } from "@/lib/viewChrome";
import { usePublishBrowsing } from "@/lib/crumb";
import StepButton from "@/components/StepButton";
import { useStepControls } from "@/lib/step";

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

  // Arrow keys anywhere, swipe on touch. The click zones still work.
  useStepControls(true, step);

  const openProject = () => {
    if (current?.slug) router.push(`/${panel}/${current.slug}`);
  };

  // The nav's breadcrumb tails off with whatever cover is up.
  usePublishBrowsing(current?.client);

  usePublishViewChrome(
    <span className="flex items-center gap-x-2 h-8 px-2  ">
      {current?.client && (
        <span className=" uppercase tracking-wider w-full">
          {current.client}
        </span>
      )}
      <span className="italic tracking-wider hidden lg:block">
        {current?.title}
      </span>
    </span>,
  );

  return (
    <div
      className={`${panel === "personal" ? "bg-background" : "bg-background"} relative flex items-center justify-center w-full h-full overflow-hidden`}
    >
      {/* prev / next zones — on desktop the chevron lives in the cursor */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-1/2"
        onClick={() => step(-1)}
      />
      <div
        className="absolute inset-y-0 right-0 z-10 w-1/2"
        onClick={() => step(1)}
      />

      {/* Touch has no cursor to carry the chevron, so below lg the marks come
          on screen. They stack above the zones, so a tap lands on the button
          alone and steps once. */}
      <StepButton
        direction="back"
        onClick={() => step(-1)}
        className="hidden absolute left-4 top-1/2 -translate-y-1/2 z-30 text-neutral-300 hover:text-blue-700"
      />
      <StepButton
        direction="next"
        onClick={() => step(1)}
        className="hidden absolute right-4 top-1/2 -translate-y-1/2 z-30 text-neutral-300 hover:text-blue-700"
      />

      {/* centered cover — click to open the project */}
      {current?.coverImageUrl ? (
        <img
          src={sanityImage(current.coverImageUrl, { w: 1400 })}
          alt={current.title}
          className="relative z-20 h-[50dvh] lg:h-[66.6dvh] w-auto max-w-xs lg:max-w-3xl object-cover cursor-pointer scale-100 hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform"
          onClick={openProject}
        />
      ) : (
        <div
          className={`relative z-20 ${ratio} h-[50dvh] lg:h-[66.6dvh] max-w-xs lg:max-w-3xl ${color} cursor-pointer`}
          onClick={openProject}
        />
      )}
    </div>
  );
}
