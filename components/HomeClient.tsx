"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import type { Project } from "@/lib/types";
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
import Counter from "@/components/Counter";
import SectionOverlay from "./SectionOverlay";
import InfoOverlay from "./InfoOverlay";
import AboutSection from "./AboutSection";
import IndexSection from "./IndexSection";

// The images one project steps through. A project with none of its own still
// shows its cover — or, failing that, the section's placeholder — so the
// counter reads 1 (1) rather than nothing.
function coverImages(project: Project, fallbackSrc: string) {
  return project.images?.length
    ? project.images.map((m) => m.url)
    : [project.coverImageUrl ?? fallbackSrc];
}

// One project in a column: just its current image. Stepping through a
// project's images and the caption that names it now both belong to the
// column — see Strip — so a cover only reports when it scrolls into view.
function Cover({
  project,
  images,
  frame,
  index,
  columnOpen,
  onStep,
  onEnter,
}: {
  project: Project;
  images: string[];
  /** Which of the project's images is up. */
  frame: number;
  index: number;
  /** The column holds the width, so a click steps rather than only widening. */
  columnOpen: boolean;
  onStep: (index: number) => void;
  onEnter: (index: number) => void;
}) {
  const src = images[frame];

  // The cover in view is the one being looked at, so the column's pinned
  // caption follows it. This only ever names a newer cover — the gaps between
  // full-height covers leave the last one standing rather than clearing it.
  // Half visible is the handoff point: full-height covers mean only one can
  // clear it at a time, so the caption swaps cleanly as one gives way to the
  // next.
  const box = useRef<HTMLButtonElement>(null);
  const inView = useInView(box, 0.5);
  useEffect(() => {
    if (inView) onEnter(index);
  }, [inView, index, onEnter]);

  return (
    // Eight equal rows over the wrapper's height: the image takes 1–5 and the
    // rest is the clearance the column's caption is pinned over.
    <div className="relative shrink-0 grid grid-rows-8 gap-y-3 pt-8 w-full h-[calc(100dvh-2.75rem)] lg:h-[calc(100dvh-3rem)]">
      <button
        ref={box}
        type="button"
        aria-label={`Next image of ${project.title}`}
        // `min-h-0` lets this shrink into its five rows: a grid item's
        // default `min-height: auto` refuses to go below its content, so the
        // image would push past them and overflow the wrapper.
        className="row-start-1 row-span-5 min-h-0 w-full cursor-pointer"
        // The click bubbles: every click inside a column hands it the width,
        // this one included. Stepping is held back until the column already
        // has it, so the first click on a narrow column only widens it
        // rather than also jumping the image out from under you.
        onClick={() => {
          if (columnOpen) onStep(index);
        }}
      >
        {/* `contain` fits the whole image without cropping; `object-top`
            keeps the spare height underneath it rather than centring it. */}
        <img
          src={src.startsWith("/") ? src : sanityImage(src, { w: 1400 })}
          alt=""
          className="w-full h-full object-contain object-top pointer-events-none"
        />
      </button>
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
}) {
  // Space and the arrow keys page this column, but only when it is the one
  // being read: the chosen column, or — before either has been chosen — the
  // one under the pointer. Lenis owns the scroll position, so it does the
  // moving rather than the browser.
  const lenisRef = useRef<LenisRef>(null);
  const pointerOver = useHoveredSection();
  const listens =
    opened === section || (opened === null && pointerOver === section);

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

  // The images each project steps through, resolved once for the column.
  const columnImages = useMemo(
    () => projects.map((p) => coverImages(p, fallbackSrc)),
    [projects, fallbackSrc],
  );

  // Which cover is in view, and where each project sits in its own images.
  // Both belong to the column, not a cover: the caption that reads them is
  // pinned to the column and outlives any one cover scrolling past.
  const [active, setActive] = useState(0);
  const [frames, setFrames] = useState<number[]>(() => projects.map(() => 0));

  const step = useCallback(
    (i: number) =>
      setFrames((prev) => {
        const next = prev.slice();
        next[i] = (next[i] + 1) % columnImages[i].length;
        return next;
      }),
    [columnImages],
  );

  // The two columns split the width until one is chosen, and then it takes
  // all of it — but the other keeps a sliver rather than collapsing to
  // nothing, so there is still something to click to hand the width back.
  // Same at every breakpoint: stacked you tap the overlay, on desktop the
  // column itself, since the overlay is not there.
  const width =
    opened === null ? "w-[50vw]" : opened === section ? "w-screen" : "w-0";

  const shown = projects[active] ?? projects[0];

  return (
    <div
      data-panel={section}
      // A cover's own click navigates and this fires too, but the page is
      // leaving anyway — so it only takes effect on the ground around them.
      onClick={onOpen}
      className={`group relative h-auto ${width} overflow-hidden pb-5.5 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-blue-700 ${background}`}
      onMouseEnter={() => setHoveredSection(section)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      <SectionOverlay
        section={section}
        dismissed={opened !== null}
        onClick={onOpen}
      />
      {/* Lenis owns this scroller rather than the page. The wrapper is what
          scrolls; the column inside is h-max so it overflows and has
          somewhere to scroll to. */}

      <ReactLenis
        ref={lenisRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden"
        options={{ orientation: "vertical", gestureOrientation: "both" }}
      >
        <div className="flex flex-col items-start h-dvh w-full gap-y-5.5 px-5.5 py-5.5">
          {projects.map((p, i) => (
            <Cover
              key={p.slug ?? `${p.title}-${i}`}
              project={p}
              images={columnImages[i]}
              frame={frames[i] ?? 0}
              index={i}
              columnOpen={opened === section}
              onStep={step}
              onEnter={setActive}
            />
          ))}
        </div>
      </ReactLenis>

      {/* The caption, pinned to the column rather than the scroller so it holds
          still while the covers move under it. It names whichever cover is in
          view and ticks with that project's images. `px-5.5` shares the covers'
          own inset — the same edge the nav corners keep. `pointer-events-none`
          lets hover and clicks fall through to the column behind it. */}
      {shown && (
        <div className="pointer-events-none absolute inset-x-0 top-[66.6vh] z-10 flex flex-col gap-y-2 px-5.5 pb-5.5">
          <div className="flex justify-center">
            <Counter
              frame={(frames[active] ?? 0) + 1}
              total={columnImages[active]?.length}
            />
          </div>
          <InfoLayout
            title={shown.title}
            model={section === "personal" ? shown.client : undefined}
            client={section === "commissioned" ? shown.client : undefined}
            agency={shown.agency}
          />
        </div>
      )}
    </div>
  );
}

export default function HomeClient({
  personal,
  commissioned,
}: {
  personal: Project[];
  commissioned: Project[];
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
        />
        <Strip
          section="commissioned"
          projects={commissioned}
          fallbackSrc="/personal_placeholder.png"
          opened={opened}
          onOpen={() => setHash("commissioned")}
        />
      </section>

      {/* Both sheets stay mounted so each keeps its own content while it slides
          back down — only one is ever raised, since the hash holds one value. */}
      <InfoOverlay open={hash === "about"} onDismiss={() => setHash("")}>
        <AboutSection />
      </InfoOverlay>
      <InfoOverlay open={hash === "index"} onDismiss={() => setHash("")}>
        <IndexSection personal={personal} commissioned={commissioned} />
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
