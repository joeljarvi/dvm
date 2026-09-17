"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { clients, models, extraProjects } from "@/lib/data";
import {
  setProjectVisibility,
  useProjectVisibility,
} from "@/lib/projectVisibility";
import { Button } from "./ui/button";

export type Category = "commissioned" | "personal";

const CATEGORIES: Category[] = ["personal", "commissioned"];

const FALLBACK: Record<Category, Project[]> = {
  commissioned: clients,
  personal: models,
};
const LABEL: Record<Category, string> = {
  commissioned: "Commissioned Work",
  personal: "Personal Work",
};
// The fallback (name-only, no images) projects have nothing to preview —
// same placeholder Home's Strip falls back to, so hovering a placeholder row
// still shows something rather than nothing.
const PLACEHOLDER_IMAGE = "/personal_placeholder.png";
// Each category's own column span in the lg 4-col grid — column 1 stays a
// blank gutter (the same rhythm AboutSection uses), Personal takes the
// narrow column 2, Commissioned the wider 3–4 span it always had.
const COLUMN: Record<Category, string> = {
  personal: "lg:col-start-2",
  commissioned: "lg:col-start-3 lg:col-span-2",
};

const byName = (a: Project, b: Project) =>
  (a.client ?? a.title).localeCompare(b.client ?? b.title, "sv");

const projectKey = (project: Project, i: number) =>
  project.slug ?? `${project.title}-${i}`;

// A quick-jump list, A–Ö, for both categories at once — Personal under its
// own "Personal Work" heading, Commissioned under its own. Used both as a
// full page (/archive) and nested inside an overlay raised over another view
// (Home's sheet, a browser) — the caller decides what "selecting a project"
// means by passing `onSelect`; without one it falls back to that project's
// own page.
export default function IndexSection({
  projects,
  onSelect,
}: {
  /** Both categories' project lists — Home already holds both; other callers
   * hand in their own fetched list plus the sibling category's. */
  projects: Record<Category, Project[]>;
  onSelect?: (project: Project, category: Category) => void;
}) {
  const router = useRouter();
  // One hook call per category (a fixed, constant-length pair) rather than
  // inside the render loop below — each list's toggle only ever touches its
  // own category's mode, never the sibling's.
  const visibility: Record<
    Category,
    ReturnType<typeof useProjectVisibility>
  > = {
    personal: useProjectVisibility("personal"),
    commissioned: useProjectVisibility("commissioned"),
  };
  const [hovered, setHovered] = useState<Project | null>(null);

  // Real projects when Sanity answered, the name-only fallback otherwise —
  // the same degradation as the rest of the site. "All projects" mixes in
  // the placeholder ones so a fuller list — and the carousel behind it,
  // which reads the same toggle — can be visualized without real content.
  // "Selected Projects" is the curated subset — only projects marked
  // `featured` in Studio. The fallback list has no such field, so it's
  // treated as fully curated (it's already hand-picked placeholder data).
  const entriesFor = (category: Category) => {
    const list = projects[category];
    const all = list.length ? list : FALLBACK[category];
    const selected = list.length
      ? list.filter((p) => p.featured)
      : FALLBACK[category];
    return [
      ...(visibility[category] === "all"
        ? [...all, ...extraProjects[category]]
        : selected),
    ].sort(byName);
  };

  const select = (project: Project, category: Category) => {
    if (onSelect) {
      onSelect(project, category);
      return;
    }
    if (project.slug) router.push(`/${category}/${project.slug}`);
  };

  // Desktop only — hovering a row previews that project's first still (never
  // video, since this renders as a plain <img>) or its cover image in the
  // second column. Touch has no hover, so mobile never sets this.
  const previewImage =
    hovered?.images?.find((m) => m.type === "image")?.url ??
    hovered?.coverImageUrl ??
    (hovered ? PLACEHOLDER_IMAGE : null);

  return (
    <div className="relative h-full flex flex-col lg:grid lg:grid-cols-4 items-start w-full font-selecta font-medium text-lg lg:text-xl tracking-wide text-neutral-300 pt-30 lg:pt-0">
      {/* `absolute inset-0` rather than a grid cell: it needs to sit behind
          the lists, in the same space, not stacked in its own row above them —
          a plain grid item can only ever be beside or between the others,
          never underneath. `-z-10` only takes effect because it's
          positioned now; on a static element z-index is a no-op. */}
      <div className="hidden absolute inset-0 -z-10 lg:flex lg:items-center justify-center lg:h-screen px-5.5 py-30 ">
        {previewImage && (
          <img
            src={sanityImage(previewImage, { w: 800 })}
            alt={hovered?.title ?? ""}
            className="h-full w-auto object-contain opacity-20 e blur-xs  "
          />
        )}
      </div>

      {CATEGORIES.map((category) => {
        const entries = entriesFor(category);

        return (
          <div
            key={category}
            className={`relative z-10 flex flex-col w-full h-[50dvh] lg:h-screen mt-16 first:mt-0 lg:mt-0 ${COLUMN[category]}`}
          >
            {/* Pinned to this category's own top edge, mirroring the footer
                below — the heading never scrolls with the list, and the
                same tall, eased scrim fades the list out smoothly as it
                passes underneath instead of cutting off at the heading's
                edge. `pt-14` on the list below reserves the heading's own
                row so the first item doesn't start out hidden under it. */}
            <div className="hidden lg:flex absolute top-0 left-0 w-full h-32 items-start justify-start px-5.5 pointer-events-none bg-linear-to-b from-background from-25% via-background/10 via-55% to-transparent">
              <h3 className="h-14 flex items-center font-normal text-[0.8rem] text-blue-700">
                {LABEL[category]}
              </h3>
            </div>
            {/* `columns-2` rather than a grid for Commissioned's wider span: a
                grid's row-major auto-placement alternates items between the
                two columns and stretches the rows to fill the container,
                leaving big gaps. Multi-column flows items straight down,
                packing the first column solid before spilling into the
                second — `column-fill:auto` is what forces that fill order
                instead of the browser balancing the two evenly. Personal's
                single grid column has no room for a second sub-column.
                `pt-14`/`pb-14` keep the first and last rows clear of the
                heading and footer pinned above/below, since both are
                `absolute` and out of this flow. */}
            <ul
              className={`${category === "commissioned" ? "columns-2 [column-fill:auto]" : ""} items-start justify-start w-full gap-x-0 pt-0 lg:pt-14 pb-14 flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden`}
            >
              {entries.map((project, i) => (
                <li
                  key={projectKey(project, i)}
                  className="break-inside-avoid"
                  onMouseEnter={() => setHovered(project)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => select(project, category)}
                    className="     truncate h-auto  justify-start   text-left cursor-pointer hover:text-blue-700"
                  >
                    {project.client ?? project.title}
                  </Button>
                </li>
              ))}
            </ul>
            {/* Pinned to this category's own bottom edge rather than sitting
                in flow after the list — each list scrolls independently
                above it, and it never drifts off with short lists. The scrim
                is taller than the button row itself and eased through a
                `via` stop, so text scrolling under it fades out gradually
                rather than cutting off hard at the row's edge; it's
                `pointer-events-none` so the blank space above the buttons
                doesn't block clicks/hover on the list underneath. */}
            <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-start px-5.5 text-sm bg-linear-to-t from-background from-25% via-background/70 via-55% to-transparent pointer-events-none">
              <div className="flex items-center gap-x-4 h-14 pointer-events-auto">
                <Button
                  variant="link"
                  size="sm"
                  className={`px-0 hover:text-blue-700 ${visibility[category] === "selected" ? "text-blue-700" : ""}`}
                  onClick={() => setProjectVisibility(category, "selected")}
                >
                  Selected
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className={`px-0 hover:text-blue-700 ${visibility[category] === "all" ? "text-blue-700" : ""}`}
                  onClick={() => setProjectVisibility(category, "all")}
                >
                  Show All
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
