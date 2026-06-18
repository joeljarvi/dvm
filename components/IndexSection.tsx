"use client";

import { useState } from "react";
import { clients, models } from "@/lib/data";

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

const sortList = (list: string[], order: "asc" | "desc") =>
  [...list].sort((a, b) =>
    order === "asc" ? a.localeCompare(b, "sv") : b.localeCompare(a, "sv"),
  );

export default function IndexSection() {
  const [order] = useState<"asc" | "desc">("asc");
  const [activeList, setActiveList] = useState<"clients" | "models">("clients");
  const [viewMode, setViewMode] = useState<"list" | "thumbnails">("list");

  const sorted = sortList(activeList === "clients" ? clients : models, order);

  return (
    <div className="relative h-full w-full font-selecta font-medium text-sm tracking-wide leading-[1.2] lg:tracking-normal text-background  ">
      {/* Full-height split background */}
      <div className="absolute inset-0 flex pointer-events-none  ">
        <div className="w-1/3 bg-neutral-800 lg:bg-neutral-700" />
        <div className="flex-1 bg-neutral-900 w-1/3" />
        <div className="flex-1 bg-neutral-900 w-1/3" />
      </div>

      {/* Scrollable grid content */}
      <div className="relative h-full overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden grid grid-cols-2 lg:grid-cols-3 pt-16">
        {/* Header left: clients/models toggle */}
        <div className="h-8 flex items-center px-2.5">
          <button
            className="uppercase hover:text-pink-400"
            onClick={() =>
              setActiveList((l) => (l === "clients" ? "models" : "clients"))
            }
          >
            {activeList === "clients" ? "models" : "clients"}
          </button>
        </div>

        {/* Header right: list/thumbnails toggle — spans 2 cols on desktop */}
        <div className="h-8 flex items-center justify-end px-2.5 lg:col-span-2">
          <button
            className="uppercase hover:text-pink-400"
            onClick={() =>
              setViewMode((v) => (v === "list" ? "thumbnails" : "list"))
            }
          >
            {viewMode === "list" ? "thumbnails" : "list"}
          </button>
        </div>

        {/* Content: spans all columns */}
        <div className="col-span-2 lg:col-span-3  overflow-y-scroll">
          {viewMode === "list" ? (
            <ul className="flex flex-col items-start justify-start gap-0 px-2.5 pt-2.5">
              {sorted.map((name) => (
                <li
                  key={name}
                  className="text-sm uppercase tracking-wide leading-[1.2]"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-4 lg:grid-cols-9 gap-2.5 pt-2.5 px-2.5 pb-2.5 ">
              {RED_SHADES.map((shade, i) => (
                <div key={i}>
                  <div className={`${shade} aspect-3/4 max-w-64 w-full`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
