"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { chip } from "@/lib/chip";
import { closeItem, useBrowsing, useItem } from "@/lib/crumb";
import { slugify } from "@/lib/slug";
import MetadataBar from "@/components/MetadataBar";
import SectionSelect from "@/components/SectionSelect";
import Link from "next/link";
import DvmCard from "@/components/DvmCard";

const ease = [0.4, 0, 0.2, 1] as const;

// The full set, in reading order. Instagram is the only one that leaves the
// site — swap the placeholder for the real handle.
const LINKS = [
  { label: "Home", href: "/" },
  { label: "Commissioned", href: "/commissioned" },
  { label: "Personal", href: "/personal" },
  { label: "About", href: "/about" },
  { label: "Index", href: "/index" },
  { label: "Instagram", href: "https://instagram.com/", external: true },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Only once the wordmark has landed does the rest of the nav arrive and the
  // button start behaving as a breadcrumb.
  const { settled, arrived } = useIntro();

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

  const isHome = pathname === "/";

  // Anywhere with metadata worth reading: both section browsers and the
  // project pages under them — /personal, /commissioned, and their slugs.
  const segments = pathname.split("/").filter(Boolean);
  const showInfo =
    segments.length <= 2 &&
    (segments[0] === "personal" || segments[0] === "commissioned");

  // The breadcrumb tails off the Commissioned label: the browser is
  // `all_projects`, and an open project adds its title after that. Keyed to
  // the section rather than the exact path, so it survives opening a project.
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
        "w-auto h-full text-blue-700 transition-colors duration-300 ease-out";
      // With an item open there is no room along a stacked edge for the whole
      // trail, so only its tail stands there — the project and its counter.
      // The wrapper takes the class so a crumb's separator goes with it.
      const head = item !== null && i < trail.length - 2;
      return (
        <span
          key={c.label}
          className={`flex flex-row items-center ${head ? "hidden lg:flex" : ""}`}
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

  // The menu links navigate on their own; this just dismisses the overlay
  // behind them.
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <span
        className={`fixed bottom-0 lg:bottom-auto lg:top-0 left-0 w-full lg:w-1/2 ${under(false)} flex flex-row items-center ${isHome ? "justify-start" : "justify-center"} lg:justify-start gap-0 px-2.5 h-8 transition-opacity duration-700 ease-out bg-background lg:bg-transparent ${chrome}`}
      >
        {/* The corner names the view you are in and opens as the way out of
            it, so it replaces what was a plain link to Personal. */}
        {isHome ? (
          <Button
            // Paired with the left panel through the data-nav/data-panel
            // bridge in globals.css: hovering either colours both.
            data-nav="personal"
            variant="link"
            className="justify-start w-auto bg-transparent hover:bg-transparent h-full hover:text-blue-700 active:text-blue-700 active:bg-transparent"
            asChild
          >
            <Link href="/personal">Personal</Link>
          </Button>
        ) : (
          <SectionSelect current={pathname} />
        )}
      </span>

      <span
        className={`fixed ${under(inSection)} ${
          // Stacked, the trail takes the top edge and the select drops to the
          // bottom; side by side they share the top, one corner each. The
          // home label keeps the right corner at either width.
          inSection
            ? "top-0 left-0 w-full bg-background lg:bg-transparent justify-center lg:left-auto lg:right-0 lg:w-1/2 lg:justify-end"
            : "top-0 right-0 w-1/2 justify-end"
        } flex flex-row items-center gap-0 px-2.5 h-8 transition-opacity duration-700 ease-out ${chrome}`}
      >
        {/* Inside a section this corner is the breadcrumb, in either section —
            the select on the left already names which one, so the trail needs
            no label of its own. On home it is the Commissioned link instead,
            which is what pairs with the right-hand panel. */}
        {inSection ? (
          <span className="flex flex-row items-center">{renderTrail()}</span>
        ) : (
          isHome && (
            <Button
              data-nav="commissioned"
              variant="link"
              className="justify-end w-auto h-full hover:bg-transparent hover:text-blue-700 active:text-blue-700 active:bg-transparent"
              asChild
            >
              <Link href="/commissioned">Commissioned</Link>
            </Button>
          )
        )}
      </span>
    </>
  );
}
