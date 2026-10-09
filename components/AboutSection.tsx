"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { REVEAL_CLASS } from "@/lib/motion";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Button } from "@/components/ui/button";
import type { About } from "@/lib/types";
import BlurredPreview from "@/components/BlurredPreview";
import ConnectLinks from "@/components/ConnectLinks";

// Shown when Sanity has no About document yet — same degradation pattern
// as the rest of the site (see FALLBACK in IndexSection).
const FALLBACK_BIO = [
  "I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.",
  "Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.",
  "Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.",
];
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

// The bio image (shown behind the bio while it's hovered, on desktop) — off
// for now. Back on: true.
const SHOW_BIO_IMAGE = false;

// No reveal of its own: the text comes in with the overlay, sliding up and
// fading in as one block (InfoOverlay's slideReveal), the way Index does.

const bioComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="indent-0 mb-0">{children}</p>,
  },
};

export default function AboutSection({
  about,
  open = true,
}: {
  about?: About | null;
  /** Whether its overlay is up (it stays mounted when closed). */
  open?: boolean;
}) {
  const links = about?.links?.length ? about.links : FALLBACK_LINKS;
  const bioImageUrl = about?.bioImageUrl;
  // Column 3 holds one of the two at a time; the switch sits at the bottom of
  // column 2, the way IndexSection's Selected / Show All does.
  const [view, setView] = useState<"bio" | "links">("bio");
  const showView = (v: "bio" | "links") => {
    setView(v);
    setBioHovered(false);
  };
  // The bio image sits behind everything, dimmed and blurred — the way
  // IndexSection previews a hovered project. Desktop only, and only while
  // the bio or its heading is hovered; on mobile, never.
  const previewImage = bioImageUrl ?? null;
  const [bioHovered, setBioHovered] = useState(false);
  const hoverBio =
    view === "bio"
      ? {
          onMouseEnter: () => setBioHovered(true),
          onMouseLeave: () => setBioHovered(false),
        }
      : {};
  const imageShown = open && view === "bio" && bioHovered;
  // The image sits behind everything and takes no pointer events, so
  // whether it's hovered is worked out from where the pointer is.
  const previewRef = useRef<HTMLDivElement>(null);
  const [imageHovered, setImageHovered] = useState(false);
  const trackImageHover = (e: React.MouseEvent) => {
    const rect = previewRef.current
      ?.querySelector("img")
      ?.getBoundingClientRect();
    setImageHovered(
      !!rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom,
    );
  };

  return (
    <div
      data-lenis-prevent
      onMouseMove={trackImageHover}
      onMouseLeave={() => setImageHovered(false)}
      // Opaque, over the home page; isolate keeps the bio image (-z-10)
      // in front of this background rather than behind it.
      className="relative isolate bg-background flex flex-col lg:grid pt-28 lg:pt-0 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden lg:overflow-hidden lg:grid-rows-[auto_auto_1fr_auto] lg:grid-cols-4 items-start justify-start w-full h-dvh   font-diatype font-normal  text-[0.8rem]  tracking-wide leading-[1.2]   gap-x-5.5 lg:gap-x-0 gap-y-16 lg:gap-y-0  lg:tracking-normal  text-blue-700 lg:text-neutral-300      "
    >
      {SHOW_BIO_IMAGE && previewImage && (
        <div
          ref={previewRef}
          // Fades in slowly and evenly while the bio is hovered (the reveal's
          // curve does most of its change at once, and reads as no fade at
          // all); out at the quicker reveal.
          className={`hidden lg:block absolute inset-x-0 top-0 -z-10 h-dvh px-5.5 bg-background pointer-events-none transition-opacity ${
            imageShown
              ? "duration-(--motion-entrance) ease-in-out opacity-100"
              : `${REVEAL_CLASS} opacity-0`
          }`}
        >
          <BlurredPreview
            media={{ url: previewImage, type: "image" }}
            className="max-lg:py-28"
            sharp={imageHovered}
          />
        </div>
      )}

      <h3 className="hidden lg:flex col-start-2 lg:row-start-1 w-min h-14 items-center px-5.5 font-normal text-blue-700 whitespace-nowrap">
        Connect
      </h3>

      <h3 className="lg:hidden order-first flex h-14 items-center px-5.5 font-normal text-[0.8rem] text-blue-700 whitespace-nowrap">
        Daniel von Malmborg
      </h3>

      <div key={view} className="contents">
        <h3
          {...hoverBio}
          className="hidden lg:flex col-start-3 lg:row-start-1 h-14 items-center px-5.5 font-normal text-blue-700 whitespace-nowrap"
        >
          {view === "bio" ? "Daniel von Malmborg" : "Links"}
        </h3>

        <div
          {...hoverBio}
          className="row-start-3 flex flex-col col-span-1 lg:col-span-1 lg:col-start-3 lg:row-start-2 w-full h-full  lg:text-[0.8rem] font-normal pl-5.5 pr-0 lg:px-5.5 leading-tight tracking-wide gap-y-4 max-w-3/4 lg:max-w-full text-blue-700  mb-0 lg:mb-12"
        >
          {view === "bio" ? (
            about?.shortBio?.length ? (
              <PortableText value={about.shortBio} components={bioComponents} />
            ) : (
              FALLBACK_BIO.map((paragraph, i) => (
                <p key={i} className="indent-0 mb-0">
                  {paragraph}
                </p>
              ))
            )
          ) : (
            links.map((link) => (
              <span key={link.url} className="flex flex-col items-start ">
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-700 hover:text-blue-700 dark:text-blue-700 dark:hover:text-blue-700 cursor-pointer w-min text-left px-0 h-auto justify-start"
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
              </span>
            ))
          )}
        </div>

        <span className="order-first lg:order-0 col-start-1 lg:col-start-2 lg:row-start-2 lg:flex lg:flex-col grid grid-cols-4 gap-x-0 lg:px-5.5 font-normal justify-start w-full lg:w-auto">
          <ConnectLinks connect={about?.connect} className="lg:px-0" />
        </span>
      </div>
      {/* Mobile: on the heading's line (the content's first row, below the
          pt-30), right-aligned. Desktop: pinned to the bottom of column 2. */}
      <div className="fixed top-[62.5%] right-0 h-14  flex   items-center justify-between px-0 pointer-events-none lg:sticky lg:top-auto lg:right-auto lg:bottom-0 lg:col-start-2 lg:row-start-4 lg:w-full lg:h-32 lg:items-end lg:justify-start lg:px-5.5">
        <div className="flex flex-col  items-end lg:flex-row lg:items-center  w-full lg:justify-start gap-x-4 text-right lg:text-left pointer-events-auto">
          {(["bio", "links"] as const).map((v) => (
            <Button
              key={v}
              variant="link"
              size="sm"
              aria-pressed={view === v}
              className={` capitalize text-right lg:px-0 lg:text-center justify-end lg:justify-center hover:text-blue-700 dark:hover:text-blue-700 ${view === v ? "text-blue-700 dark:text-blue-700" : "text-neutral-400 dark:text-neutral-500"}`}
              onClick={() => showView(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
