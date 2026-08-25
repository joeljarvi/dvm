"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { chip } from "@/lib/chip";
import MetadataBar from "@/components/MetadataBar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import DvmCard from "@/components/DvmCard";

const ease = [0.4, 0, 0.2, 1] as const;

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Only once the wordmark has landed does the rest of the nav arrive and the
  // button start behaving as a breadcrumb.
  const { settled, staggered } = useIntro();

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

  const personalActive = pathname.startsWith("/personal");
  const commissionedActive = pathname.startsWith("/commissioned");
  const aboutActive = pathname === "/about";
  const indexActive = pathname === "/index";

  // On mobile the wordmark doubles as a breadcrumb for wherever you are — null
  // on home, where the name itself is the label. Desktop has room to keep the
  // full name up at all times, so it never swaps.
  const crumb = menuOpen
    ? "Menu"
    : personalActive
      ? "Personal"
      : commissionedActive
        ? "Commissioned"
        : aboutActive
          ? "About"
          : indexActive
            ? "Index"
            : null;

  // One shape everywhere off home: a link back to the root. Escape still pops
  // a layer at a time, but the button itself always walks all the way home
  // rather than unwinding the stack.
  const isHome = pathname === "/";
  const showBack = !isHome;

  // Anywhere with metadata worth reading: both section browsers and the
  // project pages under them — /personal, /commissioned, and their slugs.
  const segments = pathname.split("/").filter(Boolean);
  const showInfo =
    segments.length <= 2 &&
    (segments[0] === "personal" || segments[0] === "commissioned");

  // Each section label stands only inside its own section — home has the two
  // panels themselves, so a label there would only repeat what you are
  // already looking at.
  const showPersonal = segments[0] === "personal";
  const showCommissioned = segments[0] === "commissioned";

  // The menu links navigate on their own; this just dismisses the overlay
  // behind them.
  const closeMenu = () => setMenuOpen(false);

  // Rendered at both breakpoints, so it lives here rather than twice.
  const backButton = (className: string) =>
    showBack && (
      <Button className={className} asChild>
        <Link href="/">Back</Link>
      </Button>
    );

  return (
    <>
      {/* BACK — shows everywhere but home, at every breakpoint: the top-left
          corner while the layout is stacked, centred along the top edge once
          the section labels take the corners, so it never lands on either. */}
      {backButton(
        `${chip} fixed top-4 left-4 lg:left-1/2 lg:-translate-x-1/2 z-90 transition-colors duration-300 ease-out hover:text-neutral-300`,
      )}

      {/* SECTIONS — the label for whichever section you are in. Personal is
          desktop-only: below lg the Back button already owns the top-left
          corner, and these never render on home where Back is absent.
          Commissioned has the opposite corner to itself at every width. */}
      {showPersonal && (
        <Button
          data-nav="personal"
          className={`${chip} fixed top-4 left-4 z-90 hidden lg:inline-flex transition-[opacity,color] duration-700 ease-out hover:text-neutral-300 ${
            staggered > 2 ? "" : "opacity-0 pointer-events-none"
          }`}
          asChild
        >
          <Link href="/personal">Personal</Link>
        </Button>
      )}

      {showCommissioned && (
        <Button
          data-nav="commissioned"
          className={`${chip} fixed top-4 right-4 z-90 transition-[opacity,color] duration-700 ease-out hover:text-neutral-300 ${
            staggered > 3 ? "" : "opacity-0 pointer-events-none"
          }`}
          asChild
        >
          <Link href="/commissioned">Commissioned</Link>
        </Button>
      )}

      {/* BOTTOM BAR — About and Index bracket the Info slot. One row so
          nothing overlaps the full-width bar on desktop. */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 z-90   lg:mb-0 px-4 flex items-center justify-between gap-2 w-full ${settled ? "" : "pointer-events-none"}`}
      >
        <Button
          className={`${chip} hidden lg:inline-flex transition-colors duration-300 ease-out hover:text-neutral-300`}
          asChild
        >
          <Link href="/about">About</Link>
        </Button>

        {/* Info takes the slot the metadata line used to hold, and opens it
            as an overlay instead of keeping it on screen throughout. Out of
            flow, so About and Index keep the ends of the row to themselves:
            bottom-left while stacked, centred on the bar from lg up. */}
        {showInfo ? (
          <Button
            aria-expanded={infoOpen}
            className={`${chip} absolute bottom-4 left-4 lg:left-1/2 lg:-translate-x-1/2 transition-colors duration-300 ease-out hover:text-neutral-300`}
            onClick={() => setInfoOpen((o) => !o)}
          >
            Info
          </Button>
        ) : (
          <span />
        )}

        <Button
          className={`${chip} hidden lg:inline-flex transition-colors duration-300 ease-ou right-4 hover:text-neutral-300`}
          asChild
        >
          <Link href="/index">Index</Link>
        </Button>
      </div>

      <AnimatePresence>
        {infoOpen && (
          <motion.div
            className="fixed inset-0 z-80 bottom-15 left-4 right-4 top-auto  flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            onClick={() => setInfoOpen(false)}
          >
            <DvmCard variant="blank" color="bg-neutral-400">
              <MetadataBar textColor="text-foreground" />
            </DvmCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE — menu button + overlay */}
      <div className="lg:hidden">
        {/* Bottom-right, clear of Commissioned in the top corner. At this
            width the bottom bar carries only the metadata, so nothing collides. */}
        <span
          className={`fixed bottom-4 right-4 z-90 flex items-center gap-1 ${settled ? "" : "pointer-events-none"}`}
        >
          <Button
            className={`${chip} inline-flex transition-colors duration-300 ease-out hover:text-neutral-300`}
            onClick={() => setMenuOpen((o) => !o)}
          >
            Menu
          </Button>
        </span>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-orange-400 flex flex-col items-center justify-center gap-1   "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease }}
            >
              <Button size="lg" variant="ghost" className={`  `} asChild>
                <Link href="/" onClick={closeMenu}>
                  Home
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className={``} asChild>
                <Link href="/personal" onClick={closeMenu}>
                  Personal
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className={``} asChild>
                <Link href="/commissioned" onClick={closeMenu}>
                  Commissioned
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className={``} asChild>
                <Link href="/about" onClick={closeMenu}>
                  About
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className={``} asChild>
                <Link href="/index" onClick={closeMenu}>
                  Index
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className={` `} asChild>
                <Link href="/studio" onClick={closeMenu}>
                  {" "}
                  Log in
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
