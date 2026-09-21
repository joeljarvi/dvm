"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { clients, models } from "@/lib/data";
import { staggerItem } from "@/lib/motion";
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

const PLACEHOLDER_IMAGE = "/personal_placeholder.png";

const COLUMN: Record<Category, string> = {
  personal: "lg:col-start-2",
  commissioned: "lg:col-start-3 lg:col-span-2",
};

const byName = (a: Project, b: Project) =>
  (a.client ?? a.title).localeCompare(b.client ?? b.title, "sv");

const projectKey = (project: Project, i: number) =>
  project.slug ?? `${project.title}-${i}`;

export default function IndexSection({
  projects,
  onSelect,
  initialCategory = "personal",
}: {
  projects: Record<Category, Project[]>;
  onSelect?: (project: Project, category: Category) => void;

  initialCategory?: Category;
}) {
  const router = useRouter();

  const [mobileCategory, setMobileCategory] =
    useState<Category>(initialCategory);

  const visibility = useProjectVisibility();
  const [hovered, setHovered] = useState<Project | null>(null);

  const entriesFor = (category: Category) => {
    const list = projects[category];
    const all = list.length ? list : FALLBACK[category];
    const selected = list.length
      ? list.filter((p) => p.featured)
      : FALLBACK[category];
    return [...(visibility === "all" ? all : selected)].sort(byName);
  };

  const select = (project: Project, category: Category) => {
    if (onSelect) {
      onSelect(project, category);
      return;
    }

    router.push(`/#${category}`);
  };

  const previewImage =
    hovered?.images?.find((m) => m.type === "image")?.url ??
    hovered?.coverImageUrl ??
    (hovered ? PLACEHOLDER_IMAGE : null);

  return (
    <div className="relative h-full flex flex-col lg:grid lg:grid-cols-4 items-start w-full font-selecta font-medium text-lg lg:text-xl tracking-wide text-neutral-300 dark:text-neutral-600 pt-30 lg:pt-0 ">
      <motion.div
        variants={staggerItem}
        className="hidden absolute inset-0 -z-10 lg:flex lg:items-center justify-center lg:h-screen px-5.5  "
      >
        {previewImage && (
          <div className="relative bg-background flex items-center justify-center h-screen w-screen blur-xs   ">
            <img
              src={sanityImage(previewImage, { w: 800 })}
              alt={hovered?.title ?? ""}
              className="h-full w-auto object-contain   opacity-30 py-30 px-5.5 bg-background  "
            />
          </div>
        )}
      </motion.div>

      <motion.div variants={staggerItem} className="lg:hidden">
        <Select
          value={`${mobileCategory}:${visibility}`}
          onValueChange={(v) => {
            const [nextCategory, nextVisibility] = v.split(":") as [
              Category,
              Visibility,
            ];
            setMobileCategory(nextCategory);
            setProjectVisibility(nextVisibility);
          }}
        >
          <SelectTrigger className="h-14 gap-1 font-normal px-5.5 text-[0.8rem] w-full border-none rounded-none bg-transparent shadow-none text-blue-700 hover:text-blue-700 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-1010 bg-background font-selecta text-[0.8rem] text-neutral-300 ring-transparent  rounded-none">
            <SelectGroup>
              <SelectItem value="personal:selected">
                {LABEL.personal} – Selected
              </SelectItem>
              <SelectItem value="personal:all">
                {LABEL.personal} – All
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectItem value="commissioned:selected">
                {LABEL.commissioned} – Selected
              </SelectItem>
              <SelectItem value="commissioned:all">
                {LABEL.commissioned} – All
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </motion.div>

      {CATEGORIES.map((category) => {
        const entries = entriesFor(category);

        return (
          <motion.div
            key={category}
            variants={staggerItem}
            className={`${category === mobileCategory ? "flex" : "hidden"} lg:flex relative z-10 flex-col w-full h-dvh lg:h-screen ${COLUMN[category]}`}
          >
            <div className="hidden lg:flex absolute top-0 left-0 w-full h-32 items-start justify-start px-5.5 pointer-events-none bg-linear-to-b from-background from-25% via-background/10 via-55% to-transparent">
              <h3 className="h-14 flex items-center font-normal text-[0.8rem] text-blue-700">
                {LABEL[category]}
              </h3>
            </div>

            <ul
              className={`${category === "commissioned" ? "columns-2 [column-fill:auto]" : ""} items-start justify-start w-full gap-x-0 pt-0 lg:pt-14 pb-0 lg:pb-14 flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden`}
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
                    className="     truncate h-auto  justify-start text-neutral-400 dark:text-neutral-500   text-left cursor-pointer hover:text-blue-700"
                  >
                    {project.client ?? project.title}
                  </Button>
                </li>
              ))}
            </ul>

            <div className="hidden lg:flex absolute bottom-0 left-0 w-full h-32 items-end justify-start px-5.5 text-sm bg-linear-to-t from-background from-25% via-background/70 via-55% to-transparent pointer-events-none">
              {category === "personal" && (
                <div className="flex items-center gap-x-4 h-14 pointer-events-auto">
                  <Button
                    variant="link"
                    size="sm"
                    className={`px-0 hover:text-blue-700 ${visibility === "selected" ? "text-blue-700" : ""}`}
                    onClick={() => setProjectVisibility("selected")}
                  >
                    Selected
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className={`px-0 hover:text-blue-700 text-neutral-400 dark:text-neutral-500 ${visibility === "all" ? "text-blue-700" : ""}`}
                    onClick={() => setProjectVisibility("all")}
                  >
                    Show All
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
