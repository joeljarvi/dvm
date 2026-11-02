"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { Project } from "@/lib/types";
import { clients, models } from "@/lib/data";
import { coverImages } from "@/components/HomeClient";
import BlurredPreview from "./BlurredPreview";
import {
  setProjectVisibility,
  useProjectVisibility,
} from "@/lib/projectVisibility";
import { Button } from "./ui/button";
import { REVEAL_TRANSITION, STAGGER, fadeItem } from "@/lib/motion";

const submenu: Variants = {
  hidden: {
    height: 0,
    transition: {
      ...REVEAL_TRANSITION,
      when: "afterChildren",
      staggerChildren: STAGGER,
      staggerDirection: -1,
    },
  },
  visible: {
    height: "auto",
    transition: { ...REVEAL_TRANSITION, staggerChildren: STAGGER },
  },
};

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

const spellOutAmpersand = (name: string) =>
  name
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+/g, " ")
    .trim();

const groupByClient = (entries: Project[]) => {
  const groups = new Map<string, { name: string; items: Project[] }>();
  for (const project of entries) {
    const name = spellOutAmpersand(project.client ?? project.title);
    const key = name.toLowerCase();
    const group = groups.get(key) ?? { name, items: [] };
    group.items.push(project);
    groups.set(key, group);
  }
  return [...groups.values()];
};

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
  open = true,
}: {
  projects: Record<Category, Project[]>;
  onSelect?: (project: Project, category: Category) => void;
  initialCategory?: Category;

  open?: boolean;
}) {
  const router = useRouter();

  const [mobileCategory, setMobileCategory] =
    useState<Category>(initialCategory);

  const [prevInitialCategory, setPrevInitialCategory] =
    useState(initialCategory);
  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    setMobileCategory(initialCategory);
  }

  const visibility = useProjectVisibility();
  const [hovered, setHovered] = useState<Project | null>(null);

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setQuery("");
  }

  useEffect(() => {
    setMobileCategory(getStoredCategory());
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const category = getHashCategory();

      if (!category) {
        return;
      }

      setMobileCategory(category);

      if (category === "commissioned") {
        window.localStorage.setItem(CATEGORY_STORAGE_KEY, "commissioned");
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (text?: string) => !!q && !!text?.toLowerCase().includes(q);

  const entriesFor = (category: Category) => {
    const list = projects[category];
    const all = list.length ? list : FALLBACK[category];

    const selected = list.length
      ? list.filter((p) => p.featured)
      : FALLBACK[category];

    if (q)
      return all.filter((p) => [p.title, p.client, p.agency].some(matches));

    return visibility === "all" ? all : selected;
  };

  const select = (project: Project, category: Category) => {
    if (onSelect) {
      onSelect(project, category);
      return;
    }

    router.push(`/#${category}`);
  };

  const projectHref = (project: Project, category: Category) =>
    project.slug ? `/${category}/${project.slug}` : undefined;
  const followSelect =
    (project: Project, category: Category) => (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
        return;
      e.preventDefault();
      select(project, category);
    };

  const toggleColor = (on: boolean) =>
    on
      ? "text-blue-700 dark:text-blue-700"
      : "text-neutral-400 dark:text-neutral-500";

  const preview = hovered ? coverImages(hovered, PLACEHOLDER_IMAGE)[0] : null;

  return (
    <div className="relative h-full flex flex-col lg:grid lg:grid-cols-4 items-start w-full font-diatype font-normal text-[0.8rem] tracking-wide text-neutral-300 dark:text-neutral-600 pt-30 lg:pt-0">
      {preview && (
        <div className="hidden lg:block absolute inset-x-0 top-0 -z-10 h-dvh px-5.5 bg-background pointer-events-none">
          <BlurredPreview media={preview} alt={hovered?.title} />
        </div>
      )}

      <div className="fixed top-[62.5%] right-0 z-40 flex flex-col items-end lg:hidden">
        <Button
          variant="link"
          size="sm"
          aria-pressed={visibility === "selected"}
          className={`hover:text-blue-700 dark:hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto justify-start ${toggleColor(visibility === "selected")}`}
          onClick={() => setProjectVisibility("selected")}
        >
          Selected
        </Button>

        <Button
          variant="link"
          size="sm"
          aria-pressed={visibility === "all"}
          className={`hover:text-blue-700 dark:hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto justify-start ${toggleColor(visibility === "all")}`}
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
              <h3 className="h-14 flex items-center font-normal text-[0.8rem] text-blue-700 hover:text-blue-600">
                {LABEL[category]}
              </h3>
            </div>

            <ul
              className={`
                ${
                  category === "commissioned"
                    ? "lg:columns-2 [column-fill:auto]"
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
              {groupByClient(entries).map(({ name, items }, i) => {
                const [first] = items;

                const multiple = items.length > 1;
                const groupKey = `${category}:${name}`;

                const foundByTitle =
                  !matches(name) && items.some((p) => matches(p.title));
                const open =
                  foundByTitle || (multiple && openGroup === groupKey);

                return (
                  <li
                    key={multiple ? groupKey : projectKey(first, i)}
                    className="break-inside-avoid"
                    onMouseLeave={() => setHovered(null)}
                  >
                    {(() => {
                      const href = multiple
                        ? undefined
                        : projectHref(first, category);
                      return (
                        <Button
                          variant="link"
                          size="sm"
                          asChild={!!href}
                          aria-expanded={multiple ? open : undefined}
                          onMouseEnter={() => setHovered(first)}
                          onClick={
                            href
                              ? undefined
                              : () =>
                                  multiple
                                    ? setOpenGroup(open ? null : groupKey)
                                    : select(first, category)
                          }
                          className={`truncate h-auto justify-start text-blue-700 dark:text-blue-700 text-left cursor-pointer hover:text-blue-700 dark:hover:text-blue-700 ${
                            first.client ? "" : "capitalize"
                          }`}
                        >
                          {href ? (
                            <Link
                              href={href}
                              onClick={followSelect(first, category)}
                            >
                              {name}
                            </Link>
                          ) : (
                            name
                          )}
                        </Button>
                      );
                    })()}

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.ul
                          key="submenu"
                          variants={submenu}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="pl-[25vw] w-[75vw] lg:pl-5.5 lg:w-full overflow-hidden"
                        >
                          {items.map((project, j) => (
                            <motion.li
                              key={projectKey(project, j)}
                              variants={fadeItem}
                              className="first:pt-2.5 last:pb-2.5"
                              onMouseEnter={() => setHovered(project)}
                            >
                              <Button
                                variant="link"
                                size="sm"
                                asChild={!!projectHref(project, category)}
                                onClick={
                                  projectHref(project, category)
                                    ? undefined
                                    : () => select(project, category)
                                }
                                className="w-full truncate h-auto justify-start text-blue-700 dark:text-blue-700 text-left capitalize cursor-pointer hover:text-blue-700 dark:hover:text-blue-700"
                              >
                                {projectHref(project, category) ? (
                                  <Link
                                    href={projectHref(project, category)!}
                                    onClick={followSelect(project, category)}
                                  >
                                    {project.title}
                                  </Link>
                                ) : (
                                  project.title
                                )}
                              </Button>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            <div className="hidden lg:flex absolute bottom-0 left-0 w-full h-32 items-end justify-start px-5.5 text-sm bg-linear-to-t from-background from-25% via-background/70 via-55% to-transparent pointer-events-none">
              {category === "personal" && (
                <div className="flex items-center gap-x-4 h-14 pointer-events-auto">
                  <Button
                    variant="link"
                    size="sm"
                    aria-pressed={visibility === "selected"}
                    className={`px-0 hover:text-blue-700 dark:hover:text-blue-700 ${toggleColor(visibility === "selected")}`}
                    onClick={() => setProjectVisibility("selected")}
                  >
                    Selected
                  </Button>

                  <Button
                    variant="link"
                    size="sm"
                    aria-pressed={visibility === "all"}
                    className={`px-0 hover:text-blue-700 dark:hover:text-blue-700 ${toggleColor(visibility === "all")}`}
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

      <div className="hidden lg:flex absolute bottom-0 left-3/4 w-1/4 h-14 z-20 items-center px-5.5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search projects"
          className="w-full bg-transparent border-0 p-0 outline-none font-diatype text-[0.8rem] tracking-wide text-blue-700 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:placeholder:text-blue-700 dark:focus:placeholder:text-blue-700 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
    </div>
  );
}
