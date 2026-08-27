"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { closeItem, useBrowsing, useItem } from "@/lib/crumb";
import { setOpenedSection } from "@/lib/section";
import { slugify } from "@/lib/slug";
import Link from "next/link";

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Only once the wordmark has landed does the rest of the nav arrive and the
  // button start behaving as a breadcrumb.
  const { arrived } = useIntro();

  // Nothing in the nav exists until the card has handed the page over. State
  // only — each element declares its own transition, and twMerge keeps the
  // last `transition-*` in the string, so a shared one here would be dropped.
  const chrome = arrived ? "" : "opacity-0 pointer-events-none";

  // The metadata belongs to the project you were on, so leaving folds it away.
  useEffect(() => setInfoOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else if (infoOpen) setInfoOpen(false);
      else closeTop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, infoOpen]);

  // No site nav over the Sanity Studio.
  if (pathname.startsWith("/studio")) return null;

  const segments = pathname.split("/").filter(Boolean);

  // Keyed to the section rather than the exact path, so the breadcrumb
  // survives opening a project.
  const inCommissioned = segments[0] === "commissioned";

  // The open project's slug, shown verbatim — `kirkeby-x-bjork-and-berries`
  // rather than its title. It is already in the path, so the breadcrumb reads
  // it from there and needs nothing published to it.
  const crumb = segments[1] ? decodeURIComponent(segments[1]) : null;

  const browsing = useBrowsing();

  // Which item of the open project is up, if any — the last link in the trail.
  const item = useItem();

  // With an item open, its overlay owns the screen. Everything but the
  // breadcrumb for the section you are in drops beneath it — the overlay sits
  // at z-40 in ProjectDetail, and its inset card is opaque, so this hides
  // them rather than merely reordering.
  const inPersonal = segments[0] === "personal";
  const under = (mine: boolean) => (item && !mine ? "z-30" : "z-90");

  // The breadcrumb hangs off whichever section label you are inside, so it
  // grows away from its own corner. Everything after the section reads as a
  // file name — see lib/slug.
  const section = segments[0];
  const inSection = inPersonal || inCommissioned;
  const leaf = crumb ?? (browsing ? slugify(browsing) : null);

  // `short` is the stacked-layout spelling — com / per / all — where the full
  // word would crowd the crumbs after it. Hyphens inside a label, since the
  // underscore is what separates one crumb from the next.
  const trail: {
    label: string;
    short?: string;
    href?: string;
    onClick?: () => void;
  }[] = inSection
    ? [
        { label: section, short: section.slice(0, 3), href: `/${section}` },
        { label: "all-projects", short: "all", href: `/${section}` },
        // Stepping back to the project is what closes an open item.
        ...(leaf
          ? [{ label: leaf, onClick: item ? closeItem : undefined }]
          : []),
        ...(item ? [{ label: `${item.index + 1}_${item.count}` }] : []),
      ]
    : [];

  // Only the first crumb carries a short form; the rest read the same at
  // either width.
  const crumbText = (c: (typeof trail)[number]) =>
    c.short ? (
      <>
        <span className="lg:hidden">{c.short}</span>
        <span className="hidden lg:inline">{c.label}</span>
      </>
    ) : (
      c.label
    );

  const renderTrail = () =>
    trail.map((c, i) => {
      const last = i === trail.length - 1;
      const link =
        "w-auto px-0 h-full text-blue-700 transition-colors duration-300 ease-out";
      // With an item open there is no room along a stacked edge for the whole
      // trail, so only its tail stands there — the project and its counter.
      // The wrapper takes the class so a crumb's separator goes with it.
      const head = item !== null && i < trail.length - 2;
      return (
        <span
          key={c.label}
          className={`flex flex-row gap-0 items-center ${head ? "hidden lg:flex" : ""}`}
        >
          {c.onClick ? (
            <Button variant="link" className={link} onClick={c.onClick}>
              {crumbText(c)}
            </Button>
          ) : (
            <>
              <Button
                variant="link"
                className={link}
                aria-current={last && !c.href ? "page" : undefined}
                asChild
              >
                {c.href ? (
                  <Link href={c.href}>{crumbText(c)}</Link>
                ) : (
                  <span>{crumbText(c)}</span>
                )}
              </Button>
              <span
                aria-hidden
                className="font-selecta text-base text-blue-700"
              >
                _
              </span>
            </>
          )}
        </span>
      );
    });

  // One shape for all four corners, identical at both breakpoints.
  const corner = (place: string, lift: boolean) =>
    `fixed ${place} ${under(lift)} flex flex-row items-center gap-0 px-5.5 pt-3 pb-3 transition-opacity duration-700 ease-out ${chrome}`;

  const cornerLink =
    "px-0 w-auto h-full bg-transparent hover:bg-transparent hover:text-neutral-400 active:text-blue-700 active:bg-transparent";

  return (
    <>
      {/* The two sections hold the top corners, About and Index the bottom
          ones. The section pair are controls rather than links: each hands
          the width to its own column on home — see lib/section. Each section label carries the breadcrumb when you are inside
          it, so the trail grows inward from its own corner. `data-nav` pairs
          the top two with the home panels through globals.css. */}
      <span className={corner("top-1 left-0 justify-start", inPersonal)}>
        <Button
          data-nav="personal"
          variant="link"
          size="sm"
          className={`justify-start ${cornerLink}`}
          onClick={() => setOpenedSection("personal")}
        >
          Personal
        </Button>
        {inPersonal && renderTrail()}
      </span>

      <span className={corner("top-1 right-0 justify-end", inCommissioned)}>
        <Button
          data-nav="commissioned"
          variant="link"
          size="sm"
          className={`justify-end ${cornerLink}`}
          onClick={() => setOpenedSection("commissioned")}
        >
          Commissioned
        </Button>
        {inCommissioned && renderTrail()}
      </span>

      <span
        className={corner("bottom-1 lg:bottom-2 left-0 justify-start", false)}
      >
        <Button
          variant="link"
          size="sm"
          className={`justify-start ${cornerLink}`}
          asChild
        >
          <Link href="/about">About</Link>
        </Button>
      </span>

      <span
        className={corner("bottom-1 lg:bottom-2 right-0 justify-end", false)}
      >
        <Button
          variant="link"
          size="sm"
          className={`justify-end  ${cornerLink}`}
          asChild
        >
          <Link href="/index">Index</Link>
        </Button>
      </span>
    </>
  );
}
