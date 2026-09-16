"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { closeItem, useBrowsing, useItem } from "@/lib/crumb";
import { setOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
import { closeIndex, openIndex, useIndexOpen } from "@/lib/indexOverlay";
import { slugify } from "@/lib/slug";
import Link from "next/link";

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Only once the wordmark has landed does the rest of the nav arrive and the
  // button start behaving as a breadcrumb.
  const { arrived } = useIntro();

  // The home overlays live in the hash — `#about` / `#index` — so the nav reads
  // it back to light the corner that raised the sheet.
  const hash = useHash();

  // On a browser page the Index corner raises a floating overlay over the
  // carousel instead of navigating to /archive — see lib/indexOverlay.
  const indexOpen = useIndexOpen();
  const onBrowser = pathname === "/commissioned" || pathname === "/personal";

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

  // On home the four corners drive state through the URL hash rather than
  // navigating: `#personal` / `#commissioned` hand a column the width, and
  // `#about` / `#index` raise that page in a sheet over both — see HomeClient.
  // Everywhere else they are plain links to the full pages.
  const onHome = pathname === "/";

  // About and Index read as chosen both on their own pages and while their
  // home sheet is raised — so the corner that opened one stays lit blue.
  const aboutActive = pathname === "/about" || (onHome && hash === "about");
  const indexActive =
    pathname === "/archive" ||
    (onHome && hash === "index") ||
    (onBrowser && indexOpen);

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

  const inPersonal = segments[0] === "personal";

  // The breadcrumb hangs off whichever section label you are inside, so it
  // grows away from its own corner. Everything after the section reads as a
  // file name — see lib/slug.
  const section = segments[0];
  const inSection = inPersonal || inCommissioned;
  const leaf = crumb ?? (browsing ? slugify(browsing) : null);

  const corner = (place: string) =>
    `fixed ${place} z-[80] flex flex-row items-center gap-0  transition-opacity duration-700 ease-out ${chrome}`;

  const cornerLink =
    "px-5.5 py-4 w-auto h-full bg-transparent h-14 hover:bg-transparent hover:text-neutral-400 active:text-blue-700 active:bg-transparent ";

  return (
    <>
      {/* The two sections hold the top corners, About and Index the bottom
          ones. The section pair are controls rather than links: each hands
          the width to its own column on home — see lib/section. Each section label carries the breadcrumb when you are inside
          it, so the trail grows inward from its own corner. `data-nav` pairs
          the top two with the home panels through globals.css. */}
      <span className={corner("top-0 left-0 justify-start")}>
        <Button
          data-nav="personal"
          variant="link"
          size="sm"
          className={`justify-start ${cornerLink}`}
          onClick={() => {
            setOpenedSection("personal");
            if (onHome) setHash("personal");
          }}
        >
          Personal
        </Button>
        {inPersonal && renderTrail()}
      </span>

      <span className={corner("top-0 right-0 justify-end")}>
        <Button
          data-nav="commissioned"
          variant="link"
          size="sm"
          className={`justify-end ${cornerLink}`}
          onClick={() => {
            setOpenedSection("commissioned");
            if (onHome) setHash("commissioned");
          }}
        >
          Commissioned
        </Button>
        {inCommissioned && renderTrail()}
      </span>

      <span className={corner("bottom-0 lg:bottom-0 left-0 justify-start")}>
        {onHome ? (
          <Button
            variant="link"
            size="sm"
            className={`justify-start ${cornerLink} ${aboutActive ? "text-blue-700" : ""}`}
            onClick={() => setHash(hash === "about" ? "" : "about")}
          >
            About
          </Button>
        ) : (
          <Button
            variant="link"
            size="sm"
            className={`justify-start ${cornerLink} ${aboutActive ? "text-blue-700" : ""}`}
            asChild
          >
            <Link href="/about">About</Link>
          </Button>
        )}
      </span>

      <span className={corner("bottom-0 lg:bottom-0 right-0 justify-end")}>
        {onHome ? (
          <Button
            variant="link"
            size="sm"
            className={`justify-end  ${cornerLink} ${indexActive ? "text-blue-700" : ""}`}
            onClick={() => setHash(hash === "index" ? "" : "index")}
          >
            Index
          </Button>
        ) : onBrowser ? (
          <Button
            variant="link"
            size="sm"
            className={`justify-end  ${cornerLink} ${indexActive ? "text-blue-700" : ""}`}
            onClick={() => (indexOpen ? closeIndex() : openIndex())}
          >
            Index
          </Button>
        ) : (
          <Button
            variant="link"
            size="sm"
            className={`justify-end  ${cornerLink} ${indexActive ? "text-blue-700" : ""}`}
            asChild
          >
            <Link href="/archive">Index</Link>
          </Button>
        )}
      </span>
    </>
  );
}
