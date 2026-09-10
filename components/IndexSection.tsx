"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
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

type View = "thumbnails" | "list";
type Category = "personal" | "commissioned";
type Filter = Category | "all";
type Entry = { project: Project; category: Category };

const FILTERS: Filter[] = ["all", "personal", "commissioned"];

const byTitle = (a: Entry, b: Entry) =>
  a.project.title.localeCompare(b.project.title, "sv");

const projectHref = ({ project, category }: Entry) =>
  project.slug ? `/${category}/${project.slug}` : null;

// Stable across renders even though the Entry objects are rebuilt each time —
// used both as React keys and to remember which project the left panel holds.
const entryKey = ({ project, category }: Entry) =>
  `${category}-${project.slug ?? project.title}`;

const projectImages = (project: Project) =>
  project.images?.length
    ? project.images.map((m) => m.url)
    : project.coverImageUrl
      ? [project.coverImageUrl]
      : [];

export default function IndexSection({
  personal = [],
  commissioned = [],
}: {
  personal?: Project[];
  commissioned?: Project[];
}) {
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("commissioned");
  // Which project the left panel is showing, by stable key — null is the hint.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // How tall the bottom sheet stands on mobile, in vh. The grip drags it — up
  // for more, down for less — between a peek and near full-screen. Ignored on
  // desktop, where the panel is a static full-height column.
  const [sheetVh, setSheetVh] = useState(33.3);
  const drag = useRef<{ y: number; vh: number } | null>(null);

  const onGripDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, vh: sheetVh };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onGripMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const movedVh = ((drag.current.y - e.clientY) / window.innerHeight) * 100;
    setSheetVh(Math.min(90, Math.max(15, drag.current.vh + movedVh)));
  };
  const onGripUp = (e: React.PointerEvent) => {
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // How wide panel 2 stands on desktop, as a % of the viewport. The divider
  // drags it — right to shrink it (and widen panel 1), left to grow it.
  // Ignored on mobile, where panel 2 is a full-width bottom sheet.
  const [panelPct, setPanelPct] = useState(50);
  const colDrag = useRef<{ x: number; pct: number } | null>(null);

  const onColDown = (e: React.PointerEvent) => {
    colDrag.current = { x: e.clientX, pct: panelPct };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onColMove = (e: React.PointerEvent) => {
    if (!colDrag.current) return;
    const movedPct =
      ((colDrag.current.x - e.clientX) / window.innerWidth) * 100;
    setPanelPct(Math.min(75, Math.max(20, colDrag.current.pct + movedPct)));
  };
  const onColUp = (e: React.PointerEvent) => {
    colDrag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // Real projects when Sanity answered, the name-only fallback otherwise —
  // the same degradation as the rest of the site.
  const allEntries: Entry[] = [
    ...(personal.length ? personal : models).map(
      (project): Entry => ({ project, category: "personal" }),
    ),
    ...(commissioned.length ? commissioned : clients).map(
      (project): Entry => ({ project, category: "commissioned" }),
    ),
  ].sort(byTitle);

  const entries =
    filter === "all"
      ? allEntries
      : allEntries.filter((e) => e.category === filter);

  const selected =
    (selectedKey && allEntries.find((e) => entryKey(e) === selectedKey)) ||
    null;
  const selectedImages = selected ? projectImages(selected.project) : [];

  // Thumbnails are every image of every project; clicking one opens that
  // project in the left panel. A project with no images of its own still gets
  // one tile so nothing drops out of the index.
  const thumbs = entries.flatMap((entry) => {
    const urls = entry.project.images?.length
      ? entry.project.images.map((m) => m.url)
      : [entry.project.coverImageUrl ?? null];
    return urls.map((url, i) => ({
      url,
      entry,
      key: `${entry.category}-${entry.project.slug ?? entry.project.title}-${i}`,
    }));
  });

  return (
    <div
      style={{ "--panel2-w": `${panelPct}%` } as React.CSSProperties}
      className="flex flex-col lg:grid lg:grid-cols-[1fr_var(--panel2-w,50%)] relative h-dvh w-full overflow-hidden font-selecta font-medium text-lg lg:text-xl tracking-wide text-neutral-300 gap-x-0 bg-background px-l-5.5 gap-x-4"
    >
      {/* PANEL 1 — the images of whichever project the list has selected */}

      <div className="col-span-1 h-dvh lg:h-full min-h-0 flex flex-col  lg:pt-0  ">
        {selected ? (
          <>
            <div className="fixed top-0 left-0  shrink-0 flex items-center justify-between lg:justify-start  gap-x-4 lg:gap-x-5.5 px-5.5  pt-14  w-full lg:w-auto  text-sm">
              <Button
                size="sm"
                variant="link"
                className="min-w-0 truncate px-0 text-blue-700"
              >
                {selected.project.client
                  ? `${selected.project.client} — ${selected.project.title}`
                  : selected.project.title}
              </Button>
              <Button
                size="sm"
                variant="link"
                className="shrink-0 px-0 hover:text-blue-700"
                onClick={() => setSelectedKey(null)}
              >
                Close
              </Button>
            </div>
            <div
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-none [&::-webkit-scrollbar]:hidden flex flex-col gap-4 px-0 lg:0 pb-12"
            >
              {selectedImages.length ? (
                selectedImages.map((url, i) => (
                  <img
                    key={`${url}-${i}`}
                    src={sanityImage(url, { w: 1400 })}
                    alt={selected.project.title}
                    className="mx-auto w-auto max-w-full max-h-[66.6vh] object-contain"
                  />
                ))
              ) : (
                <span className="text-sm opacity-60">
                  No images for this project yet.
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="flex flex-1 items-center justify-center px-4 text-center">
            <Button variant="link" size="sm" className="w-min text-blue-700">
              Click on a project / client to see more →
            </Button>
          </span>
        )}
      </div>

      {/* PANEL 2 — the browser. Pinned to the bottom of the viewport on mobile,
          a full-height column on desktop. */}
      <div
        style={{ "--sheet-h": `${sheetVh}vh` } as React.CSSProperties}
        className="fixed bottom-0  left-0 z-40 h-[var(--sheet-h,33.3vh)] w-full bg-background shadow-[0_-8px_28px_-10px_rgba(0,0,0,0.22)] lg:shadow-[-14px_0_30px_-14px_rgba(0,0,0,0.18)] lg:px-5.5 lg:relative lg:z-auto lg:h-dvh lg:w-auto lg:px-0 col-start-2 min-h-0 min-w-0 flex flex-col b lg:pt-14"
      >
        {/* Divider — drag right to shrink panel 2 and widen panel 1, left to
            grow it back. Desktop only; the mobile sheet resizes with the grip. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          onPointerDown={onColDown}
          onPointerMove={onColMove}
          onPointerUp={onColUp}
          onPointerCancel={onColUp}
          className="group hidden lg:block absolute inset-y-0 left-0 z-50 w-3 -translate-x-1/2 cursor-col-resize touch-none"
        >
          <div className="mx-auto h-full w-0.5 bg-transparent transition-colors group-hover:bg-blue-700 group-active:bg-blue-700" />
        </div>

        {/* Grip — drag up for a taller sheet, down for a shorter one. Mobile
            only; the desktop panel is a static full-height column. */}
        <button
          type="button"
          aria-label="Resize panel"
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={onGripUp}
          onPointerCancel={onGripUp}
          className="lg:hidden shrink-0 mx-auto mt-1.5 mb-1 h-1.5 w-12 rounded-full  bg-neutral-300 active:bg-blue-700 touch-none cursor-grab active:cursor-grabbing"
        />

        {/* Controls: native selects on mobile, the label row on desktop. */}
        <div className=" shrink-0  pt-1 pb-4 lg:pt-0 lg:pb-0">
          <div className="flex justify-between w-full gap-x-6 lg:hidden px-5.5">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as View)}
              className="cursor-pointer appearance-none bg-transparent capitalize text-blue-700 outline-none text-sm! h-8  w-min gap-x-2  px-0 [&::-ms-expand]:hidden"
            >
              <option className="text-sm" value="list">
                List
              </option>
              <option className="text-sm" value="thumbnails">
                Thumbnails
              </option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="cursor-pointer appearance-none bg-transparent capitalize text-blue-700 outline-none text-sm! h-8  px-0 [&::-ms-expand]:hidden"
            >
              {FILTERS.map((f) => (
                <option key={f} className="text-sm" value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span className="flex gap-x-4">
              <Button
                variant="link"
                size="sm"
                className={`px-0 hover:text-blue-700 ${view === "thumbnails" ? "text-blue-700" : ""}`}
                onClick={() => setView("thumbnails")}
              >
                Thumbnails
              </Button>
              <Button
                variant="link"
                size="sm"
                className={`px-0 hover:text-blue-700 ${view === "list" ? "text-blue-700" : ""}`}
                onClick={() => setView("list")}
              >
                List
              </Button>
            </span>
            <span className="flex gap-x-4">
              {FILTERS.map((f) => (
                <Button
                  key={f}
                  variant="link"
                  size="sm"
                  className={`px-0 capitalize hover:text-blue-700 ${filter === f ? "text-blue-700" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </span>
          </div>
        </div>

        {/* Scroll area. `data-lenis-prevent` hands the wheel and touch back to
            the browser — the root Lenis would otherwise swallow them. Mobile
            scrolls the inner strip (sideways for thumbnails, down for the
            list); desktop scrolls this container. */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-hidden overscroll-contain scrollbar-none [&::-webkit-scrollbar]:hidden lg:overflow-x-hidden lg:overflow-y-scroll lg:pb-12 px-5.5 lg:px-0"
        >
          {view === "thumbnails" ? (
            <div className="flex h-full flex-row gap-4 overflow-x-auto overflow-y-hidden pb-2 lg:grid lg:h-auto lg:grid-cols-4 lg:overflow-visible lg:pb-0">
              {thumbs.map((thumb, i) => {
                const isSelected = entryKey(thumb.entry) === selectedKey;
                const tile = thumb.url ? (
                  <img
                    src={sanityImage(thumb.url, { w: 600 })}
                    alt={thumb.entry.project.title}
                    className="w-full h-full object-contain object-top-left "
                  />
                ) : (
                  <div
                    className={`${RED_SHADES[i % RED_SHADES.length]} w-full h-full`}
                  />
                );
                return (
                  <button
                    type="button"
                    key={thumb.key}
                    onClick={() => setSelectedKey(entryKey(thumb.entry))}
                    className={`aspect-3/4 h-full w-auto shrink-0 overflow-hidden cursor-pointer transition-opacity lg:h-auto lg:w-full ${
                      isSelected ? "" : "hover:opacity-80"
                    } ${selectedKey && !isSelected ? "opacity-40" : ""}`}
                  >
                    {tile}
                  </button>
                );
              })}
            </div>
          ) : (
            <ul className="flex h-full flex-col overflow-y-auto overflow-x-hidden text-sm lg:h-auto lg:overflow-visible">
              {entries.map((entry) => {
                const isSelected = entryKey(entry) === selectedKey;
                // Client first, then the project title, then which category
                // it belongs to.
                return (
                  <li key={entryKey(entry)}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(entryKey(entry))}
                      className={`grid w-full grid-cols-2 text-sm  gap-x-5.5 text-left items-baseline px-0 cursor-pointer hover:text-blue-700 ${
                        isSelected ? "text-blue-700" : ""
                      }`}
                    >
                      <span className="min-w-0 truncate ">
                        {entry.project.client}
                      </span>
                      <span className="min-w-0 truncate text-sm text-right lg:text-left">
                        {entry.project.title}
                      </span>
                      <span className="hidden min-w-0 truncate text-right text-neutral-300 opacity-60">
                        #{entry.category}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="hidden fixed bottom-0 left-0 w-full h-14 w-full z-40 bg-background" />
    </div>
  );
}
