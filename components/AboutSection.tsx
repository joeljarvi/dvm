"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { fadeItem, staggerContainer } from "@/lib/motion";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Button } from "@/components/ui/button";
import { sanityImage } from "@/lib/image";
import type { About } from "@/lib/types";

// Shown when Sanity has no About document yet — same degradation pattern
// as the rest of the site (see FALLBACK in IndexSection).
const FALLBACK_BIO = [
  "I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.",
  "Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.",
  "Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.",
];
const FALLBACK_PHONE = "+46708247484";
const FALLBACK_EMAIL = "daniel@vonmalmborg.com";
const INSTAGRAM_HANDLE = "https://www.instagram.com/daniel.external/";
const FALLBACK_LINKS = [
  {
    title: "multi2",
    url: "https://www.multi2.co/",
    description: "creative agency, built to multiply",
  },
  {
    title: "krejzy",
    url: "https://www.instagram.com/",
    description: "my band, built to unify",
  },
];

const bioComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <motion.p variants={fadeItem} className="indent-0 mb-0">
        {children}
      </motion.p>
    ),
  },
};

export default function AboutSection({ about }: { about?: About | null }) {
  const phone = about?.phone ?? FALLBACK_PHONE;
  const email = about?.email ?? FALLBACK_EMAIL;
  const links = about?.links?.length ? about.links : FALLBACK_LINKS;
  const bioImageUrl = about?.bioImageUrl;
  // Column 3 holds one of the two at a time; the switch sits at the bottom of
  // column 2, the way IndexSection's Selected / Show All does.
  const [view, setView] = useState<"bio" | "links">("bio");

  return (
    <div
      data-lenis-prevent
      className="relative flex flex-col lg:grid pt-28 lg:pt-0 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden lg:overflow-hidden lg:grid-rows-[auto_auto_1fr_auto] lg:grid-cols-4 items-start justify-start w-full h-dvh   font-diatype font-normal  text-[0.8rem]  tracking-wide leading-[1.2]   gap-x-5.5 gap-y-16 lg:gap-y-0  lg:tracking-normal  text-blue-700 lg:text-neutral-300      "
    >
      <h3 className="hidden lg:flex col-start-2 lg:row-start-1 w-min h-14 items-center px-0 font-normal text-blue-700">
        Connect
      </h3>

      <h3 className="lg:hidden order-first flex h-14 items-center px-5.5 font-normal text-[0.8rem] text-blue-700 whitespace-nowrap">
        Daniel von Malmborg
      </h3>

      <motion.div
        key={view}
        className="contents"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h3
          variants={fadeItem}
          className="hidden lg:flex col-start-3 lg:row-start-1 h-14 items-center px-0 font-normal text-blue-700 whitespace-nowrap"
        >
          {view === "bio" ? "Daniel von Malmborg" : "Links"}
        </motion.h3>

        <div className="row-start-3 flex flex-col col-span-1 lg:col-span-1 lg:col-start-3 lg:row-start-2 w-full h-full  lg:text-[0.8rem] font-normal pl-5.5 pr-0   lg:px-0 leading-tight tracking-wide gap-y-4 max-w-3/4 lg:max-w-full text-blue-700  mb-0 lg:mb-12">
          {view === "bio" ? (
            about?.shortBio?.length ? (
              <PortableText value={about.shortBio} components={bioComponents} />
            ) : (
              FALLBACK_BIO.map((paragraph, i) => (
                <motion.p key={i} variants={fadeItem} className="indent-0 mb-0">
                  {paragraph}
                </motion.p>
              ))
            )
          ) : (
            links.map((link) => (
              <motion.span
                key={link.url}
                variants={fadeItem}
                className="flex flex-col items-start "
              >
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-700 hover:text-blue-700 cursor-pointer w-min text-left px-0 h-auto justify-start"
                  asChild
                >
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.title}
                  </Link>
                </Button>
                {link.description && (
                  <p className="text-blue-700 font-normal font-diatype tracking-wide text-[0.8rem]">
                    {link.description}
                  </p>
                )}
              </motion.span>
            ))
          )}
        </div>

        <span className="order-first lg:order-0 col-start-1 lg:col-start-2 lg:row-start-2 lg:flex lg:flex-col grid grid-cols-4 gap-x-0  font-normal justify-start w-full lg:w-auto">
          <Button
            variant="link"
            size="sm"
            className="text-blue-700 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 h-auto  justify-start"
            asChild
          >
            <Link href={`tel:${phone}`} className=" ">
              Phone
            </Link>
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-blue-700 hover:text-blue-700 cursor-pointer w-min  text-left lg:px-0 h-auto  justify-start"
            asChild
          >
            <Link href={`mailto:${email}`}>Email</Link>
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-blue-700 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 h-auto   justify-start"
            asChild
          >
            <Link
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              Instagram
            </Link>
          </Button>
        </span>
        {view === "bio" && bioImageUrl && (
          <motion.div
            variants={fadeItem}
            className="row-start-3 lg:col-start-2 lg:col-span-2 lg:row-start-3 w-full h-full max-w-3/4 lg:max-w-full flex justify-start items-start pl-5.5 pr-0  mb-16 lg:pl-0 lg:pr-0 lg:pb-0 pb-14"
          >
            <img
              src={sanityImage(bioImageUrl, { w: 800 })}
              alt=""
              className="w-full lg:w-full  object-cover lg:aspect-video"
            />
          </motion.div>
        )}
      </motion.div>
      {/* Mobile: on the heading's line (the content's first row, below the
          pt-30), right-aligned. Desktop: pinned to the bottom of column 2. */}
      <div className="fixed top-[62.5%] right-0 h-14  flex   items-center justify-between px-0 pointer-events-none lg:sticky lg:top-auto lg:right-auto lg:bottom-0 lg:col-start-2 lg:row-start-4 lg:w-full lg:h-32 lg:items-end lg:justify-start lg:px-0 ">
        <div className="flex flex-col  items-end lg:flex-row lg:items-center  w-full lg:justify-start gap-x-4 text-right lg:text-left pointer-events-auto">
          {(["bio", "links"] as const).map((v) => (
            <Button
              key={v}
              variant="link"
              size="sm"
              aria-pressed={view === v}
              className={` capitalize text-right lg:px-0 lg:text-center justify-end lg:justify-center hover:text-blue-700 dark:hover:text-blue-700 ${view === v ? "text-blue-700 dark:text-blue-700" : "text-neutral-400 dark:text-neutral-500"}`}
              onClick={() => setView(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
