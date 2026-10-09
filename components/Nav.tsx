"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { useOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
import { switchSection } from "@/lib/navigation";
import { AFTER_SELECT, REVEAL_CLASS } from "@/lib/motion";
import Link from "next/link";

/**
 * The corner links. Rendered twice by app/layout.tsx — the top pair before
 * the page, the bottom pair after it — so tabbing runs as the screen reads:
 * top left, top right, the page, bottom left, bottom right.
 */
export default function Nav({ part }: { part: "top" | "bottom" }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const { arrived } = useIntro();

  const hash = useHash();

  const opened = useOpenedSection();

  // Picked out of landing mode: the nav comes in last, after the columns
  // have moved (see AFTER_SELECT). Any other
  // change — back to landing, an overlay, a swap — at once.
  const [prevOpened, setPrevOpened] = useState(opened);
  const [arrivalDelay, setArrivalDelay] = useState("");
  if (opened !== prevOpened) {
    setPrevOpened(opened);
    setArrivalDelay(prevOpened === null && opened !== null ? AFTER_SELECT : "");
  }

  const chrome = arrived ? "" : "opacity-0 pointer-events-none";

  useEffect(() => {
    // Once, not once per part.
    if (part !== "top") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else closeTop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, part]);

  if (pathname.startsWith("/studio")) return null;

  const onHome = pathname === "/";

  // A single project's own page (see app/[category]/[slug]) shows only its
  // own category's corner link — not About/Index or the other category.
  const projectCategory = pathname.match(
    /^\/(personal|commissioned)\/[^/]+$/,
  )?.[1] as "personal" | "commissioned" | undefined;
  const showPersonal = !projectCategory || projectCategory === "personal";
  const showCommissioned =
    !projectCategory || projectCategory === "commissioned";
  const showAboutIndex = !projectCategory;

  const aboutActive = pathname === "/about" || (onHome && hash === "about");
  const indexActive = pathname === "/archive" || (onHome && hash === "index");
  const personalActive =
    opened === "personal" || projectCategory === "personal";
  const commissionedActive =
    opened === "commissioned" || projectCategory === "commissioned";

  // Up once a section's chosen — or, over landing mode, while About or Index
  // is open, so there's a way on from them.
  const chosen = !onHome || opened !== null || aboutActive || indexActive;

  // Over About, Personal and Commissioned both read plain grey — neither is
  // the one showing, and there's no image underneath to blend against.
  const sectionLink = (active: boolean) => (aboutActive ? null : active);

  // Over Index, the same plain grey — but on desktop only; on mobile they
  // keep their usual state.
  const overIndex = indexActive
    ? "lg:text-neutral-400 lg:dark:text-neutral-500 lg:mix-blend-normal lg:hover:text-blue-700 lg:dark:hover:text-blue-700"
    : "";

  // Home's landing mode — no section picked yet — keeps the nav hidden; it
  // fades in once a section is chosen, or About or Index opens (see chosen).
  const topChrome = !onHome
    ? chrome
    : chosen
      ? arrivalDelay
      : "opacity-0 pointer-events-none";

  // Hidden (landing mode, or before the intro's in), out of the tab order
  // too.
  const hidden = (arrival: string) => arrival.includes("opacity-0");

  const corner = (place: string, visible = true, arrival = chrome) =>
    // Above About and Index (InfoOverlay, z-80); below the full-screen
    // layers — the 404, /connect (z-90) and a project's image (z-100).
    `fixed ${place} z-[85] flex flex-row items-center gap-0 transition-opacity ${REVEAL_CLASS} ${arrival} ${
      visible ? "" : "opacity-0 pointer-events-none"
    }`;

  const cornerLink =
    "px-5.5 py-4 w-auto h-full bg-transparent  h-14 hover:bg-transparent active:text-blue-700 active:bg-transparent ";

  // Blended against whatever's behind it while its section isn't the one
  // showing; once it is, it drops the blend and just reads blue. Hovered,
  // any link reads blue — an inactive one drops its blend for that too, or
  // the difference would turn the blue orange. `null`: plain grey, no blend
  // (see sectionLink). Kept out of cornerLink so the states never fight over
  // the same element.
  const linkBlend = (active: boolean | null) =>
    active === null
      ? "text-neutral-400 dark:text-neutral-500 mix-blend-normal hover:text-blue-700 dark:hover:text-blue-700"
      : active
        ? "text-blue-700 dark:text-blue-700 mix-blend-normal dark:hover:text-blue-700"
        : "mix-blend-difference hover:mix-blend-normal dark:text-neutral-500 hover:text-blue-700 dark:hover:text-blue-700";

  return (
    <>
      {part === "top" && showPersonal && (
        <span
          inert={hidden(topChrome)}
          className={corner("top-0 left-0 justify-start", true, topChrome)}
        >
          {onHome ? (
            <Button
              data-nav="personal"
              variant="link"
              size="sm"
              className={`justify-start  hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(sectionLink(personalActive))} ${overIndex}`}
              onClick={() => switchSection("personal", onHome)}
            >
              Personal
            </Button>
          ) : (
            <Button
              data-nav="personal"
              variant="link"
              size="sm"
              className={`justify-start  hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(sectionLink(personalActive))} ${overIndex}`}
              asChild
            >
              <Link href="/#personal">Personal</Link>
            </Button>
          )}
        </span>
      )}

      {part === "top" && showCommissioned && (
        <span
          inert={hidden(topChrome)}
          className={corner("top-0 right-0 justify-end", true, topChrome)}
        >
          {onHome ? (
            <Button
              data-nav="commissioned"
              variant="link"
              size="sm"
              className={`justify-end hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(sectionLink(commissionedActive))} ${overIndex}`}
              onClick={() => switchSection("commissioned", onHome)}
            >
              Commissioned
            </Button>
          ) : (
            <Button
              data-nav="commissioned"
              variant="link"
              size="sm"
              className={`justify-end hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(sectionLink(commissionedActive))} ${overIndex}`}
              asChild
            >
              <Link href="/#commissioned">Commissioned</Link>
            </Button>
          )}
        </span>
      )}

      {part === "bottom" && showAboutIndex && (
        <span
          inert={hidden(topChrome)}
          className={corner(
            "bottom-0 lg:bottom-0 left-0 justify-start",
            true,
            topChrome,
          )}
        >
          {onHome ? (
            <Button
              variant="link"
              size="sm"
              className={`justify-start hover:text-blue-700 ${cornerLink} ${linkBlend(aboutActive)}`}
              onClick={() => setHash(hash === "about" ? "" : "about")}
            >
              About
            </Button>
          ) : (
            <Button
              variant="link"
              size="sm"
              className={`justify-start hover:text-blue-700 ${cornerLink} ${linkBlend(aboutActive)}`}
              asChild
            >
              <Link href="/about">About</Link>
            </Button>
          )}
        </span>
      )}

      {part === "bottom" && showAboutIndex && (
        <span
          inert={hidden(topChrome)}
          className={corner(
            "bottom-0 lg:bottom-0 right-0 justify-end",
            true,
            topChrome,
          )}
        >
          {onHome ? (
            <Button
              variant="link"
              size="sm"
              className={`justify-end hover:text-blue-700  ${cornerLink} ${linkBlend(indexActive)}`}
              onClick={() => setHash(hash === "index" ? "" : "index")}
            >
              Index
            </Button>
          ) : (
            <Button
              variant="link"
              size="sm"
              className={`justify-end  hover:text-blue-700 ${cornerLink} ${linkBlend(indexActive)}`}
              asChild
            >
              <Link href="/archive">Index</Link>
            </Button>
          )}
        </span>
      )}
    </>
  );
}
