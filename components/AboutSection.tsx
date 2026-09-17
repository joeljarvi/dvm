"use client";

import Link from "next/link";
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
const INSTAGRAM_HANDLE = "danielvonmalmborg";
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
    normal: ({ children }) => <p className="indent-0 mb-0">{children}</p>,
  },
};

export default function AboutSection({ about }: { about?: About | null }) {
  const phone = about?.phone ?? FALLBACK_PHONE;
  const email = about?.email ?? FALLBACK_EMAIL;
  const links = about?.links?.length ? about.links : FALLBACK_LINKS;
  const bioImageUrl = about?.bioImageUrl;

  return (
    <div
      data-lenis-prevent
      className="relative flex flex-col lg:grid pt-30 lg:pt-0 overflow-y-auto  grid-rows-[auto_auto_auto] lg:grid-cols-4 items-start justify-start w-full h-full   font-selecta font-normal  text-[0.8rem]  tracking-wide leading-[1.2]   gap-x-5.5 gap-y-16 lg:gap-y-0  lg:tracking-normal  text-blue-700 lg:text-neutral-300      "
    >
      {/* Both panels are always up now — no toggle left to switch between
          them — so these just label the columns beneath, the same static
          heading treatment IndexSection's Personal/Commissioned got once
          its own toggle went away. */}
      <h3 className="hidden lg:flex col-start-2 w-min h-14 items-center px-0 font-normal text-blue-700">
        Contact
      </h3>
      <h3 className="hidden lg:flex col-start-3 w-min h-14 items-center px-0 font-normal text-blue-700">
        Daniel von Malmborg
      </h3>

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
        {/* multi2, krejzy, … — same list the standalone links panel used to
            hold, now just more rows in this same column. */}
        {links.map((link) => (
          <Button
            key={link.url}
            variant="link"
            size="sm"
            className="text-blue-700 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto   justify-start"
            asChild
          >
            <Link href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title}
            </Link>
          </Button>
        ))}
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
    </div>
  );
}
