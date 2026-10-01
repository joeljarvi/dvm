"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { clients, models } from "@/lib/data";
import {
  COVER_BOX_CLASS,
  COVER_FRAME_CLASS,
  COVER_STAGE_CLASS,
  MEDIA_CLASS,
  coverImages,
  mediaSrc,
} from "@/components/HomeClient";
import {
  setProjectVisibility,
  useProjectVisibility,
  type Visibility,
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

const PLACEHOLDER_IMAGE = "/personal_placeholder.png";

const COLUMN: Record<Category, string> = {
  personal: "lg:col-start-2",
  commissioned: "lg:col-start-3 lg:col-span-2",
};

const CATEGORY_STORAGE_KEY = "index-section-category";

const projectKey = (project: Project, i: number) =>
  project.slug ?? `${project.title}-${i}`;

const getHashCategory = (): Category | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash.replace("#", "");

  if (hash === "personal" || hash === "commissioned") {
    return hash;
  }

  return null;
};

const getStoredCategory = (): Category => {
  if (typeof window === "undefined") {
    return "personal";
  }

  const hashCategory = getHashCategory();

  if (hashCategory) {
    return hashCategory;
  }

  const stored = window.localStorage.getItem(CATEGORY_STORAGE_KEY);

  return stored === "commissioned" ? "commissioned" : "personal";
};

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

  // This state is ONLY used for the mobile category.
  const [mobileCategory, setMobileCategory] =
    useState<Category>(initialCategory);

  const visibility = useProjectVisibility();
  const [hovered, setHovered] = useState<Project | null>(null);

  // Resolve URL/localStorage state on the client.
  useEffect(() => {
    setMobileCategory(getStoredCategory());
  }, []);

  // Keep mobile state synced with hash navigation.
  useEffect(() => {
    const handleHashChange = () => {
      const category = getHashCategory();

      if (!category) {
        return;
      }

      setMobileCategory(category);

      // Remember commissioned specifically.
      if (category === "commissioned") {
        window.localStorage.setItem(CATEGORY_STORAGE_KEY, "commissioned");
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const entriesFor = (category: Category) => {
    const list = projects[category];
    const all = list.length ? list : FALLBACK[category];

    const selected = list.length
      ? list.filter((p) => p.featured)
      : FALLBACK[category];

    return visibility === "all" ? all : selected;
  };

  const select = (project: Project, category: Category) => {
    if (onSelect) {
      onSelect(project, category);
      return;
    }

    router.push(`/#${category}`);
  };

  const previewImage = hovered
    ? (coverImages(hovered, PLACEHOLDER_IMAGE).find((m) => m.type === "image")
        ?.url ?? PLACEHOLDER_IMAGE)
    : null;

  return (
    <div className="relative h-full flex flex-col lg:grid lg:grid-cols-4 items-start w-full font-diatype font-normal text-[0.8rem] tracking-wide text-neutral-300 dark:text-neutral-600 pt-30 lg:pt-0">
      {previewImage && (
        <div className="hidden lg:block absolute inset-x-0 top-0 -z-10 h-dvh px-5.5 bg-background pointer-events-none">
          <div className={`h-dvh ${COVER_STAGE_CLASS}`}>
            <div className={COVER_FRAME_CLASS}>
              <div className={`${COVER_BOX_CLASS} max-w-full`}>
                <img
                  src={mediaSrc(previewImage)}
                  alt={hovered?.title ?? ""}
                  className={`${MEDIA_CLASS} opacity-30`}
                />
              </div>
            </div>
          </div>

          <div aria-hidden className="absolute inset-0 backdrop-blur-xs" />
        </div>
      )}

      <div className="fixed top-[62.5vh] right-0 z-40 flex flex-col items-end lg:hidden">
        <Button
          variant="link"
          size="sm"
          className="text-neutral-400 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto justify-start"
          onClick={() => setProjectVisibility("selected")}
        >
          Selected
        </Button>

        <Button
          variant="link"
          size="sm"
          className="text-neutral-400 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto justify-start"
          onClick={() => setProjectVisibility("all")}
        >
          Show All
        </Button>
      </div>

      {CATEGORIES.map((category) => {
        const entries = entriesFor(category);

        return (
          <div
            key={category}
            className={`
              ${category === mobileCategory ? "flex" : "hidden"}
              lg:flex
              relative z-10
              flex-col
              w-full
              h-dvh
              lg:h-screen
              ${COLUMN[category]}
            `}
          >
            <div className="hidden lg:flex absolute top-0 left-0 w-full h-32 items-start justify-start px-5.5 pointer-events-none bg-linear-to-b from-background from-25% via-background/10 via-55% to-transparent">
              <h3 className="h-14 flex items-center font-normal text-[0.8rem] text-blue-700">
                {LABEL[category]}
              </h3>
            </div>

            <ul
              className={`
                ${
                  category === "commissioned"
                    ? "columns-2 [column-fill:auto]"
                    : ""
                }
                items-start justify-start
                w-full
                gap-x-0
                pt-0 lg:pt-14
                pb-0 lg:pb-14
                flex-1
                overflow-y-auto
                scrollbar-none
                [&::-webkit-scrollbar]:hidden
              `}
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
                    className={`truncate h-auto justify-start text-neutral-400 dark:text-neutral-500 text-left cursor-pointer hover:text-blue-700 ${
                      project.client ? "" : "capitalize"
                    }`}
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
                    className={`px-0 hover:text-blue-700 ${
                      visibility === "selected" ? "text-blue-700" : ""
                    }`}
                    onClick={() => setProjectVisibility("selected")}
                  >
                    Selected
                  </Button>

                  <Button
                    variant="link"
                    size="sm"
                    className={`px-0 hover:text-blue-700 text-neutral-400 dark:text-neutral-500 ${
                      visibility === "all" ? "text-blue-700" : ""
                    }`}
                    onClick={() => setProjectVisibility("all")}
                  >
                    Show All
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
