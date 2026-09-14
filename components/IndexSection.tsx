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

type Category = "commissioned" | "personal";

const FALLBACK: Record<Category, Project[]> = {
  commissioned: clients,
  personal: models,
};
const LABEL: Record<Category, string> = {
  commissioned: "Commissioned projects, A-Ö",
  personal: "Personal Projects, A-Ö",
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
}: {
  projects?: Project[];
  category: Category;
  onSelect?: (project: Project) => void;
}) {
  const router = useRouter();
  const visibility = useProjectVisibility();
  const [hovered, setHovered] = useState<Project | null>(null);

  // Real projects when Sanity answered, the name-only fallback otherwise —
  // the same degradation as the rest of the site. "All projects" mixes in
  // the placeholder ones so a fuller list — and the carousel behind it,
  // which reads the same toggle — can be visualized without real content.
  const all = projects.length ? projects : FALLBACK[category];
  // "Selected Projects" is the curated subset — only projects marked
  // `featured` in Studio. The fallback list has no such field, so it's
  // treated as fully curated (it's already hand-picked placeholder data).
  const selected = projects.length ? projects.filter((p) => p.featured) : FALLBACK[category];
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
    <div className="h-[66.6dvh] lg:h-full flex flex-col items-start w-full font-selecta font-medium text-lg lg:text-xl tracking-wide text-neutral-300">
      <Button variant="link" size="sm" className={` text-blue-700 `}>
        {LABEL[category]}
      </Button>
      <div className="grid grid-cols-2 w-full">
        {/* Selected is the real, curated index; All mixes in the placeholder
          projects so a fuller list — and the carousel behind it, which reads
          the same toggle — can be visualized without real content. */}

        <ul className="flex flex-col items-start w-full gap-y-0  pt-0 pb-12 col-start-1 col-span-1">
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
                className="w-full min-w-0 h-auto truncate text-left py-0 cursor-pointer hover:text-blue-700"
              >
                {project.client ?? project.title}
              </Button>
            </li>
          ))}
        </ul>
        <div className="hidden lg:flex lg:items-start col-start-2 col-span-1 pl-4">
          {previewImage && (
            <img
              src={sanityImage(previewImage, { w: 800 })}
              alt={hovered?.title ?? ""}
              className="max-h-[33.3dvh] w-auto object-contain"
            />
          )}
        </div>
        <div className="absolute bottom-0 left-0 flex justify-start items-center gap-x-4 px-5.5  text-sm">
          <Button
            variant="link"
            size="sm"
            className={`px-0 hover:text-blue-700 ${visibility === "selected" ? "text-blue-700" : ""}`}
            onClick={() => setProjectVisibility("selected")}
          >
            Selected Projects
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
    </div>
  );
}
