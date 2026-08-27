"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { useIntro } from "@/lib/intro";
import { setHoveredSection, type Section } from "@/lib/hover";
import { setOpenedSection, useOpenedSection } from "@/lib/section";
import DvmCard from "@/components/DvmCard";
import InfoLayout from "@/components/InfoLayout";
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

  return (
    <div className="relative shrink-0 w-full ">
      <button
        type="button"
        aria-label={`Next image of ${project.title}`}
        // Explicitly a top-aligned column: a button centres its contents
        // vertically by default, which parked the shorter image box in the
        // middle of this taller one no matter what object-position said.
        className="flex flex-col items-start justify-start h-dvh w-full cursor-pointer"
        // The click bubbles: every click inside a column hands it the width,
        // this one included. Stepping is held back until the column already
        // has it, so the first click on a narrow column only widens it
        // rather than also jumping the image out from under you.
        onClick={() => {
          if (active) setFrame((f) => (f + 1) % images.length);
        }}
      >
        {/* `contain` fits the whole image without cropping; `object-top`
            keeps any spare height inside the box underneath it. */}
        <img
          src={src.startsWith("/") ? src : sanityImage(src, { w: 1400 })}
          alt=""
          className="w-full h-[50dvh] object-contain object-top pointer-events-none"
        />
      </button>

      <div className="absolute top-[66.6dvh] w-full px-0 pt-2 pointer-events-none">
        <InfoLayout
          title={project.title}
          model={section === "personal" ? project.client : undefined}
          client={section === "commissioned" ? project.client : undefined}
          agency={project.agency}
          counter={`${frame + 1}/${images.length}`}
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
      className={`group relative h-auto ${width} overflow-hidden transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-blue-700 ${background}`}
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
        className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden"
        options={{ orientation: "vertical", gestureOrientation: "both" }}
      >
        <div className="flex flex-col items-start h-dvh w-full gap-y-2 px-5.5 py-5.5">
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
