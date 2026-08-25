"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Where the select can take you. Home is deliberately absent — the wordmark
// and the panels already lead back there.
const DESTINATIONS = [
  { label: "Commissioned_", href: "/commissioned" },
  { label: "Personal_", href: "/personal" },
  { label: "Index_", href: "/index" },
  { label: "About_", href: "/about" },
];

/**
 * The corner: reads as the view you are in, opens as a way out of it.
 * `current` is matched against the hrefs above to label the open one.
 *
 * The destinations render inline beside the trigger rather than in a floating
 * layer, so opening widens this element and the flex row it sits in re-centres
 * the whole group. A portalled menu — Radix's or otherwise — is out of flow and
 * would leave the trigger pinned where it was, with the list hanging off one
 * side of centre.
 */
export default function SectionSelect({
  current,
  className = "",
}: {
  /** Pathname of the view showing, e.g. `/commissioned/some-slug`. */
  current: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);

  const here = DESTINATIONS.find(
    (d) => current === d.href || current.startsWith(`${d.href}/`),
  );

  // The trigger already names where you are, so the menu offers only the ways
  // out of it. On home nothing matches and all of them stand.
  const elsewhere = DESTINATIONS.filter((d) => d !== here);

  // Arriving somewhere is the end of choosing where to go.
  useEffect(() => setOpen(false), [current]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={root} className="flex flex-row items-center gap-0">
      <Button
        variant="link"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`justify-center lg:justify-start w-auto h-full cursor-pointer hover:text-blue-700 active:text-blue-700 bg-transparent active:bg-transparent ${
          here ? "text-blue-700" : ""
        } ${className}`}
      >
        {here?.label ?? "menu"}
      </Button>

      {open &&
        elsewhere.map((d) => (
          <Button
            key={d.href}
            variant="link"
            onClick={() => setOpen(false)}
            className="w-auto h-full whitespace-nowrap cursor-pointer text-neutral-400 bg-transparent hover:text-blue-700 hover:bg-transparent transition-colors duration-200 ease-out"
            asChild
          >
            <Link href={d.href}>{d.label}</Link>
          </Button>
        ))}
    </span>
  );
}
