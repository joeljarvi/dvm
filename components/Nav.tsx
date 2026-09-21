"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { useOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
import { switchSection } from "@/lib/navigation";
import { REVEAL_CLASS } from "@/lib/motion";
import Link from "next/link";

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const { arrived } = useIntro();

  const hash = useHash();

  const opened = useOpenedSection();

  const chrome = arrived ? "" : "opacity-0 pointer-events-none";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else closeTop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

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
  const personalActive = opened === "personal" || projectCategory === "personal";
  const commissionedActive =
    opened === "commissioned" || projectCategory === "commissioned";

  const chosen = !onHome || opened !== null;

  const directChrome = `animate-in fade-in ${REVEAL_CLASS}`;
  const topChrome = onHome && !chosen ? directChrome : chrome;

  const corner = (place: string, visible = true, arrival = chrome) =>
    `fixed ${place} z-[80] flex flex-row items-center gap-0  transition-opacity ${REVEAL_CLASS} ${arrival} ${
      visible ? "" : "opacity-0 pointer-events-none"
    }`;

  const cornerLink =
    "px-5.5 py-4 w-auto h-full bg-transparent  h-14 hover:bg-transparent hover:text-neutral-400 active:text-blue-700 active:bg-transparent ";

  // Blended against whatever's behind it while its section isn't the one
  // showing; once it is, it drops the blend and just reads blue. The dark
  // neutral only applies while inactive — kept out of cornerLink so it can
  // never fight the active state's plain text-blue-700 for the same element.
  const linkBlend = (active: boolean) =>
    active
      ? "text-blue-700 mix-blend-normal"
      : "mix-blend-difference dark:text-neutral-500 dark:hover:text-neutral-400";

  return (
    <>
      {showPersonal && (
        <span
          className={corner("top-0 left-0 justify-start", true, topChrome)}
        >
          {onHome ? (
            <Button
              tabIndex={0}
              data-nav="personal"
              variant="link"
              size="sm"
              className={`justify-start  hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(personalActive)}`}
              onClick={() => switchSection("personal", onHome)}
            >
              Personal
            </Button>
          ) : (
            <Button
              tabIndex={0}
              data-nav="personal"
              variant="link"
              size="sm"
              className={`justify-start  hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(personalActive)}`}
              asChild
            >
              <Link href="/#personal">Personal</Link>
            </Button>
          )}
        </span>
      )}

      {showCommissioned && (
        <span
          className={corner("top-0 right-0 justify-end", true, topChrome)}
        >
          {onHome ? (
            <Button
              data-nav="commissioned"
              variant="link"
              size="sm"
              className={`justify-end hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(commissionedActive)}`}
              onClick={() => switchSection("commissioned", onHome)}
            >
              Commissioned
            </Button>
          ) : (
            <Button
              data-nav="commissioned"
              variant="link"
              size="sm"
              className={`justify-end hover:text-blue-700 transition-all ${cornerLink} ${linkBlend(commissionedActive)}`}
              asChild
            >
              <Link href="/#commissioned">Commissioned</Link>
            </Button>
          )}
        </span>
      )}

      {showAboutIndex && (
        <span
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
              className={`justify-start  hover:text-blue-700 ${cornerLink} ${linkBlend(aboutActive)}`}
              onClick={() => setHash(hash === "about" ? "" : "about")}
            >
              About
            </Button>
          ) : (
            <Button
              variant="link"
              size="sm"
              className={`justify-start ${cornerLink} ${linkBlend(aboutActive)}`}
              asChild
            >
              <Link href="/about">About</Link>
            </Button>
          )}
        </span>
      )}

      {showAboutIndex && (
        <span
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
