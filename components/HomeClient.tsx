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
  // Covers stay up once their intro slot has come round; the slot is the only
  // thing that ever hides them.
  const cover = (slot: number) =>
    `w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ease-out ${
      staggered > slot ? "" : "opacity-0"
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

        <Link
          href="/personal"
          data-panel="personal"
          className={`group relative flex flex-1 items-start h-[50dvh] w-full lg:w-1/2 lg:h-dvh hover:text-blue-700 cursor-pointer ${panel}`}
          onMouseEnter={() => setHoveredSection("personal")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="absolute z-20  h-[50dvh] lg:h-dvh w-full lg:w-full   transition-transform duration-700 ease-out group-hover:scale-[1.015] ">
            <img src={personalSrc} alt="" className={cover(0)} />
          </div>
        </Link>

        {/* RIGHT (COMMISSIONED) */}
        <Link
          href="/commissioned"
          data-panel="commissioned"
          className={`group relative flex flex-1 items-end w-full lg:w-1/2 justify-start lg:items-start lg:justify-end h-[50dvh] lg:h-dvh cursor-pointer  hover:text-blue-700 `}
          onMouseEnter={() => setHoveredSection("commissioned")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {commissioned?.coverImageUrl && (
            <div className="absolute z-20 aspect-video lg:aspect-square h-[50dvh] lg:h-dvh w-full lg:w-full   transition-transform duration-700 ease-out group-hover:scale-[1.015]">
              <img
                src={sanityImage(commissioned.coverImageUrl, { w: 1400 })}
                alt=""
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
