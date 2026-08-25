"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { useIntro } from "@/lib/intro";
import { setHoveredSection } from "@/lib/hover";
import DvmCard from "@/components/DvmCard";
import { Button } from "@/components/ui/button";

export default function HomeClient({
  personal,
  commissioned,
}: {
  personal: Project | null;
  commissioned: Project | null;
}) {
  const { staggered, arrived, rows } = useIntro();
  // Covers rest hidden and come up only under their own panel. The intro
  // slot gates the hover rather than the opacity: before a panel has landed
  // there is nothing to reveal yet.
  const cover = (slot: number) =>
    `w-full h-full object-cover pointer-events-none opacity-0 transition-opacity duration-1000 ease-out ${
      staggered > slot ? "group-hover:opacity-100" : ""
    }`;

  // The panels fade up as a unit once the card has finished, over the
  // neutral ground the section holds from the first frame. Their images and
  // labels then take their stagger slots on top of that.
  const panel = `transition-opacity duration-700 ease-out ${
    arrived ? "" : "opacity-0 pointer-events-none"
  }`;

  // The card's own rows, one beat apart, coming in as the name fades out.
  const row = (n: number) =>
    `transition-opacity duration-500 ease-out ${rows > n ? "" : "opacity-0"}`;

  useEffect(() => () => setHoveredSection(null), []);

  const personalSrc = personal?.coverImageUrl
    ? sanityImage(personal.coverImageUrl, { w: 1400 })
    : "/personal_placeholder.png";

  return (
    <>
      <section className="font-selecta relative flex flex-col lg:flex-row w-screen h-full overflow-hidden p-0 bg-background">
        {/* LEFT (PERSONAL) */}
        {/* The upper blur bar, behind the two section labels. */}

        <Link
          href="/personal"
          data-panel="personal"
          className={`group relative flex flex-1 items-start h-1/2 w-full lg:w-1/2 lg:h-dvh hover:text-blue-700 cursor-pointer ${panel}`}
          onMouseEnter={() => setHoveredSection("personal")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Each cover is a square sized by height, not a fill of its
              panel. It is anchored to the edge it shares with its neighbour
              and pushed past it, so the two cross: sideways once the panels
              sit side by side, vertically while they are stacked. The offset
              vertical centres keep the pair from reading as a split screen.
              Personal is the lower layer — z-10 to Commissioned's z-20. */}
          <div className="absolute z-20 aspect-video lg:aspect-square h-[50dvh] lg:h-dvh w-full lg:w-1/2   transition-transform duration-700 ease-out group-hover:scale-[1.015] ">
            <img src={personalSrc} alt="" data-cover className={cover(0)} />
          </div>
          {/* Tint on top of the cover rather than behind it — an opaque
              image hides a background set on its own box. Paints after the
              image and below the label, which sits at z-10. */}
        </Link>

        {/* RIGHT (COMMISSIONED) */}
        <Link
          href="/commissioned"
          data-panel="commissioned"
          className={`group relative flex flex-1 items-end w-full lg:w-1/2 justify-start lg:items-start lg:justify-end h-1/2 lg:h-dvh cursor-pointer  hover:text-blue-700 `}
          onMouseEnter={() => setHoveredSection("commissioned")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {commissioned?.coverImageUrl && (
            <div className="absolute z-20 aspect-video lg:aspect-square h-[50dvh] lg:h-dvh w-full lg:w-1/2   transition-transform duration-700 ease-out group-hover:scale-[1.015]">
              <img
                src={sanityImage(commissioned.coverImageUrl, { w: 1400 })}
                alt=""
                data-cover
                className={cover(1)}
              />
            </div>
          )}
        </Link>
      </section>

      <span
        className={` fixed bottom-0 left-0 w-full h-8  flex flex-row items-center transition-opacity duration-700 ease-out `}
      >
        <Button
          variant="link"
          className="justify-start items-center transition-colors duration-300  ease-out hover:text-blue-700 w-1/2 h-full py-1 px-2.5 bg-transparent"
          asChild
        >
          <Link href="/about">About</Link>
        </Button>
        <Button
          variant="link"
          className="justify-end items-center transition-colors duration-300 ease-out w-1/2 hover:text-blue-700 h-full py-1 px-2.5 bg-transparent"
          asChild
        >
          <Link href="/index">Index</Link>
        </Button>
      </span>
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
