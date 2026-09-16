"use client";

import { useState } from "react";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const INSTAGRAM_HANDLE = "danielvonmalmborg";
const FALLBACK_LINKS = [
  {
    title: "multi2.co",
    url: "https://multi2.co",
    description: "creative agency, built to multiply",
  },
];

const bioComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="indent-0 mb-0">{children}</p>,
  },
};

type Section = "bio" | "links";

export default function AboutSection({ about }: { about?: About | null }) {
  const phone = about?.phone ?? FALLBACK_PHONE;
  const email = about?.email ?? FALLBACK_EMAIL;
  const links = about?.links?.length ? about.links : FALLBACK_LINKS;
  const bioImageUrl = about?.bioImageUrl;

  // Which panel is showing — a click-driven toggle like IndexSection's
  // Personal/Commissioned, not a passive scrollspy: only one of the two
  // ever renders at a time.
  const [active, setActive] = useState<Section>("bio");
  // Below lg everything just reads blue-700 — the toggle between blue and
  // neutral only applies once there's room for both labels to sit side by
  // side and mean something.
  const color = (section: Section) =>
    `text-blue-700 lg:${active === section ? "text-blue-700" : "text-neutral-300"}`;

  return (
    <div
      data-lenis-prevent
      className="relative flex flex-col lg:grid pt-30 lg:pt-0 overflow-y-auto  grid-rows-[auto_auto_auto] lg:grid-cols-4 items-start justify-start w-full h-full   font-selecta font-normal  text-[0.8rem]  tracking-wide leading-[1.2]   gap-x-5.5 gap-y-16 lg:gap-y-0  lg:tracking-normal  text-blue-700 lg:text-neutral-300      "
    >
      <Button
        variant="link"
        size="sm"
        className={`hidden lg:flex col-start-2 w-min h-14  items-center px-0   font-normal ${color("links")} `}
        onClick={() => setActive("links")}
      >
        CV & Links
      </Button>
      <Button
        variant="link"
        size="sm"
        className={`hidden lg:flex col-start-3 w-min h-14  items-center px-0   font-normal ${color("bio")} `}
        onClick={() => setActive("bio")}
      >
        Daniel von Malmborg
      </Button>
      {/* Mobile: the same toggle as a Select, matching IndexSection's
          category/visibility one. */}
      <Select value={active} onValueChange={(v) => setActive(v as Section)}>
        <SelectTrigger className="lg:hidden h-14 gap-1 font-normal px-5.5 text-[0.8rem] w-full border-none rounded-none bg-transparent shadow-none text-blue-700 hover:text-blue-700 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-1010 font-selecta text-[0.8rem] text-neutral-300 ring-transparent bg-background rounded-none">
          <SelectItem value="bio">Daniel von Malmborg</SelectItem>
          <SelectItem value="links">CV & Links</SelectItem>
        </SelectContent>
      </Select>

      {active === "bio" && (
        <>
          <div className="row-start-3 flex flex-col col-span-1 lg:col-span-1 lg:col-start-3 lg:row-start-2 w-full h-full mb-0 lg:mb-0 lg:text-[0.8] font-normal px-5.5  lg:px-0 leading-tight tracking-normal gap-y-2 max-w-sm lg:max-w-full text-blue-700">
            {about?.bio?.length ? (
              <PortableText value={about.bio} components={bioComponents} />
            ) : (
              FALLBACK_BIO.map((paragraph, i) => (
                <p key={i} className="indent-0 mb-0">
                  {paragraph}
                </p>
              ))
            )}
          </div>
          <span className="col-start-1 lg:col-start-2  row-start-2 flex lg:flex-col flex-wrap gap-x-4  font-normal justify-start">
            <Button
              variant="link"
              size="sm"
              className="text-blue-700 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto  justify-start"
              asChild
            >
              <Link href={`tel:${phone}`} className=" ">
                Phone
              </Link>
            </Button>
            <Button
              variant="link"
              size="sm"
              className="text-blue-700 hover:text-blue-700 cursor-pointer w-min  text-left lg:px-0 lg:h-auto  justify-start"
              asChild
            >
              <Link href={`mailto:${email}`}>Email</Link>
            </Button>
            <Button
              variant="link"
              size="sm"
              className="text-blue-700 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto   justify-start"
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
          {bioImageUrl && (
            <div className="row-start-2 lg:col-start-2 lg:col-span-2 lg:row-start-3 w-full h-full flex justify-start items-start px-5.5 lg:px-0 lg:pb-0 pb-14">
              <img
                src={sanityImage(bioImageUrl, { w: 800 })}
                alt=""
                className="w-full lg:w-full lg:aspect-video object-cover"
              />
            </div>
          )}
        </>
      )}

      {active === "links" && (
        // CV goes here too once there is one — this panel isn't only the
        // link list, just all it renders for now.
        <span className="col-start-1 lg:col-start-2 lg:col-span-2 row-start-2 flex flex-wrap  lg:grid grid-cols-2 items-baseline gap-x-5.5 gap-y-1  font-normal justify-start mb-16 lg:mb-16 ">
          {links.map((link) => (
            <div key={link.url} className="group contents row-span-1">
              <Button
                variant="link"
                size="sm"
                className="text-blue-700 group-hover:text-blue-700 cursor-pointer lg:w-min text-left hover:text-blue-700 lg:px-0 lg:h-min justify-start"
                asChild
              >
                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.title}
                </Link>
              </Button>
              <p className=" hidden lg:block mb-0 text-blue-700 text-[0.8rem] hover:text-blue-700 group-hover:text-blue-700">
                {link.description}
              </p>
            </div>
          ))}
        </span>
      )}
    </div>
  );
}
