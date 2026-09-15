"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { About, Project, ProjectMedia } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { useIntro } from "@/lib/intro";
import {
  setHoveredSection,
  useHoveredSection,
  type Section,
} from "@/lib/hover";
import { setOpenedSection, useOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
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

  if (project.coverImageUrl) {
    const cover =
      stills.find((m) => m.url === project.coverImageUrl) ??
      ({ url: project.coverImageUrl, type: "image" } as ProjectMedia);
    return [cover, ...stills.filter((m) => m.url !== project.coverImageUrl)];
  }
  return stills.length ? stills : [{ url: fallbackSrc, type: "image" }];
}

// One project in a column: just its current image, fixed in place. The
// column steps to a new project on scroll/swipe/arrow input rather than
// scrolling to it — see Strip — so this only ever shows the one that's
// currently active.
function Cover({
  project,
  media,
  columnOpen,
  onStepImage,
  reveal,
}: {
  project: Project;
  media: ProjectMedia;
  /** The column holds the width, so a click steps rather than only widening. */
  columnOpen: boolean;
  onStepImage: (delta: number) => void;
  /** Which way the reveal runs, and which edge of that axis it grows from —
   * scaleY top/bottom for a project step (scroll/swipe/arrows), scaleX
   * left/right for an in-project image step (tap/click next/prev). */
  reveal: { axis: "x" | "y"; origin: "top" | "bottom" | "left" | "right" };
}) {
  const src = media.url;

  return (
    // Fixed in place: this slot never moves, only which image fills it
    // changes. `pt-5.5 pb-5.5` matches the column's own edge inset.
    <div className="relative shrink-0 w-full h-screen pt-6 pb-6 flex flex-col">
      <div className="relative w-full h-full">
        {/* prev / next zones — split the image itself since stepping
            through a project's own gallery has both directions, same as
            the project-level scroll/swipe does. The click still bubbles up
            so a narrow column widens first, same as before. */}
        <button
          type="button"
          aria-label={`Previous image of ${project.title}`}
          className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
          onClick={() => {
            if (columnOpen) onStepImage(-1);
          }}
        />
        <button
          type="button"
          aria-label={`Next image of ${project.title}`}
          className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
          onClick={() => {
            if (columnOpen) onStepImage(1);
          }}
        />
        {/* `contain` fits the whole image without cropping; `object-top`
            keeps the spare height underneath it rather than centring it.
            `key={src}` remounts on every image change (project step or
            in-project image step alike), replaying the 0→1 reveal along
            whichever axis and edge `reveal` currently says. */}
        <motion.img
          key={src}
          src={src.startsWith("/") ? src : sanityImage(src, { w: 1400 })}
          alt={media.caption ?? ""}
          initial={reveal.axis === "x" ? { scaleX: 0 } : { scaleY: 0 }}
          animate={reveal.axis === "x" ? { scaleX: 1 } : { scaleY: 1 }}
          transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: reveal.origin }}
          className="w-full h-full object-contain object-center pointer-events-none"
        />
      </div>
    </div>
  );
}

// Each section is its own vertical scroller — side by side once there is
// width for it, stacked below. The two run independently: scrolling through
// the commissioned work leaves the personal column where it was.
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
  /** Stands in for a project with no cover of its own. */
  fallbackSrc: string;
  /** Ground the covers sit on, and what shows between them. */
  background?: string;
  /** Which column has been chosen while stacked; null means neither yet. */
  opened: Section;
  onOpen: () => void;
  /** A project handed down from the Index overlay to scroll to, once. */
  scrollToSlug?: string | null;
  onScrolled?: () => void;
}) {
  // Scroll, swipe, and the arrow keys all step to the next/previous project
  // rather than scrolling to it — there's nothing to scroll to any more, one
  // fixed slot just swaps which project fills it — but only when this is the
  // column being read: the chosen one, or — before either has been chosen —
  // the one under the pointer.
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerOver = useHoveredSection();
  const listens =
    opened === section || (opened === null && pointerOver === section);

  // The images each project steps through, resolved once for the column.
  const columnImages = useMemo(
    () => projects.map((p) => coverImages(p, fallbackSrc)),
    [projects, fallbackSrc],
  );

  // Which project is shown, where it sits in its own images, and which way
  // the next reveal runs — scaleY for a project step (scroll/swipe/arrows),
  // scaleX for an in-project image step (tap/click next/prev).
  const [active, setActive] = useState(0);
  const [frames, setFrames] = useState<number[]>(() => projects.map(() => 0));
  const [reveal, setReveal] = useState<{
    axis: "x" | "y";
    origin: "top" | "bottom" | "left" | "right";
  }>({ axis: "y", origin: "top" });

  const stepProject = useCallback(
    (delta: number) => {
      setReveal({ axis: "y", origin: delta > 0 ? "top" : "bottom" });
      setActive((a) => (a + delta + projects.length) % projects.length);
    },
    [projects.length],
  );

  const stepImage = useCallback(
    (delta: number) => {
      setReveal({ axis: "x", origin: delta > 0 ? "left" : "right" });
      setFrames((prev) => {
        const next = prev.slice();
        const total = columnImages[active]?.length ?? 1;
        next[active] = ((next[active] ?? 0) + delta + total) % total;
        return next;
      });
    },
    [columnImages, active],
  );

  // Picking a project in the Index overlay jumps straight to it — no
  // scrolling involved any more, just swap which one is shown.
  useEffect(() => {
    if (!scrollToSlug) return;
    const i = projects.findIndex((p) => (p.slug ?? p.title) === scrollToSlug);
    if (i >= 0) setActive(i);
    onScrolled?.();
  }, [scrollToSlug, onScrolled, projects]);

  useEffect(() => {
    if (!listens) return;
    const el = containerRef.current;
    if (!el) return;

    // A step every so often rather than one per wheel/touchmove tick — those
    // fire many times per physical gesture.
    let cooling = false;
    const COOLDOWN = 500;
    const go = (delta: number) => {
      if (cooling) return;
      cooling = true;
      stepProject(delta);
      setTimeout(() => {
        cooling = false;
      }, COOLDOWN);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 10) return;
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      const back = e.key === "ArrowUp" || (e.key === " " && e.shiftKey);
      const on = e.key === "ArrowDown" || (e.key === " " && !e.shiftKey);
      if (!back && !on) return;
      e.preventDefault();
      go(back ? -1 : 1);
    };
    let touchStart: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStart === null) return;
      const travelled = touchStart - (e.touches[0]?.clientY ?? touchStart);
      if (Math.abs(travelled) < 40) return;
      touchStart = null;
      go(travelled > 0 ? 1 : -1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [listens, stepProject]);

  // The two columns split the width until one is chosen, and then it takes
  // all of it — but the other keeps a sliver rather than collapsing to
  // nothing, so there is still something to click to hand the width back.
  // Same at every breakpoint: stacked you tap the overlay, on desktop the
  // column itself, since the overlay is not there.
  const width =
    opened === null ? "w-[50vw]" : opened === section ? "w-screen" : "w-0";

  const shown = projects[active] ?? projects[0];
  const shownImages = columnImages[active] ?? [];
  const shownMedia = shownImages[frames[active] ?? 0] ?? shownImages[0];

  return (
    <div
      ref={containerRef}
      data-panel={section}
      // A cover's own click navigates and this fires too, but the page is
      // leaving anyway — so it only takes effect on the ground around them.
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
      {shown && shownMedia && (
        <div className="w-full h-full px-5.5">
          <Cover
            project={shown}
            media={shownMedia}
            columnOpen={opened === section}
            onStepImage={stepImage}
            reveal={reveal}
          />
        </div>
      )}

      {/* The caption, pinned to the column rather than to any one cover, so
          it names whichever project is currently shown. `px-5.5` shares the
          cover's own inset — the same edge the nav corners keep.
          `pointer-events-none` lets hover and clicks fall through to the
          column behind it. */}
      {shown && (
        <div className="pointer-events-none absolute inset-x-0 top-[50vh] z-10 flex flex-col gap-y-2 px-5.5 pb-6">
          <InfoLayout
            title={shown.title}
            model={section === "personal" ? shown.client : undefined}
            client={section === "commissioned" ? shown.client : undefined}
            agency={shown.agency}
            frame={(frames[active] ?? 0) + 1}
            total={shownImages.length}
          />
        </div>
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
  // `rows` still drives the intro card below, hidden though it currently is.
  const { rows } = useIntro();

  // Held in a store rather than state: the nav's own section buttons set it
  // too, and they render in the layout.
  const opened = useOpenedSection();

  // The URL carries the current view: `#personal` / `#commissioned` for which
  // column holds the width, `#about` / `#index` for the sheet over both. The
  // nav's corner buttons write it; here it is read back so a deep link or the
  // back button lands on the same state.
  const hash = useHash();

  useEffect(() => {
    if (hash === "personal" || hash === "commissioned") setOpenedSection(hash);
  }, [hash]);

  // A project picked in the Index sheet, handed down to both columns to
  // scroll to — only the one that actually holds it will move; cleared once
  // acted on. Which category the Index itself shows follows whichever column
  // is currently raised, defaulting to commissioned when neither is.
  const [jumpSlug, setJumpSlug] = useState<string | null>(null);
  const indexCategory: "personal" | "commissioned" =
    opened === "personal" ? "personal" : "commissioned";

  // The card's own rows, one beat apart, coming in as the name fades out.
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

      {/* Both sheets stay mounted so each keeps its own content while it slides
          back down — only one is ever raised, since the hash holds one value. */}
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
          projects={indexCategory === "personal" ? personal : commissioned}
          category={indexCategory}
          // Home already holds both categories' projects, so swap which one
          // is showing in place rather than navigating away and losing the
          // open sheet.
          onCategoryChange={(next) => setOpenedSection(next)}
          onSelect={(project) => {
            // Raise that column and scroll it to this project, then drop the
            // sheet — same shape as picking a section corner.
            setOpenedSection(indexCategory);
            setJumpSlug(project.slug ?? project.title);
            setHash("");
          }}
        />
      </InfoOverlay>

      <div className="hidden fixed inset-0 z-20  items-center justify-center p-4 pointer-events-none w-full">
        <DvmCard color="bg-green-900" variant="animation">
          <span className="flex flex-col items-start justify-center   gap-y-0 p-0 text-orange-400 font-selecta text-base font-medium text-left tracking-wider w-full ">
            <h1 className={row(0)}>Daniel von Malmborg</h1>
            <h2 className={row(1)}>Creative Director &amp; Photographer</h2>
          </span>
        </DvmCard>
      </div>
    </>
  );
}
