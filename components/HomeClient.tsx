"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion } from "motion/react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import type { ScrollCallback } from "lenis";
import LenisSnap from "lenis/snap";
import type { About, Project, ProjectMedia } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { useIntro } from "@/lib/intro";
import { useIsDesktop } from "@/lib/media";
import {
  setHoveredSection,
  useHoveredSection,
  type Section,
} from "@/lib/hover";
import { setOpenedSection, useOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
import { useInView } from "@/lib/inView";
import DvmCard from "@/components/DvmCard";
import InfoLayout from "@/components/InfoLayout";
import SectionOverlay from "./SectionOverlay";
import InfoOverlay from "./InfoOverlay";
import AboutSection from "./AboutSection";
import IndexSection from "./IndexSection";

// The images one project steps through. This carousel only ever shows
// stills — video lives in the full project page — so video media is
// filtered out here rather than handed to an <img>. The dedicated cover
// leads (frame 0 is what the column opens on), followed by the rest of the
// stills — a still that happens to duplicate the cover isn't repeated. A
// project with no stills or cover of its own falls back to the section's
// placeholder, so the counter reads 1 (1) rather than nothing.
function coverImages(project: Project, fallbackSrc: string): ProjectMedia[] {
  const stills = project.images?.filter((m) => m.type === "image") ?? [];

  // A video cover takes precedence over an image one — same rule the studio
  // description states — and, unlike a still, is never also one of the
  // gallery's own images, so it's just prepended rather than deduped.
  if (project.coverVideoUrl) {
    return [{ url: project.coverVideoUrl, type: "file" }, ...stills];
  }
  if (project.coverImageUrl) {
    const cover =
      stills.find((m) => m.url === project.coverImageUrl) ??
      ({ url: project.coverImageUrl, type: "image" } as ProjectMedia);
    return [cover, ...stills.filter((m) => m.url !== project.coverImageUrl)];
  }
  return stills.length ? stills : [{ url: fallbackSrc, type: "image" }];
}

// One project in the column's scrollable stack: a full-height slot for
// whichever of its images is currently up. Reports into the column when it
// scrolls into view, so the pinned caption follows whichever cover is being
// looked at. `data-slug` is how a jump from the Index overlay finds this
// cover to scroll to — see Strip's scrollToSlug.
function Cover({
  project,
  media,
  columnOpen,
  expanded,
  onExpand,
  onStepImage,
  onEnter,
}: {
  project: Project;
  media: ProjectMedia;
  /** The column holds the width, so a click steps rather than only widening. */
  columnOpen: boolean;
  /** Stepped into its own gallery — drives the padding down to 96. */
  expanded: boolean;
  onExpand: () => void;
  onStepImage: (delta: number) => void;
  onEnter: () => void;
}) {
  const src = media.url;

  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, 0.5);
  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  const padding = expanded ? 56 : 168;

  const handleClick = () => {
    if (!columnOpen) return;
    if (!expanded) {
      onExpand();
      return;
    }
    onStepImage(1);
  };

  return (
    <motion.div
      ref={box}
      data-slug={project.slug ?? project.title}
      className="relative shrink-0 w-full group h-screen flex flex-col"
      animate={{
        paddingTop: padding,
        paddingBottom: padding,
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative w-full h-full">
        <button
          type="button"
          aria-label={`Cycle images of ${project.title}`}
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleClick}
        />

        {media.type === "file" ? (
          <video
            src={src}
            className="w-full h-full object-contain object-center pointer-events-none"
            autoPlay
            muted
            loop
            playsInline
            aria-label={media.caption}
          />
        ) : (
          <img
            src={src.startsWith("/") ? src : sanityImage(src, { w: 1400 })}
            alt={media.caption ?? ""}
            className="w-full h-full object-contain object-center pointer-events-none"
          />
        )}
      </div>
    </motion.div>
  );
}

function ColumnSnap({
  containerRef,
  count,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  /** Re-collects the covers whenever the project list's size changes. */
  count: number;
}) {
  const lenis = useLenis();
  useEffect(() => {
    const container = containerRef.current;
    if (!lenis || !container) return;
    const snap = new LenisSnap(lenis, {
      type: "mandatory",
      duration: 0.8,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    const removers = Array.from(
      container.querySelectorAll<HTMLElement>("[data-slug]"),
    ).map((el) => snap.addElement(el));
    return () => {
      removers.forEach((remove) => remove());
      snap.destroy();
    };
  }, [lenis, containerRef, count]);

  return null;
}

// Any actual scroll — wheel, touch, arrow-key paging, the snap settling —
// breaks the active cover out of gallery mode, but keeps whichever image it
// was on rather than resetting to the first (unlike leaving the cover
// behind entirely by scrolling past it — see Strip's enterCover). Rendered
// inside <ReactLenis> for the same reason as ColumnSnap.
function BreakGalleryOnScroll({ onScroll }: { onScroll: () => void }) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    // Lenis also fires "scroll" from a bare dimension recalculation — e.g.
    // its own debounced resize observer, tripped by the very padding
    // animation gallery mode just started — with the scroll position left
    // untouched. `isScrolling` is only set while a real scroll is under
    // way, which is what told the click-triggered entry into gallery mode
    // apart from one of those recalculation pings immediately undoing it.
    const handleScroll: ScrollCallback = (instance) => {
      if (instance.isScrolling) onScroll();
    };
    lenis.on("scroll", handleScroll);
    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis, onScroll]);

  return null;
}

function Strip({
  section,
  projects,
  fallbackSrc,
  background = "",
  opened,
  onOpen,
  scrollToSlug,
  onScrolled,
}: {
  section: Exclude<Section, null>;
  projects: Project[];

  fallbackSrc: string;

  background?: string;

  opened: Section;
  onOpen: () => void;

  scrollToSlug?: string | null;
  onScrolled?: () => void;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerOver = useHoveredSection();
  const listens =
    opened === section || (opened === null && pointerOver === section);

  const columnImages = useMemo(
    () => projects.map((p) => coverImages(p, fallbackSrc)),
    [projects, fallbackSrc],
  );

  const [active, setActive] = useState(0);
  const [frames, setFrames] = useState<number[]>(() => projects.map(() => 0));
  const [expanded, setExpanded] = useState<boolean[]>(() =>
    projects.map(() => false),
  );

  const desktop = useIsDesktop();

  const expandCover = useCallback((index: number) => {
    setExpanded((prev) => {
      if (prev[index]) return prev;
      const next = prev.slice();
      next[index] = true;
      return next;
    });
  }, []);

  const breakGallery = useCallback(() => {
    setExpanded((prev) => {
      if (!prev[active]) return prev;
      const next = prev.slice();
      next[active] = false;
      return next;
    });
  }, [active]);

  const stepImage = useCallback(
    (index: number, delta: number) => {
      setFrames((prev) => {
        const next = prev.slice();
        const total = columnImages[index]?.length ?? 1;
        next[index] = ((next[index] ?? 0) + delta + total) % total;
        return next;
      });
    },
    [columnImages],
  );

  const enterCover = useCallback((index: number) => {
    setActive((prev) => {
      if (index > prev) {
        setExpanded((prevExpanded) => {
          if (!prevExpanded[prev]) return prevExpanded;
          const next = prevExpanded.slice();
          next[prev] = false;
          return next;
        });
        setFrames((prevFrames) => {
          if ((prevFrames[prev] ?? 0) === 0) return prevFrames;
          const next = prevFrames.slice();
          next[prev] = 0;
          return next;
        });
      }
      return index;
    });
  }, []);

  useEffect(() => {
    if (!scrollToSlug) return;
    const lenis = lenisRef.current?.lenis;
    const el = containerRef.current?.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(scrollToSlug)}"]`,
    );
    if (lenis && el) lenis.scrollTo(el);
    onScrolled?.();
  }, [scrollToSlug, onScrolled]);

  useEffect(() => {
    if (!listens) return;
    const onKey = (e: KeyboardEvent) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      const page = window.innerHeight * 0.9;
      const back = e.key === "ArrowUp" || (e.key === " " && e.shiftKey);
      const on = e.key === "ArrowDown" || (e.key === " " && !e.shiftKey);
      if (!back && !on) return;
      e.preventDefault();
      lenis.scrollTo(lenis.scroll + (back ? -page : page));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listens]);

  const width =
    opened === null ? "w-[50vw]" : opened === section ? "w-screen" : "w-0";

  const shown = projects[active] ?? projects[0];
  const shownImages = columnImages[active] ?? [];

  return (
    <div
      ref={containerRef}
      data-panel={section}
      onClick={onOpen}
      className={`group relative h-auto ${width} overflow-hidden pb-0 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-blue-700 ${background}`}
      onMouseEnter={() => setHoveredSection(section)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      <SectionOverlay
        section={section}
        dismissed={opened !== null}
        onClick={onOpen}
      />

      <ReactLenis
        ref={lenisRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden"
        options={{
          orientation: "vertical",
          gestureOrientation: "both",
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          infinite: false,
          autoResize: true,
        }}
      >
        <ColumnSnap containerRef={containerRef} count={projects.length} />
        <BreakGalleryOnScroll onScroll={breakGallery} />
        <div className="flex flex-col items-start w-full px-5.5">
          {projects.map((p, i) => {
            const images = columnImages[i];
            const frame = frames[i] ?? 0;
            const media = images[frame] ?? images[0];
            return media ? (
              <Cover
                key={p.slug ?? `${p.title}-${i}`}
                project={p}
                media={media}
                columnOpen={opened === section}
                expanded={expanded[i] ?? false}
                onExpand={() => expandCover(i)}
                onStepImage={(delta) => stepImage(i, delta)}
                onEnter={() => enterCover(i)}
              />
            ) : null;
          })}
        </div>
      </ReactLenis>

      {shown && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-10 flex flex-col gap-y-2 px-5.5 pb-6  transition-opacity duration-300"
          animate={{
            top: desktop && expanded[active] ? "62.5vh" : "62.5vh",
          }}
          transition={{
            type: "spring",
            mass: 1.4,
            stiffness: 120,
            damping: 16,
          }}
        >
          <InfoLayout
            title={shown.title}
            model={section === "personal" ? shown.client : undefined}
            client={section === "commissioned" ? shown.client : undefined}
            agency={expanded[active] ? shown.agency : undefined}
            revealed={expanded[active]}
            frame={(frames[active] ?? 0) + 1}
            total={shownImages.length}
            counterClassName={
              expanded[active] ? undefined : "hidden lg:inline-flex"
            }
          />
        </motion.div>
      )}
    </div>
  );
}

export default function HomeClient({
  personal,
  commissioned,
  about,
}: {
  personal: Project[];
  commissioned: Project[];
  about: About | null;
}) {
  const { rows } = useIntro();

  const opened = useOpenedSection();

  const hash = useHash();

  useEffect(() => {
    if (hash === "personal" || hash === "commissioned") setOpenedSection(hash);
  }, [hash]);

  const [jumpSlug, setJumpSlug] = useState<string | null>(null);

  const row = (n: number) =>
    `transition-opacity duration-500 ease-out ${rows > n ? "" : "opacity-0"}`;

  useEffect(() => () => setHoveredSection(null), []);

  return (
    <>
      <section className="font-selecta relative flex  flex-row w-screen h-dvh overflow-hidden">
        <Strip
          section="personal"
          projects={personal}
          fallbackSrc="/personal_placeholder.png"
          background="bg-background"
          opened={opened}
          onOpen={() => setHash("personal")}
          scrollToSlug={jumpSlug}
          onScrolled={() => setJumpSlug(null)}
        />
        <Strip
          section="commissioned"
          projects={commissioned}
          fallbackSrc="/personal_placeholder.png"
          opened={opened}
          onOpen={() => setHash("commissioned")}
          scrollToSlug={jumpSlug}
          onScrolled={() => setJumpSlug(null)}
        />
      </section>

      <InfoOverlay open={hash === "about"} onDismiss={() => setHash("")}>
        <AboutSection about={about} />
      </InfoOverlay>
      <InfoOverlay
        open={hash === "index"}
        onDismiss={() => setHash("")}
        panelClassName="inset-x-0 bottom-0 h-dvh lg:bottom-auto lg:top-0"
        shadow={false}
      >
        <IndexSection
          projects={{ personal, commissioned }}
          onSelect={(project, category) => {
            setOpenedSection(category);
            setJumpSlug(project.slug ?? project.title);
            setHash("");
          }}
          initialCategory={opened ?? "personal"}
        />
      </InfoOverlay>
    </>
  );
}
