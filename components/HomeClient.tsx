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
import LenisSnap from "lenis/snap";
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
  frame,
  total,
  columnOpen,
  expanded,
  onExpand,
  onCollapse,
  onStepImage,
  onEnter,
}: {
  project: Project;
  media: ProjectMedia;
  /** Which of the project's images is up, and how many it has — drives the
   *  cursor (zoomed in before the gallery opens, zoomed back out once the
   *  last one is reached) and whether a click steps or leaves the gallery. */
  frame: number;
  total: number;
  /** The column holds the width, so a click steps rather than only widening. */
  columnOpen: boolean;
  /** Stepped into its own gallery — drives the padding down to py-6. */
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onStepImage: (delta: number) => void;
  onEnter: () => void;
}) {
  const src = media.url;

  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, 0.5);
  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  // The first click only opens the gallery — dropping the padding to py-6
  // without moving off the cover image. Once open, the same zones step
  // through the project's own images — until the last one, where a further
  // click leaves the gallery instead of wrapping back to the first.
  const atEnd = expanded && frame === total - 1;
  const handleClick = (delta: number) => {
    if (!columnOpen) return;
    if (!expanded) {
      onExpand();
      return;
    }
    if (atEnd) {
      onCollapse();
      return;
    }
    onStepImage(delta);
  };

  const cursor = !expanded
    ? "cursor-zoom-in"
    : atEnd
      ? "cursor-zoom-out"
      : "cursor-pointer";

  return (
    <motion.div
      ref={box}
      data-slug={project.slug ?? project.title}
      className="relative shrink-0 w-full h-screen flex flex-col"
      animate={{
        paddingTop: expanded ? 23 : 120,
        paddingBottom: expanded ? 23 : 120,
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative w-full h-full">
        {/* prev / next zones — split the image itself since stepping
            through a project's own gallery has both directions, same as
            the project-level scroll does. The click still bubbles up so a
            narrow column widens first, same as before. */}
        <button
          type="button"
          aria-label={`Previous image of ${project.title}`}
          className={`absolute inset-y-0 left-0 z-10 w-1/2 ${cursor}`}
          onClick={() => handleClick(-1)}
        />
        <button
          type="button"
          aria-label={`Next image of ${project.title}`}
          className={`absolute inset-y-0 right-0 z-10 w-1/2 ${cursor}`}
          onClick={() => handleClick(1)}
        />
        {/* `contain` fits the whole thing without cropping; `object-center`
            keeps it centered rather than pinned to an edge. A video cover
            (see coverImages) plays muted and on loop, same as the gallery
            grid's own video items in ProjectDetail. */}
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

// Registers every cover already in the DOM as a Lenis snap point, so a
// scroll or swipe settles cleanly on one project once it stops — done via
// Lenis's own snap plugin, driven off its `virtual-scroll` event, rather
// than CSS scroll-snap: combining CSS snap with Lenis's own JS-driven
// smoothing fights over the scroll position and can lock it in place
// entirely. Rendered inside <ReactLenis> so `useLenis` resolves to this
// column's own instance rather than the page-level one from the layout.
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
      duration: 1.6,
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
  // Space and the arrow keys page this column, but only when it is the one
  // being read: the chosen column, or — before either has been chosen — the
  // one under the pointer. Lenis owns the scroll position, so it does the
  // moving rather than the browser.
  const lenisRef = useRef<LenisRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerOver = useHoveredSection();
  const listens =
    opened === section || (opened === null && pointerOver === section);

  // The images each project steps through, resolved once for the column.
  const columnImages = useMemo(
    () => projects.map((p) => coverImages(p, fallbackSrc)),
    [projects, fallbackSrc],
  );

  // Which cover is in view, where each project sits in its own images, and
  // whether it's been stepped into its gallery (py-6) or is still resting on
  // its cover (py-30). All three belong to the column, not a cover: the
  // caption that reads them is pinned to the column and outlives any one
  // cover scrolling past.
  const [active, setActive] = useState(0);
  const [frames, setFrames] = useState<number[]>(() => projects.map(() => 0));
  const [expanded, setExpanded] = useState<boolean[]>(() =>
    projects.map(() => false),
  );

  const expandCover = useCallback((index: number) => {
    setExpanded((prev) => {
      if (prev[index]) return prev;
      const next = prev.slice();
      next[index] = true;
      return next;
    });
  }, []);

  // A click at the last image in the gallery leaves it rather than wrapping
  // back to the first — same reset as scrolling a gallery-mode project out
  // of view, just triggered by the click itself instead.
  const collapseCover = useCallback((index: number) => {
    setExpanded((prev) => {
      if (!prev[index]) return prev;
      const next = prev.slice();
      next[index] = false;
      return next;
    });
    setFrames((prev) => {
      if ((prev[index] ?? 0) === 0) return prev;
      const next = prev.slice();
      next[index] = 0;
      return next;
    });
  }, []);

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

  // A cover entering view is what moves `active` along — but if that carries
  // us past a project left sitting in its gallery, that project gives way
  // to its cover again (py-30) rather than being left stranded off-screen.
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

  // Picking a project in the Index overlay lands here as a slug to bring
  // into view — scoped to this column's own container so a same-named
  // project in the other section can never be matched instead. Both columns
  // get the same slug; only the one that actually holds it moves.
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

  // The two columns split the width until one is chosen, and then it takes
  // all of it — but the other keeps a sliver rather than collapsing to
  // nothing, so there is still something to click to hand the width back.
  // Same at every breakpoint: stacked you tap the overlay, on desktop the
  // column itself, since the overlay is not there.
  const width =
    opened === null ? "w-[50vw]" : opened === section ? "w-screen" : "w-0";

  const shown = projects[active] ?? projects[0];
  const shownImages = columnImages[active] ?? [];

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
      {/* Lenis owns this scroller rather than the page. The wrapper is what
          scrolls; the column inside is a stack of full-height covers, each
          registered as a snap point by ColumnSnap, so scrolling always lands
          cleanly on one project at a time. */}
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
                frame={frame}
                total={images.length}
                columnOpen={opened === section}
                expanded={expanded[i] ?? false}
                onExpand={() => expandCover(i)}
                onCollapse={() => collapseCover(i)}
                onStepImage={(delta) => stepImage(i, delta)}
                onEnter={() => enterCover(i)}
              />
            ) : null;
          })}
        </div>
      </ReactLenis>

      {/* The caption, pinned to the column rather than to any one cover, so
          it names whichever project is currently in view. `px-5.5` shares
          the cover's own inset — the same edge the nav corners keep.
          `pointer-events-none` lets hover and clicks fall through to the
          column behind it. */}
      {shown && (
        <div className="pointer-events-none absolute inset-x-0 top-[50vh] z-10 flex flex-col gap-y-2 px-5.5 pb-6">
          <InfoLayout
            title={shown.title}
            model={section === "personal" ? shown.client : undefined}
            client={section === "commissioned" ? shown.client : undefined}
            agency={expanded[active] ? shown.agency : undefined}
            frame={expanded[active] ? (frames[active] ?? 0) + 1 : undefined}
            total={expanded[active] ? shownImages.length : undefined}
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
