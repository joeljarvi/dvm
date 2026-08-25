"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { useIntro } from "@/lib/intro";
import { setHoveredSection } from "@/lib/hover";
import DvmCard from "@/components/DvmCard";
import { Button } from "@/components/ui/button";
import { chip } from "@/lib/chip";

export default function HomeClient({
  personal,
  commissioned,
}: {
  personal: Project | null;
  commissioned: Project | null;
}) {
  const { staggered, arrived, rows } = useIntro();
  const reveal = (slot: number) =>
    staggered > slot ? "" : "opacity-0 pointer-events-none";

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
      <section className="font-selecta relative flex flex-col lg:flex-row w-screen h-dvh overflow-hidden bg-neutral-100">
        {/* LEFT (PERSONAL) */}
        <Link
          href="/personal"
          data-panel="personal"
          className={`relative flex flex-1 items-start h-1/2 w-full lg:w-1/2 lg:h-dvh overflow-hidden cursor-pointer ${panel}`}
          onMouseEnter={() => setHoveredSection("personal")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <img
            src={personalSrc}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover  pointer-events-none transition-opacity duration-1000 ease-out ${reveal(0)}`}
          />
          {/* A span, not a Link: the panel around it is already an anchor to
              the same route, and an <a> inside an <a> is invalid HTML. */}
          <Button
            data-nav="personal"
            className={`${chip} fixed top-4 left-4 z-10 inline-flex transition-[opacity,color] duration-700 ease-out hover:text-neutral-300 ${
              staggered > 2 ? "" : "opacity-0 pointer-events-none"
            }`}
            asChild
          >
            <span>Personal</span>
          </Button>
        </Link>

        {/* RIGHT (COMMISSIONED) */}
        <Link
          href="/commissioned"
          data-panel="commissioned"
          className={`relative flex flex-1 items-end w-full lg:w-1/2 justify-start lg:items-start lg:justify-end h-1/2 lg:h-dvh overflow-hidden cursor-pointer bg-neutral-200 ${panel}`}
          onMouseEnter={() => setHoveredSection("commissioned")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {commissioned?.coverImageUrl && (
            <img
              src={sanityImage(commissioned.coverImageUrl, { w: 1400 })}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover  pointer-events-none transition-opacity duration-1000 ease-out ${reveal(1)}`}
            />
          )}

          <Button
            data-nav="commissioned"
            className={`${chip} absolute bottom-4 left-4 top-auto right-auto lg:top-4 lg:right-4 lg:bottom-auto lg:left-auto z-10 inline-flex transition-[opacity,color] duration-700 ease-out hover:text-neutral-300 ${
              staggered > 3 ? "" : "opacity-0 pointer-events-none"
            }`}
            asChild
          >
            <span>Commissioned</span>
          </Button>
        </Link>
      </section>
      {/* Centred over both panels. `inset-0` gives the flex box the whole
          viewport to centre within; the panels stay clickable through it. */}

      <div className="fixed inset-0 z-20 flex items-center justify-center p-4 pointer-events-none w-full">
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
