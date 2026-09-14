"use client";

import { useEffect, useRef, useState } from "react";
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

  // Whichever of these two sits centered in the viewport reads blue; the
  // other falls back to neutral. A zero-height line at the viewport's
  // vertical center (via rootMargin) is what "centered" means here.
  const [active, setActive] = useState<Section>("bio");
  const bioRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLSpanElement>(null);
  const color = (section: Section) =>
    active === section ? "text-blue-700" : "text-neutral-300";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target === linksRef.current ? "links" : "bio");
          }
        }
      },
      { threshold: 0, rootMargin: "-50% 0px -50% 0px" },
    );
    if (bioRef.current) observer.observe(bioRef.current);
    if (linksRef.current) observer.observe(linksRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-lenis-prevent
      className="relative flex flex-col lg:grid pt-18 lg:pt-0 overflow-y-auto  grid-rows-[auto_auto_auto] lg:grid-cols-4 items-start justify-start w-full h-full   font-selecta font-normal  text-sm  tracking-wide leading-[1.2]   gap-x-5.5 gap-y-4   lg:tracking-normal px-5.5 text-neutral-300     "
    >
      <Button
        variant="link"
        size="sm"
        className={`hidden lg:flex col-start-3 w-min h-14  items-center px-0   font-normal ${color("bio")} `}
      >
        Daniel von Malmborg
      </Button>
      <h1 className={`lg:hidden mb-4 text-sm ${color("bio")}`}>
        Daniel von Malmborg
      </h1>

      <div
        ref={bioRef}
        className={`row-start-3 flex flex-col col-span-1 lg:col-span-1 lg:col-start-3 lg:row-start-2 w-full h-full mb-0 lg:mb-0 text-sm font-normal leading-tight tracking-normal gap-y-2 max-w-sm lg:max-w-full ${color("bio")}`}
      >
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
      <span className="col-start-1 lg:col-start-2  row-start-2 flex flex-col gap-x-4 text-sm font-normal justify-start">
        <Button
          variant="link"
          size="sm"
          className="text-neutral-300 hover:text-blue-700 cursor-pointer w-min text-left text-sm lg:px-0 lg:h-auto  justify-start"
          asChild
        >
          <Link href={`tel:${phone}`} className=" ">
            Phone
          </Link>
        </Button>
        <Button
          variant="link"
          size="sm"
          className="text-neutral-300 hover:text-blue-700 cursor-pointer w-min text-sm text-left lg:px-0 lg:h-auto  justify-start"
          asChild
        >
          <Link href={`mailto:${email}`}>Email</Link>
        </Button>
        <Button
          variant="link"
          size="sm"
          className="text-neutral-300 hover:text-blue-700 cursor-pointer w-min text-left lg:px-0 lg:h-auto  text-sm justify-start"
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
        <div className="row-start-2 lg:col-start-2 lg:col-span-2 lg:row-start-3 w-full h-full flex justify-start mt-4 items-start">
          <img
            src={sanityImage(bioImageUrl, { w: 800 })}
            alt=""
            className="w-full lg:w-full aspect-video object-cover"
          />
        </div>
      )}
      <span
        ref={linksRef}
        className="col-start-1 lg:col-start-2 lg:col-span-2 row-start-4  grid grid-cols-2 items-baseline gap-x-5.5 gap-y-1 text-sm font-normal justify-start mb-16 lg:mb-8 mt-4"
      >
        {links.map((link) => (
          <div key={link.url} className="group contents">
            <Button
              variant="link"
              size="sm"
              className="text-neutral-300 group-hover:text-blue-700cursor-pointer lg:w-min text-left hover:text-blue-700 lg:px-0 lg:h-min justify-start"
              asChild
            >
              <Link href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title}
              </Link>
            </Button>
            <p className=" mb-0 text-neutral-300 hover:text-blue-700 group-hover:text-blue-700">
              {link.description}
            </p>
          </div>
        ))}
      </span>
    </div>
  );
}
