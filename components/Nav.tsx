"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { closeTop } from "@/lib/modalStack";
import { useIntro } from "@/lib/intro";
import { setOpenedSection, useOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
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

  const aboutActive = pathname === "/about" || (onHome && hash === "about");
  const indexActive = pathname === "/archive" || (onHome && hash === "index");

  const chosen = !onHome || opened !== null;

  const directChrome = "animate-in fade-in duration-700 ease-out";
  const topChrome = onHome && !chosen ? directChrome : chrome;

  const corner = (place: string, visible = true, arrival = chrome) =>
    `fixed ${place} z-[80] flex flex-row items-center gap-0  transition-opacity duration-700 ease-out ${arrival} ${
      visible ? "" : "opacity-0 pointer-events-none"
    }`;

  const cornerLink =
    "px-5.5 py-4 w-auto h-full bg-transparent h-14 hover:bg-transparent hover:text-neutral-400 active:text-blue-700 active:bg-transparent ";

  return (
    <>
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
            className={`justify-end  ${cornerLink} ${indexActive ? "text-blue-700" : ""}`}
            onClick={() => setHash(hash === "index" ? "" : "index")}
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
