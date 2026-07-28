"use client";

import { useState } from "react";
import { clients, models } from "@/lib/data";
import { Button } from "./ui/button";

const RED_SHADES = [
  "bg-red-100",
  "bg-red-200",
  "bg-red-300",
  "bg-red-400",
  "bg-red-500",
  "bg-red-600",
  "bg-red-700",
  "bg-red-800",
  "bg-red-900",
  "bg-rose-200",
  "bg-rose-400",
  "bg-rose-600",
  "bg-red-300",
  "bg-red-500",
  "bg-red-700",
  "bg-rose-800",
];

const CATEGORIES = ["all", "personal", "commissioned"] as const;
type Category = (typeof CATEGORIES)[number];

const sortList = (list: { title: string }[]) =>
  [...list].sort((a, b) => a.title.localeCompare(b.title, "sv"));

export default function IndexSection() {
  const [category, setCategory] = useState<Category>("all");

  const baseList =
    category === "personal"
      ? models
      : category === "commissioned"
        ? clients
        : [...models, ...clients];
  const sorted = sortList(baseList);

  const cycleCategory = () =>
    setCategory(
      (c) => CATEGORIES[(CATEGORIES.indexOf(c) + 1) % CATEGORIES.length],
    );

  return (
    <div className="relative h-full w-full font-selecta font-medium text-lg lg:text-xl tracking-wide text-background px-0">
      {/* Full-height split background */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="w-full bg-neutral-800 lg:bg-neutral-700 lg:w-full" />
        <div className="flex-1 bg-neutral-900 w-1/2 hidden lg:flex" />
      </div>

      {/* Top bar: category toggle */}

      {/* Thumbnails */}
      <div className="relative h-full overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden pt-0">
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-4 p-2 lg:p-4">
          {sorted.map((item, i) => (
            <div
              key={item.title}
              className={`${RED_SHADES[i % RED_SHADES.length]} aspect-3/4 w-full`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
