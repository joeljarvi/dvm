"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { setOpenedSection, useOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
import { closeIndex, openIndex, useIndexOpen } from "@/lib/indexOverlay";
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

  // Before either home column has been chosen, About/Index have nothing to
  // sit below yet — see the corner gating further down.
  const opened = useOpenedSection();

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

  // Home starts with neither column chosen — both split the width evenly
  // and About/Index have no page beneath them yet, so they stay hidden
  // until a corner (or a column tap) picks one.
  const chosen = !onHome || opened !== null;

  // On home, before either column is picked, the two corners that make that
  // pick don't need to sit through the intro card's own timeline — they
  // fade in on mount, on their own. Once a column is chosen (or off home
  // entirely), they settle into the same arrival as the rest of the nav.
  const directChrome = "animate-in fade-in duration-700 ease-out";
  const topChrome = onHome && !chosen ? directChrome : chrome;

  const corner = (place: string, visible = true, arrival = chrome) =>
    `fixed ${place} z-[2000] flex flex-row items-center gap-0  transition-opacity duration-700 ease-out ${arrival} ${
      visible ? "" : "opacity-0 pointer-events-none"
    }`;

  const cornerLink =
    "px-5.5 py-4 w-auto h-full bg-transparent h-14 hover:bg-transparent hover:text-neutral-400 active:text-blue-700 active:bg-transparent ";

  return (
    <>
      {/* The two sections hold the top corners, About and Index the bottom
          ones. The section pair are controls rather than links: each hands
          the width to its own column on home — see lib/section. `data-nav`
          pairs the top two with the home panels through globals.css. */}
      <span className={corner("top-0 left-0 justify-start", true, topChrome)}>
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
      </span>

      <span className={corner("top-0 right-0 justify-end", true, topChrome)}>
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
      </span>
      {}
      <span className={corner("bottom-0 lg:bottom-0 left-0 justify-start", chosen)}>
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

      <span className={corner("bottom-0 lg:bottom-0 right-0 justify-end", chosen)}>
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
