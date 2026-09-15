"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { clients, models, extraProjects } from "@/lib/data";
import {
  setProjectVisibility,
  useProjectVisibility,
  type Visibility,
} from "@/lib/projectVisibility";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Category = "commissioned" | "personal";

const FALLBACK: Record<Category, Project[]> = {
  commissioned: clients,
  personal: models,
};
const LABEL: Record<Category, string> = {
  commissioned: "Commissioned Work",
  personal: "Personal Work",
};

const byName = (a: Project, b: Project) =>
  (a.client ?? a.title).localeCompare(b.client ?? b.title, "sv");

const projectKey = (project: Project, i: number) =>
  project.slug ?? `${project.title}-${i}`;

// A quick-jump list, A–Ö. Used both as a full page (/archive) and nested
// inside an overlay raised over another view (Home's sheet, a browser) — the
// caller decides what "selecting a project" means by passing `onSelect`;
// without one it falls back to the project's own page.
export default function IndexSection({
  projects = [],
  category,
  onSelect,
  onCategoryChange,
}: {
  projects?: Project[];
  category: Category;
  onSelect?: (project: Project) => void;
  /** The caller already holds both categories' state (e.g. Home's opened
   * section) — let it swap in the other one instead of navigating away. */
  onCategoryChange?: (category: Category) => void;
}) {
  const router = useRouter();
  const visibility = useProjectVisibility();
  const [hovered, setHovered] = useState<Project | null>(null);

  const switchCategory = (next: Category) => {
    if (next === category) return;
    if (onCategoryChange) onCategoryChange(next);
    else router.push(`/${next}`);
  };

  // Real projects when Sanity answered, the name-only fallback otherwise —
  // the same degradation as the rest of the site. "All projects" mixes in
  // the placeholder ones so a fuller list — and the carousel behind it,
  // which reads the same toggle — can be visualized without real content.
  const all = projects.length ? projects : FALLBACK[category];
  // "Selected Projects" is the curated subset — only projects marked
  // `featured` in Studio. The fallback list has no such field, so it's
  // treated as fully curated (it's already hand-picked placeholder data).
  const selected = projects.length
    ? projects.filter((p) => p.featured)
    : FALLBACK[category];
  const entries = [
    ...(visibility === "all" ? [...all, ...extraProjects[category]] : selected),
  ].sort(byName);

  const select = (project: Project) => {
    if (onSelect) {
      onSelect(project);
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
    null;

  return (
    <div className="relative h-full flex flex-col lg:grid lg:grid-cols-4 items-start w-full font-selecta font-medium text-lg lg:text-xl tracking-wide text-neutral-300 pt-30 lg:pt-0">
      {/* Personal / Commissioned — a toggle like Selected/Show All below,
          not just a label naming whichever one is already showing. Each its
          own column rather than a shared flex row. */}
      <span className="hidden lg:block col-start-2 ">
        <Button
          variant="link"
          size="sm"
          className={`hover:text-blue-700 ${category === "personal" ? "text-blue-700" : ""}`}
          onClick={() => switchCategory("personal")}
        >
          {LABEL.personal}
        </Button>
      </span>
      <span className="hidden lg:block col-start-3 ">
        <Button
          variant="link"
          size="sm"
          className={`hover:text-blue-700 ${category === "commissioned" ? "text-blue-700" : ""}`}
          onClick={() => switchCategory("commissioned")}
        >
          {LABEL.commissioned}
        </Button>
      </span>
      {/* Mobile: one select for both category and visibility together,
          rather than two separate ones — "Personal Work / Selected",
          "Personal Work / All", and the same for Commissioned. */}
      <div className="flex justify-between items-center w-full lg:contents">
        <Select
          value={`${category}:${visibility}`}
          onValueChange={(v) => {
            const [nextCategory, nextVisibility] = v.split(":") as [
              Category,
              Visibility,
            ];
            switchCategory(nextCategory);
            setProjectVisibility(nextVisibility);
          }}
        >
          <SelectTrigger className="lg:hidden h-14 gap-1 font-normal px-5.5 text-[0.8rem] w-full border-none rounded-none bg-transparent shadow-none text-blue-700 hover:text-blue-700 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-1010 font-selecta text-[0.8rem] text-neutral-300 ring-transparent bg-background rounded-none">
            <SelectGroup>
              <SelectLabel>{LABEL.personal}</SelectLabel>
              <SelectItem value="personal:selected">
                {LABEL.personal} – Selected
              </SelectItem>
              <SelectItem value="personal:all">
                {LABEL.personal} – All
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{LABEL.commissioned}</SelectLabel>
              <SelectItem value="commissioned:selected">
                {LABEL.commissioned} – Selected
              </SelectItem>
              <SelectItem value="commissioned:all">
                {LABEL.commissioned} – All
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {/* Selected is the real, curated index; All mixes in the placeholder
        projects so a fuller list — and the carousel behind it, which reads
        the same toggle — can be visualized without real content. */}
      <div className="hidden lg:flex lg:items-start lg:col-start-2 pt-16 h-[33.3dvh] px-5.5">
        {previewImage && (
          <img
            src={sanityImage(previewImage, { w: 800 })}
            alt={hovered?.title ?? ""}
            className="max-h-[33.3dvh] w-auto object-contain"
          />
        )}
      </div>
      <ul className="flex flex-col items-start justify-start w-full gap-y-0 pt-0 h-auto lg:h-auto lg:overflow-y-auto lg:grid  lg:content-start lg:gap-0 lg:space-y-0 lg:grid-cols-1 lg:col-start-3 lg:col-span-2  mt-16 lg:mt-0 ">
        {entries.map((project, i) => (
          <li
            key={projectKey(project, i)}
            onMouseEnter={() => setHovered(project)}
            onMouseLeave={() => setHovered(null)}
          >
            <Button
              variant="link"
              size="sm"
              onClick={() => select(project)}
              className="w-full min-w-0 h-auto truncate  justify-start lg:h-auto  text-left cursor-pointer hover:text-blue-700"
            >
              {project.client ?? project.title}
            </Button>
          </li>
        ))}
      </ul>
      <div className="hidden lg:flex absolute bottom-0 left-0 lg:col-start-2 justify-start items-start gap-x-4 px-5.5 text-sm">
        <Button
          variant="link"
          size="sm"
          className={`px-0 hover:text-blue-700 ${visibility === "selected" ? "text-blue-700" : ""}`}
          onClick={() => setProjectVisibility("selected")}
        >
          Selected Work
        </Button>
        <Button
          variant="link"
          size="sm"
          className={`px-0 hover:text-blue-700 ${visibility === "all" ? "text-blue-700" : ""}`}
          onClick={() => setProjectVisibility("all")}
        >
          Show All
        </Button>
      </div>
    </div>
  );
}
