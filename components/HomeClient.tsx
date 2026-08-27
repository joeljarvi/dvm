"use client";

import { useEffect, useRef, useState } from "react";
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
import { useInView } from "@/lib/inView";
import DvmCard from "@/components/DvmCard";
import InfoLayout from "@/components/InfoLayout";
import Counter from "@/components/Counter";
import SectionOverlay from "./SectionOverlay";

// One project in a column. Clicking it steps through that project's own
// images rather than navigating, so the index has to live per project — a
// single index on the column would reset every neighbour.
function Cover({
  project,
  section,
  fallbackSrc,
  active,
}: {
  project: Project;
  section: Exclude<Section, null>;
  fallbackSrc: string;
  /** Whether this cover's column already holds the width. */
  active: boolean;
}) {
  const [frame, setFrame] = useState(0);

  // A project with no images of its own still has one thing to show, so the
  // counter reads 1/1 rather than disappearing.
  const images = project.images?.length
    ? project.images.map((m) => m.url)
    : [project.coverImageUrl ?? fallbackSrc];

  const src = images[frame];

  // The cover the column is parked on lights its own title, with no pointer
  // involved — so scrolling reads as moving through the work.
  const box = useRef<HTMLButtonElement>(null);
  const inView = useInView(box);

  return (
    // Eight equal rows over the wrapper's height. Each part names the row it
    // starts on rather than being flowed into the next free one, so moving
    // one leaves the others where they are: the image takes 1–5, the counter
    // 6, the metadata 7, and row 8 is trailing space. The grid has to live
    // here — the counter and metadata are siblings of the button, so a grid
    // on the button could never place them.
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
          if (active) setFrame((f) => (f + 1) % images.length);
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

      <div className="row-start-6 flex justify-center items-start pointer-events-none">
        <Counter frame={frame + 1} total={images.length} />
      </div>

      <div className="row-start-7 row-span-2 w-full pointer-events-none">
        <InfoLayout
          title={project.title}
          model={section === "personal" ? project.client : undefined}
          client={section === "commissioned" ? project.client : undefined}
          agency={project.agency}
          highlight={inView}
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

  // The two columns split the width until one is chosen, and then it takes
  // all of it — but the other keeps a sliver rather than collapsing to
  // nothing, so there is still something to click to hand the width back.
  // Same at every breakpoint: stacked you tap the overlay, on desktop the
  // column itself, since the overlay is not there.
  const width =
    opened === null ? "w-[50vw]" : opened === section ? "w-screen" : "w-0";

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
              section={section}
              fallbackSrc={fallbackSrc}
              active={opened === section}
            />
          ))}
        </div>
      </ReactLenis>

      {/* `px-5.5` is the nav corners' own inset, so this shares a left edge
          with the buttons above and below it. */}
      {/* Pinned to the column rather than scrolling with it, so the caption
          stays put while the covers move under it. */}
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
          background="bg-neutral-100"
          opened={opened}
          onOpen={() => setOpenedSection("personal")}
        />
        <Strip
          section="commissioned"
          projects={commissioned}
          fallbackSrc="/personal_placeholder.png"
          opened={opened}
          onOpen={() => setOpenedSection("commissioned")}
        />
      </section>

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
