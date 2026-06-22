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

const sortList = (list: { title: string }[], order: "asc" | "desc") =>
  [...list].sort((a, b) =>
    order === "asc"
      ? a.title.localeCompare(b.title, "sv")
      : b.title.localeCompare(a.title, "sv"),
  );

export default function IndexSection({ onClose }: { onClose?: () => void }) {
  const [order] = useState<"asc" | "desc">("asc");
  const [activeList, setActiveList] = useState<
    "personal" | "commissioned" | "all"
  >("all");
  const [viewMode, setViewMode] = useState<"list" | "thumbnails">("list");

  const baseList =
    activeList === "personal"
      ? models
      : activeList === "commissioned"
        ? clients
        : [...models, ...clients];
  const sorted = sortList(baseList, order);

  return (
    <div className="relative h-full w-full font-selecta font-medium text-lg lg:text-xl tracking-wide  text-background   ">
      {/* Full-height split background */}
      <div className="absolute inset-0 flex pointer-events-none  ">
        <div className="w-full bg-neutral-800 lg:bg-neutral-700 lg:w-1/2" />
        <div className="flex-1 bg-neutral-900 w-1/2 hidden lg:flex" />
      </div>

      {/* Top bar: close center, tabs center, view toggle right (desktop) */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center gap-2">
        {onClose && (
          <Button className="fixed top-0 left-1/2 -translate-x-1/2 lg:absolute lg:top-auto hover:text-pink-400" onClick={onClose}>
            close
          </Button>
        )}
        {(["personal", "commissioned", "all"] as const).map((tab) => (
          <Button
            key={tab}
            className={`uppercase hover:text-pink-400 ${activeList === tab ? "text-pink-400" : ""}`}
            onClick={() => setActiveList(tab)}
          >
            {tab}
          </Button>
        ))}
        <Button
          className="hidden lg:inline-flex absolute right-0 uppercase hover:text-pink-400"
          onClick={() => setViewMode((v) => (v === "list" ? "thumbnails" : "list"))}
        >
          {viewMode === "list" ? "thumbnails" : "list"}
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="relative h-full overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden pt-8">
        <div className="col-span-2 lg:col-span-3 overflow-y-scroll">
          {viewMode === "list" ? (
            <ul className="flex flex-col items-start justify-start gap-0 px-2.5 pt-2.5">
              {sorted.map((item) => (
                <li
                  key={item.title}
                  className="text-sm uppercase tracking-wide leading-[1.2]"
                >
                  {item.title}
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2.5 px-2.5 pb-2.5 ">
              {RED_SHADES.map((shade, i) => (
                <div key={i}>
                  <div className={`${shade} aspect-3/4 max-w-64 w-full`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center lg:hidden px-2.5 py-2">
          <Button
            className="uppercase hover:text-pink-400"
            onClick={() =>
              setViewMode((v) => (v === "list" ? "thumbnails" : "list"))
            }
          >
            {viewMode === "list" ? "thumbnails" : "list"}
          </Button>
        </div>
      </div>
    </div>
  );
}
