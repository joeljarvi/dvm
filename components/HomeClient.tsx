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
  const { staggered } = useIntro();
  const reveal = (slot: number) =>
    staggered > slot ? "" : "opacity-0 pointer-events-none";

  useEffect(() => () => setHoveredSection(null), []);

  const personalSrc = personal?.coverImageUrl
    ? sanityImage(personal.coverImageUrl, { w: 1400 })
    : "/personal_placeholder.png";

  return (
    <>
      <section className="font-selecta relative flex  flex-col lg:flex-row w-screen h-dvh overflow-hidden">
        {/* LEFT (PERSONAL) */}
        <Link
          href="/personal"
          data-panel="personal"
          className="relative flex flex-1 items-start h-1/2 w-full lg:w-1/2 lg:h-dvh overflow-hidden cursor-pointer  "
          onMouseEnter={() => setHoveredSection("personal")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <img
            src={personalSrc}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover  pointer-events-none transition-opacity duration-1000 ease-out ${reveal(0)}`}
          />
          <Button
            data-nav="personal"
            className={`${chip} fixed top-4 left-4 z-10 inline-flex transition-[opacity,color] duration-700 ease-out hover:text-neutral-300 ${
              staggered > 2 ? "" : "opacity-0 pointer-events-none"
            }`}
            asChild
          >
            <Link href="/personal">Personal</Link>
          </Button>
        </Link>

        {/* RIGHT (COMMISSIONED) */}
        <Link
          href="/commissioned"
          data-panel="commissioned"
          className="relative flex flex-1 items-end w-full lg:w-1/2 justify-start lg:items-start lg:justify-end h-1/2  lg:h-dvh overflow-hidden cursor-pointer bg-neutral-200 "
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
            <Link href="/commissioned">Commissioned</Link>
          </Button>
        </Link>
      </section>
      {/* Centred over both panels. `inset-0` gives the flex box the whole
          viewport to centre within; the panels stay clickable through it. */}

      <div className="fixed inset-0 z-20 flex items-center justify-center p-4 pointer-events-none w-full">
        <DvmCard color="bg-green-900" variant="text">
          <span className="flex flex-col items-start justify-center   gap-y-0 p-0 text-orange-400 font-selecta text-base font-medium text-left tracking-wider w-full ">
            <h1 className=" ">Daniel von Malmborg</h1>
            <h2 className=" ">Creative Director & Photographer</h2>
          </span>
        </DvmCard>
      </div>
    </>
  );
}
